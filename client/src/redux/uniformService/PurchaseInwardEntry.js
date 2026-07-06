import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_INWARD_ENTRY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const purchaseInwardEntryApi = createApi({
  reducerPath: "purchaseInwardEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["purchaseInwardEntry"],
  endpoints: (builder) => ({
    getPurchaseInwardEntry: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PURCHASE_INWARD_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PURCHASE_INWARD_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getPurchaseInwardEntryById: builder.query({
      query: (id) => {
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),
    getPurchaseInwardEntryForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/purchaseInwardEntryForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),
    addPurchaseInwardEntry: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_INWARD_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["purchaseInwardEntry"],
    }),
    updatePurchaseInwardEntry: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["purchaseInwardEntry"],
    }),
    deletePurchaseInwardEntry: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchaseInwardEntry"],
    }),
  }),
});

export const {
  useGetPurchaseInwardEntryQuery,
  useGetPurchaseInwardEntryByIdQuery,
  useLazyGetPurchaseInwardEntryByIdQuery,
  useAddPurchaseInwardEntryMutation,
  useUpdatePurchaseInwardEntryMutation,
  useDeletePurchaseInwardEntryMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetPurchaseInwardEntryForBillByIdQuery,
} = purchaseInwardEntryApi;

export default purchaseInwardEntryApi;
