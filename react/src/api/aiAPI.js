import instance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_GATEWAY_URL}/ai`;

export const sendMessage = (message, stockCode = null) =>
  instance
    .post(`${BASE}/assistant`, {
      question: message,
      ...(stockCode ? { stock_code: stockCode } : {}),
    })
    .then((r) => r.data);
