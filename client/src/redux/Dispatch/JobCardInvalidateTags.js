import store from "../store";
import {
  JobCardApi,
  ProcessBillApi,
  ProductionAllocationApi,
  ProductionInwardApi,
  ProductionOutwardApi,
} from "../uniformService";

export const invalidateJobCardModule = () => {
  store.dispatch(JobCardApi.util.invalidateTags(["jobCard"]));
  store.dispatch(
    ProductionAllocationApi.util.invalidateTags(["productionAllocation"]),
  );
  store.dispatch(
    ProductionOutwardApi.util.invalidateTags(["productionOutward"]),
  );
  store.dispatch(ProductionInwardApi.util.invalidateTags(["productionInward"]));
    store.dispatch(ProcessBillApi.util.invalidateTags(["processBill"]));
};
