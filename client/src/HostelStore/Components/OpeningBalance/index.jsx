import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlus } from 'react-icons/fa';
import {  getCommonParams} from "../../../Utils/helper";
import PaymentForm from './PaymentForm.jsx';
import PaymentFormReport from './PaymentFormReport.jsx';
import { useDispatch } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { useAddOpeningBalanceMutation, useGetOpeningBalanceByIdQuery, useUpdateOpeningBalanceMutation, useDeleteOpeningBalanceMutation, useGetOpeningBalanceQuery } from "../../../redux/services/OpeningBalanceService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import Swal from "sweetalert2";

const OpeningBalance = () => {
      const params = getCommonParams();

    const [id, setId] = useState("");
    const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
    const { branchId, companyId, finYearId, userId } = params;


    const [docId, setDocId] = useState("");
    const [date, setDate] = useState(moment.utc(new Date()).format("YYYY-MM-DD"));
    const [partCategory, setPartyCategory] = useState("")
    const [partyId, setPartyId] = useState("");
    const [amount, setAmount] = useState('')
    const [readOnly, setReadOnly] = useState(false);
    const [paidAmount, setPaidAmount] = useState('')
    const childRecord = useRef(0);
    const dispatch = useDispatch()
    const { data: allData } = useGetOpeningBalanceQuery({ params })
    const { data: singleData } = useGetOpeningBalanceByIdQuery(id, { skip: !id });
    const {
        data: PartyData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPartyByIdQuery(partyId, { skip: !partyId });

    console.log(PartyData, "partyData")

    const syncFormWithDb = useCallback(
        (data) => {

            setDocId(data?.docId ? data?.docId : "New");
            setDate(data?.date ? moment.utc(data?.date).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"))
            setPartyCategory(data?.partCategory || '')
            setPartyId(data?.partyId || '')
            setAmount(data?.amount || '')
            childRecord.current = data?.childRecord ? data?.childRecord : 0;

        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [syncFormWithDb, singleData])


    const [addData] = useAddOpeningBalanceMutation();
    const [updateData] = useUpdateOpeningBalanceMutation();
    const [removeData] = useDeleteOpeningBalanceMutation()


    const data = {
        id,
        docId,
        date,
        partCategory,
        partyId,
        amount,
        branchId,
        companyId,
        finYearId,
        userId,
    }
    const validateData = (data) => {
        return data?.date && data?.partCategory && data?.partyId && data?.amount
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {
                setId("")
                syncFormWithDb(undefined)
                Swal.fire({
                    icon: 'success',
                    title: `${text || 'Saved'} Successfully`,
                    // showConfirmButton: false,
                    // timer: 2000
                });

                if (returnData.statusCode === 0) {
                    if (nextProcess === "new") {
                        onNew()
                        syncFormWithDb(undefined)
                        setReadOnly(false);

                    }
                    if (nextProcess === "close") {
                        setPurchaseOrderForm(false)
                    }
                }
            } else {
                toast.error(returnData?.message)
            }
            dispatch({
                type: `partyMaster/invalidateTags`,
                payload: ['Party'],
            });
        } catch (error) {
            console.log("handle")
        }

    }
    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",

            }); return
        }
        if (data?.amount < 0) {
            // toast.info("Amount Cannot be Negative...!!!", { position: "top-center" })
            Swal.fire({
                title: "Amount Cannot be Negative...!!!",
                icon: "error",

            });
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess)
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess)
        }
    }





    const onNew = () => {
        setId("");
        setReadOnly(false);

        syncFormWithDb(undefined);

    }
    const { data: supplierList } = useGetPartyQuery({ params: { branchId, finYearId, isAddessCombined: true } });

    const supplierData = supplierList?.data ? supplierList.data : [];

    let dropDownData;

    if (partCategory === "customer") {
        dropDownData = supplierData.filter((val) => val.isCustomer && val.active)
    }
    else {
        dropDownData = supplierData.filter((val) => val.isSupplier && val.active)

    }



    const handleView = (id) => {

        setId(id)
        setPurchaseOrderForm(true)
        setReadOnly(true);
    };

    const handleEdit = (id) => {
        setReadOnly(false);
        setId(id)
        setPurchaseOrderForm(true)
    };

    console.log(childRecord?.current, "childrecord");


    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    Swal.fire({
                        icon: "error",
                        title: "Child record Exists",
                        text: deldata.data?.message || "Data cannot be deleted!",
                    });
                    return;
                }
                setId("");
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Submission error",
                    text: error.data?.message || "Something went wrong!",
                });
            }
        }
    };
    return (

        <>
            {purchaseOrderForm ? (

                <PaymentForm id={id} setId={setId} docId={docId} setDocId={setDocId} onClose={() => setPurchaseOrderForm(false)} date={date} setDate={setDate} partCategory={partCategory}
                    setPartyCategory={setPartyCategory} partyId={partyId} setPartyId={setPartyId}
                    setAmount={setAmount} readOnly={readOnly} setReadOnly={setReadOnly} paidAmount={paidAmount}
                    amount={amount} setPaidAmount={setPaidAmount} childRecord={childRecord} PartyData={PartyData}
                    dropDownData={dropDownData}
                    saveData={saveData}


                />
            ) : (
                <div className="p-2 bg-[#F1F1F0]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800  shadow-2xl">Opening Balance</h1>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setPurchaseOrderForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <PaymentFormReport
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                            allData={allData} 
                        />
                    </div>

                </div>
            )}
        </>


    )
}

export default OpeningBalance