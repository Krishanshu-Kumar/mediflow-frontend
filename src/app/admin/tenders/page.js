"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiHome,
  FiPlus,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { FaGavel } from "react-icons/fa";
import { useSetTenderActivation, useSetTenderStatus, useTenders } from "@/api/tender/tenderApi";
import { useTenants } from "@/api/tenant/tenantApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;

// Tender status codes from the backend's tender_status master codes.
const STATUS_OPTIONS = [
  { code: 4001, value: "draft", label: "Draft", hint: "Not visible to bidders yet" },
  { code: 4002, value: "published", label: "Published", hint: "Open for bidding" },
  { code: 4003, value: "closed", label: "Closed", hint: "Bidding has ended" },
  { code: 4004, value: "cancelled", label: "Cancelled", hint: "Tender withdrawn" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Date and time shown as two lines in a schedule cell.
function Schedule({ iso, icon: Icon, children }) {
  if (!iso) return <span className="mf-mc-muted">Not set</span>;
  const date = new Date(iso);
  return (
    <div className="mf-tender-when">
      <span className="mf-tender-when-icon">
        <Icon size={14} />
      </span>
      <div>
        <div className="mf-tender-when-date">
          {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
        <div className="mf-tender-when-time">
          {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </div>
        {children}
      </div>
    </div>
  );
}

// "3 days left" / "Overdue" pill for open tenders with a deadline.
function deadlineHint(tender) {
  if (!tender.deadline || tender.status?.value !== "published") return null;
  const ms = new Date(tender.deadline).getTime() - Date.now();
  if (ms < 0) return { tone: "late", text: "Overdue" };
  const days = Math.ceil(ms / 86400000);
  if (days <= 1) return { tone: "soon", text: "Due today" };
  return { tone: days <= 3 ? "soon" : "ok", text: `${days} days left` };
}

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchTenders, loading } = useTenders();
  const { call: fetchTenants } = useTenants();
  const { call: saveActivation, loading: activationSaving } = useSetTenderActivation();
  const { call: saveStatus, loading: statusSaving } = useSetTenderStatus();

  // Tenant choices for the dropdown: active tenants only.
  useEffect(() => {
    fetchTenants({ activeOnly: true })
      .then((items) => setTenants(Array.isArray(items) ? items : []))
      .catch((err) => toast.error(err.message, { title: "Couldn't load tenants" }));
  }, [fetchTenants, toast]);

  const tenantOptions = tenants
    .map((tenant) => ({ value: tenant.id, label: tenant.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  // Until one is picked, the first tenant is selected.
  const selectedTenant = tenantOptions.find((o) => o.value === tenantId) ?? tenantOptions[0];
  const selectedTenantId = selectedTenant?.value;

  // The backend does the paging and tenant filtering; load just the current page.
  useEffect(() => {
    if (!selectedTenantId) return;
    fetchTenders({
      tenantId: selectedTenantId,
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      activeOnly: false, // include inactive tenders so they can be activated again
    })
      .then(({ items, hasNext: more }) => {
        setTenders(items);
        setHasNext(more);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load tenders" });
      });
  }, [fetchTenders, toast, selectedTenantId, page, reloadKey]);

  // The API has no search, so filter the tenders on the current page here.
  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const visibleTenders = tenders.filter((tender) =>
    [tender.reference_no, tender.title, tender.description].some((value) =>
      String(value ?? "").toLowerCase().includes(term),
    ),
  );
  const firstNumber = (page - 1) * PAGE_SIZE;

  const handleActivationChange = async (tender, isActive) => {
    try {
      const updated = await saveActivation(tender.id, isActive);
      setTenders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success(`${updated.reference_no} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Tender updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update tender" });
    }
  };

  const handleStatusChange = async (tender, statusCode) => {
    if (Number(statusCode) === tender.status_code) return;
    try {
      const updated = await saveStatus(tender.id, Number(statusCode));
      setTenders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success(`${updated.reference_no} is now ${updated.status?.display_name ?? "updated"}.`, {
        title: "Status updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update status" });
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handleTenantChange = (value) => {
    setTenantId(value);
    setPage(1);
  };

  return (
    <AdminShell title="All Tenders" breadcrumbs={getBreadcrumbs("tenders", "all-tenders")}>
      <Loader show={loading || activationSaving || statusSaving} />
      <PageCard
        scrollResetKey={page}
        footer={
          tenders.length > 0 && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={tenders.length}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          )
        }
        leading={
          <div className="mf-roles-filters">
            <form className="mf-header-search" role="search" onSubmit={(event) => event.preventDefault()}>
              <FiSearch size={16} className="mf-header-search-icon" />
              <input
                type="search"
                className="mf-header-search-input"
                placeholder="Search tenders..."
                aria-label="Search tenders"
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
        actions={
          <button type="button" className="mf-page-card-btn mf-page-card-btn--add">
            <FiPlus size={16} />
            Add Tender
          </button>
        }
      >
        {visibleTenders.length > 0 ? (
          <table className="mf-mc-table mf-tender-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tender</th>
                <th>Pre-bid meeting</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {visibleTenders.map((tender, index) => {
                const hint = deadlineHint(tender);
                return (
                <tr key={tender.id} className={tender.is_active ? undefined : "mf-tender-row--inactive"}>
                  <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                  <td>
                    <span className="mf-tender-ref">{tender.reference_no}</span>
                    <div className="mf-tender-title">{tender.title}</div>
                    {tender.description && <div className="mf-tender-desc">{tender.description}</div>}
                  </td>
                  <td>
                    <Schedule iso={tender.pre_bid_meeting_at} icon={FiUsers} />
                  </td>
                  <td>
                    <Schedule iso={tender.deadline} icon={FiCalendar}>
                      {hint && (
                        <span className={`mf-tender-hint is-${hint.tone}`}>
                          <FiClock size={11} />
                          {hint.text}
                        </span>
                      )}
                    </Schedule>
                  </td>
                  <td>
                    <Dropdown onSelect={(code) => handleStatusChange(tender, code)}>
                      <Dropdown.Toggle
                        as="button"
                        type="button"
                        className={`mf-mc-badge mf-status-toggle is-${tender.status?.value}`}
                        disabled={statusSaving}
                        aria-label={`Change status of ${tender.reference_no}`}
                        title="Change status"
                      >
                        <span className="mf-status-dot" />
                        {tender.status?.display_name ?? tender.status?.value ?? "—"}
                        <FiChevronDown size={12} className="mf-status-caret" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        className="mf-status-menu"
                        popperConfig={{ strategy: "fixed" }}
                        renderOnMount
                      >
                        <div className="mf-status-menu-heading">Change status</div>
                        {STATUS_OPTIONS.map((option) => {
                          const isCurrent = option.code === tender.status_code;
                          return (
                            <Dropdown.Item
                              key={option.code}
                              eventKey={option.code}
                              active={isCurrent}
                              className={`mf-status-option is-${option.value}`}
                            >
                              <span className="mf-status-option-dot" />
                              <span className="mf-status-option-text">
                                <span className="mf-status-option-label">{option.label}</span>
                                <span className="mf-status-option-hint">{option.hint}</span>
                              </span>
                              {isCurrent && <FiCheck size={16} className="mf-status-option-check" />}
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                  <td>
                    <label
                      className={`mf-switch${tender.is_active ? " is-on" : ""}`}
                      title="Set tender active or inactive"
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="mf-switch-input"
                        checked={Boolean(tender.is_active)}
                        disabled={activationSaving}
                        onChange={(event) => handleActivationChange(tender, event.target.checked)}
                        aria-label={`${tender.reference_no} active`}
                      />
                      <span className="mf-switch-track" aria-hidden="true">
                        <span className="mf-switch-thumb">
                          <FiCheck size={10} strokeWidth={3.5} />
                        </span>
                      </span>
                    </label>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FaGavel size={22} />
            </span>
            <h3>Couldn&apos;t load tenders</h3>
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
              <FaGavel size={22} />
            </span>
            <h3>{isSearching ? "No tenders match" : "No tenders yet"}</h3>
            <p>{isSearching ? "Try a different search." : "Tenders will appear here."}</p>
          </div>
        )}
      </PageCard>
    </AdminShell>
  );
}
