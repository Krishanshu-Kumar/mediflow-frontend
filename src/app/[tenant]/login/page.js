import Login from "@/components/Login";

export default async function TenantLoginPage({ params }) {
  const { tenant } = await params;
  return <Login tenantSlug={decodeURIComponent(tenant).toLowerCase()} />;
}
