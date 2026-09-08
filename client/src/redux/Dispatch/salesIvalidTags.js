import { salesReturnApi } from "../services";
import store from "../store";

export const invalidateSalesModule = () => {
    store.dispatch(salesReturnApi.util.invalidateTags(["SalesReturn"]));
};
