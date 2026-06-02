import Joi from 'joi';
import * as CommonHelper from '../../common/index.js';

export const createUserValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    role: Joi.string().valid('admin', 'reporter', 'editor').required(),
    email: Joi.string().email().required(),
    baseRate: Joi.number().min(0).optional(),
    location: Joi.string().allow('').optional(),
    availability: Joi.boolean().optional()
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};
