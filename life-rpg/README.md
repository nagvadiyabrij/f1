# ⚔️ Life RPG — Turn Your Life Into an Adventure

> A full-stack gamified productivity app where real-world tasks become epic quests, XP powers your character, and Gold funds a reward shop.

![Life RPG Banner](https://img.shields.io/badge/Life_RPG-Fantasy_Theme-gold?style=for-the-badge&logo=dragon)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)

## 🎮 Live Demo

🔗 **[Life RPG deployment](https://life-fuczen3ll-secure-vision-cyber-defense-cctv-soc-advanced.vercel.app)**

## 📹 Demo Video

🎥 **[Watch the walkthrough](https://drive.google.com/file/d/1JKvTp5mtvStDw-2W6-Etu9sBFFimz5XZ/view?usp=drive_link)** — Signup, quests, leveling up, data persistence proof

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email/Password + Google OAuth via Firebase |
| ⚔️ **Quests** | Create, complete, edit, delete tasks with categories & difficulty |
| 📈 **XP System** | Non-linear leveling: `XP = 100 × level^1.5` |
| 🏆 **Attributes** | 5 stats (Strength, Intellect, Vitality, Charisma, Endurance) boosted by task category |
| 🔥 **Streaks** | Daily activity streaks tracked in real-time |
| 💰 **Gold & Shop** | Earn Gold, spend it on themes, badges, avatars |
| 🌍 **Leaderboard** | Global rankings across all adventurers |
| 📱 **Responsive** | Fully mobile-responsive, keyboard accessible |
| ⚡ **Optimistic UI** | Instant feedback, loading skeletons, no lag |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Hosting**: Vercel

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- A Firebase project (free at [console.firebase.google.com](https://console.firebase.google.com))
- A GitHub account

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/life-rpg.git
cd life-rpg
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project named `life-rpg`
3. Enable **Authentication** → Email/Password + Google
4. Enable **Firestore Database** → Start in test mode
5. Go to Project Settings → Your Apps → Web app → Copy `firebaseConfig`

### 4. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in your Firebase keys from step 3.

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 6. Generate the demo video
With the app running locally, open another terminal and run:
```bash
npm run video
```
The generated walkthrough is saved to `public/demo.webm`.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, Register
│   ├── dashboard/         # Main hub
│   ├── quests/            # Quest board
│   ├── character/         # Character sheet
│   ├── shop/              # Reward shop
│   ├── leaderboard/       # Global rankings
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Firebase, RPG engine, utilities
└── types/                 # TypeScript interfaces
```

---

## 🎯 RPG Mechanics

### Leveling System
```
XP required for level N = 100 × N^1.5
Level 1 → 2: 141 XP
Level 5 → 6: 548 XP  
Level 10 → 11: 1,048 XP
```

### Quest Rewards
| Difficulty | XP | Gold |
|---|---|---|
| Easy | 25 | 5 |
| Medium | 75 | 15 |
| Hard | 150 | 30 |
| Epic | 300 | 60 |

### Attribute Mapping
| Category | Primary Stat | Secondary Stat |
|---|---|---|
| Fitness | Strength | Vitality |
| Study | Intellect | — |
| Coding | Intellect | Charisma |
| Social | Charisma | — |
| Health | Vitality | Endurance |
| Creative | Charisma | Intellect |
| Work | Endurance | Intellect |

---

## 🤝 Contributing

Pull requests welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📜 License

MIT © 2026 Life RPG
