import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Quest, ShopItem, Attributes, QuestCategory, Difficulty, LeaderboardEntry } from '@/types';
import {
  calculateQuestRewards,
  shouldIncrementStreak,
  levelFromTotalXP,
  XP_REWARDS,
  GOLD_REWARDS,
  scaledAttributeGains,
} from './rpg-engine';
import { SHOP_ITEMS } from './shop-items';

function getDb(): Firestore | null {
  return db;
}

// ─── Default Demo Data for LocalStorage Fallback ──────────────────────────────

const MOCK_DEFAULT_PROFILE: UserProfile = {
  uid: 'demo-user-123',
  displayName: 'Valiant Adventurer',
  email: 'adventurer@realm.com',
  avatar: '⚔️',
  createdAt: new Date().toISOString(),
  level: 3,
  totalXP: 450,
  currentXP: 150,
  gold: 250,
  streak: 3,
  longestStreak: 5,
  lastActiveDate: new Date().toISOString(),
  attributes: { strength: 12, intellect: 18, vitality: 15, charisma: 10, endurance: 8 },
  inventory: ['item_scroll_focus'],
  badges: ['badge_first_quest', 'badge_streak_3'],
  questsCompleted: 7,
};

const MOCK_DEFAULT_QUESTS: Quest[] = [
  {
    id: 'demo-q1',
    uid: 'demo-user-123',
    title: 'Morning Meditation & Breathing',
    description: '10 minutes of focused mindfulness to sharpen the mind.',
    category: 'health',
    difficulty: 'easy',
    xpReward: 25,
    goldReward: 10,
    attributeReward: { intellect: 2, vitality: 1 },
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    completedAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-q2',
    uid: 'demo-user-123',
    title: 'Complete 30 Pushups',
    description: 'Build physical stamina and strength.',
    category: 'fitness',
    difficulty: 'medium',
    xpReward: 50,
    goldReward: 25,
    attributeReward: { strength: 3, endurance: 2 },
    status: 'pending',
    dueDate: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'demo-q3',
    uid: 'demo-user-123',
    title: 'Read 20 Pages of Tech Book',
    description: 'Expand technical knowledge and problem solving skills.',
    category: 'study',
    difficulty: 'medium',
    xpReward: 50,
    goldReward: 25,
    attributeReward: { intellect: 4 },
    status: 'completed',
    dueDate: null,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 90000000).toISOString(),
  },
];

// Helper functions for LocalStorage
function getLocalProfile(uid: string): UserProfile | null {
  if (typeof window === 'undefined') return MOCK_DEFAULT_PROFILE;
  const raw = localStorage.getItem(`life_rpg_user_${uid}`);
  if (!raw) {
    localStorage.setItem(`life_rpg_user_${uid}`, JSON.stringify(MOCK_DEFAULT_PROFILE));
    return MOCK_DEFAULT_PROFILE;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return MOCK_DEFAULT_PROFILE;
  }
}

function setLocalProfile(uid: string, profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`life_rpg_user_${uid}`, JSON.stringify(profile));
  }
}

function getLocalQuests(uid: string): Quest[] {
  if (typeof window === 'undefined') return MOCK_DEFAULT_QUESTS;
  const raw = localStorage.getItem(`life_rpg_quests_${uid}`);
  if (!raw) {
    localStorage.setItem(`life_rpg_quests_${uid}`, JSON.stringify(MOCK_DEFAULT_QUESTS));
    return MOCK_DEFAULT_QUESTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return MOCK_DEFAULT_QUESTS;
  }
}

function setLocalQuests(uid: string, quests: Quest[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`life_rpg_quests_${uid}`, JSON.stringify(quests));
  }
}

// ─── User Operations ──────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string,
  avatar: string = '🧙'
): Promise<void> {
  const defaultProfile: UserProfile = {
    uid,
    displayName,
    email,
    avatar,
    createdAt: new Date().toISOString(),
    level: 1,
    totalXP: 0,
    currentXP: 0,
    gold: 100,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    attributes: { strength: 0, intellect: 0, vitality: 0, charisma: 0, endurance: 0 },
    inventory: [],
    badges: [],
    questsCompleted: 0,
  };

  const database = getDb();
  if (database) {
    await setDoc(doc(database, 'users', uid), defaultProfile);
  } else {
    setLocalProfile(uid, defaultProfile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const database = getDb();
  if (database) {
    const snap = await getDoc(doc(database, 'users', uid));
    if (!snap.exists()) return null;
    return { uid, ...snap.data() } as UserProfile;
  }
  return getLocalProfile(uid);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const database = getDb();
  if (database) {
    await updateDoc(doc(database, 'users', uid), updates as Record<string, unknown>);
  } else {
    const existing = getLocalProfile(uid);
    if (existing) {
      setLocalProfile(uid, { ...existing, ...updates });
    }
  }
}

// ─── Quest Operations ─────────────────────────────────────────────────────────

export async function createQuest(
  uid: string,
  data: {
    title: string;
    description: string;
    category: QuestCategory;
    difficulty: Difficulty;
    dueDate: string | null;
  }
): Promise<string> {
  const xpReward = XP_REWARDS[data.difficulty];
  const goldReward = GOLD_REWARDS[data.difficulty];
  const attributeGains = scaledAttributeGains(data.category, data.difficulty);

  const quest = {
    uid,
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    xpReward,
    goldReward,
    attributeReward: attributeGains,
    status: 'pending' as const,
    dueDate: data.dueDate,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  const database = getDb();
  if (database) {
    const ref = await addDoc(collection(database, 'users', uid, 'quests'), quest);
    return ref.id;
  } else {
    const quests = getLocalQuests(uid);
    const newId = 'quest_' + Date.now();
    const newQuest: Quest = { id: newId, ...quest };
    setLocalQuests(uid, [newQuest, ...quests]);
    return newId;
  }
}

export async function getUserQuests(uid: string): Promise<Quest[]> {
  const database = getDb();
  if (database) {
    const q = query(
      collection(database, 'users', uid, 'quests'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quest));
  }
  return getLocalQuests(uid);
}

export async function completeQuest(uid: string, questId: string): Promise<{
  xpGained: number;
  goldGained: number;
  leveledUp: boolean;
  newLevel: number;
}> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');

  const database = getDb();
  let quest: Quest | undefined;

  if (database) {
    const questRef = doc(database, 'users', uid, 'quests', questId);
    const questSnap = await getDoc(questRef);
    if (!questSnap.exists()) throw new Error('Quest not found');
    quest = { id: questId, ...questSnap.data() } as Quest;
  } else {
    const quests = getLocalQuests(uid);
    quest = quests.find((q) => q.id === questId);
  }

  if (!quest) throw new Error('Quest not found');

  const result = calculateQuestRewards(quest.category, quest.difficulty, user.totalXP);

  const updatedAttributes: Attributes = { ...user.attributes };
  Object.entries(result.attributeGains).forEach(([key, val]) => {
    updatedAttributes[key as keyof Attributes] += val as number;
  });

  let newStreak = user.streak;
  const today = new Date().toISOString();
  if (shouldIncrementStreak(user.lastActiveDate)) {
    newStreak = user.streak + 1;
  }

  const newTotalXP = user.totalXP + result.xpGained;
  const newLevel = levelFromTotalXP(newTotalXP);

  if (database) {
    const questRef = doc(database, 'users', uid, 'quests', questId);
    await Promise.all([
      updateDoc(questRef, {
        status: 'completed',
        completedAt: today,
      }),
      updateDoc(doc(database, 'users', uid), {
        totalXP: newTotalXP,
        gold: user.gold + result.goldGained,
        level: newLevel,
        attributes: updatedAttributes,
        streak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActiveDate: today,
        questsCompleted: user.questsCompleted + 1,
      }),
    ]);
  } else {
    const quests = getLocalQuests(uid);
    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, status: 'completed' as const, completedAt: today } : q
    );
    setLocalQuests(uid, updatedQuests);
    setLocalProfile(uid, {
      ...user,
      totalXP: newTotalXP,
      gold: user.gold + result.goldGained,
      level: newLevel,
      attributes: updatedAttributes,
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: today,
      questsCompleted: user.questsCompleted + 1,
    });
  }

  return {
    xpGained: result.xpGained,
    goldGained: result.goldGained,
    leveledUp: result.levelUp.leveled,
    newLevel,
  };
}

export async function deleteQuest(uid: string, questId: string): Promise<void> {
  const database = getDb();
  if (database) {
    await deleteDoc(doc(database, 'users', uid, 'quests', questId));
  } else {
    const quests = getLocalQuests(uid);
    setLocalQuests(uid, quests.filter((q) => q.id !== questId));
  }
}

export async function updateQuest(
  uid: string,
  questId: string,
  updates: Partial<Quest>
): Promise<void> {
  const database = getDb();
  if (database) {
    await updateDoc(doc(database, 'users', uid, 'quests', questId), updates as Record<string, unknown>);
  } else {
    const quests = getLocalQuests(uid);
    const updatedQuests = quests.map((q) => (q.id === questId ? { ...q, ...updates } : q));
    setLocalQuests(uid, updatedQuests);
  }
}

// ─── Shop Operations ──────────────────────────────────────────────────────────

export async function getShopItems(): Promise<ShopItem[]> {
  const database = getDb();
  if (database) {
    try {
      const snap = await getDocs(collection(database, 'shop_items'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShopItem));
      }
    } catch {
      // Fall back to default shop items on query fail
    }
  }
  return SHOP_ITEMS;
}

export async function purchaseItem(uid: string, item: ShopItem): Promise<void> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  if (user.gold < item.cost) throw new Error('Insufficient gold');
  if (user.inventory.includes(item.id)) throw new Error('Already owned');

  const database = getDb();
  if (database) {
    await updateDoc(doc(database, 'users', uid), {
      gold: user.gold - item.cost,
      inventory: [...user.inventory, item.id],
    });
  } else {
    setLocalProfile(uid, {
      ...user,
      gold: user.gold - item.cost,
      inventory: [...user.inventory, item.id],
    });
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const database = getDb();
  if (database) {
    try {
      const q = query(collection(database, 'users'), orderBy('totalXP', 'desc'), limit(50));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            displayName: data.displayName,
            avatar: data.avatar,
            level: data.level,
            totalXP: data.totalXP,
            questsCompleted: data.questsCompleted,
          } as LeaderboardEntry;
        });
      }
    } catch {
      // Fall through to default mock leaderboard
    }
  }

  return [
    { uid: 'lb-1', displayName: 'Aria the Starlight', avatar: '🧙‍♀️', level: 12, totalXP: 3450, questsCompleted: 48 },
    { uid: 'lb-2', displayName: 'Kaelen Shadowblade', avatar: '🥷', level: 10, totalXP: 2890, questsCompleted: 39 },
    { uid: 'lb-3', displayName: 'Valiant Adventurer (You)', avatar: '⚔️', level: 3, totalXP: 450, questsCompleted: 7 },
    { uid: 'lb-4', displayName: 'Elena Highsong', avatar: '🧝‍♀️', level: 8, totalXP: 1920, questsCompleted: 27 },
    { uid: 'lb-5', displayName: 'Balthazar Stone', avatar: '🛡️', level: 6, totalXP: 1200, questsCompleted: 18 },
  ];
}
