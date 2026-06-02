import express from "express";
import * as CommonHelper from "../common/index.js";
import * as ValidationHelper from "../helpers/job/validationHelper.js";
import * as JobHelper from "../helpers/job/jobHelper.js";
import * as UserHelper from "../helpers/user/userHelper.js";

const Router = express.Router();

const getJobs = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    const response = await JobHelper.getJobsHelper(trxId);
    return CommonHelper.success(
      reply,
      response,
      "Job list successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Get Jobs", "ERROR"], { trxId, info: `${error}` });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const createJob = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.createJobValidation(request.body);

    const {
      title,
      description,
      audioUrl,
      audioDurationSeconds,
      reporterId,
      editorId,
      location,
    } = request.body;
    const response = await JobHelper.createJobHelper({
      trxId,
      title,
      description,
      audioUrl,
      audioDurationSeconds,
      reporterId,
      editorId,
      location,
    });

    return CommonHelper.success(
      reply,
      response,
      "New court trial successfully registered",
      201,
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Create Job", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const assignReporter = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.assignReporterValidation(request.body);

    const { jobId, reporterId } = request.body;
    const response = await JobHelper.assignReporterHelper({
      trxId,
      jobId,
      reporterId,
    });

    return CommonHelper.success(
      reply,
      response,
      "Reporter successfully assigned to this trial",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Assign Reporter", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const getJobById = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  const { id } = request.params;
  try {
    const response = await JobHelper.getJobByIdHelper(Number(id), trxId);
    return CommonHelper.success(
      reply,
      response,
      "Job details successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Get Job By Id", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const getRecommendEditors = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    const response = await JobHelper.getRecommendEditorsHelper(trxId);
    return CommonHelper.success(
      reply,
      response,
      "Recommended editors list successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Get Recommend Editors", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const assignEditor = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.assignEditorValidation(request.body);

    const { jobId, editorId } = request.body;
    const response = await JobHelper.assignEditorHelper({
      trxId,
      jobId,
      editorId,
    });

    return CommonHelper.success(
      reply,
      response,
      "Editor successfully assigned to this trial",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Assign Editor", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

const getRecommendReporters = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  const { jobId } = request.query;
  try {
    const response = await UserHelper.getRecommendReportersHelper({
      trxId,
      jobId: Number(jobId),
    });
    return CommonHelper.success(
      reply,
      response,
      "Recommended reporters list successfully retrieved",
    );
  } catch (error: any) {
    CommonHelper.log(["Job", "Get Recommend Reporters", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

Router.get("/list", CommonHelper.preHandler, getJobs);
Router.post("/create", CommonHelper.preHandler, createJob);
Router.post("/assign-reporter", CommonHelper.preHandler, assignReporter);
Router.get(
  "/reporter-recommend-list",
  CommonHelper.preHandler,
  getRecommendReporters,
);
Router.get(
  "/editor-recommend-list",
  CommonHelper.preHandler,
  getRecommendEditors,
);
Router.post("/assign-editor", CommonHelper.preHandler, assignEditor);
Router.get("/:id", CommonHelper.preHandler, getJobById);

export default Router;
