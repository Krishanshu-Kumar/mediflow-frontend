"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiHome,
  FiMail,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSlash,
  FiToggleRight,
  FiTool,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useRoles } from "@/api/role/roleApi";
import { useTenants } from "@/api/tenant/tenantApi";
import { useUsers } from "@/api/user/userApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;
const MAX_TABS = 5;
const ALL_ROLES = "all";
// Status filter choices; `isActive` is what gets sent to the API (undefined = no filter).
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses", isActive: undefined },
  { value: "active", label: "Active", isActive: true },
  { value: "inactive", label: "Inactive", isActive: false },
];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

const displayName = (user) => user?.full_name ?? user?.name ?? user?.email ?? "";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Active/Inactive status. The compact pill is used in rows; `card` is the larger two-line
// capsule (icon, caption, value) used in the profile header.
function StatusBadge({ active, card = false }) {
  if (!card) {
    return (
      <span className={`mf-staff-pill ${active ? "is-on" : "is-off"}`}>
        <i aria-hidden="true" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }
  return (
    <div className={`mf-staff-status ${active ? "is-on" : "is-off"}`}>
      <span className="mf-staff-status-icon">
        {active ? <FiCheck size={16} strokeWidth={3} /> : <FiSlash size={15} />}
      </span>
      <span className="mf-staff-status-text">
        <span>Account status</span>
        <strong>{active ? "Active" : "Inactive"}</strong>
      </span>
    </div>
  );
}

// Tabs above the card. A tab with `sections` lists grouped [label, value, icon] rows for the
// selected user; a tab without them shows the "under construction" placeholder.
const STAFF_TABS = [
  {
    key: "profile",
    label: "Profile",
    icon: FiUser,
    sections: (user) => [
      {
        title: "Personal information",
        icon: FiUser,
        rows: [
          ["Full name", displayName(user), FiUser],
          ["Email address", user.email, FiMail],
        ],
      },
      {
        title: "Account details",
        icon: FiShield,
        rows: [
          ["Role", user.role_name, FiBriefcase],
          ["Status", <StatusBadge key="status" active={Boolean(user.is_active)} />, FiToggleRight],
          ["Created", formatDate(user.created_at), FiCalendar],
          ["Last updated", formatDate(user.updated_at), FiRefreshCw],
        ],
      },
    ],
  },
  { key: "access", label: "Role & Access", icon: FiShield },
  { key: "activity", label: "Activity", icon: FiClock },
];

export default function MedicalStaffPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [tabKey, setTabKey] = useState(STAFF_TABS[0].key);
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(ALL_ROLES);
  const [statusKey, setStatusKey] = useState(STATUS_OPTIONS[0].value);
  const toast = useToast();
  const { call: fetchUsers, loading } = useUsers();
  const { call: fetchTenants, loading: tenantsLoading } = useTenants();
  const { call: fetchRoles, loading: rolesLoading } = useRoles();

  // Tenant choices for the dropdown: active tenants only.
  useEffect(() => {
    fetchTenants({ activeOnly: true })
      .then(setTenants)
      .catch((err) => toast.error(err.message, { title: "Couldn't load tenants" }));
  }, [fetchTenants, toast]);

  const tenantOptions = tenants
    .map((tenant) => ({ value: tenant.id, label: tenant.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  // Until one is picked, the first tenant is selected.
  const selectedTenant = tenantOptions.find((o) => o.value === tenantId) ?? tenantOptions[0];
  const selectedTenantId = selectedTenant?.value;

  // The role choices belong to the selected tenant, so they reload whenever it changes.
  useEffect(() => {
    if (!selectedTenantId) return;
    setRoles([]);
    fetchRoles({ skip: 0, limit: 500, tenantId: selectedTenantId })
      .then(({ items }) => setRoles(items))
      .catch((err) => toast.error(err.message, { title: "Couldn't load roles" }));
  }, [fetchRoles, toast, selectedTenantId]);

  const roleOptions = [
    { value: ALL_ROLES, label: "All roles" },
    ...roles
      .map((role) => ({ value: role.id, label: role.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const selectedRole = roleOptions.find((o) => o.value === roleId) ?? roleOptions[0];
  const selectedRoleId = selectedRole.value === ALL_ROLES ? undefined : selectedRole.value;

  // Picking another tenant clears the role, since roles are per tenant.
  const handleTenantChange = (key) => {
    setTenantId(key);
    setRoleId(ALL_ROLES);
    setSelectedId(null);
    setPage(1);
  };

  const selectedStatus = STATUS_OPTIONS.find((o) => o.value === statusKey) ?? STATUS_OPTIONS[0];
  const selectedIsActive = selectedStatus.isActive;

  const handleStatusChange = (key) => {
    setStatusKey(key);
    setSelectedId(null);
    setPage(1);
  };

  const handleRoleChange = (key) => {
    setRoleId(key);
    setSelectedId(null);
    setPage(1);
  };

  // The backend does the paging and tenant filtering; load just the current page.
  useEffect(() => {
    if (!selectedTenantId) return;
    fetchUsers({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      tenantId: selectedTenantId,
      roleId: selectedRoleId,
      isActive: selectedIsActive,
    })
      .then(({ items }) => {
        setUsers(items);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load users" });
      });
  }, [fetchUsers, toast, selectedTenantId, selectedRoleId, selectedIsActive, page, reloadKey]);

  // Until one is clicked (or after changing page), the first listed user is selected.
  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0];
  // The API has no search, so filter the users on the current page here.
  const term = query.trim().toLowerCase();
  const visibleUsers = users.filter((user) =>
    [displayName(user), user.email, user.role_name].some((value) =>
      String(value ?? "").toLowerCase().includes(term),
    ),
  );
  const activeTab = STAFF_TABS.find((tab) => tab.key === tabKey) ?? STAFF_TABS[0];
  // Up to MAX_TABS tabs share the bar; with more, the last slot becomes a "More" menu.
  const hasOverflow = STAFF_TABS.length > MAX_TABS;
  const visibleTabs = hasOverflow ? STAFF_TABS.slice(0, MAX_TABS - 1) : STAFF_TABS;
  const overflowTabs = hasOverflow ? STAFF_TABS.slice(MAX_TABS - 1) : [];
  const overflowActive = overflowTabs.some((tab) => tab.key === activeTab.key);
  // Slot (0-based) the sliding highlight sits under; the More menu is the last slot.
  const activeSlot = overflowActive
    ? visibleTabs.length
    : visibleTabs.findIndex((tab) => tab.key === activeTab.key);

  return (
    <AdminShell
      title="Medical Staff"
      breadcrumbs={getBreadcrumbs("human-resource", "medical-staff")}
    >
      <Loader show={loading || tenantsLoading || rolesLoading} />
      <PageCard
        scrollResetKey={page}
        leading={
          <div className="mf-roles-filters">
            <Dropdown onSelect={handleTenantChange}>
              <Dropdown.Toggle
                as="button"
                type="button"
                className="mf-header-select"
                aria-label="Filter by tenant"
                title="Filter by tenant"
              >
                <span className="mf-header-select-icon">
                  <FiHome size={15} />
                </span>
                <span className="mf-header-select-text">
                  <span className="mf-header-select-caption">Tenant</span>
                  <span className="mf-header-select-value">
                    {selectedTenant?.label ?? "Select tenant"}
                  </span>
                </span>
                <FiChevronDown size={16} className="mf-header-select-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="mf-select-menu mf-header-select-menu"
                popperConfig={{ strategy: "fixed" }}
                renderOnMount
              >
                <div className="mf-header-select-heading">Switch tenant</div>
                <div className="mf-header-select-list">
                  {tenantOptions.map((option) => {
                    const isSelected = option.value === selectedTenant.value;
                    return (
                      <Dropdown.Item
                        key={option.value}
                        eventKey={option.value}
                        active={isSelected}
                        className="mf-select-option"
                      >
                        <span className="mf-header-select-avatar">{initials(option.label)}</span>
                        <span className="mf-header-select-name">{option.label}</span>
                        {isSelected && <FiCheck size={16} />}
                      </Dropdown.Item>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown onSelect={handleRoleChange}>
              <Dropdown.Toggle
                as="button"
                type="button"
                className="mf-header-select"
                aria-label="Filter by role"
                title="Filter by role"
              >
                <span className="mf-header-select-icon">
                  <FiShield size={15} />
                </span>
                <span className="mf-header-select-text">
                  <span className="mf-header-select-caption">Role</span>
                  <span className="mf-header-select-value">{selectedRole.label}</span>
                </span>
                <FiChevronDown size={16} className="mf-header-select-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="mf-select-menu mf-header-select-menu"
                popperConfig={{ strategy: "fixed" }}
                renderOnMount
              >
                <div className="mf-header-select-heading">Filter by role</div>
                <div className="mf-header-select-list">
                  {roleOptions.map((option) => {
                    const isSelected = option.value === selectedRole.value;
                    return (
                      <Dropdown.Item
                        key={option.value}
                        eventKey={option.value}
                        active={isSelected}
                        className="mf-select-option"
                      >
                        <span className="mf-header-select-avatar">{initials(option.label)}</span>
                        <span className="mf-header-select-name">{option.label}</span>
                        {isSelected && <FiCheck size={16} />}
                      </Dropdown.Item>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown onSelect={handleStatusChange}>
              <Dropdown.Toggle
                as="button"
                type="button"
                className="mf-header-select mf-header-select--sm"
                aria-label="Filter by status"
                title="Filter by status"
              >
                <span className="mf-header-select-icon">
                  <FiToggleRight size={15} />
                </span>
                <span className="mf-header-select-text">
                  <span className="mf-header-select-caption">Status</span>
                  <span className="mf-header-select-value">{selectedStatus.label}</span>
                </span>
                <FiChevronDown size={16} className="mf-header-select-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="mf-select-menu mf-header-select-menu"
                popperConfig={{ strategy: "fixed" }}
                renderOnMount
              >
                <div className="mf-header-select-heading">Filter by status</div>
                <div className="mf-header-select-list">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = option.value === selectedStatus.value;
                    return (
                      <Dropdown.Item
                        key={option.value}
                        eventKey={option.value}
                        active={isSelected}
                        className="mf-select-option"
                      >
                        <span className="mf-header-select-name">{option.label}</span>
                        {isSelected && <FiCheck size={16} />}
                      </Dropdown.Item>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        }
      >
        {users.length > 0 ? (
          <div className="mf-staff">
            <aside className="mf-staff-list-panel">
              <div className="mf-staff-list-head">
                <div className="mf-staff-list-title">
                  <h4>
                    <FiUsers size={15} />
                    Team members
                  </h4>
                  <span className="mf-staff-count">{users.length}</span>
                </div>
                <div className="mf-staff-search">
                  <span className="mf-staff-search-icon">
                    <FiSearch size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Find a team member"
                    aria-label="Search members"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {term && (
                    <>
                      <span className="mf-staff-search-count">
                        {visibleUsers.length}/{users.length}
                      </span>
                      <button
                        type="button"
                        className="mf-staff-search-clear"
                        aria-label="Clear search"
                        onClick={() => setQuery("")}
                      >
                        <FiX size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <ul className="mf-staff-list" aria-label="Users">
                {visibleUsers.length === 0 && (
                  <li className="mf-staff-list-empty">No members match &ldquo;{query.trim()}&rdquo;</li>
                )}
                {visibleUsers.map((user, index) => {
                  const isActive = user === selectedUser;
                  return (
                    <li key={user.id ?? index}>
                      <button
                        type="button"
                        className={`mf-staff-item${isActive ? " is-active" : ""}`}
                        onClick={() => setSelectedId(user.id)}
                        aria-current={isActive}
                      >
                        <span className={`mf-staff-avatar${user.is_active ? "" : " is-off"}`}>
                          {initials(displayName(user))}
                        </span>
                        <span className="mf-staff-item-text">
                          <span className="mf-staff-item-name">{displayName(user)}</span>
                          <span className="mf-staff-item-sub">{user.email}</span>
                          {user.role_name && (
                            <span className="mf-staff-item-role">{user.role_name}</span>
                          )}
                        </span>
                        <FiChevronRight size={16} className="mf-staff-item-chevron" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <div className="mf-staff-main">
            <div className="mf-staff-head">
              <header className="mf-staff-hero">
                <span className={`mf-staff-hero-avatar${selectedUser.is_active ? "" : " is-off"}`}>
                  {initials(displayName(selectedUser))}
                </span>
                <div className="mf-staff-hero-text">
                  <h3>{displayName(selectedUser)}</h3>
                  <p>
                    <FiMail size={14} />
                    {selectedUser.email || "No email"}
                  </p>
                </div>
                <StatusBadge card active={Boolean(selectedUser.is_active)} />
              </header>
            <div
              className="mf-staff-tabs"
              role="tablist"
              aria-label="User information"
              style={{ "--n": visibleTabs.length + (hasOverflow ? 1 : 0), "--i": activeSlot }}
            >
              <span className="mf-staff-tabs-indicator" aria-hidden="true" />
              {visibleTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = tab.key === activeTab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`mf-staff-tab${isActive ? " is-active" : ""}`}
                    onClick={() => setTabKey(tab.key)}
                  >
                    <TabIcon size={16} />
                    {tab.label}
                  </button>
                );
              })}
              {overflowTabs.length > 0 && (
                <Dropdown className="mf-staff-more" align="end" onSelect={setTabKey}>
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    className={`mf-staff-tab${overflowActive ? " is-active" : ""}`}
                  >
                    <FiMoreHorizontal size={16} />
                    {overflowActive ? activeTab.label : "More"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu popperConfig={{ strategy: "fixed" }}>
                    {overflowTabs.map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <Dropdown.Item
                          key={tab.key}
                          eventKey={tab.key}
                          active={tab.key === activeTab.key}
                        >
                          <TabIcon size={15} className="me-2" />
                          {tab.label}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
            </div>
            <div className="mf-staff-detail">
              {activeTab.sections ? (
                <div className="mf-staff-body" role="tabpanel">
                  <div className="mf-staff-stats">
                    <div className="mf-staff-stat is-blue">
                      <FiBriefcase size={18} />
                      <span>Role</span>
                      <strong>{selectedUser.role_name || "—"}</strong>
                    </div>
                    <div className={`mf-staff-stat ${selectedUser.is_active ? "is-green" : "is-slate"}`}>
                      <FiToggleRight size={18} />
                      <span>Status</span>
                      <strong>{selectedUser.is_active ? "Active" : "Inactive"}</strong>
                    </div>
                    <div className="mf-staff-stat is-violet">
                      <FiCalendar size={18} />
                      <span>Member since</span>
                      <strong>{formatDate(selectedUser.created_at) || "—"}</strong>
                    </div>
                  </div>
                  <div className="mf-staff-sections">
                    {activeTab.sections(selectedUser).map((section) => {
                      const SectionIcon = section.icon;
                      return (
                        <section className="mf-staff-section" key={section.title}>
                          <h4>
                            <SectionIcon size={15} />
                            {section.title}
                          </h4>
                          <dl>
                            {section.rows.map(([label, value, RowIcon]) => (
                              <div className="mf-staff-row" key={label}>
                                <dt>
                                  <RowIcon size={14} />
                                  {label}
                                </dt>
                                <dd>{value || "—"}</dd>
                              </div>
                            ))}
                          </dl>
                        </section>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mf-staff-construction" role="tabpanel">
                  <span className="mf-staff-construction-icon">
                    <FiTool size={26} />
                  </span>
                  <h4>Page under construction</h4>
                  <p>{activeTab.label} is coming soon.</p>
                </div>
              )}
            </div>
            </div>
          </div>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiUsers size={24} />
            </span>
            <h3>Couldn&apos;t load users</h3>
            <p>{loadError}</p>
            <button
              type="button"
              className="mf-page-card-btn mf-page-card-btn--add"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading || tenantsLoading ? null : (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiUsers size={24} />
            </span>
            <h3>No users yet</h3>
            <p>Users will appear here.</p>
          </div>
        )}
      </PageCard>
    </AdminShell>
  );
}
