import React, { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { TextInput, DropdownInput, DateInputNew } from "../../../Inputs";
import {
  useGetSalesReturnQuery,
  useGetSalesReturnByIdQuery,
  useAddSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
} from "../../../redux/services/SalesReturnService";
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
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import { PartyMaster } from "../index.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useDispatch } from "react-redux";

import { useGetCurrenciesQuery } from "../../../redux/services/CurrencyMasterService.js";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { QrCode } from "lucide-react";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { toast } from "react-toastify";
import { invalidatePackingModule } from "../../../redux/Dispatch/packingTags.js";
import { invalidateSalesModule } from "../../../redux/Dispatch/salesIvalidTags";

import { useLazyGetQrStockForReturnQuery } from "../../../redux/services/StockService";
const EMPTY_ROW = {
  stockId: "",
  itemVariantId: "",
  styleId: "",
  hsnId: "",
  printingDesignId: "",
  sizeId: "",
  colorId: "",
  uomId: "",
};
const createInitialBoxes = (initialBoxes = []) => {
  const boxes = [...initialBoxes];
  while (boxes.length < 45) {
    boxes.push({
      boxId: "",
      salesReturnBoxItems: Array.from({ length: 5 }, () => ({ ...EMPTY_ROW })),
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
  const [remarks, setRemarks] = useState("");
  const [salesReturnBox, setSalesReturnBox] = useState(createInitialBoxes());

  const [boxCodeInput, setBoxCodeInput] = useState("");

  const customerRef = useRef(null);
  const termsRef = useRef(null);
  const childRecord = useRef(0);
  const effectiveReadOnly = readOnly || childRecord.current > 0;

  const { data: allData } = useGetSalesReturnQuery({ params: { branchId } });
  const { data: singleData } = useGetSalesReturnByIdQuery(id, { skip: !id });
  const { data: taxTypeList } = useGetTaxTemplateQuery({
    params: { companyId },
  });
  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });

  console.log(supplierData, "supplierData");

  const isCustomerExport = supplierData?.data?.isCustomerExport;
  console.log(isCustomerExport, "isCustomerExport");

  const [dispatchInvalidate] = useInvalidateTags();

  const [addData] = useAddSalesReturnMutation();
  const [updateData] = useUpdateSalesReturnMutation();

  useEffect(() => {
    if (id && singleData?.data) {
      const data = singleData.data;
      setDocId(data.docId);
      setDocDate(moment(data.docDate).format("YYYY-MM-DD"));
      setUserDate(moment(data.userDate).format("YYYY-MM-DD"));

      setCustomerId(data.customerId);

      setRemarks(data.remarks || "");

      childRecord.current = data?.childRecord ? data?.childRecord : 0;
      console.log(data.salesReturnBox, "ResponseData");

      const mappedBoxes = (data?.SalesReturnBox || [])?.map((box) => ({
        boxId: box.boxId || "",
        boxCode: box.box?.docId || "",
        saledBoxId: box.saledBoxId || "",

        salesReturnBoxItems: (box.SalesReturnBoxItems || []).map((item) => {
          const s = item.stock || {};
          return {
            stockId: item.stockId || "",
            itemVariantId: s.itemVariantId || "",
            styleId: s.styleId || "",
            hsnId: s.hsnId || "",
            printingDesignId: s.printingDesignId || "",
            sizeId: s.sizeId || "",
            colorId: s.colorId || "",
            uomId: s.uomId || "",

            // UI fields
            modelName: s.ItemVariant?.styleMaster?.modelName?.name || "",
            styleNo: s.StyleMaster?.styleNo || "",
            hsnCode: s.Hsn?.name || "",
            printDesignName: s.printingDesign?.name || "",
            sizeName: s.Size?.name || "",
            colorName: s.Color?.name || "",
            uomName: s.Uom?.name || "",
            qrCode: s.qrCode || "",
          };
        }),
        isNew: false,
      }));
      setSalesReturnBox(
        createInitialBoxes(mappedBoxes.length > 0 ? mappedBoxes : undefined),
      );
    }
  }, [id, singleData]);

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

    const filteredItems = salesReturnBox.filter((item) => item.boxId);
    if (filteredItems.length === 0) {
      Swal.fire({
        title: "Warning",
        text: "Please add at least one Box.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const payload = {
      userId: parseInt(userId),
      branchId: parseInt(branchId),
      companyId: parseInt(companyId),
      finYearId: parseInt(finYearId),
      docDate,
      userDate,
      customerId: parseInt(customerId),

      salesReturnBox: salesReturnBox?.filter((item) => item?.boxId),

      id,
      remarks,
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
            invalidateSalesModule();
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
            invalidateSalesModule();
          },
        });
      }
      setReadOnly(true);
      invalidateSalesModule();

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

    setCustomerId("");

    setRemarks("");

    setSalesReturnBox(createInitialBoxes());
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

  const allsalesReturnBoxItems = useMemo(() => {
    return salesReturnBox
      .flatMap((box, boxIndex) => {
        const boxItems = box.salesReturnBoxItems || [];

        return boxItems.map((item) => {
          return {
            ...item,
            originalBoxIndex: boxIndex,
          };
        });
      })
      .filter((i) => i.styleId || i.modelName || i.hsnId || i.wholeSalePrice)
      .map((item) => {
        const hsnObj = hsnList?.data?.find(
          (h) => h.id === item.hsnId || h.name === item.hsnCode,
        );
        return {
          ...item,
          qty: Number(item.qty || 1),
        };
      });
  }, [salesReturnBox, hsnList]);

  const totalBoxes = useMemo(() => {
    return (salesReturnBox || []).filter((box) => box.boxId).length;
  }, [salesReturnBox]);

  const totalQty = useMemo(() => {
    return allsalesReturnBoxItems.reduce(
      (sum, item) => sum + (parseFloat(item.qty) || 0),
      0,
    );
  }, [allsalesReturnBoxItems]);

  const [boxData] = useLazyGetQrStockForReturnQuery();
  const [itemCodeInput, setItemCodeInput] = useState("");

  const processQrResponse = (response, inputCode, type) => {
    if (response.statusCode === 0 && response.data?.length > 0) {
      const fetchedBox =
        response.data.find((b) =>
          type === "box" ? b.docId === inputCode : true,
        ) || response.data[0];

      const fetchedCustomerId = fetchedBox?.boxStyleItems?.[0]?.customerId;

      if (
        customerId &&
        fetchedCustomerId &&
        parseInt(customerId) !== parseInt(fetchedCustomerId)
      ) {
        return {
          success: false,
          message: `Customer is different for the scanned ${type === "box" ? "Box" : "Item"}!`,
        };
      }

      if (fetchedCustomerId && !customerId) {
        setCustomerId(fetchedCustomerId);
      }

      setSalesReturnBox((prev) => {
        const newBoxes = [...prev];
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
                // UI fields
                modelName: item.ItemVariant?.styleMaster?.modelName?.name || "",
                styleNo: item.StyleMaster?.styleNo || "",
                hsnCode: item.Hsn?.name || "",
                printDesignName: item.printingDesign?.name || "",
                sizeName: item.Size?.name || "",
                colorName: item.Color?.name || "",
                uomName: item.Uom?.name || "",
                qrCode: item.qrCode,
              }),
            );

            newBoxes[emptyIdx] = {
              ...newBoxes[emptyIdx],
              boxCode: fetchedBox?.docId,
              salesDeliveryDocId:
                fetchedBox?.saledBoxes?.[0]?.SalesDelivery?.docId,
              salesDeliveryId: fetchedBox?.saledBoxes?.[0]?.SalesDelivery?.id,
              saledBoxId: fetchedBox?.saledBoxes?.[0]?.id,
              boxId: fetchedBox?.id,
              salesReturnBoxItems:
                mappedItems?.length > 0 ? mappedItems : [{ ...EMPTY_ROW }],
              isNew: true,
            };
          }
        }
        return newBoxes;
      });
      return { success: true };
    }
    return {
      success: false,
      message:
        response.message ||
        (type === "box"
          ? "Box not found in database!"
          : "Item not found in database!"),
    };
  };

  const handleBoxQrSubmit = async (e) => {
    if (e.key === "Enter" && boxCodeInput) {
      e.preventDefault();

      try {
        const response = await boxData({ boxQrcode: boxCodeInput }).unwrap();
        const result = processQrResponse(response, boxCodeInput, "box");
        if (!result.success) {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Error fetching box details!");
      }
      setBoxCodeInput("");
    }
  };

  const handleItemQrSubmit = async (e) => {
    if (e.key === "Enter" && itemCodeInput) {
      e.preventDefault();

      try {
        const response = await boxData({ itemQrcode: itemCodeInput }).unwrap();
        const result = processQrResponse(response, itemCodeInput, "item");
        if (!result.success) {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Error fetching item details!");
      }
      setItemCodeInput("");
    }
  };
  console.log(salesReturnBox, "salesReturnBox");

  const basicDetailsFields = (
    <>
      <div className="w-36">
        <TextInput name="Sales Return No" value={docId} disabled={true} />
      </div>
      <div className="w-28">
        <DateInputNew
          name="Sales Return Date"
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
          readOnly={true}
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
    </>
  );

  const deliveryDetailsFields = (
    <>
      <div className="grid grid-cols-12 gap-2 gap-x-3 mb-2">
        <div
          className={`col-span-6 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md`}
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
        <div
          className={`col-span-6 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md`}
        >
          <div className="h-full rounded-md bg-white p-1.5 flex flex-col justify-center">
            <label className="mb-1 flex items-center gap-1.5 text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wide">
              <QrCode className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              Item QR Code Scan
            </label>
            <input
              type="text"
              className={` w-full rounded border-2 border-purple-200 bg-purple-50/50 px-2 py-1 text-xs font-bold text-slate-800 placeholder-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-300 transition-all`}
              placeholder="Scan Item Code..."
              value={itemCodeInput}
              onChange={(e) => setItemCodeInput(e.target.value)}
              onKeyDown={handleItemQrSubmit}
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
      <div className="flex gap-x-2 ">{basicDetailsFields}</div>
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
      <h2 className={sectionTitleClass}>Scanning Section</h2>
      <div className="flex flex-col h-[calc(100%-20px)]">
        {deliveryDetailsFields}
      </div>
    </div>
  );

  const headerContent = (
    <div className="grid grid-cols-1 gap-1 xl:grid-cols-[minmax(0,5.0fr)_minmax(0,5.0fr)_minmax(0,9.0fr)] items-stretch">
      {basicDetailsSection}
      {deliveryDetailsSection}
      {customerDetailsSection}
    </div>
  );

  const footerContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-white">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1">
            Remarks
          </label>
          <textarea
            className="w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500 min-h-[60px] mb-2"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={readOnly}
            placeholder="Enter any remarks..."
          />
        </div>
      </div>
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
      <TransactionLayout
        title="Sales Return"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={
          <SalesDeliveryItems
            items={salesReturnBox}
            setSalesReturnBox={setSalesReturnBox}
            setCustomerId={setCustomerId}
            readOnly={effectiveReadOnly}
            id={id}
            termsRef={termsRef}
            isSupplierOutside={isSupplierOutside}
            isCustomerExport={isCustomerExport}
          />
        }
        footer={footerContent}
      />
    </>
  );
};

export default SalesDeliveryForm;
