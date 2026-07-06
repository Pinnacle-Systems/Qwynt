import { createApi,fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OPENING_BALANCE } from "../../Api";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const openingBalanceApi = createApi({
  reducerPath: "openingBalance",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["openingBalance"],
  endpoints: (builder) => ({
    getOpeningBalance: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: OPENING_BALANCE + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: OPENING_BALANCE,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["openingBalance"],
    }),
    getOpeningBalanceById: builder.query({
      query: (id) => {
        return {
          url: `${OPENING_BALANCE}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["openingBalance"],
    }),
    addOpeningBalance: builder.mutation({
      query: (payload) => ({
        url: OPENING_BALANCE,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["openingBalance"],
    }),
    updateOpeningBalance: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${OPENING_BALANCE}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["openingBalance"],
    }),
    deleteOpeningBalance: builder.mutation({
      query: (id) => ({
        url: `${OPENING_BALANCE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["openingBalance"],
    }),
  }),
});

export const {
  useGetOpeningBalanceQuery,
  useGetOpeningBalanceByIdQuery,
  useAddOpeningBalanceMutation,
  useUpdateOpeningBalanceMutation,
  useDeleteOpeningBalanceMutation,
} = openingBalanceApi;

export default openingBalanceApi;
