export const APIS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    GET_ALL: "/users",
    PROFILE: "/users/profile",
    GET_BY_ID: (id: any) => `/users/${id}`,
  },
  BATCHES: {
    GET_ALL: "/batches",
    GET_BY_ID: (id: any) => `/batches/${id}`,
  },
  PORTFOLIO: {
    GET: "/portfolio",
  },
};
