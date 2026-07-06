import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_BILL_ENTRY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const purchaseBillEntryApi = createApi({
  reducerPath: "purchaseBillEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["purchaseBillEntry"],
  endpoints: (builder) => ({
    getPurchaseBillEntry: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PURCHASE_BILL_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PURCHASE_BILL_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["purchaseBillEntry"],
    }),
   
    getPurchaseBillEntryById: builder.query({
      query: (id) => {
        return {
          url: `${PURCHASE_BILL_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["purchaseBillEntry"],
    }),

   
    addPurchaseBillEntry: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_BILL_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["purchaseBillEntry"],
    }),
    updatePurchaseBillEntry: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PURCHASE_BILL_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["purchaseBillEntry"],
    }),
    deletePurchaseBillEntry: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_BILL_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchaseBillEntry"],
    }),

  }),
});

export const {
  useGetPurchaseBillEntryQuery,
  useGetPurchaseBillEntryByIdQuery,
  useAddPurchaseBillEntryMutation,
  useUpdatePurchaseBillEntryMutation,
  useDeletePurchaseBillEntryMutation,

} = purchaseBillEntryApi;

export default purchaseBillEntryApi;
