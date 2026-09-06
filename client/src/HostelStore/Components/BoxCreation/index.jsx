import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetBoxQuery,
  useGetBoxByIdQuery,
  useGetBoxReportByIdQuery,
  useAddBoxMutation,
  useUpdateBoxMutation,
  useDeleteBoxMutation,
} from "../../../redux/services/BoxCreationService";
import { useGetStyleMasterQuery } from "../../../redux/services/StyleMaster_Service";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService";
import moment from "moment";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ReusableTable,
  ToggleButton,
  TextInputNew,
  TextInputNew1,
  DropdownInput,
  DropdownInputWithoutLabel,
  DateInputNew,
  MultiSelectDropdown,
} from "../../../Inputs";
import { Check, Power, Printer, X, FileText } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import { TransactionGrid } from "../../../Basic/components/Reuseable/index.js";
import { statusDropdown } from "../../../Utils/DropdownData";
import { PDFViewer } from "@react-pdf/renderer";
import BoxQRCodeFormat from "./PrintFormat-QRCode/index.jsx";
import Swal from "sweetalert2";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { getCommonParams } from "../../../Utils/helper";

const MODEL = "Box Creation";

export default function BoxCreation({
  onSuccess,
  onClose,
  editId,
  deleteId,
  deleteLabel,
} = {}) {
  const today = new Date();

  const [form, setForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [sizeId, setSizeId] = useState("");
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [boxStyleItems, setBoxStyleItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  // States for printing QR codes
  const [fromBox, setFromBox] = useState("");
  const [toBox, setToBox] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [qrPrintData, setQrPrintData] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const handleRightClick = (event, styleId) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      styleId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const childRecord = useRef(0);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const params = {
    branchId,
    companyId,
    finYearId,
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetBoxQuery({ params, searchParams: searchValue });
  console.log(allData, "test");

  const {
    data: singleData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetBoxByIdQuery(id, {
    skip: !id,
  });

  const { data: boxReportData, isLoading: isReportLoading } =
    useGetBoxReportByIdQuery(id, {
      skip: !id,
    });
  console.log(boxReportData, "boxReportData");

  const { data: styleMasterData } = useGetStyleMasterQuery({ params });
  const { data: sizeMasterData } = useGetSizeMasterQuery({ params });

  const [addData] = useAddBoxMutation();
  const [updateData] = useUpdateBoxMutation();
  const [removeData] = useDeleteBoxMutation();

  const sortedBoxes = useMemo(() => {
    if (!allData?.data) return [];
    return [...allData.data]?.sort((a, b) => a?.docId?.localeCompare(b?.docId));
  }, [allData]);

  const toBoxOptions = useMemo(() => {
    if (!fromBox) return sortedBoxes;
    const fromIdx = sortedBoxes?.findIndex(
      (b) => String(b.id) === String(fromBox),
    );
    if (fromIdx === -1) return sortedBoxes;
    return sortedBoxes?.slice(fromIdx);
  }, [sortedBoxes, fromBox]);

  const handlePrint = () => {
    if (!fromBox || !toBox) {
      toast.error("Please select both From and To boxes.");
      return;
    }

    const boxes = sortedBoxes;
    const fromIndex = boxes?.findIndex((b) => String(b.id) === String(fromBox));
    const toIndex = boxes?.findIndex((b) => String(b.id) === String(toBox));

    if (fromIndex === -1 || toIndex === -1) {
      toast.error("Invalid box selection.");
      return;
    }

    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    const selectedBoxes = boxes?.slice(startIndex, endIndex + 1);

    setQrPrintData(selectedBoxes);
    setShowPrintModal(true);
  };

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (fetchedData) => {
      setDocId(fetchedData?.docId || "New");
      setDocDate(
        fetchedData?.docDate
          ? moment.utc(fetchedData.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setSizeId(fetchedData?.sizeId || "");

      if (fetchedData?.styles && Array.isArray(fetchedData.styles)) {
        setSelectedStyles(
          fetchedData?.styles?.map((s) => ({
            label: s.styleMaster?.styleNo,
            value: s.styleId,
          })),
        );
        const mrps = [];
        fetchedData?.styles?.forEach((s) => {
          mrps?.push({
            styleId: s.styleId,
            mrp: s.mrp?.toFixed(2) || "",
            qty: s.qty || "",
          });
        });
        setBoxStyleItems(mrps);
      } else {
        setSelectedStyles([]);
        setBoxStyleItems([]);
      }

      childRecord.current = fetchedData?.childRecord || 0;
    },
    [id],
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData?.data);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (selectedStyles && styleMasterData?.data) {
      setBoxStyleItems((prev) => {
        let updated = false;
        const newMrps = [...prev];
        selectedStyles.forEach((styleOpt) => {
          const existing = newMrps.find((m) => m.styleId === styleOpt.value);
          if (!existing || existing.mrp === "") {
            const styleObj = styleMasterData.data.find(
              (s) => s.id === styleOpt.value,
            );
            if (
              styleObj &&
              styleObj.mrpPrice !== undefined &&
              styleObj.mrpPrice !== null
            ) {
              if (existing) {
                existing.mrp = styleObj.mrpPrice?.toFixed(2);
              } else {
                newMrps.push({
                  styleId: styleOpt.value,
                  mrp: styleObj.mrpPrice?.toFixed(2),
                  qty: "",
                });
              }
              updated = true;
            } else if (!existing) {
              newMrps.push({ styleId: styleOpt.value, mrp: "", qty: "" });
              updated = true;
            }
          }
        });
        return updated ? newMrps : prev;
      });
    }
  }, [selectedStyles, styleMasterData]);

  const data = {
    branchId: parseInt(branchId),
    companyId: parseInt(companyId),
    finYearId: parseInt(finYearId),
    userId: parseInt(userId),
    docId,
    docDate,
    sizeId: parseInt(sizeId),
    boxStyleItems,
    id,
  };
  console.log(boxStyleItems, "boxStyleItems");

  const validateData = (data) => {
    if (!data.sizeId) return false;
    if (!data.boxStyleItems || data.boxStyleItems.length === 0) return false;

    const hasMissingData = data.boxStyleItems?.some(
      (style) =>
        style.mrp === "" ||
        style.mrp === undefined ||
        style.mrp === null ||
        style.qty === "" ||
        style.qty === undefined ||
        style.qty === null ||
        style.qty <= 0,
    );

    if (hasMissingData) return false;

    return true;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        setId("");
        countryNameRef?.current?.focus();
      } else {
        setForm(false);
        setShowReport(false);
        syncFormWithDb(undefined);
        setId("");
      }
      Swal.fire({
        title: text + "Successfully",
        icon: "success",
      });
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return;
    }

    // Name uniqueness check removed because box codes are auto-generated sequentially on the backend.
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const deleteData = async (id, childRecord) => {
    if (id) {
      if (childRecord) {
        Swal.fire({
          title: "Child Record Exists",
          icon: "error",
        });
        return;
      }
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        syncFormWithDb(undefined);
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setShowReport(false);
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
    setShowReport(false);
  }

  const tableHeaders = ["Code", "Name", "Status"];
  const tableDataNames = [
    "dataObj.code",
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    setShowReport(false);
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    setShowReport(false);
  };
  const handleReport = (id) => {
    setId(id);
    setForm(true);
    setShowReport(true);
  };

  const handleScan = (e) => {
    if (e.key === "Enter" && scanInput) {
      e.preventDefault();
      const matchedBox = sortedBoxes?.find((b) => b.docId === scanInput);
      if (matchedBox) {
        if (matchedBox.childRecord > 0) {
          handleReport(matchedBox.id);
        } else {
          toast.error("Box is not packed!");
        }
      } else {
        toast.error("Box not found!");
      }
      setScanInput("");
    }
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },
    {
      header: "Box No",
      accessor: (item) => item?.docId || item?.code,
      className: "font-medium text-gray-900 text-left uppercase w-48",
    },
    {
      header: "Date",
      accessor: (item) =>
        item?.docDate ? moment(item.docDate).format("DD-MM-YYYY") : "-",
      className: "font-medium text-gray-900 text-left w-24",
    },
    {
      header: "Packing Status",
      accessor: (item) => {
        const isPacked = item?.childRecord > 0;
        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold ${isPacked
                ? "bg-orange-100 text-orange-700 border border-orange-300"
                : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
          >
            {isPacked ? "PACKED" : "EMPTY"}
          </span>
        );
      },
      className: "font-medium text-gray-900 text-left uppercase w-44",
    },
    {
      header: "Dispatch Status",
      accessor: (item) => {
        const isSaled = item?.saledCount > 0;
        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold ${isSaled
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
          >
            {isSaled ? "SALED" : "NOT SALED"}
          </span>
        );
      },
      className: "font-medium text-gray-900 text-left uppercase w-44",
    },
    {
      header: "Report",
      accessor: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (item.childRecord > 0) {
              handleReport(item.id);
            } else {
              toast.error("Box is not packed!");
            }
          }}
          className="text-indigo-600 hover:text-indigo-800 flex justify-center w-full"
          title="View Report"
        >
          <FileText size={16} />
        </button>
      ),
      className: "font-medium text-center w-12",
    },
    {
      header: "Print",
      accessor: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQrPrintData([item]);
            setShowPrintModal(true);
          }}
          className="text-blue-600 hover:text-blue-800 flex justify-center w-full"
          title="Print QR Code"
        >
          <Printer size={16} />
        </button>
      ),
      className: "font-medium text-center w-12",
    },
  ];

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  const mrpGridColumns = [
    {
      key: "styleName",
      label: "Style Name",
      className: "w-40 px-2 py-2 text-left font-semibold text-[11px]",
    },
    {
      key: "qty",
      label: "Quantity",
      className: "w-20 px-2 py-2 text-left font-semibold text-[11px]",
    },
    {
      key: "mrpPrice",
      label: "MRP Price",
      className: "w-20 px-2 py-2 text-left font-semibold text-[11px]",
    },
  ];

  const modalColumns = [
    {
      key: "sno",
      label: "S.No",
      className: "w-6 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "poNo",
      label: "PO No",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "packingDocId",
      label: "Packing No",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "itemName",
      label: "Description of Goods",
      className: "w-32 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "styleNo",
      label: "Style No",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "hsn",
      label: "HSN",
      className: "w-12 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "printingDesign",
      label: "Printing Design",
      className: "w-24 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "color",
      label: "Color",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "size",
      label: "Size",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "uom",
      label: "UOM",
      className: "w-12 px-2 py-2 text-center font-semibold text-[11px]",
    },
    {
      key: "qrCode",
      label: "QR Code",
      className: "w-16 px-2 py-2 text-center font-semibold text-[11px]",
    },
  ];

  const formBody = showReport ? (
    <div className="flex-1 p-3 overflow-auto">
      <div className="bg-white p-3 rounded-md border border-gray-200 h-full overflow-auto">
        {isReportLoading ? (
          <p className="text-gray-500">Loading report data...</p>
        ) : boxReportData?.data?.length === 0 ? (
          <p className="text-gray-500">No items found in this box.</p>
        ) : (
          <TransactionGrid
            title=""
            columns={modalColumns}
            rows={boxReportData?.data || []}
            getRowClassName={(_, index) =>
              `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 h-6`
            }
            renderRow={(item, index) => {
              if (!item || !item.id) {
                return (
                  <>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-center text-gray-400">
                      {index + 1}
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                  </>
                );
              }
              return (
                <>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-center">
                    {index + 1}
                  </td>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                    {item.Po?.docId || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                    {item.PackingBoxItems?.packing?.docId || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                    {item.ItemVariant?.styleMaster?.modelName?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                    {item.ItemVariant?.styleMaster?.styleNo || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                    {item.Hsn?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                    {item.printingDesign?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                    {item.Color?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                    {item.Size?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                    {item.Uom?.name || "-"}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1 font-medium text-indigo-600">
                    {item.qrCode}
                  </td>
                </>
              );
            }}
          />
        )}
      </div>
    </div>
  ) : (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1 gap-3 h-full">
        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
          <div className="flex gap-x-8">
            <div className="w-36">
              <TextInputNew1
                name="Box No"
                type="text"
                value={docId}
                readOnly={true}
              />
            </div>
            <div className="w-24">
              <TextInputNew1
                name="Date"
                value={docDate}
                // setValue={setDocDate}
                readOnly={true}
              />
            </div>

            <div className="w-80">
              <MultiSelectDropdown
                name="Style"
                options={
                  styleMasterData?.data?.map((s) => ({
                    label: s.styleNo,
                    value: s.id,
                  })) || []
                }
                selected={selectedStyles}
                setSelected={setSelectedStyles}
                readOnly={readOnly || childRecord.current > 0}
                className="py-0.5"
              />
            </div>
            <div className="w-60">
              <DropdownInput
                name="Size"
                options={
                  sizeMasterData?.data?.map((s) => ({
                    show: s.name,
                    value: s.id,
                  })) || []
                }
                value={sizeId}
                setValue={setSizeId}
                readOnly={readOnly || childRecord.current > 0}
              />
            </div>
          </div>

          {selectedStyles?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-sm mb-3 text-gray-700">
                Set MRP for Selected Styles
              </h3>
              <div className="w-[40%] relative">
                <TransactionGrid
                  title=""
                  columns={mrpGridColumns}
                  rows={selectedStyles}
                  footer={
                    <tr>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1 font-bold">
                        Total
                      </td>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-right px-1 font-bold">
                        {boxStyleItems.reduce(
                          (sum, item) => sum + (parseInt(item.qty) || 0),
                          0,
                        )}
                      </td>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-right px-1 font-bold">
                        {boxStyleItems
                          .reduce(
                            (sum, item) => sum + (parseFloat(item.mrp) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </td>
                    </tr>
                  }
                  onRowContextMenu={(e, style) => {
                    if (!readOnly && childRecord.current === 0) {
                      handleRightClick(e, style.value);
                    } else {
                      e.preventDefault();
                    }
                  }}
                  getRowClassName={(_, index) =>
                    `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 h-6`
                  }
                  renderRow={(style) => (
                    <>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                        {style.label}
                      </td>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                        <input
                          type="number"
                          className="w-full bg-transparent text-right focus:outline-none text-[11px]"
                          placeholder="Enter Qty"
                          value={
                            boxStyleItems.find((m) => m.styleId === style.value)
                              ?.qty || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setBoxStyleItems((prev) => {
                              const existingIndex = prev.findIndex(
                                (m) => m.styleId === style.value,
                              );
                              if (existingIndex !== -1) {
                                const newArray = [...prev];
                                newArray[existingIndex] = {
                                  ...newArray[existingIndex],
                                  qty: val,
                                };
                                return newArray;
                              }
                              return [
                                ...prev,
                                { styleId: style.value, qty: val, mrp: "" },
                              ];
                            });
                          }}
                          readOnly={readOnly || childRecord.current > 0}
                        />
                      </td>
                      <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                        <input
                          type="number"
                          className="w-full bg-transparent text-right focus:outline-none text-[11px]"
                          placeholder="Enter MRP"
                          value={
                            boxStyleItems.find((m) => m.styleId === style.value)
                              ?.mrp || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setBoxStyleItems((prev) => {
                              const existingIndex = prev.findIndex(
                                (m) => m.styleId === style.value,
                              );
                              if (existingIndex !== -1) {
                                const newArray = [...prev];
                                newArray[existingIndex] = {
                                  ...newArray[existingIndex],
                                  mrp: val,
                                };
                                return newArray;
                              }
                              return [
                                ...prev,
                                { styleId: style.value, mrp: val },
                              ];
                            });
                          }}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setBoxStyleItems((prev) => {
                                const existingIndex = prev.findIndex(
                                  (m) => m.styleId === style.value,
                                );
                                if (existingIndex !== -1) {
                                  const newArray = [...prev];
                                  newArray[existingIndex] = {
                                    ...newArray[existingIndex],
                                    mrp: val.toFixed(2),
                                  };
                                  return newArray;
                                }
                                return prev;
                              });
                            }
                          }}
                          readOnly={true}
                        />
                      </td>
                    </>
                  )}
                />
                {contextMenu && (
                  <div
                    style={{
                      position: "fixed",
                      top: `${contextMenu.mouseY - 20}px`,
                      left: `${contextMenu.mouseX + 20}px`,
                      boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                      padding: "8px",
                      borderRadius: "4px",
                      zIndex: 1000,
                    }}
                    className="bg-gray-100"
                    onMouseLeave={handleCloseContextMenu}
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                        onClick={() => {
                          setSelectedStyles((prev) =>
                            prev.filter((s) => s.value !== contextMenu.styleId),
                          );
                          setBoxStyleItems((prev) =>
                            prev.filter(
                              (s) => s.styleId !== contextMenu.styleId,
                            ),
                          );
                          handleCloseContextMenu();
                        }}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                        onClick={() => {
                          setSelectedStyles([]);
                          setBoxStyleItems([]);
                          handleCloseContextMenu();
                        }}
                      >
                        Delete All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form]);

  if (deleteId) {
    const childCount = singleData?.data?.childRecord ?? 0;
    const isLoadingRecord = isSingleFetching || isSingleLoading;

    const handleConfirmDelete = async () => {
      try {
        const res = await removeData(deleteId).unwrap();
        if (res?.statusCode === 1) {
          toast.error(
            res?.data?.message || "Cannot delete: child records exist",
          );
          return;
        }
        toast.success("Deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete");
      }
    };

    return (
      <div className=" min-h-[250px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 mt-4 bg-white">
          <h2 className="text-lg font-semibold">Delete Box</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded mb-3">
          {isLoadingRecord ? (
            <p>Checking...</p>
          ) : childCount > 0 ? (
            <>
              <p className="text-red-600 font-semibold">Cannot Delete</p>
              <p>
                "{deleteLabel}" has {childCount} linked records.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteLabel}"</span>?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            {editId ? "Edit Department" : "Add New Department"}
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            {editId ? "Update" : "Save"}
          </button>
        </div>

        {formBody}
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between items-center flex-wrap gap-2">
        <h5 className="text-lg font-bold text-gray-800">Box Creation</h5>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 mr-2">
              <input
                type="text"
                placeholder="Scan Box QR..."
                className="w-48 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={handleScan}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-800">From</span>
              <select
                className="w-60 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                value={fromBox}
                onChange={(e) => setFromBox(e.target.value)}
              >
                <option value="" hidden>
                  Select
                </option>
                {sortedBoxes?.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className={
                      b.childRecord > 0
                        ? "text-green-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {b.docId} - {b.childRecord > 0 ? "Packed" : "Empty"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 ml-1">
              <span className="text-sm font-bold text-gray-800">To</span>
              <select
                className="w-60 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                value={toBox}
                onChange={(e) => setToBox(e.target.value)}
              >
                <option value="" hidden>
                  Select
                </option>
                {toBoxOptions?.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className={
                      b.childRecord > 0
                        ? "text-green-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {b.docId} - {b.childRecord > 0 ? "Packed" : "Empty"}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFromBox("");
                setToBox("");
              }}
              className="px-3 py-1 hover:bg-gray-600 hover:text-white rounded text-gray-600 border border-gray-600 flex items-center gap-1 text-xs ml-1"
            >
              <X size={14} /> Clear
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs ml-1"
            >
              <Printer size={14} /> Print
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="px-3 py-1 hover:bg-indigo-600 hover:text-white rounded text-indigo-600 border border-indigo-600 flex items-center gap-1 text-xs"
          >
            + Add New Box
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[90%] h-[80%]"}
            onClose={() => {
              setForm(false);
              setShowReport(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id ? `Box - ${docId || ""}` : "Add New Box"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && !id && (
                      <button
                        type="button"
                        onClick={() => {
                          setReadOnly(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && childRecord.current === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close");
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update & close" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && childRecord.current === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new");
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0}
                      >
                        <Check size={14} />
                        {id ? "Update & New" : "Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {formBody}
            </div>
          </Modal>
        )}
        {showPrintModal && (
          <Modal
            isOpen={showPrintModal}
            form={showPrintModal}
            widthClass="w-[90%] h-[90%]"
            onClose={() => {
              setShowPrintModal(false);
              setQrPrintData([]);
            }}
          >
            <div className="h-full flex flex-col bg-gray-200">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  Print Box QR Codes
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1 hover:bg-gray-200 rounded border border-gray-400 flex items-center gap-1 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 p-3">
                <PDFViewer className="w-full h-full border-0">
                  <BoxQRCodeFormat qrBoxesData={qrPrintData} />
                </PDFViewer>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
