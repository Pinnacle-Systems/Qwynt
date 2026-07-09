import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MODELNAME_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const modelNameMasterApi = createApi({
  reducerPath: "modelNameMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["modelNameMaster"],
  endpoints: (builder) => ({
    getModelNames: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MODELNAME_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: MODELNAME_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["modelNameMaster"],
    }),
    getModelNameById: builder.query({
      query: (id) => {
        return {
          url: `${MODELNAME_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["modelNameMaster"],
    }),
    addModelName: builder.mutation({
      query: (payload) => ({
        url: MODELNAME_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["modelNameMaster"],
    }),
    updateModelName: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${MODELNAME_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["modelNameMaster"],
    }),
    deleteModelName: builder.mutation({
      query: (id) => ({
        url: `${MODELNAME_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["modelNameMaster"],
    }),
  }),
});

export const {
  useGetModelNamesQuery,
  useGetModelNameByIdQuery,
  useAddModelNameMutation,
  useUpdateModelNameMutation,
  useDeleteModelNameMutation,
} = modelNameMasterApi;

export default modelNameMasterApi;
