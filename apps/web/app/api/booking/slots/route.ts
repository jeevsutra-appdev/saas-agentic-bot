import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Convert "HH:MM" in service timezone to UTC slot check
function generateSlots(
  startTime: string,
  endTime: string,
  durationMins: number,
  bufferMins: number,
  bookedSlots: string[]
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const step = durationMins + bufferMins;

  for (let t = start; t + durationMins <= end; t += step) {
    const slotTime = fromMinutes(t);
    const endSlotTime = fromMinutes(t + durationMins);
    const label = `${slotTime} - ${endSlotTime}`;
    const isBooked = bookedSlots.some(b => b === slotTime || b === label);
    slots.push({ time: slotTime, available: !isBooked });
  }

  return slots;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date"); // "YYYY-MM-DD"

  if (!tenantSlug || !date) {
    return NextResponse.json({ error: "Missing tenantSlug or date" }, { status: 400 });
  }

  const dateObj = new Date(date + "T00:00:00Z");
  const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 1=Mon...

  // Get service details (duration, buffer)
  let durationMins = 60;
  let bufferMins = 0;
  if (serviceId) {
    const service = LocalDbController.getBookingServiceById(serviceId, tenantSlug);
    if (service) {
      durationMins = service.durationMinutes;
      bufferMins = service.bufferMinutes || 0;
    }
  }

  // Get schedule for this day
  const schedules = LocalDbController.getBookingSchedules(tenantSlug, serviceId || undefined)
    .filter(s => s.dayOfWeek === dayOfWeek && s.isActive);

  if (schedules.length === 0) {
    return NextResponse.json({ success: true, slots: [], available: false, reason: "No availability on this day" });
  }

  // Get already booked appointments on this date
  const existingAppts = LocalDbController.getAppointmentsByDate(tenantSlug, date)
    .filter(a => a.status !== "cancelled")
    .filter(a => !serviceId || a.serviceId === serviceId)
    .map(a => a.startTime || a.timeSlot);

  // Generate slots for each schedule block
  const allSlots: { time: string; available: boolean }[] = [];
  for (const schedule of schedules) {
    const slots = generateSlots(schedule.startTime, schedule.endTime, durationMins, bufferMins, existingAppts);
    allSlots.push(...slots);
  }

  // Deduplicate and sort
  const seen = new Set<string>();
  const uniqueSlots = allSlots.filter(s => {
    if (seen.has(s.time)) return false;
    seen.add(s.time);
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  return NextResponse.json({ success: true, slots: uniqueSlots, date });
}
