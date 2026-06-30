type Status = "uploading" | "processing" | "completed" | "failed" | "pending" | "in_progress" | "done";

const statusConfig: Record<Status, { label: string; className: string }> = {
  uploading:   { label: "Uploading",    className: "bg-accent/10 text-accent border-accent/20" },
  processing:  { label: "Processing",   className: "bg-accent/10 text-accent border-accent/20" },
  completed:   { label: "Completed",    className: "bg-primary/10 text-primary border-primary/20" },
  failed:      { label: "Failed",       className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending:     { label: "Pending",      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  in_progress: { label: "In Progress",  className: "bg-accent/10 text-accent border-accent/20" },
  done:        { label: "Done",         className: "bg-primary/10 text-primary border-primary/20" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status as Status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
