"use client";

import { Fragment, useEffect, useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiChevronRight, FiList, FiSearch } from "react-icons/fi";
import { useMasterCodes } from "@/api/masterCode/masterCodeApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;

export default function MasterCodes() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [codes, setCodes] = useState([]);
  // The category whose small table is open underneath its row (only one at a time).
  const [openCategory, setOpenCategory] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchMasterCodes, loading } = useMasterCodes();

  // The API has no search or total count, so load every master code (active and inactive)
  // once and group / search / page here.
  useEffect(() => {
    fetchMasterCodes({ activeOnly: false })
      .then((data) => {
        setCodes(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load master codes" });
      });
  }, [fetchMasterCodes, toast, reloadKey]);

  // One entry per category, built from the codes (the API has no categories route).
  const categories = Object.values(
    codes.reduce((acc, item) => {
      const entry = (acc[item.category_code] ??= {
        code: item.category_code,
        name: item.category_name,
        items: [],
        active: 0,
      });
      entry.items.push(item);
      if (item.is_active) entry.active += 1;
      return acc;
    }, {}),
  ).sort((a, b) => a.code - b.code);

  // A category matches on its own code / name, or on any code inside it.
  const term = query.trim().toLowerCase();
  const isSearching = term !== "";
  const hit = (fields) => fields.some((f) => String(f).toLowerCase().includes(term));
  const visibleCategories = categories.filter(
    (c) =>
      !isSearching ||
      hit([c.code, c.name]) ||
      c.items.some((item) => hit([item.code, item.value, item.display_name])),
  );

  const pageCount = Math.max(1, Math.ceil(visibleCategories.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstNumber = (currentPage - 1) * PAGE_SIZE;
  const pagedCategories = visibleCategories.slice(firstNumber, firstNumber + PAGE_SIZE);

  const toggleCategory = (code) => setOpenCategory((prev) => (prev === code ? null : code));

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  // The list filters as you type, so submitting just keeps the page from reloading.
  const handleSearch = (event) => event.preventDefault();

  // CSV of every code in the categories currently listed (so it follows the search).
  const exportCsv = () => {
    if (visibleCategories.length === 0) {
      toast.info("There are no master codes to export.", { title: "Export" });
      return;
    }
    const cell = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = [["Category Code", "Category", "Code", "Display Name", "Value", "Status"]];
    visibleCategories.forEach((category) =>
      category.items.forEach((item) =>
        lines.push([
          category.code,
          category.name,
          item.code,
          item.display_name,
          item.value,
          item.is_active ? "Active" : "Inactive",
        ]),
      ),
    );
    // BOM so Excel reads the file as UTF-8.
    const csv = lines.map((row) => row.map(cell).join(",")).join("\r\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "master-codes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    // TODO: export the master codes as a PDF (needs a PDF library).
    toast.info("Exporting master codes as PDF is coming soon.", { title: "Export" });
  };

  return (
    <AdminShell title="Master Codes" breadcrumbs={getBreadcrumbs("management", "master-codes")}>
      <Loader show={loading} />
      <PageCard
        scrollResetKey={currentPage}
        footer={
          visibleCategories.length > 0 && (
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={visibleCategories.length}
              onPageChange={setPage}
            />
          )
        }
        actions={
          <>
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
          <form className="mf-header-search" role="search" onSubmit={handleSearch}>
            <FiSearch size={16} className="mf-header-search-icon" />
            <input
              type="search"
              className="mf-header-search-input"
              placeholder="Search categories or codes..."
              aria-label="Search categories or codes"
              value={query}
              onChange={handleQueryChange}
            />
          </form>
        }
      >
        {visibleCategories.length > 0 ? (
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Category code</th>
                <th>Category</th>
                <th>Codes</th>
                <th aria-label="Expand" />
              </tr>
            </thead>
            <tbody>
              {pagedCategories.map((category, index) => {
                const isOpen = openCategory === category.code;
                return (
                  <Fragment key={category.code}>
                    <tr
                      className={`mf-mc-row${isOpen ? " is-open" : ""}`}
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onClick={() => toggleCategory(category.code)}
                      onKeyDown={(event) =>
                        event.key === "Enter" && toggleCategory(category.code)
                      }
                    >
                      <td className="mf-mc-muted">{firstNumber + index + 1}</td>
                      <td className="mf-mc-code">{category.code}</td>
                      <td>{category.name}</td>
                      <td>
                        {category.items.length}{" "}
                        <span className="mf-mc-muted">({category.active} active)</span>
                      </td>
                      <td className="mf-mc-go">
                        <FiChevronRight size={18} className="mf-mc-chevron" />
                      </td>
                    </tr>
                    <tr className="mf-mc-detail-row">
                      <td colSpan={5}>
                        <div className={`mf-mc-collapse${isOpen ? " is-open" : ""}`}>
                          <div>
                            <table className="mf-mc-subtable">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Code</th>
                                  <th>Display name</th>
                                  <th>Value</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.items.map((item, itemIndex) => (
                                  <tr key={item.code}>
                                    <td className="mf-mc-muted">{itemIndex + 1}</td>
                                    <td className="mf-mc-code">{item.code}</td>
                                    <td>{item.display_name}</td>
                                    <td>{item.value}</td>
                                    <td>
                                      <span
                                        className={`mf-mc-badge${item.is_active ? " is-active" : ""}`}
                                      >
                                        {item.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
              <FiList size={24} />
            </span>
            <h3>Couldn&apos;t load master codes</h3>
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
              <FiList size={24} />
            </span>
            <h3>{isSearching ? "No master codes match" : "No master codes yet"}</h3>
            <p>{isSearching ? "Try a different search." : "Master codes will appear here."}</p>
          </div>
        )}
      </PageCard>
    </AdminShell>
  );
}
