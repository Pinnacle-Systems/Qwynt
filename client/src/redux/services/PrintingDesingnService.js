import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRINTING_DESIGN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const printingDesignApi = createApi({
  reducerPath: "printingDesign",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["printingDesign"],
  endpoints: (builder) => ({
    getPrintingDesigns: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PRINTING_DESIGN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PRINTING_DESIGN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["printingDesign"],
    }),
    getPrintingDesignById: builder.query({
      query: (id) => {
        return {
          url: `${PRINTING_DESIGN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["printingDesign"],
    }),
    addPrintingDesign: builder.mutation({
      query: (payload) => ({
        url: PRINTING_DESIGN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["printingDesign"],
    }),
    updatePrintingDesign: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRINTING_DESIGN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["printingDesign"],
    }),
    deletePrintingDesign: builder.mutation({
      query: (id) => ({
        url: `${PRINTING_DESIGN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["printingDesign"],
    }),
  }),
});

export const {
  useGetPrintingDesignsQuery,
  useGetPrintingDesignByIdQuery,
  useAddPrintingDesignMutation,
  useUpdatePrintingDesignMutation,
  useDeletePrintingDesignMutation,
} = printingDesignApi;

export default printingDesignApi;
