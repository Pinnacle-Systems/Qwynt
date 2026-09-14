import store from "../store";
import { SalesDeliveryApi } from "../uniformService";
import { salesReturnApi } from "../services";

export const invalidateSalesModule = () => {
  store.dispatch(SalesDeliveryApi.util.invalidateTags(["SalesDelivery"]));
  store.dispatch(salesReturnApi.util.invalidateTags(["SalesReturn"]));
};
