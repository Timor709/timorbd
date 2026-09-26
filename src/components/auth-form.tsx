import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdmin } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  fullName: z.string().trim().max(100).optional(),
});

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { full_name: parsed.data.fullName },
          },
        });
        if (err) throw err;
        if (!data.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });
          if (signInErr) throw signInErr;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (err) throw err;
      }
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("profiles").upsert({
          id: u.user.id,
          email: u.user.email ?? null,
          full_name: (u.user.user_metadata?.["full_name"] as string | undefined) ?? null,
        });
      }
      navigate({ to: u.user && (await isAdmin(u.user.id)) ? "/admin" : "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-20">
      <p className="eyebrow">Store access</p>
      <h1 className="mt-3 text-4xl font-light">{mode === "signin" ? "Log in" : "Create account"}</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {info && <p className="text-sm text-muted-foreground">{info}</p>}
        <button type="submit" disabled={busy} className="btn-ember w-full justify-center">
          {busy ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
        </button>
      </form>
      <Link
        to={mode === "signin" ? "/signup" : "/login"}
        className="mt-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
      >
        {mode === "signin" ? "New here? Create an account" : "Have an account? Log in"}
      </Link>
    </div>
  );
}
