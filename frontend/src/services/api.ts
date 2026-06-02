import axios from "axios";
import type { Method } from "axios";

// Endpoint list
export const urls = {
  login: "/api/auth/login",
  userList: "/api/user/list",
  userCreate: "/api/user/create",
  getJob: "/api/job/list",
  jobList: "/api/job/list",
  jobCreate: "/api/job/create",
  reporterRecommendList: "/api/job/reporter-recommend-list",
  jobAssignReporter: "/api/job/assign-reporter",
  reporterJobList: (reporterId: number) =>
    `/api/reporter/job-list/${reporterId}`,
  reporterJobSubmit: "/api/reporter/job-submit",
  editorRecommendList: "/api/job/editor-recommend-list",
  assignEditor: "/api/job/assign-editor",
  editorJobList: (editorId: number) => `/api/editor/job-list/${editorId}`,
  editorJobSubmit: "/api/editor/job-submit",
};

// Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Call API Function
export const callAPI = async (
  endpoint: string,
  method: Method = "GET",
  payload: any = null,
  query: any = null,
) => {
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: method,
      data: payload,
      params: query,
    });
    return response.data;
  } catch (error: any) {
    let errorMessage = "An unknown system error occurred.";

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        `Error ${error.response.status}: A server error occurred.`;
    } else if (error.request) {
      errorMessage = "Cannot connect to the backend server";
    } else {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export default callAPI;
