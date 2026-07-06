import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TERMS_CONDITIONS_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const TermsandCondtionsApi = createApi({
    reducerPath: "TermsandCondtions",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["TermsandCondtions"],
    endpoints: (builder) => ({
        getTermsandCondtions: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: TERMS_CONDITIONS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: TERMS_CONDITIONS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["TermsandCondtions"],
        }),
        getTermsandCondtionsById: builder.query({
            query: (id) => {
                return {
                    url: `${TERMS_CONDITIONS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["TermsandCondtions"],
        }),
        addTermsandCondtions: builder.mutation({
            query: (payload) => ({
                url: TERMS_CONDITIONS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["TermsandCondtions"],
        }),
        updateTermsandCondtions: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${TERMS_CONDITIONS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["TermsandCondtions"],
        }),
        deleteTermsandCondtions: builder.mutation({
            query: (id) => ({
                url: `${TERMS_CONDITIONS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["TermsandCondtions"],
        }),
    }),
});

export const {
    useGetTermsandCondtionsQuery,
    useGetTermsandCondtionsByIdQuery,
    useLazyGetTermsandCondtionsByIdQuery,
    useAddTermsandCondtionsMutation,
    useUpdateTermsandCondtionsMutation,
    useDeleteTermsandCondtionsMutation,
} = TermsandCondtionsApi;

export default TermsandCondtionsApi;

