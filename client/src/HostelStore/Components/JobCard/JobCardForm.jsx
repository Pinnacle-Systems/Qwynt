import { IoArrowBackCircleSharp } from "react-icons/io5";
import {
  CheckBoxNew,
  DateInputNew,
  DropdownInput,
  DropdownNew,
  ReusableInput,
  TextInput,
} from "../../../Inputs";
import { blockTypes, productionTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { findFromList, getCommonParams, ModeChip } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiCheck, FiEdit2, FiPrinter, FiSave, FiSend } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
  ColorMaster,
  DieMaster,
  PlateMaster,
  Size,
  StyleItemMaster,
} from "../index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import {
  useAddJobCardMutation,
  useGetJobCardByIdQuery,
  useGetJobCardListQuery,
  useLazyGetJobCardByIdQuery,
  useUpdateJobCardMutation,
} from "../../../redux/uniformService/JobCardService.js";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService.js";
import { useGetProcessGroupMasterQuery } from "../../../redux/services/ProcessGroupMaster.service.js";
import secureLocalStorage from "react-secure-storage";
import Modal from "../../../UiComponents/Modal/index.js";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf.js";
import JobCardPrintFormat from "./JobCardPrintFormat.jsx";
import {
  useGetOrderItemsListQuery,
  useGetRefListQuery,
  useLazyGetOrderEntryByIdQuery,
} from "../../../redux/uniformService/OrderEntryService.js";
import { invalidateOrderEntryModule } from "../../../redux/Dispatch/OrderInvalidateTags.js";
import {
  ProcessRoutePanel,
  routeKeysToDb,
  buildCompletedSet,
} from "./ProcessRoutePanel.jsx";
import { useAddApprovalStausMutation } from "../../../redux/uniformService/PoServices.js";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import TransactionLayout from "../../../Basic/components/Reuseable/TransactionLayout.jsx";
import { QRCodeCanvas } from "qrcode.react";
import {
  CheckBox,
  Field,
  LVHeader,
  LVRow,
  mapBoardQualitiesToRows,
  SectionCard,
  toggleArr,
  toggleLV,
  toggleLVProp,
} from "./Utils.jsx";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { Plus } from "lucide-react";
import { useGetMachineMasterQuery } from "../../../redux/services/MachineMasterService.js";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";
import QRCode from "qrcode";
import { LocationMaster } from "../../../Basic/components/index.js";
import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService.js";
import BoardDetails, { emptyRow } from "./BoardDetails.jsx";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useLazyGetBoardQtyQuery } from "../../../redux/services/StockService.js";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService.js";

const DEFAULT_BOARD_ROWS = 2;

const JobCardForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  customerList,
  gsmList,
  plateList,
  dieList,
  branchData,
  formOrderCustomerId,
  fromOrderId,
  fromOrderType,
  fromOrderQty,
  canApprove,
  userData,
  employeeList,
  hasPermission,
}) => {
  const today = new Date();
  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [customerId, setCustomerId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [orderType, setOrderType] = useState("ORDER");
  const [docId, setDocId] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [otherBoardId, setOtherBoardId] = useState("");
  const [totalPlatesets, setTotalPlatesets] = useState("");
  const [plateId, setPlateId] = useState("");
  const [dieId, setDieId] = useState("");
  const [cuttingSizeId, setCuttingSizeId] = useState("");
  const [splitType, setSplitType] = useState("");
  const [boardItems, setBoardItems] = useState(
    Array.from({ length: DEFAULT_BOARD_ROWS }, emptyRow),
  );

  const [selectedPrinting, setSelectedPrinting] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedFinishing, setSelectedFinishing] = useState([]);
  const [selectedLabelPrinting, setSelectedLabelPrinting] = useState([]);
  const [laminations, setLaminations] = useState([]);
  const [varnishes, setVarnishes] = useState([]);
  const [orderEntryId, setOrderEntryId] = useState("");
  const customerRef = useRef(null);
  const { userId, finYearId, branchId, companyId } = getCommonParams();
  const [pendingAction, setPendingAction] = useState(null);
  const [jobRunTime, setJobRunTime] = useState("");
  const [processRoute, setProcessRoute] = useState([]);
  const [approvalModal, setApprovalModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [productionType, setProductionType] = useState("SAMPLE");
  const [styleItemId, setStyleItemId] = useState("");
  const [tagCardUps, setTagCardUps] = useState("");
  const [itemGroupId, setItemGroupId] = useState("");
  const [itemType, setItemType] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const [designerId, setDesignerId] = useState("");
  const [labelItemId, setLabelItemId] = useState("");
  const [block, setBlock] = useState("NEW");
  const [labelQty, setLabelQty] = useState("");
  const [rollQty, setRollQty] = useState("");
  const [cutAndSeal, setCutAndSeal] = useState("");
  const [jobCardSizeDetails, setJobCardSizeDetails] = useState([]);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [trackingType, setTrackingType] = useState("Barcode");
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [plateModalOpen, setPlateModalOpen] = useState(false);
  const childRecord = useRef(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  const [plateDetails, setPlateDetails] = useState(
    Array.from({ length: 6 }, () => ({ plateName: "", qty: "" })),
  );
  const [labelSizeId, setLabelSizeId] = useState("");
  const [totalMeter, setTotalMeter] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [isRepeatedJobCard, setIsRepeatedJobCard] = useState();
  const [refJobCardId, setRefJobCardId] = useState("");
  const [pendingPrint, setPendingPrint] = useState(false);
  const [isAmendment, setIsAmendment] = useState(false);
  const [storeId, setStoreId] = useState("");
  const qrRef = useRef(null);
  const [runningQty, setRunningQty] = useState("");
  const [stockQty, setStockQty] = useState("");
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const [colorId, setColorId] = useState("");
  const [triggerGetBoardQty] = useLazyGetBoardQtyQuery();

  const { data: processList } = useGetProcessMasterQuery({ params });
  const { data: processGroupList } = useGetProcessGroupMasterQuery({ params });
  const { data: orderList } = useGetRefListQuery({
    params: { companyId, branchId },
  });
  const { data: sizeList } = useGetSizeMasterQuery({
    params: { companyId, branchId },
  });
  const { data: styleList } = useGetStyleItemMasterQuery({
    params: { companyId, branchId },
  });
  const { data: machineList } = useGetMachineMasterQuery({
    params: { companyId, branchId },
  });
  const { data: jobCardList } = useGetJobCardListQuery({
    params: { companyId, branchId },
  });
  const { data: styleItemList } = useGetOrderItemsListQuery({
    params: { orderEntryId },
  });
  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
  });
  const { data: colorData } = useGetColorMasterQuery({
    params: { branchId },
  });

  const getGroupIds = (groupName) =>
    processGroupList?.data
      ?.find((g) => g.name === groupName)
      ?.processGroupList?.map((i) => i.processId) || [];
  const filterByGroup = (groupName) =>
    processList?.data?.filter((p) => getGroupIds(groupName).includes(p.id)) ||
    [];

  const boardList = filterByGroup("BOARD QUALITY");
  const printingList = filterByGroup("PRINTING");
  const defaultList = filterByGroup("DEFAULT");
  const laminationList = filterByGroup("LAMINATION");
  const varnishList = filterByGroup("VARNISH");
  const finishingList = filterByGroup("FINISHING");
  const labelPrintingList = filterByGroup("LABEL PRINTING");

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetJobCardByIdQuery(id, { skip: !id });

  const status = singleData?.data?.approvalStatus?.status;
  const isDisabledPermission =
    (status === "APPROVED" || status === "PENDING") && !canApprove;

  const dbProcessRoute = singleData?.data?.processRoute || [];
  const anyCompleted = dbProcessRoute.some((r) => r.status === "COMPLETED");
  const routeFieldsLocked = anyCompleted && !isAmendment;

  const completedSet = useMemo(
    () => buildCompletedSet(dbProcessRoute),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(dbProcessRoute)],
  );

  const isCompletedInRoute = (type, processIds) => {
    const ids = Array.isArray(processIds) ? processIds : [processIds];
    const routeEntries = dbProcessRoute.filter(
      (r) => r.type === type && ids.includes(r.processId),
    );
    if (routeEntries.length === 0) return false;
    return routeEntries.every((r) => r.status === "COMPLETED");
  };

  const isItemCompleted = (type, itemId) =>
    completedSet.has(`${type}:${itemId}`);

  // ── Derive a plain array of boardIds for ProcessRoutePanel & lock helpers ──
  const boardProcessIds = useMemo(
    () => boardItems?.filter((r) => r.processId).map((r) => r.processId),
    [boardItems],
  );

  const allBoardQualitiesCompleted =
    boardProcessIds.length > 0 &&
    boardProcessIds.every((bid) => isItemCompleted("boardQuality", bid));

  const boardCompleted = isCompletedInRoute("board", otherBoardId);
  const cuttingFieldsLocked = allBoardQualitiesCompleted && boardCompleted;

  const [addData] = useAddJobCardMutation();
  const [updateData] = useUpdateJobCardMutation();
  const [addApprovalStatus] = useAddApprovalStausMutation();
  const [getOrderById] = useLazyGetOrderEntryByIdQuery();
  const [getRefById] = useLazyGetJobCardByIdQuery();

  // ── Sync form from DB data ────────────────────────────────────────────────
  const syncFormWithDb = useCallback((data) => {
    setDocId(data?.docId || "New");
    setDocDate(
      data?.docDate
        ? moment.utc(data.docDate).format("YYYY-MM-DD")
        : moment.utc(new Date()).format("YYYY-MM-DD"),
    );
    setOrderType(data?.orderType || "ORDER");
    setBlockDate(
      data?.blockDate ? moment.utc(data.blockDate).format("YYYY-MM-DD") : "",
    );
    setProductionType(data?.productionType || "SAMPLE");
    setCustomerId(data?.customerId || "");
    setRemarks(data?.remarks || "");
    setOrderQty(data?.orderQty || "");
    setPlateId(data?.plateId || "");
    setDieId(data?.dieId || "");
    setTotalPlatesets(data?.totalPlatesets || "");
    setCuttingSizeId(data?.cuttingSizeId || "");
    setSplitType(data?.splitType || "");
    // Map DB boardQualities → row objects; default to 2 empty rows
    const mappedRows = mapBoardQualitiesToRows(data?.boardQualities);
    setBoardItems([
      ...mappedRows,
      ...Array.from(
        { length: Math.max(0, DEFAULT_BOARD_ROWS - mappedRows.length) },
        emptyRow,
      ),
    ]);

    setSelectedProcesses(data?.processDetails?.map((p) => p.processId) || []);
    setSelectedPrinting(data?.printingDetails?.map((p) => p.processId) || []);
    setSelectedFinishing(
      data?.finishingProcesses?.map((f) => f.processId) || [],
    );
    setSelectedLabelPrinting(
      data?.labelPrintingDetails?.map((p) => p.processId) || [],
    );
    setLaminations(
      data?.laminationDetails?.map((l) => ({
        processId: l.laminationId,
        isFront: l.isFront,
        isFrontAndBack: l.isFrontAndBack,
      })) || [],
    );
    setVarnishes(
      data?.varnishDetails?.map((v) => ({
        processId: v.varnishId,
        isFront: v.isFront,
        isFrontAndBack: v.isFrontAndBack,
      })) || [],
    );
    setSelectedMachines(data?.machineDetails?.map((m) => m.macId) || []);
    setOrderEntryId(data?.orderEntryId || "");
    setOtherBoardId(data?.otherBoardId || "");
    setJobRunTime(data?.jobRunTime || "");
    setProcessRoute(
      data?.processRoute
        ? [...data.processRoute]
            .sort((a, b) => a.sequence - b.sequence)
            .map((r) => {
              const sub = r.isFront
                ? "front"
                : r.isFrontAndBack
                  ? "frontback"
                  : "";
              return `${r.type}:${r.processId}${sub ? `:${sub}` : ""}`;
            })
        : [],
    );
    setStyleItemId(data?.styleItemId || "");
    setTagCardUps(data?.tagCardUps || "");
    setItemGroupId(data?.itemGroupId || "");
    setItemType(data?.itemType || "");
    setFollowUpId(data?.followUpId || "");
    setDesignerId(data?.designerId || "");
    setLabelItemId(data?.labelItemId || "");
    setBlock(data?.block || "NEW");
    setLabelQty(data?.labelQty || "");
    setRollQty(data?.rollQty || "");
    setCutAndSeal(data?.cutAndSeal || "");
    setJobCardSizeDetails(data?.jobCardSizeDetails || []);
    setTrackingType(data?.trackingType || "");
    setOrderItemId(data?.orderItemId || "");
    setLabelSizeId(data?.labelSizeId || "");
    setTotalMeter(data?.totalMeter || "");
    setIsRepeatedJobCard(data?.isRepeatedJobCard || false);
    setStoreId(data?.storeId || "");
    setRefJobCardId(data?.refJobCardId || "");
    setRunningQty(data?.runningQty || "");
    setColorId(data?.colorId || "");
    const rawPlates = data?.plateDetails || [];
    const paddedPlates = [...rawPlates];
    while (paddedPlates.length < 6)
      paddedPlates.push({ plateName: "", qty: "" });
    setPlateDetails(paddedPlates);
    childRecord.current = data?.childRecord ? data?.childRecord : 0;
  }, []);

  useEffect(() => {
    if (id && singleData?.data) syncFormWithDb(singleData.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (pendingPrint && singleData?.data && !isSingleFetching) {
      openPrintModal(singleData.data.id, singleData.data.docId);
      setPendingPrint(false);
    }
  }, [pendingPrint, singleData, isSingleFetching]);

  useEffect(() => {
    const getBoardQty = async () => {
      try {
        if (storeId && colorId && labelItemId && labelSizeId) {
          const response = await triggerGetBoardQty({
            params: {
              storeId: storeId,
              colorId: colorId,
              styleItemId: labelItemId,
              sizeId: labelSizeId,
              isLabel: true,
            },
          }).unwrap();

          setStockQty(response?.stockQty ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch board quantity:", error);
        setStockQty(0);
      }
    };

    getBoardQty();
  }, [storeId, colorId, labelItemId, labelSizeId]);

  // ── formData — boardItems sent as boardDetails (row objects) ─────────────
  const formData = {
    id,
    docDate,
    branchId,
    userId,
    finYearId,
    orderType,
    orderQty,
    customerId,
    boardQualities: boardItems.filter((r) => r.processId),
    otherBoardId,
    remarks,
    plateId,
    dieId,
    totalPlatesets,
    selectedProcesses,
    laminations,
    varnishes,
    selectedMachines,
    orderEntryId,
    jobRunTime,
    processRoute: routeKeysToDb(processRoute),
    productionType,
    styleItemId,
    tagCardUps,
    itemGroupId,
    itemType,
    followUpId,
    designerId,
    labelItemId,
    block,
    labelQty,
    rollQty,
    cutAndSeal,
    jobCardSizeDetails,
    trackingType,
    orderItemId,
    selectedPrinting,
    plateDetails: plateDetails?.filter(
      (plate) => plate?.plateName && plate?.qty,
    ),
    labelSizeId,
    totalMeter,
    selectedFinishing,
    blockDate,
    isRepeatedJobCard,
    refJobCardId,
    isAmendment,
    storeId,
    cuttingSizeId,
    splitType,
    runningQty,
    selectedLabelPrinting,
    colorId,
  };

  const openPrintModal = async (overrideId, overrideDocId) => {
    const printId = overrideId ?? id;
    const printDocId = overrideDocId ?? docId;
    try {
      const dataUrl = await QRCode.toDataURL(
        JSON.stringify({ id: printId, docId: printDocId }),
        { width: 120, margin: 1, errorCorrectionLevel: "H" },
      );
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("QR gen failed", err);
      setQrCodeDataUrl("");
    }
    setPrintModalOpen(true);
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const returnData = await callback(data).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
        return;
      }
      Swal.fire({
        icon: "success",
        title: `${text || "Saved"} Successfully`,
        showConfirmButton: false,
        timer: 2000,
        didClose: () => {
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
                  if (returnData?.data?.id) setId(returnData.data.id);
                  setPendingPrint(true);
                } else {
                  if (nextProcess === "new") {
                    syncFormWithDb(undefined);
                    setId("");
                    setDocId("New");
                    setTimeout(() => customerRef.current?.focus(), 300);
                  }
                  if (nextProcess === "close") onClose();
                }
              });
            } else {
              if (nextProcess === "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setTimeout(() => customerRef.current?.focus(), 100);
              }
              if (nextProcess === "close") onClose();
            }
          } else {
            toast.error(returnData?.message);
          }
        },
      });
      invalidateOrderEntryModule();
    } catch (error) {
      console.error("submit error", error);
    }
  };

  const isLabel = itemType === "LABEL";

  const validateData = (d) => {
    const checks = [
      { condition: !d.docDate, title: "Document Date is required!" },
      { condition: !d.customerId, title: "Customer is required!" },
      { condition: !d.orderEntryId, title: "Order No is required!" },
      { condition: !d.productionType, title: "Production Type is required!" },
      { condition: !d.styleItemId, title: "Item Description is required!" },
      { condition: !d.orderQty, title: "Order Quantity is required!" },
      { condition: !d.followUpId, title: "Follow-Up is required!" },
      { condition: !d.designerId, title: "Designer is required!" },
      { condition: !d.storeId, title: "Location is required!" },
      {
        condition: d.isRepeatedJobCard && !d.refJobCardId,
        title: "Reference Job Card is required!",
      },
      {
        condition: !isLabel && d.boardQualities?.length === 0,
        title: "Select Board Quality!",
      },
      {
        condition:
          !isLabel &&
          d.boardQualities?.filter((r) => r.processId)?.some((r) => !r.gsmId),
        title: "Select GSM!",
      },
      {
        condition:
          !isLabel &&
          d.boardQualities
            ?.filter((r) => r.processId)
            ?.some((r) => !r.fullBoardId),
        title: "Select Full Board!",
      },
      {
        condition:
          !isLabel &&
          d.boardQualities
            ?.filter((r) => r.processId)
            ?.some((r) => !r.noOfSheets),
        title: "Enter No of Sheets!",
      },
      {
        condition: !isLabel && !d.cuttingSizeId,
        title: "Enter Cutting Size!",
      },
      {
        condition: !isLabel && !d.runningQty,
        title: "Enter Running Quantity!",
      },
      {
        condition: isLabel && !d.labelItemId,
        title: "Select Label Item!",
      },
      {
        condition: isLabel && !d.labelSizeId,
        title: "Select Label Size!",
      },
      {
        condition: isLabel && !d.colorId,
        title: "Select Label Color!",
      },
      {
        condition: isLabel && !d.rollQty,
        title: "Enter Roll Quantity!",
      },
      {
        condition: isLabel && !d.block,
        title: "Enter Block!",
      },
      {
        condition: isLabel && d.selectedLabelPrinting?.length === 0,
        title: "Select Printing Process!",
      },
      {
        condition: isLabel && d.selectedFinishing?.length === 0,
        title: "Select Finishing Process!",
      },
    ];
    const failed = checks.find((c) => c.condition);
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: failed.title,
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    const duplicateBoard = d.boardQualities?.some((item, index, arr) => {
      const key = `${item.processId || 0}-${item.gsmd || 0}-${item.fullBoardId || 0}`;

      return (
        arr.findIndex(
          (r) =>
            `${r.processId || 0}-${r.GSMId || 0}-${r.fullBoardId || 0}` === key,
        ) !== index
      );
    });

    if (duplicateBoard) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Board Quality is not allowed!",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    return true;
  };

  const saveData = (nextProcess, options = {}) => {
    const submitApprovalFlag = !!options.submitApproval;
    if (!validateData(formData)) return;
    if (id && !window.confirm("Are you sure you want to update the details?"))
      return;
    const payload = {
      ...formData,
      ...(submitApprovalFlag ? { submitApproval: true } : {}),
    };
    if (id) handleSubmitCustom(updateData, payload, "Updated", nextProcess);
    else handleSubmitCustom(addData, payload, "Added", nextProcess);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (formOrderCustomerId && fromOrderId && fromOrderType && !id) {
      setCustomerId(formOrderCustomerId);
      setOrderEntryId(fromOrderId);
      setOrderType(fromOrderType);
      setOrderQty(fromOrderQty);
    }
  }, [formOrderCustomerId, fromOrderId, fromOrderType, fromOrderQty]);

  const handleApprovalAction = (type) => {
    setActionType(type);
    setApprovalRemarks("");
    setApprovalModal(true);
  };

  const handleConfirmAction = async () => {
    if (actionType === "REJECT" && !approvalRemarks.trim()) {
      toast.warning("Remarks required for sending back!");
      return;
    }
    setActionLoading(true);
    try {
      const result = await addApprovalStatus({
        userId: userData?.id,
        remarks: approvalRemarks || null,
        actionType,
        referenceId: id,
        referencePage: "JOB CARD",
        recordData: {},
      }).unwrap();
      if (result.statusCode === 0) {
        toast.success(
          result.message ||
            (actionType === "APPROVE"
              ? "Job Card Approved!"
              : "Sent Back for Review!"),
        );
        setApprovalModal(false);
        onClose();
        invalidateJobCardModule();
      } else {
        toast.error(result.message || "Action failed");
        setApprovalModal(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
      setApprovalModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobCardChange = async (value) => {
    if (!value.id) return;
    try {
      const result = await getRefById(value?.id || value).unwrap();
      const data = result?.data;
      if (!data) return;
      setOtherBoardId(data?.otherBoardId || "");
      setPlateId(data?.plateId || "");
      setDieId(data?.dieId || "");
      setTotalPlatesets(data?.totalPlatesets || "");
      const mappedRows = mapBoardQualitiesToRows(data?.boardQualities);
      setBoardItems(
        mappedRows.length > 0
          ? mappedRows
          : Array.from({ length: DEFAULT_BOARD_ROWS }, emptyRow),
      );

      setSelectedProcesses(data?.processDetails?.map((p) => p.processId) || []);
      setSelectedPrinting(data?.printingDetails?.map((p) => p.processId) || []);
      setSelectedFinishing(
        data?.finishingProcesses?.map((f) => f.processId) || [],
      );
      setSelectedLabelPrinting(
        data?.labelPrintingDetails?.map((p) => p.processId) || [],
      );
      setLaminations(
        data?.laminationDetails?.map((l) => ({
          processId: l.laminationId,
          isFront: l.isFront,
          isFrontAndBack: l.isFrontAndBack,
        })) || [],
      );
      setVarnishes(
        data?.varnishDetails?.map((v) => ({
          processId: v.varnishId,
          isFront: v.isFront,
          isFrontAndBack: v.isFrontAndBack,
        })) || [],
      );
      setSelectedMachines(data?.machineDetails?.map((m) => m.macId) || []);
      setJobRunTime(data?.jobRunTime || "");
      setTagCardUps(data?.tagCardUps || "");
      setProcessRoute(
        data?.processRoute
          ? [...data.processRoute]
              .sort((a, b) => a.sequence - b.sequence)
              .map((r) => {
                const sub = r.isFront
                  ? "front"
                  : r.isFrontAndBack
                    ? "frontback"
                    : "";
                return `${r.type}:${r.processId}${sub ? `:${sub}` : ""}`;
              })
          : [],
      );
      setLabelItemId(data?.labelItemId || "");
      setBlock(data?.block || "NEW");
      setBlockDate(
        data?.blockDate ? moment.utc(data.blockDate).format("YYYY-MM-DD") : "",
      );
      setLabelQty(data?.labelQty || "");
      setRollQty(data?.rollQty || "");
      setCutAndSeal(data?.cutAndSeal || "");
      setLabelSizeId(data?.labelSizeId || "");
      setTotalMeter(data?.totalMeter || "");
      setItemGroupId(data?.itemGroupId || "");
      setItemType(data?.itemType || "");
      setJobCardSizeDetails(
        data?.jobCardSizeDetails?.map((s) => ({
          sizeId: s.sizeId || "",
          qty: s.qty || "",
          barcodeFrom: s.barcodeFrom || "",
          barcodeTo: s.barcodeTo || "",
        })) || [],
      );
      const rawPlates = data?.plateDetails || [];
      const paddedPlates = [...rawPlates];
      while (paddedPlates.length < 6)
        paddedPlates.push({ plateName: "", qty: "" });
      setPlateDetails(paddedPlates);
      setIsAmendment(data?.isAmendment || false);
      setColorId(data?.colorId || "");
    } catch (err) {
      console.error("Failed to load ref job card", err);
    }
  };

  // ── Completion-lock helpers ───────────────────────────────────────────────
  const isBoardQualityLocked = (boardItemId) =>
    isItemCompleted("boardQuality", boardItemId) || routeFieldsLocked;

  const isBoardLocked = otherBoardId
    ? isItemCompleted("board", otherBoardId) || routeFieldsLocked
    : routeFieldsLocked;

  const isCuttingLocked =
    routeFieldsLocked ||
    (boardProcessIds.length > 0 &&
      boardProcessIds.every((bid) => isItemCompleted("boardQuality", bid)));

  const isPrintingItemLocked = (printId) =>
    isItemCompleted("printing", printId) || routeFieldsLocked;
  const isProcessItemLocked = (procId) =>
    isItemCompleted("process", procId) || routeFieldsLocked;
  const isLaminationItemLocked = (laminationProcId) =>
    isItemCompleted("lamination", laminationProcId) || routeFieldsLocked;
  const isVarnishItemLocked = (varnishProcId) =>
    isItemCompleted("varnish", varnishProcId) || routeFieldsLocked;
  const isFinishingItemLocked = (finId) =>
    isItemCompleted("finishing", finId) || routeFieldsLocked;

  // ── HEADER ────────────────────────────────────────────────────────────────
  const headerContent = (
    <div className="flex flex-col xl:flex-row gap-1">
      <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
          Basic Details
        </h2>
        <div className="flex gap-x-1">
          <div className="w-32">
            <ReusableInput label="Job Card No" readOnly value={docId} />
          </div>
          <div className="w-28">
            <ReusableInput
              label="Job Card Date"
              value={docDate}
              type="date"
              readOnly
              disabled
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <div className="mt-5 mr-2">
            <CheckBoxNew
              name="Is Repeated"
              readOnly={readOnly}
              value={isRepeatedJobCard}
              setValue={setIsRepeatedJobCard}
              disabled={readOnly || childRecord.current > 0}
              className="text-[11px] font-medium"
            />
          </div>
          {isRepeatedJobCard && (
            <div className="w-36 mt-2">
              <DropdownNew
                name="Job Card No"
                dataList={jobCardList?.data}
                value={refJobCardId}
                setValue={setRefJobCardId}
                required
                readOnly={readOnly}
                disabled={readOnly || childRecord.current > 0}
                otherField={"docId"}
                beforeChange={handleJobCardChange}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
          Customer Details
        </h2>
        <div className="w-72 px-1">
          <DropdownNew
            name="Customer"
            dataList={
              id
                ? customerList?.data?.filter((i) => i?.isCustomer)
                : customerList?.data?.filter((i) => i?.active && i?.isCustomer)
            }
            value={customerId}
            setValue={setCustomerId}
            required
            readOnly={readOnly}
            disabled={readOnly || childRecord.current > 0}
            ref={customerRef}
          />
        </div>
      </div>

      <div className="flex-1 border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
          Order Details
        </h2>
        <div className="flex gap-2 px-1">
          <div className="w-44">
            <DropdownNew
              name="Order No"
              dataList={orderList?.data?.filter(
                (item) =>
                  ["APPROVED", "NOT_CONFIGURED"].includes(
                    item?.approvalStatus?.status,
                  ) &&
                  item?.customerId === customerId &&
                  (id || item?.creationStatus !== "FULLY_CREATED"),
              )}
              value={orderEntryId}
              setValue={setOrderEntryId}
              required
              readOnly={readOnly}
              disabled={readOnly || childRecord.current > 0}
              otherField={"docId"}
              beforeChange={async (selectedValue) => {
                if (isRepeatedJobCard && refJobCardId) {
                  const res = await getOrderById(selectedValue?.id).unwrap();
                  setSelectedOrderData(res?.data);
                  return;
                }
                if (!selectedValue) {
                  setProductionType("SAMPLE");
                  setStyleItemId("");
                  setOrderQty("");
                  setTagCardUps("");
                  setJobRunTime("");
                  setSelectedOrderData(null);
                  setJobCardSizeDetails([]);
                  return;
                }
                const res = await getOrderById(selectedValue?.id).unwrap();
                setSelectedOrderData(res?.data);
                setItemGroupId("");
                setItemType("");
                setStyleItemId("");
                setOrderQty("");
                setJobCardSizeDetails([]);
                setBoardItems(
                  Array.from({ length: DEFAULT_BOARD_ROWS }, emptyRow),
                );
                setOtherBoardId("");
                setSelectedPrinting([]);
                setSelectedProcesses([]);
                setSelectedMachines([]);
                setLaminations([]);
                setPlateDetails([]);
                setVarnishes([]);
                setProductionType(res?.data?.productionType);
              }}
            />
          </div>
          <div className="w-64">
            <DropdownNew
              name="Item Description"
              dataList={styleItemList?.data?.filter((item) =>
                id ? true : item.childRecord === 0,
              )}
              value={styleItemId}
              setValue={setStyleItemId}
              required
              disabled={readOnly || childRecord.current > 0}
              beforeChange={(selectedValue) => {
                if (isRepeatedJobCard && refJobCardId) {
                  const selectedOrderItem = selectedOrderData?.orderItems?.find(
                    (item) => item.styleItemId === selectedValue?.id,
                  );
                  setOrderQty(selectedOrderItem?.orderQty || "");
                  return;
                }
                setItemGroupId(selectedValue?.itemGroupId);
                setItemType(selectedValue?.itemGroupName);
                const selectedOrderItem = selectedOrderData?.orderItems?.find(
                  (item) => item.styleItemId === selectedValue?.id,
                );
                setOrderQty(selectedOrderItem?.orderQty || "");
                setTrackingType(selectedOrderItem?.trackingType || "");
                setOrderItemId(selectedOrderItem?.id);
                setJobCardSizeDetails(
                  selectedOrderItem?.sizeBreakup?.map((s) => ({
                    sizeId: s.sizeId || "",
                    qty: s.qty || "",
                    barcodeFrom: s.barcodeFrom || "",
                    barcodeTo: s.barcodeTo || "",
                  })) || [],
                );
                setBoardItems(
                  Array.from({ length: DEFAULT_BOARD_ROWS }, emptyRow),
                );
                setSelectedProcesses([]);
                setSelectedMachines([]);
                setLaminations([]);
                setVarnishes([]);
                setSelectedPrinting([]);
                setPlateDetails([]);
                setOtherBoardId("");
                setSelectedFinishing([]);
                setSelectedLabelPrinting([]);
              }}
            />
          </div>
          {itemType !== "LABEL" && (
            <div className="w-20">
              <TextInput
                name="Order Qty"
                value={orderQty}
                setValue={setOrderQty}
                readOnly={true}
                required
                type="number"
                className="text-right w-full"
                onFocus={(e) => e.target.select()}
                onBlur={(e) =>
                  setOrderQty(
                    e.target.value ? Number(e.target.value).toFixed(3) : "",
                  )
                }
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <div className="w-28">
            <DropdownInput
              name="Production Type"
              options={productionTypes}
              value={productionType}
              setValue={setProductionType}
              required
              readOnly={true}
              disabled={readOnly}
            />
          </div>
          <div className="w-40">
            <DropdownNew
              name="Follow Up"
              dataList={
                id
                  ? employeeList?.data
                  : employeeList?.data?.filter((i) => i?.active)
              }
              value={followUpId}
              setValue={setFollowUpId}
              required
              readOnly={readOnly}
              disabled={isDisabledPermission || readOnly}
            />
          </div>
          <div className="w-40">
            <DropdownNew
              name="Designer"
              dataList={
                id
                  ? employeeList?.data
                  : employeeList?.data?.filter((i) => i?.active)
              }
              value={designerId}
              setValue={setDesignerId}
              required
              readOnly={readOnly}
              disabled={isDisabledPermission || readOnly}
            />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
          Other Details
        </h2>
        <div className="flex gap-2 flex-wrap px-1">
          <div className="w-28">
            <TextInput
              name="Tag/Card Ups"
              value={tagCardUps}
              setValue={setTagCardUps}
              readOnly={readOnly}
              className="w-full text-right"
              onFocus={(e) => e.target.select()}
              disabled={isDisabledPermission}
            />
          </div>
          <div className="w-28">
            <TextInput
              name="Job Run Time (Hours)"
              value={jobRunTime}
              setValue={setJobRunTime}
              readOnly={readOnly}
              className="w-full text-right"
              type="number"
              onFocus={(e) => e.target.select()}
              disabled={isDisabledPermission}
            />
          </div>
        </div>
        <DropdownWithModal
          name="Location"
          options={dropDownListObject(
            id
              ? locationData?.data
              : locationData?.data?.filter((item) => item?.active),
            "storeName",
            "id",
          )}
          value={storeId}
          setValue={setStoreId}
          required={true}
          readOnly={readOnly}
          className="w-[150px]"
          addNewLabel="+ Add New Location"
          childComponent={LocationMaster}
          addNewModalWidth="w-[40%] h-[48%]"
          disabled={isDisabledPermission || isCuttingLocked}
        />
      </div>

      <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
        <h2 className="text-xs font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
          QR Code
        </h2>
        {docId && docId !== "New" ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-slate-200 rounded bg-white">
              <QRCodeCanvas
                value={JSON.stringify({ id, docId })}
                size={80}
                className="border border-slate-200 rounded"
                level="H"
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1 tracking-tight">
                {docId}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mt-2 w-28">
            <div className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded bg-white text-slate-400 text-[10px] font-medium text-center leading-tight">
              <span>
                QR appears
                <br />
                after save
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── GRID ──────────────────────────────────────────────────────────────────
  const gridItemsContent = (
    <div className="h-full overflow-auto">
      {itemType !== "LABEL" && (
        <div className="grid grid-cols-4 gap-x-2 items-start w-full">
          {/* COL span-2: Board + Printing + Plate */}
          <div className="flex flex-col gap-2 col-span-2">
            <SectionCard title="Board & Cutting Details" overflow={false}>
              <BoardDetails
                boardItems={boardItems}
                setBoardItems={setBoardItems}
                boardList={boardList}
                gsmList={gsmList}
                sizeList={sizeList}
                readOnly={readOnly}
                id={id}
                isDisabledPermission={isDisabledPermission}
                isCuttingLocked={isCuttingLocked}
                childRecord={childRecord}
                storeId={storeId}
              />
              <div className="grid grid-cols-4 gap-x-4 mt-5">
                <Field label="Cutting Size">
                  <DropdownWithModal
                    name=""
                    options={dropDownListObject(
                      id
                        ? sizeList?.data
                        : sizeList?.data?.filter((i) => i?.active),
                      "name",
                      "id",
                    )}
                    value={cuttingSizeId}
                    setValue={setCuttingSizeId}
                    readOnly={readOnly}
                    addNewLabel="+ Add Size"
                    childComponent={Size}
                    addNewModalWidth="w-[30%] h-[45%]"
                    disabled={isDisabledPermission || isCuttingLocked}
                    required={true}
                  />
                </Field>
                <Field label="Split Type">
                  <TextInput
                    name=""
                    value={splitType}
                    setValue={setSplitType}
                    readOnly={readOnly}
                    className="w-full text-right"
                    disabled={isDisabledPermission || isCuttingLocked}
                  />
                </Field>
                <Field label="Running Qty" required={true}>
                  <TextInput
                    name=""
                    value={runningQty}
                    setValue={setRunningQty}
                    readOnly={readOnly}
                    type="number"
                    className="w-full text-right"
                    disabled={isDisabledPermission || isCuttingLocked}
                    required={true}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Printing Details">
              <div className="grid grid-cols-4">
                {printingList?.map((item) => (
                  <CheckBox
                    key={item.id}
                    name={item.name}
                    value={selectedPrinting.includes(item.id)}
                    setValue={() => toggleArr(setSelectedPrinting, item.id)}
                    readOnly={readOnly}
                    disabled={
                      isDisabledPermission || isPrintingItemLocked(item.id)
                    }
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Plate & Die Details">
              <div className="grid grid-cols-5 gap-x-3 items-center">
                <Field label="Plate Details">
                  <DropdownWithModal
                    name=""
                    options={dropDownListObject(
                      id
                        ? plateList?.data
                        : plateList?.data?.filter((i) => i?.active),
                      "name",
                      "id",
                    )}
                    value={plateId}
                    setValue={setPlateId}
                    readOnly={readOnly}
                    addNewLabel="+ Add Plate"
                    childComponent={PlateMaster}
                    addNewModalWidth="w-[30%] h-[45%]"
                    disabled={isDisabledPermission}
                  />
                </Field>
                <Field label="Die Details">
                  <DropdownWithModal
                    name=""
                    options={dropDownListObject(
                      id
                        ? dieList?.data
                        : dieList?.data?.filter((i) => i?.active),
                      "name",
                      "id",
                    )}
                    value={dieId}
                    setValue={setDieId}
                    readOnly={readOnly}
                    addNewLabel="+ Add Die"
                    childComponent={DieMaster}
                    addNewModalWidth="w-[30%] h-[45%]"
                    disabled={isDisabledPermission}
                  />
                </Field>
                <Field label="Total Plate Sets">
                  <TextInput
                    name=""
                    value={totalPlatesets}
                    setValue={setTotalPlatesets}
                    type="number"
                    readOnly={readOnly}
                    className="w-full text-right"
                    disabled={isDisabledPermission}
                  />
                </Field>
                <div className="justify-center items-center ml-4">
                  <button
                    onClick={() => setPlateModalOpen(true)}
                    className="border flex justify-center gap-1 items-center w-auto rounded-md text-[10px] bg-green-700 font-semibold uppercase tracking-wider text-white p-1"
                  >
                    View Plate Details
                  </button>
                </div>
                <div className="justify-center items-center">
                  <button
                    onClick={() => setSizeModalOpen(true)}
                    className="border w-auto rounded-md text-[10px] bg-blue-700 font-semibold uppercase tracking-wider text-white p-1"
                  >
                    View Size Details
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* COL 3: Process + Lamination */}
          <div className="flex flex-col gap-2">
            <SectionCard title="Process Details">
              <div className="grid grid-cols-2 gap-y-4 min-h-[165px]">
                {defaultList?.map((item) => (
                  <CheckBox
                    key={item.id}
                    name={item.name}
                    value={selectedProcesses.includes(item.id)}
                    setValue={() => toggleArr(setSelectedProcesses, item.id)}
                    readOnly={readOnly}
                    disabled={
                      isDisabledPermission || isProcessItemLocked(item.id)
                    }
                  />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Lamination Details">
              {laminationList?.length > 0 ? (
                <>
                  <LVHeader />
                  {laminationList.map((item) => {
                    const sel = laminations.find(
                      (l) => l.processId === item.id,
                    );
                    return (
                      <LVRow
                        key={item.id}
                        item={item}
                        selected={sel}
                        onMain={() => toggleLV(setLaminations, item.id)}
                        onFront={() =>
                          toggleLVProp(setLaminations, item.id, "isFront")
                        }
                        onFrontBack={() =>
                          toggleLVProp(
                            setLaminations,
                            item.id,
                            "isFrontAndBack",
                          )
                        }
                        readOnly={
                          readOnly ||
                          isDisabledPermission ||
                          isLaminationItemLocked(item.id)
                        }
                      />
                    );
                  })}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No lamination options configured.
                </p>
              )}
            </SectionCard>
          </div>

          {/* COL 4: Varnish + Machines */}
          <div className="flex flex-col gap-2">
            <SectionCard title="Varnish Details">
              {varnishList?.length > 0 ? (
                <>
                  <LVHeader />
                  {varnishList.map((item) => {
                    const sel = varnishes.find((v) => v.processId === item.id);
                    return (
                      <LVRow
                        key={item.id}
                        item={item}
                        selected={sel}
                        onMain={() => toggleLV(setVarnishes, item.id)}
                        onFront={() =>
                          toggleLVProp(setVarnishes, item.id, "isFront")
                        }
                        onFrontBack={() =>
                          toggleLVProp(setVarnishes, item.id, "isFrontAndBack")
                        }
                        readOnly={
                          readOnly ||
                          isDisabledPermission ||
                          isVarnishItemLocked(item.id)
                        }
                      />
                    );
                  })}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No varnish options configured.
                </p>
              )}
            </SectionCard>
            <SectionCard title="Machines">
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 min-h-[132px]">
                {machineList?.data
                  ?.filter((item) => (id ? true : item.active))
                  .map((item) => (
                    <CheckBox
                      key={item.id}
                      name={`${item.name}${item.Size?.name ? ` (${item.Size.name})` : ""}`}
                      value={selectedMachines.includes(item.id)}
                      setValue={() => toggleArr(setSelectedMachines, item.id)}
                      readOnly={readOnly}
                      disabled={isDisabledPermission}
                    />
                  ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {itemType === "LABEL" && (
        <div className="grid grid-cols-3 items-start gap-x-2 w-full h-full">
          <div className="h-full">
            <SectionCard title="Label Details" className=" h-full">
              <div className="flex gap-16">
                <div className="grid grid-cols-3 gap-y-2 gap-x-2 h-full">
                  <div>
                    <TextInput
                      name="Order Qty"
                      value={orderQty}
                      setValue={setOrderQty}
                      readOnly={true}
                      type="number"
                      className="w-full text-right"
                      disabled={isDisabledPermission}
                    />
                  </div>

                  <div>
                    <DropdownWithModal
                      name="Label Quality"
                      options={dropDownListObject(
                        id
                          ? styleList?.data
                          : styleList?.data?.filter(
                              (item) =>
                                item.active && item.ItemGroup.name === "LABEL",
                            ),
                        "name",
                        "id",
                      )}
                      value={labelItemId}
                      setValue={setLabelItemId}
                      readOnly={readOnly}
                      addNewLabel="+ Add Label"
                      childComponent={StyleItemMaster}
                      addNewModalWidth="w-[50%] h-[60%]"
                      disabled={isDisabledPermission}
                      required={true}
                    />
                  </div>
                  <div>
                    <DropdownWithModal
                      name="Label Size"
                      options={dropDownListObject(
                        id
                          ? sizeList?.data
                          : sizeList?.data?.filter((i) => i?.active),
                        "name",
                        "id",
                      )}
                      value={labelSizeId}
                      setValue={setLabelSizeId}
                      readOnly={readOnly}
                      addNewLabel="+ Add Size"
                      childComponent={Size}
                      addNewModalWidth="w-[30%] h-[45%]"
                      disabled={isDisabledPermission}
                      required={true}
                    />
                  </div>
                  <div>
                    <DropdownWithModal
                      name="Label Color"
                      options={dropDownListObject(
                        id
                          ? colorData?.data
                          : colorData?.data?.filter((i) => i?.active),
                        "name",
                        "id",
                      )}
                      value={colorId}
                      setValue={setColorId}
                      readOnly={readOnly}
                      addNewLabel="+ Add Color"
                      childComponent={ColorMaster}
                      addNewModalWidth="w-[30%] h-[45%]"
                      disabled={isDisabledPermission}
                      required={true}
                    />
                  </div>
                  <div>
                    <TextInput
                      name="Stock Qty(Roll)"
                      value={stockQty}
                      setValue={setStockQty}
                      readOnly={true}
                      type="number"
                      className="w-full text-right"
                      disabled={isDisabledPermission}
                    />
                  </div>
                  <div>
                    <TextInput
                      name="Roll Qty"
                      value={rollQty}
                      setValue={setRollQty}
                      readOnly={readOnly}
                      max={stockQty}
                      type="number"
                      className="w-full text-right"
                      disabled={isDisabledPermission}
                      required={true}
                    />
                  </div>
                  <div>
                    <TextInput
                      name="Total Meter"
                      value={totalMeter}
                      setValue={setTotalMeter}
                      readOnly={readOnly}
                      type="number"
                      className="w-full text-right"
                      disabled={isDisabledPermission}
                    />
                  </div>
                  <div>
                    <DropdownInput
                      name="Block"
                      options={blockTypes}
                      value={block}
                      setValue={(value) => setBlock(value)}
                      required={true}
                      readOnly={readOnly}
                      disabled={
                        childRecord.current > 0 ||
                        readOnly ||
                        isDisabledPermission
                      }
                      beforeChange={() => setBlockDate(null)}
                    />
                  </div>
                  {block === "OLD" && (
                    <div>
                      <DateInputNew
                        name="Block Date"
                        value={blockDate}
                        setValue={setBlockDate}
                        disabled={readOnly || isDisabledPermission}
                        required={false}
                        type="date"
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
          <div className="flex flex-col gap-y-2 h-full">
            <SectionCard title="Printing Details" className="h-full">
              <div className="grid grid-cols-2 gap-y-4 h-auto">
                {labelPrintingList?.map((item) => (
                  <CheckBox
                    key={item.id}
                    name={item.name}
                    value={selectedLabelPrinting.includes(item.id)}
                    setValue={() =>
                      toggleArr(setSelectedLabelPrinting, item.id)
                    }
                    readOnly={readOnly}
                    disabled={
                      isDisabledPermission || isFinishingItemLocked(item.id)
                    }
                  />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Finishing Details" className="h-full">
              <div className="grid grid-cols-3 h-full">
                {finishingList?.map((item) => (
                  <CheckBox
                    key={item.id}
                    name={item.name}
                    value={selectedFinishing.includes(item.id)}
                    setValue={() => toggleArr(setSelectedFinishing, item.id)}
                    readOnly={readOnly}
                    disabled={
                      isDisabledPermission || isFinishingItemLocked(item.id)
                    }
                  />
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="flex h-full w-full">
            <SectionCard title="Size Wise Qty Details" className="w-full">
              <div className="bg-white px-4 py-1 shadow-sm overflow-y-auto w-full">
                <table className=" border-separate border-spacing-0 border-t border-l border-slate-200">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase w-6">
                        S.No
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-48 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                        Size
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-20 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobCardSizeDetails?.map((item, idx) => (
                      <tr
                        key={idx}
                        className="h-8 hover:bg-slate-50 transition-colors"
                      >
                        <td className="border-b border-r border-slate-200 px-1 py-0 text-center text-[11px] text-black">
                          {idx + 1}
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-0 text-[11px] text-black">
                          {sizeList?.data?.find((s) => s.id === item.sizeId)
                            ?.name || "All Items"}
                        </td>
                        <td className="border-b border-r border-slate-200 px-1 py-0">
                          <input
                            type="number"
                            className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                            value={item.qty}
                            disabled
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!jobCardSizeDetails || jobCardSizeDetails.length === 0) && (
                  <div className="text-center p-8 text-slate-400 text-sm font-medium italic">
                    No items found for this tracking mode.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerContent = (
    <>
      <div className="flex gap-2">
        <div className="w-3/4">
          <ProcessRoutePanel
            selectedProcesses={selectedProcesses}
            laminations={laminations}
            varnishes={varnishes}
            defaultList={defaultList}
            laminationList={laminationList}
            varnishList={varnishList}
            processRoute={processRoute}
            setProcessRoute={setProcessRoute}
            readOnly={readOnly}
            boardItems={boardProcessIds}
            otherBoardId={otherBoardId}
            printingList={printingList}
            boardList={boardList}
            selectedPrinting={selectedPrinting}
            selectedFinishing={selectedFinishing}
            selectedLabelPrinting={selectedLabelPrinting}
            labelPrintingList={labelPrintingList}
            finishingList={finishingList}
            isAmendment={isAmendment}
            setIsAmendment={setIsAmendment}
            dbProcessRoute={dbProcessRoute}
          />
        </div>
        <div className="border border-slate-200 p-1 bg-white rounded-md shadow-sm w-1/4">
          <h2 className="font-medium text-indigo-600 text-[11px]">REMARKS</h2>
          <textarea
            readOnly={readOnly}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isDisabledPermission}
            className="w-full h-11 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="Additional Remarks..."
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                const textarea = e.target;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue =
                  remarks.substring(0, start) + "\n" + remarks.substring(end);
                setRemarks(newValue);
                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 1, start + 1);
                });
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2 flex-wrap">
          {!readOnly && (
            <button
              onClick={() => saveData("close")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveData("close");
                }
              }}
              disabled={readOnly || isDisabledPermission}
              className="bg-indigo-500 disabled:opacity-50 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center gap-1.5 text-xs font-medium"
            >
              <HiOutlineRefresh className="w-3.5 h-3.5" /> Save & Close
            </button>
          )}
          {!readOnly && (
            <button
              onClick={() => saveData("new")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveData("new");
                }
              }}
              disabled={readOnly || isDisabledPermission}
              className="bg-indigo-500 disabled:opacity-50 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center gap-1.5 text-xs font-medium"
            >
              <FiSave className="w-3.5 h-3.5" /> Save & New
            </button>
          )}
          {status === "REJECTED" && (
            <button
              onClick={() => saveData("close", { submitApproval: true })}
              disabled={readOnly}
              title="Submit Approval"
              className="bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 flex items-center text-xs"
            >
              <FiSend className="w-4 h-4" />
            </button>
          )}
          {id && status === "PENDING" && canApprove && (
            <button
              onClick={() => handleApprovalAction("REJECT")}
              disabled={readOnly}
              title="Send Back for Review"
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center text-xs"
            >
              <MdKeyboardDoubleArrowLeft className="w-4 h-4" />
            </button>
          )}
          {id && status === "PENDING" && canApprove && (
            <button
              onClick={() => handleApprovalAction("APPROVE")}
              disabled={readOnly}
              title="Approve"
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center text-xs"
            >
              <FiCheck className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {id && readOnly && (
            <button
              disabled={status === "PENDING" && !canApprove}
              onClick={() => hasPermission(() => setReadOnly(false), "edit")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  hasPermission(() => setReadOnly(false), "edit");
                }
              }}
              className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 flex items-center gap-1.5 text-xs font-medium"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          <button
            onClick={() => openPrintModal()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                openPrintModal();
              }
            }}
            className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 flex items-center text-xs"
          >
            <FiPrinter className="w-4 h-4 mr-2" /> Print
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Plate Set Modal */}
      <Modal
        isOpen={plateModalOpen}
        onClose={() => setPlateModalOpen(false)}
        widthClass="w-[500px]"
      >
        <div className="bg-slate-100 p-3 rounded-lg">
          <div className="bg-white p-3 rounded-lg flex justify-between items-center mb-3 shadow-sm">
            <h3 className="text-[16px] font-bold text-slate-800">
              Plate Set Details
            </h3>
            <button
              className="bg-white text-indigo-600 border border-indigo-600 px-4 py-0.5 rounded text-[12px] hover:bg-indigo-50 font-semibold"
              onClick={() => setPlateModalOpen(false)}
            >
              Done
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="h-[220px] overflow-y-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 h-7">
                    <th className="border border-gray-300 px-1 py-1 text-center w-8">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-1 py-1 text-left">
                      Plate Name
                    </th>
                    <th className="border border-gray-300 px-1 py-1 text-center w-16">
                      Qty
                    </th>
                    {!readOnly && (
                      <th className="border border-gray-300 px-1 py-1 text-center w-10">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {plateDetails.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0 ? "bg-white h-7" : "bg-gray-50 h-7"
                      }
                    >
                      <td className="border border-gray-300 text-center text-[10px] text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 p-0">
                        <input
                          type="text"
                          className="w-full px-1 py-0.5 bg-transparent text-[11px] outline-none focus:bg-white"
                          value={row.plateName}
                          onChange={(e) => {
                            const next = [...plateDetails];
                            next[idx] = {
                              ...next[idx],
                              plateName: e.target.value,
                            };
                            setPlateDetails(next);
                          }}
                          disabled={readOnly || isDisabledPermission}
                          placeholder="Plate name"
                        />
                      </td>
                      <td className="border border-gray-300 p-0">
                        <input
                          type="number"
                          min="0"
                          className="w-full px-1 py-0.5 text-right bg-transparent text-[11px] outline-none focus:bg-white"
                          value={row.qty}
                          onChange={(e) => {
                            const next = [...plateDetails];
                            next[idx] = { ...next[idx], qty: e.target.value };
                            setPlateDetails(next);
                          }}
                          onBlur={(e) => {
                            const next = [...plateDetails];
                            next[idx] = {
                              ...next[idx],
                              qty: e.target.value ? Number(e.target.value) : "",
                            };
                            setPlateDetails(next);
                          }}
                          onFocus={(e) => e.target.select()}
                          disabled={readOnly || isDisabledPermission}
                          placeholder="0"
                        />
                      </td>
                      {!readOnly && (
                        <td className="border border-gray-300 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() =>
                                setPlateDetails((prev) => [
                                  ...prev,
                                  { plateName: "", qty: "" },
                                ])
                              }
                              className="p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                              tabIndex={-1}
                              disabled={isDisabledPermission}
                            >
                              <Plus size={11} className="text-blue-700" />
                            </button>
                            <button
                              onClick={() =>
                                setPlateDetails((prev) => {
                                  const next = prev.filter((_, i) => i !== idx);
                                  return next.length > 0
                                    ? next
                                    : [{ plateName: "", qty: "" }];
                                })
                              }
                              className="p-0.5 bg-red-50 hover:bg-red-100 rounded"
                              tabIndex={-1}
                              disabled={isDisabledPermission}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-red-700"
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* Size Modal */}
      <Modal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        widthClass="w-[550px]"
      >
        <div className="bg-slate-100 p-3 rounded-lg">
          <div className="bg-white p-3 rounded-lg flex justify-between items-center mb-3 shadow-sm">
            <h3 className="text-[16px] font-bold text-slate-800">
              Size Wise Details
            </h3>
            <button
              className="bg-white text-indigo-600 border border-indigo-600 px-4 py-0.5 rounded text-[12px] hover:bg-indigo-50 font-semibold"
              onClick={() => setSizeModalOpen(false)}
            >
              Done
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="h-[220px] overflow-y-auto">
              <table className="w-[420px] border-separate border-spacing-0 border-t border-l border-slate-200">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-6">
                      S.No
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-40 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                      Size
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-16 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobCardSizeDetails?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="h-8 hover:bg-slate-50 transition-colors"
                    >
                      <td className="border-b border-r border-slate-200 px-1 py-0 text-center text-[11px] text-black">
                        {idx + 1}
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-0 text-[11px] text-black">
                        {sizeList?.data?.find((s) => s.id === item.sizeId)
                          ?.name || "All Items"}
                      </td>
                      <td className="border-b border-r border-slate-200 px-1 py-0">
                        <input
                          type="number"
                          className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                          value={item.qty}
                          disabled
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!jobCardSizeDetails && (
                <div className="text-center p-8 text-slate-400 text-sm font-medium italic">
                  No size Details found.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={approvalModal}
        onClose={() => setApprovalModal(false)}
        widthClass="w-[420px]"
      >
        <div className="space-y-4">
          <h2
            className={`text-base font-semibold ${actionType === "APPROVE" ? "text-green-700" : "text-blue-700"}`}
          >
            {actionType === "APPROVE"
              ? "✅ Approve Job Card"
              : "↩️ Send Back for Review"}
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Job Card No</span>
              <span className="font-medium text-gray-800">{docId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-gray-800">
                {findFromList(customerId, customerList?.data, "name")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Current Approval</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status === "APPROVED" ? "bg-green-100 text-green-700" : status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
              >
                {status === "PENDING"
                  ? "Waiting For Approval"
                  : status === "SUPERSEDED"
                    ? "Re-approval Required"
                    : status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Remarks{" "}
              {actionType === "REJECT" && (
                <span className="text-red-500">* required</span>
              )}
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
              placeholder={
                actionType === "APPROVE"
                  ? "Optional remarks..."
                  : "Reason for sending back (required)..."
              }
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApprovalModal(false)}
              className="px-4 py-1.5 text-xs rounded text-white hover:bg-red-600 bg-red-500"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={handleConfirmAction}
              className={`px-4 py-1.5 text-xs rounded text-white font-semibold ${actionType === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
            >
              {actionLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Processing...
                </>
              ) : actionType === "APPROVE" ? (
                "Confirm Approve"
              ) : (
                "Send Back"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Print Modal */}
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
        <PDFViewer style={tw("w-full h-full")}>
          <JobCardPrintFormat
            singleData={singleData?.data}
            customerList={customerList}
            boardList={boardList}
            gsmList={gsmList}
            machineList={machineList}
            plateList={plateList}
            dieList={dieList}
            defaultList={defaultList}
            laminationList={laminationList}
            varnishList={varnishList}
            branchData={branchData?.data}
            orderList={orderList}
            sizeList={sizeList}
            styleItemList={styleItemList}
            qrCodeDataUrl={qrCodeDataUrl}
            employeeList={employeeList}
            colorList={colorData}
            styleList={styleList}
            labelPrintingList={labelPrintingList}
            finishingList={finishingList}
            printingList={printingList}
          />
        </PDFViewer>
      </Modal>

      <TransactionLayout
        title="Job Card"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        gridItems={gridItemsContent}
        footer={footerContent}
      />
    </>
  );
};

export default JobCardForm;
