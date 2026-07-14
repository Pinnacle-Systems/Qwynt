import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_VARIANT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const itemVariantApi = createApi({
  reducerPath: "itemVariant",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["itemVariant"],
  endpoints: (builder) => ({
    getItemVariant: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ITEM_VARIANT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: ITEM_VARIANT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["itemVariant"],
    }),
    getItemVariantById: builder.query({
      query: (id) => {
        return {
          url: `${ITEM_VARIANT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["itemVariant"],
    }),
    addItemVariant: builder.mutation({
      query: (payload) => ({
        url: ITEM_VARIANT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["itemVariant"],
    }),
    updateItemVariant: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ITEM_VARIANT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["itemVariant"],
    }),
    deleteItemVariant: builder.mutation({
      query: (id) => ({
        url: `${ITEM_VARIANT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["itemVariant"],
    }),
  }),
});

export const {
  useGetItemVariantQuery,
  useGetItemVariantByIdQuery,
  useAddItemVariantMutation,
  useUpdateItemVariantMutation,
  useDeleteItemVariantMutation,
} = itemVariantApi;

export default itemVariantApi;
