import { FiCalendar, FiMail, FiMapPin, FiUsers } from "react-icons/fi";

const STATUS_LABELS = { active: "Active", trial: "Trial", inactive: "Inactive" };

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TenantCard({ tenant }) {
  const { name, slug, email, city, users, plan, status, created, color } = tenant;

  return (
    <article className="mf-tenant-card" style={{ "--mf-tenant-color": color }}>
      <div className="mf-tenant-top">
        <span className="mf-tenant-avatar">{getInitials(name)}</span>
        <div className="mf-tenant-heading">
          <h3 className="mf-tenant-name" title={name}>
            {name}
          </h3>
          <span className="mf-tenant-slug">/{slug}</span>
        </div>
        <span className={`mf-tenant-status mf-tenant-status--${status}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <ul className="mf-tenant-details">
        <li>
          <FiMail size={15} />
          <span title={email}>{email}</span>
        </li>
        <li>
          <FiMapPin size={15} />
          <span>{city}</span>
        </li>
        <li>
          <FiUsers size={15} />
          <span>{users} users</span>
        </li>
        <li>
          <FiCalendar size={15} />
          <span>Joined {created}</span>
        </li>
      </ul>

      <div className="mf-tenant-footer">
        <span className="mf-tenant-plan">{plan} plan</span>
      </div>
    </article>
  );
}
