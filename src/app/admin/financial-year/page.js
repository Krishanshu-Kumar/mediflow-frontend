"use client";

import { useEffect, useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiCalendar, FiCheck, FiEdit2, FiPlus, FiSearch } from "react-icons/fi";
import {
  useCreateFinancialYear,
  useFinancialYears,
  useSetFinancialYearStatus,
  useUpdateFinancialYear,
} from "@/api/financialYear/financialYearApi";
import AdminShell from "@/components/AdminShell";
import FinancialYearFormDrawer from "@/components/FinancialYearFormDrawer";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

export default function FinancialYearPage() {
  const [years, setYears] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchYears, loading } = useFinancialYears();
  const { call: saveStatus, loading: statusSaving } = useSetFinancialYearStatus();
  const { call: addYear, loading: creating } = useCreateFinancialYear();
  const { call: editYear, loading: updating } = useUpdateFinancialYear();
  const [formOpen, setFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);

  // The backend does the paging; load just the current page.
  useEffect(() => {
    fetchYears({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE })
      .then(({ items, hasNext: more }) => {
        setYears(items);
        setHasNext(more);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load financial years" });
      });
  }, [fetchYears, toast, page, reloadKey]);

  // The API has no search, so filter the financial years on the current page here.
  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const matchesSearch = (year) =>
    [year.label, year.start_date, year.end_date, formatDate(year.start_date), formatDate(year.end_date), year.is_active ? "active" : "inactive"].some(
      (value) => String(value ?? "").toLowerCase().includes(term),
    );
  const matching = years.filter(matchesSearch);
  const handleStatusChange = async (year, isActive) => {
    try {
      const updated = await saveStatus(year.id, isActive);
      setYears((prev) => prev.map((y) => (y.id === year.id ? { ...y, ...updated } : y)));
      toast.success(`${year.label} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Status updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update status" });
    }
  };

  const handleAddYear = () => {
    setEditingYear(null);
    setFormOpen(true);
  };

  const handleEditYear = (year) => {
    setEditingYear(year);
    setFormOpen(true);
  };

  const handleSaveYear = async (values) => {
    try {
      if (editingYear) {
        const updated = await editYear(editingYear.id, values);
        // Reload instead of merging: editing the dates can change which year is current.
        setReloadKey((key) => key + 1);
        toast.success(`${updated.label} was updated.`, { title: "Financial year updated" });
      } else {
        const created = await addYear(values);
        // Clear the search so the new row is visible, then reload.
        setQuery("");
        setPage(1);
        setReloadKey((key) => key + 1);
        toast.success(`${created.label} was added.`, { title: "Financial year added" });
      }
      return true;
    } catch (err) {
      toast.error(err.message, {
        title: editingYear ? "Couldn't update financial year" : "Couldn't add financial year",
      });
      return false;
    }
  };

  // CSV of the financial years matching the search. The page only holds one page of rows, so
  // this loads them all (up to the backend's 500 per request) first.
  const exportCsv = async () => {
    let all;
    try {
      ({ items: all } = await fetchYears({ skip: 0, limit: 500 }));
    } catch (err) {
      toast.error(err.message, { title: "Couldn't export financial years" });
      return;
    }
    const exportable = all.filter(matchesSearch);
    if (exportable.length === 0) {
      toast.info("There are no financial years to export.", { title: "Export" });
      return;
    }
    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [["Label", "Start date", "End date", "Current", "Status"]];
    exportable.forEach((year) =>
      lines.push([
        year.label,
        formatDate(year.start_date),
        formatDate(year.end_date),
        year.is_current ? "Yes" : "No",
        year.is_active ? "Active" : "Inactive",
      ]),
    );
    // BOM so Excel reads the file as UTF-8.
    const csv = lines.map((row) => row.map(cell).join(",")).join("\r\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "financial-years.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    // TODO: export the financial years as a PDF (needs a PDF library).
    toast.info("Exporting financial years as PDF is coming soon.", { title: "Export" });
  };

  const currentPage = page;
  const firstNumber = (page - 1) * PAGE_SIZE;
  const visibleYears = matching;

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  return (
    <AdminShell title="Financial Year" breadcrumbs={getBreadcrumbs("management", "financial-year")}>
      <Loader show={loading || statusSaving || creating || updating} />
      <FinancialYearFormDrawer
        show={formOpen}
        financialYear={editingYear}
        saving={creating || updating}
        onHide={() => setFormOpen(false)}
        onSave={handleSaveYear}
      />
      <PageCard
        scrollResetKey={currentPage}
        footer={
          years.length > 0 && (
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              count={years.length}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          )
        }
        actions={
          <>
            <button
              type="button"
              className="mf-page-card-btn mf-page-card-btn--add"
              onClick={handleAddYear}
            >
              <FiPlus size={16} />
              Add Financial Year
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
          <form className="mf-header-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <FiSearch size={16} className="mf-header-search-icon" />
            <input
              type="search"
              className="mf-header-search-input"
              placeholder="Search financial years..."
              aria-label="Search financial years"
              value={query}
              onChange={handleQueryChange}
            />
          </form>
        }
      >
        {visibleYears.length > 0 ? (
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Label</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Current</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleYears.map((year, index) => (
                <tr key={year.id}>
                  <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                  <td>
                    <span className="mf-fy-badge">
                      <FiCalendar size={13} />
                      {year.label}
                    </span>
                  </td>
                  <td>{formatDate(year.start_date)}</td>
                  <td>{formatDate(year.end_date)}</td>
                  <td>
                    <span className={`mf-mc-badge${year.is_current ? " is-active" : ""}`}>
                      {year.is_current ? "Current" : "—"}
                    </span>
                  </td>
                  <td>
                    <label
                      className={`mf-switch${year.is_active ? " is-on" : ""}`}
                      title="Set financial year status"
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="mf-switch-input"
                        checked={Boolean(year.is_active)}
                        disabled={statusSaving}
                        onChange={(event) => handleStatusChange(year, event.target.checked)}
                        aria-label={`${year.label} active`}
                      />
                      <span className="mf-switch-track" aria-hidden="true">
                        <span className="mf-switch-thumb">
                          <FiCheck size={10} strokeWidth={3.5} />
                        </span>
                      </span>
                    </label>
                  </td>
                  <td className="mf-row-actions">
                    <button
                      type="button"
                      className="mf-row-action"
                      onClick={() => handleEditYear(year)}
                      aria-label={`Edit ${year.label}`}
                      title="Edit financial year"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiCalendar size={24} />
            </span>
            <h3>Couldn&apos;t load financial years</h3>
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
              <FiCalendar size={24} />
            </span>
            <h3>{isSearching ? "No financial years match" : "No financial years yet"}</h3>
            <p>{isSearching ? "Try a different search." : "Financial years will appear here."}</p>
          </div>
        )}
      </PageCard>
    </AdminShell>
  );
}
