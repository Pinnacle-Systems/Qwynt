import { IoArrowBackCircleSharp } from "react-icons/io5";
import {
    DateInputNew,
    DropdownInput,
    DropdownNew,
    TextInput,
} from "../../../Inputs/index.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { findFromList, getCommonParams, isGridDatasValid, ModeChip } from "../../../Utils/helper.js";
import { toast } from "react-toastify";
import { FiEdit2, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { TransactionLayout } from "../../../Basic/components/Reuseable/index.js";
import { dropDownListObject } from "../../../Utils/contructObject.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { PartyMaster } from "../index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import ReusableFormFooter from "../../../Basic/components/Reuseable/ReuseableFormFooter.jsx";
import BillDetails, { DEFAULT_ROW_COUNT, makeEmptyRow } from "./BillDetails.jsx";
import { useGetJobCardListQuery } from "../../../redux/uniformService/JobCardService.js";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService.js";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService.js";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary.js";
import PoSummary from "../PurchaseOrder/PoSummary.js";
import Modal from "../../../UiComponents/Modal/index.js";
import { useAddProcessBillMutation, useGetProcessBillByIdQuery, useUpdateProcessBillMutation } from "../../../redux/uniformService/ProcessBillService.js";
import { useGetProductionInwardJobCardDtlsQuery, useGetProductionInwardQuery } from "../../../redux/uniformService/ProductionInwardService.js";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";

const EMPTY_ROW = {
    billedQty: "",
    price: "",
    discountType: "",
    discountValue: "",
    taxPercent: "",
    jobCardId: "",
    productionInwardId: "",
    processes: [],
    acceptedQty: "",
};

const padItems = (itemsArray = []) => {
    const currentLength = itemsArray.length;
    if (currentLength < DEFAULT_ROW_COUNT) {
        const padding = Array.from({ length: DEFAULT_ROW_COUNT - currentLength }, () => ({
            ...EMPTY_ROW,
        }));
        return [...itemsArray, ...padding];
    }
    return itemsArray;
};

const ProcessBillForm = ({
    onClose,
    id,
    setId,
    readOnly,
    setReadOnly,
    supplierList,
    taxTypeList,
    hasPermission,
}) => {
    const today = new Date();
    const [docDate, setDocDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
    const [supplierId, setSupplierId] = useState("");
    const [remarks, setRemarks] = useState("");
    const [docId, setDocId] = useState("");
    const [billDetails, setBillDetails] = useState(
        Array.from({ length: DEFAULT_ROW_COUNT }, makeEmptyRow)
    );
    const supplierRef = useRef(null);
    const childRecord = useRef(0);
    const [dispatchInvalidate] = useInvalidateTags();
    const { userId, finYearId, branchId, companyId } = getCommonParams();
    const params = { branchId, companyId, finYearId };
    const [searchDocId, setSearchDocId] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchJobCard, setSearchJobCard] = useState("");
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [tempItems, setTempItems] = useState([]);
    const [dataPerPage, setDataPerPage] = useState("10");
    const [discountType, setDiscountType] = useState("Percentage");
    const [discountValue, setDiscountValue] = useState();
    const [netBillValue, setNetBillValue] = useState("");
    const [taxTemplateId, setTaxTemplateId] = useState("");
    const [summary, setSummary] = useState(false);

    const searchFields = {
        searchDocId,
        searchDocDate,
        searchJobCard,
    };

    const {
        data: productionInwardDtlsData,
        isLoading: isProductionInwardDtlsLoading,
        isFetching: isProductionInwardDtlsFetching,
    } = useGetProductionInwardJobCardDtlsQuery({
        params: {
            branchId,
            supplierId,
            ...searchFields,
            pagination: true,
            dataPerPage,
            pageNumber: currentPageNumber,
        },
    });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetProcessBillByIdQuery(id, { skip: !id });

    const { data: jobCardList } = useGetJobCardListQuery({ params: { companyId, branchId } });
    const { data: processList } = useGetProcessMasterQuery({ params: { companyId } });
    const { data: inwardList } = useGetProductionInwardQuery({ params: { branchId, companyId, finYearId } });
    const { data: supplierData } = useGetPartyByIdQuery(supplierId, {
        skip: !supplierId,
    });

    const isSupplierOutside = useMemo(() => {
        return supplierData?.data?.City?.state?.name !== "TAMILNADU";
    }, [supplierData]);

    const [addData] = useAddProcessBillMutation();
    const [updateData] = useUpdateProcessBillMutation();

    const syncFormWithDbItems = useCallback(
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
                    ? moment.utc(data.docDate).format("YYYY-MM-DD")
                    : moment.utc(new Date()).format("YYYY-MM-DD"),
            );
            setSupplierId(data?.supplierId || "");
            setRemarks(data?.remarks || "");
            childRecord.current = data?.childRecord ? data?.childRecord : 0;

            const billDetails = data?.processBillDtls?.length
                ? data.processBillDtls.map((item) => ({
                    ...item,

                    // convert inwardProcessDtls -> processes array
                    processes:
                        item?.billingProcesses?.map(
                            (process) => process.processId
                        ) || [],
                }))
                : []
            setBillDetails(padItems(billDetails));
            setDiscountType(data?.discountType || "");
            setDiscountValue(data?.discountValue || "");
            setNetBillValue(parseFloat(data?.netBillValue)?.toFixed(2) || "");
            setTaxTemplateId(data?.taxTemplateId || "");
        },
        [id],
    );

    useEffect(() => {
        setCurrentPageNumber(1);
    }, [searchDocId, searchDocDate, searchJobCard]);

    useEffect(() => {
        if (productionInwardDtlsData?.data) {
            syncFormWithDbItems(productionInwardDtlsData?.data);
        }
    }, [isProductionInwardDtlsLoading, isProductionInwardDtlsFetching, syncFormWithDbItems, productionInwardDtlsData]);

    useEffect(() => {
        if (id && singleData?.data) {
            syncFormWithDb(singleData.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id,
        docDate,
        branchId,
        userId,
        supplierId,
        remarks,
        finYearId,
        billDetails: billDetails?.filter((i) => i.jobCardId),
        discountType,
        discountValue,
        netBillValue,
        taxTemplateId,
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
                            if (nextProcess === "new") {
                                setId(0);
                                setDocId("New");
                                syncFormWithDb(undefined);
                                setTimeout(() => { supplierRef.current?.focus(); }, 100);
                            }
                            if (nextProcess === "close") {
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

    const validateData = (data) => {
        const items = data?.billDetails || [];
        const isAmountMatched =
            Number(data?.netBillValue).toFixed(2) ===
            parseFloat(totals?.net || 0).toFixed(2);
        const checks = [
            { condition: !data.supplierId, title: "Supplier is required!" },
            {
                condition: !data.netBillValue,
                title: "Bill Value is required!",
            },
            {
                condition: !data.taxTemplateId,
                title: "Tax Template is required!",
            },

            {
                condition: items.length === 0,
                title: "Please add at least one item!",
            },
            {
                condition: !isGridDatasValid(data?.billDetails, false, [
                    "billedQty", "price"
                ]),
                title: "Please fill all required item fields!",
            },
            {
                condition: !isAmountMatched,
                title: "Total Bill Value and Total Net Amount must be Equal.",
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
        if (!validateData(data)) return;
        if (id) {
            if (!window.confirm("Are you sure update the details ...?")) return;
        }
        if (id) {
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
        supplierRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!id) {
            setTaxTemplateId(
                taxTypeList?.data?.filter((item) => item.name === "DEFAULT")[0]?.id,
            );
        }
    }, []);

    const enrichedItems = useMemo(() => {
        if (!billDetails?.length) return billDetails;
        const { items, ...totals } =
            calculateTaxWithHSNBreakupAndInsertIntoPoItems(
                structuredClone(billDetails), // clone to avoid mutating state
                isSupplierOutside,
                discountType,
                discountValue,
                false,
                "billedQty",
            );
        return { items, totals };
    }, [billDetails, discountType, discountValue, isSupplierOutside]);

    const enrichedItemsList = enrichedItems?.items || [];
    const totals = enrichedItems?.totals || {};

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
                    poItems={billDetails}
                    taxTypeId={taxTemplateId}
                    readOnly={readOnly}
                    totals={totals}
                    setSummary={setSummary}
                />
            </Modal>
            <TransactionLayout
                title="Process Bill"
                badge={<ModeChip id={id} readOnly={readOnly} />}
                closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
                onClose={onClose}
                onKeyDown={handleKeyDown}
                header={
                    <div className="flex flex-col xl:flex-row gap-1">
                        {/* Basic Details */}
                        <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">Basic Details</h2>
                            <div className="flex gap-2">
                                <div className="w-36">
                                    <TextInput name="Process Bill No" value={docId} disabled={true} />
                                </div>
                                <div className="w-28">
                                    <DateInputNew
                                        name="Process Bill Date"
                                        value={docDate}
                                        setValue={setDocDate}
                                        disabled={readOnly}
                                        required={true}
                                        type="date"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Supplier Details - shown first per requirement */}
                        <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                                Supplier Details
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="md:col-span-2">
                                    <DropdownWithModal
                                        name="Supplier"
                                        options={dropDownListObject(
                                            id
                                                ? supplierList?.data?.filter((item) => item?.isSupplier)
                                                : supplierList?.data?.filter((item) => item?.active && item?.isSupplier),
                                            "name",
                                            "id",
                                        )}
                                        value={supplierId}
                                        setValue={setSupplierId}
                                        required={true}
                                        readOnly={readOnly}
                                        className="w-full"
                                        addNewLabel="+ Add New Supplier"
                                        childComponent={PartyMaster}
                                        addNewModalWidth="w-[90%] h-[95%]"
                                        disabled={childRecord.current > 0 || readOnly}
                                        openOnFocus={true}
                                        ref={supplierRef}
                                    />
                                </div>
                                <div>
                                    <TextInput
                                        name="Contact Person"
                                        placeholder="Contact name"
                                        value={findFromList(supplierId, supplierList?.data, "contactPersonName")}
                                        disabled={true}
                                    />
                                </div>
                                <div>
                                    <TextInput
                                        name="Phone"
                                        placeholder="Contact number"
                                        value={findFromList(supplierId, supplierList?.data, "contactNumber")}
                                        disabled={true}
                                        className="w-20"
                                    />
                                </div>




                            </div>
                        </div>

                        {/* Outward & Job Card Details */}
                        <div className="flex-1 border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">Bill Details</h2>
                            <div className="flex gap-2 px-0.5">
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
                                    disabled={childRecord.current > 0 || readOnly}
                                />

                                <div className="w-28">
                                    <TextInput
                                        name={"Net Bill Value"}
                                        value={netBillValue}
                                        setValue={setNetBillValue}
                                        readOnly={readOnly || childRecord.current > 0}
                                        required={true}
                                        type={"number"}
                                        onFocus={(e) => {
                                            e.target.select();
                                        }}
                                        onBlur={(e) =>
                                            setNetBillValue(
                                                e.target.value ? Number(e.target.value).toFixed(2) : "",
                                            )
                                        }
                                        disabled={childRecord.current > 0 || readOnly}
                                        className={"text-right"}
                                    />
                                </div>



                            </div>
                        </div>
                    </div>
                }
                detailsLayout="default"
                detailsLayouts={["default"]}
                gridItems={
                    <BillDetails
                        billDetails={billDetails}
                        enrichedItems={enrichedItems}
                        setBillDetails={setBillDetails}
                        readOnly={readOnly}
                        processList={processList}
                        id={id}
                        childRecord={childRecord}
                        setTempItems={setTempItems}
                        tempItems={tempItems}
                        searchDocId={searchDocId}
                        setSearchDocId={setSearchDocId}
                        setSearchDocDate={setSearchDocDate}
                        searchDocDate={searchDocDate}
                        searchJobCard={searchJobCard}
                        setSearchJobCard={setSearchJobCard}
                        supplierId={supplierId}
                        jobCardList={jobCardList}
                        productionInwardList={inwardList}
                        isSupplierOutside={isSupplierOutside}
                        taxTemplateId={taxTemplateId}
                    />
                }
                footer={
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                            {/* Remarks */}
                            <div className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm">
                                <div className="flex h-full flex-col gap-1">
                                    <h2 className="text-[12px] font-bold text-slate-700">
                                        Remarks
                                    </h2>

                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        readOnly={readOnly}
                                        placeholder="Additional notes..."
                                        className="min-h-[2.5rem] flex-1 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                <h2 className="mb-1 text-[12px] font-bold text-slate-700">
                                    Qty Summary
                                </h2>

                                <div className="flex justify-between text-[12px] font-medium">
                                    <span>Billed Qty</span>
                                    <span>
                                        {billDetails?.reduce(
                                            (acc, i) => acc + (Number(i.billedQty) || 0),
                                            0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">

                                <h2 className="mb-1 text-[12px] font-bold text-slate-700">
                                    Amount Summary
                                </h2>

                                <div className="flex justify-between text-[12px]">
                                    <span>Gross Amount</span>
                                    <span>
                                        Rs.{billDetails
                                            ?.reduce((sum, row) => {
                                                const qty = parseFloat(row.billedQty) || 0;
                                                const price = parseFloat(row.price) || 0;
                                                return sum + qty * price;
                                            }, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[12px]">
                                    <span>Taxable Amount</span>
                                    <span className="">
                                        Rs.{parseFloat(totals?.taxable || 0).toFixed(2)}{" "}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[12px] font-medium">
                                    <span>Net Amount</span>
                                    <span>
                                        Rs.{parseFloat(totals?.net || 0).toFixed(2)}
                                    </span>
                                </div>

                            </div>


                        </div>
                        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                            <div className="flex gap-2 flex-wrap">
                                {
                                    !readOnly && (

                                        <button
                                            onClick={() => saveData("close")}
                                            disabled={readOnly}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") { e.preventDefault(); saveData("close"); e.stopPropagation(); }
                                            }}
                                            className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs"
                                        >
                                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                            Save & Close
                                        </button>
                                    )
                                }
                                {
                                    !readOnly && (

                                        <button
                                            onClick={() => saveData("new")}
                                            disabled={readOnly}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); saveData("new"); }
                                            }}
                                            className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs"
                                        >
                                            <FiSave className="w-4 h-4 mr-2" />
                                            Save & New
                                        </button>
                                    )
                                }
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {!id ||
                                    (readOnly && (
                                        <button
                                            className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700 flex items-center text-xs"
                                            onClick={() => hasPermission(() => setReadOnly(false), "edit")}
                                        >
                                            <FiEdit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                    ))}

                                <button
                                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800 flex items-center text-xs font-medium"
                                    onClick={() => {
                                        console.log(taxTemplateId);
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
                    </>
                }
            />
        </>
    );
};

export default ProcessBillForm;