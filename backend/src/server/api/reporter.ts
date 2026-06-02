import express from "express";
import * as CommonHelper from "../common/index.js";
import * as ValidationHelper from "../helpers/job/validationHelper.js";
import * as JobHelper from "../helpers/job/jobHelper.js";

const Router = express.Router();

const getReporterJobs = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  const { reporterId } = request.params;
  try {
    if (request.user.id !== Number(reporterId)) {
      return reply.status(403).send(
        CommonHelper.errorResponse({
          statusCode: 403,
          message:
            "Access Denied: You do not have permission to view other reporters' jobs",
        }),
      );
    }

    const response = await JobHelper.getJobsByReporterIdHelper(
      Number(reporterId),
      trxId,
    );
    return CommonHelper.success(
      reply,
      response,
      "Reporter job list successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Reporter API", "Get Reporter Jobs", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const submitTranscript = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.submitTranscriptValidation(request.body);

    const { jobId, transcriptContent } = request.body;
    const response = await JobHelper.submitTranscriptHelper({
      trxId,
      jobId,
      reporterId: request.user.id,
      transcriptContent,
    });

    return CommonHelper.success(reply, response, "Transcript successfully submitted");
  } catch (error: any) {
    CommonHelper.log(["Reporter API", "Submit Transcript", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

Router.get("/job-list/:reporterId", CommonHelper.preHandler, getReporterJobs);
Router.post("/job-submit", CommonHelper.preHandler, submitTranscript);

export default Router;
