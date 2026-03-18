import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Star, TrendingUp } from "lucide-react";
import { useAllSummaries } from "../hooks/useQueries";
import { PeriodBadge } from "./PeriodBadge";
import { StarRating } from "./StarRating";

export function KeyMetricsSidebar() {
  const { data: summaries = [], isLoading } = useAllSummaries();

  const totalEntries = summaries.reduce(
    (acc, s) => acc + Number(s.totalEntries),
    0,
  );
  const avgSelf =
    summaries.filter((s) => s.averageSelfRating != null).length > 0
      ? summaries
          .filter((s) => s.averageSelfRating != null)
          .reduce((acc, s) => acc + (s.averageSelfRating ?? 0), 0) /
        summaries.filter((s) => s.averageSelfRating != null).length
      : 0;
  const avgHOD =
    summaries.filter((s) => s.averageHODRating != null).length > 0
      ? summaries
          .filter((s) => s.averageHODRating != null)
          .reduce((acc, s) => acc + (s.averageHODRating ?? 0), 0) /
        summaries.filter((s) => s.averageHODRating != null).length
      : 0;

  return (
    <aside className="space-y-4">
      {/* Key Metrics */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div data-ocid="metrics.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <MetricRow
                icon={
                  <ListChecks size={14} className="text-muted-foreground" />
                }
                label="Total KRAs"
                value={String(totalEntries)}
              />
              <MetricRow
                icon={<Star size={14} className="text-star" />}
                label="Avg Self Rating"
                value={
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">
                      {avgSelf.toFixed(1)}
                    </span>
                    <StarRating
                      value={Math.round(avgSelf)}
                      readonly
                      size={12}
                    />
                  </div>
                }
              />
              <MetricRow
                icon={<Star size={14} className="text-primary" />}
                label="Avg HOD Rating"
                value={
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">
                      {avgHOD.toFixed(1)}
                    </span>
                    <StarRating value={Math.round(avgHOD)} readonly size={12} />
                  </div>
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Per-period breakdown */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Period Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No data yet
            </p>
          ) : (
            summaries.map((s) => (
              <div
                key={s.period}
                className="rounded-md border border-border p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <PeriodBadge period={s.period} />
                  <span className="text-xs text-muted-foreground">
                    {Number(s.totalEntries)}{" "}
                    {Number(s.totalEntries) === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Self</span>
                  <StarRating
                    value={Math.round(s.averageSelfRating ?? 0)}
                    readonly
                    size={11}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">HOD</span>
                  <StarRating
                    value={Math.round(s.averageHODRating ?? 0)}
                    readonly
                    size={11}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deadlines (static illustrative) */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              label: "Q1 Review",
              date: "Mar 31, 2026",
              color: "text-status-green",
            },
            {
              label: "Monthly Report",
              date: "Mar 31, 2026",
              color: "text-status-amber",
            },
            {
              label: "Daily Sync",
              date: "Mar 18, 2026",
              color: "text-status-blue",
            },
          ].map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-foreground font-medium">{d.label}</span>
              <span className={`${d.color} font-medium`}>{d.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-card-foreground">{value}</div>
    </div>
  );
}
