"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Shared admin layout, fixed to the viewport: the sidebar, header and footer always stay in
 * place and only `children` (the page content) scrolls.
 */
export default function AdminShell({ title, breadcrumbs, onNavigate, children }) {
  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar onNavigate={onNavigate} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, minHeight: 0 }}>
        <Header title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflowY: "auto" }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
