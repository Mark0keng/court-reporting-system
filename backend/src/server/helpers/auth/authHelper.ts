import bcryptjs from "bcryptjs";
import * as UserTable from "../../service/database/UserTable.js";
import * as CommonHelper from "../../common/index.js";

export const loginAuthHelper = async (dataObject: any) => {
  const { trxId, email, password } = dataObject;
  try {
    const user = await UserTable.findUserByEmail(email, trxId);

    if (!user) {
      throw CommonHelper.Boom.badRequest("Email or password does not match");
    }

    const isMatch = bcryptjs.compareSync(password, user.password) || user.password === password;
    if (!isMatch) {
      throw CommonHelper.Boom.badRequest("Email or password does not match");
    }

    const token = CommonHelper.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };

    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["Auth Helper", "Login Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};
