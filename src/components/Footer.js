import { FiActivity, FiShield, FiHeadphones } from "react-icons/fi";

// TODO: point these at real pages once they exist.
const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Support", href: "#", icon: FiHeadphones },
];

export default function Footer() {
  return (
    <footer className="mf-footer">
      <div className="mf-footer-brand">
        <span className="mf-footer-pulse" aria-hidden="true">
          <FiActivity size={14} />
        </span>
        <span>
          &copy; {new Date().getFullYear()} <strong>MediFlow</strong> · Healthcare
          Operations Platform
        </span>
      </div>

      <div className="mf-footer-note">
        <FiShield size={13} aria-hidden="true" />
        <span>Patient data is confidential — handle with care</span>
      </div>

      <nav className="mf-footer-links" aria-label="Footer">
        {FOOTER_LINKS.map(({ label, href, icon: Icon }) => (
          <a key={label} href={href} className="mf-footer-link">
            {Icon && <Icon size={13} aria-hidden="true" />}
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
