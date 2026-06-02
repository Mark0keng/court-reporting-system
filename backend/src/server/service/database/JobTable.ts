import { eq } from "drizzle-orm";
import * as dbModule from "../../../db/index.js";
import * as schema from "../../../db/schema.js";
import * as CommonHelper from "../../common/index.js";
import * as UserTable from "./UserTable.js";

const db = dbModule ? dbModule.db : null;

export const getJobs = async (trxId: string) => {
  try {
    if (!db) {
      throw new Error(
        "Database connection not established (DATABASE_URL is missing)",
      );
    }

    const list = await db.select().from(schema.jobs);
    const usersList = await UserTable.getUsers(trxId);

    const results = list.map((job: any) => {
      const reporter = usersList.find((u: any) => u.id === job.reporterId);
      const editor = usersList.find((u: any) => u.id === job.editorId);
      return {
        ...job,
        reporterName: reporter ? reporter.name : "Unassigned",
        editorName: editor ? editor.name : "Unassigned",
      };
    });
    return Promise.resolve(results);
  } catch (error) {
    CommonHelper.log(["Job Table", "Get Jobs", "ERROR"], {
      trxId,
      info: `Get jobs query failed: ${error}`,
    });
    return Promise.reject(error);
  }
};

export const createJob = async (dataObject: any) => {
  const {
    trxId,
    title,
    description,
    audioUrl,
    audioDurationSeconds,
    reporterId,
    editorId,
    location,
  } = dataObject;
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const inserted = await db
      .insert(schema.jobs)
      .values({
        title,
        description,
        audioUrl,
        audioDurationSeconds: Number(audioDurationSeconds || 0),
        status: "NEW",
        location: location || "remote",
        reporterId: reporterId ? Number(reporterId) : null,
        editorId: editorId ? Number(editorId) : null,
      })
      .returning();

    return Promise.resolve(inserted[0]);
  } catch (error) {
    CommonHelper.log(["Job Table", "Create Job", "ERROR"], {
      trxId,
      info: `Create job query failed: ${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobById = async (id: number, trxId: string) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }
    const result = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.id, id));
    return Promise.resolve(result[0] || null);
  } catch (error) {
    CommonHelper.log(["Job Table", "Get Job By Id", "ERROR"], {
      trxId,
      info: `Get job by id query failed: ${error}`,
    });
    return Promise.reject(error);
  }
};

export const assignReporter = async (
  jobId: number,
  reporterId: number,
  ratePerMinute: string,
  trxId: string,
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }
    const updated = await db
      .update(schema.jobs)
      .set({
        reporterId: Number(reporterId),
        reporterRatePerMinute: ratePerMinute,
        status: "ASSIGNED",
      })
      .where(eq(schema.jobs.id, jobId))
      .returning();
    return Promise.resolve(updated[0] || null);
  } catch (error) {
    CommonHelper.log(["Job Table", "Assign Reporter", "ERROR"], {
      trxId,
      info: `Assign reporter query failed: ${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobsByReporterId = async (
  reporterId: number,
  trxId: string,
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }
    const list = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.reporterId, reporterId));
    const usersList = await UserTable.getUsers(trxId);

    const results = list.map((job: any) => {
      const reporter = usersList.find((u: any) => u.id === job.reporterId);
      const editor = usersList.find((u: any) => u.id === job.editorId);
      return {
        ...job,
        reporterName: reporter ? reporter.name : "Unassigned",
        editorName: editor ? editor.name : "Unassigned",
      };
    });
    return Promise.resolve(results);
  } catch (error) {
    CommonHelper.log(["Job Table", "Get Jobs By Reporter Id", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const submitTranscript = async (
  jobId: number,
  rawContent: string,
  reporterId: number,
  trxId: string,
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(wordCount / 250));

    const updatedJob = await db.transaction(async (tx) => {
      const jobList = await tx
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.id, jobId))
        .for("update");

      const job = jobList[0];
      if (!job) {
        throw CommonHelper.Boom.notFound("Job not found");
      }

      if (job.reporterId !== reporterId) {
        throw CommonHelper.Boom.forbidden(
          "Access Denied: You are not the reporter assigned to this job",
        );
      }

      if (job.status !== "ASSIGNED") {
        throw CommonHelper.Boom.badRequest(
          "Transcript can only be submitted for jobs with status ASSIGNED",
        );
      }

      // 2. Upsert transcript
      const existing = await tx
        .select()
        .from(schema.transcripts)
        .where(eq(schema.transcripts.jobId, jobId));

      if (existing.length > 0) {
        await tx
          .update(schema.transcripts)
          .set({
            rawContent,
            wordCount,
            pageCount,
          })
          .where(eq(schema.transcripts.jobId, jobId));
      } else {
        await tx.insert(schema.transcripts).values({
          jobId,
          rawContent,
          wordCount,
          pageCount,
        });
      }

      const updated = await tx
        .update(schema.jobs)
        .set({ status: "TRANSCRIBED" })
        .where(eq(schema.jobs.id, jobId))
        .returning();

      // 3. Create payment for reporter
      const durationMinutes = (job.audioDurationSeconds || 0) / 60;
      const ratePerMinute = Number(job.reporterRatePerMinute || 0);
      const amount = (ratePerMinute * durationMinutes).toFixed(2);

      await tx.insert(schema.payments).values({
        jobId: jobId,
        userId: reporterId,
        amount: amount,
        paymentType: "reporter_fee",
        notes: `Transcription fee for reporter ${reporterId} on job #${jobId} (Duration: ${durationMinutes.toFixed(1)} minutes, Rate: IDR ${ratePerMinute}/minute)`,
      });

      return updated[0] || null;
    });

    return Promise.resolve(updatedJob);
  } catch (error) {
    CommonHelper.log(["Job Table", "Submit Transcript", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const assignEditor = async (
  jobId: number,
  editorId: number,
  flatFee: string,
  trxId: string,
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const updatedJob = await db.transaction(async (tx) => {
      const jobList = await tx
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.id, jobId))
        .for("update");

      const job = jobList[0];
      if (!job) {
        throw CommonHelper.Boom.notFound("Job not found");
      }

      if (job.status !== "TRANSCRIBED") {
        throw CommonHelper.Boom.badRequest(
          "Editor can only be assigned to a job with status TRANSCRIBED",
        );
      }

      const updated = await tx
        .update(schema.jobs)
        .set({
          editorId: Number(editorId),
          editorFlatFee: flatFee,
          status: "REVIEWED",
        })
        .where(eq(schema.jobs.id, jobId))
        .returning();

      return updated[0] || null;
    });

    return Promise.resolve(updatedJob);
  } catch (error) {
    CommonHelper.log(["Job Table", "Assign Editor", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobsByEditorId = async (editorId: number, trxId: string) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }
    const list = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.editorId, editorId));
    const usersList = await UserTable.getUsers(trxId);

    const results = list.map((job: any) => {
      const reporter = usersList.find((u: any) => u.id === job.reporterId);
      const editor = usersList.find((u: any) => u.id === job.editorId);
      return {
        ...job,
        reporterName: reporter ? reporter.name : "Unassigned",
        editorName: editor ? editor.name : "Unassigned",
      };
    });
    return Promise.resolve(results);
  } catch (error) {
    CommonHelper.log(["Job Table", "Get Jobs By Editor Id", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const submitReviewedTranscript = async (
  jobId: number,
  editedContent: string,
  editorId: number,
  trxId: string,
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const wordCount = editedContent.split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(wordCount / 250));

    const updatedJob = await db.transaction(async (tx) => {
      // 1. Lock the job row and verify it exists, is assigned to this editor, and is in REVIEWED status
      const jobList = await tx
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.id, jobId))
        .for("update");

      const job = jobList[0];
      if (!job) {
        throw CommonHelper.Boom.notFound("Job not found");
      }

      if (job.editorId !== editorId) {
        throw CommonHelper.Boom.forbidden(
          "Access Denied: You are not the editor assigned to this job",
        );
      }

      if (job.status !== "REVIEWED") {
        throw CommonHelper.Boom.badRequest(
          "Transcript can only be submitted for jobs with status REVIEWED",
        );
      }

      // 2. Update transcript entry
      const existing = await tx
        .select()
        .from(schema.transcripts)
        .where(eq(schema.transcripts.jobId, jobId));

      if (existing.length === 0) {
        throw CommonHelper.Boom.notFound("Transcript not found");
      }

      await tx
        .update(schema.transcripts)
        .set({
          editedContent,
          wordCount,
          pageCount,
          editorSubmittedAt: new Date(),
        })
        .where(eq(schema.transcripts.jobId, jobId));

      // 3. Transition job status to COMPLETED
      const updated = await tx
        .update(schema.jobs)
        .set({ status: "COMPLETED" })
        .where(eq(schema.jobs.id, jobId))
        .returning();

      // 4. Create payment for editor
      const amount = Number(job.editorFlatFee || 0).toFixed(2);

      await tx.insert(schema.payments).values({
        jobId: jobId,
        userId: editorId,
        amount: amount,
        paymentType: "editor_fee",
        notes: `Review fee for editor ${editorId} on job #${jobId} (Flat Fee: IDR ${amount})`,
      });

      return updated[0] || null;
    });

    return Promise.resolve(updatedJob);
  } catch (error) {
    CommonHelper.log(["Job Table", "Submit Reviewed Transcript", "ERROR"], {
      trxId,
      info: `Submit reviewed transcript query failed: ${error}`,
    });
    return Promise.reject(error);
  }
};

export const getTranscriptByJobId = async (jobId: number, trxId: string) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }
    const result = await db
      .select()
      .from(schema.transcripts)
      .where(eq(schema.transcripts.jobId, jobId));
    return Promise.resolve(result[0] || null);
  } catch (error) {
    CommonHelper.log(["Job Table", "Get Transcript By Job Id", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};
