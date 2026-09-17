import { Link } from "react-router-dom";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { trackContact } from "../lib/metaPixel";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-canvas">
      <div className="mx-auto flex max-w-content flex-col items-start gap-3 px-4 py-10 text-right sm:px-6">
        <Link to="/" className="text-sm text-muted transition hover:text-brand-dark">
          لماذا ميكا
        </Link>
        <Link to="/" className="text-sm text-muted transition hover:text-brand-dark">
          من نحن
        </Link>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted transition hover:text-brand-dark"
        >
          فيسبوك
        </a>
        <a
          href="https://instagram.com/mega_door"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted transition hover:text-brand-dark"
        >
          إنستغرام
        </a>
        <a
          href={buildGeneralWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("footer_link")}
          className="text-sm text-muted transition hover:text-brand-dark"
        >
          واتساب
        </a>
        <span dir="ltr" className="text-sm text-muted" style={{ unicodeBidi: "plaintext" }}>
          07751420001
        </span>
        <span className="text-sm text-muted">بغداد - السيدية مقابل سايلو الدورة</span>
      </div>
      <div className="border-t border-border px-4 py-3.5 text-left text-xs text-muted sm:px-6">
        © MEGA DOOR — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
