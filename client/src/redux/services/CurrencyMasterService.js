import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CURRENCY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const currencyMasterApi = createApi({
  reducerPath: "currencyMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Currencies"],
  endpoints: (builder) => ({
    getCurrencies: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: CURRENCY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: CURRENCY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Currencies"],
    }),
    getCurrencyById: builder.query({
      query: (id) => {
        return {
          url: `${CURRENCY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Currencies"],
    }),
    addCurrency: builder.mutation({
      query: (payload) => ({
        url: CURRENCY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Currencies"],
    }),
    updateCurrency: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CURRENCY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Currencies"],
    }),
    deleteCurrency: builder.mutation({
      query: (id) => ({
        url: `${CURRENCY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Currencies"],
    }),
  }),
});

export const {
  useGetCurrenciesQuery,
  useGetCurrencyByIdQuery,
  useAddCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} = currencyMasterApi;

export default currencyMasterApi;
