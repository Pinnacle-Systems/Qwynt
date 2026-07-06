

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UOM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const uomMasterApi = createApi({
    reducerPath: "uomMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["UomMaster"],
    endpoints: (builder) => ({
        getUom: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: UOM_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: UOM_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["UomMaster"],
        }),
        getUomById: builder.query({
            query: (id) => {
                return {
                    url: `${UOM_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["UomMaster"],
        }),
        addUom: builder.mutation({
            query: (payload) => ({
                url: UOM_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UomMaster"],
        }),
        updateUom: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${UOM_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["UomMaster"],
        }),
        deleteUom: builder.mutation({
            query: (id) => ({
                url: `${UOM_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["UomMaster"],
        }),
    }),
});

export const {
    useGetUomQuery,
    useGetUomByIdQuery,
    useLazyGetUomByIdQuery,
    useAddUomMutation,
    useUpdateUomMutation,
    useDeleteUomMutation,
} = uomMasterApi;

export default uomMasterApi;

