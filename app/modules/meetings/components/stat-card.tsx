import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
  sublabel?: string;
}

export function StatCard({ label, value, icon: Icon, accent, sublabel }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accent ? "text-primary" : "text-foreground"}`}>
            {value}
          </p>
          {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${accent ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
}
