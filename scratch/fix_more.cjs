const fs = require('fs');
const path = require('path');

// 1. Fix app/api/booking/slots/route.ts
let slotsPath = path.join(__dirname, '../apps/web/app/api/booking/slots/route.ts');
let slotsCode = fs.readFileSync(slotsPath, 'utf-8');
slotsCode = slotsCode.replace(/await LocalDbController\.getSchedules\(tenantSlug\)\s*\n\s*\.filter/g, '(await LocalDbController.getSchedules(tenantSlug)).filter');
slotsCode = slotsCode.replace(/await LocalDbController\.getAppointments\(tenantSlug\)\s*\n\s*\.filter/g, '(await LocalDbController.getAppointments(tenantSlug)).filter');
fs.writeFileSync(slotsPath, slotsCode);

// 2. Fix localDb.ts analyticsEvents and landingPages
let localDbPath = path.join(__dirname, '../packages/db/src/localDb.ts');
let localDbCode = fs.readFileSync(localDbPath, 'utf-8');
localDbCode = localDbCode.replace(/this\.read\(\)\.analyticsEvents/g, '(await this.read()).analyticsEvents');
localDbCode = localDbCode.replace(/this\.read\(\)\.landingPages/g, '(await this.read()).landingPages');
fs.writeFileSync(localDbPath, localDbCode);

// 3. Fix app/api/booking/appointments/route.ts (map issue)
let apptPath = path.join(__dirname, '../apps/web/app/api/booking/appointments/route.ts');
let apptCode = fs.readFileSync(apptPath, 'utf-8');
apptCode = apptCode.replace(/await LocalDbController\.getAppointments\(tenantSlug\)\s*\n\s*\.find/g, '(await LocalDbController.getAppointments(tenantSlug)).find');
// fix map issues inside appointments route
apptCode = apptCode.replace(/const appointmentsWithServices = appointments\.map\(\(appt: any\) => \{/g, 'const appointmentsWithServices = await Promise.all(appointments.map(async (appt: any) => {');
apptCode = apptCode.replace(/return \{\s*\.\.\.appt,\s*serviceName: service \? service\.name : "Unknown Service"\s*\};\s*\}\);/g, 'return { ...appt, serviceName: service ? service.name : "Unknown Service" };\n    }));');
fs.writeFileSync(apptPath, apptCode);

// 4. Fix app/s/[tenant]/page.tsx
let spagePath = path.join(__dirname, '../apps/web/app/s/[tenant]/page.tsx');
let spageCode = fs.readFileSync(spagePath, 'utf-8');
spageCode = spageCode.replace(/const productsWithCategories = categories\.map\(\(cat\) => \{/g, 'const productsWithCategories = await Promise.all(categories.map(async (cat) => {');
spageCode = spageCode.replace(/return \{\s*category: cat,\s*products: catProducts,\s*\};\s*\}\);/g, 'return {\n      category: cat,\n      products: catProducts,\n    };\n  }));');
fs.writeFileSync(spagePath, spageCode);

// 5. Fix app/api/booking/gcal.ts
let gcalPath = path.join(__dirname, '../apps/web/app/api/booking/gcal.ts');
let gcalCode = fs.readFileSync(gcalPath, 'utf-8');
gcalCode = gcalCode.replace(/export function generateGcalAuthUrl/g, 'export async function generateGcalAuthUrl');
fs.writeFileSync(gcalPath, gcalCode);

// 6. Fix push route
let pushPath = path.join(__dirname, '../apps/web/app/api/push/route.ts');
let pushCode = fs.readFileSync(pushPath, 'utf-8');
pushCode = pushCode.replace(/export function registerPushSubscription/g, 'export async function registerPushSubscription');
pushCode = pushCode.replace(/export function sendPushNotification/g, 'export async function sendPushNotification');
fs.writeFileSync(pushPath, pushCode);
