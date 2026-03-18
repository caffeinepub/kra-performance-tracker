interface PeriodBadgeProps {
  period: string;
}

export function PeriodBadge({ period }: PeriodBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    daily: {
      label: "Daily",
      className: "bg-status-blue/10 text-status-blue border-status-blue/20",
    },
    monthly: {
      label: "Monthly",
      className: "bg-status-amber/10 text-status-amber border-status-amber/20",
    },
    quarterly: {
      label: "Quarterly",
      className: "bg-status-green/10 text-status-green border-status-green/20",
    },
  };

  const cfg = config[period.toLowerCase()] ?? {
    label: period,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        cfg.className
      }`}
    >
      {cfg.label}
    </span>
  );
}
