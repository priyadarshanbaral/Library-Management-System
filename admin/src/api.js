import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:2700/api",
});

export default API;

