# auto-reels — FlutterByMousa

نظام أتمتة كامل لعمل Reels بـ Remotion.

## هيكل المشروع

```
auto-reels/
├── .github/
│   └── workflows/
│       └── render.yml          ← GitHub Actions (render + random template)
├── public/
│   └── assets/
│       ├── data.json           ← n8n بيكتب هنا
│       ├── Elevsound/          ← ملفات الصوت من ElevenLabs
│       │   ├── scene_01.mp3
│       │   ├── scene_02.mp3
│       │   └── ...
│       └── sfx/                ← sound effects (اختياري)
├── src/
│   ├── index.ts                ← entry point
│   ├── Root.tsx                ← Remotion composition + calculateMetadata
│   ├── MyVideo.tsx             ← كل الـ templates والـ scenes
│   ├── TypewriterWithPen.tsx   ← typewriter animation component
│   └── style.css               ← Google Fonts + CSS reset
├── package.json
├── tsconfig.json
├── remotion.config.ts
└── .gitignore
```

## الـ Templates المتاحة

| ID          | الوصف                          |
|-------------|-------------------------------|
| `terminal`  | VS Code dark — الافتراضي      |
| `notebook`  | Neon notebook بـ graph paper  |
| `cinematic` | فيلم cinematic مع letterbox   |
| `splitview` | مقارنة بين شيئين              |

## أنواع المشاهد (type)

| type    | الحقول الإجبارية              |
|---------|-------------------------------|
| `intro` | `title` أو `content`          |
| `text`  | `content`, `badge`            |
| `code`  | `code`, `title`               |
| `tip`   | `content`, `badge`            |
| `fact`  | `content`, `stat`             |

## الألوان المتاحة (color)

`c-cyan` · `c-purple` · `c-green` · `c-orange` · `c-pink` · `c-blue` · `c-teal` · `c-amber`

## الـ Flow الكامل

```
n8n يبني scenes[]
    ↓
يكتب public/assets/data.json على GitHub (PUT API)
    ↓
GitHub Actions يشتغل تلقائياً (on: push)
    ↓
يختار template عشوائي من الـ 4
    ↓
يحقن الـ template في كل scene
    ↓
remotion render (--gl=swiftshader للـ headless)
    ↓
يرفع الفيديو كـ GitHub Artifact (7 أيام)
```

## معادلة الـ Duration

```
// text/tip/fact (عربي):
duration = ceil((wordCount / 1.8) * 30) + 20 frames

// code:
duration = lines * 22 + 60 frames

// intro:
duration = 150 frames (5 ثواني ثابت)

// لو في voiceFile:
duration = max(audioFrames + 20, textFrames)
```

## تشغيل محلي

```bash
npm install
npm start        # Remotion Studio على localhost:3000
npm run build    # render مباشر
```

## إضافة ملفات الصوت

ارفع ملفات الـ mp3 على:
`public/assets/Elevsound/scene_XX.mp3`

وحط اسم الملف في الـ `voiceFile` field في data.json.
