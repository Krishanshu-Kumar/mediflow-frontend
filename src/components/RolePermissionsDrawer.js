"use client";

import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { FiSearch, FiX } from "react-icons/fi";
import { usePermissions } from "@/api/permission/permissionApi";
import { useRolePermissions } from "@/api/role/roleApi";

const SCOPES = [
  { value: "platform", label: "Platform" },
  { value: "tenant", label: "Tenant" },
];

/**
 * Right-side panel for choosing which permissions `role` (null = closed) has. Shows every
 * permission as a checklist grouped by scope. `onSave(selectedPermissions)` does the API call
 * and resolves true when it worked, which closes the panel.
 */
export default function RolePermissionsDrawer({ role, saving, onHide, onSave }) {
  const { call: fetchAll, loading: loadingAll } = usePermissions();
  const { call: fetchGranted, loading: loadingGranted } = useRolePermissions();
  const [all, setAll] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const roleId = role?.id;

  useEffect(() => {
    if (!roleId) return;
    let cancelled = false;
    Promise.all([fetchAll(), fetchGranted(roleId)])
      .then(([everything, granted]) => {
        if (cancelled) return;
        setError(null);
        setAll(everything);
        setSelected(new Set(granted.map((p) => p.code)));
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [fetchAll, fetchGranted, roleId, reloadKey]);

  const loading = loadingAll || loadingGranted;
  const term = query.trim().toLowerCase();
  const matching = all.filter((p) =>
    [p.code, p.display_name, p.description].some((v) => String(v ?? "").toLowerCase().includes(term)),
  );

  const toggle = (code) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(code)) next.add(code);
      return next;
    });

  // Ticks or clears every permission in a group (only the ones the search is showing).
  const toggleGroup = (items, allTicked) =>
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((p) => (allTicked ? next.delete(p.code) : next.add(p.code)));
      return next;
    });

  const handleSave = async () => {
    const saved = await onSave(all.filter((p) => selected.has(p.code)));
    if (saved) onHide();
  };

  return (
    <Offcanvas
      show={Boolean(role)}
      onHide={onHide}
      onExited={() => setQuery("")}
      placement="end"
      className="mf-tenant-drawer"
    >
      <div className="mf-tenant-form">
        <div className="mf-filter-panel-header">
          <div>
            <h2 className="mf-filter-panel-title">Role-Permission Mapping</h2>
            <p className="mf-tenant-form-subtitle">
              {role?.name}
              {!loading && !error && ` · ${selected.size} of ${all.length} selected`}
            </p>
          </div>
          <button type="button" className="mf-filter-close" onClick={onHide} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mf-filter-panel-body">
          {loading ? (
            <p className="mf-mc-muted text-center py-4 mb-0">Loading permissions...</p>
          ) : error ? (
            <div className="text-center py-4">
              <p className="mf-mc-muted">{error}</p>
              <button
                type="button"
                className="mf-page-card-btn mf-page-card-btn--add"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mf-permpick-search">
                <FiSearch size={17} className="mf-permpick-search-icon" />
                <input
                  type="text"
                  className="mf-permpick-search-input"
                  placeholder="Search permissions..."
                  aria-label="Search permissions"
                  autoComplete="off"
                  spellCheck="false"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="mf-permpick-search-clear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {matching.length === 0 && (
                <p className="mf-mc-muted text-center py-4 mb-0">No permissions match.</p>
              )}

              {SCOPES.map(({ value, label }) => {
                const items = matching.filter((p) => p.scope === value);
                if (items.length === 0) return null;
                const allTicked = items.every((p) => selected.has(p.code));
                return (
                  <section key={value} className="mf-permpick-group">
                    <div className="mf-permpick-heading">
                      <span className={`mf-scope-badge is-${value}`}>{label}</span>
                      <button
                        type="button"
                        className="mf-permpick-all"
                        onClick={() => toggleGroup(items, allTicked)}
                      >
                        {allTicked ? "Clear all" : "Select all"}
                      </button>
                    </div>
                    {items.map((p) => (
                      <label key={p.code} className="mf-permpick-item">
                        <input
                          type="checkbox"
                          checked={selected.has(p.code)}
                          onChange={() => toggle(p.code)}
                        />
                        <span className="mf-permpick-text">
                          <strong>{p.display_name || p.code}</strong>
                          <small>{p.display_name ? p.code : p.description}</small>
                        </span>
                      </label>
                    ))}
                  </section>
                );
              })}
            </>
          )}
        </div>

        <div className="mf-tenant-form-footer">
          <button type="button" className="mf-page-card-btn" onClick={onHide}>
            Cancel
          </button>
          <button
            type="button"
            className="mf-page-card-btn mf-page-card-btn--add"
            onClick={handleSave}
            disabled={saving || loading || Boolean(error)}
          >
            {saving ? "Saving..." : "Save permissions"}
          </button>
        </div>
      </div>
    </Offcanvas>
  );
}
