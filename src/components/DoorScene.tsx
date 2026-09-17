import { useId } from "react";

/**
 * مشهد باب توضيحي مرسوم بـ SVG - يُستخدم في الصفحة الرئيسية (الهيرو، سلايدر الأكثر
 * طلباً، ومعاين المُكوِّن "صمم بابك بنفسك") إلى أن تصل صور الأبواب الحقيقية.
 * كل نسخة تولّد معرّفات gradient فريدة عبر useId() حتى لا تتعارض عدة نسخ بنفس الصفحة.
 */
export default function DoorScene({
  tint,
  handleRight = true,
  className,
}: {
  /** لون مميز (hex) يُستخدم كلون الباب وتوهّج الخلفية */
  tint: string;
  /** موضع المقبض: يمين (افتراضي) أو يسار */
  handleRight?: boolean;
  className?: string;
}) {
  const gid = useId().replace(/[:]/g, "");
  const handleX = handleRight ? 216 : 84;

  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="مشهد توضيحي لباب"
      className={className}
    >
      <defs>
        <radialGradient id={`${gid}glow`} cx="62%" cy="30%" r="65%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.55" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070d" />
          <stop offset="100%" stopColor="#0c0f1c" />
        </linearGradient>
        <linearGradient id={`${gid}door`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.95" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${gid}bg)`} />
      <rect width="300" height="400" fill={`url(#${gid}glow)`} />
      <rect x="0" y="330" width="300" height="70" fill="#000" opacity="0.35" />
      <rect x="64" y="58" width="172" height="288" rx="4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
      <rect x="78" y="72" width="144" height="260" rx="3" fill={`url(#${gid}door)`} />
      <line x1="78" y1="150" x2="222" y2="150" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <line x1="78" y1="255" x2="222" y2="255" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <circle cx={handleX} cy="205" r="4.5" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="252" cy="150" rx="18" ry="26" fill={tint} opacity="0.18" />
      <path d="M40 400 C42 330 50 300 46 260 C60 295 66 340 62 400 Z" fill="#12331f" opacity="0.55" />
      <path d="M30 400 C34 350 44 320 38 285 C56 315 60 355 54 400 Z" fill="#0d2417" opacity="0.6" />
    </svg>
  );
}
