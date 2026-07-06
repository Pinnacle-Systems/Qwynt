import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { getCommonParams } from '../../Utils/helper';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const baseQuery = () => {
    const baseQueryFetch = fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers, { getState }) => {
            const { token } = getCommonParams()
            // If we have a token set in state, let's assume that we should be passing it.
            if (token) {
                headers.set('authorization', token)
            } else {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/'
            }

            return headers
        },

    });
    return async (args, api, extraOptions) => {
        const result = await baseQueryFetch(args, api, extraOptions);
        if (result.error && result.error.originalStatus === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/'
            return
        }
        return result;
    };
};

export default baseQuery();