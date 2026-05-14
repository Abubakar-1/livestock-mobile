import { baseApi } from "../../store/baseApi";

export const bankDetailsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankDetails: builder.query<any, void>({
      query: () => "/bank-details",
      providesTags: ["BankDetails"],
    }),
  }),
});

export const { useGetBankDetailsQuery } = bankDetailsApi;
