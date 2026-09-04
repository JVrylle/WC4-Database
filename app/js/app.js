/* Shared helper */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/* Small line icons for skills, picked by keyword (screenshot style) */
const __SW = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const __SKILL_ICONS = [
  [/machine gun|gatling|vulcan/i, `<svg ${__SW}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>`],
  [/heat|ammo|ammunition|bullet|shell|magazine/i, `<svg ${__SW}><path d="M9 3h6v7l-3 3-3-3V3ZM10 16h4v5h-4zM7 8H4m13 0h3"/></svg>`],
  [/assault|charge|blitz|storm|raid/i, `<svg ${__SW}><path d="M4 4l7 7M4 4v5M4 4h5M20 4l-7 7M20 4v5M20 4h-5M6 20l6-6M18 20l-6-6"/></svg>`],
  [/air.defen|anti.air|interceptor|flak/i, `<svg ${__SW}><path d="M12 3l7 2v6c0 4.3-3 7.7-7 9.4-4-1.7-7-5.1-7-9.4V5l7-2Z"/><path d="M12 8v5M9.5 10.5h5"/></svg>`],
  [/smoke|fog|cover|conceal|camouflage/i, `<svg ${__SW}><path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 18H7Z"/></svg>`],
  [/critical|crit|snipe|deadeye|precision/i, `<svg ${__SW}><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`],
  [/tank destroyer|armor piercing|apcr|steal|iron/i, `<svg ${__SW}><rect x="3" y="11" width="13" height="5" rx="2"/><path d="M8 11V8h5l5-2M2 18h20"/></svg>`],
  [/detect|radar|recon|scout|eagle|hawk|sentry|spotter/i, `<svg ${__SW}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>`],
  [/repair|medic|engineer|supply|heal|maintenance/i, `<svg ${__SW}><path d="M12 5v14M5 12h14"/></svg>`],
  [/naval|fleet|sea|torpedo|sonar|anchor/i, `<svg ${__SW}><circle cx="12" cy="5" r="2.2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M12 21c-2 0-3-1-3-1m6 1s-1 1-3 1"/></svg>`],
  [/air |airborne|carpet|bombing|strike|paratroop|sortie|wing/i, `<svg ${__SW}><path d="M12 3v18M12 7 4 11l8-1 8 1-8-4ZM7 19l5-2 5 2"/></svg>`],
  [/missile|rocket|v2|topol|himars/i, `<svg ${__SW}><path d="M12 2c3 2 4 6 4 10l3 3-4 1c-1 2-2 3-3 4-1-1-2-2-3-4l-4-1 3-3c0-4 1-8 4-10Z"/><circle cx="12" cy="9" r="1.4"/></svg>`],
  [/morale|inspir|rally|command|leader|tactic/i, `<svg ${__SW}><path d="M5 21V4m0 1h12l-2.5 4L17 13H5"/></svg>`],
  [/defen|fortif|entrench|armor|shield|guard/i, `<svg ${__SW}><path d="M12 3l7 2v6c0 4.3-3 7.7-7 9.4-4-1.7-7-5.1-7-9.4V5l7-2Z"/></svg>`],
  [/mobility|march|speed|blitzkrieg|maneuver/i, `<svg ${__SW}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`],
  [/econom|financ|industr|supply|logistic/i, `<svg ${__SW}><circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9.5c0-1 1.3-2 3-2s3 1 3 2-1 1.7-3 2.2-3 1.2-3 2.3 1.3 2 3 2 3-1 3-2"/></svg>`]
];
const __SKILL_DEFAULT = `<svg ${__SW}><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.9 5.9 20.4l1.5-6.8L2.2 9l6.9-.7L12 2Z"/></svg>`;
function skillIcon(title) {
  const t = String(title || '');
  for (const [re, svg] of __SKILL_ICONS) if (re.test(t)) return svg;
  return __SKILL_DEFAULT;
}
