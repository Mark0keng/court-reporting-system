import Joi from "joi";
import * as CommonHelper from "../../common/index.js";

export const createJobValidation = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    audioUrl: Joi.string().uri().required(),
    audioDurationSeconds: Joi.number().integer().min(0).optional(),
    location: Joi.string().required(),
    reporterId: Joi.number().integer().allow(null).optional(),
    editorId: Joi.number().integer().allow(null).optional(),
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};

export const assignReporterValidation = (data: any) => {
  const schema = Joi.object({
    jobId: Joi.number().integer().required(),
    reporterId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};

export const submitTranscriptValidation = (data: any) => {
  const schema = Joi.object({
    jobId: Joi.number().integer().required(),
    transcriptContent: Joi.string().required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};

export const assignEditorValidation = (data: any) => {
  const schema = Joi.object({
    jobId: Joi.number().integer().required(),
    editorId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};

export const submitReviewedTranscriptValidation = (data: any) => {
  const schema = Joi.object({
    jobId: Joi.number().integer().required(),
    transcriptContent: Joi.string().required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};
