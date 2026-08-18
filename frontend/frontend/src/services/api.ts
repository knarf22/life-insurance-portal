import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7102/api",
});

export default api;