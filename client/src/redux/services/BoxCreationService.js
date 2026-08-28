import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BOX_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const boxMasterApi = createApi({
  reducerPath: "boxMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Box"],
  endpoints: (builder) => ({
    getBox: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: BOX_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: BOX_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Box"],
    }),
    getBoxById: builder.query({
      query: (id) => {
        return {
          url: `${BOX_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Box"],
    }),
    addBox: builder.mutation({
      query: (payload) => ({
        url: BOX_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Box"],
    }),
    updateBox: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BOX_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Box"],
    }),
    deleteBox: builder.mutation({
      query: (id) => ({
        url: `${BOX_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Box"],
    }),
  }),
});

export const {
  useGetBoxQuery,
  useGetBoxByIdQuery,
  useAddBoxMutation,
  useUpdateBoxMutation,
  useDeleteBoxMutation,
} = boxMasterApi;

export default boxMasterApi;
