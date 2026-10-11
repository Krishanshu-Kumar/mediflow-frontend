"use client";

import { useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiLayers, FiPlus, FiSearch } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import FilterDrawer, { FilterGroup } from "@/components/FilterDrawer";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import TenantCard from "@/components/TenantCard";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";
import { DUMMY_TENANTS } from "@/const/tenants";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "inactive", label: "Inactive" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Basic", label: "Basic" },
  { value: "Pro", label: "Pro" },
  { value: "Enterprise", label: "Enterprise" },
];

const NO_FILTERS = { status: "all", plan: "all" };

export default function Tenants() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const toast = useToast();

  // TODO: swap DUMMY_TENANTS for the tenants API once it is available (and filter/page
  // server-side).
  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;
  const isFiltering = isSearching || activeFilterCount > 0;
  const visibleTenants = DUMMY_TENANTS.filter(
    (tenant) =>
      (filters.status === "all" || tenant.status === filters.status) &&
      (filters.plan === "all" || tenant.plan === filters.plan) &&
      (!isSearching ||
        [tenant.name, tenant.slug, tenant.email].some((value) =>
          value.toLowerCase().includes(term),
        )),
  );

  const updateFilter = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };

  const pageCount = Math.max(1, Math.ceil(visibleTenants.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedTenants = visibleTenants.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  // The list filters as you type, so submitting just keeps the page from reloading.
  const handleSearch = (event) => event.preventDefault();

  const handleAddTenant = () => {
    // TODO: open the add-tenant form once the tenant fields and API are defined.
    toast.info("The add tenant form is coming soon.", { title: "Add Tenant" });
  };

  const handleExport = (format) => {
    // TODO: export the tenant list as `format` once the tenants API is available.
    toast.info(`Exporting tenants as ${format} is coming soon.`, { title: "Export" });
  };

  return (
    <AdminShell title="Tenants" breadcrumbs={getBreadcrumbs("management", "tenants")}>
      <PageCard
            scrollResetKey={currentPage}
            footer={
              visibleTenants.length > 0 && (
                <Pagination
                  page={currentPage}
                  pageSize={PAGE_SIZE}
                  total={visibleTenants.length}
                  onPageChange={setPage}
                />
              )
            }
            leading={
              <form className="mf-header-search" role="search" onSubmit={handleSearch}>
                <FiSearch size={16} className="mf-header-search-icon" />
                <input
                  type="search"
                  className="mf-header-search-input"
                  placeholder="Search tenants..."
                  aria-label="Search tenants"
                  value={query}
                  onChange={handleQueryChange}
                />
              </form>
            }
            actions={
              <>
                <button
                  type="button"
                  className="mf-page-card-btn mf-page-card-btn--add"
                  onClick={handleAddTenant}
                >
                  <FiPlus size={16} />
                  Add Tenant
                </button>
                <button
                  type="button"
                  className="mf-page-card-btn mf-page-card-btn--pdf"
                  onClick={() => handleExport("PDF")}
                >
                  <FaFilePdf size={15} />
                  PDF
                </button>
                <button
                  type="button"
                  className="mf-page-card-btn mf-page-card-btn--csv"
                  onClick={() => handleExport("CSV")}
                >
                  <FaFileCsv size={15} />
                  CSV
                </button>
              </>
            }
          >
            {visibleTenants.length > 0 ? (
              <div className="mf-tenant-grid">
                {pagedTenants.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            ) : (
              <div className="mf-page-card-empty">
                <span className="mf-page-card-empty-icon">
                  <FiLayers size={24} />
                </span>
                <h3>{isFiltering ? "No tenants match" : "No tenants yet"}</h3>
                <p>
                  {isFiltering
                    ? "Try a different search, or reset the filters."
                    : "Tenants you add will appear here."}
                </p>
              </div>
            )}
      </PageCard>

      <FilterDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        activeCount={activeFilterCount}
        onReset={resetFilters}
        resultText={`${visibleTenants.length} of ${DUMMY_TENANTS.length} tenants`}
      >
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={updateFilter("status")}
        />
        <FilterGroup
          label="Plan"
          options={PLAN_OPTIONS}
          value={filters.plan}
          onChange={updateFilter("plan")}
        />
      </FilterDrawer>
    </AdminShell>
  );
}
