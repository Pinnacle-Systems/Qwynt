import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PlateMasterApi = createApi({
  reducerPath: "plate",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Plate"],
  endpoints: (builder) => ({
    getPlateMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PLATE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PLATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Plate"],
    }),
    getPlateMasterById: builder.query({
      query: (id) => {
        return {
          url: `${PLATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Plate"],
    }),
    addPlateMaster: builder.mutation({
      query: (payload) => ({
        url: PLATE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Plate"],
    }),
    updatePlateMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PLATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Plate"],
    }),
    deletePlateMaster: builder.mutation({
      query: (id) => ({
        url: `${PLATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plate"],
    }),
  }),
});

export const {
  useGetPlateMasterQuery,
  useGetPlateMasterByIdQuery,
  useLazyGetPlateMasterByIdQuery,
  useAddPlateMasterMutation,
  useUpdatePlateMasterMutation,
  useDeletePlateMasterMutation,
} = PlateMasterApi;

export default PlateMasterApi;
