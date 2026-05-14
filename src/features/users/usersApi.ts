import { APIS } from "../../store/apis";
import { baseApi } from "../../store/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<any, void>({
      query: () => ({
        url: APIS.USERS.PROFILE,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: APIS.USERS.PROFILE,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetProfileQuery, useUpdateProfileMutation } = usersApi;
