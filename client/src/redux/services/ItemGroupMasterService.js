import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_GROUP_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemGroupMasterApi = createApi({
    reducerPath: "ItemGroupMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemGroupMaster"],
    endpoints: (builder) => ({
        getItemGroupMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_GROUP_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_GROUP_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemGroupMaster"],
        }),
        getItemGroupMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_GROUP_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemGroupMaster"],
        }),
        addItemGroupMaster: builder.mutation({
            query: (payload) => ({
                url: ITEM_GROUP_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemGroupMaster"],
        }),
        updateItemGroupMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_GROUP_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemGroupMaster"],
        }),
        deleteItemGroupMaster: builder.mutation({
            query: (id) => ({
                url: `${ITEM_GROUP_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemGroupMaster"],
        }),
    }),
});

export const {
    useGetItemGroupMasterQuery,
    useGetItemGroupMasterByIdQuery,
    useLazyGetItemGroupMasterByIdQuery,
    useAddItemGroupMasterMutation,
    useUpdateItemGroupMasterMutation,
    useDeleteItemGroupMasterMutation,
} = ItemGroupMasterApi;

export default ItemGroupMasterApi;