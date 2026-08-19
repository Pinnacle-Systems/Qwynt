import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DateInputNew,
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import {
  TransactionLayout,
  TransactionActions,
} from "../../../Basic/components/Reuseable";
import { inwardTypes, receiptTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  ModeChip,
  renameFile,
} from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiEdit2, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import Swal from "sweetalert2";
import { dropDownListObject } from "../../../Utils/contructObject";
import InwardItems from "./InwardItems";
import {
  useAddPurchaseInwardEntryMutation,
  useGetPurchaseInwardEntryByIdQuery,
  useUpdatePurchaseInwardEntryMutation,
} from "../../../redux/uniformService/PurchaseInwardEntry";
import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService";
import { useGetPoItemsQuery } from "../../../redux/uniformService/PoServices";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { PartyMaster, TaxTemplate } from "../index.js";
import { LocationMaster } from "../../../Basic/components/index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import { calculateTaxWithHSNBreakupAndInsertIntoInwardItems } from "../PurchaseBillEntry/taxSummary.js";
import PoSummary from "../PurchaseOrder/PoSummary.js";
import Modal from "../../../UiComponents/Modal/index.js";
import { getImageUrlPath } from "../../../Constants/index.js";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService.js";

const PurchaseInwardForm = ({
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
  fromPoId,
  fromPoSupplierId,
  fromPoType,
  setFromPoId,
  setFromPoSupplierId,
  setFromPoType,
  taxTypeList,
  gsmList,
  itemVariantList,
}) => {
  const today = new Date();

  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [supplierId, setSupplierId] = useState("");
  const [inwardItems, setInwardItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [inwardType, setInwardType] = useState("PURCHASE_INWARD");
  const [storeId, setStoreId] = useState("");
  const [docId, setDocId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [dcNo, setDcNo] = useState("");
  const [dcDate, setDcDate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [invNo, setInvNo] = useState("");
  const [tempItems, setTempItems] = useState([]);
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [receiptType, setReceiptType] = useState("AGAINST_INVOICE");
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState();
  const [summary, setSummary] = useState(false);
  const [netBillValue, setNetBillValue] = useState("");
  const [attachmentModal, setAttachmentModal] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const supplierRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();
  const vehicleRef = useRef(null);

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
  } = useGetPurchaseInwardEntryByIdQuery(id, { skip: !id });
  console.log(singleData, "singleData");

  const [addData] = useAddPurchaseInwardEntryMutation();
  const [updateData] = useUpdatePurchaseInwardEntryMutation();
  const { data: supplierData } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });
  const searchFields = {
    searchDocId,
    searchDocDate,
  };

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);

  useEffect(() => {
    if (fromPoSupplierId && fromPoType && !id) {
      setSupplierId(fromPoSupplierId);
      setInwardType(fromPoType);
    }
  }, [fromPoSupplierId, fromPoType]);

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
      poType: inwardType,
    },
  });

  const syncFormWithDbItems = useCallback(
    (data) => {
      setTempItems(data);
    },
    [inwardType, supplierId],
  );

  useEffect(() => {
    if (poItemsData?.data) {
      syncFormWithDbItems(poItemsData?.data);
    }
  }, [isPoItemsLoading, isPoItemsFetching, syncFormWithDbItems, poItemsData]);

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setInwardType(data?.inwardType || fromPoType || "PURCHASE_INWARD");
      setLocationId(data?.Store ? data.Store.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setInwardItems(data?.inwardItems ? data?.inwardItems : []);
      console.log(data?.inwardItems, "data?.inwardItems");
      console.log(inwardItems, "inwarditemsinsync");

      setSupplierId(data?.supplierId || fromPoSupplierId || "");
      setDcDate(
        data?.dcDate ? moment.utc(data.dcDate).format("YYYY-MM-DD") : "",
      );
      setRemarks(data?.remarks || "");
      setDcNo(data?.dcNo ? data.dcNo : "");
      setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
      setInvNo(data?.invNo ? data?.invNo : "");
      setReceiptType(data?.receiptType || "AGAINST_INVOICE");
      setTaxTemplateId(data?.taxTemplateId || "");
      setDiscountType(data?.discountType || "");
      setDiscountValue(data?.discountValue || "");
      setNetBillValue(parseFloat(data?.netBillValue)?.toFixed(2) || "");
      setAttachments(data?.attachments ? data?.attachments : []);
    },
    [id, fromPoSupplierId, fromPoType],
  );

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
    inwardType,
    locationId,
    storeId,
    supplierId,
    dcNo,
    dcDate,
    remarks,
    vehicleNo,
    inwardItems: inwardItems?.filter((po) => po.itemVariantId),
    finYearId,
    invNo,
    receiptType,
    taxTemplateId,
    discountType,
    discountValue,
    netBillValue,
    attachments: attachments?.filter((i) => i.filePath),
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key == "attachments") {
          console.log("attachments =>", data[key]);
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              })),
            ),
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("images", option.filePath);
            }
          });
        } else if (
          key === "inwardItems" ||
          Array.isArray(data[key]) ||
          (typeof data[key] === "object" && data[key] !== null)
        ) {
          formData.append(key, JSON.stringify(data[key])); // ✅ stringify arrays and objects
        } else {
          formData.append(key, data[key]); // ✅ primitives appended as-is
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
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
            dispatchInvalidate();

            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setFromPoId("");
                setFromPoSupplierId("");
                setFromPoType("");
                // ✅ Focus the Bill Type dropdown after all state updates
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
        // row.styleItemId || "",
        row.sizeId || "",
        row.colorId || "",
        row.gsmId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          // styleItemId: row.styleItemId,
          sizeId: row.sizeId,
          colorId: row.colorId,
          gsmId: row.gsmId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const items = data?.inwardItems || [];
    const filledItems = items.filter((item) => item.itemVariantId);
    const isAgainstInvoice = data.receiptType === "AGAINST_INVOICE";
    const isAmountMatched =
      Number(data?.netBillValue).toFixed(2) ===
      parseFloat(totals?.net || 0).toFixed(2);
    const checks = [
      { condition: !data.inwardType, title: "Inward Type is required!" },
      { condition: !data.locationId, title: "Location is required!" },
      { condition: !data.storeId, title: "Location is required!" },
      { condition: !data.receiptType, title: "Receipt Basis is required!" },
      { condition: !data.supplierId, title: "Supplier is required!" },

      {
        condition: isAgainstInvoice && !data.invNo,
        title: "Invoice No is required!",
      },
      {
        condition: isAgainstInvoice && !data.netBillValue,
        title: "Bill Value is required!",
      },
      {
        condition: isAgainstInvoice && !data.taxTemplateId,
        title: "Tax Template is required!",
      },

      // ✅ Conditional: NOT AGAINST_INVOICE
      {
        condition: !isAgainstInvoice && !data.dcNo,
        title: "DC No is required!",
      },
      {
        condition: !isAgainstInvoice && !data.dcDate,
        title: "DC Date is required!",
      },
      {
        condition: filledItems.length === 0,
        title: "Please add at least one item!",
      },
      {
        condition: !isGridDatasValid(data?.inwardItems, false, [
          // "styleItemId",
          // "uomId",
          "inwardQty",
        ]),
        title: "Please fill all required item fields!",
      },
      {
        condition: isAgainstInvoice && !isAmountMatched,
        title: "Total Bill Value and Total Net Amount must be Equal.",
      },
      {
        condition: findDuplicates(filledItems).length > 0,
        title: "Duplicate Item Found!",
        html: (() => {
          const dup = findDuplicates(filledItems)[0];
          return `Item - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")}, Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")}, Color - ${findFromList(dup?.colorId, colorList?.data, "name")}, GSM - ${findFromList(dup?.gsmId, gsmList?.data, "name")}`;
        })(),
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
      // ⬅️ guard
      setInwardItems([]);
    }
  }, [supplierId]);

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

  useEffect(() => {
    if (attachments?.length >= 5) return;
    setAttachments((prev) => {
      let newArray = Array.from({ length: 5 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" };
      });
      return [...prev, ...newArray];
    });
  }, [setAttachments, attachments]);

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
  }

  function openPreview(filePath) {
    window.open(
      filePath instanceof File
        ? URL.createObjectURL(filePath)
        : getImageUrlPath(filePath),
    );
  }

  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  function deleteRow(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  const fieldClass = "px-2 py-1 text-[11px]";
  const modalFieldClass = "w-full px-2 py-1 text-[11px]";
  const cardClass =
    "border border-slate-200 px-1.5 py-1 bg-white rounded-md shadow-sm";
  const sectionTitleClass = "font-medium text-[11px] text-slate-700 mb-0.5";
  const fieldWidthMedium = "w-full min-w-0";
  const fieldWidthDate = "w-full min-w-0";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 260;

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
      {attachmentModal && (
        <Modal
          isOpen={attachmentModal}
          onClose={() => {
            setAttachmentModal(false);
            setSelectedAttachmentIndex(null);
          }}
          widthClass="p-4 w-[600px] h-[420px]"
        >
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-700">
              Attachments
            </h2>

            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center cursor-pointer hover:bg-indigo-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(file),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                }
              }}
              onClick={() =>
                document.getElementById("modal-file-upload")?.click()
              }
            >
              <p className="text-sm text-slate-500">
                Drag & drop here, or{" "}
                <span className="text-indigo-600 font-medium underline">
                  click to browse
                </span>
              </p>
              {selectedAttachmentIndex !== null ? (
                <p className="text-xs text-indigo-500 mt-1">
                  Uploading to row:{" "}
                  <strong>{selectedAttachmentIndex + 1}</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Select a row below first
                </p>
              )}
            </div>

            {/* Hidden file input for drag & drop zone */}
            <input
              type="file"
              id="modal-file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0] && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(e.target.files[0]),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                  e.target.value = "";
                }
              }}
              disabled={readOnly}
            />

            {/* Attachments Table */}
            <div className="max-h-[200px] overflow-auto">
              <div className="border-collapse bg-[#F1F1F0] shadow-sm overflow-auto">
                <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                  <thead className="py-2 font-medium sticky top-0">
                    <tr>
                      <th className="py-2 text-xs w-10 text-center border-r border-white/50">
                        S.No
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        Name
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        File
                      </th>
                      <th className="py-2 text-xs w-10 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments?.map((item, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedAttachmentIndex(index)}
                        className={`transition-colors border-b border-gray-200 text-[12px] cursor-pointer ${
                          index === selectedAttachmentIndex
                            ? "bg-indigo-100 border-l-2 border-l-indigo-500"
                            : index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {/* S.No */}
                        <td className="border-r border-white/50 h-8 text-center">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="border-r border-white/50 h-8">
                          <input
                            type="text"
                            className="text-left rounded py-1 px-2 w-full focus:outline-none focus:ring focus:border-blue-300 bg-transparent"
                            value={item?.name}
                            onChange={(e) =>
                              handleInputChange(e.target.value, index, "name")
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={readOnly}
                          />
                        </td>

                        {/* File */}
                        <td className="border-r border-white/50 h-8 px-2">
                          <div className="flex items-center gap-2">
                            {!readOnly && (
                              <label
                                htmlFor={`modal-row-upload-${index}`}
                                className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                title="Attach file"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎
                                <input
                                  type="file"
                                  id={`modal-row-upload-${index}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleInputChange(
                                        renameFile(e.target.files[0]),
                                        index,
                                        "filePath",
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </label>
                            )}

                            {item.filePath ? (
                              <>
                                <span className="truncate max-w-[120px] text-green-700 font-medium">
                                  ✅ {item.filePath?.name ?? item.filePath}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPreview(item.filePath);
                                  }}
                                  className="text-blue-600 text-xs hover:underline"
                                >
                                  View
                                </button>
                                {!readOnly && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange("", index, "filePath");
                                    }}
                                    className="text-red-600 text-xs"
                                    title="Remove file"
                                    disabled={readOnly}
                                  >
                                    ✕
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No file
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="w-[30px] border-gray-200 h-8">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addNewComments();
                              }}
                              disabled={readOnly}
                              className="flex items-center px-1 bg-blue-50 rounded"
                            >
                              <Plus size={18} className="text-blue-800" />
                            </button>
                            <button
                              className="flex items-center px-1 bg-red-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRow(index);
                                if (selectedAttachmentIndex === index) {
                                  setSelectedAttachmentIndex(null);
                                }
                              }}
                              disabled={readOnly}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-800"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setAttachmentModal(false);
                  setSelectedAttachmentIndex(null);
                }}
                className="px-2 py-1 text-sm rounded bg-green-700 text-white hover:bg-green-800 border border-green-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      <TransactionLayout
        title="Purchase Inward"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        detailsLayout="default"
        detailsLayouts={["default"]}
        header={
          <div className="grid grid-cols-1 gap-1 xl:grid-cols-[minmax(0,3.6fr)_minmax(0,4.0fr)_minmax(0,3.4fr)]">
            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Basic Details</h2>
              <div className="grid grid-cols-2 gap-1 gap-x-3 items-end md:grid-cols-2">
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="Purchase Inward No"
                    readOnly
                    value={docId}
                    className={`${fieldClass} ${fieldWidthMedium}`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="Purchase Inward Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
                    className={`${fieldClass} ${fieldWidthDate}`}
                  />
                </div>
                <div className={narrowFieldWrap}>
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
                    className={`${fieldClass} w-full max-w-none`}
                  />
                </div>
                <div className={narrowFieldWrap}>
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
                    className={`${modalFieldClass} w-full max-w-none`}
                    dropdownMinWidth={partyDropdownMinWidth}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Location"
                    childComponent={LocationMaster}
                    addNewModalWidth="w-[40%] h-[48%]"
                    disabled={id}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Inward Details</h2>
              <div className="grid grid-cols-2 gap-1 gap-x-3 items-end md:grid-cols-2">
                <div className={narrowFieldWrap}>
                  <DropdownInput
                    name="Inward Type"
                    options={inwardTypes}
                    value={inwardType}
                    setValue={(value) => {
                      setInwardType(value);
                    }}
                    required={true}
                    readOnly={readOnly}
                    disabled={id || fromPoType}
                    beforeChange={() => {
                      setInwardItems([]);
                    }}
                    className={`${fieldClass} w-full max-w-none`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <DropdownInput
                    name="Receipt Basis"
                    options={receiptTypes}
                    value={receiptType}
                    setValue={(value) => {
                      setReceiptType(value);
                    }}
                    required={true}
                    readOnly={readOnly}
                    disabled={id}
                    beforeChange={() => {
                      if (!fromPoId) {
                        setInvNo("");
                        setNetBillValue("");
                        setInwardItems([]);
                      }
                    }}
                    className={`${fieldClass} w-full max-w-none`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <TextInput
                    name={"Inv No"}
                    value={invNo}
                    setValue={setInvNo}
                    readOnly={id}
                    required={receiptType === "AGAINST_INVOICE"}
                    disabled={receiptType !== "AGAINST_INVOICE"}
                    className={`${fieldClass} w-full`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <TextInput
                    name={"Net Bill Value"}
                    value={netBillValue}
                    setValue={setNetBillValue}
                    readOnly={readOnly}
                    required={receiptType === "AGAINST_INVOICE"}
                    type={"number"}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                    onBlur={(e) =>
                      setNetBillValue(
                        e.target.value ? Number(e.target.value).toFixed(2) : "",
                      )
                    }
                    disabled={receiptType !== "AGAINST_INVOICE"}
                    className={`${fieldClass} text-right w-full`}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Supplier Details</h2>
              <div className="grid grid-cols-2 gap-1 gap-x-3 items-end md:grid-cols-2">
                <div className={narrowFieldWrap}>
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
                    className={modalFieldClass}
                    dropdownMinWidth={partyDropdownMinWidth}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Supplier"
                    childComponent={PartyMaster}
                    addNewModalWidth="w-[90%] h-[95%]"
                    disabled={id || !!fromPoSupplierId}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <DropdownInput
                    name="Tax Type"
                    options={dropDownListObject(
                      taxTypeList ? taxTypeList?.data : [],
                      "name",
                      "id",
                    )}
                    value={taxTemplateId}
                    setValue={setTaxTemplateId}
                    required={receiptType === "AGAINST_INVOICE"}
                    readOnly={readOnly}
                    disabled={receiptType !== "AGAINST_INVOICE"}
                    className={`${fieldClass} w-full max-w-none`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <TextInput
                    name={"Dc No."}
                    value={dcNo}
                    setValue={setDcNo}
                    readOnly={readOnly}
                    required={receiptType !== "AGAINST_INVOICE"}
                    className={`${fieldClass} w-full`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <DateInputNew
                    name="Dc Date"
                    value={dcDate}
                    setValue={setDcDate}
                    required={receiptType !== "AGAINST_INVOICE"}
                    readOnly={readOnly}
                    type={"date"}
                    className={`${fieldClass} w-full`}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        gridItems={
          <InwardItems
            id={id}
            inwardItems={enrichedItemsList}
            setInwardItems={setInwardItems}
            readOnly={readOnly}
            uomList={uomList}
            hsnList={hsnList}
            styleItemList={styleItemList}
            inwardType={inwardType}
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
            vehicleRef={vehicleRef}
            fromPoId={fromPoId}
            receiptType={receiptType}
            taxTemplateId={taxTemplateId}
            gsmList={gsmList}
            isSupplierOutside={isSupplierOutside}
            itemVariantList={itemVariantList}
          />
        }
        footer={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 xl:grid-cols-[minmax(0,3.6fr)_minmax(0,5.0fr)_minmax(0,3.4fr)] mt-1 shrink-0">
              <div className={cardClass}>
                <h2 className={sectionTitleClass}>Vehicle Details</h2>
                <textarea
                  ref={vehicleRef}
                  readOnly={readOnly}
                  value={vehicleNo}
                  onChange={(e) => {
                    setVehicleNo(e.target.value);
                  }}
                  className="w-full overflow-auto h-10 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Vehicle Details..."
                  disabled={readOnly}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();

                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;

                      const newValue =
                        vehicleNo.substring(0, start) +
                        "\n" +
                        vehicleNo.substring(end);

                      setVehicleNo(newValue);

                      // ✅ Restore focus + cursor properly
                      requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      });
                    }
                  }}
                />
              </div>

              <div className={cardClass}>
                <h2 className={sectionTitleClass}>Remarks</h2>
                <textarea
                  readOnly={readOnly}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                  }}
                  className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Additional notes..."
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();

                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;

                      const newValue =
                        remarks.substring(0, start) +
                        "\n" +
                        remarks.substring(end);

                      setRemarks(newValue);

                      // ✅ Restore focus + cursor properly
                      requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      });
                    }
                  }}
                />
              </div>
              {receiptType === "AGAINST_INVOICE" ? (
                <div className={cardClass}>
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-slate-600">Total Qty</span>
                    <span className="font-medium">
                      {inwardItems
                        .reduce(
                          (sum, row) => sum + (Number(row.inwardQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-slate-600">Taxable Amount</span>
                    <span className="font-medium">
                      Rs.
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals?.taxable || 0)}{" "}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-slate-600">Net Amount</span>
                    <span className="font-medium">
                      Rs.
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals?.net || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                  <h2 className="font-semibold text-slate-800 mb-2 text-base">
                    Qty Summary
                  </h2>

                  {inwardType !== "DIRECT_INWARD" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between  text-sm">
                        <span className="text-slate-600">Total Order Qty</span>
                        <span className="font-medium">
                          {inwardItems
                            .reduce(
                              (sum, row) => sum + (Number(row.poQty) || 0),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex justify-between  text-sm">
                      <span className="text-slate-600">Total Inward Qty</span>
                      <span className="font-medium">
                        {inwardItems
                          .reduce(
                            (sum, row) => sum + (Number(row.inwardQty) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-between mt-4"></div>
            <TransactionActions
              leftActions={[
                ...(!readOnly
                  ? [
                      {
                        key: "save-close",
                        icon: (
                          <span className="flex items-center gap-1">
                            <FiSave className="h-3.5 w-3.5" />
                            <HiX className="h-3.5 w-3.5" />
                          </span>
                        ),
                        hoverLabel: "Save & Close",
                        iconOnly: true,
                        onClick: () => saveData("close"),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveData("close");
                            e.stopPropagation();
                          }
                        },
                        disabled: readOnly,
                        className: `bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                      {
                        key: "save-new",
                        icon: (
                          <span className="flex items-center gap-1">
                            <FiSave className="h-3.5 w-3.5" />
                            <HiOutlineRefresh className="h-3.5 w-3.5" />
                          </span>
                        ),
                        hoverLabel: "Save & New",
                        iconOnly: true,
                        onClick: () => saveData("new"),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            saveData("new");
                          }
                        },
                        disabled: readOnly,
                        className: `bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                    ]
                  : []),
              ]}
              rightActions={[
                ...(!id || readOnly
                  ? [
                      {
                        key: "edit",
                        icon: <FiEdit2 className="h-3.5 w-3.5" />,
                        hoverLabel: "Edit",
                        iconOnly: true,
                        onClick: () => setReadOnly(false),
                        className: `bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                    ]
                  : []),
                {
                  key: "upload",
                  icon: <span className="text-sm">📎</span>,
                  label: "Upload",
                  onClick: () => {
                    setSelectedAttachmentIndex(null);
                    setAttachmentModal(true);
                  },
                  className: `bg-slate-600 hover:bg-slate-700 px-3 py-2 rounded-md flex items-center justify-center text-xs font-semibold text-white transition shadow-sm gap-1`,
                },
                ...(receiptType === "AGAINST_INVOICE"
                  ? [
                      {
                        key: "bill-summary",
                        icon: null,
                        label: "View Bill Summary",
                        onClick: () => {
                          if (!taxTemplateId) {
                            toast.info("Please Select Tax Template !", {
                              position: "top-center",
                            });
                            return;
                          }
                          setSummary(true);
                        },
                        className: `bg-blue-600 hover:bg-blue-800 px-3 py-2 rounded-md flex items-center justify-center text-xs font-semibold text-white transition shadow-sm gap-1`,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        }
      />
    </>
  );
};
export default PurchaseInwardForm;
