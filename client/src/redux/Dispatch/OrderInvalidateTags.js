import OrderEntryApi from "../uniformService/OrderEntryService";
import store from "../store";

export const invalidateOrderEntryModule = () => {
  store.dispatch(OrderEntryApi.util.invalidateTags(["orderEntry"]));
};
