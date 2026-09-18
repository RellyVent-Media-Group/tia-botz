import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Section, SectionEyebrow } from "@/components/section";
import { cn } from "@/lib/utils";

const intents = ["Commission", "Press kit", "Collaboration", "Licensing"] as const;

const schema = z.object({
  name: z.string().min(2, "Please add your name."),
  email: z.email("A valid email is required."),
  intent: z.enum(intents),
  message: z.string().min(12, "A little more context helps the studio."),
});

type Values = z.infer<typeof schema>;

const STORAGE_KEY = "gmo-inquiries";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      intent: "Commission",
      message: "",
    },
  });

  const intent = form.watch("intent");

  function onSubmit(values: Values) {
    const next = {
      ...values,
      at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...prev].slice(0, 20)));
    } catch {
      /* private mode or quota — still acknowledge */
    }
    setSent(true);
    toast.success("Inquiry noted. The studio has the plate.");
    form.reset();
  }

  return (
    <Section
      id="contact"
      innerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16"
    >
        <div className="lg:col-span-5">
          <SectionEyebrow>Inquire</SectionEyebrow>
          <h2 className="font-display text-section mt-3 font-medium">
            Commission a plate, or request the kit.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            RellyVent Media Group accepts a limited number of construction
            commissions each season — new characters, shot expansions, and
            universe translations.
          </p>
        </div>

        <div className="lg:col-span-7">
          {sent ? (
            <div className="rounded-xl border border-border bg-card p-8 sm:p-10">
              <p className="text-xs tracking-label text-primary uppercase">Received</p>
              <h3 className="font-display mt-3 text-3xl font-medium">
                Thank you.
              </h3>
              <p className="mt-3 max-w-md text-muted-foreground">
                Your note is on the studio desk. We’ll reply with availability
                and next plates.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-8"
                onClick={() => setSent(false)}
              >
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" autoComplete="name" {...form.register("name")} />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xs font-medium tracking-label text-muted-foreground uppercase">
                  Intent
                </legend>
                <div className="flex flex-wrap gap-2">
                  {intents.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => form.setValue("intent", item, { shouldValidate: true })}
                      className={cn(
                        "h-11 rounded-full border px-4 text-sm transition-[background-color,color,border-color] duration-150",
                        intent === item
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us the character, the shot, the channel."
                  {...form.register("message")}
                />
                {form.formState.errors.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                ) : null}
              </div>

              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                Send inquiry
              </Button>
            </form>
          )}
        </div>
    </Section>
  );
}
