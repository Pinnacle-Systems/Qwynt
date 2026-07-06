import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DIE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DieMasterApi = createApi({
  reducerPath: "die",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Die"],
  endpoints: (builder) => ({
    getDieMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DIE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: DIE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Die"],
    }),
    getDieMasterById: builder.query({
      query: (id) => {
        return {
          url: `${DIE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Die"],
    }),
    addDieMaster: builder.mutation({
      query: (payload) => ({
        url: DIE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Die"],
    }),
    updateDieMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DIE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Die"],
    }),
    deleteDieMaster: builder.mutation({
      query: (id) => ({
        url: `${DIE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Die"],
    }),
  }),
});

export const {
  useGetDieMasterQuery,
  useGetDieMasterByIdQuery,
  useLazyGetDieMasterByIdQuery,
  useAddDieMasterMutation,
  useUpdateDieMasterMutation,
  useDeleteDieMasterMutation,
} = DieMasterApi;

export default DieMasterApi;
