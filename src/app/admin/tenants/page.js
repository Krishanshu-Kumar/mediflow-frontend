"use client";

import { useEffect, useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiLayers, FiPlus, FiSearch } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import {
  useCreateTenant,
  usePlans,
  useSetTenantStatus,
  useTenants,
  useUpdateTenant,
} from "@/api/tenantApi";
import FilterDrawer, { FilterGroup } from "@/components/FilterDrawer";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import TenantCard from "@/components/TenantCard";
import TenantFormDrawer from "@/components/TenantFormDrawer";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const NO_FILTERS = { status: "all", plan: "all" };

export default function Tenants() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // The add / edit panel: open, and the tenant being edited (null = adding a new one).
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const toast = useToast();
  const { call: fetchTenants, loading: tenantsLoading } = useTenants();
  const { call: fetchPlans, loading: plansLoading } = usePlans();
  const { call: saveTenantStatus, loading: statusSaving } = useSetTenantStatus();
  const { call: createTenant, loading: creating } = useCreateTenant();
  const { call: updateTenant, loading: updating } = useUpdateTenant();

  // The API has no search or total count, so load every tenant (active and inactive) once
  // and search / filter / page here.
  useEffect(() => {
    fetchTenants({ activeOnly: false })
      .then((data) => {
        setTenants(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load tenants" });
      });
  }, [fetchTenants, toast, reloadKey]);

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [fetchPlans]);

  const handleStatusChange = async (tenant, isActive) => {
    try {
      const updated = await saveTenantStatus(tenant.id, isActive);
      setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success(`${updated.name} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Status updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update status" });
    }
  };

  const planOptions = [
    { value: "all", label: "All" },
    ...plans.map((plan) => ({ value: plan.code, label: plan.display_name })),
  ];

  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;
  const isFiltering = isSearching || activeFilterCount > 0;
  const visibleTenants = tenants.filter(
    (tenant) =>
      (filters.status === "all" || tenant.is_active === (filters.status === "active")) &&
      (filters.plan === "all" || tenant.plan_code === filters.plan) &&
      (!isSearching ||
        [tenant.name, tenant.slug].some((value) =>
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
    setEditingTenant(null);
    setFormOpen(true);
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setFormOpen(true);
  };

  // Resolves true when saved so the panel closes; on an error (e.g. slug taken) it stays open.
  const handleSaveTenant = async (values) => {
    try {
      if (editingTenant) {
        const updated = await updateTenant(editingTenant.id, values);
        setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success(`${updated.name} was updated.`, { title: "Tenant updated" });
      } else {
        const created = await createTenant(values);
        setTenants((prev) => [created, ...prev]);
        toast.success(`${created.name} was added.`, { title: "Tenant added" });
      }
      return true;
    } catch (err) {
      toast.error(err.message, { title: editingTenant ? "Couldn't update tenant" : "Couldn't add tenant" });
      return false;
    }
  };

  const handleExport = (format) => {
    // TODO: export the tenant list as `format` once the tenants API is available.
    toast.info(`Exporting tenants as ${format} is coming soon.`, { title: "Export" });
  };

  return (
    <AdminShell title="Tenants" breadcrumbs={getBreadcrumbs("management", "tenants")}>
      <Loader show={tenantsLoading || plansLoading || statusSaving || creating || updating} />
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
                  <TenantCard
                    key={tenant.id}
                    tenant={tenant}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTenant}
                    statusDisabled={statusSaving}
                  />
                ))}
              </div>
            ) : loadError ? (
              <div className="mf-page-card-empty">
                <span className="mf-page-card-empty-icon">
                  <FiLayers size={24} />
                </span>
                <h3>Couldn&apos;t load tenants</h3>
                <p>{loadError}</p>
                <button
                  type="button"
                  className="mf-page-card-btn mf-page-card-btn--add"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Try again
                </button>
              </div>
            ) : tenantsLoading ? null : (
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

      <TenantFormDrawer
        show={formOpen}
        tenant={editingTenant}
        plans={plans}
        saving={creating || updating}
        onHide={() => setFormOpen(false)}
        onSave={handleSaveTenant}
      />

      <FilterDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        activeCount={activeFilterCount}
        onReset={resetFilters}
        resultText={`${visibleTenants.length} of ${tenants.length} tenants`}
      >
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={updateFilter("status")}
        />
        <FilterGroup
          label="Plan"
          options={planOptions}
          value={filters.plan}
          onChange={updateFilter("plan")}
        />
      </FilterDrawer>
    </AdminShell>
  );
}
