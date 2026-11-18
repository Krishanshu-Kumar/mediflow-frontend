"use client";

import { FiPlus } from "react-icons/fi";
import { FaGavel } from "react-icons/fa";
import AdminShell from "@/components/AdminShell";
import PageCard from "@/components/PageCard";
import { getBreadcrumbs } from "@/const/navigation";

export default function TendersPage() {
  return (
    <AdminShell title="All Tenders" breadcrumbs={getBreadcrumbs("tenders", "all-tenders")}>
      <PageCard
        actions={
          <button type="button" className="mf-page-card-btn mf-page-card-btn--add">
            <FiPlus size={16} />
            Add Tender
          </button>
        }
      >
        <div className="mf-page-card-empty">
          <span className="mf-page-card-empty-icon">
            <FaGavel size={22} />
          </span>
          <h3>No tenders yet</h3>
          <p>Tenders will appear here.</p>
        </div>
      </PageCard>
    </AdminShell>
  );
}
