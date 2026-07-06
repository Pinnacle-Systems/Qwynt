import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCTION_INWARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProductionInwardApi = createApi({
  reducerPath: "productionInward",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["productionInward"],
  endpoints: (builder) => ({
    getProductionInward: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PRODUCTION_INWARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PRODUCTION_INWARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionInward"],
    }),
    getProductionInwardById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCTION_INWARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["productionInward"],
    }),
    getProductionInwardJobCardDtls: builder.query({
      query: ({ params }) => {
        return {
          url: `${PRODUCTION_INWARD_API}/getInwardJobCardDtls`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionInward"],
    }),
    addProductionInward: builder.mutation({
      query: (payload) => ({
        url: PRODUCTION_INWARD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["productionInward"],
    }),
    updateProductionInward: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCTION_INWARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["productionInward"],
    }),
    deleteProductionInward: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTION_INWARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productionInward"],
    }),
  }),
});

export const {
  useGetProductionInwardQuery,
  useGetProductionInwardByIdQuery,
  useGetProductionInwardJobCardDtlsQuery,
  useLazyGetProductionInwardByIdQuery,
  useAddProductionInwardMutation,
  useUpdateProductionInwardMutation,
  useDeleteProductionInwardMutation,
} = ProductionInwardApi;

export default ProductionInwardApi;
