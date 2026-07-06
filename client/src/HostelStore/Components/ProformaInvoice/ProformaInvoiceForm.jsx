import React, { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { TextInput, DropdownInput, DateInputNew } from "../../../Inputs";
import {
    useAddProformaInvoiceMutation,
    useUpdateProformaInvoiceMutation,
    useDeleteProformaInvoiceMutation,
    useGetProformaInvoiceByIdQuery,
    useGetProformaInvoiceQuery,
} from "../../../redux/uniformService/ProformaInvoiceService";
import { findFromList, getCommonParams, ModeChip } from "../../../Utils/helper";
import { dropDownListObject, dropDownListObjectMultiple } from "../../../Utils/contructObject";
import ProformaInvoiceItems from "./ProformaInvoiceItems.jsx";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import ProformaInvoicePrintFormat from "./ProformaInvoicePrintFormat.jsx";
import tw from "../../../Utils/tailwind-react-pdf";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiEdit2, FiSave, FiPrinter, FiEye } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import OrderEntryApi, {
    useGetOrderEntryQuery,
    useLazyGetOrderEntryByIdQuery,
} from "../../../redux/uniformService/OrderEntryService";
import {
    CommonFormFooter,
    TransactionActions,
    TransactionLayout,
} from "../../../Basic/components/Reuseable";
import {
    useGetTaxTemplateQuery,
    useGetTaxTemplateByIdQuery,
} from "../../../redux/services/TaxTemplateServices.js";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";
import PoSummary from "../PurchaseOrder/PoSummary";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import { PartyMaster } from "../index.js";
import { BankMaster, CurrencyMaster, PayTermMaster } from "../../../Basic/components/index.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { conversionTypes } from "../../../Utils/DropdownData.js";
import { useDispatch } from "react-redux";

const EMPTY_ROW = {
    styleItemId: "",
    sizeId: "",
    uomId: "",
    gsmId: "",
    hsnId: "",
    qty: "",
    price: "",
    amount: "",
};

const padItems = (itemsArray = []) => {
    const minLength = 14;
    const currentLength = itemsArray.length;
    if (currentLength < minLength) {
        const padding = Array.from({ length: minLength - currentLength }, () => ({
            ...EMPTY_ROW,
        }));
        return [...itemsArray, ...padding];
    }
    return itemsArray;
};

const ProformaInvoiceForm = ({
    readOnly,
    setReadOnly,
    id,
    setId,
    onClose,
    termsData,
    customerList,
    payTermList,
    currencyList,
    cityList,
    bankList,
    hasPermission
}) => {
    const { branchId, companyId, finYearId, userId } = getCommonParams();

    const [docId, setDocId] = useState("New");
    const [docDate, setDocDate] = useState(moment().format("YYYY-MM-DD"));
    const [userDate, setUserDate] = useState(moment().format("YYYY-MM-DD"));
    const [customerId, setCustomerId] = useState("");
    const [orderEntryId, setOrderEntryId] = useState("");
    const [remarks, setRemarks] = useState("");
    const [termsAndCondition, setTermsAndCondition] = useState("");
    const [termsId, setTermsId] = useState("");
    const [items, setItems] = useState(padItems([]));
    const [taxTemplateId, setTaxTemplateId] = useState("");
    const [summary, setSummary] = useState(false);
    const [discountType, setDiscountType] = useState("Percentage");
    const [discountValue, setDiscountValue] = useState(0);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [payTermId, setPayTermId] = useState("");
    const [validityTo, setValidityTo] = useState("");
    const [currencyId, setCurrencyId] = useState("");
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [loadingId, setLoadingId] = useState("");
    const [deliveryId, setDeliveryId] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [weightInKg, setWeightInKg] = useState("");
    const [carriageCharge, setCarriageCharge] = useState("");
    const [selectedQuoteVersion, setSelectedQuoteVersion] = useState("Latest");
    const [availableVersions, setAvailableVersions] = useState([]);
    const [bankId, setBankId] = useState("");
    const [conversionType, setConversionType] = useState("DOZEN");
    const childRecord = useRef(0);

    const customerRef = useRef(null);
    const termsRef = useRef(null);

    const isOldVersion = selectedQuoteVersion !== "Latest";
    const effectiveReadOnly = readOnly || isOldVersion || childRecord.current > 0;

    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        contactPerson: "",
        phone: "",
    });
    const dispatch = useDispatch();

    const { data: allData } = useGetProformaInvoiceQuery({
        params: { branchId },
    });
    const { data: singleData } = useGetProformaInvoiceByIdQuery(id, {
        skip: !id,
    });
    const { data: orderList } = useGetOrderEntryQuery({ params: { branchId } });
    const { data: taxTypeList } = useGetTaxTemplateQuery({
        params: { companyId },
    });
    const { data: supplierData } = useGetPartyByIdQuery(customerId, {
        skip: !customerId,
    });
    const [triggerGetOrderById] = useLazyGetOrderEntryByIdQuery();
    const [dispatchInvalidate] = useInvalidateTags();

    const [addData] = useAddProformaInvoiceMutation();
    const [updateData] = useUpdateProformaInvoiceMutation();
    const [removeData] = useDeleteProformaInvoiceMutation();

    const isCustomerExport = supplierData?.data?.isCustomerExport;
    const isCurrencySymbol = currencyList?.data?.find(
        (item) => item?.id === currencyId
    )?.symbol;
    useEffect(() => {
        if (!id && allData?.nextDocId) {
            setDocId(allData.nextDocId);
        }
    }, [id, allData]);

    useEffect(() => {
        if (id && singleData?.data) {
            const data = singleData.data;
            setDocId(data.docId);
            setDocDate(moment(data.docDate).format("YYYY-MM-DD"));
            setUserDate(data.userDate ? moment(data.userDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"));
            setCustomerId(data.customerId);
            setOrderEntryId(data.orderEntryId || "");
            setRemarks(data.remarks || "");
            setTermsAndCondition(data.termsAndCondition || "");
            setTermsId(data.termsId || "");
            setTaxTemplateId(data.taxTemplateId || "");
            setPayTermId(data.payTermId || "");
            setDiscountType(data.discountType || "Percentage");
            setDiscountValue(data.discountValue || 0);
            setValidityTo(data.validityTo ? moment(data.validityTo).format("YYYY-MM-DD") : "");
            setCurrencyId(data.currencyId || "");
            setLoadingId(data.loadingId || "");
            setDeliveryId(data.deliveryId || "");
            setDeliveryDate(data.deliveryDate ? moment(data.deliveryDate).format("YYYY-MM-DD") : "");
            setCarriageCharge(parseFloat(data.carriageCharge).toFixed(2) || "");
            setWeightInKg(parseFloat(data.weightInKg).toFixed(3) || "");
            setBankId(data.bankId || "");
            setConversionType(data.conversionType || "DOZEN");
            childRecord.current = data?.childRecord ? data?.childRecord : 0;

            let loadedVersions = [];
            if (data.items?.length > 0) {
                loadedVersions = [...new Set(data.items.map(i => i.quoteVersion).filter(Boolean))].sort((a, b) => b - a);
            }
            setAvailableVersions(loadedVersions);
            setSelectedQuoteVersion("Latest");

            const targetVersion = loadedVersions.length > 0 ? Math.max(...loadedVersions, 1) : 1;
            const filteredItems = (data.items || []).filter(i => (i.quoteVersion || 1) === targetVersion);
            setItems(padItems(filteredItems));

            const cust = data.customer || data.OrderEntry?.customer;
            if (cust) {
                setCustomerDetails({
                    name: cust.name || "",
                    contactPerson: cust.contactPersonName || "",
                    phone: cust.contactNumber || "",
                });
            }
        }
    }, [id, singleData]);

    useEffect(() => {
        if (singleData?.data?.items && id) {
            const itemsArr = singleData.data.items;
            const maxVersion = availableVersions.length > 0 ? Math.max(...availableVersions, 1) : 1;
            let targetVersion = maxVersion;

            if (selectedQuoteVersion !== "Latest") {
                targetVersion = parseInt(selectedQuoteVersion.replace("V", ""));
            }

            const filteredItems = itemsArr.filter(i => (i.quoteVersion || 1) === targetVersion);
            setItems(padItems(filteredItems));
        }
    }, [selectedQuoteVersion, singleData, id, availableVersions]);

    useEffect(() => {
        if (!conversionType) return;

        setItems((prev) =>
            prev.map((item) => {
                const qty = parseFloat(item.qty) || 0;
                const price = parseFloat(item.price) || 0;
                const dozen = qty / 12;

                return {
                    ...item,
                    dozen: dozen ? dozen.toFixed(2) : "",
                    amount:
                        conversionType === "DOZEN"
                            ? dozen && price ? (dozen * price).toFixed(2) : ""
                            : qty && price ? (qty * price).toFixed(2) : "",
                };
            })
        );
    }, [conversionType]);

    useEffect(() => {
        customerRef.current?.focus();
    }, []);

    const validateRows = (items) => {
        const errors = [];
        const seen = new Set();
        items.forEach((item, index) => {

            if (!item.styleItemId) {
                errors.push(`Row ${index + 1}: Style is required`);
            }
            if (!item.hsnId) {
                errors.push(`Row ${index + 1}: HSN is required`);
            }
            if (!item.uomId) {
                errors.push(`Row ${index + 1}: UOM is required`);
            }
            if (!item.qty || Number(item.qty) <= 0) {
                errors.push(`Row ${index + 1}: Qty is required`);
            }
            const key = `${item.styleItemId}_${item.uomId}`;
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
            Swal.fire({ title: "Warning", text: "Please select a Customer.", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (!isCustomerExport && !taxTemplateId) {
            Swal.fire({ title: "Warning", text: "Please select a Tax Template.", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }
        if (!payTermId) {
            Swal.fire({ title: "Warning", text: "Please select a Pay Term.", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (!validityTo) {
            Swal.fire({ title: "Warning", text: "Validity To is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (isCustomerExport && !currencyId) {
            Swal.fire({ title: "Warning", text: "Currency is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (isCustomerExport && !loadingId) {
            Swal.fire({ title: "Warning", text: "Loading Port is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (isCustomerExport && !deliveryId) {
            Swal.fire({ title: "Warning", text: "Delivery Port is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (!deliveryDate) {
            Swal.fire({ title: "Warning", text: "Delivery Date is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (!weightInKg) {
            Swal.fire({ title: "Warning", text: "Weight is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        if (isCustomerExport && !bankId) {
            Swal.fire({ title: "Warning", text: "Bank is required", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        const filteredItems = items.filter((item) => item.styleItemId);

        if (filteredItems.length === 0) {
            Swal.fire({ title: "Warning", text: "Please add at least one item.", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }
        const rowErrors = validateRows(filteredItems);
        if (rowErrors.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Row Validation Error",
                html: `<div style="text-align:left">${rowErrors.join("<br/>")}</div>`,
            });
            return false;
        }
        const hasMissingPrice = filteredItems.some((item) => !item.price || parseFloat(item.price) <= 0);
        if (hasMissingPrice) {
            Swal.fire({ title: "Warning", text: "Please enter a valid price for all selected items.", icon: "warning", confirmButtonColor: "#3085d6" });
            return;
        }

        const payload = {
            userId,
            branchId,
            companyId,
            finYearId,
            docDate,
            userDate,
            customerId,
            // orderEntryId,
            remarks,
            termsAndCondition,
            termsId,
            taxTemplateId,
            items: JSON.stringify(filteredItems),
            payTermId,
            discountType,
            discountValue,
            validityTo,
            currencyId,
            loadingId,
            deliveryId,
            deliveryDate,
            weightInKg,
            carriageCharge,
            bankId,
            conversionType
        };

        try {
            let savedId = id;
            if (id) {
                await updateData({ id, body: payload }).unwrap();
                Swal.fire({
                    title: "Success", text: "Proforma Invoice updated successfully", icon: "success", timer: 1500, showConfirmButton: false, didClose: () => {
                        customerRef.current.focus();
                    }
                });
            } else {
                const res = await addData(payload).unwrap();
                savedId = res.data.id;
                setId(savedId);
                Swal.fire({
                    title: "Success", text: "Proforma Invoice created successfully", icon: "success", timer: 1500, showConfirmButton: false, didClose: () => {
                        customerRef.current.focus();
                    }
                });
            }
            dispatch(OrderEntryApi.util.invalidateTags(["orderEntry"]));
            setReadOnly(true);
            dispatchInvalidate();

            if (pendingAction === "new") {
                onNew();
            } else if (pendingAction === "close") {
                onClose();
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: error.data?.message || "Failed to save Proforma Invoice", icon: "error", confirmButtonColor: "#d33" });
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
        // setOrderEntryId("");
        setRemarks("");
        setTermsAndCondition("");
        setTermsId("");
        setTaxTemplateId("");
        setPayTermId("");
        setItems(padItems([]));
        setCustomerDetails({ name: "", contactPerson: "", phone: "" });
        setSelectedQuoteVersion("Latest");
        setAvailableVersions([]);
        setDiscountType("Percentage");
        setDiscountValue(0);
        setLoadingId("");
        setDeliveryId("");
        setDeliveryDate("");
        setWeightInKg("");
        setCarriageCharge("");
        setValidityTo("");
        setCurrencyId("");
        setAccordionOpen(false);
        setBankId("");
    };

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

    const totalAmount = items.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
    );

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
            hidden: !readOnly || !id || isOldVersion,
        },
        {
            key: "summary",
            icon: <FiEye className="h-4 w-4" />,
            hoverLabel: "View Summary",
            iconOnly: true,
            onClick: () => {
                if (!taxTemplateId) {
                    Swal.fire({ title: "Information", text: "Please Select Tax Template !", icon: "info", confirmButtonColor: "#3085d6" });
                    return;
                }
                setSummary(true);
            },
            onKeyDown: (e) => {
                if (!taxTemplateId) {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.info("Please Select Tax Template !", {
                        position: "top-center",
                    });
                    return;
                }
                if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    setSummary(true);
                }
            },
            className:
                "bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition",
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

    const shippingAccordion = (
        <div className="border border-slate-200 rounded-md bg-white shadow-sm mt-1">
            {/* Accordion Header */}
            <button
                type="button"
                onClick={() => setAccordionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left"
            >
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Other Details
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${accordionOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Accordion Body */}
            {accordionOpen && (
                <div className="px-3 pb-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-8 gap-2 w-fit">
                        {
                            isCustomerExport && (
                                <>
                                    <DropdownInput
                                        name="Loading Port"
                                        options={dropDownListObject(
                                            cityList?.data?.filter((item) => item.active),
                                            "name",
                                            "id",
                                        )}
                                        value={loadingId}
                                        setValue={setLoadingId}
                                        readOnly={readOnly}
                                        required={true}
                                    />
                                    <DropdownInput
                                        name="Delivery Port"
                                        options={dropDownListObject(
                                            cityList?.data?.filter((item) => item.active),
                                            "name",
                                            "id",
                                        )}
                                        value={deliveryId}
                                        setValue={setDeliveryId}
                                        readOnly={readOnly}
                                        required={true}
                                    />
                                </>
                            )
                        }
                        <DateInputNew
                            name="Delivery Date"
                            value={deliveryDate}
                            setValue={setDeliveryDate}
                            disabled={readOnly}
                            type="date"
                            required={true}
                        />
                        <div className="col-span-1 flex flex-col gap-1">
                            <DropdownInput
                                name="Conversion"
                                options={conversionTypes}
                                value={conversionType}
                                setValue={(value) => setConversionType(value)}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0 || readOnly}
                            />

                        </div>
                        <TextInput
                            name="WeightInKg (KG)"
                            value={weightInKg}
                            setValue={setWeightInKg}
                            disabled={readOnly}
                            type="number"
                            min="0"
                            className="text-right"
                            required={true}
                            onBlur={(e) =>
                                setWeightInKg(
                                    e.target.value ? Number(e.target.value).toFixed(3) : "",
                                )
                            }
                            onFocus={(e) => {
                                e.target.select();
                            }}
                        />

                        <TextInput
                            name={`Carriage and Air Freight ${currencyId ? `(${isCurrencySymbol})` : ""}`}
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

                        <div className="col-span-2">
                            <DropdownWithModal
                                name="Advising Bank"
                                options={dropDownListObjectMultiple(
                                    id
                                        ? bankList?.data
                                        : bankList?.data?.filter(
                                            (item) => item?.active,
                                        ),
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

                    </div>
                </div>
            )}
        </div>
    );

    const headerContent = (
        <>
            <div className="flex flex-col md:flex-row gap-1 w-full">
                <div className="flex flex-col md:flex-row gap-1 w-full">

                    <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                            Basic Details
                        </h2>
                        <div className="flex gap-2">
                            <div className="w-36">
                                <TextInput name="PI No" value={docId} disabled={true} />
                            </div>
                            <div className="w-32">
                                <DateInputNew
                                    name="PI Date"
                                    value={docDate}
                                    setValue={setDocDate}
                                    disabled={true}
                                    required={true}
                                    type="date"
                                />
                            </div>
                            <div className="w-32">
                                <DateInputNew
                                    name="User Date"
                                    value={userDate}
                                    setValue={setUserDate}
                                    disabled={effectiveReadOnly}
                                    required={false}
                                    type="date"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                        <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                            Customer Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-8 gap-2">
                            {/* <div className="md:col-span-1">
                        <DropdownInput
                            name="Order No"
                            options={dropDownListObject(orderList?.data, "docId", "id")}
                            value={orderEntryId}
                            setValue={setOrderEntryId}
                            readOnly={effectiveReadOnly}
                            required={true}
                        />
                    </div> */}
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
                                    className={`w-[150px]`}
                                    addNewLabel="+ Add New Customer"
                                    childComponent={PartyMaster}
                                    addNewModalWidth="w-[90%] h-[95%]"
                                    disabled={readOnly || childRecord.current > 0}
                                    openOnFocus={true}
                                    // autoFocus={true}
                                    ref={customerRef}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <TextInput
                                    name="Contact Person"
                                    placeholder="Contact name"
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
                                    placeholder="Contact name"
                                    value={findFromList(
                                        customerId,
                                        customerList?.data,
                                        "contactNumber",
                                    )}
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
                                    className={`w-full max-w-none`}
                                    dropdownMinWidth={240}
                                    addNewLabel="+ Add New Pay Term"
                                    childComponent={PayTermMaster}
                                    addNewModalWidth="w-[40%] h-[66%]"
                                />
                            </div>
                            <div className="">
                                <DateInputNew
                                    name="Valid To"
                                    value={validityTo}
                                    setValue={setValidityTo}
                                    disabled={readOnly}
                                    required={true}
                                    type="date"
                                />
                            </div>
                            {
                                isCustomerExport && (
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
                                )
                            }
                        </div>
                    </div>
                </div>

            </div>
            {shippingAccordion}
        </>
    );

    const isSupplierOutside = useMemo(() => {
        return supplierData?.data?.City?.state?.name !== "TAMILNADU";
    }, [supplierData]);

    const enrichedData = useMemo(() => {
        const filteredItems = items.filter((i) => i.styleItemId);
        if (!filteredItems.length)
            return {
                items: [],
                gross: 0,
                taxable: 0,
                net: 0,
                slabBreakup: [],
                roundOff: 0,
            };

        // We need taxPercent for each item. If missing, we should ideally get it from HSN master.
        // For now, we'll try to use what's in the item.
        return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
            filteredItems,
            isSupplierOutside,
            discountType,
            discountValue,
            conversionType === "DOZEN" ? true : false
        );
    }, [items, isSupplierOutside, discountType, discountValue, conversionType]);

    const versionDropdown = (
        <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-500 mt-1">Version</span>

            <div className="relative">
                <select
                    value={selectedQuoteVersion}
                    onChange={(e) => setSelectedQuoteVersion(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md pl-2 pr-6 py-1 
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 
                   hover:border-gray-400 transition"
                >
                    {availableVersions.length > 0 ? (
                        availableVersions.map((v) => (
                            <option key={v} value={Math.max(...availableVersions) === v ? "Latest" : `V${v}`}>
                                {Math.max(...availableVersions) === v ? "Latest" : `V${v}`}
                            </option>
                        ))
                    ) : (
                        <option value="Latest">Latest</option>
                    )}
                </select>

                {/* Custom arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-gray-400">
                    <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );

    const totalQty = enrichedData?.items?.reduce(
        (sum, item) => sum + (parseFloat(item.qty)),
        0,
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
                termOptions={
                    termsData?.data?.map((item) => ({
                        value: item.id,
                        label: item.name,
                        templateText: item.description || "",
                    })) || []
                }
                totalsRows={[
                    {
                        key: "totalQty",
                        label: "Total Qty",
                        value: totalQty.toFixed(2),
                        summaryColumn: "right",
                        emphasized: true,

                    },
                    {
                        key: "grossAmount",
                        label: "Gross Amount",
                        value: `${isCurrencySymbol ? isCurrencySymbol : ''} ${isCustomerExport ? enrichedData.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2) : enrichedData.gross.toFixed(2)}`,
                        summaryColumn: "right",
                        emphasized: true,

                    },

                    ...(!isCustomerExport
                        ? [
                            {
                                key: "netAmount",
                                label: "Net Amount",
                                value: `${isCurrencySymbol ? isCurrencySymbol : ''} ${enrichedData.net.toFixed(2)}`,
                                summaryColumn: "right",
                                emphasized: true,
                            },
                        ]
                        : [
                            {
                                key: "carriageCharge",
                                label: "Carraige Charges",
                                value: `${isCurrencySymbol ? isCurrencySymbol : ''} ${carriageCharge}`,
                                summaryColumn: "right",
                                emphasized: true,
                            },
                        ]),
                ]}
            />
            <TransactionActions
                leftActions={leftActions}
                rightActions={rightActions}
            />
        </>
    );

    return (
        <>
            <Modal
                isOpen={summary}
                onClose={() => setSummary(false)}
                widthClass=""
            >
                <PoSummary
                    poItems={items}
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

            <Modal
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                    <ProformaInvoicePrintFormat data={{
                        ...singleData?.data,
                        items: items.filter((i) => i.styleItemId), // ✅ only current version's filled items
                    }}
                        taxDetails={enrichedData}
                        isCustomerExport={isCustomerExport}
                        cityList={cityList}
                        currencyList={currencyList}
                        payTermList={payTermList}
                    />
                </PDFViewer>
            </Modal>

            <TransactionLayout
                title="Proforma Invoice"
                badge={<ModeChip id={id} readOnly={readOnly} />}
                closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
                onClose={onClose}
                onKeyDown={handleKeyDown}
                header={headerContent}
                detailsLayout="default"
                detailsLayouts={["default"]}
                gridItems={
                    <ProformaInvoiceItems
                        items={items}
                        enrichedItems={enrichedData}
                        setItems={setItems}
                        readOnly={effectiveReadOnly}
                        taxTemplateId={taxTemplateId}
                        id={id}
                        isCurrencySymbol={isCurrencySymbol}
                        termsRef={termsRef}
                        isCustomerExport={isCustomerExport}
                        conversionType={conversionType}
                        isSupplierOutside={isSupplierOutside}
                    />
                }
                footer={footerContent}
                versionDropdown={id ? versionDropdown : null}
            />
        </>
    );
};

export default ProformaInvoiceForm;