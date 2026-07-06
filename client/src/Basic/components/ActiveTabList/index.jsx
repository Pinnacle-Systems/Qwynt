import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import {
  CountryMaster,
  PageMaster,
  StateMaster,
  CityMaster,
  DepartmentMaster,
  EmployeeCategoryMaster,
  FinYearMaster,
  UserAndRolesMaster,
  PageGroupMaster,
  AccountSettings,
  ControlPanel,
  EmployeeMaster,
  TermsAndCondition,
  PayTermMaster,
  LocationMaster,
  ApprovalRuleOperator,
  ApprovalRuleField,
  ApprovalRuleModule,
  CurrencyMaster,
  BankMaster,
} from "..";

import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import CompanyMaster from "../CompanyMaster";
import { useState } from "react";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import {
  PartyCategoryMaster,
  PartyMaster,
  ProductBrandMaster,
  ProductCategoryMaster,
  ProductMaster,
  PurchaseBillEntry,
  PurchaseRegister,
  PurchaseReturn,
  SalesBillEntry,
  SalesRegister,
  SalesReturn,
  UomMaster,
  StockRegister,
  MonthlySales,
  MonthlyPurchase,
  CurrentStock,
  MonthlyProfit,
  PaymentDetail,
  OpeningStock,
  PaymentLedgre,
  QuatationStock,
  Ledger,
  PurchaseLedger,
  PurchasepayLedgre,
  DeliveryChallan,
  StyleMaster,
  StyleItemMaster,
  DeliveryInvoice,
  ColorMaster,
  TaxTermMaster,
  TaxTemplate,
  HsnMaster,
  BranchTypeMaster,
  OpeningBalance,
  PurchaseOrder,
  PurchaseInward,
  PurchaseCancel,
  ItemGroup,
  Gsm,
  Size,
  SizeTemplate,
  PurchaseReport,
  ApprovalMaster,
  StockReport,
  OrderEntry,
  ProcessMaster,
  ProcessGroupMaster,
  JobCard,
  PlateMaster,
  DieMaster,
  BoardMaster,
  ProformaInvoice,
  ProductionAllocation,
  MachineMaster,
  ProductionOutward,
  ProductionInward,
  ProcessBill,
  SalesDelivery,
} from "../../../HostelStore/Components";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);

  const ref = useOutsideClick(() => {
    setShowHidden(false);
  });

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategoryMaster />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "PRODUCT BRAND MASTER": <ProductBrandMaster />,
    "PRODUCT CATEGORY MASTER": <ProductCategoryMaster />,
    "PRODUCT MASTER": <ProductMaster />,
    "PURCHASE BILL ENTRY": <PurchaseBillEntry />,
    "PURCHASE ORDER": <PurchaseOrder />,
    "PURCHASE CANCEL": <PurchaseCancel />,
    "PURCHASE INWARD": <PurchaseInward />,
    "CUSTOMER / SUPPLIER MASTER": <PartyMaster />,
    "SALES BILL ENTRY": <SalesBillEntry />,
    "PURCHASE RETURN": <PurchaseReturn />,
    "SALES RETURN": <SalesReturn />,
    "PURCHASE REGISTER": <PurchaseRegister />,
    "SALES REGISTER": <SalesRegister />,
    "UOM MASTER": <UomMaster />,
    "STOCK REGISTER": <StockRegister />,
    "MONTHLY SALES REPORTS": <MonthlySales />,
    "MONTHLY PURCHASE REPORT": <MonthlyPurchase />,
    "CURRENT STOCK": <CurrentStock />,
    "PROFIT REPORT": <MonthlyProfit />,
    "PAYMENT DETAIL": <PaymentDetail />,
    "OPENING STOCK": <OpeningStock />,
    "QUATATION STOCK": <QuatationStock />,
    "PAYMENT OUTSTANDING LEDGER": <PaymentLedgre />,
    "PURCHASE PAYMENT LEDGRE": <PurchasepayLedgre />,
    "CUSTOMER LEDGER": <Ledger />,
    "PURCHASE LEDGER": <PurchaseLedger />,
    "DELIVERY CHALLAN": <DeliveryChallan />,
    "STYLE MASTER": <StyleMaster />,
    "ITEM MASTER": <StyleItemMaster />,
    INVOICE: <DeliveryInvoice />,
    "COLOR MASTER": <ColorMaster />,
    "TAX TERM MASTER": <TaxTermMaster />,
    "TAX TEMPLATE": <TaxTemplate />,
    "HSN MASTER": <HsnMaster />,
    "BRANCH TYPE MASTER": <BranchTypeMaster />,
    "OPENING BALANCE": <OpeningBalance />,
    "TERMS & CONDTIONS MASTER": <TermsAndCondition />,
    "PAY TERM MASTER": <PayTermMaster />,
    "LOCATION MASTER": <LocationMaster />,
    "ITEM GROUP MASTER": <ItemGroup />,
    "GSM MASTER": <Gsm />,
    "SIZE MASTER": <Size />,
    "SIZE TEMPLATE MASTER": <SizeTemplate />,
    "PURCHASE REPORT": <PurchaseReport />,
    "APPROVAL CONFIGURATION": <ApprovalMaster />,
    "STOCK REPORT": <StockReport />,
    "APPROVAL RULE OPERATOR": <ApprovalRuleOperator />,
    "APPROVAL RULE FIELD": <ApprovalRuleField />,
    "APPROVAL RULE MODULE": <ApprovalRuleModule />,
    "ORDER ENTRY": <OrderEntry />,
    "PROCESS MASTER": <ProcessMaster />,
    "PROCESS GROUP MASTER": <ProcessGroupMaster />,
    "JOB CARD": <JobCard />,
    "PLATE MASTER": <PlateMaster />,
    "DIE MASTER": <DieMaster />,
    "BOARD MASTER": <BoardMaster />,
    "PROFORMA INVOICE": <ProformaInvoice />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "BANK MASTER": <BankMaster />,
    "PRODUCTION ALLOCATION": <ProductionAllocation />,
    "MACHINE MASTER": <MachineMaster />,
    "PROCESS ISSUE": <ProductionOutward />,
    "PROCESS RECEIPT": <ProductionInward />,
    "PROCESS BILL": <ProcessBill />,
    "SALES DELIVERY": <SalesDelivery />,
  };
  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;

  const currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));
  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));

  return (
    // <div className="relative ">
    <div
      className="w-full h-full min-h-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#F1F1F0" }}
    >
      <div className="flex justify-between shrink-0">
        <div className="flex gap-2 ">
          {currentShowingTabs.map((tab, index) => (
            <div
              key={index}
              className={`px-2 rounded-lg text-[11px] d-flex content-center items-center gap-1 hover:bg-gray-500 hover:text-white transition my-1 ${
                tab.active
                  ? "bg-gray-500 text-white border border-gray-500"
                  : "text-gray-500 border border-gray-500"
              }`}
            >
              <button
                onClick={() => {
                  dispatch(push({ name: tab.name }));
                }}
              >
                {tab.name}
              </button>
              <button
                className="px-1 rounded-xs transition"
                onClick={() => {
                  dispatch(remove({ name: tab.name }));
                }}
              >
                {CLOSE_ICON}
              </button>
            </div>
          ))}
        </div>
        <div>
          {hiddenTabs.length !== 0 && (
            <button onClick={() => setShowHidden(true)}>
              {DOUBLE_NEXT_ICON}
            </button>
          )}
        </div>
        {showHidden && (
          <ul
            ref={ref}
            className="absolute right-0 top-5 bg-gray-200 z-50 text-xs p-1"
          >
            {hiddenTabs.map((tab) => (
              <li
                key={tab.name}
                className={`flex justify-between  ${
                  tab.active ? "bg-[#009688]" : "bg-gray-300"
                } `}
              >
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                  }}
                >
                  {tab.name}
                </button>
                <button
                  className="hover:bg-red-400 px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {openTabs.tabs.map((tab, index) => (
        <div
          key={index}
          className={`${tab.active ? "block" : "hidden"} flex-1 min-h-0 overflow-hidden`}
        >
          {tabs[tab.name]}
        </div>
      ))}
    </div>
  );
};

export default ActiveTabList;
