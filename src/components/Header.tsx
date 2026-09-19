import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { trackContact } from "../lib/metaPixel";

// رابط نشط: خلفية "pill" خفيفة + لون مميز (مو باللون فقط)، وhover بتغيّر لوني تدريجي للروابط غير النشطة
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/70 hover:bg-white/5 hover:text-ink"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/80 hover:bg-white/5 hover:text-ink"
  }`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 0 1-1.26-4.25c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.53-3.68 8.07-8.24 8.07Zm4.52-6.15c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.06-.39-2.01-1.24-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
  </svg>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();

  // تخطيط ثلاثي متوازن عبر CSS grid: الشعار (يمين)، روابط التنقل (وسط، تختفي
  // خلف قائمة الهمبرغر بالفون)، وزر واتساب + الهمبرغر (يسار). بما إن dir=rtl
  // فأول عمود بالـ grid يظهر أقصى اليمين تلقائياً وآخر عمود أقصى اليسار.
  const navLinks = [
    { to: "/", label: "الرئيسية", end: true },
    ...categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
      <div className="mx-auto grid max-w-content grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 sm:px-6">
        {/* الشعار - أقصى اليمين */}
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ميكا للأبواب - الرئيسية">
          <span className="hidden font-display text-base font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-12 w-12 object-contain"
          />
        </Link>

        {/* روابط التنقل - وسط الهيدر، بالحاسبة فقط */}
        <nav className="hidden items-center justify-center gap-2 lg:flex" aria-label="أقسام الموقع">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* واتساب + الهمبرغر - أقصى اليسار */}
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact("header_button")}
            aria-label="تواصل معنا عبر واتساب"
            className="flex items-center gap-2 rounded-full bg-whatsapp px-3.5 py-2 text-white transition hover:brightness-105 sm:px-4"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            <span className="hidden text-sm font-bold sm:inline">تواصل واتساب</span>
          </a>

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
