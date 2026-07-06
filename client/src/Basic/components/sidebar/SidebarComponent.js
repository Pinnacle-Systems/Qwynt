import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push } from "../../../redux/features/opentabs";
import { useNavigate } from "react-router-dom";
import designation from "./images/designation.png";
import pay from "./images/money.png";
import country from "./images/flag.png";
import employee from "./images/employee.png";
import state from "./images/map.png";
import city from "./images/city.png";
import department from "./images/department.png";
import calender from "./images/calender.png";
import empcategory from "./images/empcategory.png";
import partycategory from "./images/partycategory.png";
import currency from "./images/currency.png";
import party from "./images/party.png";
import color from "./images/color.png";
import payterm from "./images/payterm.png";
import taxterm from "./images/tax.png";
import taxtemplate from "./images/taxtemplate.png";
import size from "./images/size.png";
import style from "./images/fabImage.jpg";
import location from "./images/location.png";
import sizetemplate from "./images/sizetemplate.png";
import fabstyle from "./images/style.png";
import fabric from "./images/fabric.png";
// import process from "./images/process.png";
import portion from "./images/portion.png";
import uom from "./images/uom.png";
import styleitem from "./images/styleItem.png";
import seq from "./images/seq.jpg";
import processGroup from "./images/processgroup.jpg";
import accessorygroup from "./images/accessorygroup.png";
import accessory from "./images/accessory.png";
import purchaseInward from "./images/purchaseinward.png";
import purchaseReturn from "./images/purchasereturn.png";
import openingStock from "./images/openingStock.png";
import stockAdjustment from "./images/stockadjustment.png";
import salesDelivery from "./images/sales delivery.png";
import salesBill from "./images/salesBill.png";
import salesReturn from "./images/salesreturn.png";
import production from "./images/production.png";
import cutting from "./images/cuttingproduction.jpg";
import goodsStock from "./images/goodsstock.jpg";
import materialStock from "./images/materialstock.png";
import salesReport from "./images/sales report.png";
import salesReturnReport from "./images/sales return report.png";
import stockSummary from "./images/summary report.png";
import reference from "./images/reference.jpg";
import { Search } from "lucide-react";
import Hsn from "./images/hsncode.png";
import BranchType from "./images/branchtype.png";
import ItemGroup from "./images/itemgroup.jpg";
import Term from "./images/terms.png";
import Item from "./images/item.png";
import PO from "./images/po.png";
import PurchaseCancel from "./images/purchasecancel.png";
import PurchaseBill from "./images/purchasebillEntry.png";
import GSM from "./images/gsm.png";
import Approval from "./images/approve.png";
const SidebarComponent = ({
  logo,
  groups,
  pages,
  isMainDropdownOpen,
  setIsMainDropdownOpen,
  heading,
  setIsOpen,
}) => {
  const dispatch = useDispatch();
  const priority = {
    "LOCATION & GEOGRAPHY": 1,
    "BUSINESS & PARTIES": 2,
    "PEOPLE MANAGEMENT": 3,
    "ITEM MANAGEMENT": 4,
    TAX: 5,
  };
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const navigate = useNavigate();
  groups.sort((a, b) => priority[a.name] - priority[b.name]);

  // console.log(groups, "groups")
  // const priority = {
  //   "SAMPLE": 1,
  //   "ORDER": 2,
  //   "PURCHASE": 3,
  //   "OPENING STOCK": 4
  // };
  // groups.sort((a, b) => priority[a.name] - priority[b.name]);

  const [search, setSearch] = useState("");

  const filteredData = pages.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const iconMapping = {
    "COUNTRY MASTER": (
      <img
        src={country}
        alt="country"
        className="w-[23px]  justify-center items-center bg-white rounded border-2 border-white shadow"
      />
    ),
    "EMPLOYEE MASTER": (
      <img
        src={employee}
        alt="country"
        className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "STATE MASTER": (
      <img
        src={state}
        alt="country"
        className="w-[23px]  justify-center items-center  bg-white border-2 border-white rounded shadow"
      />
    ),
    "CITY MASTER": (
      <img
        src={city}
        alt="country"
        className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "FIN YEAR MASTER": (
      <img
        src={calender}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "DEPARTMENT MASTER": (
      <img
        src={department}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "EMPLOYEE CATEGORY MASTER": (
      <img
        src={empcategory}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PAY TERM MASTER": (
      <img
        src={payterm}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "TAX TERM MASTER": (
      <img
        src={taxterm}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "TAX TEMPLATE": (
      <img
        src={taxtemplate}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "COLOR MASTER": (
      <img
        src={color}
        alt="country"
        className="w-[23px] flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "SIZE MASTER": (
      <img
        src={size}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "SIZE TEMPLATE MASTER": (
      <img
        src={sizetemplate}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "LOCATION MASTER": (
      <img
        src={location}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "UOM MASTER": (
      <img
        src={uom}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "STYLE ITEM MASTER": (
      <img
        src={styleitem}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PURCHASE INWARD": (
      <img
        src={purchaseInward}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PURCHASE RETURN": (
      <img
        src={purchaseReturn}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),

    // "OPENING STOCK":<img src={openingStock} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "STOCK ADJUSTMENT":<img src={stockAdjustment} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "SALES DELIVERY":<img src={salesDelivery} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "SALES RETURN":<img src={purchaseReturn} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "FINISHED GOODS STOCK":<img src={goodsStock} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "MATERIAL STOCK REPORT":<img src={materialStock} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "SALES REPORT":<img src={salesReport} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "SALES RETURN REPORT":<img src={salesReturnReport} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    // "STOCK SUMMARY REPORT":<img src={stockSummary} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
    "GAUGE MASTER": <img />,
    "HSN MASTER": (
      <img
        src={Hsn}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "BRANCH TYPE MASTER": (
      <img
        src={BranchType}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "ITEM GROUP MASTER": (
      <img
        src={ItemGroup}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "CUSTOMER / SUPPLIER MASTER": (
      <img
        src={party}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "TERMS & CONDTIONS MASTER": (
      <img
        src={Term}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "ITEM MASTER": (
      <img
        src={Item}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PURCHASE ORDER": (
      <img
        src={PO}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PURCHASE CANCEL": (
      <img
        src={PurchaseCancel}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "PURCHASE BILL ENTRY": (
      <img
        src={PurchaseBill}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "GSM MASTER": (
      <img
        src={GSM}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
    "APPROVAL CONFIGURATION": (
      <img
        src={Approval}
        alt="country"
        className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"
      />
    ),
  };
  return (
    <div className="fixed top-[3.5%] left-[87px] z-50">
      {isMainDropdownOpen && (
        <div
          onClick={() => {
            setIsMainDropdownOpen(false);
            setIsOpen(false);
          }}
          className="bg-black/50 fixed inset-0 -z-10"
        ></div>
      )}

      {isMainDropdownOpen && (
        <div className="bg-white p-4 rounded-lg shadow-2xl outline outline-1 outline-gray-300 h-[650px] overflow-y-auto w-[400px] transition-all duration-200 space-y-4">
          <div className="relative">
            <input
              type="text"
              name="masters"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-3 pr-10 py-2 text-sm text-gray-700 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
              <Search size={16} />
            </div>
          </div>

          <ul className="space-y-2">
            {groups?.map((group) => (
              <li key={group?.id} className="space-y-1">
                {search.length === 0 && (
                  <h3 className="text-sm font-semibold text-gray-700 pl-2 uppercase tracking-wide">
                    {/* {(group?.name + " Module").replace(/\b[a-z]/g, char => char.toUpperCase())} */}
                    {`${`${group?.name} ${group?.type ? group?.type : ""}`.replace(/\b[a-z]/g, (char) => char.toUpperCase())}`}
                  </h3>
                )}

                <ul className="grid grid-cols-4 gap-2 pt-1">
                  {filteredData
                    .filter(
                      (page) =>
                        parseInt(page.pageGroupId) === parseInt(group.id),
                    )
                    .map((page) => (
                      <li
                        key={page.id}
                        onClick={() => {
                          dispatch(push(page));
                          console.log(page, "pusheddd");
                          secureLocalStorage.setItem(
                            sessionStorage.getItem("sessionId") + "currentPage",
                            page?.id,
                          );
                          setIsMainDropdownOpen(false);
                          setIsOpen(false);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-xs text-center cursor-pointer transition-all duration-150"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-1">
                            {iconMapping[page?.name] || (
                              <span className="text-gray-400">🔘</span>
                            )}
                          </div>
                          <div className="text-xs ">
                            {page?.name
                              .replace(/\bMASTER\b/g, "")
                              .trim()
                              .toLowerCase()
                              .replace(/\b[a-z]/g, (char) =>
                                char.toUpperCase(),
                              )}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default SidebarComponent;
