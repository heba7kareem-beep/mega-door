import { useEffect, useLayoutEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const TRACK_TRANSITION = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * نظام كاروسيل موحّد للصور (يُستخدم بمعرض الموديل، وقابل لإعادة الاستخدام بأي مكان):
 * - كل الصور بشريط واحد جنب بعض (محمّلة مسبقاً)، والانتقال = تغيير موضع الشريط فقط
 *   بـ transform واحد (CSS) بدون إضافة/حذف عناصر ولا مؤقتات - خفيف على الفونات الضعيفة.
 * - الاتجاه: سحب لليسار = التالية، سحب لليمين = السابقة. توقف تام عند أول وآخر صورة
 *   (بدون تكرار دائري ولا حركة تلقائية ولا أسهم).
 * - لمس + ماوس. التمرير العمودي للصفحة يبقى طبيعياً (touch-action: pan-y).
 * - يتحمّل سحب الإبهام القطري، والـ flick القصير السريع ينتقل مثل السحبة الطويلة.
 * - التحكم بالصورة الحالية من الخارج (index/onIndexChange) حتى تتزامن المصغّرات وغيرها.
 * - resetKey: عند تغيّره (موديل جديد) يُضبط الموضع فوراً بدون حركة.
 */
export default function SwipeCarousel({
  images,
  index,
  onIndexChange,
  getAlt,
  resetKey,
  className = "",
}: {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  getAlt: (i: number) => string;
  resetKey?: string;
  className?: string;
}) {
  const count = images.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ id: number; x: number; y: number; t: number; lock: "x" | null } | null>(null);
  const lastKeyRef = useRef<string | undefined>(undefined);

  const frameWidth = () => frameRef.current?.clientWidth ?? 300;

  // موضع الشريط للصورة النشطة (أول عرض/موديل جديد: بدون حركة، وغير ذلك: انزلاق ناعم)
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const instant = lastKeyRef.current !== resetKey;
    lastKeyRef.current = resetKey;
    track.style.transition = instant ? "none" : TRACK_TRANSITION;
    track.style.transform = `translate3d(${-index * frameWidth()}px,0,0)`;
  }, [index, resetKey]);

  // تدوير الجهاز/تغيير العرض: إعادة ضبط الموضع بدون حركة
  useEffect(() => {
    function onResize() {
      const track = trackRef.current;
      if (!track) return;
      track.style.transition = "none";
      track.style.transform = `translate3d(${-index * frameWidth()}px,0,0)`;
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    swipeRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), lock: null };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = swipeRef.current;
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.lock) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < 6 && ay < 10) return;
      // سحب الإبهام قطري بطبيعته: نقبله أفقياً حتى زاوية ~55°، ونسلّمه للصفحة فقط
      // إذا صار عمودياً بوضوح، وإلا ننتظر حركة أوضح.
      if (ay > 10 && ay > ax * 1.6) {
        swipeRef.current = null;
        return;
      }
      if (ax < 6 || ax < ay * 0.6) return;
      s.lock = "x";
      try {
        frameRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* بعض المتصفحات ترفض الالتقاط - السحب يشتغل بدونه */
      }
      if (trackRef.current) trackRef.current.style.transition = "none";
    }
    const target = index + (dx > 0 ? -1 : 1);
    const atEdge = target < 0 || target >= count;
    const track = trackRef.current;
    // أثناء السحب نحرّك الشريط مباشرة بالـ DOM (بدون React re-render)، مع مقاومة عند الأطراف
    if (track) track.style.transform = `translate3d(${-index * frameWidth() + (atEdge ? dx * 0.3 : dx)}px,0,0)`;
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s || e.pointerId !== s.id || s.lock !== "x") return;
    const dx = e.clientX - s.x;
    const width = frameWidth();
    const target = index + (dx > 0 ? -1 : 1);
    const elapsed = Math.max(performance.now() - s.t, 1);
    const fast = Math.abs(dx) > 14 && Math.abs(dx) / elapsed > 0.25;
    const passed = e.type === "pointerup" && (Math.abs(dx) > Math.min(36, width * 0.12) || fast);

    if (passed && target >= 0 && target < count) {
      onIndexChange(target); // الـ layout effect ينقل الشريط بحركة ناعمة
      return;
    }
    const track = trackRef.current; // ترجع لمكانها
    if (track) {
      track.style.transition = TRACK_TRANSITION;
      track.style.transform = `translate3d(${-index * width}px,0,0)`;
    }
  }

  return (
    <div
      ref={frameRef}
      data-swipe-gallery
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      style={{ touchAction: "pan-y pinch-zoom" }}
      className={`select-none overflow-hidden ${className}`.trim()}
    >
      <div ref={trackRef} dir="ltr" className="relative h-full w-full" style={{ willChange: "transform" }}>
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === index ? getAlt(i) : ""}
            aria-hidden={i !== index}
            draggable={false}
            decoding="async"
            style={{ transform: `translate3d(${i * 100}%,0,0)` }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ))}
      </div>
    </div>
  );
}
