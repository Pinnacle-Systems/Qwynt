import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BOARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const BoardMasterApi = createApi({
  reducerPath: "board",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Board"],
  endpoints: (builder) => ({
    getBoardMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: BOARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: BOARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["Board"],
    }),
    getBoardMasterById: builder.query({
      query: (id) => {
        return {
          url: `${BOARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Board"],
    }),
    addBoardMaster: builder.mutation({
      query: (payload) => ({
        url: BOARD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Board"],
    }),
    updateBoardMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BOARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Board"],
    }),
    deleteBoardMaster: builder.mutation({
      query: (id) => ({
        url: `${BOARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board"],
    }),
  }),
});

export const {
  useGetBoardMasterQuery,
  useGetBoardMasterByIdQuery,
  useLazyGetBoardMasterByIdQuery,
  useAddBoardMasterMutation,
  useUpdateBoardMasterMutation,
  useDeleteBoardMasterMutation,
} = BoardMasterApi;

export default BoardMasterApi;
