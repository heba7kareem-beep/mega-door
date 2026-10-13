import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";

/**
 * حاوية سحب أفقي موحّدة لكل السلايدرات ومعارض الصور بالموقع.
 *
 * - الاتجاه: RTL - أول عنصر على اليمين، والعناصر التالية تأتي نحو اليسار (نفس ترتيب الموقع).
 * - بدون تكرار دائري: أول عنصر وآخر عنصر هما الحد الفعلي للتمرير (overscroll-x-contain).
 * - اللمس: تمرير المتصفح الأصلي مع scroll-snap (ناعم + عنصر واحد بكل سحبة)، والتمرير
 *   العمودي للصفحة يبقى طبيعياً (touch-action الافتراضي).
 * - الماوس: سحب يدوي بنفس الحاوية، ثم تثبيت (snap) على أقرب عنصر عند الإفلات.
 * - بدون أسهم وبدون حركة تلقائية.
 */
export default function DragScroller({
  children,
  className = "",
  snap = true,
  scrollerRef,
}: {
  children: ReactNode;
  className?: string;
  snap?: boolean;
  scrollerRef?: Ref<HTMLDivElement>;
}) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);

  function setRefs(node: HTMLDivElement | null) {
    localRef.current = node;
    if (typeof scrollerRef === "function") scrollerRef(node);
    else if (scrollerRef) (scrollerRef as { current: HTMLDivElement | null }).current = node;
  }

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    // بعد سحب بالماوس نمنع النقر على الرابط/الزر اللي انسحبنا من فوقه
    function onClickCapture(e: MouseEvent) {
      if (dragRef.current?.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // يمنع سحب الصورة/الرابط الأصلي من المتصفح
    function onDragStart(e: DragEvent) {
      e.preventDefault();
    }
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  function snapToNearest(el: HTMLDivElement) {
    if (!snap) return;
    // موضع التمرير الفعلي لكل عنصر (مقصوص بحدود الحاوية: أول عنصر 0 وآخر عنصر النهاية)
    // ثم نختار الأقرب للموضع الحالي - نفس منطق scroll-snap الأصلي.
    // بالـ RTL قيمة scrollLeft تبدأ من 0 (أقصى اليمين) وتصير سالبة كلما تقدّمنا لليسار.
    const max = el.scrollWidth - el.clientWidth;
    const current = -el.scrollLeft;
    let best = current;
    let bestDist = Infinity;
    Array.from(el.children).forEach((c) => {
      const child = c as HTMLElement;
      const fromRight = el.scrollWidth - (child.offsetLeft + child.offsetWidth / 2);
      const pos = Math.min(Math.max(fromRight - el.clientWidth / 2, 0), max);
      const d = Math.abs(pos - current);
      if (d < bestDist) {
        bestDist = d;
        best = pos;
      }
    });
    el.scrollTo({ left: -best, behavior: "smooth" });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return; // اللمس يتكفّل به المتصفح
    dragRef.current = { id: e.pointerId, x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id) return;
    const el = e.currentTarget;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return;
      d.moved = true;
      el.style.scrollSnapType = "none"; // أثناء السحب اليدوي نوقف الـ snap حتى ما يقاوم
      el.style.cursor = "grabbing";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* غير مدعوم: السحب يشتغل بدونه */
      }
    }
    el.scrollLeft = d.left - dx;
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id) return;
    const el = e.currentTarget;
    if (!d.moved) {
      dragRef.current = null;
      return;
    }
    el.style.cursor = "";
    snapToNearest(el);
    // نرجّع الـ snap بعد انتهاء الانتقال الناعم، ونفك حجب النقر بعد انتهاء حدث click الحالي
    window.setTimeout(() => {
      el.style.scrollSnapType = "";
    }, 450);
    window.setTimeout(() => {
      dragRef.current = null;
    }, 0);
  }

  return (
    <div
      ref={setRefs}
      dir="rtl"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`scrollbar-hide flex cursor-grab select-none overflow-x-auto overscroll-x-contain ${
        snap ? "snap-x snap-mandatory" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
