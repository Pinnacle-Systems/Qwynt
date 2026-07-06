import { FaFileAlt } from "react-icons/fa"
import { DateInputNew, DropdownInput, DropdownInputNew, ReusableInput, ReusableInputNew, ReusableSearchableInput, ReusableSearchableInputNew, ReusableSearchableInputNewCustomer, ReusableSearchableInputNewCustomerwithBranches, ShowInvoicPendingCustomers, TextAreaNew, TextInput, TextInputNew, TextInputNew1 } from "../../../Inputs";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { findFromList, formatAmountIN, isGridDatasValid } from "../../../Utils/helper";
import { deliveryTypes } from "../../../Utils/DropdownData";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { dropDownListObject } from "../../../Utils/contructObject";
// import DeliveryItems from "./DeliveryItems";
import { useGetStyleMasterQuery } from "../../../redux/services/StyleMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import DeliveryChallanApi, { useAddDeliveryChallanMutation, useGetDeliveryChallanByIdQuery, useGetDeliveryChallanItemsQuery, useUpdateDeliveryChallanMutation } from "../../../redux/services/DeliveryChallanService";
import Swal from "sweetalert2";
import partyMasterApi, { useGetPartyByIdQuery, useGetPartyNewQuery } from "../../../redux/services/PartyMasterService";
import InvoiceItems from "./InvoiceItems";
import Modal from "../../../UiComponents/Modal";
import DeliveryItemsSelection from "./DeliveyItemsSelction";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService";
import PoSummary from "./PoSummary";
import DeliveryInvoiceApi, { useAddDeliveryInvoiceMutation, useGetDeliveryInvoiceByIdQuery, useUpdateDeliveryInvoiceMutation } from "../../../redux/services/DeliveryInvoiceService";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import DeliveryInvoice from "./PrintFormat-PO";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails";
import { groupBy } from "lodash";
import { useGetTaxTermMasterQuery } from "../../../redux/services/TaxTermMasterServices";
import { useDispatch } from "react-redux";
import PopUp from "./Pop";
import pageDetailsApi from "../../../redux/services/PageMasterService";

const InvoiceForm = ({
    onClose, id, setId, readOnly, setReadOnly, docId, setDocId, poItems, setPoItems, setTempPoItems, onNew, supplierList, params, termsData, branchList, hsnData,
}) => {

    const today = new Date()

    const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
    const [taxTemplateId, setTaxTemplateId] = useState("");
    const [payTermId, setPayTermId] = useState("");
    const [dcDate, setDcDate] = useState("");
    const [poType, setPoType] = useState("Order Purchase");
    const [poMaterial, setPoMaterial] = useState("DyedYarn")
    const [supplierId, setSupplierId] = useState("");
    const [term, setTerm] = useState("")

    const [discountType, setDiscountType] = useState("");
    const [discountValue, setDiscountValue] = useState(0);
    const [orderId, setOrderId] = useState("")
    const [remarks, setRemarks] = useState("")
    const [PurchaseType, setPurchaseType] = useState('General Purchase')
    const [summary, setSummary] = useState(false);
    const [tempInvoiceItems, setTempInvoiceItems] = useState([])

    const [invoiceItems, setInvoiceItems] = useState([])

    const [deliveryType, setDeliveryType] = useState("")
    const [deliveryToId, setDeliveryToId] = useState("")
    const [showExtraCharge, setShowExtraCharge] = useState(false)
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [tableDataView, setTableDataView] = useState(false)
    const [dcNo, setDcNo] = useState("");
    const [transporter, setTransporter] = useState("");
    const [vehicleNo, setVechileNo] = useState("");
    const [transportMode, setTransportMode] = useState("")
    const allSuppliers = supplierList ? supplierList.data : []
    const [termsandcondtions, setTermsAndConditions] = useState("")
    const [nextprocess, setNextProcess] = useState("")
    const [isPrintOpen, setIsPrintOpen] = useState(false)


    const { branchId, finYearId, companyId } = params;


    const { data: styleList } = useGetStyleMasterQuery({ params: { ...params } });
    const { data: styleItemList } = useGetStyleItemMasterQuery({ params: { ...params } });
    const { data: uomList } = useGetUomQuery({ params: { ...params } });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params } });

    // const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
    //     useGetTaxTemplateQuery({ params: { ...params } });
    const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
        useGetTaxTermMasterQuery({ params: { ...params } });


    const { data: supplierDetails } =
        useGetPartyByIdQuery(supplierId, { skip: !supplierId });


    const { data: deliveryItemsData, isFetching, isLoading } = useGetDeliveryChallanItemsQuery({
        params: {
            supplierId,
            dcNo,
            pagination: true
        }
    });

    const dispatch = useDispatch();


    useEffect(() => {
        if (!deliveryItemsData?.data) return;

        const result = deliveryItemsData.data.map(i => {
            const totalQty =
                i.DeliveryInvoiceItems?.reduce(
                    (sum, next) => sum + Number(next.invoiceQty || 0),
                    0
                ) || 0;

            return {
                ...i,
                totalQty,
                balanceQty: Math.max(0, Number(i.qty || 0) - totalQty),
            };
        });

        console.log(result, "result");
        setTempInvoiceItems(result);

    }, [deliveryItemsData]);



    const { data: branchdata } = useGetBranchByIdQuery(branchId, { skip: !branchId });



    console.log(deliveryItemsData, "deliveryItemsData")


    const [addData] = useAddDeliveryInvoiceMutation();
    const [updateData] = useUpdateDeliveryInvoiceMutation();



    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetDeliveryInvoiceByIdQuery(id, { skip: !id });


    const inputRef = useRef(null);
    const customerRef = useRef(null)
    const customerDate = useRef(null)

    useEffect(() => {
        if (id) return;
        inputRef.current?.focus();
    }, []);



    const { data: partyList } = useGetPartyNewQuery({
        params: { companyId, isAddessCombined: true, id, supplierId },
    });

    const syncFormWithDb = useCallback((data) => {

        setDate(data?.createdAt
            ? moment.utc(data.createdAt).format("YYYY-MM-DD")
            : moment.utc(new Date()).format("YYYY-MM-DD")
        );
        setDocId(data?.docId ? data?.docId : "New");
        setTransportMode(data?.transportMode ? data?.transportMode : "")
        setTransporter(data?.transporter ? data?.transporter : "")
        setVechileNo(data?.vehicleNo ? data?.vehicleNo : '')
        setTaxTemplateId(data?.taxPercent ? data?.taxPercent : '')
        setDiscountType(data?.discountType ? data?.discountType : "")
        setDiscountValue(data?.discountValue ? data?.discountValue : "")


        setSupplierId(data?.supplierId ? data?.supplierId : "");
        setInvoiceItems(
            (data?.DeliveryInvoiceItems || []).map(i => ({
                ...i,
                qty: i.DeliveryChallanItems?.qty ? parseInt(i.DeliveryChallanItems?.qty).toFixed(3) : "",
                noOfBox: i.noOfBox ? parseFloat(i.noOfBox).toFixed(3) : "",
                invoiceQty: i.invoiceQty ? parseInt(i.invoiceQty).toFixed(3) : "",
                price: i.price ? parseFloat(i.price).toFixed(2) : '',
                balanceQty: i.DeliveryChallanItems?.qty
            }))
        );

        setDcDate(data?.dueDate
            ? moment.utc(data.dueDate).format("YYYY-MM-DD")
            : ""
        );
        setDeliveryType(data?.deliveryType || "");
        setDeliveryToId(
            data?.deliveryType === "ToSelf"
                ? data?.deliveryBranchId
                : data?.deliveryPartyId || ""
        );
        setRemarks(data?.remarks || "");
        setTermsAndConditions(data?.termsandcondtions ? data?.termsandcondtions : "")
        console.log(id, "iddddddddd")

    }, [id]);




    useEffect(() => {
        if (id && singleData?.data) {
            syncFormWithDb(singleData.data);
        }

    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



    const totalAmount = invoiceItems?.reduce((sum, item) => {
        const qty = Number(item?.invoiceQty ?? 0);
        const price = Number(item?.price ?? 0);
        return sum + qty * price;
    }, 0);

    // 2️⃣ Discount Amount
    let discountAmount = 0;

    if (discountType == "Percentage") {
        discountAmount = (totalAmount * Number(discountValue || 0)) / 100;
    }
    else if (discountType == "Flat") {
        discountAmount = Number(discountValue || 0);
    }
    const result = invoiceItems?.filter(i => i.styleId)?.reduce(
        (acc, item) => {
            const amount = item.invoiceQty * item.price;
            const tax = item?.Hsn?.tax
            const halfGst = tax / 2;


            console.log(tax, "tax", amount)

            const cgstAmount = amount * (halfGst / 100);
            const sgstAmount = amount * (halfGst / 100);
            const itemTax = cgstAmount + sgstAmount;



            // acc.items.push({
            //   ...item,
            //   amount,
            //   cgstRate: halfGst,
            //   sgstRate: halfGst,
            //   cgstAmount,
            //   sgstAmount,
            //   itemTax
            // });

            acc.totalCgst += cgstAmount;
            acc.totalSgst += sgstAmount;
            acc.overallTax += itemTax;
            acc.subTotal += amount;

            return acc;
        },
        {
            // items: [],
            totalCgst: 0,
            totalSgst: 0,
            overallTax: 0,
            subTotal: 0
        }
    );


    console.log(result, "result");
    const netAmount = Math.max(totalAmount - discountAmount, 0) + (parseFloat(result?.totalSgst) + parseFloat(result?.totalCgst))
    const roundedNetAmount = Math.round(netAmount);
    const roundOff = Number((roundedNetAmount - netAmount).toFixed(2));
    const overallAmount = parseFloat(parseFloat(netAmount) + parseFloat(roundOff)).toFixed(2)

    console.log(overallAmount, "overallAmount")



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
                    icon: 'success',
                    title: `${text || 'Saved'} Successfully`,
                    showConfirmButton: false,
                    timer: 2000
                });
                dispatch(partyMasterApi.util.invalidateTags(["Party"]));
                dispatch(DeliveryChallanApi.util.invalidateTags(["DeliveryChallan"]));

                // if (returnData.statusCode === 0) {
                //     if (nextProcess == "new") {
                //         syncFormWithDb(undefined);
                //         onNew()
                //     }
                //     if (nextProcess == "close") {
                //         syncFormWithDb(undefined);
                //         onClose()
                //     }
                //     else {
                //         setId(returnData?.data?.id);

                //     }
                // }
                // else {
                //     toast.error(returnData?.message);
                // }
                setId(returnData?.data?.id)

                if (nextProcess == "new") {
                    setIsPrintOpen(true)
                } else {
                    syncFormWithDb(undefined);
                    onClose()
                } console.log(returnData?.data?.id, "returnData?.data?.id")
            }
        } catch (error) {
            console.log("handle");
        }
    };



    let data = {

        supplierId, deliveryType, deliveryToId, branchId, finYearId, companyId,
        id,
        remarks, dcDate, dcNo,
        invoiceItems: invoiceItems?.filter(po => po.styleId), netBillValue: overallAmount, transportMode, transporter, vehicleNo, taxTemplateId,
        termsandcondtions, discountValue, discountType


    }


    const validateData = (data) => {
        let mandatoryFields = ["styleId", "styleItemId", "noOfBox", "uomId", "qty", "price"];





        return data.supplierId

            && isGridDatasValid(data?.invoiceItems, false, mandatoryFields)
            && data?.invoiceItems?.length !== 0



    }

    const saveData = (nextProcess) => {


        setNextProcess(nextProcess)

        if (!validateData(data)) {

            Swal.fire({
                icon: 'success',
                title: `Please fill all required fields...!`,

            });
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }



        else if (id) {

            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, {
                ...data,
                invoiceItems: data.invoiceItems?.map(item => ({
                    ...item,
                    deliveryChallanItemsId: item.id,
                })),
            }, "Added", nextProcess);
        }
    }



    return (

        <>
            <Modal
                isOpen={isPrintOpen}
                // onClose={() => setIsPrintOpen(false)}
                widthClass={"px-2 h-[25%] w-[40%]"} >

                <PopUp setIsPrintOpen={setIsPrintOpen} onClose={() => setIsPrintOpen(false)} setPrintModalOpen={setPrintModalOpen}
                    nextprocess={nextprocess} formclose={onClose} syncFormWithDb={syncFormWithDb} onNew={onNew} inputRef={inputRef}
                    setId={setId}
                    id={id} />
            </Modal>
            <Modal
                isOpen={printModalOpen}
                onClose={() => {
                    setPrintModalOpen(false)
                    if (nextprocess == "close") {
                        onClose()
                    }
                    if (nextprocess == "new") {
                        syncFormWithDb(undefined)
                        inputRef.current?.focus();
                    }
                }}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                    <DeliveryInvoice
                        tax={findFromList(taxTemplateId, taxTypeList?.data, "name")}
                        branchData={branchdata?.data}
                        data={id ? singleData?.data : "Null"}
                        singleData={id ? singleData?.data : "Null"}
                        date={id ? singleData?.data?.createdAt : date}
                        docId={docId ? docId : ""}
                        remarks={remarks}
                        discountType={discountType}
                        poType={poType}
                        discountValue={discountValue}
                        // ref={componentRef}
                        poNumber={docId} poDate={date} payTermId={payTermId}
                        poItems={invoiceItems}
                        supplierDetails={supplierDetails ? supplierDetails?.data : null}
                        deliveryType={deliveryType}
                        deliveryToId={deliveryToId}
                        taxTemplateId={taxTemplateId}
                        // yarnList={yarnList}
                        uomList={uomList} colorList={colorList}
                        // taxDetails={taxDetails}
                        // deliveryTo={deliveryTo}
                        // taxGroupWise={taxGroupWise}
                        transportMode={transportMode}
                        transporter={transporter}
                        vehicleNo={vehicleNo}
                        termsData={termsData}
                        term={term}
                        totalQty={
                            invoiceItems?.reduce((sum, next) => {
                                return sum + (Number(next?.invoiceQty) || 0);
                            }, 0)
                        }
                        invoiceItems={invoiceItems}
                        termsAndCondition={termsandcondtions}
                    // payTermList={payTermList}

                    />
                </PDFViewer>
            </Modal>
            <Modal
                isOpen={tableDataView && poType !== "General Purchase"}
                onClose={() => { setTableDataView(false); setPoType(""); setPoItems([]); setSupplierId("") }}
                widthClass="  h-[80%] w-[90%]"
            >
                <DeliveryItemsSelection
                    onClose={() => setTableDataView(false)}
                    setPoType={setPoType}
                    tempInvoiceItems={tempInvoiceItems}
                    // taxDetails={taxDetails}
                    invoiceItems={invoiceItems}
                    setInvoiceItems={setInvoiceItems}
                    transactionId={id}


                />
            </Modal>
            <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass={"p-10"}>
                <PoSummary
                    remarks={remarks}
                    setRemarks={setRemarks}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    poItems={invoiceItems?.filter(i => i.price)}

                    taxTypeId={taxTemplateId} readOnly={readOnly} />
            </Modal>
            <div className="w-full  mx-auto rounded-md shadow-lg px-2 mt-1 bg-white overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
                    <button
                        onClick={() => {
                            onClose()
                        }
                        }
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>

            </div>
            <div className="space-y-3  py-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">



                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Basic Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">
                            <ReusableInputNew label="Invoice No" readOnly value={docId} />
                            <ReusableInputNew label="Invoice Date" value={date} type={"date"} required={true} readOnly={true} disabled />



                        </div>

                    </div>


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-4">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Invoice Details
                        </h2>
                        <div className="grid grid-cols-7 gap-2">


                            <div className="col-span-3"

                            >

                                <ShowInvoicPendingCustomers
                                    label="Customer Name"
                                    component="PartyMaster"
                                    placeholder="Search Customer Name"
                                    optionList={allSuppliers}
                                    setSearchTerm={(value) => { setSupplierId(value) }}
                                    searchTerm={supplierId}
                                    show={"isSupplier"}
                                    required={true}
                                    // disabled={id}
                                    ref={inputRef}
                                    nextRef={customerRef}
                                    id={id}
                                    supplierId={supplierId}
                                    partyList={partyList}
                                />




                            </div>

                            <div className="col-span-1">
                                <TextInputNew
                                    name="Contact Person Name"
                                    placeholder="Contact name"
                                    value={findFromList(supplierId, supplierList?.data, "contactPersonName")}
                                    disabled={true}
                                />
                            </div>



                            <TextInputNew
                                name="Contact Number"
                                placeholder="Contact name"
                                value={findFromList(supplierId, supplierList?.data, "contactNumber")}

                                disabled={true}


                            />
                            <div className="col-span-2">
                                <TextAreaNew
                                    name="Address"
                                    placeholder="Addres"
                                    value={findFromList(supplierId, supplierList?.data, "address")}
                                />
                            </div>
                            {/* <DropdownInputNew name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList?.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly}
                                ref={customerRef}
                            /> */}







                        </div>

                    </div>


                    {/* <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Delivery Challen Details
                        </h2>
                        <div className="grid grid-cols-2 gap-2">



                            <div className="col-span-1">
                                <TextInputNew name="Job Work Dc No"
                                    value={dcNo} setValue={setDcNo} readOnly={readOnly} />

                            </div>




                            <div className="col-span-1">
                                <DateInputNew
                                    name="Job Work Dc Date"
                                    value={dcDate}
                                    setValue={setDcDate}
                                    type={"date"}
                                    // required={true}
                                    // ref={dateRef}
                                    // nextRef={inputPartyRef}

                                    readOnly={readOnly}
                                />
                            </div>





                        </div>

                    </div> */}



                    {/* <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Transport Details
                        </h2>
                        <div className="grid grid-cols-2 gap-2">



                            <div className="col-span-1">
                                <TextInputNew name="Mode Of Transport"
                                    value={dcNo} setValue={setDcNo} readOnly={readOnly} />

                            </div>





                            <div className="col-span-1">
                                <TextInputNew name="Transporter"
                                    value={dcNo} setValue={setDcNo} readOnly={readOnly} />

                            </div>

                            <div className="col-span-1">
                                <TextInputNew name="Vehicle No"
                                    value={dcNo} setValue={setDcNo} readOnly={readOnly} />

                            </div>



                        </div>

                    </div> */}



                </div>
                <fieldset className=''>

                    <InvoiceItems invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems} styleList={styleList}
                        styleItemList={styleItemList} uomList={uomList} supplierId={supplierId} id={id} onClose={() => setTableDataView(false)} setTableDataView={setTableDataView} colorList={colorList} customerRef={customerRef}
                    />

                </fieldset>

                {/* <div className="grid grid-cols-5 gap-3">

                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Transport Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <TextInputNew1 name="Transporter"
                                    value={transporter} setValue={setTransporter} readOnly={readOnly} />

                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                    Transport Mode
                                </label>
                                <select className="w-full text-xs border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    onChange={(e) => {
                                        setTransportMode(e.target.value)
                                    }}
                                    value={transportMode}
                                >
                                    <option value="">Select</option>
                                    <option value="Road">By Road</option>
                                    <option value="Rail">By Rail</option>
                                    <option value="Air">By Air</option>
                                    <option value="Ship">By Ship</option>
                                </select>
                            </div>


                            <div className="col-span-1">
                                <TextInputNew1 name="Vehicle No"
                                    value={vehicleNo} setValue={setVechileNo} readOnly={readOnly} />

                            </div>

                        </div>
                    </div>





                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                        <h2 className="font-medium text-slate-700 mb-2 text-base">Remarks</h2>
                        <textarea
                            readOnly={readOnly}
                            value={remarks}
                            onChange={(e) => {
                                setRemarks(e.target.value)
                            }}
                            className="w-full h-36 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            placeholder="Additional notes..."
                        />
                    </div>
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                        <h2 className="font-medium text-slate-700 mb-2 text-base">Terms & Conditions </h2>
                        <textarea
                            readOnly={readOnly}
                            value={termsandcondtions}
                            onChange={(e) => {
                                setTermsAndConditions(e.target.value)
                            }}
                            className="w-full h-36 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                            placeholder="Additional notes..."
                        />
                    </div>
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">

                        <h2 className="font-medium text-slate-700 mb-2 text-base ">
                            Tax Details
                        </h2>

                        <div className="flex justify-between text-sm">
                            <span className="text-xs    text-slate-700  ">CGST @ {halfGST}%</span>
                            <span>₹ {cgst.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm ">
                            <span className=" text-slate-700  text-xs">SGST @ {halfGST}%</span>
                            <span>₹ {sgst.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className=" text-slate-700 text-xs">IGST @ {igst}%</span>
                            <span>₹ {igst.toFixed(2)}</span>
                        </div>

                        <div className="border-t border-slate-200 my-2" />

                        <div className="flex justify-between text-slate-700 text-sm font-medium">
                            <span className="font-medium text-slate-700 mb-2 text-base">Total GST Amount</span>
                            <span>₹ {totalGstAmount.toFixed(2)}</span>
                        </div>


                    </div>


                    <div className="border border-slate-200 bg-white rounded-md shadow-sm p-5 space-y-2">

                        <div className="flex justify-between text-sm ">
                            <span className="text-md text-slate-700" >Taxable Amount</span>
                            <span className="text-sm text-slate-700 ">{taxableAmount.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-sm ">
                            <span className="text-md text-slate-700">Toatl GST Amount</span>
                            <span className="text-sm text-slate-700 "> {totalGstAmount.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-sm h-5 ">

                        </div>
                        <div className="flex justify-between border-t pt-2 font-semibold">
                            <span className="font-medium text-slate-700 mb-2 text-base ">Net Amount</span>
                            <span className="" >{netAmount.toFixed(2)}</span>
                        </div>
                    </div>




                </div> */}
                <div className="grid grid-cols-10 gap-3">

                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm flex flex-row gap-3 col-span-3">
                        <div className="w-56">
                            <TextInputNew1 name="Transporter"
                                value={transporter} setValue={setTransporter} readOnly={readOnly} />

                        </div>
                        <div className="flex flex-col gap-1 w-32">
                            <label className="block text-xs font-bold text-gray-600 w-full">
                                Transport Mode
                            </label>
                            <select className="w-full text-xs border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onChange={(e) => {
                                    setTransportMode(e.target.value)
                                }}
                                value={transportMode}
                            >
                                <option value="">Select</option>
                                <option value="Road">By Road</option>
                                <option value="Rail">By Rail</option>
                                <option value="Air">By Air</option>
                                <option value="Ship">By Ship</option>
                            </select>
                        </div>
                        <div className="">
                            <TextInputNew1 name="Vehicle No"
                                value={vehicleNo} setValue={setVechileNo} readOnly={readOnly} />

                        </div>
                    </div>





                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                        <TextAreaNew
                            name="Terms & Conditions"
                            placeholder="Addres"
                            value={termsandcondtions}
                            setValue={setTermsAndConditions}
                        />
                    </div>

                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
                        <TextAreaNew
                            name="Remarks"
                            placeholder="Addres"
                            value={remarks}
                            setValue={setRemarks}
                        />
                    </div>


                    <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between h-full hover:shadow-md transition">
                        <h2 className="font-semibold text-gray-700 text-base mb-3">
                            Tax Summary
                        </h2>

                        <button
                            onClick={() => setSummary(true)}
                            className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium
               bg-indigo-500 text-white px-1 py-1 rounded-md
               hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:bg-indigo-500
               transition"
                        >
                            View
                        </button>
                    </div>


                    <div className="border border-slate-200 bg-white rounded-md shadow-sm p-1 col-span-2">

                        <div className="flex justify-between  ">
                            <span className="font-bold text-gray-600 bord text-md mb-1" >Total Gross Amount</span>
                            <span className="font-bold text-gray-600 bord mb-1">{formatAmountIN(totalAmount.toFixed(2))}</span>
                        </div>
                        <div className="flex justify-between  font-semibold">
                            <span className="font-bold text-gray-600 bord mb-1">Tax Amount</span>
                            <span className="font-bold text-gray-600 bord mb-1">{formatAmountIN(result?.overallTax?.toFixed(2))} </span>
                        </div>

                        <div className="flex justify-between  font-semibold">
                            <span className="font-bold text-gray-600 bord mb-1 ">Net Amount</span>
                            <span className="font-bold text-gray-600 bord mb-1" >{formatAmountIN(netAmount.toFixed(2))}</span>
                        </div>
                    </div>




                </div>
                <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Save & Close
                        </button>
                        <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                            <FiSave className="w-4 h-4 mr-2" />
                            Save & New
                        </button>

                    </div>

                    <div className="flex gap-2 flex-wrap">

                        <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                            onClick={() => setReadOnly(false)}
                        >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Edit
                        </button>

                        <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                            onClick={() => {
                                setPrintModalOpen(true)
                            }}
                        >
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Invoice
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InvoiceForm;