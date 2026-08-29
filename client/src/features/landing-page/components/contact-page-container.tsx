import { useState } from "react";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactPageContainer() {
  const [sending, setSending] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-24 grid gap-12 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Contact</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Let's talk.</h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-lg">
          Questions about pricing, features or migrating from another tool? We usually reply within a few hours.
        </p>
        <div className="mt-8 space-y-4">
          {[
            { icon: Mail, label: "Email", value: "hello@sprintly.app" },
            { icon: MessageCircle, label: "Sales", value: "sales@sprintly.app" },
            { icon: MapPin, label: "Office", value: "Lisbon · Remote-first" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-sm font-medium">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSending(true);
          setTimeout(() => {
            setSending(false);
            toast.success("Message sent — we'll be in touch soon!");
            (e.target as HTMLFormElement).reset();
          }, 700);
        }}
        className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required placeholder="you@company.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Company name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" required rows={5} placeholder="How can we help?" />
        </div>
        <Button type="submit" disabled={sending} className="w-full bg-gradient-brand text-white hover:opacity-90 shadow-glow">
          {sending ? "Sending…" : "Send message"}
        </Button>
      </form>
    </section>
  );
}
