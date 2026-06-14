import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";
import { triggerConfirmationEmails, triggerCancellationEmails, triggerRescheduleEmails } from "../email";
import { createGCalEvent, cancelGCalEvent, updateGCalEvent } from "../gcal";

async function createZoomMeeting(
  accountId: string,
  clientId: string,
  clientSecret: string,
  topic: string,
  startTime: string,
  durationMins: number
): Promise<{ meetingId: string; joinUrl: string; startUrl: string } | null> {
  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
      method: "POST",
      headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" }
    });
    if (!tokenRes.ok) return null;
    const { access_token } = await tokenRes.json();

    const meetingRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        type: 2,
        start_time: startTime,
        duration: durationMins,
        settings: { join_before_host: true, waiting_room: false }
      })
    });
    if (!meetingRes.ok) return null;
    const meeting = await meetingRes.json();
    return { meetingId: String(meeting.id), joinUrl: meeting.join_url, startUrl: meeting.start_url };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const serviceId = searchParams.get("serviceId") || undefined;
  const clientEmail = searchParams.get("clientEmail") || undefined;
  if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });

  let appointments = await LocalDbController.getAppointmentsByTenant(tenantSlug);
  if (serviceId) appointments = appointments.filter(a => a.serviceId === serviceId);
  if (clientEmail) appointments = appointments.filter(a => a.clientEmail === clientEmail);

  return NextResponse.json({ success: true, appointments });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, serviceId, clientName, clientEmail, clientPhone, date, startTime, timezone, paymentStatus, amountCents, notes } = body;

    if (!tenantSlug || !clientName || !clientEmail || !date || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let serviceName = "Consultation";
    let durationMins = 60;
    if (serviceId) {
      const service = await LocalDbController.getBookingServiceById(serviceId, tenantSlug);
      if (service) { serviceName = service.name; durationMins = service.durationMinutes; }
    }

    const [h, m] = startTime.split(":").map(Number);
    const endMins = h * 60 + m + durationMins;
    const endTime = `${Math.floor(endMins / 60).toString().padStart(2, "0")}:${(endMins % 60).toString().padStart(2, "0")}`;
    const timeSlot = `${date} ${startTime} - ${endTime}`;

    const settings = await LocalDbController.getTenantSettings(tenantSlug);

    // Zoom meeting creation
    let zoomMeetingId: string | undefined;
    let zoomJoinUrl: string | undefined;
    let zoomStartUrl: string | undefined;

    if (settings?.zoomAccountId && settings?.zoomClientId && settings?.zoomClientSecret) {
      const zoom = await createZoomMeeting(
        settings.zoomAccountId,
        settings.zoomClientId,
        settings.zoomClientSecret,
        `${serviceName} with ${clientName}`,
        `${date}T${startTime}:00Z`,
        durationMins
      );
      if (zoom) { zoomMeetingId = zoom.meetingId; zoomJoinUrl = zoom.joinUrl; zoomStartUrl = zoom.startUrl; }
    }

    const newAppt = await LocalDbController.addAppointment({
      tenantSlug,
      serviceId: serviceId || undefined,
      serviceName,
      clientName,
      clientEmail,
      clientPhone: clientPhone || undefined,
      timeSlot,
      date,
      startTime,
      endTime,
      timezone: timezone || "UTC",
      status: "confirmed",
      paymentStatus: paymentStatus || "unpaid",
      amountCents: amountCents || 0,
      zoomMeetingId,
      zoomJoinUrl,
      zoomStartUrl,
      notes: notes || undefined
    });

    await LocalDbController.addSkillRun({
      tenantSlug,
      skillName: "calendar_booking",
      status: "success",
      latencyMs: 50,
      payload: JSON.stringify({ serviceId, clientName, clientEmail, date, startTime }),
      response: JSON.stringify({ appointmentId: newAppt.id, zoomJoinUrl })
    });

    // Background: email + GCal (fire-and-forget)
    const emailData = {
      clientName,
      clientEmail,
      serviceName,
      date,
      startTime,
      endTime,
      timezone: timezone || "UTC",
      zoomJoinUrl,
      zoomStartUrl,
      appointmentId: newAppt.id,
      amountCents: amountCents || 0,
      currency: "USD",
      notes: notes || undefined,
      consultantEmail: settings?.smtpFrom || undefined
    };

    Promise.all([
      triggerConfirmationEmails(tenantSlug, emailData),
      createGCalEvent(tenantSlug, {
        summary: `${serviceName} — ${clientName}`,
        description: `Booking #${newAppt.id.slice(-8).toUpperCase()}${notes ? `\nNotes: ${notes}` : ""}`,
        startDateTime: `${date}T${startTime}:00`,
        endDateTime: `${date}T${endTime}:00`,
        timezone: timezone || "UTC",
        attendeeEmails: [clientEmail, ...(settings?.smtpFrom ? [settings.smtpFrom] : [])],
        zoomJoinUrl
      }).then(async gcalEventId => {
        if (gcalEventId) await LocalDbController.updateAppointment(tenantSlug, newAppt.id, { gcalEventId } as any);
      })
    ]).catch(err => console.error("[Booking POST] Background tasks:", err));

    return NextResponse.json({ success: true, appointment: newAppt });
  } catch (err: any) {
    console.error("[Booking Appointments POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, id, ...updates } = body;
    if (!tenantSlug || !id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const existing = (await LocalDbController.getAppointmentsByTenant(tenantSlug)).find((a: any) => a.id === id);
    const appt = await LocalDbController.updateAppointment(tenantSlug, id, updates);
    if (!appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    const settings = await LocalDbController.getTenantSettings(tenantSlug);

    // If date/time changed → reschedule emails + update GCal
    const dateChanged = updates.date || updates.startTime;
    if (dateChanged) {
      const emailData = {
        clientName: appt.clientName,
        clientEmail: appt.clientEmail,
        serviceName: appt.serviceName || "Consultation",
        date: existing?.date || appt.date || "",
        startTime: existing?.startTime || appt.startTime || "",
        endTime: existing?.endTime || appt.endTime || "",
        timezone: appt.timezone || "UTC",
        zoomJoinUrl: appt.zoomJoinUrl,
        appointmentId: appt.id,
        consultantEmail: settings?.smtpFrom || undefined,
        newDate: appt.date,
        newStartTime: appt.startTime,
        newEndTime: appt.endTime
      };

      Promise.all([
        triggerRescheduleEmails(tenantSlug, emailData),
        (appt as any).gcalEventId ? updateGCalEvent(tenantSlug, (appt as any).gcalEventId, {
          startDateTime: `${appt.date}T${appt.startTime}:00`,
          endDateTime: `${appt.date}T${appt.endTime}:00`,
          timezone: appt.timezone || "UTC"
        }) : Promise.resolve()
      ]).catch(err => console.error("[Booking PUT] Background tasks:", err));
    }

    return NextResponse.json({ success: true, appointment: appt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const id = searchParams.get("id");
  if (!tenantSlug || !id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const appt = await LocalDbController.cancelAppointment(tenantSlug, id);

  if (appt) {
    const settings = await LocalDbController.getTenantSettings(tenantSlug);
    Promise.all([
      triggerCancellationEmails(tenantSlug, {
        clientName: appt.clientName,
        clientEmail: appt.clientEmail,
        serviceName: appt.serviceName || "Consultation",
        date: appt.date || "",
        startTime: appt.startTime || "",
        endTime: appt.endTime || "",
        timezone: appt.timezone || "UTC",
        appointmentId: appt.id,
        amountCents: appt.amountCents,
        consultantEmail: settings?.smtpFrom || undefined
      }),
      (appt as any).gcalEventId ? cancelGCalEvent(tenantSlug, (appt as any).gcalEventId) : Promise.resolve()
    ]).catch(err => console.error("[Booking DELETE] Background tasks:", err));
  }

  return NextResponse.json({ success: !!appt, appointment: appt });
}
