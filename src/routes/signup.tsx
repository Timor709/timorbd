import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — TIMOR" },
      { name: "description", content: "Create your TIMOR account for faster checkout." },
      { property: "og:title", content: "Sign up — TIMOR" },
      { property: "og:description", content: "Create your TIMOR account for faster checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
