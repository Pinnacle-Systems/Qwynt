import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCTION_ALLOCATION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProductionAllocationApi = createApi({
  reducerPath: "productionAllocation",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["productionAllocation"],
  endpoints: (builder) => ({
    getProductionAllocation: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PRODUCTION_ALLOCATION_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PRODUCTION_ALLOCATION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionAllocation"],
    }),
    getAllocationList: builder.query({
      query: ({ params }) => {
        return {
          url: PRODUCTION_ALLOCATION_API + "/allocationList",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["productionAllocation"],
    }),
    getProductionAllocationById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCTION_ALLOCATION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["productionAllocation"],
    }),
    addProductionAllocation: builder.mutation({
      query: (payload) => ({
        url: PRODUCTION_ALLOCATION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["productionAllocation"],
    }),
    updateProductionAllocation: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PRODUCTION_ALLOCATION_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["productionAllocation"],
    }),
    deleteProductionAllocation: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTION_ALLOCATION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productionAllocation"],
    }),
  }),
});

export const {
  useGetProductionAllocationQuery,
  useGetAllocationListQuery,
  useGetProductionAllocationByIdQuery,
  useLazyGetProductionAllocationByIdQuery,
  useAddProductionAllocationMutation,
  useUpdateProductionAllocationMutation,
  useDeleteProductionAllocationMutation,
} = ProductionAllocationApi;

export default ProductionAllocationApi;
