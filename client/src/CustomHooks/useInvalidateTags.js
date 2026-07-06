import { useDispatch } from "react-redux";

const useInvalidateTags = () => {
  const dispatch = useDispatch();

  const apiInvalidateData = [
    {
      type: `countryMaster/invalidateTags`,
      payload: ["Countries"],
    },
    {
      type: `stateMaster/invalidateTags`,
      payload: ["State"],
    },
    {
      type: `cityMaster/invalidateTags`,
      payload: ["City"],
    },
    {
      type: `paytermMaster/invalidateTags`,
      payload: ["PaytermMaster"],
    },
    {
      type: `taxTermMaster/invalidateTags`,
      payload: ["TaxTermMaster"],
    },
    {
      type: `taxTemplate/invalidateTags`,
      payload: ["TaxTemplate"],
    },
    {
      type: `StyleItemMaster/invalidateTags`,
      payload: ["StyleItemMaster"],
    },
    {
      type: `TermsandCondtions/invalidateTags`,
      payload: ["TermsandCondtions"],
    },
    {
      type: `finYearMaster/invalidateTags`,
      payload: ["FinYear"],
    },
    {
      type: `partyMaster/invalidateTags`,
      payload: ["Party"],
    },
    {
      type: `locationMaster/invalidateTags`,
      payload: ["LocationMaster"],
    },
    {
      type: `termsAndConditionsMaster/invalidateTags`,
      payload: ["TermsAndConditions"],
    },
    {
      type: `employeeCategoryMaster/invalidateTags`,
      payload: ["EmployeeCategory"],
    },
    {
      type: `departmentMaster/invalidateTags`,
      payload: ["Department"],
    },
    {
      type: `employeeMaster/invalidateTags`,
      payload: ["Employee"],
    },
    {
      type: `colorMaster/invalidateTags`,
      payload: ["ColorMaster"],
    },
    {
      type: `sizeMaster/invalidateTags`,
      payload: ["SizeMaster"],
    },
    {
      type: `SizeTemplate/invalidateTags`,
      payload: ["SizeTemplate"],
    },
    {
      type: `uomMaster/invalidateTags`,
      payload: ["UomMaster"],
    },
    {
      type: `hsnMaster/invalidateTags`,
      payload: ["HsnMaster"],
    },
    {
      type: `GsmMaster/invalidateTags`,
      payload: ["GsmMaster"],
    },
    {
      type: `ItemCategoryMaster/invalidateTags`,
      payload: ["ItemCategoryMaster"],
    },
    {
      type: `itemMaster/invalidateTags`,
      payload: ["ItemMaster"],
    },
    {
      type: `priceTemplate/invalidateTags`,
      payload: ["priceTemplate"],
    },

    {
      type: `Sample/invalidateTags`,
      payload: ["Sample"],
    },
    {
      type: `po/invalidateTags`,
      payload: ["po"],
    },
    {
      type: `purchaseCancel/invalidateTags`,
      payload: ["PurchaseCancel"],
    },

    {
      type: `directInwardOrReturn/invalidateTags`,
      payload: ["DirectInwardOrReturn"],
    },
    {
      type: `directCancelOrReturn/invalidateTags`,
      payload: ["DirectCancelOrReturn"],
    },
    {
      type: `billEntry/invalidateTags`,
      payload: ["BillEntry"],
    },
    {
      type: `branchTypeMaster/invalidateTags`,
      payload: ["branchType"],
    },
    {
      type: `accessoryPo/invalidateTags`,
      payload: ["accessoryPo"],
    },
    {
      type: `AccessoryPurchaseCancel/invalidateTags`,
      payload: ["AccessoryPurchaseCancel"],
    },
    {
      type: `AccessoryPurchaseInward/invalidateTags`,
      payload: ["AccessoryPurchaseInward"],
    },
    {
      type: `AccessoryPurchaseReturn/invalidateTags`,
      payload: ["AccessoryPurchaseReturn"],
    },
    {
      type: `stock/invalidateTags`,
      payload: ["Stock"],
    },
    {
      type: `ItemControlPanel/invalidateTags`,
      payload: ["ItemControlPanel"],
    },
    {
      type: `pageMaster/invalidateTags`,
      payload: ["Pages"],
    },
    {
      type: `Quotation/invalidateTags`,
      payload: ["Quotation"],
    },
    {
      type: `saleOrder/invalidateTags`,
      payload: ["saleOrder"],
    },
    {
      type: `salesInvoice/invalidateTags`,
      payload: ["salesInvoice"],
    },
    {
      type: `salesDelivery/invalidateTags`,
      payload: ["salesDelivery"],
    },
    {
      type: `salesReturn/invalidateTags`,
      payload: ["salesReturn"],
    },
    {
      type: `approvalMaster/invalidateTags`,
      payload: ["Approval"],
    },
    {
      type: `currencyMaster/invalidateTags`,
      payload: ["Currencies"],
    },
    {
      type: `bankMaster/invalidateTags`,
      payload: ["bank"],
    },
  ];

  function dispatchInvalidate() {
    apiInvalidateData.forEach((item) => {
      dispatch(item);
    });
  }
  return [dispatchInvalidate];
};

export default useInvalidateTags;
