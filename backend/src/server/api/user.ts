import express from 'express';
import * as CommonHelper from '../common/index.js';
import * as ValidationHelper from '../helpers/user/validationHelper.js';
import * as UserHelper from '../helpers/user/userHelper.js';

const Router = express.Router();

const getUsers = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    const response = await UserHelper.getUsersHelper(trxId);
    return CommonHelper.success(reply, response, 'Staff list successfully retrieved');
  } catch (error: any) {
    CommonHelper.log(['User', 'Get Users', 'ERROR'], { trxId, info: `${error}` });
    return reply.status(error.statusCode || 500).send(CommonHelper.errorResponse(error));
  }
};

const createUser = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.createUserValidation(request.body);

    const { name, role, email, baseRate } = request.body;
    const response = await UserHelper.createUserHelper({
      trxId,
      name,
      role,
      email,
      baseRate
    });

    return CommonHelper.success(reply, response, 'New staff successfully registered', 201);
  } catch (error: any) {
    CommonHelper.log(['User', 'Create User', 'ERROR'], { trxId, info: `${error}` });
    return reply.status(error.statusCode || 500).send(CommonHelper.errorResponse(error));
  }
};

Router.get('/list', CommonHelper.preHandler, getUsers);
Router.post('/create', CommonHelper.preHandler, createUser);

export default Router;
