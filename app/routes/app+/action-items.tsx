import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { CheckSquare, Calendar, Users, ArrowRight, Filter } from "lucide-react";
import { useMeetings } from "~/modules/meetings/hooks/use-meetings";
import type { Meeting, ActionItem } from "~/modules/meetings/hooks/use-meetings";

const STATUS_OPTIONS = ["all", "pending", "in_progress", "done"] as const;
type FilterStatus = (typeof STATUS_OPTIONS)[number];

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const statusColor: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  in_progress: "text-accent bg-accent/10 border-accent/20",
  done: "text-primary bg-primary/10 border-primary/20",
};

interface FlatActionItem extends ActionItem {
  meetingId: string;
  meetingTitle: string;
  itemIndex: number;
}

export default function ActionItemsPage() {
  const { meetings, fetchMeetings, loading } = useMeetings();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [localMeetings, setLocalMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetchMeetings({ limit: 100 });
  }, [fetchMeetings]);

  useEffect(() => {
    setLocalMeetings(meetings);
  }, [meetings]);

  const allActionItems: FlatActionItem[] = localMeetings.flatMap((meeting) =>
    meeting.actionItems.map((item, index) => ({
      ...item,
      meetingId: meeting._id,
      meetingTitle: meeting.title,
      itemIndex: index,
    })),
  );

  const filtered =
    statusFilter === "all"
      ? allActionItems
      : allActionItems.filter((a) => a.status === statusFilter);

  const handleStatusChange = useCallback(
    async (
      meetingId: string,
      index: number,
      newStatus: "pending" | "in_progress" | "done",
    ) => {
      const key = `${meetingId}-${index}`;
      setUpdatingKey(key);
      try {
        await fetch(`/api/meetings/${meetingId}/action-items/${index}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        setLocalMeetings((prev) =>
          prev.map((m) => {
            if (m._id !== meetingId) return m;
            const items = [...m.actionItems];
            items[index] = { ...items[index], status: newStatus };
            return { ...m, actionItems: items };
          }),
        );
      } finally {
        setUpdatingKey(null);
      }
    },
    [],
  );

  const cycleStatus = (current: string): "pending" | "in_progress" | "done" => {
    const cycle: Record<string, "pending" | "in_progress" | "done"> = {
      pending: "in_progress",
      in_progress: "done",
      done: "pending",
    };
    return cycle[current] ?? "pending";
  };

  const stats = {
    total: allActionItems.length,
    pending: allActionItems.filter((a) => a.status === "pending").length,
    inProgress: allActionItems.filter((a) => a.status === "in_progress").length,
    done: allActionItems.filter((a) => a.status === "done").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Action Items</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {stats.total} total &bull; {stats.pending} pending &bull; {stats.done} completed
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {statusFilter === "all"
                ? "No action items yet. Process some meetings to get started."
                : `No ${statusFilter.replace("_", " ")} items`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const key = `${item.meetingId}-${item.itemIndex}`;
              const isUpdating = updatingKey === key;
              return (
                <div
                  key={key}
                  className={`px-5 py-4 flex items-start gap-4 transition-opacity ${isUpdating ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() =>
                      handleStatusChange(item.meetingId, item.itemIndex, cycleStatus(item.status))
                    }
                    disabled={isUpdating}
                    className={`mt-0.5 text-xs font-medium px-2 py-0.5 rounded border transition-colors shrink-0 ${statusColor[item.status] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {statusLabel[item.status] ?? item.status}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${item.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {item.assignee && (
                        <span className="text-xs text-muted-foreground">
                          <Users className="w-3 h-3 inline mr-1" />
                          {item.assignee}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/app/meetings/${item.meetingId}`}
                    className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.meetingTitle.length > 20
                      ? item.meetingTitle.slice(0, 20) + "…"
                      : item.meetingTitle}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
