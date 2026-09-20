import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/80 hover:bg-white/5 hover:text-ink"
  }`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();

  // همبرغر ثابت أقصى اليمين وشعار ثابت أقصى اليسار بكل القياسات (فون
  // وحاسبة على حد سواء - بطلب صريح). روابط التنقل تظهر فقط داخل القائمة
  // المنسدلة تحت الهيدر عند فتح الهمبرغر، ما فيه نسخة نصية ظاهرة بالهيدر نفسه.
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
          className="rounded-lg border border-border p-2 text-ink transition hover:border-brand hover:text-brand"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label="ميكا للأبواب - الرئيسية">
          <span className="hidden font-display text-sm font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-10 w-10 object-contain"
          />
        </Link>
      </div>

      {/* قائمة الهمبرغر - نفس السلوك بكل القياسات */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 sm:px-6">
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
