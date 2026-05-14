import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth } from "../features/auth/authSlice";
import { RootState } from "./store";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.200.225.182:3001/api";

// 1. Base Query
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Access token directly from Redux state
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// 2. Re-auth Wrapper
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  console.log(`📡 [RTK Query Request] ${BASE_URL}${url}`);

  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    // Handle Token Expiry
    if (result.error.status === 401) {
      api.dispatch(clearAuth());
    }
  }

  return result;
};

// 3. API Slice definition
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Profile",
    "Batches",
    "Portfolio",
    "Transactions",
    "Notifications",
    "AnimalTypes",
    "BankDetails",
    "Purchases",
  ],
  endpoints: () => ({}),
});
