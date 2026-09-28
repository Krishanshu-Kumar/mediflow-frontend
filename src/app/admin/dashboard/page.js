"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DEFAULT_SECTION, getBreadcrumbs } from "@/const/navigation";

export default function Dashboard() {
  const [nav, setNav] = useState({ section: DEFAULT_SECTION, child: null });

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar onNavigate={(section, child) => setNav({ section, child })} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Header title="Dashboard" breadcrumbs={getBreadcrumbs(nav.section, nav.child)} />
        <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <h2 className="display-6 fw-bold mb-2">Welcome to MediFlow</h2>
          <p className="text-muted">You&apos;re logged in.</p>
        </main>
        <Footer />
      </div>
    </div>
  );
}
