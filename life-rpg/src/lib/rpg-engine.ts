import { Attributes, Difficulty, QuestCategory, LevelUpResult, XPResult } from '@/types';

// ─── XP & Leveling ────────────────────────────────────────────────────────────

/** XP required to reach the NEXT level from current level */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Total cumulative XP needed to reach a given level */
export function totalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Compute level from total XP */
export function levelFromTotalXP(totalXP: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
  }
  return level;
}

/** XP within the current level (for progress bar) */
export function currentLevelXP(totalXP: number): number {
  const level = levelFromTotalXP(totalXP);
  const xpForThisLevel = totalXPForLevel(level);
  return totalXP - xpForThisLevel;
}

/** XP needed to complete current level */
export function xpToNextLevel(totalXP: number): number {
  const level = levelFromTotalXP(totalXP);
  return xpForLevel(level);
}

/** Percentage progress through current level */
export function levelProgress(totalXP: number): number {
  const curr = currentLevelXP(totalXP);
  const needed = xpToNextLevel(totalXP);
  return Math.min((curr / needed) * 100, 100);
}

// ─── Quest Rewards ────────────────────────────────────────────────────────────

export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 25,
  medium: 75,
  hard: 150,
  epic: 300,
};

export const GOLD_REWARDS: Record<Difficulty, number> = {
  easy: 5,
  medium: 15,
  hard: 30,
  epic: 60,
};

// ─── Attribute Mapping ────────────────────────────────────────────────────────

export const ATTRIBUTE_GAINS: Record<QuestCategory, Partial<Attributes>> = {
  fitness:  { strength: 2, vitality: 1 },
  study:    { intellect: 3 },
  coding:   { intellect: 2, charisma: 1 },
  social:   { charisma: 3 },
  health:   { vitality: 2, endurance: 1 },
  creative: { charisma: 2, intellect: 1 },
  work:     { endurance: 2, intellect: 1 },
  other:    { endurance: 1 },
};

// Scale attribute gains by difficulty
export function scaledAttributeGains(
  category: QuestCategory,
  difficulty: Difficulty
): Partial<Attributes> {
  const base = ATTRIBUTE_GAINS[category];
  const multipliers: Record<Difficulty, number> = {
    easy: 0.5,
    medium: 1,
    hard: 2,
    epic: 4,
  };
  const mult = multipliers[difficulty];
  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, Math.round((v as number) * mult)])
  ) as Partial<Attributes>;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/** Returns true if a quest completion today continues or starts a streak */
export function isStreakActive(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return false;
  const last = new Date(lastActiveDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 48; // within yesterday
}

export function shouldIncrementStreak(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return true; // first time
  const last = new Date(lastActiveDate);
  const now = new Date();
  // Different calendar day but within 48h
  const diffMs = now.getTime() - last.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const sameDay =
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate();
  return !sameDay && diffHours < 48;
}

// ─── Level-up Detection ───────────────────────────────────────────────────────

export function checkLevelUp(oldTotalXP: number, newTotalXP: number): LevelUpResult {
  const oldLevel = levelFromTotalXP(oldTotalXP);
  const newLevel = levelFromTotalXP(newTotalXP);
  return {
    leveled: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

// ─── Full Quest Completion Calculation ───────────────────────────────────────

export function calculateQuestRewards(
  category: QuestCategory,
  difficulty: Difficulty,
  currentTotalXP: number
): XPResult {
  const xpGained = XP_REWARDS[difficulty];
  const goldGained = GOLD_REWARDS[difficulty];
  const attributeGains = scaledAttributeGains(category, difficulty);
  const newTotalXP = currentTotalXP + xpGained;
  const levelUp = checkLevelUp(currentTotalXP, newTotalXP);

  return { xpGained, goldGained, attributeGains, levelUp };
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<QuestCategory, string> = {
  fitness: '⚔️ Fitness',
  study: '📚 Study',
  coding: '💻 Coding',
  social: '🤝 Social',
  health: '🌿 Health',
  creative: '🎨 Creative',
  work: '🏹 Work',
  other: '⭐ Other',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '🌱 Easy',
  medium: '⚡ Medium',
  hard: '🔥 Hard',
  epic: '💀 Epic',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#4ade80',
  medium: '#facc15',
  hard: '#f97316',
  epic: '#a855f7',
};

export const ATTRIBUTE_ICONS: Record<keyof Attributes, string> = {
  strength: '⚔️',
  intellect: '📚',
  vitality: '💚',
  charisma: '✨',
  endurance: '🛡️',
};

export const ATTRIBUTE_COLORS: Record<keyof Attributes, string> = {
  strength: '#ef4444',
  intellect: '#3b82f6',
  vitality: '#22c55e',
  charisma: '#a855f7',
  endurance: '#f59e0b',
};
