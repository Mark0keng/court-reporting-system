import * as UserTable from "../../service/database/UserTable.js";
import * as JobTable from "../../service/database/JobTable.js";
import * as CommonHelper from "../../common/index.js";

export const createUserHelper = async (dataObject: any) => {
  const { trxId, name, role, email, baseRate } = dataObject;
  try {
    const response = await UserTable.createUser({
      trxId,
      name,
      role,
      email,
      baseRate,
    });

    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["User Helper", "Create User Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getUsersHelper = async (trxId: string) => {
  try {
    const response = await UserTable.getUsers(trxId);
    return Promise.resolve(response);
  } catch (error) {
    CommonHelper.log(["User Helper", "Get Users Helper", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getRecommendReportersHelper = async (dataObject: any) => {
  const { trxId, jobId } = dataObject;
  try {
    const job = await JobTable.getJobById(Number(jobId), trxId);
    if (!job) {
      throw CommonHelper.Boom.notFound("Job not found");
    }

    const isPhysical = job.location && job.location.toLowerCase() !== "remote";
    const reporters = await UserTable.getUsers(trxId, {
      role: "reporter",
      availability: true,
      ...(isPhysical ? { location: job.location } : {}),
    });

    return Promise.resolve(reporters);
  } catch (error) {
    CommonHelper.log(
      ["User Helper", "Get Recommend Reporters Helper", "ERROR"],
      {
        trxId,
        info: `${error}`,
      },
    );
    return Promise.reject(error);
  }
};
