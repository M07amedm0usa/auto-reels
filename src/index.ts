import { registerRoot } from 'remotion'; // [تم التصحيح]
import { RemotionRoot } from './Root';

// 1. استدعاء الخطوط المستخدمة في مشروعك
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";

// 2. إجبار المتصفح على تحميل الخطوط بأوزانها الصحيحة قبل أي ريندر
// Cairo محتاجينه Bold جداً للـ Headlines
loadCairo({
  weights: ["700", "900"],
});

// JetBrains محتاجينه للكود والـ HUD
loadJetBrains({
  weights: ["400", "700", "800"],
});

// Caveat للـ Notebook Template
loadCaveat({
  weights: ["700"],
});

// Bebas Neue للـ Cinematic Template
loadBebasNeue();

// 3. تسجيل الفيديو النهائي
registerRoot(RemotionRoot);
