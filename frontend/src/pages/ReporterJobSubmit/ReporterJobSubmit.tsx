import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext.js";
import { ArrowLeft, FileText, MapPin, FileAudio } from "lucide-react";
import { callAPI } from "../../services/api.js";
import { formatDuration } from "../JobList/helper.js";
import "./ReporterJobSubmit.scss";

interface Job {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  status: string;
  location: string;
}

export const ReporterJobSubmit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [job, setJob] = useState<Job | null>(null);
  const [transcriptContent, setTranscriptContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await callAPI(`/api/job/${id}`, "GET");
        if (res && res.success && res.data) {
          setJob(res.data);
        } else {
          throw new Error("Failed to load job details");
        }
      } catch (err: any) {
        showSnackbar(err.message || "Failed to load trial details", "error");
        navigate("/reporter/jobs");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchJob();
    }
  }, [id, navigate, showSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptContent.trim()) {
      showSnackbar("Transcript content cannot be empty", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const res = await callAPI("/api/reporter/job-submit", "POST", {
        jobId: Number(id),
        transcriptContent: transcriptContent,
      });

      if (res && res.success) {
        showSnackbar(
          "Court trial transcript successfully submitted!",
          "success",
        );
        navigate("/reporter/jobs");
      } else {
        throw new Error(res?.message || "Failed to submit transcript");
      }
    } catch (err: any) {
      showSnackbar(err.message || "A system error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="jobs-page-container flex items-center justify-center p-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trial details...</p>
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
          <Link to="/reporter/jobs" className="back-link">
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to My Jobs List
          </Link>
          <h1 className="page-title mt-2">
            <FileText className="page-title-icon" />
            <span>Submit Court Transcript</span>
          </h1>
          <p className="page-subtitle">
            Upload transcription results of the court audio recording of the case you completed.
          </p>
        </div>
      </div>

      <div className="submit-layout">
        {/* Sidang Info Summary */}
        <div className="submit-job-summary">
          <div className="summary-header">
            <span className="summary-id">#{job.id}</span>
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

          <h2 className="summary-title">{job.title}</h2>
          <p className="summary-desc">
            {job.description || "No detailed case description."}
          </p>

          <div className="summary-meta-list">
            <div className="meta-card">
              <MapPin className="meta-icon" />
              <div>
                <span className="meta-lbl">Trial Location</span>
                <span className="meta-val">
                  {isRemote ? "Remote (Online)" : job.location}
                </span>
              </div>
            </div>

            <div className="meta-card">
              <FileAudio className="meta-icon" />
              <div>
                <span className="meta-lbl">Recording Duration</span>
                <span className="meta-val">
                  {formatDuration(job.audioDurationSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="audio-listen-section">
            <h3 className="listen-title">Play Court Trial Recording</h3>
            <a
              href={job.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="listen-btn"
            >
              <FileAudio className="w-4 h-4 mr-1.5 inline" />
              <span>Open Court Audio File</span>
            </a>
          </div>
        </div>

        {/* Text Editor Form */}
        <div className="transcript-form-section">
          <h3 className="editor-title">Reporter Raw Transcript Draft</h3>
          <p className="editor-subtitle">
            Write or paste the entire transcription of the trial conversation below in full.
          </p>

          <form onSubmit={handleSubmit} className="editor-form">
            <textarea
              className="transcript-textarea"
              value={transcriptContent}
              onChange={(e) => setTranscriptContent(e.target.value)}
              disabled={submitting}
              required
            />

            <div className="form-action-bar">
              <Link to="/reporter/jobs" className="btn-cancel">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-submit-emerald"
              >
                {submitting ? (
                  <span className="spinner"></span>
                ) : (
                  <span>Submit Transcription Results</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReporterJobSubmit;
