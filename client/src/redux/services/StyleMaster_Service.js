import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STYLE_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const styleMasterApi = createApi({
  reducerPath: "styleMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["styleMaster"],
  endpoints: (builder) => ({
    getStyleMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: STYLE_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: STYLE_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["styleMaster"],
    }),
    getStyleMasterById: builder.query({
      query: (id) => {
        return {
          url: `${STYLE_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["styleMaster"],
    }),
    addStyleMaster: builder.mutation({
      query: (payload) => ({
        url: STYLE_MASTER_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["styleMaster"],
    }),
    updateStyleMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STYLE_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["styleMaster"],
    }),
    deleteStyleMaster: builder.mutation({
      query: (id) => ({
        url: `${STYLE_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["styleMaster"],
    }),
  }),
});

export const {
  useGetStyleMasterQuery,
  useGetStyleMasterByIdQuery,
  useAddStyleMasterMutation,
  useUpdateStyleMasterMutation,
  useDeleteStyleMasterMutation,
} = styleMasterApi;

export default styleMasterApi;
