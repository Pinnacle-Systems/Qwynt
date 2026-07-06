import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { JOB_CARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const JobCardApi = createApi({
  reducerPath: "jobCard",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["jobCard"],
  endpoints: (builder) => ({
    getJobCard: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: JOB_CARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: JOB_CARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["jobCard"],
    }),
    getJobCardList: builder.query({
      query: ({ params }) => {
        return {
          url: JOB_CARD_API + "/jobCardList",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["jobCard"],
    }),
    getJobCardById: builder.query({
      query: (id) => {
        return {
          url: `${JOB_CARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["jobCard"],
    }),
    addJobCard: builder.mutation({
      query: (payload) => ({
        url: JOB_CARD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["jobCard"],
    }),
    updateJobCard: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${JOB_CARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["jobCard"],
    }),
    deleteJobCard: builder.mutation({
      query: (id) => ({
        url: `${JOB_CARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["jobCard"],
    }),
  }),
});

export const {
  useGetJobCardQuery,
  useGetJobCardListQuery,
  useGetJobCardByIdQuery,
  useLazyGetJobCardByIdQuery,
  useAddJobCardMutation,
  useUpdateJobCardMutation,
  useDeleteJobCardMutation,
} = JobCardApi;

export default JobCardApi;
