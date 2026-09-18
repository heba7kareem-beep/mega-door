import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SWIPE_MIN_DISTANCE = 90;
// السحب العمودي يجب أن يبقى صغيراً نسبياً حتى نعتبره سحباً أفقياً مقصوداً
// (وليس تمرير عمودي عادي للصفحة تحرّك فيه الإصبع بزاوية بسيطة).
const MAX_VERTICAL_RATIO = 0.5;

/** يبحث بالعناصر الأب عن أول حاوية قابلة للتمرير أفقياً (كاروسيل بالسحب) حتى لا
 * نتعارض مع سحبها (مثل صف بطاقات الأقسام أو سلايدر الأكثر طلباً بالهاتف). */
function isInsideHorizontalScroller(el: HTMLElement | null): boolean {
  let node = el;
  let depth = 0;
  while (node && depth < 8) {
    if (node.scrollWidth > node.clientWidth + 2) {
      const overflowX = getComputedStyle(node).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return true;
    }
    node = node.parentElement;
    depth++;
  }
  return false;
}

/**
 * سحب بالإصبع من أي مكان بالشاشة من اليمين لليسار يرجع للصفحة السابقة (بالهاتف
 * فقط - لمس حقيقي، لا يتفاعل مع الماوس). يتجاهل السحب الذي يبدأ داخل حاوية
 * قابلة للتمرير أفقياً أو داخل حقل إدخال نص، حتى لا يتعارض مع سحبها الخاص.
 */
export default function SwipeBackGesture() {
  const navigate = useNavigate();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select") || isInsideHorizontalScroller(target)) {
        tracking = false;
        return;
      }
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (dx > -SWIPE_MIN_DISTANCE) return;
      if (Math.abs(dy) > Math.abs(dx) * MAX_VERTICAL_RATIO) return;
      navigate(-1);
    }

    function onTouchCancel() {
      tracking = false;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [navigate]);

  return null;
}
