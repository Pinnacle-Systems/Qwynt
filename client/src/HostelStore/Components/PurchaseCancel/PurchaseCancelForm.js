import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import { poTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  ModeChip,
} from "../../../Utils/helper";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import Swal from "sweetalert2";
import { dropDownListObject } from "../../../Utils/contructObject";
import CancelItems from "./CancelItems";
import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService";
import {
  useAddPurchaseCancelMutation,
  useGetPurchaseCancelByIdQuery,
  useUpdatePurchaseCancelMutation,
} from "../../../redux/uniformService/PurchaseCancelService";
import { useGetPoItemsQuery } from "../../../redux/uniformService/PoServices";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags";
import { LocationMaster, TermsAndCondition } from "../../../Basic/components";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { PartyMaster } from "..";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { CommonFormFooter } from "../../../Basic/components/Reuseable";

const PurchaseCancelForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  supplierList,
  uomList,
  styleItemList,
  branchList,
  hsnList,
  onNew,
  sizeList,
  colorList,
  fromPoId,
  fromPoSupplierId,
  fromPoType,
  setFromPoId,
  setFromPoSupplierId,
  setFromPoType,
  termsData,
  gsmList,
}) => {
  const today = new Date();

  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [supplierId, setSupplierId] = useState("");
  const [cancelItems, setCancelItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [poType, setPoType] = useState("GENERAL");
  const [storeId, setStoreId] = useState("");
  const [docId, setDocId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [tempItems, setTempItems] = useState([]);
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [termsId, setTermsId] = useState("");
  const termsRef = useRef(null);
  const supplierRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();

  const [dataPerPage, setDataPerPage] = useState("10");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const [termsAndCondition, setTermsAndCondition] = useState("");

  const { userId, finYearId, branchId } = getCommonParams();
  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });
  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
  });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId),
      )
    : [];

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPurchaseCancelByIdQuery(id, { skip: !id });

  const [addData] = useAddPurchaseCancelMutation();
  const [updateData] = useUpdatePurchaseCancelMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setPoType(data?.poType || fromPoType || "GENERAL");
      setLocationId(data?.Store ? data.Store.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setCancelItems(
        data?.purchaseCancelItems ? data?.purchaseCancelItems : [],
      );
      setSupplierId(data?.supplierId || fromPoSupplierId || "");

      setRemarks(data?.remarks || "");
      setTermsAndCondition(
        data?.termsAndCondition ? data.termsAndCondition : "",
      );
      setTermsId(data?.termsId ? data?.termsId : "");
    },
    [id, fromPoSupplierId, fromPoType],
  );

  useEffect(() => {
    if (fromPoSupplierId && fromPoType && !id) {
      setSupplierId(fromPoSupplierId);
      setPoType(fromPoType);
    }
  }, [fromPoSupplierId, fromPoType]);

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const searchFields = {
    searchDocId,
    searchDocDate,
  };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchDocId, searchDocDate]);

  const {
    data: poItemsData,
    isLoading: isPoItemsLoading,
    isFetching: isPoItemsFetching,
  } = useGetPoItemsQuery({
    params: {
      branchId,
      supplierId,
      ...searchFields,
      pagination: true,
      dataPerPage,
      pageNumber: currentPageNumber,
      poType,
    },
  });

  const syncFormWithDbItems = useCallback(
    (data) => {
      setTempItems(data);
    },
    [poType, supplierId],
  );

  useEffect(() => {
    if (poItemsData?.data) {
      syncFormWithDbItems(poItemsData?.data);
    }
  }, [isPoItemsLoading, isPoItemsFetching, syncFormWithDbItems, poItemsData]);

  let data = {
    id,
    docDate,
    branchId,
    userId,
    locationId,
    storeId,
    supplierId,
    remarks,
    termsAndCondition,
    cancelItems: cancelItems?.filter((po) => po.styleItemId),
    finYearId,
    poType,
    termsId,
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
            // ✅ Everything runs after Swal closes
            invalidatePurchaseModule();
            dispatchInvalidate();

            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setFromPoId("");
                setFromPoSupplierId("");
                setFromPoType("");
                // ✅ Focus after state reset
                setTimeout(() => {
                  supplierRef.current?.focus();
                }, 100);
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
      console.log("handle", error);
    }
  };

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [
        row.styleItemId || "",
        row.sizeId || "",
        row.colorId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          styleItemId: row.styleItemId,
          sizeId: row.sizeId,
          colorId: row.colorId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const filledItems = (data?.cancelItems || []).filter(
      (item) => item.styleItemId,
    );
    const duplicates = findDuplicates(filledItems);
    const dup = duplicates[0];

    const checks = [
      { condition: !data.poType, title: "PO Type is required!" },
      { condition: !data.locationId, title: "Location is required!" },
      // { condition: !data.storeId, title: "Location is required!" },
      { condition: !data.supplierId, title: "Supplier is required!" },
      {
        condition: filledItems.length === 0,
        title: "Please add at least one item!",
      },
      {
        condition: !isGridDatasValid(data?.cancelItems, false, [
          "styleItemId",
          "uomId",
          "cancelQty",
        ]),
        title: "Please fill all required item fields!",
      },
      {
        condition: duplicates.length > 0,
        title: "Duplicate Item Found!",
        html: dup
          ? `Item - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")}, Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")}, Color - ${findFromList(dup?.colorId, colorList?.data, "name")}`
          : "",
      },
    ];

    const failed = checks.find((c) => c.condition);
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: failed.title,
        html: failed.html,
        timer: failed.html ? undefined : 1500,
        showConfirmButton: !!failed.html,
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        { ...data, draftSave: true },
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
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    if (!id && !fromPoId) {
      setCancelItems([]);
    }
  }, [supplierId]);

  useEffect(() => {
    if (!id) {
      const selectedTerm = termsData?.data?.find(
        (item) => String(item.id) === String(termsId),
      );
      setTermsAndCondition(selectedTerm?.description || "");
    }
  }, [id, termsData, termsId]);

  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  return (
    <>
      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Purchase Cancel
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput
                label="Purchase Cancel No"
                readOnly
                value={docId}
              />
              <ReusableInput
                label="Purchase Cancel Date"
                value={docDate}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Cancel Details</h2>
            <div className="grid grid-cols-2 gap-1 ">
              <DropdownInput
                name="Branch"
                options={
                  branchList
                    ? dropDownListObject(
                        id
                          ? branchList?.data
                          : branchList?.data?.filter((item) => item.active),
                        "branchName",
                        "id",
                      )
                    : []
                }
                value={locationId}
                setValue={(value) => {
                  setLocationId(value);
                  setStoreId("");
                }}
                required={true}
                readOnly={id}
                // autoFocus={true}
                ref={supplierRef}
              />
              {/* <DropdownInput
                name="Location"
                options={dropDownListObject(
                  id
                    ? storeOptions
                    : storeOptions?.filter((item) => item.active),
                  "storeName",
                  "id",
                )}
                value={storeId}
                setValue={setStoreId}
                required={true}
                readOnly={id}
              /> */}
              {/* <DropdownWithModal
                name="Location"
                options={dropDownListObject(
                  id
                    ? storeOptions
                    : storeOptions?.filter((item) => item?.active),
                  "storeName",
                  "id",
                )}
                value={storeId}
                setValue={setStoreId}
                required={true}
                readOnly={readOnly}
                className={`w-[150px]`}
                // disabled={childRecord.current > 0}
                addNewLabel="+ Add New Location"
                childComponent={LocationMaster}
                addNewModalWidth="w-[40%] h-[48%]"
                disabled={id}
              /> */}
              <DropdownInput
                name="Po Type"
                options={poTypes}
                value={poType}
                setValue={(value) => {
                  setPoType(value);
                }}
                required={true}
                readOnly={readOnly}
                disabled={id || fromPoType}
                beforeChange={() => {
                  setCancelItems([]);
                }}
              />
              <div></div>
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Supplier Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <div className="col-span-2">
                {/* <ReusableSearchableInput
                  label="Supplier Id"
                  component="PartyMaster"
                  placeholder="Search Supplier Id..."
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
                  disabled={id || !!fromPoSupplierId}
                />
              </div>
              <TextInput
                name="Contact Person"
                placeholder="Contact name"
                value={findFromList(
                  supplierId,
                  supplierList?.data,
                  "contactPersonName",
                )}
                disabled={true}
              />

              <TextInput
                name="Phone"
                placeholder="Contact name"
                value={findFromList(
                  supplierId,
                  supplierList?.data,
                  "contactNumber",
                )}
                disabled={true}
              />
            </div>
          </div>
        </div>
        <fieldset className="">
          <CancelItems
            id={id}
            cancelItems={cancelItems}
            setCancelItems={setCancelItems}
            readOnly={readOnly}
            uomList={uomList}
            hsnList={hsnList}
            styleItemList={styleItemList}
            poType={poType}
            supplierId={supplierId}
            branchId={branchId}
            sizeList={sizeList}
            colorList={colorList}
            setTempItems={setTempItems}
            tempItems={tempItems}
            searchDocId={searchDocId}
            setSearchDocId={setSearchDocId}
            setSearchDocDate={setSearchDocDate}
            searchDocDate={searchDocDate}
            fromPoId={fromPoId}
            termsRef={termsRef}
            gsmList={gsmList}
          />
        </fieldset>

        <CommonFormFooter
          remarks={remarks}
          setRemarks={setRemarks}
          terms={termsAndCondition}
          setTerms={setTermsAndCondition}
          readOnly={readOnly}
          showTermSelect={true}
          termValue={termsId}
          onTermChange={(value) => setTermsId(value)}
          termOptions={
            (id
              ? termsData?.data
              : termsData?.data?.filter((item) => item?.active)
            )?.map((item) => ({
              value: item?.id,
              label: item?.name,
              templateText: item?.description || "",
            })) || []
          }
          totalsRows={[
            {
              key: "totalCancelQty",
              label: "Total Cancel Qty",
              value: cancelItems
                .reduce((sum, row) => sum + (Number(row.cancelQty) || 0), 0)
                .toFixed(2),
              summaryColumn: "left",
            },
          ]}
        />

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
                className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs font-medium"
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
                className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs font-medium"
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
                  className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 flex items-center text-xs font-medium"
                  onClick={() => setReadOnly(false)}
                >
                  <FiEdit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default PurchaseCancelForm;
