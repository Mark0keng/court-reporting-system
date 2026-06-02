export interface JobInput {
  title: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  reporterId?: number;
  editorId?: number;
  location: string;
}

export interface Job extends JobInput {
  id: number;
  status: "NEW" | "ASSIGNED" | "TRANSCRIBED" | "REVIEWED" | "COMPLETED";
  createdAt: string;
  reporterName: string;
  editorName: string;
}

export const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} hrs ${mins} mins`;
  }
  return `${mins} mins`;
};

export const getStatusBadgeClass = (status: Job["status"]) => {
  return `badge-status status-${status}`;
};

export const getStatusLabel = (status: Job["status"]) => {
  const labels: Record<Job["status"], string> = {
    NEW: "New",
    ASSIGNED: "Reporter Assigned",
    TRANSCRIBED: "Transcribed",
    REVIEWED: "Editor Assigned",
    COMPLETED: "Completed",
  };
  return labels[status] || status;
};
