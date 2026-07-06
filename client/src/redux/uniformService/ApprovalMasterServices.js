import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPROVAL_API, APPROVAL_MASTER_DATA_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const approvalMasterApi = createApi({
  reducerPath: "approvalMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: [
    "Approval",
    "ApprovalField",
    "ApprovalModule",
    "ApprovalNotification",
  ],
  endpoints: (builder) => ({
    getApproval: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: APPROVAL_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: APPROVAL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Approval"],
    }),
    getApprovalNew: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: `${APPROVAL_API}/new` + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: `${APPROVAL_API}/new`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Approval"],
    }),
    getApprovalById: builder.query({
      query: (id) => {
        return {
          url: `${APPROVAL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Approval"],
    }),
    getPendingApproval: builder.query({
      query: ({ params }) => {
        return {
          url: `${APPROVAL_API}/getPendingApproval`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Approval"],
    }),
    addApproval: builder.mutation({
      query: (payload) => ({
        url: APPROVAL_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Approval"],
    }),
    markApprovalRead: builder.mutation({
      query: (id) => ({
        url: `${APPROVAL_API}/markRead/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Approval"],
    }),
    updateApproval: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${APPROVAL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Approval"],
    }),
    deleteApproval: builder.mutation({
      query: (id) => ({
        url: `${APPROVAL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Approval"],
    }),
    getApprovalFields: builder.query({
      query: (moduleId) => ({
        url: `${APPROVAL_MASTER_DATA_API}/fields${moduleId ? `?moduleId=${moduleId}` : ""}`,
        method: "GET",
      }),
      providesTags: ["ApprovalField"],
    }),
    getApprovalOperators: builder.query({
      query: () => ({
        url: `${APPROVAL_MASTER_DATA_API}/operators`,
        method: "GET",
      }),
      providesTags: ["ApprovalField"],
    }),
    addApprovalField: builder.mutation({
      query: (payload) => ({
        url: `${APPROVAL_MASTER_DATA_API}/fields`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ApprovalField"],
    }),
    updateApprovalField: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${APPROVAL_MASTER_DATA_API}/fields/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ApprovalField"],
    }),
    deleteApprovalField: builder.mutation({
      query: (id) => ({
        url: `${APPROVAL_MASTER_DATA_API}/fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ApprovalField"],
    }),
    addApprovalOperator: builder.mutation({
      query: (payload) => ({
        url: `${APPROVAL_MASTER_DATA_API}/operators`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ApprovalField"],
    }),
    updateApprovalOperator: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${APPROVAL_MASTER_DATA_API}/operators/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ApprovalField"],
    }),
    deleteApprovalOperator: builder.mutation({
      query: (id) => ({
        url: `${APPROVAL_MASTER_DATA_API}/operators/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ApprovalField"],
    }),
    getApprovalModules: builder.query({
      query: () => ({
        url: `${APPROVAL_MASTER_DATA_API}/modules`,
        method: "GET",
      }),
      providesTags: ["ApprovalModule"],
    }),
    addApprovalModule: builder.mutation({
      query: (payload) => ({
        url: `${APPROVAL_MASTER_DATA_API}/modules`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ApprovalModule"],
    }),
    updateApprovalModule: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${APPROVAL_MASTER_DATA_API}/modules/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ApprovalModule"],
    }),
    deleteApprovalModule: builder.mutation({
      query: (id) => ({
        url: `${APPROVAL_MASTER_DATA_API}/modules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ApprovalModule"],
    }),
    getPendingApprovall: builder.query({
      query: ({ params }) => ({
        url: `${APPROVAL_API}/getPendingApproval`, // ✅ use APPROVAL_API constant not hardcoded string
        params,
      }),
      providesTags: ["ApprovalNotification"],
    }),

    markNotificationAsRead: builder.mutation({
      query: ({ id, userId }) => ({
        url: `${APPROVAL_API}/markRead/${id}`, // ✅ use APPROVAL_API constant
        method: "PUT", // ✅ PUT not PATCH
        body: { userId },
      }),
      invalidatesTags: ["ApprovalNotification"],
    }),
  }),
});

export const {
  useGetApprovalQuery,
  useGetApprovalNewQuery,
  useLazyGetApprovalByIdQuery,
  useGetApprovalByIdQuery,
  useGetPendingApprovalQuery,
  useAddApprovalMutation,
  useMarkApprovalReadMutation,
  useUpdateApprovalMutation,
  useDeleteApprovalMutation,
  useGetApprovalFieldsQuery,
  useGetApprovalOperatorsQuery,
  useAddApprovalFieldMutation,
  useUpdateApprovalFieldMutation,
  useDeleteApprovalFieldMutation,
  useAddApprovalOperatorMutation,
  useUpdateApprovalOperatorMutation,
  useDeleteApprovalOperatorMutation,
  useGetApprovalModulesQuery,
  useAddApprovalModuleMutation,
  useUpdateApprovalModuleMutation,
  useDeleteApprovalModuleMutation,
  useMarkNotificationAsReadMutation,
  useGetPendingApprovallQuery,
} = approvalMasterApi;

export default approvalMasterApi;
