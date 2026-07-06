import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTY_BRANCH_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyBranchMasterApi = createApi({
  reducerPath: "partyBranchMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["partyBranchMaster"],
  endpoints: (builder) => ({
    getPartyBranch: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_BRANCH_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_BRANCH_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["partyBranchMaster"],
    }),
    getPartyBranchById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_BRANCH_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["partyBranchMaster"],
    }),
    addPartyBranch: builder.mutation({
      query: (payload) => ({
        url: PARTY_BRANCH_API,
        method: "POST",
        body: payload,
    
      }),
      invalidatesTags: ["partyBranchMaster"],
    }),
    updatePartyBranch: builder.mutation({
      query: ({branchId, body}) => {
        return {
          url: `${PARTY_BRANCH_API}/${branchId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["partyBranchMaster"],
    }),
    deletePartyBranch: builder.mutation({
      query: (id) => ({
        url: `${PARTY_BRANCH_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partyBranchMaster"],
    }),
  }),
});

export const {
  useGetPartyBranchQuery,
  useGetPartyBranchByIdQuery,
  useAddPartyBranchMutation,
  useUpdatePartyBranchMutation,
  useDeletePartyBranchMutation,
} = partyBranchMasterApi;

export default partyBranchMasterApi;
