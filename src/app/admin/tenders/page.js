"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FiCheck, FiChevronDown, FiHome, FiPlus, FiSearch } from "react-icons/fi";
import { FaGavel } from "react-icons/fa";
import { useTenders } from "@/api/tender/tenderApi";
import { useTenants } from "@/api/tenant/tenantApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    [tender.reference_no, tender.title, tender.description].some((value) => String(value ?? "").toLowerCase().includes(term)),
  );
  const firstNumber = (page - 1) * PAGE_SIZE;

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
      <Loader show={loading} />
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
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Reference no.</th>
                <th>Title</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {visibleTenders.map((tender, index) => (
                <tr key={tender.id}>
                  <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                  <td>{tender.reference_no}</td>
                  <td>{tender.title}</td>
                  <td>{tender.description || "—"}</td>
                </tr>
              ))}
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
