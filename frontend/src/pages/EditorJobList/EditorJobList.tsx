import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileAudio, FileText } from "lucide-react";
import Table from "../../components/Table/Table.js";
import type { Column } from "../../components/Table/Table.js";
import { useAuth } from "../../context/AuthContext.js";
import { useSnackbar } from "../../context/SnackbarContext.js";
import { callAPI, urls } from "../../services/api.js";
import {
  formatDuration,
  getStatusBadgeClass,
  getStatusLabel,
} from "../JobList/helper.js";
import "./EditorJobList.scss";

interface Job {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  status: "NEW" | "ASSIGNED" | "TRANSCRIBED" | "REVIEWED" | "COMPLETED";
  location: string;
  reporterName: string;
  editorName: string;
}

export const EditorJobList: React.FC = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await callAPI(urls.editorJobList(user.id), "GET");
        if (res && res.success) {
          setJobs(res.data);
        } else {
          throw new Error(res?.message || "Failed to load review jobs");
        }
      } catch (err: any) {
        showSnackbar(err.message || "Failed to load job list", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user, showSnackbar]);

  const columns: Column<Job>[] = [
    {
      key: "id",
      header: "Job ID",
      className: "w-24",
      render: (job) => <span className="job-id-badge">#{job.id}</span>,
    },
    {
      key: "title",
      header: "Case / Trial Title",
      className: "max-w-xs sm:max-w-sm",
      render: (job) => (
        <div className="job-info-cell">
          <span className="job-title">{job.title}</span>
          <span className="job-desc">
            {job.description || "No description."}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Trial Location",
      className: "w-36",
      render: (job) => {
        const isRemote =
          !job.location || job.location.toLowerCase() === "remote";
        return (
          <span
            className="badge-status"
            style={{
              backgroundColor: isRemote
                ? "rgba(99, 102, 241, 0.1)"
                : "rgba(245, 158, 11, 0.1)",
              color: isRemote ? "#818cf8" : "#fbbf24",
              borderColor: isRemote
                ? "rgba(99, 102, 241, 0.2)"
                : "rgba(245, 158, 11, 0.2)",
              fontSize: "9px",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {isRemote ? "Remote" : job.location}
          </span>
        );
      },
    },
    {
      key: "metadata",
      header: "Audio Duration",
      className: "w-36",
      render: (job) => (
        <div className="metadata-cell">
          <div className="metadata-item">
            <FileAudio />
            <span>{formatDuration(job.audioDurationSeconds)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-36",
      render: (job) => (
        <span className={getStatusBadgeClass(job.status)}>
          {getStatusLabel(job.status)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-36 text-right",
      render: (job) => (
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {job.status === "REVIEWED" ? (
            <Link
              to={`/editor/submit/${job.id}`}
              className="btn-base btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                borderColor: "transparent",
                borderRadius: "6px",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
                textAlign: "center",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
              }}
            >
              <FileText className="w-3 h-3 mr-1 inline-block" />
              <span>Review Transcript</span>
            </Link>
          ) : job.status === "COMPLETED" ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#34d399",
                textAlign: "center",
              }}
            >
              Review Completed
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              Waiting for Transcription
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="jobs-page-container animate-fade-in">
      {/* Page Title Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase className="page-title-icon text-indigo-400" />
            <span>My Review Jobs (Assigned Review Jobs)</span>
          </h1>
          <p className="page-subtitle">
            Review transcript drafts of court recordings sent by reporters, check them, and submit the final version.
          </p>
        </div>
      </div>

      <div className="page-content-full">
        <div className="table-section-header">
          <h2 className="table-title">
            <Briefcase className="table-title-icon text-indigo-400" />
            <span>Assigned Trials List</span>
          </h2>
          <span className="badge-counter bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {jobs.length} Proceeding(s)
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table<Job>
            columns={columns}
            data={jobs}
            rowKey={(job) => job.id}
          />
        )}
      </div>
    </div>
  );
};

export default EditorJobList;
