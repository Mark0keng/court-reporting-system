import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext.js";
import { ArrowLeft, MapPin, FileAudio, BookOpen, Gavel, CheckCircle } from "lucide-react";
import { callAPI, urls } from "../../services/api.js";
import { formatDuration } from "../JobList/helper.js";
import "./EditorJobSubmit.scss";

interface Transcript {
  id: number;
  jobId: number;
  rawContent: string;
  editedContent: string | null;
  wordCount: number | null;
  pageCount: number | null;
  reporterSubmittedAt: string | null;
  editorSubmittedAt: string | null;
}

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
  transcript: Transcript | null;
}

export const EditorJobSubmit: React.FC = () => {
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
          const fetchedJob: Job = res.data;
          setJob(fetchedJob);
          
          if (fetchedJob.transcript) {
            setTranscriptContent(
              fetchedJob.transcript.editedContent || fetchedJob.transcript.rawContent || ""
            );
          }
        } else {
          throw new Error("Failed to load review job details");
        }
      } catch (err: any) {
        showSnackbar(err.message || "Failed to load trial details for review", "error");
        navigate("/editor/jobs");
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
      showSnackbar("Review transcript content cannot be empty", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const res = await callAPI(urls.editorJobSubmit, "POST", {
        jobId: Number(id),
        transcriptContent: transcriptContent,
      });

      if (res && res.success) {
        showSnackbar(
          "Court recording transcript review successfully submitted!",
          "success"
        );
        navigate("/editor/jobs");
      } else {
        throw new Error(res?.message || "Failed to submit transcript review");
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
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trial review data...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isRemote = !job.location || job.location.toLowerCase() === "remote";
  const isReadOnly = job.status === "COMPLETED";

  return (
    <div className="jobs-page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Link to="/editor/jobs" className="back-link">
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to My Review Jobs List
          </Link>
          <h1 className="page-title mt-2">
            <Gavel className="page-title-icon text-indigo-400" />
            <span>Review & Complete Court Transcript</span>
          </h1>
          <p className="page-subtitle">
            Compare reporter's transcript draft with audio, correct spelling/formatting errors, and certify the transcription results.
          </p>
        </div>
      </div>

      <div className="editor-submit-layout">
        {/* Left Panel: Info + Reporter Raw Draft */}
        <div className="editor-left-panel">
          {/* Metadata Summary */}
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
              <h3 className="listen-title">Play Court Recording</h3>
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

          {/* Read-Only Reporter Raw Transcript */}
          <div className="raw-draft-container">
            <div className="raw-draft-header">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Reporter Raw Transcript Draft</span>
            </div>
            <div className="raw-draft-content">
              {job.transcript?.rawContent ? (
                <pre className="raw-draft-text">{job.transcript.rawContent}</pre>
              ) : (
                <p className="raw-draft-empty">No initial transcript draft from reporter.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Split-screen active text area */}
        <div className="transcript-form-section">
          <div className="editor-section-header">
            <div>
              <h3 className="editor-title">Reviewed & Corrected Text Editor</h3>
              <p className="editor-subtitle">
                Edit and polish the reporter's draft below. Your edits will be saved as the final court transcript draft.
              </p>
            </div>
            {isReadOnly && (
              <span className="badge-completed">
                <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Review Completed
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="editor-form">
            <textarea
              className="transcript-textarea editor-textarea"
              value={transcriptContent}
              onChange={(e) => setTranscriptContent(e.target.value)}
              disabled={submitting || isReadOnly}
              placeholder="Start editing the reviewed transcript..."
              required
            />

            <div className="form-action-bar">
              <Link to="/editor/jobs" className="btn-cancel">
                Cancel
              </Link>
              {!isReadOnly ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit-indigo"
                >
                  {submitting ? (
                    <span className="spinner"></span>
                  ) : (
                    <span>Certify & Submit Review</span>
                  )}
                </button>
              ) : (
                <button type="button" disabled className="btn-submit-disabled">
                  Approved (Completed)
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditorJobSubmit;
