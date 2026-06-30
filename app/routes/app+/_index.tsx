import { useEffect } from "react";
import { Link } from "react-router";
import { Video, CheckSquare, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { useMeetingStats, useMeetings } from "~/modules/meetings/hooks/use-meetings";
import { StatCard } from "~/modules/meetings/components/stat-card";
import { StatusBadge } from "~/modules/meetings/components/status-badge";
import { useConfigurables } from "~/modules/configurables";

export default function DashboardPage() {
  const { config } = useConfigurables();
  const { stats, fetchStats } = useMeetingStats();
  const { meetings, fetchMeetings } = useMeetings();

  useEffect(() => {
    fetchStats();
    fetchMeetings({ limit: 5 });
  }, [fetchStats, fetchMeetings]);

  const appName = config?.appName ?? "autoMoM";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{appName} Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {config?.appTagline ?? "Never Lose a Decision Again"}
          </p>
        </div>
        <Link
          to="/app/meetings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Meetings"
          value={stats?.totalMeetings ?? 0}
          icon={Video}
        />
        <StatCard
          label="Completed"
          value={stats?.completedMeetings ?? 0}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Action Items"
          value={stats?.totalActionItems ?? 0}
          icon={CheckSquare}
        />
        <StatCard
          label="Pending Tasks"
          value={stats?.pendingActionItems ?? 0}
          icon={Clock}
          sublabel="need attention"
        />
      </div>

      {/* Recent meetings */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Meetings</h2>
          <Link
            to="/app/meetings"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="py-12 text-center">
            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No meetings yet</p>
            <Link
              to="/app/meetings/new"
              className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
            >
              <Plus className="w-3 h-3" /> Upload your first recording
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {meetings.map((meeting) => (
              <Link
                key={meeting._id}
                to={`/app/meetings/${meeting._id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {meeting.projectName} &bull;{" "}
                    {meeting.meetingDate
                      ? new Date(meeting.meetingDate).toLocaleDateString()
                      : new Date(meeting.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {meeting.actionItems.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {meeting.actionItems.length} actions
                    </span>
                  )}
                  <StatusBadge status={meeting.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/action-items"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors group"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Review Action Items</p>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingActionItems ?? 0} pending tasks across all meetings
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/app/projects"
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors group"
        >
          <div className="p-2.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <Video className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Browse by Project</p>
            <p className="text-xs text-muted-foreground">Organize meetings by team or project</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}
