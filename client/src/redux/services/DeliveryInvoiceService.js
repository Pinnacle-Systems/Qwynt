import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DELIVERY_INVOICE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DeliveryInvoiceApi = createApi({
  reducerPath: "DeliveryInvoice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DeliveryInvoice"],
  endpoints: (builder) => ({
    getDeliveryInvoice: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: DELIVERY_INVOICE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DELIVERY_INVOICE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DeliveryInvoice"],
    }),
    getDeliveryInvoiceById: builder.query({
      query: (id) => {
        return {
          url: `${DELIVERY_INVOICE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DeliveryInvoice"],
    }),
    addDeliveryInvoice: builder.mutation({
      query: (payload) => ({
        url: DELIVERY_INVOICE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["DeliveryInvoice"],
    }),
    updateDeliveryInvoice: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DELIVERY_INVOICE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DeliveryInvoice"],
    }),
    deleteDeliveryInvoice: builder.mutation({
      query: (id) => ({
        url: `${DELIVERY_INVOICE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DeliveryInvoice"],
    }),
  }),
});

export const {
  useGetDeliveryInvoiceQuery,
  useGetDeliveryInvoiceByIdQuery,
  useAddDeliveryInvoiceMutation,
  useUpdateDeliveryInvoiceMutation,
  useDeleteDeliveryInvoiceMutation,
} = DeliveryInvoiceApi;

export default DeliveryInvoiceApi;
