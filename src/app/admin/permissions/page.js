"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import {
  FiCheck,
  FiChevronDown,
  FiEdit2,
  FiGlobe,
  FiKey,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import {
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission,
} from "@/api/permission/permissionApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import PermissionFormDrawer from "@/components/PermissionFormDrawer";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

const PAGE_SIZE = 10;

const SCOPE_FILTERS = [
  { value: "all", label: "All scopes" },
  { value: "platform", label: "Platform" },
  { value: "tenant", label: "Tenant" },
];

const scopeLabel = (scope) => scope.charAt(0).toUpperCase() + scope.slice(1);

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchPermissions, loading } = usePermissions();
  const { call: addPermission, loading: creating } = useCreatePermission();
  const { call: editPermission, loading: updating } = useUpdatePermission();
  const { call: removePermission, loading: deleting } = useDeletePermission();

  // The API returns every permission (no paging), optionally narrowed by scope.
  useEffect(() => {
    fetchPermissions({ scope: scope === "all" ? undefined : scope })
      .then((items) => {
        setPermissions(items);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load permissions" });
      });
  }, [fetchPermissions, toast, scope, reloadKey]);

  const term = query.trim().toLowerCase();
  const isSearching = term !== "";

  const matching = permissions.filter((permission) =>
    [permission.code, permission.display_name, permission.description].some((value) =>
      String(value ?? "").toLowerCase().includes(term),
    ),
  );
  const total = matching.length;
  // Deleting the last row of the last page leaves it empty, so fall back to the last page.
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const firstNumber = (currentPage - 1) * PAGE_SIZE;
  const visiblePermissions = matching.slice(firstNumber, firstNumber + PAGE_SIZE);

  const selectedScope = SCOPE_FILTERS.find((o) => o.value === scope);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handleScopeChange = (key) => {
    setScope(key);
    setPage(1);
  };

  // The list filters as you type, so submitting just keeps the page from reloading.
  const handleSearch = (event) => event.preventDefault();

  const handleStatusChange = async (permission, isActive) => {
    try {
      const updated = await editPermission(permission.code, { isActive });
      setPermissions((prev) => prev.map((p) => (p.code === updated.code ? updated : p)));
      toast.success(`${updated.code} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Status updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update status" });
    }
  };

  const handleDeletePermission = async (permission) => {
    if (!window.confirm(`Delete permission "${permission.code}"? This can't be undone.`)) return;
    try {
      await removePermission(permission.code);
      setPermissions((prev) => prev.filter((p) => p.code !== permission.code));
      toast.success(`${permission.code} was deleted.`, { title: "Permission deleted" });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't delete permission" });
    }
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setFormOpen(true);
  };

  const handleAddPermission = () => {
    setEditingPermission(null);
    setFormOpen(true);
  };

  const handleSavePermission = async (values) => {
    try {
      if (editingPermission) {
        const updated = await editPermission(editingPermission.code, {
          displayName: values.displayName || null,
          description: values.description,
          scope: values.scope,
        });
        setPermissions((prev) => prev.map((p) => (p.code === updated.code ? updated : p)));
        toast.success(`${updated.code} was updated.`, { title: "Permission updated" });
      } else {
        const created = await addPermission(values);
        // Clear the filters so the new row is visible, then reload.
        setQuery("");
        setScope("all");
        setPage(1);
        setReloadKey((key) => key + 1);
        toast.success(`${created.code} was added.`, { title: "Permission added" });
      }
      return true;
    } catch (err) {
      toast.error(err.message, {
        title: editingPermission ? "Couldn't update permission" : "Couldn't add permission",
      });
      return false;
    }
  };

  // CSV of the permissions matching the search and scope filter.
  const exportCsv = () => {
    if (matching.length === 0) {
      toast.info("There are no permissions to export.", { title: "Export" });
      return;
    }
    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [["Code", "Display name", "Description", "Scope", "Status", "Created", "Updated"]];
    matching.forEach((permission) =>
      lines.push([
        permission.code,
        permission.display_name,
        permission.description,
        scopeLabel(permission.scope),
        permission.is_active ? "Active" : "Inactive",
        formatDate(permission.created_at),
        formatDate(permission.updated_at),
      ]),
    );
    // BOM so Excel reads the file as UTF-8.
    const csv = lines.map((row) => row.map(cell).join(",")).join("\r\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "permissions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    // TODO: export the permissions as a PDF (needs a PDF library).
    toast.info("Exporting permissions as PDF is coming soon.", { title: "Export" });
  };

  return (
    <AdminShell title="Permissions" breadcrumbs={getBreadcrumbs("management", "permissions")}>
      <Loader show={loading || creating || updating || deleting} />
      <PageCard
        scrollResetKey={currentPage}
        footer={
          total > 0 && (
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          )
        }
        actions={
          <>
            <button type="button" className="mf-page-card-btn mf-page-card-btn--add" onClick={handleAddPermission}>
              <FiPlus size={16} />
              Add Permission
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
                placeholder="Search permissions..."
                aria-label="Search permissions"
                value={query}
                onChange={handleQueryChange}
              />
            </form>
            <Dropdown onSelect={handleScopeChange}>
              <Dropdown.Toggle
                as="button"
                type="button"
                className="mf-header-select"
                aria-label="Filter by scope"
                title="Filter by scope"
              >
                <span className="mf-header-select-icon">
                  <FiGlobe size={15} />
                </span>
                <span className="mf-header-select-text">
                  <span className="mf-header-select-caption">Scope</span>
                  <span className="mf-header-select-value">{selectedScope.label}</span>
                </span>
                <FiChevronDown size={16} className="mf-header-select-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="mf-select-menu mf-header-select-menu"
                popperConfig={{ strategy: "fixed" }}
                renderOnMount
              >
                <div className="mf-header-select-heading">Filter by scope</div>
                <div className="mf-header-select-list">
                  {SCOPE_FILTERS.map((option) => {
                    const isSelected = option.value === scope;
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
        {visiblePermissions.length > 0 ? (
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Code</th>
                <th>Display name</th>
                <th>Description</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePermissions.map((permission, index) => (
                <tr key={permission.code}>
                  <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                  <td>{permission.code}</td>
                  <td>{permission.display_name}</td>
                  <td>{permission.description}</td>
                  <td>{scopeLabel(permission.scope)}</td>
                  <td>
                    <label
                      className={`mf-switch${permission.is_active ? " is-on" : ""}`}
                      title="Set permission status"
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="mf-switch-input"
                        checked={Boolean(permission.is_active)}
                        disabled={updating}
                        onChange={(event) => handleStatusChange(permission, event.target.checked)}
                        aria-label={`${permission.code} active`}
                      />
                      <span className="mf-switch-track" aria-hidden="true">
                        <span className="mf-switch-thumb">
                          <FiCheck size={10} strokeWidth={3.5} />
                        </span>
                      </span>
                    </label>
                  </td>
                  <td>{formatDate(permission.created_at)}</td>
                  <td>{formatDate(permission.updated_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="mf-row-action"
                      onClick={() => handleEditPermission(permission)}
                      aria-label={`Edit ${permission.code}`}
                      title="Edit permission"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="mf-row-action"
                      onClick={() => handleDeletePermission(permission)}
                      disabled={deleting}
                      aria-label={`Delete ${permission.code}`}
                      title="Delete permission"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiKey size={24} />
            </span>
            <h3>Couldn&apos;t load permissions</h3>
            <p>{loadError}</p>
            <button
              type="button"
              className="mf-page-card-btn mf-page-card-btn--add"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading ? null : (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiKey size={24} />
            </span>
            <h3>{isSearching ? "No permissions match" : "No permissions yet"}</h3>
            <p>{isSearching ? "Try a different search." : "Permissions will appear here."}</p>
          </div>
        )}
      </PageCard>
      <PermissionFormDrawer
        show={formOpen}
        permission={editingPermission}
        saving={creating || updating}
        onHide={() => setFormOpen(false)}
        onSave={handleSavePermission}
      />
    </AdminShell>
  );
}
