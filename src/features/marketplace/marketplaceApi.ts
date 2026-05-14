import { baseApi } from "../../store/baseApi";

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query<any, void>({
      query: () => "/batches",
      providesTags: ["Batches"],
    }),
    getBatchById: builder.query<any, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: "Batches", id }],
    }),
    purchaseAsset: builder.mutation<any, { batchId: string; units: number }>({
      query: (body) => ({
        url: "/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Batches", "Portfolio" as any], // assuming we might want to refresh portfolio
    }),
    getPurchases: builder.query<any, void>({
      query: () => "/purchases",
      providesTags: ["Portfolio" as any],
    }),
    getAnimalTypes: builder.query<any, void>({
      query: () => "/animal-types",
      providesTags: ["AnimalTypes" as any],
    }),
    getPurchaseById: builder.query<any, string>({
      query: (id) => `/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: "Portfolio" as any, id }],
    }),
    cancelPurchase: builder.mutation<any, string>({
      query: (id) => ({
        url: `/purchases/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => ["Portfolio" as any, { type: "Portfolio" as any, id }],
    }),
  }),
  overrideExisting: true,
});

export const { 
  useGetBatchesQuery, 
  useGetBatchByIdQuery, 
  usePurchaseAssetMutation, 
  useGetPurchasesQuery, 
  useGetAnimalTypesQuery, 
  useGetPurchaseByIdQuery,
  useCancelPurchaseMutation 
} = marketplaceApi;
