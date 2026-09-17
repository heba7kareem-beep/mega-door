import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();

  // ترتيب الروابط بالـ DOM يطابق المرجع المعتمد: في RTL يظهر أول عنصر بالـ DOM
  // أقصى اليسار وآخر عنصر أقصى اليمين، لذا "الرئيسية" هي آخر رابط لتظهر أقصى اليمين بجانب الشعار.
  // الأقسام نفسها ديناميكية (تُدار من لوحة الإدارة) فتُبنى القائمتان من useCategories().
  const categoryLinks = categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false }));
  const desktopNavLinks = [...categoryLinks, { to: "/", label: "الرئيسية", end: true }];
  const mobileNavLinks = [{ to: "/", label: "الرئيسية", end: true }, ...categoryLinks];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/[0.86] backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ميكا للأبواب - الرئيسية">
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-base font-extrabold tracking-tight text-ink">MEGA DOOR</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {desktopNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }) =>
                `relative pb-1 text-sm font-semibold transition ${
                  isActive
                    ? "text-brand after:absolute after:inset-x-0 after:-bottom-[3px] after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-ink/70 hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="rounded-lg border border-border p-1.5 text-ink md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3.5 md:hidden sm:px-6">
          <nav className="flex flex-col gap-3.5">
            {mobileNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm font-semibold ${isActive ? "text-brand" : "text-ink/80"}`
                }
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
