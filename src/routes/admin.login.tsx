import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin log in — TIMOR" },
      { name: "description", content: "Store manager access for TIMOR." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin log in — TIMOR" },
      { property: "og:description", content: "Store manager access for TIMOR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthForm,
});
