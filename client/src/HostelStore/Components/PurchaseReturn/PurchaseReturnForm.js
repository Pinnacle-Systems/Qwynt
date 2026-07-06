import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DateInputNew,
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import { returnTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  ModeChip,
} from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { PDFViewer } from "@react-pdf/renderer";
import { dropDownListObject } from "../../../Utils/contructObject";
import ReturnItems from "./ReturnItems";
import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService";
import {
  useAddPurchaseReturnMutation,
  useGetPurchaseReturnByIdQuery,
  useUpdatePurchaseReturnMutation,
} from "../../../redux/services/PurchaseReturnService";
import { useGetPurInwardItemsQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
import PurchaseReturnPrintFormat from "./Print-Format/PurchaseReturnPrintFormat";
import { PartyMaster } from "..";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { LocationMaster, TermsAndCondition } from "../../../Basic/components";
import { CommonFormFooter } from "../../../Basic/components/Reuseable";

const PurchaseReturnForm = ({
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
  sizeList,
  colorList,
  branchData,
  termsData,
  fromInwardSupplierId,
  setFromInwardSupplierId,
  fromInwardId,
  setFromInwardId,
  fromInwardType,
  setFromInwardType,
  gsmList,
}) => {
  const today = new Date();
  const [pendingAction, setPendingAction] = useState(null);

  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [supplierId, setSupplierId] = useState("");
  const [returnItems, setReturnItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [returnType, setReturnType] = useState("Purchase Return");
  const [storeId, setStoreId] = useState("");
  const [docId, setDocId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [dcNo, setDcNo] = useState("");
  const [dcDate, setDcDate] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [invNo, setInvNo] = useState("");
  const [tempItems, setTempItems] = useState([]);
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const supplierRef = useRef(null);
  const [termsId, setTermsId] = useState("");
  const termsRef = useRef(null);
  const { userId, finYearId, branchId } = getCommonParams();

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
  } = useGetPurchaseReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddPurchaseReturnMutation();
  const [updateData] = useUpdatePurchaseReturnMutation();

  const searchFields = {
    searchDocId,
    searchDocDate,
  };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchDocId, searchDocDate]);

  const {
    data: purInwardItemsData,
    isLoading: isPurInwardItemsLoading,
    isFetching: isPurInwardItemsFetching,
  } = useGetPurInwardItemsQuery(
    {
      params: {
        branchId,
        supplierId,
        ...searchFields,
        pagination: true,
        dataPerPage,
        pageNumber: currentPageNumber,
        returnType,
      },
    },
    { skip: !supplierId },
  );

  const syncFormWithDbItems = useCallback(
    (data) => {
      setTempItems(data);
    },
    [supplierId],
  );

  useEffect(() => {
    if (purInwardItemsData?.data) {
      syncFormWithDbItems(purInwardItemsData?.data);
    }
  }, [
    isPurInwardItemsLoading,
    isPurInwardItemsFetching,
    syncFormWithDbItems,
    purInwardItemsData,
  ]);

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setReturnType(data?.returnType || fromInwardType || "Purchase Return");
      setLocationId(data?.Store ? data.Store.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setReturnItems(
        data?.purchaseReturnItems ? data?.purchaseReturnItems : [],
      );
      setSupplierId(data?.supplierId || fromInwardSupplierId || "");
      setDcDate(
        data?.dcDate ? moment.utc(data.dcDate).format("YYYY-MM-DD") : "",
      );
      setRemarks(data?.remarks || "");
      setDcNo(data?.dcNo ? data.dcNo : "");
      setTermsAndCondition(
        data?.termsAndCondition ? data.termsAndCondition : "",
      );
      setInvNo(data?.invNo ? data?.invNo : "");
      setTermsId(data?.termsId ? data?.termsId : "");
    },
    [id, fromInwardSupplierId, fromInwardType],
  );

  useEffect(() => {
    if (fromInwardSupplierId && fromInwardType && !id) {
      setSupplierId(fromInwardSupplierId);
      setReturnType(fromInwardType);
    }
  }, [fromInwardSupplierId, fromInwardType]);

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  let data = {
    id,
    docDate,
    branchId,
    userId,
    returnType,
    locationId,
    storeId,
    supplierId,
    dcNo,
    dcDate,
    remarks,
    termsAndCondition,
    returnItems: returnItems?.filter((po) => po.styleItemId),
    finYearId,
    invNo,
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
            // ✅ Runs after Swal completely closes
            invalidatePurchaseModule();

            if (returnData.statusCode === 0) {
              // ✅ Show print confirmation only for new entries
              if (!id) {
                Swal.fire({
                  icon: "question",
                  title: "Do You Want to Print?",
                  showCancelButton: true,
                  confirmButtonText: "Yes, Print",
                  cancelButtonText: "No [Esc]",
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#6b7280",
                  focusConfirm: true, // ✅ Auto-focus confirm button
                  allowEnterKey: true, // ✅ Allow Enter to confirm
                  allowEscapeKey: true, // ✅ Allow Escape to cancel
                  didOpen: () => {
                    // ✅ Ensure confirm button is focused when modal opens
                    const confirmButton = Swal.getConfirmButton();
                    const cancelButton = Swal.getCancelButton();

                    if (confirmButton) {
                      confirmButton.focus();

                      // ✅ Add keyboard navigation
                      confirmButton.addEventListener("keydown", (e) => {
                        if (e.key === "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          cancelButton?.focus();
                        }
                      });
                    }

                    if (cancelButton) {
                      cancelButton.addEventListener("keydown", (e) => {
                        if (e.key === "Tab" && e.shiftKey) {
                          e.preventDefault();
                          confirmButton?.focus();
                        }
                      });
                    }
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    // ✅ User clicked "Yes, Print"
                    setPrintModalOpen(true);
                    // Set the ID so the print modal can access the saved data
                    if (returnData?.data?.id) {
                      setId(returnData.data.id);
                    }
                    setPendingAction(nextProcess);
                  } else {
                    // ✅ User clicked "No, Thanks" - proceed with normal flow
                    if (nextProcess === "new") {
                      syncFormWithDb(undefined);
                      setId("");
                      setDocId("New");

                      setTimeout(() => {
                        supplierRef.current?.focus();
                      }, 300);
                    }
                    if (nextProcess === "close") {
                      onClose();
                    }
                  }
                });
              } else {
                // ✅ For updates, proceed normally without print prompt
                if (nextProcess === "new") {
                  setId("");
                  setDocId("New");
                  syncFormWithDb(undefined);
                  setFromInwardId(undefined);
                  setFromInwardSupplierId(undefined);
                  setFromInwardType(undefined);
                  setTimeout(() => {
                    supplierRef.current?.focus();
                  }, 100);
                }
                if (nextProcess === "close") {
                  onClose();
                }
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
    const filledItems = (data?.returnItems || []).filter(
      (item) => item.styleItemId,
    );
    // const duplicates = findDuplicates(filledItems);
    // const dup = duplicates[0];

    const checks = [
      { condition: !data.returnType, title: "Return Type is required!" },
      { condition: !data.locationId, title: "Location is required!" },
      { condition: !data.storeId, title: "Location is required!" },
      { condition: !data.supplierId, title: "Supplier is required!" },
      { condition: !data.dcNo, title: "DC No is required!" },
      { condition: !data.dcDate, title: "DC Date is required!" },
      {
        condition: filledItems.length === 0,
        title: "Please add at least one item!",
      },
      // {
      //   condition: duplicates.length > 0,
      //   title: "Duplicate Item Found!",
      //   html: dup
      //     ? `Item - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")},  Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")}, Color - ${findFromList(dup?.colorId, colorList?.data, "name")}`
      //     : "",
      // },
      {
        condition: !isGridDatasValid(data?.returnItems, false, [
          "styleItemId",
          "uomId",
          "returnQty",
        ]),
        title: "Please fill all required item fields!",
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
      if (!window.confirm("Are you sure save the details ...?")) {
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
    if (!id && !fromInwardId) {
      setReturnItems([]);
    }
  }, [supplierId]);

  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!id) {
      const selectedTerm = termsData?.data?.find(
        (item) => String(item.id) === String(termsId),
      );
      setTermsAndCondition(selectedTerm?.description || "");
    }
  }, [id, termsData, termsId]);

  return (
    <>
      <Modal
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);

          // Execute pending action after print modal closes
          if (pendingAction === "new") {
            setId("");
            setDocId("New");
            syncFormWithDb(undefined);
            setTimeout(() => {
              supplierRef.current?.focus();
            }, 100);
          }
          if (pendingAction === "close") {
            onClose();
          }
          setPendingAction(null);
        }}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PurchaseReturnPrintFormat
            singleData={singleData?.data}
            supplierList={supplierList}
            styleItemList={styleItemList}
            uomList={uomList}
            sizeList={sizeList}
            colorList={colorList}
            branchData={branchData?.data}
          />
        </PDFViewer>
      </Modal>
      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Purchase Return
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
                label="Purchase Return No"
                readOnly
                value={docId}
              />
              <ReusableInput
                label="Purchase Return Date"
                value={docDate}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Return Details</h2>
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
              <DropdownWithModal
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
              />
              <DropdownInput
                name="Return Type"
                options={returnTypes}
                value={returnType}
                setValue={(value) => {
                  setReturnType(value);
                }}
                required={true}
                readOnly={readOnly}
                disabled={id || fromInwardType}
                beforeChange={() => {
                  setReturnItems([]);
                }}
              />
              {/* <TextInput
                name={"Inv No"}
                value={invNo}
                setValue={setInvNo}
                readOnly={id}
                required
              /> */}

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
                  disabled={id || fromInwardType}
                />
              </div>
              <TextInput
                name={"Dc No."}
                value={dcNo}
                setValue={setDcNo}
                readOnly={readOnly}
                required
              />
              <div className="w-44">
                <DateInputNew
                  name="Dc Date"
                  value={dcDate}
                  setValue={setDcDate}
                  required={true}
                  readOnly={readOnly}
                  type={"date"}
                />
              </div>
            </div>
          </div>
        </div>
        <fieldset className="">
          <ReturnItems
            id={id}
            returnItems={returnItems}
            setReturnItems={setReturnItems}
            readOnly={readOnly}
            uomList={uomList}
            hsnList={hsnList}
            styleItemList={styleItemList}
            returnType={returnType}
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
            fromInwardId={fromInwardId}
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
              key: "totalReturnQty",
              label: "Total Return Qty",
              value: returnItems
                .reduce((sum, row) => sum + (Number(row.returnQty) || 0), 0)
                .toFixed(2),
              summaryColumn: "left",
            },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
          {/* Left Buttons */}
          <div className="flex gap-2 flex-wrap">
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
              className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 flex h-6 items-center text-xs font-medium"
              onClick={() => {
                // handlePrint()
                setPrintModalOpen(true);
              }}
            >
              <FiPrinter className="w-3.5 h-3.5 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default PurchaseReturnForm;
