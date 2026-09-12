// TypeScript interfaces for Life RPG
export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type QuestCategory = 'fitness' | 'study' | 'coding' | 'social' | 'health' | 'creative' | 'work' | 'other';
export type QuestStatus = 'pending' | 'completed' | 'failed';
export type ItemType = 'theme' | 'badge' | 'avatar' | 'boost';

export interface Attributes {
  strength: number;
  intellect: number;
  vitality: number;
  charisma: number;
  endurance: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  createdAt: string;
  level: number;
  totalXP: number;
  currentXP: number;
  gold: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  attributes: Attributes;
  inventory: string[];
  badges: string[];
  questsCompleted: number;
}

export interface Quest {
  id: string;
  uid: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: Difficulty;
  xpReward: number;
  goldReward: number;
  attributeReward: Partial<Attributes>;
  status: QuestStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: ItemType;
  effect?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatar: string;
  level: number;
  totalXP: number;
  questsCompleted: number;
}

export interface LevelUpResult {
  leveled: boolean;
  newLevel: number;
  oldLevel: number;
}

export interface XPResult {
  xpGained: number;
  goldGained: number;
  attributeGains: Partial<Attributes>;
  levelUp: LevelUpResult;
}
