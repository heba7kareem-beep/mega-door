import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

// رابط نشط: خلفية "pill" خفيفة + لون مميز (مو باللون فقط)، وhover بتغيّر لوني تدريجي للروابط غير النشطة
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/70 hover:bg-white/5 hover:text-ink"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/80 hover:bg-white/5 hover:text-ink"
  }`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();

  // تخطيط ثلاثي متوازن عبر CSS grid: الشعار (يمين)، روابط التنقل (وسط)،
  // والهمبرغر بالفون (يسار) - عمودا الشعار والهمبرغر بنفس العرض (1fr) حتى
  // تبقى روابط التنقل بمنتصف الهيدر فعلياً بالحاسبة. بما إن dir=rtl فأول
  // عمود بالـ grid يظهر أقصى اليمين تلقائياً وآخر عمود أقصى اليسار.
  const navLinks = [
    { to: "/", label: "الرئيسية", end: true },
    ...categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
      <div className="mx-auto grid max-w-content grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-2.5 sm:px-6">
        {/* الشعار - أقصى اليمين. col-start صريح لأن nav يختفي (display:none)
            بالفون، وبدونه كان الـ auto-placement يزحف الهمبرغر لمنتصف
            الشبكة بدل عمودها الثالث. */}
        <Link
          to="/"
          className="col-start-1 flex shrink-0 items-center gap-2 justify-self-start"
          aria-label="ميكا للأبواب - الرئيسية"
        >
          <span className="hidden font-display text-base font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-12 w-12 object-contain"
          />
        </Link>

        {/* روابط التنقل - وسط الهيدر فعلياً، بالحاسبة فقط */}
        <nav className="col-start-2 hidden items-center justify-center gap-2 lg:flex" aria-label="أقسام الموقع">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* الهمبرغر - أقصى اليسار، بالفون فقط */}
        <div className="col-start-3 flex shrink-0 items-center justify-self-end">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            className="rounded-lg border border-border p-2 text-ink transition hover:border-brand hover:text-brand lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* قائمة الهمبرغر بالفون */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden sm:px-6">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
