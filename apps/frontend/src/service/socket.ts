import { io } from "socket.io-client";
import { BACKEND_URL } from "./consts";
import { getAuthToken } from "./auth";

export const socket = io(BACKEND_URL || window.location.origin, {
  autoConnect: false,
  auth: () => ({ token: getAuthToken() }),
});
