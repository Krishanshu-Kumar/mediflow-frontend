"use client";

import { useState } from "react";
import AdminShell from "@/components/AdminShell";
import { DEFAULT_SECTION, getBreadcrumbs } from "@/const/navigation";

export default function Dashboard() {
  const [nav, setNav] = useState({ section: DEFAULT_SECTION, child: null });

  return (
    <AdminShell
      title="Dashboard"
      breadcrumbs={getBreadcrumbs(nav.section, nav.child)}
      onNavigate={(section, child) => setNav({ section, child })}
    >
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <h2 className="display-6 fw-bold mb-2">Welcome to MediFlow</h2>
        <p className="text-muted">You&apos;re logged in.</p>
      </div>
    </AdminShell>
  );
}
