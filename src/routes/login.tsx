import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — TIMOR" },
      { name: "description", content: "Log in to your TIMOR account." },
      { property: "og:title", content: "Log in — TIMOR" },
      { property: "og:description", content: "Log in to your TIMOR account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="signin" />,
});
