// World Conqueror 4 Damage Calculator
// Loads general + elite force data for both sides and computes estimated damage.

// Local embedded data (offline): WC4_GENERALS / WC4_ELITE hold the records,
// CALC_* consts hold the formula tables. No network is used.

const TIER_ORDER = ["bronze", "silver", "gold", "purple", "orange"];

const TIER_LABELS = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  purple: "Purple",
  orange: "Orange",
};

const TYPE_ORDER = ["infantry", "artillery", "navy", "armored", "airforce"];

const TYPE_LABELS = {
  infantry: "Infantry",
  artillery: "Artillery",
  navy: "Navy",
  armored: "Armored",
  airforce: "Air Force",
};

const STAR_META = [
  ["infantry_stars", "Infantry"],
  ["artillery_stars", "Artillery"],
  ["armored_stars", "Armored"],
  ["navy_stars", "Navy"],
  ["airforce_stars", "Air Force"],
  ["marching_stars", "Mobility"],
];

const STAT_META = [
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["movement", "Movement"],
  ["hp", "HP"],
];

const MIN_LEVEL = 1;
const MAX_LEVEL = 12;
const MAX_STARS = 6;

const KNOWN_TIERS = ["silver", "gold", "platinum", "bronze"];

// EF skill tiers map to levels 1-4 (bronze=1, silver=2, gold=3, platinum=4).
const TIER_TO_LEVEL = { bronze: 1, silver: 2, gold: 3, platinum: 4 };

// Fake attack subtracted from the unit's attack stat, per unit type (tech).
const TECH_BY_TYPE = {
  infantry: 9,
  armored: 15,
  artillery: 18,
  navy: 16,
  airforce: 16,
};

// Fake attack value contributed by a general's star count (index = stars, 0-6).
const STAR_VALUE = [0, 4, 8, 13, 16, 24, 30];

// Which general star category corresponds to each elite force unit type.
const STAR_KEY_BY_TYPE = {
  infantry: "infantry_stars",
  artillery: "artillery_stars",
  armored: "armored_stars",
  navy: "navy_stars",
  airforce: "airforce_stars",
};

// General biography titles (GeneralTitleSettings + title_desc_*): auto-applied
// when the general commands a matching elite branch. Attack/crit parts feed
// battle math; defense/mobility/HP/range parts don't affect damage dealt.
const TITLE_BRANCH = { 1: "infantry", 2: "armored", 3: "artillery", 4: "navy" };
const GENERAL_TITLES = {
  Guderian: { title: "Father of the Blitzkrieg", branch: "armored", atk: 12, crit: 10, critDmg: 0 },
  Zhukov: { title: "Marshal of Victory", branch: "artillery", atk: 18, crit: 0, critDmg: 0 },
  Marshall: { title: "Mentor of Strategy", branch: "infantry", atk: 18, crit: 0, critDmg: 0 },
  Manstein: { title: "Strategy Genius", branch: "armored", atk: 18, crit: 0, critDmg: 35 },
  Eisenhower: { title: "Expedition to Europe", branch: "navy", atk: 18, crit: 0, critDmg: 0 },
  Montgomery: { title: "Foxhunter", branch: "armored", atk: 12, crit: 0, critDmg: 0 },
  Rommel: { title: "Desert Fox", branch: "armored", atk: 0, crit: 0, critDmg: 25 },
  Konev: { title: "The Vanguard", branch: "artillery", atk: 12, crit: 10, critDmg: 0 },
};

// Blue ribbon damage reduction by level (defender-side; blue_ribbon.json).
const BLUE_REDUCTION = [0, 0.04, 0.08, 0.12, 0.16, 0.2];

// Manual formula inputs per side. op: "mul" defaults empty to 1, "add" to 0.
const FORMULA_INPUTS = [
  { id: "Morale", key: "morale", op: "mul" },
  { id: "Crit", key: "crit", op: "mul" },
  { id: "Health", key: "health", op: "mul" },
  { id: "FakeAtk", key: "fakeAtk", op: "add" },
  { id: "DmgInc", key: "dmgInc", op: "mul" },
  { id: "DmgRed", key: "dmgRed", op: "mul" },
  { id: "FlatDmg", key: "flatDmg", op: "add" },
  { id: "EffAtkOvr", key: "effAtkOvr", op: "add" },
];

const DEFAULT_SKILL_MAX = 5;
const GEN_ADD_SLOTS = 2;

let ALL_GENERALS = [];
let ALL_UNITS = [];
let GENERAL_SKILLS = {};
let EF_SKILLS = [];
let EF_SKILL_CALCS = {};
let GENERAL_SKILLS_OPTIONS = [];
let MORALE_VALUES = [];
let TERRAIN_VALUES = [];
let RED_RIBBON_VALUES = [];

// Current editable report state. Rebuilt on every Compare press.
let reportState = null;

// Basic Modifier selections per side (morale state name, terrain name,
// red ribbon level 0-5, HP percent 0-100, crit mode auto/crit/noCrit).
// The enemy's selections are stored for reference; the damage formula uses
// each attacker's own modifiers.
const modState = {
  left: { morale: "Neutral", terrain: "Plain", ribbon: 0, hp: 100, critMode: "auto", title: true },
  right: { morale: "Neutral", terrain: "Plain", ribbon: 0, hp: 100, critMode: "auto", title: true },
  enemy: { morale: "Neutral", terrain: "Plain", ribbon: 0, hp: 100, critMode: "auto" },
};

// Base crit damage bonus when a crit lands (50%).
const BASE_CRIT_DAMAGE = 0.5;

// Stage-2 effective attack: confirmed constant 62.5 across three independent
// in-game derivations (Nuclearman7 KT/Roko + KT/Wu, mathematician Pershing/Bock)
// spanning different attackers, defenders, generals and terrains.
const EFF_ATK_DEFAULT = 62.5;

const statusLight = document.getElementById("statusLight");
const resultPanel = document.getElementById("resultPanel");
const compareBtn = document.getElementById("compareBtn");

const sideEls = {
  left: {
    genSelect: document.getElementById("leftGenSelect"),
    efSelect: document.getElementById("leftEfSelect"),
    levelSlider: document.getElementById("leftLevelSlider"),
    levelInput: document.getElementById("leftLevelInput"),
    levelDown: document.getElementById("leftLevelDown"),
    levelUp: document.getElementById("leftLevelUp"),
    moraleBtns: document.getElementById("leftMoraleBtns"),
    terrainBtns: document.getElementById("leftTerrainBtns"),
    ribbonBtns: document.getElementById("leftRibbonBtns"),
    titleBtns: document.getElementById("leftTitleBtns"),
    critBtns: document.getElementById("leftCritBtns"),
    hpSlider: document.getElementById("leftHpSlider"),
    hpInput: document.getElementById("leftHpInput"),
  },
  right: {
    genSelect: document.getElementById("rightGenSelect"),
    efSelect: document.getElementById("rightEfSelect"),
    levelSlider: document.getElementById("rightLevelSlider"),
    levelInput: document.getElementById("rightLevelInput"),
    levelDown: document.getElementById("rightLevelDown"),
    levelUp: document.getElementById("rightLevelUp"),
    moraleBtns: document.getElementById("rightMoraleBtns"),
    terrainBtns: document.getElementById("rightTerrainBtns"),
    ribbonBtns: document.getElementById("rightRibbonBtns"),
    titleBtns: document.getElementById("rightTitleBtns"),
    critBtns: document.getElementById("rightCritBtns"),
    hpSlider: document.getElementById("rightHpSlider"),
    hpInput: document.getElementById("rightHpInput"),
  },
};

for (const side of ["left", "right"]) {
  sideEls[side].inputs = {};
  for (const meta of FORMULA_INPUTS) {
    sideEls[side].inputs[meta.key] = document.getElementById(
      `${side}${meta.id}`
    );
  }
}

// Shared enemy (target) card: one EF unit + Basic Modifiers, used by both sides
// for target-type skill evaluation. No formula inputs.
const enemyEls = {
  efSelect: document.getElementById("enemyEfSelect"),
  levelSlider: document.getElementById("enemyLevelSlider"),
  levelInput: document.getElementById("enemyLevelInput"),
  levelDown: document.getElementById("enemyLevelDown"),
  levelUp: document.getElementById("enemyLevelUp"),
  moraleBtns: document.getElementById("enemyMoraleBtns"),
  terrainBtns: document.getElementById("enemyTerrainBtns"),
  ribbonBtns: document.getElementById("enemyRibbonBtns"),
  critBtns: document.getElementById("enemyCritBtns"),
  hpSlider: document.getElementById("enemyHpSlider"),
  hpInput: document.getElementById("enemyHpInput"),
  inputs: {},
};

function elsFor(side) {
  return side === "enemy" ? enemyEls : sideEls[side];
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function formatNumber(n) {
  return Number(n).toLocaleString("en-US");
}

function setStatus(state, text) {
  statusLight.className = `topbar__status status--${state}`;
  statusLight.innerHTML = `<span class="status-dot"></span><span class="status-text">${text}</span>`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} (${res.status})`);
  }
  return res.json();
}

function populateSelect(select, entries, groups, labels, itemTier) {
  select.innerHTML = "";
  for (const group of groups) {
    const list = entries.filter((item) => itemTier(item) === group);
    if (list.length === 0) continue;
    const optgroup = document.createElement("optgroup");
    optgroup.label = labels[group] || group;
    list.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = `${group}|${item.id}`;
      opt.textContent = item.name;
      optgroup.appendChild(opt);
    });
    select.appendChild(optgroup);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampLevel(value) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return MIN_LEVEL;
  return clamp(n, MIN_LEVEL, MAX_LEVEL);
}

function bindLevelControls(side) {
  const els = elsFor(side);

  const syncInputs = () => {
    els.levelSlider.value = clampLevel(els.levelSlider.value);
    els.levelInput.value = els.levelSlider.value;
    els.levelDown.disabled = parseInt(els.levelSlider.value, 10) <= MIN_LEVEL;
    els.levelUp.disabled = parseInt(els.levelSlider.value, 10) >= MAX_LEVEL;
  };

  els.levelSlider.addEventListener("input", syncInputs);
  els.levelDown.addEventListener("click", () => {
    els.levelSlider.value = clampLevel(els.levelSlider.value) - 1;
    syncInputs();
  });
  els.levelUp.addEventListener("click", () => {
    els.levelSlider.value = clampLevel(els.levelSlider.value) + 1;
    syncInputs();
  });
  els.levelInput.addEventListener("change", () => {
    els.levelSlider.value = clampLevel(els.levelInput.value);
    syncInputs();
  });

  syncInputs();
}

function parseSelection(select) {
  const value = select.value;
  if (!value) return null;
  const sep = value.indexOf("|");
  return {
    group: value.slice(0, sep),
    id: value.slice(sep + 1),
  };
}

function readSide(side) {
  const els = sideEls[side];
  const general = parseSelection(els.genSelect);
  const unit = parseSelection(els.efSelect);
  return {
    general,
    unit,
    level: clampLevel(els.levelSlider.value),
  };
}

function readEnemy() {
  return {
    unit: parseSelection(enemyEls.efSelect),
    level: clampLevel(enemyEls.levelSlider.value),
  };
}

function fmt(n) {
  return Number(Number(n).toFixed(4)).toString();
}

function readFormulaValues(side) {
  const values = {};
  for (const meta of FORMULA_INPUTS) {
    const el = sideEls[side].inputs[meta.key];
    const raw = el.value.trim();
    let value = null;
    if (raw !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) value = parsed;
    }
    values[meta.key] = value == null ? (meta.op === "mul" ? 1 : 0) : value;
  }
  return values;
}

function computeDamage(atk, tech, allFakeAttack, v) {
  const inner = (atk - tech) * v.morale * v.crit * v.health + allFakeAttack;
  return inner * v.dmgInc * v.dmgRed + v.flatDmg;
}

// Stage 2: damage the defender actually takes. Non-flat damage goes through
// the attack/(attack+defense) ratio and the defender's blue ribbon, flat
// damage skips both, and terrain reduction applies to the sum. Never below 1.
function computeFinalDamage(rawNonFlat, flat, effAtk, enemyDef, terrMult, blueMult) {
  const ratio = effAtk / (effAtk + Math.max(0, enemyDef));
  return Math.max(1, (rawNonFlat * ratio * blueMult + flat) * terrMult);
}

function composeFormula(atk, tech, morale, crit, health, fakeAtk, dmgInc, dmgRed, flatDmg) {
  const l2 = `((${atk} - ${tech}) \u00d7 ${morale} \u00d7 ${crit} \u00d7 ${health})`;
  const l3 = `(${l2} + ${fakeAtk})`;
  return `(${l3} \u00d7 ${dmgInc} \u00d7 ${dmgRed} + ${flatDmg})`;
}

const SYMBOLIC_FORMULA = composeFormula(
  "unit_atk_stat", "fake_atk_from_tech", "morale_multiplier", "crit_multiplier",
  "health_multiplier", "all_fake_attack", "dmg_increase_multipliers",
  "dmg_reduction_multipliers", "flat_dmg"
);

const SYMBOLIC_FINAL_FORMULA =
  "max(1, ((raw_nonflat × attack/(attack+defense) × blue_ribbon) + flat_dmg) × (1 - enemy_terrain_reduction))";

function getStarCount(generalData, unitType) {
  const key = STAR_KEY_BY_TYPE[unitType] || "infantry_stars";
  return clamp(parseInt(generalData[key], 10) || 0, 0, STAR_VALUE.length - 1);
}

function normUnitType(t) {
  t = (t || "").toLowerCase();
  if (t.includes("inf")) return "infantry";
  if (t.includes("armor") || t.includes("armour")) return "armored";
  if (t.includes("art")) return "artillery";
  if (t.includes("nav") || t.includes("sea")) return "navy";
  return "airforce";
}

function fetchGeneral(sel) {
  const g = ALL_GENERALS.find(
    (x) => x.id === sel.general.id && x.tier === sel.general.group
  );
  if (!g) throw new Error(`General not found: ${sel.general.id}`);
  return g.full;
}

function fetchUnit(sel) {
  const u = ALL_UNITS.find(
    (x) => x.id === sel.unit.id && x.type === sel.unit.group
  );
  if (!u) throw new Error(`Unit not found: ${sel.unit.id}`);
  return u.full;
}

// ---------- Skill pools ----------

function loadPools() {
  GENERAL_SKILLS = CALC_GENERAL_SKILLS && typeof CALC_GENERAL_SKILLS === "object" ? CALC_GENERAL_SKILLS : {};
  EF_SKILLS = Array.isArray(CALC_EF_SKILLS) ? CALC_EF_SKILLS : [];
  EF_SKILL_CALCS = CALC_EF_SKILL_CALCS && typeof CALC_EF_SKILL_CALCS === "object" ? CALC_EF_SKILL_CALCS : {};
  MORALE_VALUES = Array.isArray(CALC_MORALE && CALC_MORALE.values) ? CALC_MORALE.values : [];
  TERRAIN_VALUES = Array.isArray(CALC_TERRAIN && CALC_TERRAIN.values) ? CALC_TERRAIN.values : [];
  RED_RIBBON_VALUES = Array.isArray(CALC_RED_RIBBON && CALC_RED_RIBBON.values) ? CALC_RED_RIBBON.values : [];
  GENERAL_SKILLS_OPTIONS = Object.values(GENERAL_SKILLS)
    .filter((s) => s && s.title && String(s.title).trim())
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => ({ title: s.title }));
}

function getSkillDef(title) {
  for (const key in GENERAL_SKILLS) {
    if (GENERAL_SKILLS[key].title === title) return GENERAL_SKILLS[key];
  }
  return null;
}

function skillMaxLevel(title) {
  const def = getSkillDef(title);
  return def && def.maxLevel ? def.maxLevel : DEFAULT_SKILL_MAX;
}

function clampSkillLevel(value, title) {
  return clamp(parseInt(value, 10) || 1, 1, skillMaxLevel(title));
}

function getSkillTier(skill) {
  const tier = String(skill?.tier || "").toLowerCase();
  return KNOWN_TIERS.includes(tier) ? tier : "gold";
}

function getEfSkillDef(title) {
  if (EF_SKILL_CALCS[title]) return EF_SKILL_CALCS[title];
  const stripped = String(title).replace(/\s*\(.*?\)\s*/g, "");
  return EF_SKILL_CALCS[stripped] || null;
}

// EF skill calc level: DB tier maps to 1-4. Tiers are not editable.
function getEfSkillLevel(sk) {
  return sk.tier ? TIER_TO_LEVEL[String(sk.tier).toLowerCase()] || 3 : 3;
}

// ---------- Report state ----------

function buildSideState(side, sel, general, unit, levelData) {
  const stars = {};
  for (const [key] of STAR_META) {
    stars[key] = clamp(parseInt(general[key], 10) || 0, 0, MAX_STARS);
  }
  return {
    side,
    general,
    unit,
    unitName: unit.name || sel.unit.id,
    unitType: sel.unit.group,
    level: sel.level,
    levelStats: levelData.stats || {},
    dbGenSkills: (general.skills || [])
      .filter((s) => s && s.title && String(s.title).trim())
      .map((s) => ({ title: s.title, level: parseInt(s.level, 10) || 1 })),
    dbUnitSkills: (levelData.skills || [])
      .filter((s) => s && s.title && String(s.title).trim())
      .map((s) => ({ title: s.title, tier: s.tier })),
    stars,
    genLevels: {},
    genAdditions: [],
    unitActive: {},
  };
}

// Canonical EF unit type names, with synonyms used by skill condition data
// (e.g. "naval" for navy, "air" for airforce).
const UNIT_TYPE_SYNONYMS = {
  infantry: ["infantry"],
  armored: ["armored", "tank"],
  artillery: ["artillery"],
  navy: ["navy", "naval"],
  airforce: ["airforce", "air"],
};

// Skill effects at a given level that apply to the selected unit type and
// (for target-type skills) the selected enemy profile. A buff applies when
// its condition lists a unit type (unitTypes / attackTypes / targetTypes)
// matching the EF unit type or enemy type, and any terrain / morale condition
// matches the selected Basic Modifiers. Effects conditioned on formationCount
// are situational and intentionally excluded.
function skillContribution(
  skillDef,
  level,
  unitType,
  terrain,
  moraleState,
  targetType
) {
  const out = {
    crit: 0,
    dmgMul: 1,
    flat: 0,
    critDmg: 0,
    overflow: 0,
    ignoreTerrain: false,
    guaranteedCrit: false,
  };
  if (!skillDef) return out;
  const synonyms = UNIT_TYPE_SYNONYMS[unitType] || [unitType];
  const targetSynonyms = UNIT_TYPE_SYNONYMS[targetType] || [targetType];
  const typeMatches = (list, syns) =>
    Array.isArray(list) &&
    list.some((t) => syns.includes(String(t).toLowerCase()));
  for (const eff of skillDef.effects || []) {
    const cond = eff.conditions;
    if (cond) {
      const applies = cond.appliesTo;
      if (applies && applies.unitTypes && !typeMatches(applies.unitTypes, synonyms)) {
        continue;
      }
      if (applies && applies.attackTypes && !typeMatches(applies.attackTypes, synonyms)) {
        continue;
      }
      if (applies && applies.targetTypes && !typeMatches(applies.targetTypes, targetSynonyms)) {
        continue;
      }
      if (cond.formationCount) continue;
      if (cond.terrain && String(cond.terrain).toLowerCase() !== String(terrain || "").toLowerCase()) {
        continue;
      }
      if (cond.morale && String(cond.morale).toLowerCase() !== String(moraleState || "").toLowerCase()) {
        continue;
      }
    }
    const idx = level - 1;
    if (Array.isArray(eff.critChance)) out.crit += eff.critChance[idx] ?? 0;
    // Damage bonuses stack multiplicatively: each effect contributes its own
    // (1 + bonus) factor to the product.
    if (Array.isArray(eff.damageMultiplier)) {
      out.dmgMul *= 1 + (eff.damageMultiplier[idx] ?? 0);
    }
    if (Array.isArray(eff.damageBonus)) out.flat += eff.damageBonus[idx] ?? 0;
    if (Array.isArray(eff.critDamage)) out.critDmg += eff.critDamage[idx] ?? 0;
    if (Array.isArray(eff.overflowCritRatio)) out.overflow += eff.overflowCritRatio[idx] ?? 0;
    if (Array.isArray(eff.ignoreTerrainReduction) && eff.ignoreTerrainReduction[idx]) {
      out.ignoreTerrain = true;
    }
    if (Array.isArray(eff.guaranteedCrit) && eff.guaranteedCrit[idx]) {
      out.guaranteedCrit = true;
    }
  }
  return out;
}

function allGeneralSkills(s) {
  const list = [];
  for (const sk of s.dbGenSkills) {
    const level = s.genLevels[sk.title] ?? clampSkillLevel(sk.level, sk.title);
    list.push({ title: sk.title, level });
  }
  for (const a of s.genAdditions) {
    list.push({ title: a.title, level: clampSkillLevel(a.level, a.title) });
  }
  return list;
}

function recomputeSide(s) {
  const vals = readFormulaValues(s.side);
  const starKey = STAR_KEY_BY_TYPE[s.unitType] || "infantry_stars";
  const starCount = clamp(
    parseInt(s.stars[starKey], 10) ?? getStarCount(s.general, s.unitType),
    0,
    MAX_STARS
  );

  const mod = modState[s.side];
  const moraleState = mod.morale;
  const ribbonDef = RED_RIBBON_VALUES.find((r) => r.level === mod.ribbon);
  const ribbonChance = ribbonDef ? ribbonDef.crit_chance / 100 : 0;
  const ribbonDmg = ribbonDef ? ribbonDef.crit_damage / 100 : 0;
  const enemyType = reportState.enemy ? reportState.enemy.type : null;

  // General biography title (auto-applied when it matches the commanded branch).
  const titleDef = GENERAL_TITLES[s.general.name] || null;
  const titleOn =
    !!titleDef && mod.title !== false && titleDef.branch === s.unitType;

  let critInc = 0;
  let dmgIncSkillFactor = 1;
  let flatSkill = 0;
  let critDmgSkill = 0;
  let overflowRatio = 0;
  let ignoreTerrain = false;
  let guaranteedCrit = false;
  const dmgChain = [];
  const titleAtk = titleOn ? titleDef.atk : 0;
  if (titleOn) {
    critInc += titleDef.crit / 100;
    critDmgSkill += titleDef.critDmg / 100;
  }

  const addContribution = (c, title) => {
    critInc += c.crit;
    dmgIncSkillFactor *= c.dmgMul;
    if (c.dmgMul !== 1) dmgChain.push({ title, factor: c.dmgMul });
    flatSkill += c.flat;
    critDmgSkill += c.critDmg;
    overflowRatio += c.overflow;
    if (c.ignoreTerrain) ignoreTerrain = true;
    if (c.guaranteedCrit) guaranteedCrit = true;
  };

  for (const sk of allGeneralSkills(s)) {
    addContribution(
      skillContribution(
        getSkillDef(sk.title),
        sk.level,
        s.unitType,
        mod.terrain,
        moraleState,
        enemyType
      ),
      sk.title
    );
  }

  // EF unit skills: calc defs are applied at their DB tier level. Active
  // skills default ON and can be toggled off per skill. Skills without a calc
  // def are display-only.
  for (const sk of s.dbUnitSkills) {
    const def = getEfSkillDef(sk.title);
    if (!def) continue;
    if (def.active && s.unitActive[sk.title] === false) continue;
    addContribution(
      skillContribution(
        def,
        getEfSkillLevel(sk),
        s.unitType,
        mod.terrain,
        moraleState,
        enemyType
      ),
      sk.title
    );
  }

  // Crits: chance (skills + ribbon) is capped at 100% for the multiplier but
  // kept raw for display; base crit damage is +50%, ribbon and skill crit
  // damage add on top. Guaranteed crit (skill) and the crit/noCrit modes
  // override the auto expected value; noCrit wins as a manual override.
  const critChanceRaw = critInc + ribbonChance;
  const baseCritDmg = BASE_CRIT_DAMAGE + ribbonDmg + critDmgSkill;
  const critFactor =
    mod.critMode === "noCrit"
      ? 1
      : mod.critMode === "crit" || guaranteedCrit
        ? 1 + baseCritDmg
        : 1 + Math.min(1, critChanceRaw) * baseCritDmg;

  // Overflow crit (Attack On The Unready Enemy): extra crit chance converts
  // into an extra multiplicative damage factor.
  const overflowBonus =
    overflowRatio > 0 ? Math.max(0, critChanceRaw - 1) * overflowRatio : 0;

  const eff = {
    morale: vals.morale,
    crit: vals.crit * critFactor,
    health: vals.health,
    fakeAtk: vals.fakeAtk,
    dmgInc: vals.dmgInc * dmgIncSkillFactor * (1 + overflowBonus),
    dmgRed: vals.dmgRed,
    flatDmg: vals.flatDmg + flatSkill,
  };

  const tech = TECH_BY_TYPE[s.unitType] ?? 0;
  const atk = s.levelStats.attack ?? 0;
  const starValue = STAR_VALUE[starCount];
  const allFakeAttack = eff.fakeAtk + tech + starValue + titleAtk;
  const rawNonFlat = computeDamage(atk, tech, allFakeAttack, { ...eff, flatDmg: 0 });
  const rawDamage = rawNonFlat + eff.flatDmg;

  // Stage 2 — defender-side modifiers come from the shared Enemy card: its
  // terrain grants a reduction by the enemy's unit type, and its defense stat
  // enters through an attack/(attack + defense) ratio. Terrain-ignoring skills
  // bypass the defensive terrain bonus.
  const enemyState = reportState.enemy || null;
  const enemyDef =
    enemyState && enemyState.levelStats
      ? Number(enemyState.levelStats.defense) || 0
      : 0;
  const enemyTerrainDef = TERRAIN_VALUES.find(
    (t) => t.terrain === modState.enemy.terrain
  );
  const enemyTerrMult = ignoreTerrain
    ? 1
    : 1 -
      ((enemyTerrainDef &&
        enemyTerrainDef.reduction &&
        enemyTerrainDef.reduction[enemyType]) ||
        0);
  const effAtk = vals.effAtkOvr > 0 ? vals.effAtkOvr : EFF_ATK_DEFAULT;
  const blueMult = 1 - (BLUE_REDUCTION[clamp(modState.enemy.ribbon || 0, 0, 5)] ?? 0);
  const finalDamage = computeFinalDamage(rawNonFlat, eff.flatDmg, effAtk, enemyDef, enemyTerrMult, blueMult);
  const ratio = effAtk / (effAtk + Math.max(0, enemyDef));

  s.eff = eff;
  s.damage = {
    atk,
    tech,
    starCount,
    starValue,
    allFakeAttack,
    v: eff,
    critChanceRaw,
    critFactor,
    dmgIncSkillFactor,
    dmgChain,
    critDmgSkill,
    overflowBonus,
    damage: rawDamage,
    rawNonFlat,
    titleAtk,
    titleName: titleOn ? titleDef.title : null,
    blueMult,
    effAtk,
    enemyDef,
    ratio,
    enemyTerrMult,
    finalDamage,
  };
}

function refreshReport() {
  if (!reportState) return;
  recomputeSide(reportState.left);
  recomputeSide(reportState.right);
  renderReport();
}

// ---------- Report images (portraits, unit photos, skill icons) ----------

function generalPortrait(name, tier) {
  const m = (typeof WC4_PORTRAITS !== "undefined" ? WC4_PORTRAITS.generals : {}) || {};
  return m[name + "|" + tier] || "assets/generals/general.png";
}

function elitePortrait(name) {
  const m = (typeof WC4_PORTRAITS !== "undefined" ? WC4_PORTRAITS.elite : {}) || {};
  return m[name] || null;
}

function generalSkillIcon(title) {
  const t = (typeof WC4_SKILL_ICONS !== "undefined" ? WC4_SKILL_ICONS[title] : null);
  return t != null
    ? `<img class="skicon" src="media/skills/${t}.webp" alt="" onerror="this.remove()">`
    : "";
}

function efSkillIcon(title, tier) {
  const per = (typeof WC4_FEAT_ICONS !== "undefined" ? WC4_FEAT_ICONS : {})[title] || {};
  const order = ["bronze", "silver", "gold", "platinum"];
  const have = order.filter((t) => per[t]);
  const file = per[String(tier || "").toLowerCase()] || per[have[have.length - 1]];
  return file
    ? `<img class="skicon" src="media/feats/${file}" alt="" onerror="this.remove()">`
    : "";
}

// ---------- Editable renderers ----------

function renderStarEditor(side, key, value) {
  let html = `<span class="star-editor">`;
  html += `<button type="button" class="star-btn star-btn--zero${value === 0 ? " star-btn--on" : ""}" data-edit="stars" data-side="${side}" data-key="${key}" data-value="0" title="0 stars">0</button>`;
  for (let i = 1; i <= MAX_STARS; i++) {
    const on = i <= value ? " star-btn--on" : "";
    html += `<button type="button" class="star-btn${on}" data-edit="stars" data-side="${side}" data-key="${key}" data-value="${i}" title="${i} star${i > 1 ? "s" : ""}">&#9733;</button>`;
  }
  return html + `</span>`;
}

function renderSkillAddSelect(side) {
  const s = reportState[side];
  const existing = new Set([
    ...s.dbGenSkills.map((x) => x.title),
    ...s.genAdditions.map((x) => x.title),
  ]);
  const pool = GENERAL_SKILLS_OPTIONS;
  const list = pool.filter((opt) => !existing.has(opt.title));
  let html = `<select class="skill-add-select" data-add="genSkill" data-side="${side}"><option value="">Add skill&hellip;</option>`;
  for (const opt of list) {
    html += `<option value="${escapeHtml(opt.title)}">${escapeHtml(opt.title)}</option>`;
  }
  return html + `</select>`;
}

function renderGeneralSkillColumn(side) {
  const s = reportState[side];
  let html = `<div class="skill-column">`;
  for (const sk of s.dbGenSkills) {
    const max = skillMaxLevel(sk.title);
    const cur = s.genLevels[sk.title] ?? clampSkillLevel(sk.level, sk.title);
    html += `<div class="skill-row"><span class="skill-chip skill-chip--gold">${generalSkillIcon(sk.title)}${escapeHtml(sk.title)}</span>`;
    html += renderLevelStepper("genLevel", side, sk.title, cur, max, "");
    html += `</div>`;
  }
  for (let i = 0; i < GEN_ADD_SLOTS; i++) {
    const add = s.genAdditions[i];
    if (add) {
      const max = skillMaxLevel(add.title);
      const cur = clampSkillLevel(add.level, add.title);
      html += `<div class="skill-row"><span class="skill-chip skill-chip--gold">${generalSkillIcon(add.title)}${escapeHtml(add.title)}</span>`;
      html += renderLevelStepper("genAddLevel", side, add.title, cur, max, i);
      html += renderRemoveButton("removeGen", side, i);
      html += `</div>`;
    } else {
      html += `<div class="skill-slot">${renderSkillAddSelect(side)}</div>`;
    }
  }
  return html + `</div>`;
}

function renderUnitSkillColumn(side) {
  const s = reportState[side];
  let html = `<div class="skill-column">`;
  for (const sk of s.dbUnitSkills) {
    const def = getEfSkillDef(sk.title);
    html += `<div class="skill-row"><span class="skill-chip skill-chip--${getSkillTier(sk)}">${efSkillIcon(sk.title, sk.tier)}${escapeHtml(sk.title)}</span>`;
    if (def && def.active) {
      const on = s.unitActive[sk.title] !== false;
      html += `<button type="button" class="skill-active-btn${on ? " skill-active-btn--on" : " skill-active-btn--off"}" data-edit="unitActive" data-side="${side}" data-title="${escapeHtml(sk.title)}" title="${on ? "Active skill (click to deactivate)" : "Inactive skill (click to activate)"}">${on ? "Skill Active" : "Skill Inactive"}</button>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}

function renderLevelStepper(edit, side, title, cur, max, index) {
  const indexAttr = index === "" ? "" : ` data-index="${index}"`;
  return `<span class="lvl-stepper">
    <button type="button" class="lvl-step-btn" data-edit="${edit}" data-side="${side}" data-title="${escapeHtml(title)}"${indexAttr} data-delta="-1"${cur <= 1 ? " disabled" : ""} aria-label="Lower ${title} level">&#8722;</button>
    <span class="lvl-stepper__value">${cur}</span>
    <button type="button" class="lvl-step-btn" data-edit="${edit}" data-side="${side}" data-title="${escapeHtml(title)}"${indexAttr} data-delta="1"${cur >= max ? " disabled" : ""} aria-label="Raise ${title} level">&#43;</button>
  </span>`;
}

function renderRemoveButton(edit, side, index) {
  return `<button type="button" class="skill-del-btn" data-edit="${edit}" data-side="${side}" data-index="${index}" aria-label="Remove skill">&#10005;</button>`;
}

function renderDamageCard(label, data) {
  const values = composeFormula(
    fmt(data.damage.atk),
    fmt(data.damage.tech),
    fmt(data.damage.v.morale),
    fmt(data.damage.v.crit),
    fmt(data.damage.v.health),
    fmt(data.damage.allFakeAttack),
    fmt(data.damage.v.dmgInc),
    fmt(data.damage.v.dmgRed),
    fmt(data.damage.v.flatDmg)
  );

  const finalValues = `max(1, (${fmt(data.damage.rawNonFlat)} \u00d7 ${fmt(
    data.damage.effAtk
  )} / (${fmt(data.damage.effAtk)} + ${fmt(data.damage.enemyDef)})) \u00d7 ${fmt(
    data.damage.blueMult
  )} + ${fmt(data.damage.v.flatDmg)}) \u00d7 ${fmt(data.damage.enemyTerrMult)})`;

  const starGlyphs = `<span class="star--on">${"★".repeat(data.damage.starCount)}</span><span class="star--off">${"☆".repeat(STAR_VALUE.length - 1 - data.damage.starCount)}</span>`;

  const chainChips = (data.damage.dmgChain || [])
    .map(
      (f) =>
        `<span class="chip"><span class="chip__label">${escapeHtml(f.title)}</span><span class="chip__value">\u00d7${fmt(f.factor)}</span></span>`
    )
    .join("");

  return `
    <div class="damage-card">
      <div class="damage-card__header">
        <span class="damage-card__side">${label}</span>
        <span class="damage-card__unit">${escapeHtml(data.unitName)} &middot; LVL ${data.level}</span>
      </div>
      <div class="damage-card__derived">
        <span class="chip"><span class="chip__label">unit_atk_stat</span><span class="chip__value">${fmt(data.damage.atk)}</span></span>
        <span class="chip"><span class="chip__label">fake_atk_from_tech</span><span class="chip__value">${fmt(data.damage.tech)}</span></span>
        <span class="chip"><span class="chip__label">all_fake_attack (tech ${fmt(data.damage.tech)} + stars ${fmt(data.damage.starValue)} + title ${fmt(data.damage.titleAtk)} + manual ${fmt(data.damage.v.fakeAtk)})</span><span class="chip__value">${fmt(data.damage.allFakeAttack)}</span></span>
        <span class="chip"><span class="chip__label">general stars ${starGlyphs}</span><span class="chip__value">${fmt(data.damage.starValue)}</span></span>
        <span class="chip"><span class="chip__label">crit chance (raw)</span><span class="chip__value">${Math.round(data.damage.critChanceRaw * 100)}%</span></span>
        <span class="chip"><span class="chip__label">crit multiplier</span><span class="chip__value">${fmt(data.damage.critFactor)}</span></span>
        <span class="chip"><span class="chip__label">skill damage multipliers total (incl. overflow \u00d7${fmt(1 + data.damage.overflowBonus)})</span><span class="chip__value">\u00d7${fmt(data.damage.dmgIncSkillFactor * (1 + data.damage.overflowBonus))}</span></span>
        ${chainChips}
        <span class="chip"><span class="chip__label">skill crit damage bonus</span><span class="chip__value">+${Math.round(data.damage.critDmgSkill * 100)}%</span></span>
        <span class="chip"><span class="chip__label">effective attack</span><span class="chip__value">${fmt(data.damage.effAtk)}</span></span>
        <span class="chip"><span class="chip__label">enemy defense</span><span class="chip__value">${formatNumber(Math.max(0, data.damage.enemyDef))}</span></span>
        <span class="chip"><span class="chip__label">attack/(attack+defense)</span><span class="chip__value">${fmt(data.damage.ratio)}</span></span>
        <span class="chip"><span class="chip__label">enemy terrain multiplier</span><span class="chip__value">${fmt(data.damage.enemyTerrMult)}</span></span>
        <span class="chip"><span class="chip__label">enemy blue ribbon multiplier</span><span class="chip__value">${fmt(data.damage.blueMult)}</span></span>
      </div>
      <div class="debug-block">
        <p class="debug-tag">Raw damage formula</p>
        <code>${escapeHtml(SYMBOLIC_FORMULA)}</code>
        <p class="debug-tag">Raw damage with values</p>
        <code>${escapeHtml(values)}</code>
        <p class="debug-tag">Damage to unit</p>
        <code>${escapeHtml(SYMBOLIC_FINAL_FORMULA)}</code>
        <p class="debug-tag">Damage to unit with values</p>
        <code>${escapeHtml(finalValues)}</code>
      </div>
      <div class="damage-card__results">
        <div class="damage-card__result">
          <span class="damage-card__result-label">Raw Damage</span>
          <strong class="damage-card__result-value">${formatNumber(Math.round(data.damage.damage))}</strong>
        </div>
        <div class="damage-card__result damage-card__result--final">
          <span class="damage-card__result-label">Damage To Unit</span>
          <strong class="damage-card__result-value">${formatNumber(Math.round(data.damage.finalDamage))}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderReport() {
  const left = reportState.left;
  const right = reportState.right;
  const rows = [];

  const section = (label) => `<tr class="compare-table__section"><td colspan="3">${label}</td></tr>`;
  const row = (label, leftHtml, rightHtml, name) => `
    <tr>
      <td class="compare-table__label">${label}</td>
      <td class="compare-table__value${name ? " compare-table__value--name" : ""}">${leftHtml}</td>
      <td class="compare-table__value${name ? " compare-table__value--name" : ""}">${rightHtml}</td>
    </tr>`;

  rows.push(section("General"));
  const genCell = (g) =>
    `<img class="rep-thumb" src="${generalPortrait(g.name, g.tier)}" alt="" onerror="this.remove()">${escapeHtml(g.name)}`;
  const unitCell = (name) => {
    const src = elitePortrait(name);
    return `${src ? `<img class="rep-thumb" src="${src}" alt="" onerror="this.remove()">` : ""}${escapeHtml(name)}`;
  };
  rows.push(row("General", genCell(left.general), genCell(right.general), true));
  rows.push(row("Rank", escapeHtml(left.general.rank || "&mdash;"), escapeHtml(right.general.rank || "&mdash;")));
  const titleCell = (s) =>
    s.damage.titleName
      ? `${escapeHtml(s.damage.titleName)} (on)`
      : `<span style="color:var(--text-faint)">—</span>`;
  rows.push(row("Title", titleCell(left), titleCell(right)));
  for (const [key, label] of STAR_META) {
    rows.push(
      row(label, renderStarEditor("left", key, left.stars[key]), renderStarEditor("right", key, right.stars[key]))
    );
  }
  rows.push(
    row("Skills", renderGeneralSkillColumn("left"), renderGeneralSkillColumn("right"))
  );

  rows.push(section("Elite Force"));
  rows.push(row("Unit", unitCell(left.unitName), unitCell(right.unitName), true));
  rows.push(
    row("Type", escapeHtml(TYPE_LABELS[left.unitType] || left.unitType), escapeHtml(TYPE_LABELS[right.unitType] || right.unitType))
  );
  rows.push(row("Level", `LVL ${left.level}`, `LVL ${right.level}`));
  for (const [key, label] of STAT_META) {
    rows.push(
      row(label, formatNumber(left.levelStats[key]), formatNumber(right.levelStats[key]))
    );
  }
  rows.push(
    row("Skills", renderUnitSkillColumn("left"), renderUnitSkillColumn("right"))
  );

  const enemy = reportState.enemy;
  rows.push(section("Enemy"));
  const spanRow = (label, html) => `
    <tr>
      <td class="compare-table__label">${label}</td>
      <td class="compare-table__value compare-table__value--name" colspan="2">${html}</td>
    </tr>`;
  rows.push(
    spanRow("Target Unit", unitCell(enemy ? enemy.name : "&mdash;")),
    spanRow("Target Type", escapeHtml(enemy && TYPE_LABELS[enemy.type] ? TYPE_LABELS[enemy.type] : enemy ? enemy.type : "&mdash;")),
    spanRow("Level", enemy ? `LVL ${enemy.level}` : "&mdash;"),
    spanRow(
      "Defense",
      enemy && enemy.levelStats && enemy.levelStats.defense != null
        ? formatNumber(enemy.levelStats.defense)
        : "&mdash;"
    )
  );

  resultPanel.innerHTML = `
    <div class="comparison">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="compare-table__label">Stat</th>
            <th>A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join("")}
        </tbody>
      </table>
    </div>
    <div class="damage-report">
      <div class="damage-report__title">Damage Report</div>
      <div class="damage-cards">
        ${renderDamageCard("A", left)}
        ${renderDamageCard("B", right)}
      </div>
    </div>
    <div class="action-row action-row--report">
      <button id="compareAgainBtn" class="compare-btn" type="button">Compare Again</button>
    </div>
  `;
}

function renderMessage(message, isError) {
  resultPanel.innerHTML = `
    <div class="result-empty${isError ? " result-empty--error" : ""}">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

// ---------- Inline edit handling ----------

resultPanel.addEventListener("click", (event) => {
  if (!reportState) return;

  const againBtn = event.target.closest("#compareAgainBtn");
  if (againBtn) {
    refreshReport();
    return;
  }

  const btn = event.target.closest("button[data-edit]");
  if (!btn) return;

  const s = reportState[btn.dataset.side];
  if (!s) return;

  const edit = btn.dataset.edit;
  const delta = parseInt(btn.dataset.delta, 10) || 0;

  if (edit === "stars") {
    s.stars[btn.dataset.key] = clamp(parseInt(btn.dataset.value, 10), 0, MAX_STARS);
  } else if (edit === "genLevel") {
    const title = btn.dataset.title;
    const cur = s.genLevels[title] ?? clampSkillLevel(
      (s.dbGenSkills.find((sk) => sk.title === title) || {}).level || 1,
      title
    );
    s.genLevels[title] = clamp(cur + delta, 1, skillMaxLevel(title));
  } else if (edit === "genAddLevel") {
    const add = s.genAdditions[parseInt(btn.dataset.index, 10)];
    if (add) {
      add.level = clampSkillLevel(add.level + delta, add.title);
    }
  } else if (edit === "removeGen") {
    s.genAdditions.splice(parseInt(btn.dataset.index, 10), 1);
  } else if (edit === "unitActive") {
    const title = btn.dataset.title;
    s.unitActive[title] = s.unitActive[title] === false;
  }

  refreshReport();
});

resultPanel.addEventListener("change", (event) => {
  if (!reportState) return;
  const sel = event.target.closest("select[data-add]");
  if (!sel || !sel.value) return;

  const s = reportState[sel.dataset.side];
  if (!s) return;

  if (sel.dataset.add === "genSkill") {
    if (s.genAdditions.length >= GEN_ADD_SLOTS) return;
    s.genAdditions.push({ title: sel.value, level: 1 });
  }

  refreshReport();
});

// ---------- Basic Modifiers ----------

function setGroupActive(groupEl, value) {
  for (const btn of groupEl.querySelectorAll("button.seg-btn")) {
    btn.classList.toggle("seg-btn--on", btn.dataset.value === String(value));
  }
}

function renderBasicModifiers(side) {
  const els = elsFor(side);
  const state = modState[side];

  els.moraleBtns.innerHTML = MORALE_VALUES.map(
    (m) =>
      `<button type="button" class="seg-btn${m.state === state.morale ? " seg-btn--on" : ""}" data-value="${escapeHtml(m.state)}" title="${escapeHtml(m.state)} (\u00d7${m.value})">${escapeHtml(m.state)}</button>`
  ).join("");

  els.terrainBtns.innerHTML = TERRAIN_VALUES.map(
    (t) =>
      `<button type="button" class="seg-btn${t.terrain === state.terrain ? " seg-btn--on" : ""}" data-value="${escapeHtml(t.terrain)}">${escapeHtml(t.terrain)}</button>`
  ).join("");

  els.ribbonBtns.innerHTML = (side === "enemy"
    ? [0, 1, 2, 3, 4, 5].map((lv) => ({
        level: lv,
        label: lv === 0 ? "None" : `Lv ${lv}`,
        title: lv === 0 ? "No blue ribbon" : `Blue ribbon Lv ${lv}: damage taken -${Math.round(BLUE_REDUCTION[lv] * 100)}%`,
      }))
    : RED_RIBBON_VALUES.map((r) => ({
        level: r.level,
        label: `Lv ${r.level}`,
        title: `Crit Chance ${r.crit_chance}% · Crit Damage ${r.crit_damage}%`,
      }))
  )
    .map(
      (r) =>
        `<button type="button" class="seg-btn${r.level === state.ribbon ? " seg-btn--on" : ""}" data-value="${r.level}" title="${escapeHtml(r.title)}">${r.label === "None" ? "None" : escapeHtml(r.label)}</button>`
    )
    .join("");

  els.critBtns.innerHTML = [
    { value: "auto", label: "Auto" },
    { value: "crit", label: "Guaranteed Crit" },
    { value: "noCrit", label: "Guaranteed No Crit" },
  ]
    .map(
      (c) =>
        `<button type="button" class="seg-btn${c.value === state.critMode ? " seg-btn--on" : ""}" data-value="${c.value}">${c.label}</button>`
    )
    .join("");

  if (els.titleBtns) {
    const on = state.title !== false;
    els.titleBtns.innerHTML = [
      { value: "on", label: "Title On" },
      { value: "off", label: "Title Off" },
    ]
      .map(
        (c) =>
          `<button type="button" class="seg-btn${((c.value === "on") === on) ? " seg-btn--on" : ""}" data-value="${c.value}">${c.label}</button>`
      )
      .join("");
  }

  els.hpSlider.value = state.hp;
  els.hpInput.value = state.hp;
}

function bindBasicModifiers(side) {
  const els = elsFor(side);
  const setHealthInput = (value) => {
    if (els.inputs && els.inputs.health) els.inputs.health.value = value;
  };
  const setMoraleInput = (value) => {
    if (els.inputs && els.inputs.morale) els.inputs.morale.value = value;
  };

  const syncHp = () => {
    const hp = clamp(parseInt(els.hpSlider.value, 10) || 100, 0, 100);
    modState[side].hp = hp;
    els.hpSlider.value = hp;
    els.hpInput.value = hp;
    setHealthInput(hp >= 50 ? 1 : 0.5);
    if (reportState) refreshReport();
  };

  els.hpSlider.addEventListener("input", syncHp);
  els.hpInput.addEventListener("change", () => {
    const hp = clamp(parseInt(els.hpInput.value, 10) || 100, 0, 100);
    modState[side].hp = hp;
    els.hpSlider.value = hp;
    els.hpInput.value = hp;
    setHealthInput(hp >= 50 ? 1 : 0.5);
    if (reportState) refreshReport();
  });

  els.moraleBtns.addEventListener("click", (event) => {
    const btn = event.target.closest("button.seg-btn");
    if (!btn) return;
    modState[side].morale = btn.dataset.value;
    const def = MORALE_VALUES.find((m) => m.state === modState[side].morale);
    setMoraleInput(def ? def.value : 1);
    setGroupActive(els.moraleBtns, modState[side].morale);
    if (reportState) refreshReport();
  });

  els.terrainBtns.addEventListener("click", (event) => {
    const btn = event.target.closest("button.seg-btn");
    if (!btn) return;
    modState[side].terrain = btn.dataset.value;
    setGroupActive(els.terrainBtns, modState[side].terrain);
    if (reportState) refreshReport();
  });

  els.ribbonBtns.addEventListener("click", (event) => {
    const btn = event.target.closest("button.seg-btn");
    if (!btn) return;
    const level = parseInt(btn.dataset.value, 10);
    modState[side].ribbon = modState[side].ribbon === level ? 0 : level;
    setGroupActive(els.ribbonBtns, modState[side].ribbon);
    if (reportState) refreshReport();
  });

  els.critBtns.addEventListener("click", (event) => {
    const btn = event.target.closest("button.seg-btn");
    if (!btn) return;
    modState[side].critMode = btn.dataset.value;
    setGroupActive(els.critBtns, modState[side].critMode);
    if (reportState) refreshReport();
  });

  if (els.titleBtns) {
    els.titleBtns.addEventListener("click", (event) => {
      const btn = event.target.closest("button.seg-btn");
      if (!btn) return;
      modState[side].title = btn.dataset.value === "on";
      setGroupActive(els.titleBtns, btn.dataset.value === "on" ? "on" : "off");
      renderBasicModifiers(side);
      if (reportState) refreshReport();
    });
  }
}

// ---------- Compare flow ----------

async function runCompare() {
  const left = readSide("left");
  const right = readSide("right");
  const enemy = readEnemy();

  for (const [name, sel] of [
    ["A general", left.general],
    ["A elite force", left.unit],
    ["B general", right.general],
    ["B elite force", right.unit],
  ]) {
    if (!sel) {
      renderMessage(`No ${name} selected.`, true);
      setStatus("error", "SELECTION MISSING");
      return;
    }
  }

  if (!enemy.unit) {
    renderMessage("No enemy selected.", true);
    setStatus("error", "SELECTION MISSING");
    return;
  }

  setStatus("busy", "LOADING");

  try {
    const [leftGen, rightGen, leftUnit, rightUnit, enemyUnitData] =
      await Promise.all([
        fetchGeneral(left),
        fetchGeneral(right),
        fetchUnit(left),
        fetchUnit(right),
        fetchUnit({ unit: enemy.unit }),
      ]);

    const leftLevelData = (leftUnit.levels || []).find((entry) => entry.level === left.level);
    const rightLevelData = (rightUnit.levels || []).find((entry) => entry.level === right.level);

    if (!leftLevelData) {
      throw new Error(`No record for ${leftUnit.name} at level ${left.level}.`);
    }
    if (!rightLevelData) {
      throw new Error(`No record for ${rightUnit.name} at level ${right.level}.`);
    }

    const enemyLevelData = (enemyUnitData.levels || []).find(
      (entry) => entry.level === enemy.level
    );
    if (!enemyLevelData) {
      throw new Error(
        `No record for ${enemyUnitData.name} at level ${enemy.level}.`
      );
    }

    const enemyUnit = ALL_UNITS.find((u) => u.id === enemy.unit.id) || null;

    reportState = {
      left: buildSideState("left", left, leftGen, leftUnit, leftLevelData),
      right: buildSideState("right", right, rightGen, rightUnit, rightLevelData),
      enemy: {
        type: enemy.unit.group,
        name: enemyUnit ? enemyUnit.name : enemy.unit.id,
        level: enemy.level,
        levelStats: enemyLevelData.stats || {},
      },
    };

    refreshReport();
    setStatus("ready", "COMPARE READY");
  } catch (err) {
    renderMessage(err.message, true);
    setStatus("error", "FETCH FAILED");
  }
}

compareBtn.addEventListener("click", runCompare);

bindLevelControls("left");
bindLevelControls("right");

async function init() {
  try {
    ALL_GENERALS = (Array.isArray(WC4_GENERALS) ? WC4_GENERALS : [])
      .filter((g) => g && g.name && g.tier)
      .map((g) => ({ id: g.name, name: g.name, tier: g.tier, full: g }));
    ALL_UNITS = (Array.isArray(WC4_ELITE) ? WC4_ELITE : [])
      .filter((u) => u && u.name && u.unit_type)
      .map((u) => ({ id: u.name, name: u.name, type: normUnitType(u.unit_type), full: u }));

    if (ALL_GENERALS.length === 0 || ALL_UNITS.length === 0) {
      throw new Error("One of the databases has no entries.");
    }

    populateSelect(
      sideEls.left.genSelect,
      ALL_GENERALS,
      TIER_ORDER,
      TIER_LABELS,
      (g) => g.tier || "bronze"
    );
    populateSelect(
      sideEls.right.genSelect,
      ALL_GENERALS,
      TIER_ORDER,
      TIER_LABELS,
      (g) => g.tier || "bronze"
    );
    populateSelect(
      sideEls.left.efSelect,
      ALL_UNITS,
      TYPE_ORDER,
      TYPE_LABELS,
      (u) => u.type || "infantry"
    );
    populateSelect(
      sideEls.right.efSelect,
      ALL_UNITS,
      TYPE_ORDER,
      TYPE_LABELS,
      (u) => u.type || "infantry"
    );
    populateSelect(
      enemyEls.efSelect,
      ALL_UNITS,
      TYPE_ORDER,
      TYPE_LABELS,
      (u) => u.type || "infantry"
    );

    loadPools();
    renderBasicModifiers("left");
    renderBasicModifiers("right");
    renderBasicModifiers("enemy");
    bindBasicModifiers("left");
    bindBasicModifiers("right");
    bindBasicModifiers("enemy");
    bindLevelControls("enemy");

    compareBtn.disabled = false;
    setStatus("ready", "READY");
  } catch (err) {
    renderMessage(`Could not load databases: ${err.message}`, true);
    setStatus("error", "NO DATA");
  }
}

init();
