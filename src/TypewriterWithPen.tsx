import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Props {
  text: string;
  frameOffset?: number;
  color?: string;
  fontSize?: number;
}

export const TypewriterWithPen: React.FC<Props> = ({
  text,
  frameOffset = 0,
  color = '#00FFB2',
  fontSize = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isRTL = /[\u0600-\u06FF]/.test(text);
  const chars  = [...text]; // Unicode-safe split (مهم للعربي)
  const total  = chars.length;

  // سرعة الكتابة: حرف كل 1.5 frame
  const revealed = interpolate(
    Math.max(0, frame - frameOffset),
    [0, total * 1.5],
    [0, total],
    { extrapolateRight: 'clamp' }
  );

  const visibleChars = Math.floor(revealed);
  const cursorVisible = revealed < total;

  // spring للـ container كله
  const containerP = spring({
    frame: Math.max(0, frame - frameOffset),
    fps,
    config: { damping: 24, stiffness: 90, mass: 0.8 },
  });

  return (
    <div
      style={{
        fontFamily: 'Cairo, sans-serif',
        fontWeight: 900,
        fontSize,
        color: '#fff',
        direction: isRTL ? 'rtl' : 'ltr',
        lineHeight: 1.55,
        opacity: interpolate(containerP, [0, 0.4, 1], [0, 0.6, 1]),
        transform: `translateY(${(1 - containerP) * 30}px)`,
        wordBreak: 'break-word',
      }}
    >
      {chars.slice(0, visibleChars).join('')}
      {cursorVisible && (
        <span
          style={{
            color,
            opacity: Math.sin(frame * 0.35) > 0 ? 1 : 0,
            fontWeight: 900,
            textShadow: `0 0 12px ${color}`,
            marginInlineStart: 4,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
