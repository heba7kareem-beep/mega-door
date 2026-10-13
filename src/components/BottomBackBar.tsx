import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * شريط رجوع صغير أسفل الشاشة بمحاذاة اليمين (واتساب العائم على اليسار، فما يتداخلون)
 * لصفحات تفاصيل الموديلات: يظهر عند التمرير للأسفل ويختفي عند التمرير للأعلى.
 * - إذا وصل الزائر من داخل الموقع: navigate(-1) فيرجع لنفس القسم بنفس موضع التمرير.
 * - إذا فُتح رابط الموديل مباشرة (ما كو صفحة سابقة داخل الموقع): يرجع لتصنيف الموديل.
 */
export default function BottomBackBar({ fallbackTo }: { fallbackTo: string }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return; // تجاهل الارتجاف الصغير
      setVisible(delta > 0 && y > 40);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goBack() {
    // BrowserRouter يخزّن idx داخل history.state؛ idx > 0 يعني توجد صفحة سابقة بالموقع
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallbackTo);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="الرجوع إلى الموديلات"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-silver/25 bg-surface/90 px-4 py-2.5 text-sm font-bold text-ink shadow-lg shadow-black/20 backdrop-blur transition duration-300 hover:border-brand hover:text-brand active:scale-95 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l7 7-7 7M22 12H2" />
      </svg>
      الموديلات
    </button>
  );
}
