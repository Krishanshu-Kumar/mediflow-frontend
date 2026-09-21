import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <h1 className="display-6 fw-bold mb-2">Welcome to MediFlow</h1>
        <p className="text-muted">You&apos;re logged in.</p>
      </div>
    </div>
  );
}
