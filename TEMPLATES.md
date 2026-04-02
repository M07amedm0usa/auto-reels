# الـ 15 Template وإزاي تستخدمهم

## الـ Rotation الأوتوماتيك
لو مش حاطط `template` في الـ scene، بيدور تلقائي:
- فيديو 1 → terminal
- فيديو 2 → splitview
- فيديو 3 → notebook
- وهكذا...

## تحديد Template يدوي
```json
{ "type": "text", "template": "glass", "content": "..." }
```

## الـ 15 Template

| # | ID | الوصف |
|---|---|---|
| 1 | `terminal` | VS Code dark terminal |
| 2 | `splitview` | مقارنة بين حاجتين |
| 3 | `notebook` | دفتر neon على graph paper |
| 4 | `cinematic` | سينمائي letterbox |
| 5 | `hologram` | هولوغرام مضيء مع hex rings |
| 6 | `blueprint` | تصميم هندسي blueprint |
| 7 | `glass` | Glassmorphism frosted card |
| 8 | `retrocrt` | شاشة CRT قديمة phosphor |
| 9 | `neonsign` | نيون بيومض |
| 10 | `newspaper` | جريدة كلاسيكية |
| 11 | `darkminimal` | minimal أسود مع خط accent |
| 12 | `cardstack` | كروت متراكمة gradient |
| 13 | `vaporwave` | Retrowave sun + grid |
| 14 | `infographic` | Stats + checklist مرتب |
| 15 | `comic` | بانيل كوميك مع speech bubble |

## الـ Seamless Transitions
- كل مشهد بيعمل **crossfade** مع اللي بعده (~0.6 ثانية overlap)
- مش محتاج تعمل حاجة — اتعمل أوتوماتيك في `MyVideo.tsx`

## مثال data.json
```json
[
  {
    "type": "intro",
    "title": "عنوان الفيديو",
    "content": "السطر الأول هو العنوان\nالسطر التاني هو الوصف",
    "color": "c-cyan"
  },
  {
    "type": "code",
    "title": "main.dart",
    "code": "Text('Hello')",
    "color": "c-purple"
  }
]
```

## الألوان المتاحة
`c-cyan` `c-purple` `c-green` `c-orange` `c-pink` `c-blue`
