"use client";

import AdminShell from "@/components/AdminShell";
import PageCard from "@/components/PageCard";
import { getBreadcrumbs } from "@/const/navigation";

export default function TenderItemsPage() {
  return (
    <AdminShell title="Items" breadcrumbs={getBreadcrumbs("tenders", "tender-items")}>
      <PageCard>
        <div style={{ padding: 24 }}>Items coming soon.</div>
      </PageCard>
    </AdminShell>
  );
}
