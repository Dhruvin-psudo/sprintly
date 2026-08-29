import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/mock-data";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/router/constants/routes";

const compareRows: [string, (string | boolean)[]][] = [
  ["Projects", ["3", "Unlimited", "Unlimited"]],
  ["Workspaces", ["1", "5", "Unlimited"]],
  ["Kanban board", [true, true, true]],
  ["Calendar & timeline", [false, true, true]],
  ["Advanced reports", [false, true, true]],
  ["Custom roles", [false, true, true]],
  ["SSO / SAML", [false, false, true]],
  ["Audit log", [false, false, true]],
  ["Priority support", [false, true, true]],
];

export function Pricing() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 text-center">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Pricing</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight">Simple, fair pricing.</h1>
        <p className="mt-5 max-w-2xl mx-auto text-muted-foreground text-lg">
          Free forever for solo founders. Only pay when your team grows.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 flex flex-col relative ${
              p.highlighted ? "border-primary/50 bg-card shadow-glow" : "border-border/60 bg-card"
            }`}
          >
            {p.highlighted && (
              <Badge className="absolute -top-3 right-6 bg-gradient-brand text-white border-0">Most popular</Badge>
            )}
            <p className="text-sm font-semibold">{p.name}</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold">${p.price}</span>
              <span className="text-xs text-muted-foreground">{p.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
            <ul className="mt-6 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to={PUBLIC_ROUTES.REGISTER} className="mt-6">
              <Button className={`w-full ${p.highlighted ? "bg-gradient-brand text-white hover:opacity-90 shadow-glow" : ""}`} variant={p.highlighted ? "default" : "outline"}>
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-bold mb-6">Compare plans</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.name} className="text-left p-4 font-semibold">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map(([label, vals]) => (
                <tr key={label} className="border-b border-border/60 last:border-0">
                  <td className="p-4 text-muted-foreground">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="p-4">
                      {typeof v === "boolean" ? (
                        v ? <Check className="size-4 text-primary" /> : <X className="size-4 text-muted-foreground/40" />
                      ) : (
                        <span className="font-medium">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}