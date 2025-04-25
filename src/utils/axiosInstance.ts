import { store } from '@/store/store';
import axios from 'axios';

// Create an Axios instance configured to your API base URL.
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL
});

// Request interceptor to add access token to headers.
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    console.log("Access token from store:", accessToken);

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    console.log("Final request config:", config);
    return config;
  },
  (error) => Promise.reject(error)
);
