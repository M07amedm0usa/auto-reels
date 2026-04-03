import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

// 1. استدعاء الخطوط المستخدمة في مشروعك
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";

// 2. تحميل الخطوط (سيبنا الأقواس فاضية عشان نتجنب الـ Object Error)
loadCairo();
loadJetBrains();
loadCaveat();
loadBebasNeue();

// 3. تسجيل الفيديو
registerRoot(RemotionRoot);
