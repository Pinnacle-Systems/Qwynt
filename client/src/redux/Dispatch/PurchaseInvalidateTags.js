// src/redux/utils/invalidateTags.js

import purchaseInwardEntryApi from "../uniformService/PurchaseInwardEntry";
import purchaseReturnApi from "../services/PurchaseReturnService";
import purchaseCancelApi from "../uniformService/PurchaseCancelService";
import PoApi from "../uniformService/PoServices";
import store from "../store";
import { purchaseReportApi } from "../services";
import { purchaseBillEntryApi } from "../uniformService";
import approvalMasterApi from "../uniformService/ApprovalMasterServices";
import stockApi from "../services/StockService";

export const invalidatePurchaseModule = () => {
  store.dispatch(
    purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"]),
  );
  store.dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
  store.dispatch(purchaseCancelApi.util.invalidateTags(["PurchaseCancel"]));
  store.dispatch(PoApi.util.invalidateTags(["po"]));
  store.dispatch(purchaseReportApi.util.invalidateTags(["PurchaseReport"]));
  store.dispatch(
    purchaseBillEntryApi.util.invalidateTags(["PurchaseBillEntry"]),
  );
  store.dispatch(approvalMasterApi.util.invalidateTags(["Approval"]));
  store.dispatch(stockApi.util.invalidateTags(["Stock"]));
};
