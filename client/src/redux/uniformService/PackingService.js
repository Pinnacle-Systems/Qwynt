import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PACKING_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const packingApi = createApi({
  reducerPath: "packing",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["packing", "Box"],
  endpoints: (builder) => ({
    getPacking: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PACKING_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PACKING_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["packing"],
    }),
    getPackingById: builder.query({
      query: (id) => {
        return {
          url: `${PACKING_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packing"],
    }),
    addPacking: builder.mutation({
      query: (payload) => ({
        url: PACKING_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["packing", "Box"],
    }),
    updatePacking: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PACKING_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["packing", "Box"],
    }),
    deletePacking: builder.mutation({
      query: (id) => ({
        url: `${PACKING_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["packing", "Box"],
    }),
  }),
});

export const {
  useGetPackingQuery,
  useGetPackingByIdQuery,
  useLazyGetPackingByIdQuery,
  useAddPackingMutation,
  useUpdatePackingMutation,
  useDeletePackingMutation,
} = packingApi;

export default packingApi;
