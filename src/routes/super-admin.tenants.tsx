import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/tenants")({
  component: () => <Outlet />,
});
