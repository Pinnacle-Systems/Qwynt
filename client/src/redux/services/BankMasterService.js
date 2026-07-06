import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BANK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const bankMasterApi = createApi({
  reducerPath: "bankMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["bank"],
  endpoints: (builder) => ({
    getbank: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: BANK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: BANK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["bank"],
    }),
    getbankById: builder.query({
      query: (id) => {
        return {
          url: `${BANK_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["bank"],
    }),
    addbank: builder.mutation({
      query: (payload) => ({
        url: BANK_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["bank"],
    }),
    updatebank: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BANK_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["bank"],
    }),
    deletebank: builder.mutation({
      query: (id) => ({
        url: `${BANK_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bank"],
    }),
  }),
});

export const {
  useGetbankQuery,
  useGetbankByIdQuery,
  useAddbankMutation,
  useUpdatebankMutation,
  useDeletebankMutation,
} = bankMasterApi;

export default bankMasterApi;
