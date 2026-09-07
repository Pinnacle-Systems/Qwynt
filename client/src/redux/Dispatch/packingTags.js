import { packingApi } from "../uniformService";
import store from "../store";

export const invalidatePackingModule = () => {
  store.dispatch(packingApi.util.invalidateTags(["packing"]));
};
