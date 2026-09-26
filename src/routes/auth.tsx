import { createFileRoute, redirect } from "@tanstack/react-router";

// Kept so older links and the sign-in gate still work; the real page is /login.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
