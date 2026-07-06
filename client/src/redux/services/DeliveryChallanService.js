import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DELIVERY_CHALLAN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DeliveryChallanApi = createApi({
  reducerPath: "DeliveryChallan",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DeliveryChallan"],
  endpoints: (builder) => ({
    getDeliveryChallan: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DELIVERY_CHALLAN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DELIVERY_CHALLAN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DeliveryChallan"],
    }),
    getDeliveryChallanItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${DELIVERY_CHALLAN_API}/getDcItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DeliveryChallan"],
    }),
    getDeliveryChallanById: builder.query({
      query: (id) => {
        return {
          url: `${DELIVERY_CHALLAN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DeliveryChallan"],
    }),
    addDeliveryChallan: builder.mutation({
      query: (payload) => ({
        url: DELIVERY_CHALLAN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["DeliveryChallan"],
    }),
    updateDeliveryChallan: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DELIVERY_CHALLAN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DeliveryChallan"],
    }),
    deleteDeliveryChallan: builder.mutation({
      query: (id) => ({
        url: `${DELIVERY_CHALLAN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DeliveryChallan"],
    }),
  }),
});

export const {
  useGetDeliveryChallanQuery,
  useGetDeliveryChallanItemsQuery,
  useGetDeliveryChallanByIdQuery,
  useAddDeliveryChallanMutation,
  useUpdateDeliveryChallanMutation,
  useDeleteDeliveryChallanMutation,
} = DeliveryChallanApi;

export default DeliveryChallanApi;
