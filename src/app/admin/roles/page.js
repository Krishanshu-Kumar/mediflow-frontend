"use client";

import { Fragment, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import {
  FiCheck,
  FiCheckSquare,
  FiChevronDown,
  FiEdit2,
  FiHome,
  FiKey,
  FiPlus,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import {
  useCreateRole,
  useRolePermissions,
  useRoles,
  useSetRolePermissions,
  useSetRoleStatus,
  useUpdateRole,
} from "@/api/role/roleApi";
import { useTenants } from "@/api/tenant/tenantApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import RoleFormDrawer from "@/components/RoleFormDrawer";
import RolePermissionsDrawer from "@/components/RolePermissionsDrawer";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PAGE_SIZE = 10;

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [tenants, setTenants] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tenantId, setTenantId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  // The role whose permissions are open underneath its row (only one at a time), and what
  // was loaded for it: { items } or { error }; no entry yet means it is still loading.
  const [openRoleId, setOpenRoleId] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchRoles, loading } = useRoles();
  const { call: fetchTenants, loading: tenantsLoading } = useTenants();
  const { call: addRole, loading: creating } = useCreateRole();
  const { call: editRole, loading: updating } = useUpdateRole();
  const { call: saveRoleStatus, loading: statusSaving } = useSetRoleStatus();

  const { call: fetchRolePermissions } = useRolePermissions();
  const { call: savePermissions, loading: permissionsSaving } = useSetRolePermissions();
  const [permissionsRole, setPermissionsRole] = useState(null);

  // `selected` is the full list of permission objects the user ticked.
  const handleSavePermissions = async (selected) => {
    try {
      await savePermissions(
        permissionsRole.id,
        selected.map((p) => p.code),
      );
      // Keep an already-open list for this role in step with what was just saved.
      setRolePermissions((prev) => ({ ...prev, [permissionsRole.id]: { items: selected } }));
      toast.success(`Permissions for ${permissionsRole.name} were saved.`, {
        title: "Permissions updated",
      });
      return true;
    } catch (err) {
      toast.error(err.message, { title: "Couldn't save permissions" });
      return false;
    }
  };

  // Opening a role loads its permissions fresh; opening it again closes it.
  const togglePermissions = (role) => {
    if (openRoleId === role.id) {
      setOpenRoleId(null);
      return;
    }
    setOpenRoleId(role.id);
    setRolePermissions((prev) => ({ ...prev, [role.id]: undefined }));
    fetchRolePermissions(role.id)
      .then((items) => setRolePermissions((prev) => ({ ...prev, [role.id]: { items } })))
      .catch((err) =>
        setRolePermissions((prev) => ({ ...prev, [role.id]: { error: err.message } })),
      );
  };

  const handleStatusChange = async (role, isActive) => {
    try {
      const updated = await saveRoleStatus(role.id, isActive);
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(`${updated.name} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Status updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update status" });
    }
  };

  // Tenant choices for the dropdown: active tenants only.
  useEffect(() => {
    fetchTenants({ activeOnly: true })
      .then(setTenants)
      .catch((err) => toast.error(err.message, { title: "Couldn't load tenants" }));
  }, [fetchTenants, toast]);

  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const tenantOptions = [
    ...tenants
      .map((tenant) => ({ value: tenant.id, label: tenant.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  // Until one is picked, the first tenant is selected.
  const selectedTenant = tenantOptions.find((o) => o.value === tenantId) ?? tenantOptions[0];
  const selectedTenantId = selectedTenant?.value;

  // The backend does the paging and tenant filtering; load just the current page.
  useEffect(() => {
    if (!selectedTenantId) return;
    fetchRoles({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      tenantId: selectedTenantId,
    })
      .then(({ items, total: count }) => {
        setRoles(items);
        setTotal(count);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load roles" });
      });
  }, [fetchRoles, toast, selectedTenantId, page, reloadKey]);

  const firstNumber = (page - 1) * PAGE_SIZE;

  // The API has no search, so filter the roles on the current page here.
  const visibleRoles = roles.filter((role) => String(role.name ?? "").toLowerCase().includes(term));

  const handleQueryChange = (event) => setQuery(event.target.value);

  const handleTenantChange = (key) => {
    setTenantId(key);
    setPage(1);
  };

  // The list filters as you type, so submitting just keeps the page from reloading.
  const handleSearch = (event) => event.preventDefault();

  // CSV of the roles listed on the current page (so it follows the search).
  const exportCsv = () => {
    if (visibleRoles.length === 0) {
      toast.info("There are no roles to export.", { title: "Export" });
      return;
    }
    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [["Tenant", "Name", "Status", "Created", "Updated"]];
    visibleRoles.forEach((role) =>
      lines.push([
        role.tenant_name,
        role.name,
        role.is_active ? "Active" : "Inactive",
        formatDate(role.created_at),
        formatDate(role.updated_at),
      ]),
    );
    // BOM so Excel reads the file as UTF-8.
    const csv = lines.map((row) => row.map(cell).join(",")).join("\r\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roles.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleSaveRole = async (values) => {
    try {
      if (editingRole) {
        const updated = await editRole(editingRole.id, values);
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast.success(`${updated.name} was updated.`, { title: "Role updated" });
      } else {
        const created = await addRole(values);
        // Show the first page of the tenant the role was added to, so the new row is visible.
        setTenantId(created.tenant_id ?? values.tenantId);
        setPage(1);
        setReloadKey((key) => key + 1);
        toast.success(`${created.name} was added.`, { title: "Role added" });
      }
      return true;
    } catch (err) {
      toast.error(err.message, { title: editingRole ? "Couldn't update role" : "Couldn't add role" });
      return false;
    }
  };

  const exportPdf = () => {
    // TODO: export the roles as a PDF (needs a PDF library).
    toast.info("Exporting roles as PDF is coming soon.", { title: "Export" });
  };

  return (
    <AdminShell title="Roles" breadcrumbs={getBreadcrumbs("management", "roles")}>
      <Loader show={loading || tenantsLoading || statusSaving || creating || updating} />
      <PageCard
        scrollResetKey={page}
        footer={
          total > 0 && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          )
        }
        actions={
          <>
            <button type="button" className="mf-page-card-btn mf-page-card-btn--add" onClick={handleAddRole}>
              <FiPlus size={16} />
              Add Role
            </button>
            <button type="button" className="mf-page-card-btn mf-page-card-btn--pdf" onClick={exportPdf}>
              <FaFilePdf size={15} />
              PDF
            </button>
            <button type="button" className="mf-page-card-btn mf-page-card-btn--csv" onClick={exportCsv}>
              <FaFileCsv size={15} />
              CSV
            </button>
          </>
        }
        leading={
          <div className="mf-roles-filters">
            <form className="mf-header-search" role="search" onSubmit={handleSearch}>
              <FiSearch size={16} className="mf-header-search-icon" />
              <input
                type="search"
                className="mf-header-search-input"
                placeholder="Search roles..."
                aria-label="Search roles"
                value={query}
                onChange={handleQueryChange}
              />
            </form>
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
          </div>
        }
      >
        {visibleRoles.length > 0 ? (
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRoles.map((role, index) => {
                const isOpen = openRoleId === role.id;
                const loaded = rolePermissions[role.id];
                return (
                <Fragment key={role.id ?? index}>
                <tr className={isOpen ? "mf-mc-row is-open" : undefined}>
                  <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                  <td>{role.name}</td>
                  <td>
                    <label
                      className={`mf-switch${role.is_active ? " is-on" : ""}`}
                      title="Set role status"
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="mf-switch-input"
                        checked={Boolean(role.is_active)}
                        disabled={statusSaving}
                        onChange={(event) => handleStatusChange(role, event.target.checked)}
                        aria-label={`${role.name} active`}
                      />
                      <span className="mf-switch-track" aria-hidden="true">
                        <span className="mf-switch-thumb">
                          <FiCheck size={10} strokeWidth={3.5} />
                        </span>
                      </span>
                    </label>
                  </td>
                  <td>{formatDate(role.created_at)}</td>
                  <td>{formatDate(role.updated_at)}</td>
                  <td className="mf-row-actions">
                    <button
                      type="button"
                      className={`mf-row-action${isOpen ? " is-active" : ""}`}
                      onClick={() => togglePermissions(role)}
                      aria-expanded={isOpen}
                      aria-label={`View permissions of ${role.name}`}
                      title="View permissions"
                    >
                      <FiKey size={15} />
                    </button>
                    <button
                      type="button"
                      className="mf-row-action"
                      onClick={() => setPermissionsRole(role)}
                      aria-label={`Set permissions of ${role.name}`}
                      title="Set permissions"
                    >
                      <FiCheckSquare size={15} />
                    </button>
                    <button
                      type="button"
                      className="mf-row-action"
                      onClick={() => handleEditRole(role)}
                      aria-label={`Edit ${role.name}`}
                      title="Edit role"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  </td>
                </tr>
                <tr className="mf-mc-detail-row">
                  <td colSpan={6}>
                    <div className={`mf-mc-collapse${isOpen ? " is-open" : ""}`}>
                      <div>
                        {loaded?.items?.length > 0 ? (
                          <table className="mf-mc-subtable">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Display name</th>
                                <th>Scope</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded.items.map((permission, permissionIndex) => (
                                <tr key={permission.code}>
                                  <td className="mf-mc-muted">{permissionIndex + 1}</td>
                                  <td className="mf-mc-code">{permission.code}</td>
                                  <td>{permission.display_name}</td>
                                  <td>
                                    {permission.scope && (
                                      <span className={`mf-scope-badge is-${permission.scope}`}>
                                        {permission.scope.charAt(0).toUpperCase() +
                                          permission.scope.slice(1)}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="mf-mc-muted mb-0 py-3 text-center">
                            {!loaded
                              ? "Loading permissions..."
                              : loaded.error
                                ? `Couldn't load permissions: ${loaded.error}`
                                : "No permissions are assigned to this role."}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                </Fragment>
                );
              })}
            </tbody>
          </table>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiShield size={24} />
            </span>
            <h3>Couldn&apos;t load roles</h3>
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
              <FiShield size={24} />
            </span>
            <h3>{isSearching ? "No roles match" : "No roles yet"}</h3>
            <p>{isSearching ? "Try a different search." : "Roles will appear here."}</p>
          </div>
        )}
      </PageCard>
      <RolePermissionsDrawer
        role={permissionsRole}
        saving={permissionsSaving}
        onHide={() => setPermissionsRole(null)}
        onSave={handleSavePermissions}
      />
      <RoleFormDrawer
        show={formOpen}
        role={editingRole}
        tenants={tenants}
        defaultTenantId={selectedTenant?.value}
        saving={creating || updating}
        onHide={() => setFormOpen(false)}
        onSave={handleSaveRole}
      />
    </AdminShell>
  );
}
