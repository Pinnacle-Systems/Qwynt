import React, { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { TextInput, DropdownInput, DateInputNew } from "../../../Inputs";
import {
  useAddSalesDeliveryMutation,
  useUpdateSalesDeliveryMutation,
  useDeleteSalesDeliveryMutation,
  useGetSalesDeliveryByIdQuery,
  useGetSalesDeliveryQuery,
} from "../../../redux/uniformService/SalesDeliveryService";
import { findFromList, getCommonParams, ModeChip } from "../../../Utils/helper";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject";
import SalesDeliveryItems from "./SalesDeliveryItems.jsx";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import SalesDeliveryPrintFormat from "./SalesDeliveryPrintFormat.jsx";
import tw from "../../../Utils/tailwind-react-pdf";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiEdit2, FiSave, FiPrinter, FiEye } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import {
  CommonFormFooter,
  TransactionActions,
  TransactionLayout,
} from "../../../Basic/components/Reuseable";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";
import PoSummary from "../PurchaseOrder/PoSummary";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import { PartyMaster } from "../index.js";
import {
  BankMaster,
  CurrencyMaster,
  PayTermMaster,
} from "../../../Basic/components/index.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useDispatch } from "react-redux";
import {
  conversionTypes,
  receiptTypes,
  discountTypes,
} from "../../../Utils/DropdownData.js";
import { useGetCurrenciesQuery } from "../../../redux/services/CurrencyMasterService.js";
import { useGetbankQuery } from "../../../redux/services/BankMasterService.js";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { Plus, QrCode } from "lucide-react";
import { useLazyGetBoxForSalesDeliveryQuery } from "../../../redux/services/BoxCreationService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { toast } from "react-toastify";
import { invalidatePackingModule } from "../../../redux/Dispatch/packingTags.js";
const EMPTY_ROW = {
  stockId: "",
  itemVariantId: "",
  styleId: "",
  hsnId: "",
  printingDesignId: "",
  sizeId: "",
  colorId: "",
  uomId: "",
  discountType: "",
  discountValue: "",
  wholeSalePrice: "",
  taxPercent: "",
};
const createInitialBoxes = (initialBoxes = []) => {
  const boxes = [...initialBoxes];
  while (boxes.length < 45) {
    boxes.push({
      boxId: "",
      packingBoxItemsId: "",
      saledItems: Array.from({ length: 5 }, () => ({ ...EMPTY_ROW })),
    });
  }
  return boxes;
};

const SalesDeliveryForm = ({
  readOnly,
  setReadOnly,
  id,
  setId,
  onClose,
  termsData,
  customerList,
  payTermList,
  hasPermission,
}) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState(moment().format("YYYY-MM-DD"));
  const [userDate, setUserDate] = useState(moment().format("YYYY-MM-DD"));
  const [deliveryDate, setDeliveryDate] = useState(
    moment().format("YYYY-MM-DD"),
  );
  const [customerId, setCustomerId] = useState("");
  const [dcNo, setDcNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [deliveryType, setDeliveryType] = useState("AGAINST_INVOICE");
  const [remarks, setRemarks] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [termsId, setTermsId] = useState("");
  const [saledBox, setSaledBox] = useState(createInitialBoxes());
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [summary, setSummary] = useState(false);
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [payTermId, setPayTermId] = useState("");
  const [weightInKg, setWeightInKg] = useState("");
  const [carriageCharge, setCarriageCharge] = useState("");
  const [carriageTaxType, setCarriageTaxType] = useState("");
  const [carriageTax, setCarriageTax] = useState("");
  const [carriageFinalAmt, setCarriageFinalAmt] = useState("");
  const [boxCodeInput, setBoxCodeInput] = useState("");
  const [conversionType, setConversionType] = useState("PCS");
  const [currencyId, setCurrencyId] = useState("");
  const [bankId, setBankId] = useState("");
  const customerRef = useRef(null);
  const termsRef = useRef(null);
  const childRecord = useRef(0);
  const effectiveReadOnly = readOnly || childRecord.current > 0;
  const isCumInvoice = deliveryType === "AGAINST_INVOICE";

  const dispatch = useDispatch();

  const { data: allData } = useGetSalesDeliveryQuery({ params: { branchId } });
  const { data: singleData } = useGetSalesDeliveryByIdQuery(id, { skip: !id });
  const { data: taxTypeList } = useGetTaxTemplateQuery({
    params: { companyId },
  });
  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });
  const { data: currencyList } = useGetCurrenciesQuery({
    params: { companyId },
  });
  console.log(supplierData, "supplierData");

  const isCustomerExport = supplierData?.data?.isCustomerExport;
  console.log(isCustomerExport, "isCustomerExport");

  const isCurrencySymbol = currencyList?.data?.find(
    (item) => item?.id === currencyId,
  )?.symbol;

  const { data: bankList } = useGetbankQuery({ params: { companyId } });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });

  const [dispatchInvalidate] = useInvalidateTags();

  const [addData] = useAddSalesDeliveryMutation();
  const [updateData] = useUpdateSalesDeliveryMutation();

  useEffect(() => {
    if (id && singleData?.data) {
      const data = singleData.data;
      setDocId(data.docId);
      setDocDate(moment(data.docDate).format("YYYY-MM-DD"));
      setUserDate(moment(data.userDate).format("YYYY-MM-DD"));
      setDeliveryDate(
        data.deliveryDate
          ? moment(data.deliveryDate).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
      );
      setCustomerId(data.customerId);
      setDcNo(data.dcNo || "");
      setVehicleNo(data.vehicleNo || "");
      setDeliveryType(data.deliveryType || "AGAINST_INVOICE");
      setRemarks(data.remarks || "");
      setTermsAndCondition(data.termsAndCondition || "");
      setTermsId(data.termsId || "");
      setTaxTemplateId(data.taxTemplateId || "");
      setPayTermId(data.payTermId || "");
      setDiscountType(data.discountType || "Percentage");
      setDiscountValue(data.discountValue || 0);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
      console.log(data.saledBox, "ResponseData");

      const mappedBoxes = (data?.saledBox || [])?.map((box) => ({
        boxId: box.boxId || "",
        boxCode: box.Box?.docId || "",
        saledItems: (box.saledItems || []).map((item) => ({
          stockId: item.stockId || "",
          itemVariantId: item.itemVariantId || "",
          styleId: item.styleId || "",
          hsnId: item.hsnId || "",
          printingDesignId: item.printingDesignId || "",
          sizeId: item.sizeId || "",
          colorId: item.colorId || "",
          uomId: item.uomId || "",
          wholeSalePrice: item.wholeSalePrice || "",
          taxPercent: item.taxPercent || "",
          discountType: item.discountType || "",
          discountValue: item.discountValue || "",
          // UI fields
          modelName: item.ItemVariant?.styleMaster?.modelName?.name || "",
          styleNo: item.StyleMaster?.styleNo || "",
          hsnCode: item.Hsn?.name || "",
          printDesignName: item.printingDesign?.name || "",
          sizeName: item.Size?.name || "",
          colorName: item.Color?.name || "",
          uomName: item.Uom?.name || "",
          qrCode: item.Stock?.qrCode || "",
        })),
        isNew: false,
      }));
      setSaledBox(
        createInitialBoxes(mappedBoxes.length > 0 ? mappedBoxes : undefined),
      );
      setConversionType(data.conversionType || "PCS");
      setCurrencyId(data.currencyId || "");
      setWeightInKg(data.weightInKg || "");
      setCarriageCharge(data.carriageCharge || "");
      setCarriageTaxType(data.carriageTaxType || "");
      setCarriageTax(data.carriageTax || "");
      setBankId(data.bankId || "");
    }
  }, [id, singleData]);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);
  useEffect(() => {
    const charge = parseFloat(carriageCharge) || 0;
    const tax = parseFloat(carriageTax) || 0;
    let finalAmt = 0;
    if (carriageTaxType === "Percentage") {
      finalAmt = charge + (charge * tax) / 100;
    } else if (carriageTaxType === "Flat") {
      finalAmt = charge + tax;
    } else {
      finalAmt = charge + (charge * tax) / 100; // default behavior
    }
    setCarriageFinalAmt(finalAmt ? finalAmt.toFixed(2) : "");
  }, [carriageCharge, carriageTax, carriageTaxType]);
  useEffect(() => {
    if (termsId && termsData?.data && !id) {
      const term = termsData.data.find((t) => t.id === termsId);
      if (term) setTermsAndCondition(term.description);
    }
  }, [termsId, termsData]);

  useEffect(() => {
    if (!id) {
      setTaxTemplateId(
        taxTypeList?.data?.filter((item) => item.name === "DEFAULT")[0]?.id,
      );
    }
  }, []);

  const validateRows = (items) => {
    const errors = [];
    const seen = new Set();
    items.forEach((item, index) => {
      if (!item.styleId) errors.push(`Row ${index + 1}: Style is required`);
      if (!item.hsnId) errors.push(`Row ${index + 1}: HSN is required`);
      if (!item.uomId) errors.push(`Row ${index + 1}: UOM is required`);
      if (!item.qty || Number(item.qty) <= 0)
        errors.push(`Row ${index + 1}: Qty is required`);
      const key = `${item.styleId}_${item.uomId}`;
      if (seen.has(key)) {
        errors.push(`Row ${index + 1}: Duplicate item found`);
      } else {
        seen.add(key);
      }
    });
    return errors;
  };

  const handleSave = async (pendingAction = null) => {
    if (!customerId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Customer.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (isCumInvoice && !payTermId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Pay Term.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (isCumInvoice && !taxTemplateId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Tax Template.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!deliveryDate) {
      Swal.fire({
        title: "Warning",
        text: "Delivery Date is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !currencyId) {
      Swal.fire({
        title: "Warning",
        text: "Currency is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !bankId) {
      Swal.fire({
        title: "Warning",
        text: "Bank is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const filteredItems = saledBox.filter((item) => item.boxId);
    if (filteredItems.length === 0) {
      Swal.fire({
        title: "Warning",
        text: "Please add at least one Box.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    const rowErrors = validateRows(filteredItems);
    // if (rowErrors.length > 0) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Row Validation Error",
    //     html: `<div style="text-align:left">${rowErrors.join("<br/>")}</div>`,
    //   });
    //   return false;
    // }
    // if (isCumInvoice) {
    //   const hasMissingPrice = filteredItems.some(
    //     (item) => !item.price || parseFloat(item.price) <= 0,
    //   );
    //   if (hasMissingPrice) {
    //     Swal.fire({
    //       title: "Warning",
    //       text: "Please enter a valid price for all selected items.",
    //       icon: "warning",
    //       confirmButtonColor: "#3085d6",
    //     });
    //     return;
    //   }
    // }

    const payload = {
      userId: parseInt(userId),
      branchId: parseInt(branchId),
      companyId: parseInt(companyId),
      finYearId: parseInt(finYearId),
      docDate,
      userDate,
      deliveryDate,
      customerId: parseInt(customerId),
      dcNo,
      vehicleNo,
      deliveryType,
      remarks,
      termsAndCondition,
      termsId: parseInt(termsId),
      taxTemplateId: isCumInvoice ? taxTemplateId : null,
      saledBox: saledBox?.filter((item) => item?.boxId),
      payTermId: isCumInvoice ? payTermId : null,
      discountType,
      discountValue,
      id,
      conversionType,
      currencyId: parseInt(currencyId),
      weightInKg,
      carriageCharge,
      carriageTaxType,
      carriageTax,
      bankId,
    };
    console.log(payload, "payload");

    try {
      let savedId = id;
      if (id && !window.confirm("Are you sure you want to update the details?"))
        return;
      if (id) {
        await updateData(payload).unwrap();
        Swal.fire({
          title: "Success",
          text: "Sales Delivery updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current?.focus();
            invalidatePackingModule();
          },
        });
      } else {
        const res = await addData(payload).unwrap();
        savedId = res.data.id;
        setId(savedId);
        Swal.fire({
          title: "Success",
          text: "Sales Delivery created successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current?.focus();
            invalidatePackingModule();
          },
        });
      }
      setReadOnly(true);
      dispatchInvalidate();
      invalidatePackingModule();
      if (pendingAction === "new") onNew();
      else if (pendingAction === "close") onClose();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.data?.message || "Failed to save Sales Delivery",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      handleSave();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDocId("New");
    setDocDate(moment().format("YYYY-MM-DD"));
    setUserDate(moment().format("YYYY-MM-DD"));
    setDeliveryDate(moment().format("YYYY-MM-DD"));
    setCustomerId("");
    setDcNo("");
    setVehicleNo("");
    setDeliveryType("AGAINST_INVOICE");
    setRemarks("");
    setTermsAndCondition("");
    setTermsId("");
    setTaxTemplateId("");
    setPayTermId("");
    setSaledBox(createInitialBoxes());
    setDiscountType("Percentage");
    setDiscountValue(0);
    setConversionType("PCS");
    setCurrencyId("");
    setWeightInKg("");
    setCarriageCharge("");
    setCarriageTax("");
    setBankId("");
  };

  const actionButtonClass =
    "px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition";

  const leftActions = [
    ...(!effectiveReadOnly
      ? [
          {
            key: "saveAndClose",
            icon: (
              <span className="flex items-center gap-1">
                <FiSave className="h-4 w-4" />
                <HiX className="h-4 w-4" />
              </span>
            ),
            hoverLabel: "Save & Close",
            iconOnly: true,
            onClick: () => handleSave("close"),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSave("close");
              }
            },
            className: `bg-indigo-500 hover:bg-indigo-600 ${actionButtonClass}`,
          },
          {
            key: "saveAndNew",
            icon: (
              <span className="flex items-center gap-1">
                <FiSave className="h-4 w-4" />
                <HiOutlineRefresh className="h-4 w-4" />
              </span>
            ),
            hoverLabel: "Save & New",
            iconOnly: true,
            onClick: () => handleSave("new"),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSave("new");
              }
            },
            className: `bg-indigo-600 hover:bg-indigo-700 ${actionButtonClass}`,
          },
        ]
      : []),
  ];

  const rightActions = [
    {
      key: "edit",
      icon: <FiEdit2 className="h-4 w-4" />,
      hoverLabel: "Edit",
      iconOnly: true,
      onClick: () => hasPermission(() => setReadOnly(false), "edit"),
      className: `bg-yellow-600 hover:bg-yellow-700 ${actionButtonClass}`,
      hidden: !readOnly || !id,
    },
    ...(isCumInvoice
      ? [
          {
            key: "summary",
            icon: <FiEye className="h-4 w-4" />,
            hoverLabel: "View Summary",
            iconOnly: true,
            onClick: () => {
              if (!taxTemplateId) {
                Swal.fire({
                  title: "Information",
                  text: "Please Select Tax Template!",
                  icon: "info",
                  confirmButtonColor: "#3085d6",
                });
                return;
              }
              setSummary(true);
            },
            className:
              "bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition",
          },
        ]
      : []),
    ...(id
      ? [
          {
            key: "print",
            icon: <FiPrinter className="h-4 w-4" />,
            hoverLabel: "Print",
            iconOnly: true,
            onClick: () => setPrintModalOpen(true),
            className: `bg-slate-600 hover:bg-slate-700 ${actionButtonClass}`,
          },
        ]
      : []),
  ].filter((a) => !a.hidden);

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);

  const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });

  const allSaledItems = useMemo(() => {
    return saledBox
      .flatMap((box, boxIndex) => {
        const boxItems = box.saledItems || [];
        const boxGross = boxItems.reduce(
          (sum, item) => sum + Number(item.wholeSalePrice || item.price || 0) * Number(item.qty || 1),
          0
        );

        return boxItems.map((item) => {
          let itemDiscountValue = 0;
          let itemDiscountType = "Percentage";

          if (box.boxDiscountValue) {
            if (box.boxDiscountType === "Flat") {
              const itemGross =
                Number(item.wholeSalePrice || item.price || 0) * Number(item.qty || 1);
              const ratio = boxGross > 0 ? itemGross / boxGross : 0;
              itemDiscountValue = Number(box.boxDiscountValue) * ratio;
              itemDiscountType = "Flat";
            } else {
              itemDiscountValue = Number(box.boxDiscountValue);
              itemDiscountType = "Percentage";
            }
          }

          return {
            ...item,
            originalBoxIndex: boxIndex,
            discountValue: itemDiscountValue,
            discountType: itemDiscountType,
          };
        });
      })
      .filter((i) => i.styleId || i.modelName || i.hsnId || i.wholeSalePrice)
      .map((item) => {
        const hsnObj = hsnList?.data?.find(
          (h) => h.id === item.hsnId || h.name === item.hsnCode,
        );
        const wholeSalePrice = Number(item.wholeSalePrice || item.price || 0);
        return {
          ...item,
          price: wholeSalePrice,
          wholeSalePrice: wholeSalePrice,
          qty: Number(item.qty || 1),
          taxPercent: isCustomerExport
            ? 0
            : item.taxPercent !== undefined &&
                item.taxPercent !== "" &&
                item.taxPercent !== null
              ? Number(item.taxPercent)
              : Number(hsnObj?.tax ?? item.Hsn?.tax ?? 0),
          hsn: item.hsn || item.hsnCode || hsnObj?.name || "NA",
        };
      });
  }, [saledBox, hsnList, isCustomerExport]);

  const enrichedData = useMemo(() => {
    if (!allSaledItems.length)
      return {
        items: [],
        gross: 0,
        taxable: 0,
        net: 0,
        slabBreakup: [],
        roundOff: 0,
      };
    return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
      allSaledItems,
      isSupplierOutside,
      discountType,
      discountValue,
      conversionType === "DOZEN" ? true : false,
    );
  }, [
    allSaledItems,
    isSupplierOutside,
    discountType,
    discountValue,
    conversionType,
  ]);

  const totalBoxes = useMemo(() => {
    return (saledBox || []).filter((box) => box.boxId).length;
  }, [saledBox]);

  const totalQty = useMemo(() => {
    return allSaledItems.reduce(
      (sum, item) => sum + (parseFloat(item.qty) || 0),
      0,
    );
  }, [allSaledItems]);

  const grandTotal = useMemo(() => {
    const net = parseFloat(enrichedData?.net) || 0;
    const carriage = parseFloat(carriageFinalAmt) || 0;
    return (net + carriage).toFixed(2);
  }, [enrichedData?.net, carriageFinalAmt]);

  const taxBreakdownSummaryRaw = enrichedData?.slabBreakup || [];
  const aggregatedTaxBreakdown = taxBreakdownSummaryRaw?.reduce((acc, row) => {
    const taxType = row?.tax?.split(" ")[0];
    if (!acc[taxType]) {
      acc[taxType] = { tax: taxType, amount: 0 };
    }
    acc[taxType].amount += parseFloat(row?.amount || 0);
    return acc;
  }, {});
  const taxBreakdownSummary = Object.values(aggregatedTaxBreakdown);

  const [boxData] = useLazyGetBoxForSalesDeliveryQuery();

  const handleBoxQrSubmit = async (e) => {
    if (e.key === "Enter" && boxCodeInput) {
      e.preventDefault();
      if (!customerId) {
        toast.error("Please select a Customer first!");
        return;
      }
      try {
        const response = await boxData({ searchParams: boxCodeInput }).unwrap();
        if (response.statusCode === 0 && response.data?.length > 0) {
          const fetchedBox =
            response.data.find((b) => b.docId === boxCodeInput) ||
            response.data[0];
          setSaledBox((prev) => {
            const newBoxes = [...prev];
            // Only add if it doesn't already exist
            if (!newBoxes?.some((b) => b.boxId === fetchedBox.id)) {
              const emptyIdx = newBoxes?.findIndex((b) => !b.boxId);
              if (emptyIdx !== -1) {
                const mappedItems = (fetchedBox.boxStyleItems || []).map(
                  (item) => ({
                    stockId: item.id || "",
                    itemVariantId: item.itemVariantId || "",
                    styleId: item.styleId || "",
                    hsnId: item.hsnId || "",
                    printingDesignId: item.printingDesignId || "",
                    sizeId: item.sizeId || "",
                    colorId: item.colorId || "",
                    uomId: item.uomId || "",
                    wholeSalePrice: item.StyleMaster?.wholeSalePrice || 0,
                    taxPercent: item.Hsn?.tax ? parseFloat(item.Hsn.tax) : 0,
                    // UI fields
                    modelName:
                      item.ItemVariant?.styleMaster?.modelName?.name || "",
                    styleNo: item.StyleMaster?.styleNo || "",
                    hsnCode: item.Hsn?.name || "",
                    printDesignName: item.printingDesign?.name || "",
                    sizeName: item.Size?.name || "",
                    colorName: item.Color?.name || "",
                    uomName: item.Uom?.name || "",
                    qrCode: item.qrCode,
                  }),
                );
                console.log(fetchedBox, "fetchedBox");

                newBoxes[emptyIdx] = {
                  ...newBoxes[emptyIdx],
                  boxCode: boxCodeInput,
                  boxId: fetchedBox.id,
                  saledItems:
                    mappedItems.length > 0 ? mappedItems : [{ ...EMPTY_ROW }],
                  isNew: true,
                  packingBoxItemsId:
                    fetchedBox.boxStyleItems?.[0]?.packingBoxItemsId,
                };
              }
            }
            return newBoxes;
          });
          setBoxCodeInput("");
        } else if (response.statusCode === 1) {
          toast.error(response.message || "Box not found in database!");
          setBoxCodeInput("");
        } else {
          toast.error("Box not found in database!");
          setBoxCodeInput("");
        }
      } catch (error) {
        toast.error("Error fetching box details!");
        setBoxCodeInput("");
      }
    }
  };
  console.log(saledBox, "saledBox");

  const basicDetailsFields = (
    <>
      <div className="w-36">
        <TextInput name="Sales Delivery No" value={docId} disabled={true} />
      </div>
      <div className="w-28">
        <DateInputNew
          name="Sales Delivery Date"
          value={docDate}
          setValue={setDocDate}
          disabled={true}
          required={true}
          type="date"
        />
      </div>
      <div className="w-28">
        <DateInputNew
          name="User Date"
          value={userDate}
          setValue={setUserDate}
          disabled={readOnly}
          required={true}
          type="date"
        />
      </div>
    </>
  );

  const customerDetailsFields = (
    <>
      <div className="md:col-span-2">
        <DropdownWithModal
          name="Customer"
          options={dropDownListObject(
            id
              ? customerList?.data?.filter((item) => item?.isCustomer)
              : customerList?.data?.filter(
                  (item) => item?.active && item?.isCustomer,
                ),
            "name",
            "id",
          )}
          value={customerId}
          setValue={setCustomerId}
          required={true}
          readOnly={readOnly}
          className="w-[150px]"
          addNewLabel="+ Add New Customer"
          childComponent={PartyMaster}
          addNewModalWidth="w-[90%] h-[95%]"
          disabled={readOnly || childRecord.current > 0}
          openOnFocus={true}
        />
      </div>
      <div className="md:col-span-1">
        <TextInput
          name="Contact Person"
          value={findFromList(
            customerId,
            customerList?.data,
            "contactPersonName",
          )}
          disabled={true}
        />
      </div>
      <div className="md:col-span-1">
        <TextInput
          name="Phone"
          value={findFromList(customerId, customerList?.data, "contactNumber")}
          disabled={true}
        />
      </div>
      <div className="md:col-span-1">
        <DropdownInput
          name="Tax Type"
          options={dropDownListObject(
            taxTypeList ? taxTypeList?.data : [],
            "name",
            "id",
          )}
          value={taxTemplateId}
          setValue={setTaxTemplateId}
          required={!isCustomerExport}
          readOnly={effectiveReadOnly}
        />
      </div>
      {isCumInvoice && (
        <>
          <div className="md:col-span-1">
            <DropdownWithModal
              name="Pay Term"
              options={dropDownListObject(
                id
                  ? payTermList?.data
                  : payTermList?.data?.filter((item) => item?.active),
                "name",
                "id",
              )}
              value={payTermId}
              setValue={setPayTermId}
              required={true}
              readOnly={readOnly}
              className="w-full max-w-none"
              dropdownMinWidth={240}
              addNewLabel="+ Add New Pay Term"
              childComponent={PayTermMaster}
              addNewModalWidth="w-[40%] h-[66%]"
            />
          </div>

          {isCustomerExport && (
            <div className="md:col-span-1">
              <DropdownWithModal
                name="Currency"
                options={dropDownListObject(
                  id
                    ? currencyList?.data
                    : currencyList?.data?.filter((item) => item?.active),
                  "name",
                  "id",
                )}
                value={currencyId}
                setValue={setCurrencyId}
                required={true}
                readOnly={readOnly}
                className={`w-full max-w-none`}
                dropdownMinWidth={240}
                addNewLabel="+ Add New Currency"
                childComponent={CurrencyMaster}
                addNewModalWidth="w-[40%] h-[66%]"
              />
            </div>
          )}
        </>
      )}
    </>
  );

  const deliveryDetailsFields = (
    <>
      <div className="grid grid-cols-12 gap-2 gap-x-3 mb-2">
        <div className="col-span-2">
          <DateInputNew
            name="Delivery Date"
            value={deliveryDate}
            setValue={setDeliveryDate}
            disabled={effectiveReadOnly}
            required={true}
            type="date"
          />
        </div>
        {/* <div className="col-span-3">
          <TextInput
            name="DC No"
            value={dcNo}
            setValue={setDcNo}
            disabled={effectiveReadOnly}
          />
        </div> */}
        <div className="col-span-2">
          <TextInput
            name="Vehicle No"
            value={vehicleNo}
            setValue={setVehicleNo}
            disabled={effectiveReadOnly}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            name="Weight (KG)"
            value={weightInKg}
            setValue={setWeightInKg}
            disabled={readOnly}
            type="number"
            min="0"
            className="text-right"
            onBlur={(e) =>
              setWeightInKg(
                e.target.value ? Number(e.target.value).toFixed(3) : "",
              )
            }
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>

        <div className="col-span-2">
          <TextInput
            name={`Carriage Charge ${currencyId ? `(${isCurrencySymbol})` : ""}`}
            value={carriageCharge}
            setValue={setCarriageCharge}
            disabled={readOnly}
            type="number"
            min="0"
            className="text-right"
            onBlur={(e) =>
              setCarriageCharge(
                e.target.value ? Number(e.target.value).toFixed(2) : "",
              )
            }
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>
        <div className="col-span-2">
          <DropdownInput
            name="Carriage Tax Type"
            options={discountTypes}
            value={carriageTaxType}
            setValue={setCarriageTaxType}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            name="Carriage Tax%"
            value={carriageTax}
            setValue={setCarriageTax}
            disabled={readOnly}
            type="number"
            min="0"
            className="text-right"
            onBlur={(e) =>
              setCarriageTax(
                e.target.value ? Number(e.target.value).toFixed(2) : "",
              )
            }
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            name="Carriage Final Amount"
            value={carriageFinalAmt}
            disabled={true}
            type="number"
            min="0"
            className="text-right"
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>
        {isCumInvoice && (
          <div className="col-span-5">
            <DropdownWithModal
              name="Advising Bank"
              options={dropDownListObjectMultiple(
                id
                  ? bankList?.data
                  : bankList?.data?.filter((item) => item?.active),
                ["name", "Branch.name"],
                "id",
              )}
              value={bankId}
              setValue={setBankId}
              required={isCustomerExport}
              readOnly={readOnly}
              className={`w-[150px]`}
              addNewLabel="+ Add New Bank"
              childComponent={BankMaster}
              addNewModalWidth="w-[45%] h-[64%]"
              disabled={readOnly}
            />
          </div>
        )}
        <div
          className={`col-span-5 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md`}
        >
          <div className="h-full rounded-md bg-white p-1.5 flex flex-col justify-center">
            <label className="mb-1 flex items-center gap-1.5 text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wide">
              <QrCode className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              Box QR Code Scan
            </label>
            <input
              type="text"
              className={` w-full rounded border-2 border-purple-200 bg-purple-50/50 px-2 py-1 text-xs font-bold text-slate-800 placeholder-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-300 transition-all`}
              placeholder="Scan Box Code..."
              value={boxCodeInput}
              onChange={(e) => setBoxCodeInput(e.target.value)}
              onKeyDown={handleBoxQrSubmit}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </>
  );

  const cardClass =
    "w-full border border-slate-200 p-1.5 bg-white rounded-md shadow-sm h-full";
  const sectionTitleClass =
    "text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5";

  const basicDetailsSection = (
    <div className={cardClass}>
      <h2 className={sectionTitleClass}>Basic Details</h2>
      <div className="grid grid-cols-2 gap-2 gap-x-6">{basicDetailsFields}</div>
    </div>
  );

  const customerDetailsSection = (
    <div className={cardClass}>
      <h2 className={sectionTitleClass}>Customer Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {customerDetailsFields}
      </div>
    </div>
  );

  const deliveryDetailsSection = (
    <div className={cardClass}>
      <h2 className={sectionTitleClass}>Delivery Details</h2>
      <div className="flex flex-col h-[calc(100%-20px)]">
        {deliveryDetailsFields}
      </div>
    </div>
  );

  const headerContent = (
    <div className="grid grid-cols-1 gap-1 xl:grid-cols-[minmax(0,3.5fr)_minmax(0,6.0fr)_minmax(0,9.0fr)] items-stretch">
      {basicDetailsSection}
      {customerDetailsSection}
      {deliveryDetailsSection}
    </div>
  );

  const footerContent = (
    <>
      <CommonFormFooter
        remarks={remarks}
        setRemarks={setRemarks}
        terms={termsAndCondition}
        setTerms={setTermsAndCondition}
        readOnly={readOnly}
        showTermSelect={true}
        termsRef={termsRef}
        termValue={termsId}
        onTermChange={(value) => setTermsId(value)}
        twoColumnRightSummary={true}
        rightSummaryTitle="Summary"
        termsColClass="md:col-span-2"
        remarksColClass="md:col-span-2"
        summaryColClass="md:col-span-8"
        termOptions={
          termsData?.data?.map((item) => ({
            value: item.id,
            label: item.name,
            templateText: item.description || "",
          })) || []
        }
        totalsRows={[
          {
            key: "totalBoxes",
            label: "Total Boxes",
            value: totalBoxes,
            summaryColumn: "right",
            emphasized: true,
          },
          {
            key: "totalQty",
            label: "Total Pcs",
            value: totalQty,
            summaryColumn: "right",
            emphasized: true,
          },
          ...(isCumInvoice
            ? [
                {
                  key: "totalDiscount",
                  label: "Total Discount",
                  value: `Rs.${parseFloat((enrichedData?.itemDiscount || 0) + (enrichedData?.overallDiscount || 0)).toFixed(2)}`,
                  summaryColumn: "right",
                },
                {
                  key: "taxableAmount",
                  label: "Taxable Amount",
                  value: `Rs.${parseFloat(enrichedData?.taxable || 0).toFixed(2)}`,
                  summaryColumn: "right",
                },
                ...taxBreakdownSummary.map((row, index) => ({
                  key: `${row.tax}-${row.amount}`,
                  label: row.tax,
                  value: `Rs.${parseFloat(row.amount || 0).toFixed(2)}`,
                  summaryColumn: "right",
                  labelClassName: "!text-slate-500 font-normal",
                  valueClassName: "text-slate-700",
                  className:
                    index === 0 ? "border-t border-slate-100 pt-1" : "",
                })),
                {
                  key: "roundOff",
                  label: "Round Off",
                  value: `Rs.${parseFloat(enrichedData?.roundOff || 0).toFixed(2)}`,
                  summaryColumn: "right",
                  labelClassName: "!text-slate-500 font-normal",
                  valueClassName: "text-slate-700",
                },
                {
                  key: "netAmount",
                  label: "Net Amount",
                  value: `Rs.${parseFloat(enrichedData?.net || 0).toFixed(2)}`,
                  summaryColumn: "right",
                  emphasized: true,
                },
              ]
            : []),
          {
            key: "carriageCharge",
            label: "Carriage Charges",
            value: `${isCurrencySymbol ? isCurrencySymbol : "Rs."} ${carriageFinalAmt || "0.00"}`,
            summaryColumn: "right",
            emphasized: true,
          },

          ...(isCumInvoice
            ? [
                {
                  key: "grandTotal",
                  label: "Grand Total",
                  value: `${isCurrencySymbol ? isCurrencySymbol : "Rs."} ${grandTotal}`,
                  summaryColumn: "right",
                  emphasized: true,
                },
              ]
            : []),
        ]}
      />
      <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
        {/* Left Buttons */}
        <div className="flex gap-2 flex-wrap">
          {!readOnly && (
            <button
              onClick={() => handleSave("close")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave("close");
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
              onClick={() => handleSave("new")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave("new");
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
          {isCumInvoice && (
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center text-xs font-medium"
              onClick={() => setSummary(true)}
            >
              <FiEye className="h-4 w-4 mr-2" />
              View Summary
            </button>
          )}

          {id && (
            <button
              className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 flex items-center text-xs font-medium"
              onClick={() => setPrintModalOpen(true)}
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isCumInvoice && (
        <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass="">
          <PoSummary
            poItems={saledBox}
            totals={enrichedData}
            readOnly={effectiveReadOnly}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            setSummary={setSummary}
            isCustomerExport={isCustomerExport}
          />
        </Modal>
      )}

      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass="w-[90%] h-[90%]"
      >
        <PDFViewer style={tw("w-full h-full")}>
          <SalesDeliveryPrintFormat
            data={{
              ...singleData?.data,
              salesDeliveryItems: saledBox.filter((i) => i.styleId),
            }}
            taxDetails={enrichedData}
            isCumInvoice={isCumInvoice}
            payTermList={payTermList}
            isCustomerExport={isCustomerExport}
          />
        </PDFViewer>
      </Modal>

      <TransactionLayout
        title="Sales Delivery"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={
          <SalesDeliveryItems
            items={saledBox}
            enrichedItems={enrichedData}
            setSaledBox={setSaledBox}
            readOnly={effectiveReadOnly}
            taxTemplateId={taxTemplateId}
            id={id}
            termsRef={termsRef}
            isCumInvoice={isCumInvoice}
            isSupplierOutside={isSupplierOutside}
            sizeList={sizeList}
            conversionType={conversionType}
            isCustomerExport={isCustomerExport}
            discountType={discountType}
            discountValue={discountValue}
          />
        }
        footer={footerContent}
      />
    </>
  );
};

export default SalesDeliveryForm;
