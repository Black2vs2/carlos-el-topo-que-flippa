import axios from "axios";
import { ProfitableOrders } from "../@types/AOData";
import { AvalonState } from "../@types/avalon.types";
import { ClearDatabaseResponse } from "../@types/api";
import { BACKEND_URL } from "./consts";

const allOrders = () => {
  const response = axios.get<ProfitableOrders[]>(`${BACKEND_URL}/orders/profitable`);
  return response;
};

const clearCity = (cityId: number) => {
  const response = axios.post<ClearDatabaseResponse>(`${BACKEND_URL}/orders/delete-by-city`, { authToken: "ermaggico", cityId });
  return response;
};

const getAvalonState = () => {
  return axios.get<AvalonState>(`${BACKEND_URL}/avalon/state`);
};

const getAvalonMaps = () => {
  return axios.get(`${BACKEND_URL}/avalon/maps`);
};

const Api = { allOrders, clearCity, getAvalonState, getAvalonMaps };

export default Api;
