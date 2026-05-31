import instance from "./axiosInstance";

const BASE = "http://52.95.252.64:8080/api/trade";

export const order = (param) => instance.post(`${BASE}/order`, param).then((r) => r.data);