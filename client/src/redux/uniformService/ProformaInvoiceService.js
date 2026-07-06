import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROFORMA_INVOICE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProformaInvoiceApi = createApi({
  reducerPath: "proformaInvoice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["proformaInvoice"],
  endpoints: (builder) => ({
    getProformaInvoice: builder.query({
      query: ({ params }) => {
        return {
          url: PROFORMA_INVOICE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["proformaInvoice"],
    }),
    getPIList: builder.query({
      query: ({ params }) => {
        return {
          url: `${PROFORMA_INVOICE_API}/proFormaList`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["proformaInvoice"],
    }),
    getProformaInvoiceById: builder.query({
      query: (id) => {
        return {
          url: `${PROFORMA_INVOICE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["proformaInvoice"],
    }),
    addProformaInvoice: builder.mutation({
      query: (payload) => ({
        url: PROFORMA_INVOICE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["proformaInvoice"],
    }),
    updateProformaInvoice: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PROFORMA_INVOICE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["proformaInvoice"],
    }),
    deleteProformaInvoice: builder.mutation({
      query: (id) => ({
        url: `${PROFORMA_INVOICE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["proformaInvoice"],
    }),
  }),
});

export const {
  useGetProformaInvoiceQuery,
  useGetPIListQuery,
  useGetProformaInvoiceByIdQuery,
  useLazyGetProformaInvoiceByIdQuery,
  useAddProformaInvoiceMutation,
  useUpdateProformaInvoiceMutation,
  useDeleteProformaInvoiceMutation,
} = ProformaInvoiceApi;

export default ProformaInvoiceApi;
