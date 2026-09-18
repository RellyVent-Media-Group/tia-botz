import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { HEART_CALENDAR, DAYS_PER_YEAR, MONTHS_PER_YEAR, DAYS_PER_MONTH, SAMPLE_EVENTS, type HeartMonth } from "@/lib/calendar";
import React from "react";

export const Route = createFileRoute("/calendar")({ component: Calendar });

function Calendar() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(0);
  const [currentYear, setCurrentYear] = React.useState<number>(1);

  const currentMonth = HEART_CALENDAR[selectedMonth];

  const generateDays = (month: HeartMonth) => {
    return Array.from({ length: Math.floor(month.days) }, (_, i) => i + 1);
  };

  const getSeasonalColor = (tagType?: string) => {
    switch (tagType) {
      case 'equinox': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
      case 'solstice': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'causing': return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
      case 'effecting': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      default: return 'text-muted-foreground border-border bg-card';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 no-underline text-foreground hover:text-primary">
            <span className="text-sm font-semibold">← Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Heart Calendar System</span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Zori Calendar
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold md:text-6xl">Heart Calendar</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A 13-month calendar system with exactly 28 days per month (364 days total).
            Year starts in Zori on May 21.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Months per Year</div>
            <div className="font-display text-3xl font-bold text-primary">{MONTHS_PER_YEAR}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Days per Month</div>
            <div className="font-display text-3xl font-bold text-primary">{DAYS_PER_MONTH}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Days per Year</div>
            <div className="font-display text-3xl font-bold text-primary">{DAYS_PER_YEAR}</div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentYear(Math.max(1, currentYear - 1))}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
            >
              ← Prev Year
            </button>
            <span className="font-display text-2xl font-bold">Year {currentYear}</span>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
            >
              Next Year →
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-6">
            {HEART_CALENDAR.map((month, idx) => (
              <button
                key={month.name}
                onClick={() => setSelectedMonth(idx)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  selectedMonth === idx
                    ? 'border-primary bg-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{month.name}</div>
                {month.seasonalTag && (
                  <div className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${getSeasonalColor(month.seasonalTag.type)}`}>
                    {month.seasonalTag.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">{currentMonth.name}</h2>
              {currentMonth.seasonalTag && (
                <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${getSeasonalColor(currentMonth.seasonalTag.type)}`}>
                  <span className="font-semibold">{currentMonth.seasonalTag.name}</span>
                  <span className="text-muted-foreground">({currentMonth.seasonalTag.type})</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Days</div>
              <div className="font-display text-2xl font-bold">{currentMonth.days}</div>
            </div>
          </div>

          {currentMonth.startDate && (
            <div className="mb-6 rounded-lg bg-accent/50 p-4">
              <div className="text-sm text-muted-foreground">Year Start Date (Gregorian)</div>
              <div className="font-semibold">{currentMonth.startDate}</div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-4 md:grid-cols-7">
            {generateDays(currentMonth).map((day) => (
              <div
                key={day}
                className="flex aspect-square items-center justify-center rounded-lg border border-border bg-card/50 text-center text-sm hover:border-primary/50 hover:bg-accent"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-bold mb-6">All Months Overview</h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Days</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Seasonal Tag</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tag Type</th>
                </tr>
              </thead>
              <tbody>
                {HEART_CALENDAR.map((month, idx) => (
                  <tr key={month.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{month.name}</td>
                    <td className="px-4 py-3">{month.days}</td>
                    <td className="px-4 py-3">{month.seasonalTag?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {month.seasonalTag && (
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${getSeasonalColor(month.seasonalTag.type)}`}>
                          {month.seasonalTag.type}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-bold mb-6">Production Events</h3>
          <p className="text-muted-foreground mb-6">
            Events imported from production calendar, mapped to the Heart Calendar system.
          </p>
          <div className="space-y-4">
            {SAMPLE_EVENTS.map((event) => (
              <div key={event.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {event.heartDate.month.name} {event.heartDate.day}, Year {event.heartDate.year}
                    </div>
                  </div>
                  {event.type && (
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {event.type}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                {event.gregorianDate && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Gregorian: {event.gregorianDate.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
