import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative shrink-0 whitespace-nowrap pb-1 text-xs font-semibold transition ${
    isActive
      ? "text-brand after:absolute after:inset-x-0 after:-bottom-[3px] after:h-0.5 after:rounded-full after:bg-brand"
      : "text-ink/70 hover:text-ink"
  }`;

export default function Header() {
  const categories = useCategories();

  // بطلب صريح: الأقسام تظهر جهة اليمين والشعار جهة اليسار (بكل الأحجام بما فيها
  // الهاتف)، لذا صار عنصر <nav> أول شيء بالـ DOM (يظهر أقصى اليمين بـ RTL)
  // والشعار آخر عنصر (يظهر أقصى اليسار).
  //
  // بالهاتف (أقل من lg) الهيدر يُبسَّط لرابط "الرئيسية" فقط - بقية الأقسام
  // انتقلت لصف البطاقات الكبيرة تحت الهيرو مباشرة (انظر HomePage). من lg
  // فأكبر تظهر كل الأقسام بصف واحد كما كانت.
  const categoryLinks = categories.map((c) => ({ to: `/${c.id}`, label: c.label }));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/[0.86] backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-8 px-4 py-2 sm:px-6">
        <nav
          className="scrollbar-hide flex min-w-0 items-center gap-3 overflow-x-auto sm:gap-4"
          aria-label="أقسام الموقع"
        >
          <NavLink to="/" end className={linkClass}>
            الرئيسية
          </NavLink>
          <div className="hidden items-center gap-3 lg:flex lg:gap-4">
            {categoryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ميكا للأبواب - الرئيسية">
          <span className="hidden font-display text-base font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-14 w-14 object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
