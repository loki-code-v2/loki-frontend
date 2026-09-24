import type { AxiosInstance } from "axios";
import axios from "axios";

export const BuildBearClient: AxiosInstance = axios.create({
  baseURL: `https://api.delta.buildbear.io/v1/buildbear-sandbox/`,
});

BuildBearClient.interceptors.request.use(
  async function (config) {
    try {
      const token = "BB_5ade575a-c7a4-4020-9c29-7790bac03a3c";

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.log("No Token");
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

export default BuildBearClient;
