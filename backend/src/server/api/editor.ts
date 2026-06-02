import express from "express";
import * as CommonHelper from "../common/index.js";
import * as ValidationHelper from "../helpers/job/validationHelper.js";
import * as JobHelper from "../helpers/job/jobHelper.js";

const Router = express.Router();

const getEditorJobs = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  const { editorId } = request.params;
  try {
    // Validate that token ID matches the requested editorId
    if (request.user.id !== Number(editorId)) {
      return reply.status(403).send(
        CommonHelper.errorResponse({
          statusCode: 403,
          message:
            "Access Denied: You do not have permission to view other editors' jobs",
        }),
      );
    }

    const response = await JobHelper.getJobsByEditorIdHelper(
      Number(editorId),
      trxId,
    );
    return CommonHelper.success(
      reply,
      response,
      "Editor job list successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Editor API", "Get Editor Jobs", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const submitReviewedTranscript = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.submitReviewedTranscriptValidation(request.body);

    const { jobId, transcriptContent } = request.body;
    const response = await JobHelper.submitReviewedTranscriptHelper({
      trxId,
      jobId,
      editorId: request.user.id,
      transcriptContent,
    });

    return CommonHelper.success(
      reply,
      response,
      "Transcript successfully reviewed and submitted",
    );
  } catch (error: any) {
    CommonHelper.log(["Editor API", "Submit Reviewed Transcript", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

Router.get("/job-list/:editorId", CommonHelper.preHandler, getEditorJobs);
Router.post("/job-submit", CommonHelper.preHandler, submitReviewedTranscript);

export default Router;
