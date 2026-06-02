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
import "./JobAssignEditor.scss";

interface Editor {
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

export const JobAssignEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [job, setJob] = useState<Job | null>(null);
  const [editors, setEditors] = useState<Editor[]>([]);
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

        // 2. Fetch recommended editors for this job
        const editorsRes = await callAPI(urls.editorRecommendList, "GET");
        if (editorsRes && editorsRes.success) {
          setEditors(editorsRes.data);
        } else {
          throw new Error("Failed to load editor recommendations");
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

  const handleAssign = async (editorId: number, editorName: string) => {
    try {
      setAssigningId(editorId);
      const res = await callAPI(urls.assignEditor, "POST", {
        jobId: Number(id),
        editorId: editorId,
      });

      if (res && res.success) {
        showSnackbar(
          `Editor ${editorName} successfully assigned to trial!`,
          "success",
        );
        navigate("/");
      } else {
        throw new Error(res?.message || "Failed to assign editor");
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
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">
            Loading editor recommendations...
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
            <UserCheck className="page-title-icon text-indigo-400" />
            <span>Court Editor Assignment</span>
          </h1>
          <p className="page-subtitle">
            Assign available editors to review the transcriptions of court files.
          </p>
        </div>
      </div>

      <div className="assign-layout">
        {/* Job Detail Card */}
        <div className="assign-job-card card-editor">
          <div className="card-header">
            <span className="job-id-badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              #{job.id}
            </span>
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

        {/* Recommended Editors Section */}
        <div className="reporters-list-section">
          <div className="section-title-bar border-indigo-500/30">
            <h3 className="section-title">Available Editors</h3>
            <span className="badge-counter bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {editors.length} Editors found
            </span>
          </div>

          {editors.length === 0 ? (
            <div className="empty-reporters-state border-indigo-500/20">
              <div className="empty-illustration text-indigo-400">⚠️</div>
              <p className="empty-text">
                No active editors currently available.
              </p>
              <p className="empty-subtext">
                Please register a new editor or change editor availability in the Staff Management menu.
              </p>
            </div>
          ) : (
            <div className="reporters-grid">
              {editors.map((editor) => (
                <div
                  key={editor.id}
                  className="reporter-card border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="reporter-avatar-section">
                    <div className="reporter-avatar bg-indigo-500/20 text-indigo-400">
                      {editor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="reporter-name">{editor.name}</h4>
                      <p className="reporter-email">{editor.email}</p>
                    </div>
                  </div>

                  <div className="reporter-info-list">
                    <div className="info-row">
                      <div className="info-label">
                        <MapPin className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Location
                      </div>
                      <div className="info-value">
                        {editor.location || "Not set"}
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Activity className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Availability
                      </div>
                      <div className="info-value">
                        <span className="status-indicator available bg-indigo-500/20 text-indigo-400">
                          Available
                        </span>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <DollarSign className="w-3.5 h-3.5 mr-1 inline text-gray-500" />{" "}
                        Flat Rate
                      </div>
                      <div className="info-value rate-value text-indigo-400">
                        Rp {Number(editor.baseRate).toLocaleString("id-ID")} /
                        File
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssign(editor.id, editor.name)}
                    disabled={assigningId !== null}
                    className="assign-action-btn bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/20"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    {assigningId === editor.id ? (
                      <span className="loading-spinner border-t-white"></span>
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

export default JobAssignEditor;
