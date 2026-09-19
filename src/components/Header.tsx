import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

// رابط نشط: خلفية "pill" خفيفة + لون مميز (مو باللون فقط)، وhover بتغيّر لوني تدريجي للروابط غير النشطة
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/70 hover:bg-white/5 hover:text-ink"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/80 hover:bg-white/5 hover:text-ink"
  }`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();

  // بالفون: همبرغر أقصى اليمين (order-first) + شعار أقصى اليسار (order-last)،
  // وروابط التنقل تختفي داخل قائمة منسدلة تحت الهيدر. بالحاسبة (lg): الهمبرغر
  // يختفي، الشعار يرجع أقصى اليمين (lg:order-first)، والروابط تظهر بالنص
  // وتتوسط الهيدر (lg:flex-1 + lg:justify-center).
  const navLinks = [
    { to: "/", label: "الرئيسية", end: true },
    ...categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
          className="order-first rounded-lg border border-border p-2 text-ink transition hover:border-brand hover:text-brand lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <Link
          to="/"
          className="order-last flex shrink-0 items-center gap-1.5 lg:order-first"
          aria-label="ميكا للأبواب - الرئيسية"
        >
          <span className="hidden font-display text-sm font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-10 w-10 object-contain lg:h-12 lg:w-12"
          />
        </Link>

        <nav
          className="hidden items-center gap-2 lg:flex lg:flex-1 lg:justify-center"
          aria-label="أقسام الموقع"
        >
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* قائمة الهمبرغر بالفون */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden sm:px-6">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={mobileLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
