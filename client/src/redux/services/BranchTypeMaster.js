import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  BRANCH_TYPE_MASTER } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const branchTypeMasterApi = createApi({
  reducerPath: "branchTypeMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["branchType"],
  endpoints: (builder) => ({
    getbranchType: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: BRANCH_TYPE_MASTER + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: BRANCH_TYPE_MASTER,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["branchType"],
    }),
    getbranchTypeById: builder.query({
      query: (id) => {
        return {
          url: `${BRANCH_TYPE_MASTER}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["branchType"],
    }),
    addbranchType: builder.mutation({
      query: (payload) => ({
        url: BRANCH_TYPE_MASTER,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["branchType"],
    }),
    updatebranchType: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BRANCH_TYPE_MASTER}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["branchType"],
    }),
    deletebranchType: builder.mutation({
      query: (id) => ({
        url: `${BRANCH_TYPE_MASTER}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["branchType"],
    }),
  }),
});



export const {
  useGetbranchTypeQuery,
  useGetbranchTypeByIdQuery,
  useAddbranchTypeMutation,
  useUpdatebranchTypeMutation,
  useDeletebranchTypeMutation,
} = branchTypeMasterApi;

export default branchTypeMasterApi;
