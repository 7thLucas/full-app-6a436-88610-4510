import { useConfigurables } from "~/modules/configurables";

export default function SettingsPage() {
  const { config } = useConfigurables();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">App configuration and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            App
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">App Name</p>
                <p className="text-xs text-muted-foreground">Displayed throughout the interface</p>
              </div>
              <span className="text-sm text-muted-foreground">{config?.appName ?? "autoMoM"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Tagline</p>
              </div>
              <span className="text-sm text-muted-foreground max-w-xs text-right">
                {config?.appTagline ?? "Never Lose a Decision Again"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            AI Processing
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Max Action Items Per Meeting</p>
                <p className="text-xs text-muted-foreground">Limit extracted per recording</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {config?.maxActionItemsPerMeeting ?? 50}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Default Project</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {config?.defaultProjectName ?? "General"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Reminders
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Reminders</p>
                <p className="text-xs text-muted-foreground">Send reminders for pending actions</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  config?.enableEmailReminders
                    ? "text-primary bg-primary/10 border-primary/20"
                    : "text-muted-foreground bg-muted border-border"
                }`}
              >
                {config?.enableEmailReminders ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Reminder Lead Time</p>
                <p className="text-xs text-muted-foreground">Days before due date</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {config?.actionItemReminderDays ?? 2} days
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        These settings are managed through the admin portal. Contact your workspace admin to make changes.
      </p>
    </div>
  );
}
