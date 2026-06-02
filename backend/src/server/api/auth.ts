import express from "express";
import * as CommonHelper from "../common/index.js";
import * as ValidationHelper from "../helpers/auth/validationHelper.js";
import * as AuthHelper from "../helpers/auth/authHelper.js";

const Router = express.Router();

const loginUser = async (request: any, reply: any) => {
  const { trxId } = request.headers;
  try {
    ValidationHelper.loginValidation(request.body);

    const { email, password } = request.body;
    const response = await AuthHelper.loginAuthHelper({
      trxId,
      email,
      password,
    });

    return CommonHelper.success(
      reply,
      response,
      "Login successful",
      200,
    );
  } catch (error: any) {
    CommonHelper.log(["Auth", "Login User", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return reply
      .status(error.statusCode || 500)
      .send(CommonHelper.errorResponse(error));
  }
};

Router.post("/login", CommonHelper.preHandler, loginUser);

export default Router;
