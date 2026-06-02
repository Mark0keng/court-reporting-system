import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext.js";
import {
  ArrowLeft,
  UserCheck,
  MapPin,
  Activity,
  DollarSign,
  FileAudio,
} from "lucide-react";
import { callAPI, urls } from "../../services/api.js";
import { formatDuration } from "../JobList/helper.js";
import "./JobAssign.scss";

interface Reporter {
  id: number;
  name: string;
  email: string;
  role: string;
  baseRate: string;
  location: string;
  availability: boolean;
}

interface Job {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  status: string;
  location: string;
  reporterName: string;
  editorName: string;
}

export const JobAssign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [job, setJob] = useState<Job | null>(null);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Fetch target job details directly by ID
        const jobRes = await callAPI("/api/job/" + id, "GET");
        if (!jobRes || !jobRes.success || !jobRes.data) {
          throw new Error("Trial/Job not found.");
        }

        setJob(jobRes.data);

        // 2. Fetch recommended reporters for this job
        const reportersRes = await callAPI(
          urls.reporterRecommendList,
          "GET",
          null,
          { jobId: id },
        );
        if (reportersRes && reportersRes.success) {
          setReporters(reportersRes.data);
        } else {
          throw new Error("Failed to load reporter recommendations");
        }
      } catch (err: any) {
        showSnackbar(
          err.message || "An error occurred while loading data",
          "error",
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate, showSnackbar]);

  const handleAssign = async (reporterId: number, reporterName: string) => {
    try {
      setAssigningId(reporterId);
      const res = await callAPI(urls.jobAssignReporter, "POST", {
        jobId: Number(id),
        reporterId: reporterId,
      });

      if (res && res.success) {
        showSnackbar(
          `Reporter ${reporterName} successfully assigned to trial!`,
          "success",
        );
        navigate("/");
      } else {
        throw new Error(res?.message || "Failed to assign reporter");
      }
    } catch (err: any) {
      showSnackbar(err.message || "A system error occurred", "error");
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="jobs-page-container flex items-center justify-center p-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">
            Loading reporter recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isRemote = !job.location || job.location.toLowerCase() === "remote";

  return (
    <div className="jobs-page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to Job List
          </Link>
          <h1 className="page-title mt-2">
            <UserCheck className="page-title-icon" />
            <span>Court Reporter Assignment</span>
          </h1>
          <p className="page-subtitle">
            Assign the best reporter based on physical trial location or staff availability.
          </p>
        </div>
      </div>

      <div className="assign-layout">
        {/* Job Detail Card */}
        <div className="assign-job-card">
          <div className="card-header">
            <span className="job-id-badge">#{job.id}</span>
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
                fontSize: "10px",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {isRemote ? "Remote" : job.location}
            </span>
          </div>

          <h2 className="job-title-large">{job.title}</h2>
          <p className="job-desc-large">
            {job.description || "No detailed description of the trial."}
          </p>

          <div className="job-meta-grid">
            <div className="meta-block">
              <MapPin className="meta-icon" />
              <div>
                <span className="meta-label">Trial Location</span>
                <span className="meta-val">
                  {isRemote
                    ? "Remote Job"
                    : `Physical in ${job.location}`}
                </span>
              </div>
            </div>

            <div className="meta-block">
              <FileAudio className="meta-icon" />
              <div>
                <span className="meta-label">Audio Duration</span>
                <span className="meta-val">
                  {formatDuration(job.audioDurationSeconds)} (
                  {Math.round(job.audioDurationSeconds / 60)} Minutes)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Reporters Section */}
        <div className="reporters-list-section">
          <div className="section-title-bar">
            <h3 className="section-title">
              Available Reporters {isRemote ? "" : `in ${job.location}`}
            </h3>
            <span className="badge-counter">
              {reporters.length} Reporters found
            </span>
          </div>

          {reporters.length === 0 ? (
            <div className="empty-reporters-state">
              <div className="empty-illustration">⚠️</div>
              <p className="empty-text">
                No active reporters are currently available in{" "}
                <strong>{job.location}</strong>.
              </p>
              <p className="empty-subtext">
                Please register a new reporter or change reporter availability in the Staff Management menu.
              </p>
            </div>
          ) : (
            <div className="reporters-grid">
              {reporters.map((reporter) => (
                <div key={reporter.id} className="reporter-card">
                  <div className="reporter-avatar-section">
                    <div className="reporter-avatar">
                      {reporter.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="reporter-name">{reporter.name}</h4>
                      <p className="reporter-email">{reporter.email}</p>
                    </div>
                  </div>

                  <div className="reporter-info-list">
                    <div className="info-row">
                      <div className="info-label">
                        <MapPin className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Location
                      </div>
                      <div className="info-value">
                        {reporter.location || "Not set"}
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Activity className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Availability
                      </div>
                      <div className="info-value">
                        <span className="status-indicator available">
                          Available
                        </span>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <DollarSign className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Base Rate
                      </div>
                      <div className="info-value rate-value">
                        Rp {Number(reporter.baseRate).toLocaleString("id-ID")} /
                        Minute
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssign(reporter.id, reporter.name)}
                    disabled={assigningId !== null}
                    className="assign-action-btn"
                  >
                    {assigningId === reporter.id ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <span>Assign to This Trial</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAssign;
