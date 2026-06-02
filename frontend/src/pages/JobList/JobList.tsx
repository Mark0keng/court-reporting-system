import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, FileAudio } from "lucide-react";
import Table from "../../components/Table/Table";
import type { Column } from "../../components/Table/Table";
import type { Job } from "./helper";
import { formatDuration, getStatusBadgeClass, getStatusLabel } from "./helper";
import { callAPI, urls } from "../../services/api";
import { useSnackbar } from "../../context/SnackbarContext";
import "./JobList.scss";

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await callAPI(urls.jobList, "GET");
        if (res && res.success) {
          setJobs(res.data);
        }
      } catch (err: any) {
        showSnackbar(err.message || "Failed to load job list", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [showSnackbar]);

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
      key: "assignments",
      header: "Staff Assignment",
      render: (job) => (
        <div className="assignment-cell">
          <div className="assignment-item">
            <span className="assignment-dot dot-reporter"></span>
            <span className="assignment-label">Rep:</span>{" "}
            {job.reporterName || "Unassigned"}
          </div>
          <div className="assignment-item">
            <span className="assignment-dot dot-editor"></span>
            <span className="assignment-label">Ed:</span>{" "}
            {job.editorName || "Unassigned"}
          </div>
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Duration",
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
      className: "w-32",
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
          {job.status === "NEW" && (
            <Link
              to={`/jobs/assign/${job.id}`}
              className="btn-base btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderColor: "transparent",
                borderRadius: "6px",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                textAlign: "center",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
              }}
            >
              <span>Assign Reporter</span>
            </Link>
          )}
          {job.status === "TRANSCRIBED" && (
            <Link
              to={`/jobs/assign-editor/${job.id}`}
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
              <span>Assign Editor</span>
            </Link>
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
            <Briefcase className="page-title-icon" />
            <span>Job Management (Jobs)</span>
          </h1>
          <p className="page-subtitle">
            Manage trial recordings, audio durations, and reporter/editor
            assignments.
          </p>
        </div>

        <Link to="/jobs/create" className="btn-base btn-primary btn-md">
          <Plus
            style={{
              width: "1rem",
              height: "1rem",
              marginRight: "0.5rem",
              flexShrink: 0,
            }}
          />
          <div>Register New Trial</div>
        </Link>
      </div>

      <div className="page-content-full">
        <div className="table-section-header">
          <h2 className="table-title">
            <FileAudio className="table-title-icon" />
            <span>Trial Transcription List</span>
          </h2>
          <span className="badge-counter">{jobs.length} Active Files</span>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            Loading job list from server...
          </div>
        ) : (
          <Table<Job>
            columns={columns}
            data={jobs}
            rowKey={(job) => job.id}
            emptyMessage="No active trial reporting registered."
          />
        )}
      </div>
    </div>
  );
};

export default JobList;
