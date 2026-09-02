import { boxMasterApi } from "../services";
import store from "../store";

export const invalidateboxModule = () => {
  store.dispatch(boxMasterApi.util.invalidateTags(["Box"]));
};
