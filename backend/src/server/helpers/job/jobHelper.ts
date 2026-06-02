import * as JobTable from "../../service/database/JobTable.js";
import * as UserTable from "../../service/database/UserTable.js";
import * as CommonHelper from "../../common/index.js";

export const createJobHelper = async (dataObject: any) => {
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
    const response = await JobTable.createJob({
      trxId,
      title,
      description,
      audioUrl,
      audioDurationSeconds,
      reporterId,
      editorId,
      location,
    });

    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Create Job Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobsHelper = async (trxId: string) => {
  try {
    const response = await JobTable.getJobs(trxId);
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Get Jobs Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const assignReporterHelper = async (dataObject: any) => {
  const { trxId, jobId, reporterId } = dataObject;
  try {
    const job = await JobTable.getJobById(Number(jobId), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    if (job.status !== "NEW") {
      throw CommonHelper.Boom.badRequest(
        "Reporter can only be assigned to a job with status NEW",
      );
    }

    const users = await UserTable.getUsers(trxId);
    const reporter = users.find(
      (u: any) => u.id === Number(reporterId) && u.role === "reporter",
    );
    if (!reporter) {
      throw CommonHelper.Boom.notFound("Reporter not found");
    }

    if (!reporter.availability) {
      throw CommonHelper.Boom.badRequest("Reporter is currently unavailable");
    }

    const response = await JobTable.assignReporter(
      Number(jobId),
      Number(reporterId),
      reporter.baseRate,
      trxId,
    );
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Assign Reporter Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobByIdHelper = async (id: number, trxId: string) => {
  try {
    const job = await JobTable.getJobById(Number(id), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    const reporter = job.reporterId
      ? await UserTable.getUserById(job.reporterId, trxId)
      : null;
    const editor = job.editorId
      ? await UserTable.getUserById(job.editorId, trxId)
      : null;

    const transcript = await JobTable.getTranscriptByJobId(Number(id), trxId);

    const mappedJob = {
      ...job,
      reporterName: reporter ? reporter.name : "Unassigned",
      editorName: editor ? editor.name : "Unassigned",
      transcript: transcript || null,
    };
    return Promise.resolve(mappedJob);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Get Job By Id Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobsByReporterIdHelper = async (
  reporterId: number,
  trxId: string,
) => {
  try {
    const response = await JobTable.getJobsByReporterId(
      Number(reporterId),
      trxId,
    );
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(
      ["Job Helper", "Get Jobs By Reporter Id Helper", "ERROR"],
      {
        trxId,
        info: `${error}`,
      },
    );
    return Promise.reject(error);
  }
};

export const submitTranscriptHelper = async (dataObject: any) => {
  const { trxId, jobId, reporterId, transcriptContent } = dataObject;
  try {
    const job = await JobTable.getJobById(Number(jobId), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    if (job.reporterId !== Number(reporterId)) {
      throw CommonHelper.Boom.badRequest(
        "Access Denied: You are not the reporter assigned to this job",
      );
    }

    if (job.status !== "ASSIGNED") {
      throw CommonHelper.Boom.badRequest(
        "Transcript can only be submitted for jobs with status ASSIGNED",
      );
    }

    const response = await JobTable.submitTranscript(
      Number(jobId),
      transcriptContent,
      Number(reporterId),
      trxId,
    );
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Submit Transcript Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getRecommendEditorsHelper = async (trxId: string) => {
  try {
    const editors = await UserTable.getUsers(trxId, {
      role: "editor",
      availability: true,
    });
    return Promise.resolve(editors);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Get Recommend Editors Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const assignEditorHelper = async (dataObject: any) => {
  const { trxId, jobId, editorId } = dataObject;
  try {
    const job = await JobTable.getJobById(Number(jobId), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    if (job.status !== "TRANSCRIBED") {
      throw CommonHelper.Boom.badRequest(
        "Editor can only be assigned to a job with status TRANSCRIBED",
      );
    }

    const editor = await UserTable.getUserById(Number(editorId), trxId);
    if (!editor) {
      throw CommonHelper.Boom.notFound("Editor not found");
    }

    if (editor.role !== "editor") {
      throw CommonHelper.Boom.badRequest("User is not an editor");
    }

    if (!editor.availability) {
      throw CommonHelper.Boom.badRequest("Editor is currently unavailable");
    }

    const response = await JobTable.assignEditor(
      Number(jobId),
      Number(editorId),
      editor.baseRate,
      trxId,
    );
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Assign Editor Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getJobsByEditorIdHelper = async (editorId: number, trxId: string) => {
  try {
    const response = await JobTable.getJobsByEditorId(Number(editorId), trxId);
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Get Jobs By Editor Id Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const submitReviewedTranscriptHelper = async (dataObject: any) => {
  const { trxId, jobId, editorId, transcriptContent } = dataObject;
  try {
    const job = await JobTable.getJobById(Number(jobId), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    if (job.editorId !== Number(editorId)) {
      throw CommonHelper.Boom.forbidden(
        "Access Denied: You are not the editor assigned to this job",
      );
    }

    if (job.status !== "REVIEWED") {
      throw CommonHelper.Boom.badRequest(
        "Transcript can only be submitted for jobs with status REVIEWED",
      );
    }

    const response = await JobTable.submitReviewedTranscript(
      Number(jobId),
      transcriptContent,
      Number(editorId),
      trxId,
    );
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Job Helper", "Submit Reviewed Transcript Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};
