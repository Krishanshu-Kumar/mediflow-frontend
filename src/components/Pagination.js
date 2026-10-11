import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

// 1-based page numbers with "…" gaps, e.g. [1, "…", 4, 5, 6, "…", 12].
function getPageItems(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const items = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...items].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);

  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? ["…", n] : [n]));
}

/** "Showing 1–6 of 14" on the left; first / previous / numbered / next / last on the right. */
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const isFirst = page === 1;
  const isLast = page === pageCount;

  return (
    <div className="mf-pagination">
      <span className="mf-pagination-summary">
        Showing {from}–{to} of {total}
      </span>

      {pageCount > 1 && (
        <nav className="mf-pagination-nav" aria-label="Pagination">
          <button
            type="button"
            className="mf-pagination-btn"
            onClick={() => onPageChange(1)}
            disabled={isFirst}
            aria-label="First page"
            title="First page"
          >
            <FiChevronsLeft size={16} />
          </button>
          <button
            type="button"
            className="mf-pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirst}
            aria-label="Previous page"
            title="Previous page"
          >
            <FiChevronLeft size={16} />
          </button>

          {getPageItems(page, pageCount).map((item, index) =>
            item === "…" ? (
              <span key={`gap-${index}`} className="mf-pagination-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`mf-pagination-btn${item === page ? " is-active" : ""}`}
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            className="mf-pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={isLast}
            aria-label="Next page"
            title="Next page"
          >
            <FiChevronRight size={16} />
          </button>
          <button
            type="button"
            className="mf-pagination-btn"
            onClick={() => onPageChange(pageCount)}
            disabled={isLast}
            aria-label="Last page"
            title="Last page"
          >
            <FiChevronsRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
