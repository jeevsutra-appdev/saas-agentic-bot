const fs = require('fs');
const file = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/c/[tenant]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change grid cols
content = content.replace('grid-cols-1 sm:grid-cols-3', 'grid-cols-1 sm:grid-cols-5');

// 2. Add password and avatar fields to the form
const formEnd = `</select>\r
                </div>\r
              </div>\r
              <button`;
const formEndReplacement = `</select>\r
                </div>\r
                <div className="flex flex-col gap-1.5">\r
                  <label className="text-[10px] font-bold uppercase text-gray-500">Password</label>\r
                  <input type="text" placeholder="Login Password" value={newRiderPassword} onChange={e => setNewRiderPassword(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />\r
                </div>\r
                <div className="flex flex-col gap-1.5">\r
                  <label className="text-[10px] font-bold uppercase text-gray-500">Avatar URL</label>\r
                  <input type="text" placeholder="https://..." value={newRiderAvatarUrl} onChange={e => setNewRiderAvatarUrl(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />\r
                </div>\r
              </div>\r
              <button`;
content = content.replace(formEnd, formEndReplacement);

// If CRLF wasn't used, try LF
const formEndLF = `</select>\n                </div>\n              </div>\n              <button`;
const formEndReplacementLF = formEndReplacement.replace(/\r/g, '');
content = content.replace(formEndLF, formEndReplacementLF);

// 3. Update the fetch body to include password and avatarUrl
const fetchBody = `body: JSON.stringify({ tenantSlug, name: newRiderName, phone: newRiderPhone, vehicle: newRiderVehicle })`;
const fetchBodyReplacement = `body: JSON.stringify({ tenantSlug, name: newRiderName, phone: newRiderPhone, vehicle: newRiderVehicle, password: newRiderPassword, avatarUrl: newRiderAvatarUrl })`;
content = content.replace(fetchBody, fetchBodyReplacement);

// 4. Update the state resets
const resetState = `setNewRiderName(""); setNewRiderPhone(""); setNewRiderVehicle("bike");`;
const resetStateReplacement = `setNewRiderName(""); setNewRiderPhone(""); setNewRiderVehicle("bike"); setNewRiderPassword(""); setNewRiderAvatarUrl("");`;
content = content.replace(resetState, resetStateReplacement);

// 5. Update the rider card UI (Avatar & Login link)
const avatarCardMatch = `<div className={\`h-11 w-11 rounded-2xl flex items-center justify-center text-lg shrink-0 \${rider.isOnline ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"}\`}>\r
                  {rider.vehicle === "scooter" ? "🛵" : rider.vehicle === "car" ? "🚗" : rider.vehicle === "van" ? "🚐" : "🚲"}\r
                </div>`;
const avatarCardReplacement = `{rider.avatarUrl ? (
                  <img src={rider.avatarUrl} alt={rider.name} className={\`h-11 w-11 rounded-2xl object-cover border \${rider.isOnline ? "border-emerald-500/50" : "border-white/10"}\`} />
                ) : (
                  <div className={\`h-11 w-11 rounded-2xl flex items-center justify-center text-lg shrink-0 \${rider.isOnline ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"}\`}>
                    {rider.vehicle === "scooter" ? "🛵" : rider.vehicle === "car" ? "🚗" : rider.vehicle === "van" ? "🚐" : "🚲"}
                  </div>
                )}`;
content = content.replace(avatarCardMatch, avatarCardReplacement);
content = content.replace(avatarCardMatch.replace(/\r/g, ''), avatarCardReplacement);

const cardEndMatch = `                  {rider.currentOrderId && (\r
                    <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-1"><Navigation className="h-3 w-3" /> On delivery #{rider.currentOrderId.substring(6, 12).toUpperCase()}</p>\r
                  )}\r
                </div>\r
              </div>`;
const cardEndReplacement = `                  {rider.currentOrderId && (
                    <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-1"><Navigation className="h-3 w-3" /> On delivery #{rider.currentOrderId.substring(6, 12).toUpperCase()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                <div className="text-[10px] text-gray-500 flex flex-col">
                  <span>ID: <strong className="text-gray-300 font-mono">{rider.id}</strong></span>
                  <span>Pass: <strong className="text-gray-300">{rider.password || rider.passwordHash || rider.phone}</strong></span>
                </div>
                <a href={\`/d/\${tenantSlug}\`} target="_blank" className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                  App Link <ExternalLink className="h-3 w-3" />
                </a>
              </div>`;
content = content.replace(cardEndMatch, cardEndReplacement);
content = content.replace(cardEndMatch.replace(/\r/g, ''), cardEndReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Update successful!');
