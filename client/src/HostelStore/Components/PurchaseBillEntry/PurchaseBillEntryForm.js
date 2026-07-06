import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DateInputNew,
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  ModeChip,
} from "../../../Utils/helper";

import { toast } from "react-toastify";
import { FiEdit2, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";

import InwardItems from "./InwardItems";
import purchaseInwardEntryApi, {
  useAddPurchaseBillEntryMutation,
  useGetPurchaseBillEntryByIdQuery,
  useUpdatePurchaseBillEntryMutation,
} from "../../../redux/uniformService/PurchaseBillEntryService";
import { useDispatch } from "react-redux";
import purchaseReturnApi from "../../../redux/services/PurchaseReturnService";
import purchaseCancelApi from "../../../redux/uniformService/PurchaseCancelService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { set } from "lodash";
import { billTypes, inwardTypes } from "../../../Utils/DropdownData";
import { useGetPurchaseInwardEntryForBillByIdQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import { calculateTaxWithHSNBreakupAndInsertIntoInwardItems } from "./taxSummary";
import PoSummary from "../PurchaseOrder/PoSummary";
import Modal from "../../../UiComponents/Modal";
import { PartyMaster, TaxTemplate } from "..";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";

const PurchaseBillEntryForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  supplierList,
  uomList,
  styleItemList,
  hsnList,
  taxTypeList,
  fromInwardSupplierId,
  setFromInwardSupplierId,
  fromInwardId,
  setFromInwardId,
  fromInwardType,
  setFromInwardType,
}) => {
  const today = new Date();

  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [supplierId, setSupplierId] = useState("");
  const [inwardItems, setInwardItems] = useState([]);
  const [tempItems, setTempItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [billType, setBillType] = useState("General Purchase Inward");
  const [docId, setDocId] = useState("");
  const [dcNo, setDcNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [invNo, setInvNo] = useState("");
  const [netBillValue, setNetBillValue] = useState("");
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const { userId, finYearId, branchId, companyId } = getCommonParams();
  const [searchDocId, setSearchDocId] = useState("");
  const [searchPIDate, setSearchPIDate] = useState("");
  const [searchInvNo, setSearchInvNo] = useState("");
  const [searchDcNo, setSearchDcNo] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const supplierRef = useRef(null);
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState();
  const [summary, setSummary] = useState(false);

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPurchaseBillEntryByIdQuery(id, { skip: !id });

  const [addData] = useAddPurchaseBillEntryMutation();
  const [updateData] = useUpdatePurchaseBillEntryMutation();
  const dispatch = useDispatch();
  const searchFields = { searchDocId, searchPIDate, searchInvNo, searchDcNo };
  const { data: supplierData } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);
  const {
    data: purchaseInwarddata,
    isFetching: isSingleInwardFetching,
    isLoading: isSingleInwardLoading,
  } = useGetPurchaseInwardEntryForBillByIdQuery(
    {
      params: {
        branchId,
        supplierId,
        ...searchFields,
        pagination: true,
        dataPerPage,
        pageNumber: currentPageNumber,
        billType,
      },
    },
    { skip: !supplierId },
  );

  const syncFormWithInwardDb = useCallback(
    (data) => {
      setTempItems(data);
    },
    [supplierId],
  );

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data?.docDate)?.format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setNetBillValue(parseFloat(data?.netBillValue)?.toFixed(2));
      setInwardItems(
        (data?.purchaseBillEntryItems || []).map((item) => ({
          ...item, // ✅ keeps StyleItem, Color, Size, Uom, PurchaseInward
          styleItemId: item.styleItemId || item.StyleItem?.id,
          uomId: item.uomId || item.Uom?.id,
          hsnId: item.hsnId || item.Hsn?.id,
          colorId: item.colorId || item.Color?.id,
          sizeId: item.sizeId || item.Size?.id,
          gsmId: item.gsmId || item.Gsm?.id,
        })),
      );
      setSupplierId(data?.supplierId || fromInwardSupplierId || "");
      setTaxTemplateId(data?.taxTemplateId || "");
      setRemarks(data?.remarks || "");
      setBillType(
        data?.billType || fromInwardType || "General Purchase Inward",
      );
      setDiscountValue(data?.discountValue || "0");
      setDiscountType(data?.discountType || "Percentage");
    },
    [id, fromInwardSupplierId, fromInwardType],
  );

  useEffect(() => {
    if (fromInwardSupplierId && fromInwardType && !id) {
      setSupplierId(fromInwardSupplierId);
      setBillType(fromInwardType);
    }
  }, [fromInwardSupplierId, fromInwardType]);

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (purchaseInwarddata?.data) {
      syncFormWithInwardDb(purchaseInwarddata?.data);
    }
  }, [
    isSingleInwardFetching,
    isSingleInwardLoading,
    syncFormWithInwardDb,
    purchaseInwarddata,
  ]);

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchDocId, searchPIDate, searchDcNo, searchInvNo]);

  useEffect(() => {
    if (!id && !fromInwardId) {
      setInwardItems([]);
    }
  }, [supplierId]);

  let data = {
    companyId,
    branchId,
    finYearId,
    userId,
    id,
    docDate,
    supplierId,
    remarks,
    vehicleNo,
    netBillValue,
    inwardItems: inwardItems?.filter((val) => val?.StyleItem?.name),
    taxTemplateId,
    billType,
    discountType,
    discountValue,
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            invalidatePurchaseModule();
            // ✅ This runs after Swal completely closes
            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setFromInwardId(undefined);
                setFromInwardSupplierId(undefined);
                setFromInwardType(undefined);
                setTimeout(() => {
                  supplierRef.current?.focus();
                }, 50);
              }
              if (nextProcess == "close") {
                onClose();
              }
            } else {
              toast.error(returnData?.message);
            }
          },
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const totalprice = inwardItems
    .reduce((sum, row) => sum + (Number(row.price) || 0), 0)
    .toFixed(2);

  const enrichedItems = useMemo(() => {
    if (!inwardItems?.length) return inwardItems;
    const { items, ...totals } =
      calculateTaxWithHSNBreakupAndInsertIntoInwardItems(
        structuredClone(inwardItems), // clone to avoid mutating state
        isSupplierOutside,
        discountType,
        discountValue,
      );
    return { items, totals };
  }, [inwardItems, discountType, discountValue, isSupplierOutside]);

  const enrichedItemsList = enrichedItems?.items || [];
  const totals = enrichedItems?.totals || {};

  const validateData = (data) => {
    if (!data.taxTemplateId) {
      Swal.fire({
        icon: "error",
        title: "Tax Template is required",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!data.supplierId) {
      Swal.fire({
        icon: "error",
        title: "Supplier is required",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }

    const items = data?.inwardItems || [];
    if (!id) {
      const hasAtLeastOneItem = items.some((item) => item.styleItemId);
      if (!hasAtLeastOneItem) {
        Swal.fire({
          icon: "error",
          title: "Please add at least one item",
          timer: 1500,
          showConfirmButton: false,
        });
        return false;
      }
    }

    const FIELD_LABELS = {
      StyleItem: "Item",
      Uom: "UOM",
      inwardQty: "Inward Quantity",
    };

    const findMissingField = (items) => {
      for (let i = 0; i < items.length; i++) {
        const row = items[i];

        // only validate rows that have an Item selected
        if (!row.StyleItem?.id) continue;

        if (!row.Uom?.id) {
          return { rowIndex: i + 1, field: "Uom" };
        }

        if (
          row.inwardQty === null ||
          row.inwardQty === undefined ||
          row.inwardQty === ""
        ) {
          return { rowIndex: i + 1, field: "inwardQty" };
        }
      }
      return null;
    };

    //  validate only filled rows
    const missing = findMissingField(items);

    if (missing) {
      Swal.fire({
        icon: "error",
        title: "Missing Required Field",
        text: `Row ${missing.rowIndex}: ${FIELD_LABELS[missing.field]} is required`,
        timer: 2000,
        showConfirmButton: false,
      });
      return false;
    }

    const isAmountMatched =
      Number(netBillValue).toFixed(2) ===
      parseFloat(totals?.net || 0).toFixed(2);

    if (!isAmountMatched) {
      Swal.fire({
        icon: "error",
        title: "Amount Mismatch",
        text: "Total Bill Value and Total Net Amount must be Equal.",
        timer: 2000,
        showConfirmButton: false,
      });
      return false;
    }
    // remove blank rows
    return true;
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure save the details ...?")) {
        return;
      }
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        (data = { ...data, draftSave: true }),
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
    dispatch(
      purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"]),
    );
    dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
    dispatch(purchaseCancelApi.util.invalidateTags(["PurchaseCancel"]));
  };

  const dateRef = useRef(null);
  const inputPartyRef = useRef(null);

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData("close");
    }
  };
  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!id) {
      setTaxTemplateId(
        taxTypeList?.data?.filter((item) => item.name === "DEFAULT")[0]?.id,
      );
    }
  }, []);

  return (
    <>
      <Modal
        isOpen={summary}
        onClose={() => setSummary(false)}
        widthClass={"p-10"}
      >
        <PoSummary
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          poItems={inwardItems}
          taxTypeId={taxTemplateId}
          readOnly={readOnly}
          totals={totals}
          setSummary={setSummary}
        />
      </Modal>
      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Purchase Bill Entry
            <ModeChip id={id} readOnly={readOnly} />
          </h1>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-indigo-600 hover:text-indigo-700"
            title="Back to Report"
          >
            <IoArrowBackCircleSharp className="w-7 h-7" />
          </button>
        </div>
      </div>
      <div className="space-y-2 py-2" onKeyDown={handleKeyDown}>
        <div className="grid grid-cols-3 gap-x-2 ">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
            <div className="flex gap-x-4">
              <div className="w-[160px]">
                <ReusableInput
                  label="Purchase Bill Entry No"
                  readOnly
                  value={docId}
                />
              </div>
              <div className="w-[160px] ml-1">
                <ReusableInput
                  label="Purchase Bill Entry Date"
                  value={docDate}
                  type={"date"}
                  required={true}
                  readOnly={true}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-medium text-slate-700 mb-2">Bill Details</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <DropdownInput
                name="Bill Type"
                options={billTypes}
                value={billType}
                setValue={(value) => {
                  setBillType(value);
                }}
                required={true}
                readOnly={readOnly}
                disabled={id || fromInwardType}
                beforeChange={() => {
                  setInwardItems([]);
                }}
                // autoFocus={true}
                ref={supplierRef}
              />
              <DropdownInput
                name="Tax Type"
                options={dropDownListObject(
                  taxTypeList ? taxTypeList?.data : [],
                  "name",
                  "id",
                )}
                value={taxTemplateId}
                setValue={setTaxTemplateId}
                required={true}
                readOnly={readOnly}
              />
              {/* <DropdownWithModal
                name="Tax Type"
                options={dropDownListObject(
                  id
                    ? taxTypeList?.data
                    : taxTypeList?.data?.filter((item) => item?.active),
                  "name",
                  "id",
                )}
                value={taxTemplateId}
                setValue={setTaxTemplateId}
                required={true}
                readOnly={readOnly}
                className={`w-[150px]`}
                // disabled={childRecord.current > 0}
                addNewLabel="+ Add New Tax Template"
                childComponent={TaxTemplate}
                addNewModalWidth="w-[82%] h-[85%]"
              /> */}
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm w-full">
            <h2 className="font-medium text-slate-700 mb-2">
              Supplier Details
            </h2>
            <div className="flex gap-x-4">
              <div className="w-[400px]">
                {/* <ReusableSearchableInput
                  label="Supplier"
                  component="PartyMaster"
                  placeholder="Search Supplier"
                  optionList={supplierList?.data}
                  setSearchTerm={(value) => {
                    setSupplierId(value);
                  }}
                  searchTerm={supplierId}
                  show={"isSupplier"}
                  required={true}
                  disabled={id}
                  isSupplier={true}
                /> */}
                <DropdownWithModal
                  name="Supplier"
                  options={dropDownListObject(
                    id
                      ? supplierList?.data?.filter((item) => item?.isSupplier)
                      : supplierList?.data?.filter(
                          (item) => item?.active && item?.isSupplier,
                        ),
                    "name",
                    "id",
                  )}
                  value={supplierId}
                  setValue={setSupplierId}
                  required={true}
                  readOnly={readOnly}
                  className={`w-[150px]`}
                  // disabled={childRecord.current > 0}
                  addNewLabel="+ Add New Supplier"
                  childComponent={PartyMaster}
                  addNewModalWidth="w-[90%] h-[95%]"
                  disabled={id || fromInwardType}
                />
              </div>
              <div className="w-[150px]">
                <label
                  className="block text-xs font-bold text-slate-700 mb-1"
                  required={true}
                >
                  Total Bill Value
                </label>
                <input
                  // disabled={id}

                  className={`w-full px-3 py-1.5 text-xs text-right border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${
            readOnly
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:border-gray-400"
          }
          `}
                  type="number"
                  value={netBillValue}
                  onChange={(e) => setNetBillValue(e.target.value)}
                  onBlur={(e) =>
                    setNetBillValue(
                      e.target.value ? Number(e.target.value).toFixed(2) : "",
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </div>

              {/* <div className="w-[250px]">
                <TextInput
                  name={"Inv No"}
                  value={invNo}
                  setValue={setInvNo}
                  readOnly={id}
                  required
                /></div>
              <div className="w-[250px]">

                <TextInput
                  name={"Dc No."}
                  value={dcNo}
                  setValue={setDcNo}
                  readOnly={readOnly}
                  required
                /></div> */}
              {/* <div className="w-32">
                <DateInputNew
                  name="Dc Date"
                  value={dcDate}
                  setValue={setDcDate}
                  required={true}
                  readOnly={readOnly}
                  type={"date"}
                />
              </div> */}
            </div>
          </div>
        </div>

        <fieldset className="w-full">
          <InwardItems
            id={id}
            inwardItems={enrichedItemsList}
            setInwardItems={setInwardItems}
            readOnly={readOnly}
            uomList={uomList}
            hsnList={hsnList}
            styleItemList={styleItemList}
            billType={billType}
            supplierId={supplierId}
            branchId={branchId}
            dcNo={dcNo}
            invNo={invNo}
            setTempItems={setTempItems}
            tempItems={tempItems}
            searchDocId={searchDocId}
            searchPIDate={searchPIDate}
            searchInvNo={searchInvNo}
            searchDcNo={searchDcNo}
            setSearchDocId={setSearchDocId}
            setSearchPIDate={setSearchPIDate}
            setSearchInvNo={setSearchInvNo}
            setSearchDcNo={setSearchDcNo}
            taxTemplateId={taxTemplateId}
            fromInwardId={fromInwardId}
            isSupplierOutside={isSupplierOutside}
          />
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-medium text-slate-700 mb-2 text-base">
              Remarks
            </h2>
            <textarea
              readOnly={readOnly}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
              }}
              className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-2 text-base">
              Qty Summary
            </h2>

            <div className="space-y-1.5">
              <div className="flex justify-between  text-sm">
                <span className="text-slate-600">Total Inward Qty</span>
                <span className="font-medium">
                  {inwardItems
                    .reduce((sum, row) => sum + (Number(row.inwardQty) || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between  text-sm">
                <span className="text-slate-600">Total Price</span>
                <span className="font-medium">
                  {inwardItems
                    .reduce((sum, row) => sum + (Number(row.price) || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-semibold text-slate-800 mb-2 text-base">
              Amount Summary
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Taxable Amount</span>
                <span className="font-medium">
                  Rs.{parseFloat(totals?.taxable || 0).toFixed(2)}{" "}
                </span>
              </div>
              {/* <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Tax Amount</span>
                  <span className="font-medium">Rs.{taxDetails?.grossAmount}</span>
                </div> */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Net Amount</span>
                <span className="font-medium">
                  Rs.{parseFloat(totals?.net || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
          {/* Left Buttons */}
          <div className="flex gap-2 flex-wrap">
            {!readOnly && (
              <button
                onClick={() => saveData("close")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveData("close");
                    e.stopPropagation();
                  }
                }}
                disabled={readOnly}
                className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex h-6 items-center text-xs font-medium"
              >
                <HiOutlineRefresh className="w-3.5 h-3.5 mr-2" />
                Save & Close
              </button>
            )}
            {!readOnly && (
              <button
                onClick={() => saveData("new")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    saveData("new");
                  }
                }}
                disabled={readOnly}
                className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex h-6 items-center text-xs font-medium"
              >
                <FiSave className="w-3.5 h-3.5 mr-2" />
                Save & New
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {!id ||
              (readOnly && (
                <button
                  className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 flex h-6 items-center text-xs font-medium"
                  onClick={() => setReadOnly(false)}
                >
                  <FiEdit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </button>
              ))}
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800 flex h-6 items-center text-xs font-medium"
              onClick={() => {
                if (!taxTemplateId) {
                  toast.info("Please Select Tax Template !", {
                    position: "top-center",
                  });
                  return;
                }
                setSummary(true);
              }}
            >
              View Bill Summary
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default PurchaseBillEntryForm;
