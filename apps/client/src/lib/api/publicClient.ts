import axios from "axios";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";

const publicApi = axios.create({
  baseURL: getPublicApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

export default publicApi;
