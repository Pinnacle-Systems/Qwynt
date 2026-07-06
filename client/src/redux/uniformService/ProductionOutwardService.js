import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCTION_OUTWARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProductionOutwardApi = createApi({
  reducerPath: "productionOutward",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["productionOutward"],
  endpoints: (builder) => ({
    getProductionOutward: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PRODUCTION_OUTWARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PRODUCTION_OUTWARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionOutward"],
    }),
    getProductionOutwardJobCardDtls: builder.query({
      query: ({ params }) => {
        return {
          url: `${PRODUCTION_OUTWARD_API}/getOutwardJobCardDtls`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionOutward"],
    }),
    getProductionOutwardById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCTION_OUTWARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["productionOutward"],
    }),
    addProductionOutward: builder.mutation({
      query: (payload) => ({
        url: PRODUCTION_OUTWARD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["productionOutward"],
    }),
    updateProductionOutward: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCTION_OUTWARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["productionOutward"],
    }),
    deleteProductionOutward: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTION_OUTWARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productionOutward"],
    }),
  }),
});

export const {
  useGetProductionOutwardQuery,
  useGetProductionOutwardByIdQuery,
  useGetProductionOutwardJobCardDtlsQuery,
  useLazyGetProductionOutwardByIdQuery,
  useAddProductionOutwardMutation,
  useUpdateProductionOutwardMutation,
  useDeleteProductionOutwardMutation,
} = ProductionOutwardApi;

export default ProductionOutwardApi;
