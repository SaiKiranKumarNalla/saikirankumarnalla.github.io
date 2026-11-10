// Certifications and training: shared renderer for the Skills, Agentic AI and Recruiter pages.
// Data lives in content/certifications.json. Logos are in public/media/logos/certs/.
import data from '../../content/certifications.json';
import './certs.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const certs = data;
export const certsIn = (group) => data.items.filter((c) => c.group === group);
export const certById = (ids) => ids.map((id) => data.items.find((c) => c.id === id)).filter(Boolean);
const logo = (f) => `<img src="/media/logos/certs/${esc(f)}" alt="" loading="lazy" decoding="async">`;
const mark = (c) => `<span class="ct-logo${c.logo2 ? ' ct-logo-2' : ''}" aria-hidden="true">${logo(c.logo)}${c.logo2 ? logo(c.logo2) : ''}</span>`;
const verify = (c) => (c.verify ? `<a class="ct-verify" href="${esc(c.verify)}" target="_blank" rel="noopener">Verify<span class="ct-sr"> ${esc(c.title)}</span></a>` : '');

// One card. A "path" card groups several badges with a row of dots and a list that opens on demand.
export function certCard(c) {
  const meta = [c.issuer, c.date].filter(Boolean).map(esc).join(' · ');
  const badges = c.badges ? `<div class="ct-pips" aria-hidden="true">${c.badges.map(() => '<i></i>').join('')}</div>
    <p class="ct-count">${c.badges.length} badges earned</p>
    <details class="ct-badges"><summary>Badges</summary><ul>${c.badges.map((b) => `<li><span>${esc(b.title)}</span><em>${esc(b.date)}</em></li>`).join('')}</ul></details>` : '';
  return `<article class="ct-card" data-type="${esc(c.type)}">
    ${mark(c)}
    <div class="ct-body"><h4>${esc(c.title)}</h4><p class="ct-meta">${meta}</p>${c.note ? `<p class="ct-note">${esc(c.note)}</p>` : ''}${badges}</div>
    ${verify(c)}
  </article>`;
}
export const certGroup = (g) => `<div class="ct-group"><h3 class="ct-ghead">${esc(g.name)}</h3><div class="ct-grid">${certsIn(g.id).map(certCard).join('')}</div></div>`;
