import axios from "axios";
import base64 from "base-64";

const userName = process.env.OPEN_CVE_USERNAME;
const password = process.env.OPEN_CVE_PASSWORD;
const token = base64.encode(`${userName}:${password}`);
const openCVEAxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Basic ${token}`,
  },
});

// CEVs
export const getOpenCVEsList = async (page) =>
  openCVEAxiosInstance.get("/cve", {
    params: { page },
  });

export const getOpenCVEDetailById = async (id) =>
  openCVEAxiosInstance.get(`/cve/${id}`);

// CWEs
export const getOpenCveCWEsList = async (page) =>
  openCVEAxiosInstance.get("/cwe", {
    params: { page },
  });

export const getOpenCveCWEsDetailById = async (id) =>
  openCVEAxiosInstance.get(`/cwe/${id}`);

// Vendors
export const getOpenCVEVendorsList = async (page) =>
  openCVEAxiosInstance.get("/vendors", {
    params: { page },
  });

export const getOpenCVEVendorsDetailByName = async (name) =>
  openCVEAxiosInstance.get(`/vendors/${name}`);
