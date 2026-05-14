import { APIS } from "../../store/apis";
import { baseApi } from "../../store/baseApi";
import { AuthResponse, LoginRequest } from "./auth.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: APIS.AUTH.LOGIN,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation<AuthResponse, any>({
      query: (data) => ({
        url: APIS.AUTH.REGISTER,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: APIS.AUTH.LOGOUT,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
