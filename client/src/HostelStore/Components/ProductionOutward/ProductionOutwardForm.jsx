import { IoArrowBackCircleSharp } from "react-icons/io5";
import { DateInputNew, DropdownNew, TextInput } from "../../../Inputs/index.js";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  ModeChip,
} from "../../../Utils/helper.js";
import { toast } from "react-toastify";
import { FiEdit2, FiFileText, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { dropDownListObject } from "../../../Utils/contructObject.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { PartyMaster } from "../index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import {
  useAddProductionOutwardMutation,
  useGetProductionOutwardByIdQuery,
  useUpdateProductionOutwardMutation,
} from "../../../redux/uniformService/ProductionOutwardService.js";
import { useGetJobCardListQuery } from "../../../redux/uniformService/JobCardService.js";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService.js";
import { useGetAllocationListQuery } from "../../../redux/uniformService/ProductionAllocationService.js";
import TransactionLayout from "../../../Basic/components/Reuseable/TransactionLayout.jsx";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";
import DeliveryChallanPrintFormat from "./DeliveryChallan.jsx";
import Modal from "../../../UiComponents/Modal/index.js";
import { PDFViewer } from "@react-pdf/renderer";

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusMeta = {
  COMPLETED: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
    label: "Completed",
  },
  IN_PROGRESS: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-300",
    label: "In Progress",
  },
  PENDING: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    label: "Pending",
  },
  NOT_STARTED: {
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-500 border-gray-300",
    label: "Not Started",
  },
};
const getStatus = (s) =>
  statusMeta[(s || "NOT_STARTED").toUpperCase()] || statusMeta.NOT_STARTED;

// Returns the completedQty of the highest-sequence COMPLETED process in the route.
// Returns null if no process is completed → no cap.
const getLastCompletedQty = (processRoute) => {
  if (!processRoute?.length) return null;
  const completed = processRoute
    .filter(
      (r) =>
        r.status?.toUpperCase() === "COMPLETED" &&
        r.completedQty !== null &&
        r.completedQty !== undefined,
    )
    .sort((a, b) => (b.sequence || 0) - (a.sequence || 0)); // highest sequence first
  return completed.length > 0 ? completed[0].completedQty : null;
};

// Returns true if the process at (sequence - 1) is COMPLETED
const isPrevProcessCompleted = (route, sequence) => {
  if (sequence <= 1) return true; // no previous process
  const prev = route.find((r) => r.sequence === sequence - 1);
  return !prev || prev.status?.toUpperCase() === "COMPLETED";
};

// ─── ProcessTree ──────────────────────────────────────────────────────────────

const ProcessTree = ({
  processRoute,
  processList,
  allocationDetails,
  selectedProcessIds,
  onToggle,
}) => {
  if (!processRoute?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs gap-2">
        <svg
          className="w-8 h-8 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>Select a Job Card to view process route</span>
      </div>
    );
  }

  const sorted = [...processRoute].sort(
    (a, b) => (a.sequence || 0) - (b.sequence || 0),
  );

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        Please Select Process For Outside
      </p>

      <div className="relative">
        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
        <div className="flex flex-col gap-0">
          {sorted.map((route, idx) => {
            const meta = getStatus(route.status);
            const procName =
              findFromList(route.processId, processList?.data, "name") ||
              `Process ${idx + 1}`;
            const alloc = allocationDetails?.find(
              (d) => d.processId === route.processId,
            );
            const isOutside = alloc?.isOutSide === true;
            const status = route.status?.toUpperCase();
            const isCompleted = status === "COMPLETED";
            const isPending = status === "IN_PROGRESS";
            const completedQty = route.completedQty;
            const isChecked = selectedProcessIds.includes(route.processId);
            const isPrevDone = (() => {
              // immediate previous process is pending → block
              if (idx > 0) {
                const immediatePrev = sorted[idx - 1];

                if (immediatePrev?.status?.toUpperCase() === "IN_PROGRESS") {
                  return false;
                }
              }

              // find nearest preceding NON-outside (inside) process
              for (let i = idx - 1; i >= 0; i--) {
                const prev = sorted[i];
                const prevAlloc = allocationDetails?.find(
                  (d) => d.processId === prev.processId,
                );

                if (!prevAlloc?.isOutSide) {
                  // nearest inside process must be completed
                  return prev.status?.toUpperCase() === "COMPLETED";
                }
              }

              return true;
            })();
            const isPrevOutsideChecked = (() => {
              if (idx === 0) return true;
              for (let i = idx - 1; i >= 0; i--) {
                const prev = sorted[i];
                const prevAlloc = allocationDetails?.find(
                  (d) => d.processId === prev.processId,
                );
                if (prevAlloc?.isOutSide === true) {
                  // if already completed by another supplier — treat as satisfied, no checkbox needed
                  if (prev.status?.toUpperCase() === "COMPLETED") return true;
                  // otherwise must be checked by user
                  return selectedProcessIds.includes(prev.processId);
                }
              }
              return true;
            })();
            const isCheckboxDisabled =
              !isOutside || isPending || !isPrevDone || !isPrevOutsideChecked;
            const isLast = idx === sorted.length - 1;

            return (
              <div
                key={route.id || idx}
                className={`relative flex gap-3 ${isLast ? "" : "pb-1"}`}
              >
                <div className="relative z-10 flex-shrink-0 mt-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCompleted ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-white"}`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-2.5 h-2.5 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 mb-1 rounded-lg border transition-all duration-150 ${isOutside ? "border-indigo-200 bg-indigo-50/60" : "border-gray-200 bg-white"} ${isChecked ? "ring-1 ring-indigo-400 border-indigo-400" : ""}`}
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    {isOutside && !isCompleted && (
                      <input
                        type="checkbox"
                        className={`w-3.5 h-3.5 rounded border-indigo-400 accent-indigo-600 flex-shrink-0 ${isCheckboxDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        checked={isChecked}
                        onChange={() =>
                          !isCheckboxDisabled && onToggle(route, alloc)
                        }
                        disabled={isCheckboxDisabled}
                        title={
                          !isPrevDone
                            ? "Previous process not completed"
                            : !isPrevOutsideChecked
                              ? "Select the previous outside process first"
                              : ""
                        }
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-gray-700 truncate">
                          {route.sequence}. {procName}
                        </span>
                        {isOutside && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[9px] font-medium bg-indigo-100 text-indigo-600 border border-indigo-200">
                            <svg
                              className="w-2 h-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7"
                              />
                            </svg>
                            Outside
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9px] font-medium border ${meta.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                          />
                          {meta.label}
                        </span>
                        {completedQty !== null &&
                          completedQty !== undefined && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9px] font-semibold border ${isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}
                            >
                              Qty : {completedQty}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── DeliveryPanel ────────────────────────────────────────────────────────────

const DeliveryPanel = ({
  selectedProcesses,
  processList,
  supplierId,
  setSupplierId,
  supplierList,
  readOnly,
  childRecord,
  dcNo,
  setDcNo,
  vehicleNo,
  setVehicleNo,
  deliveryQty,
  setDeliveryQty,
  qtyCap,
  branchData, // last completed seq qty — null means no cap
}) => {
  const isDisabled = readOnly || childRecord?.current > 0;

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setDeliveryQty(val);

    // Validate immediately on change
    const num = Number(val);
    if (val !== "" && qtyCap !== null && num > qtyCap) {
      setDeliveryQty(qtyCap);
      Swal.fire({
        icon: "warning",
        title: "Qty Exceeded!",
        text: `Delivery qty cannot exceed the last completed qty of ${qtyCap}.`,
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Supplier */}
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          Supplier Details
        </p>
        <div className="flex flex-col gap-2">
          <DropdownWithModal
            name="Supplier"
            options={dropDownListObject(
              supplierList?.data?.filter(
                (item) => item?.active && item?.isSupplier,
              ),
              "name",
              "id",
            )}
            value={supplierId}
            setValue={setSupplierId}
            required
            readOnly={isDisabled}
            addNewLabel="+ Add New Supplier"
            childComponent={PartyMaster}
            addNewModalWidth="w-[90%] h-[95%]"
            disabled={isDisabled}
            openOnFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              name="Contact Person"
              value={findFromList(
                supplierId,
                supplierList?.data,
                "contactPersonName",
              )}
              disabled
            />
            <TextInput
              name="Phone"
              value={findFromList(
                supplierId,
                supplierList?.data,
                "contactNumber",
              )}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          Delivery Details
        </p>
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            name="DC No"
            value={dcNo}
            setValue={setDcNo}
            required={true}
            disabled={isDisabled}
            placeholder="Enter DC number"
          />
          <TextInput
            name="Vehicle No"
            value={vehicleNo}
            setValue={setVehicleNo}
            disabled={isDisabled}
            placeholder="Enter Vehicle number"
          />
        </div>
      </div>

      {/* Selected Processes + Qty */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          Selected Processes
        </p>

        {selectedProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300 gap-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">
              Select outside processes from the tree
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedProcesses.map((sp) => {
              const procName =
                findFromList(sp.processId, processList?.data, "name") ||
                sp.processId;
              return (
                <div
                  key={sp.processId}
                  className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                      {sp.sequence}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-800">
                      {procName}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Qty input */}
            <div className="mt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  Delivery Qty <span className="text-red-500">*</span>
                </label>
                {/* Cap hint badge */}
                {qtyCap !== null && (
                  <span className="text-[9px] font-semibold px-1.5 py-0 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                    Max: {qtyCap}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={deliveryQty}
                onChange={handleQtyChange}
                onFocus={(e) => e.target.select()}
                disabled={isDisabled}
                placeholder="Enter qty"
                className={`w-full text-right text-base font-bold rounded-lg border px-3 py-2 outline-none transition-all
                                    ${
                                      isDisabled
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                        : "bg-indigo-50 text-indigo-800 border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                                    }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────

const ProductionOutwardForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  supplierList,
  hasPermission,
  branchData,
}) => {
  const today = new Date();
  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [supplierId, setSupplierId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [docId, setDocId] = useState("New");
  const [jobCardId, setJobCardId] = useState("");
  const [productionAllocationId, setProductionAllocationId] = useState("");
  const [dcNo, setDcNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [deliveryQty, setDeliveryQty] = useState("");
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [dispatchInvalidate] = useInvalidateTags();
  const supplierRef = useRef(null);
  const childRecord = useRef(0);
  const { userId, finYearId, branchId, companyId } = getCommonParams();

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductionOutwardByIdQuery(id, { skip: !id });
  const { data: jobCardList } = useGetJobCardListQuery({
    params: { companyId, branchId, isProcessIssue: true },
  });
  const { data: productionAllocationList } = useGetAllocationListQuery({
    params: { companyId, branchId },
  });
  const { data: processList } = useGetProcessMasterQuery({
    params: { companyId },
  });
  const [addData] = useAddProductionOutwardMutation();
  const [updateData] = useUpdateProductionOutwardMutation();

  const selectedJobCard = jobCardList?.data?.find((jc) => jc.id === jobCardId);
  const processRoute = selectedJobCard?.processRoute || [];
  const allocation = productionAllocationList?.data?.find(
    (a) => a.jobCardId === jobCardId,
  );
  const allocationDetails = allocation?.allocationDetails || [];

  // Derived once from the full processRoute of the selected job card
  const qtyCap = getLastCompletedQty(processRoute);

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId || "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setSupplierId(data?.supplierId || "");
      setRemarks(data?.remarks || "");
      setJobCardId(data?.jobCardId || "");
      setProductionAllocationId(data?.productionAllocationId || "");
      setDcNo(data?.dcNo || "");
      setVehicleNo(data?.vehicleNo || "");
      childRecord.current = data?.childRecord || 0;

      if (data?.productionOutwardDetails?.length) {
        const seen = new Set();
        const rebuilt = [];
        data.productionOutwardDetails.forEach((d) => {
          if (!seen.has(d.processId)) {
            seen.add(d.processId);
            rebuilt.push({
              processId: d.processId,
              sequence: d.sequence,
              allocationDetailId: d.allocationDetailId,
              completedQty: d.completedQty ?? null,
              supplierId: d.supplierId || "",
            });
          }
        });
        setSelectedProcesses(rebuilt);
        setDeliveryQty(data.productionOutwardDetails[0]?.sentQty || "");
      } else {
        setSelectedProcesses([]);
        setDeliveryQty("");
      }
    },
    [id],
  );

  useEffect(() => {
    if (id && singleData?.data) syncFormWithDb(singleData.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const buildOutwardDetails = () =>
    selectedProcesses.map((sp) => ({
      processId: sp.processId,
      sequence: sp.sequence,
      allocationDetailId: sp.allocationDetailId,
      supplierId: sp.supplierId || supplierId,
      sentQty: Number(deliveryQty) || 0,
      completedQty: sp.completedQty,
      receivedQty: 0,
      pendingQty: Number(deliveryQty) || 0,
    }));

  const data = {
    id,
    docDate,
    branchId,
    userId,
    supplierId,
    remarks,
    finYearId,
    dcNo,
    vehicleNo,
    jobCardId,
    productionAllocationId,
    outwardDetails: buildOutwardDetails() || [],
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const returnData = await callback(data).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            // dispatchInvalidate();
            invalidateJobCardModule();
            if (returnData.statusCode === 0) {
              if (!id) {
                Swal.fire({
                  icon: "question",
                  title: "Do You Want to Print?",
                  showCancelButton: true,
                  confirmButtonText: "Yes, Print",
                  cancelButtonText: "No [Esc]",
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#6b7280",
                  focusConfirm: true,
                  allowEnterKey: true,
                  allowEscapeKey: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    setPrintModalOpen(true);
                    setPendingAction(nextProcess);

                    if (returnData?.data?.id) {
                      setId(returnData.data.id);
                    }
                  } else {
                    if (nextProcess === "new") {
                      syncFormWithDb(undefined);
                      setId("");
                      setDocId("New");

                      setTimeout(() => {
                        customerRef.current?.focus();
                      }, 300);
                    }

                    if (nextProcess === "close") {
                      onClose();
                    }
                  }
                });
              } else {
                if (nextProcess === "new") {
                  setId(0);
                  setDocId("New");
                  syncFormWithDb(undefined);
                  setTimeout(() => supplierRef.current?.focus(), 100);
                }
                if (nextProcess === "close") onClose();
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

  const validateData = () => {
    if (!jobCardId) {
      Swal.fire({
        icon: "warning",
        title: "Job Card is required!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!productionAllocationId) {
      Swal.fire({
        icon: "warning",
        title: "Production Allocation is required!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (selectedProcesses.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select at least one outside process!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!supplierId) {
      Swal.fire({
        icon: "warning",
        title: "Supplier is required!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!dcNo || dcNo.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "DC No is required!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!deliveryQty || Number(deliveryQty) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Delivery Qty must be greater than 0!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (qtyCap !== null && Number(deliveryQty) > qtyCap) {
      Swal.fire({
        icon: "warning",
        title: "Qty Exceeded!",
        text: `Delivery qty cannot exceed the last completed qty of ${qtyCap}.`,
        timer: 1800,
        showConfirmButton: false,
      });
      return false;
    }
    return true;
  };

  const saveData = (nextProcess) => {
    if (!validateData()) return;
    if (id && !window.confirm("Are you sure you want to update the details?"))
      return;
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const handleKeyDown = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      String.fromCharCode(e.which).toLowerCase() === "s"
    ) {
      e.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  const handleToggleProcess = (route, alloc) => {
    setSelectedProcesses((prev) => {
      const exists = prev.find((p) => p.processId === route.processId);
      if (exists) {
        // Deselecting — clear qty if nothing will remain
        if (prev.length === 1) setDeliveryQty("");
        return prev.filter((p) => p.processId !== route.processId);
      }
      const updated = [
        ...prev,
        {
          processId: route.processId,
          sequence: route.sequence,
          allocationDetailId: alloc?.id || "",
          completedQty: route.completedQty ?? null,
          supplierId: alloc?.supplierId || "",
        },
      ].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      // Auto-fill deliveryQty with last completed seq qty when first item is added
      if (prev.length === 0 && qtyCap !== null) {
        setDeliveryQty(String(qtyCap));
      }

      return updated;
    });
  };

  const handleJobCardChange = (item) => {
    if (!item) return;
    setProductionAllocationId(item.productionAllocationId || "");
    setSelectedProcesses([]);
    setDeliveryQty("");
    setSupplierId("");
  };

  // ── 3-column body ─────────────────────────────────────────────────────────

  const bodyContent = (
    <div className="flex flex-1 min-h-0 gap-0 bg-gray-50 h-full">
      {/* ── Column 1 ── */}
      <div className="w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            Basic Details
          </p>
          <div className="flex gap-2 w-full">
            <TextInput name=" Process Issue No" value={docId} disabled />
            <DateInputNew
              name="Process Issue Date"
              value={docDate}
              setValue={setDocDate}
              disabled
              required
              type="date"
            />
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
            Job Card Details
          </p>
          <div className="flex gap-2">
            <DropdownNew
              name="Job Card No"
              dataList={jobCardList?.data?.filter((item) =>
                item.processRoute?.some(
                  (route) => route.status === "NOT_STARTED",
                ),
              )}
              value={jobCardId}
              setValue={setJobCardId}
              required
              readOnly={readOnly}
              disabled={readOnly}
              otherField="docId"
              beforeChange={handleJobCardChange}
              ref={supplierRef}
            />
            <DropdownNew
              name="Production Allocation No"
              dataList={productionAllocationList?.data}
              value={productionAllocationId}
              setValue={setProductionAllocationId}
              required
              readOnly
              disabled
              otherField="docId"
            />
          </div>
          <div>
            <TextInput
              name="Item Description"
              value={findFromList(
                jobCardId,
                jobCardList?.data,
                "styleItemName",
              )}
              readOnly
              disabled
            />
          </div>
        </div>

        <div className="px-4 py-3 flex-1">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            Remarks
          </p>
          <textarea
            className="w-full h-20 text-xs border border-gray-300 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-gray-50 text-gray-700 placeholder-gray-300"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Additional notes..."
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* ── Column 2: Process Tree ── */}
      <div className="flex-1 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Process Route
            </span>
          </div>
          {selectedProcesses.length > 0 && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {selectedProcesses.length} selected
            </span>
          )}
        </div>
        <ProcessTree
          processRoute={processRoute}
          processList={processList}
          allocationDetails={allocationDetails}
          selectedProcessIds={selectedProcesses.map((s) => s.processId)}
          onToggle={handleToggleProcess}
        />
      </div>

      {/* ── Column 3: Dispatch ── */}
      <div className="w-96 flex-shrink-0 bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-rose-500 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Dispatch Details
            </span>
          </div>
        </div>
        <DeliveryPanel
          selectedProcesses={selectedProcesses}
          processList={processList}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          supplierList={supplierList}
          readOnly={readOnly}
          childRecord={childRecord}
          dcNo={dcNo}
          setDcNo={setDcNo}
          vehicleNo={vehicleNo}
          setVehicleNo={setVehicleNo}
          deliveryQty={deliveryQty}
          setDeliveryQty={setDeliveryQty}
          qtyCap={qtyCap}
        />
      </div>
    </div>
  );

  return (
    <>
      {printModalOpen && (
        <Modal
          isOpen={printModalOpen}
          onClose={() => {
            setPrintModalOpen(false);
            if (pendingAction === "new") {
              setId("");
              setDocId("New");
              syncFormWithDb(undefined);
              setTimeout(() => customerRef.current?.focus(), 100);
            }
            if (pendingAction === "close") onClose();
            setPendingAction(null);
          }}
          widthClass="w-[90%] h-[90%]"
        >
          <PDFViewer className="w-full h-full border-none">
            <DeliveryChallanPrintFormat
              singleData={singleData?.data}
              supplierDetails={supplierList?.data?.find(
                (s) => s.id === supplierId,
              )}
              branchData={branchData?.data}
              processList={processList}
              jobCardList={jobCardList}
              deliveryQty={deliveryQty}
            />
          </PDFViewer>
        </Modal>
      )}
      <TransactionLayout
        title="Process Issue"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={bodyContent}
        footer={
          <div className="flex flex-col md:flex-row gap-2 justify-between">
            <div className="flex gap-2 flex-wrap">
              {!readOnly && (
                <button
                  onClick={() => saveData("close")}
                  disabled={readOnly}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveData("close");
                      e.stopPropagation();
                    }
                  }}
                  className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Save & Close
                </button>
              )}
              {!readOnly && (
                <button
                  onClick={() => saveData("new")}
                  disabled={readOnly}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      saveData("new");
                    }
                  }}
                  className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Save & New
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {!id ||
                (readOnly && (
                  <button
                    className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700 flex items-center text-xs"
                    onClick={() =>
                      hasPermission(() => setReadOnly(false), "edit")
                    }
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ))}
              {id && (
                <button
                  onClick={() => {
                    setPrintModalOpen(true);
                  }}
                  className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 flex items-center text-xs"
                >
                  <FiFileText className="w-4 h-4 mr-2" />
                  PDF Export
                </button>
              )}
            </div>
          </div>
        }
      />
    </>
  );
};

export default ProductionOutwardForm;
