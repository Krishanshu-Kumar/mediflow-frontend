import { FiCalendar, FiCheck, FiEdit2, FiHash } from "react-icons/fi";

// The API has no tenant colour, so each tenant gets a stable one picked from its id.
const TENANT_COLORS = [
  "#0d9488", "#16a34a", "#6366f1", "#e1306c", "#2563eb",
  "#dc2626", "#0891b2", "#7c3aed", "#f97316", "#ca8a04",
];

const pickColor = (id) => {
  const hash = [...String(id)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TENANT_COLORS[hash % TENANT_COLORS.length];
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/**
 * `onStatusChange(tenant, isActive)` runs when the Active switch is flipped; `onEdit(tenant)`
 * when the pencil button is clicked.
 */
export default function TenantCard({ tenant, onStatusChange, onEdit, statusDisabled = false }) {
  const { id, name, slug, plan, is_active: isActive, created_at: createdAt } = tenant;
  const status = isActive ? "active" : "inactive";
  const planName = plan?.display_name ?? "Unknown";

  return (
    <article className="mf-tenant-card" style={{ "--mf-tenant-color": pickColor(id) }}>
      <div className="mf-tenant-top">
        <span className="mf-tenant-avatar">{getInitials(name)}</span>
        <div className="mf-tenant-heading">
          <h3 className="mf-tenant-name" title={name}>
            {name}
          </h3>
          <span className="mf-tenant-slug">/{slug}</span>
        </div>
        <span className={`mf-tenant-status mf-tenant-status--${status}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
        <button
          type="button"
          className="mf-tenant-edit"
          onClick={() => onEdit?.(tenant)}
          aria-label={`Edit ${name}`}
          title="Edit tenant"
        >
          <FiEdit2 size={14} />
        </button>
      </div>

      <ul className="mf-tenant-details">
        <li>
          <FiHash size={15} />
          <span title={id}>{id.slice(0, 8)}</span>
        </li>
        <li>
          <FiCalendar size={15} />
          <span>Joined {formatDate(createdAt)}</span>
        </li>
      </ul>

      <div className="mf-tenant-footer">
        <span className="mf-tenant-plan">{planName} plan</span>
        <label className={`mf-switch${isActive ? " is-on" : ""}`} title="Set tenant status">
          <span className="mf-switch-label">{isActive ? "Active" : "Inactive"}</span>
          <input
            type="checkbox"
            role="switch"
            className="mf-switch-input"
            checked={isActive}
            disabled={statusDisabled}
            onChange={(event) => onStatusChange?.(tenant, event.target.checked)}
            aria-label={`${name} active`}
          />
          <span className="mf-switch-track" aria-hidden="true">
            <span className="mf-switch-thumb">
              <FiCheck size={10} strokeWidth={3.5} />
            </span>
          </span>
        </label>
      </div>
    </article>
  );
}
