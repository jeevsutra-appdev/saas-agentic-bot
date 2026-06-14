import { LocalDbController } from "@aether/db";

function base64url(input: string | Uint8Array): string {
  const base64 = Buffer.from(input).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getGCalAccessToken(serviceAccountJson: string): Promise<string | null> {
  try {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);

    const headerB64 = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claimsB64 = base64url(JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    }));

    const signingInput = `${headerB64}.${claimsB64}`;

    const pemBody = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/\s/g, "");

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      Buffer.from(pemBody, "base64"),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBytes = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      Buffer.from(signingInput)
    );

    const jwt = `${signingInput}.${base64url(new Uint8Array(sigBytes))}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      })
    });

    if (!res.ok) {
      console.error("[GCal] Token error:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("[GCal] Token error:", err);
    return null;
  }
}

export interface GCalEventData {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  attendeeEmails: string[];
  zoomJoinUrl?: string;
}

async function getGCalConfig(tenantSlug: string): Promise<{ serviceAccountJson: string; calendarId: string } | null> {
  const settings = await LocalDbController.getTenantSettings(tenantSlug);
  if (!settings?.gcalServiceAccountJson || !settings?.gcalCalendarId) return null;
  return { serviceAccountJson: settings.gcalServiceAccountJson, calendarId: settings.gcalCalendarId };
}

export async function createGCalEvent(tenantSlug: string, eventData: GCalEventData): Promise<string | null> {
  try {
    const gcal = await getGCalConfig(tenantSlug);
    if (!gcal) return null;
    const token = await getGCalAccessToken(gcal.serviceAccountJson);
    if (!token) return null;

    let description = eventData.description || "";
    if (eventData.zoomJoinUrl) description += `\n\nJoin Zoom: ${eventData.zoomJoinUrl}`;

    const event = {
      summary: eventData.summary,
      description,
      start: { dateTime: eventData.startDateTime, timeZone: eventData.timezone },
      end: { dateTime: eventData.endDateTime, timeZone: eventData.timezone },
      attendees: eventData.attendeeEmails.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 15 }]
      }
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcal.calendarId)}/events?sendUpdates=all`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(event)
      }
    );

    if (!res.ok) { console.error("[GCal] Create error:", await res.text()); return null; }
    const data = await res.json();
    return data.id || null;
  } catch (err) {
    console.error("[GCal] Create error:", err);
    return null;
  }
}

export async function updateGCalEvent(
  tenantSlug: string,
  gcalEventId: string,
  eventData: Partial<GCalEventData>
): Promise<boolean> {
  try {
    const gcal = await getGCalConfig(tenantSlug);
    if (!gcal) return false;
    const token = await getGCalAccessToken(gcal.serviceAccountJson);
    if (!token) return false;

    const patch: any = {};
    if (eventData.summary) patch.summary = eventData.summary;
    if (eventData.description) patch.description = eventData.description;
    if (eventData.startDateTime) patch.start = { dateTime: eventData.startDateTime, timeZone: eventData.timezone || "UTC" };
    if (eventData.endDateTime) patch.end = { dateTime: eventData.endDateTime, timeZone: eventData.timezone || "UTC" };
    if (eventData.attendeeEmails) patch.attendees = eventData.attendeeEmails.map(email => ({ email }));

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcal.calendarId)}/events/${gcalEventId}?sendUpdates=all`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[GCal] Update error:", err);
    return false;
  }
}

export async function cancelGCalEvent(tenantSlug: string, gcalEventId: string): Promise<boolean> {
  try {
    const gcal = await getGCalConfig(tenantSlug);
    if (!gcal) return false;
    const token = await getGCalAccessToken(gcal.serviceAccountJson);
    if (!token) return false;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcal.calendarId)}/events/${gcalEventId}?sendUpdates=all`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[GCal] Cancel error:", err);
    return false;
  }
}
