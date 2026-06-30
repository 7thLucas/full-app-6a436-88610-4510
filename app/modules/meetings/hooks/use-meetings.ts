import { useState, useCallback } from "react";

export interface ActionItem {
  title: string;
  description: string;
  assignee?: string | null;
  dueDate?: string | null;
  status: "pending" | "in_progress" | "done";
  createdAt: string;
}

export interface KeyDecision {
  title: string;
  details: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: "uploading" | "processing" | "completed" | "failed";
  audioUrl?: string | null;
  ticketId?: string | null;
  transcript: string;
  summary: string;
  actionItems: ActionItem[];
  keyDecisions: KeyDecision[];
  participants: string[];
  meetingDate?: string | null;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingStats {
  totalMeetings: number;
  completedMeetings: number;
  processingMeetings: number;
  totalActionItems: number;
  pendingActionItems: number;
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ success: boolean; data: T; message: string }> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  return res.json();
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(
    async (params: { page?: number; limit?: number; projectId?: string; status?: string } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (params.page) qs.set("page", String(params.page));
        if (params.limit) qs.set("limit", String(params.limit));
        if (params.projectId) qs.set("projectId", params.projectId);
        if (params.status) qs.set("status", params.status);
        const res = await apiFetch<{ items: Meeting[]; total: number }>(
          `/api/meetings?${qs.toString()}`,
        );
        if (res.success) {
          setMeetings(res.data.items);
          setTotal(res.data.total);
        } else {
          setError(res.message);
        }
      } catch {
        setError("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createMeeting = useCallback(
    async (data: {
      title: string;
      description?: string;
      projectId?: string;
      projectName?: string;
      meetingDate?: string;
      participants?: string[];
    }) => {
      const res = await apiFetch<Meeting>("/api/meetings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    [],
  );

  const updateMeeting = useCallback(async (id: string, data: Partial<Meeting>) => {
    const res = await apiFetch<Meeting>(`/api/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.success) throw new Error(res.message);
    return res.data;
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/meetings/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.message);
  }, []);

  const updateActionItemStatus = useCallback(
    async (meetingId: string, index: number, status: "pending" | "in_progress" | "done") => {
      const res = await apiFetch<Meeting>(
        `/api/meetings/${meetingId}/action-items/${index}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    [],
  );

  return {
    meetings,
    total,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateActionItemStatus,
  };
}

export function useMeetingStats() {
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<MeetingStats>("/api/meetings/stats");
      if (res.success) setStats(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, fetchStats };
}

export function useMeetingDetail(id: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Meeting>(`/api/meetings/${id}`);
      if (res.success) setMeeting(res.data);
      else setError(res.message);
    } catch {
      setError("Failed to load meeting");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refresh = fetchMeeting;

  return { meeting, setMeeting, loading, error, fetchMeeting, refresh };
}

export function useProjects() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; meetingCount: number }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Array<{ id: string; name: string; meetingCount: number }>>(
        "/api/meetings/projects",
      );
      if (res.success) setProjects(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, loading, fetchProjects };
}
