import axios from "axios";
import router from "@/router";

const config = {
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10 * 1000,
  headers: {
    "X-Requested-With": "WEB",
    post: {
      "Content-Type": "application/json",
    },
  },
};

const service = axios.create(config);

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = store.state.token || window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
      // 记录请求所在页面
      config.headers["X-Page-Name"] = router.history.current.name;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    /**
     * 接口返回值格式
     * {
     *    code: 0,
     *    message: '',
     *    data
     * }
     */
    const payload = response.data || {};
    if (payload.code !== 0) {
      console.error(payload, response.config.url);
      // 通用错误处理
      if (payload.code === 401) {
        window.localStorage.removeItem("token");
        router.replace({ name: "login" });
      } else if (payload.code === 403) {
        router.replace({ name: "403" });
      } else {
        // 其他错误则由调用方自行处理
        return Promise.reject(payload);
      }
    } else {
      return payload.data;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
