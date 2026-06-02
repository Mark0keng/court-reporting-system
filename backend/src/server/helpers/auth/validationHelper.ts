import Joi from 'joi';
import * as CommonHelper from '../../common/index.js';

export const loginValidation = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(data);
  if (error) {
    throw CommonHelper.Boom.badRequest(error);
  }
};
