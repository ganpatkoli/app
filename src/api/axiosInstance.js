import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backend base URL - apne backend URL yahan daalein

 export const BASE_URL = "http://192.168.1.6:9999/api";
 export const BASE_URL_IMAGE = "http://192.168.1.6:9999";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token automatically
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");


    console.log("Axios token:", token); // Debugging line to check token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
