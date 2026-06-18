import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/")({
  component: () => <Navigate to="/super-admin/dashboard" />,
});
