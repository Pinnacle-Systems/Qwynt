// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   useGetPayOutQuery,
//   useGetPayOutByIdQuery,
//   useAddPayOutMutation,
//   useUpdatePayOutMutation,
//   useDeletePayOutMutation,
// } from "../../../redux/ErpServices/PayOut.Services";
// import { useGetPartyQuery } from "../../../redux/ErpServices/PartyMasterServices";
// import FormHeader from "../../../Basic/components/FormHeader";
// import { toast } from "react-toastify";
// import { LongDropdownInput, DisabledInput, DropdownInput, DateInput, TextInput } from "../../../Inputs";
// import { dropDownListObject, } from '../../../Utils/contructObject';
// import { paymentModes, paymentTypes } from '../../../Utils/DropdownData';

// import moment from "moment";
// import Modal from "../../../UiComponents/Modal";
// import FormReport from "./Report";
// import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
// import BillEntrySelection from "./BillEntrySelection";
// import BillItems from "./BillItems";
// import { useDispatch } from "react-redux";

// const MODEL = "Pay Out";


// export default function Form() {
//   const dispatch = useDispatch()

//   const today = new Date()


//   const [readOnly, setReadOnly] = useState(false);
//   const [docId, setDocId] = useState("")
//   const [id, setId] = useState("");
//   const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
//   const [paymentType, setPaymentType] = useState("");
//   const [supplierId, setSupplierId] = useState("");
//   const [paymentMode, setPaymentMode] = useState("")
//   const [refNo, setRefNo] = useState("");
//   const [amount, setAmount] = useState("")
//   const [payOutItems, setPayOutItems] = useState([])
//   const [selectBillItems, setSelectBillItems] = useState(false)

//   const [payOutDate, setPayOutDate] = useState("")

//   const [formReport, setFormReport] = useState(false);

//   const [searchValue, setSearchValue] = useState("");

//   const childRecord = useRef(0);

//   const { branchId, companyId, finYearId, userId } = getCommonParams()

//   const branchIdFromApi = useRef(branchId);
//   const params = {
//     branchId, companyId, finYearId
//   };

//   const { data: supplierList } =
//     useGetPartyQuery({ params: { ...params } });

//   const { data: allData, isLoading, isFetching } = useGetPayOutQuery({ params, searchParams: searchValue, finYearId });

//   const getNextDocId = useCallback(() => {
//     if (id || isFetching || isLoading) return
//     if (allData?.nextDocId) {
//       setDocId(allData.nextDocId)
//     }
//   }, [allData, isLoading, isFetching, id])

//   useEffect(getNextDocId, [getNextDocId])

//   const {
//     data: singleData,
//     isFetching: isSingleFetching,
//     isLoading: isSingleLoading,
//   } = useGetPayOutByIdQuery({ id }, { skip: !id });

//   const [addData] = useAddPayOutMutation();
//   const [updateData] = useUpdatePayOutMutation();
//   const [removeData] = useDeletePayOutMutation();

//   const syncFormWithDb = useCallback((data) => {
//     if (id) {
//       setReadOnly(true);
//     } else {
//       setReadOnly(false);
//     }
//     setPaymentType(data?.paymentType ? data.paymentType : "GreyYarn");
//     setRefNo(data?.refNo ? data.refNo : "");
//     setAmount(data?.amount ? data.amount : "");
//     setPaymentMode(data?.paymentMode ? data.paymentMode : "")
//     setPayOutItems(data?.PayOutItems ? data.PayOutItems : [])
//     setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));
//     if (data?.docId) {
//       setDocId(data?.docId)
//     }
//     if (data?.date) setDate(data?.date);
//     setSupplierId(data?.supplierId ? data?.supplierId : "");
//     if (data?.branchId) {
//       branchIdFromApi.current = data?.branchId
//     }
//   }, [id]);


//   useEffect(() => {
//     if (id) {
//       syncFormWithDb(singleData?.data);
//     } else {
//       syncFormWithDb(undefined);
//     }
//   }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

//   const data = {
//     paymentType, supplierId,
//     branchId, id, userId,
//     payOutItems: paymentType === "AgainstBill" ? payOutItems : [],
//     paymentMode,
//     refNo,
//     amount,
//     payOutDate,
//     finYearId
//   }

//   const validateData = (data) => {
//     let mandatoryFields = ["amount"];
//     return data.paymentType && data.supplierId
//       && data.paymentMode && data.refNo && data.amount && data.payOutDate
//       && data.paymentType === "AgainstBill" ? (isGridDatasValid(data.payOutItems, false, mandatoryFields) && data.payOutItems.length !== 0) : true
//   }

//   const handleSubmitCustom = async (callback, data, text) => {
//     try {
//       let returnData;
//       if (text === "Updated") {
//         returnData = await callback(data).unwrap();
//       } else {
//         returnData = await callback(data).unwrap();
//       }
//       dispatch({
//         type: `Ledger/invalidateTags`,
//         payload: ['Ledger'],
//       });
//       dispatch({
//         type: `billEntry/invalidateTags`,
//         payload: ['BillEntry'],
//       });
//       setId("")
//       syncFormWithDb(undefined)
//       toast.success(text + "Successfully");
//     } catch (error) {
//       console.log("handle");
//     }
//   };


//   const saveData = () => {
//     if (!validateData(data)) {
//       toast.info("Please fill all required fields...!", { position: "top-center" })
//       return
//     }
//     if ((data.paymentType === "AgainstBill") && (parseFloat(data.amount) !== sumArray(data.payOutItems, "amount"))) {
//       toast.info("PayAmount and Bill Amount Total Not Matched", { position: "top-center" })
//       return
//     }
//     if (id) {
//       handleSubmitCustom(updateData, data, "Updated");
//     } else {
//       handleSubmitCustom(addData, data, "Added");
//     }
//   }

//   const deleteData = async () => {
//     if (id) {
//       if (!window.confirm("Are you sure to delete...?")) {
//         return;
//       }
//       try {
//         await removeData(id)
//         setId("");
//         onNew();
//         toast.success("Deleted Successfully");
//         dispatch({
//           type: `Ledger/invalidateTags`,
//           payload: ['Ledger'],
//         });
//         dispatch({
//           type: `billEntry/invalidateTags`,
//           payload: ['BillEntry'],
//         });
//       } catch (error) {
//         toast.error("something went wrong");
//       }
//     }
//   };

//   const handleKeyDown = (event) => {
//     let charCode = String.fromCharCode(event.which).toLowerCase();
//     if ((event.ctrlKey || event.metaKey) && charCode === "s") {
//       event.preventDefault();
//       saveData();
//     }
//   };

//   const onNew = () => {
//     setId("");
//     setSearchValue("");
//     setReadOnly(false);
//     syncFormWithDb(undefined)
//     getNextDocId()
//   };


//   const tableHeadings = ["PoNo", "PoDate", "transType", "DueDate", "Supplier"]
//   const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']

//   return (
//     <div
//       onKeyDown={handleKeyDown}
//       className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">
//       <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
//         <FormReport
//           heading={MODEL}
//           tableHeaders={tableHeadings}
//           tableDataNames={tableDataNames}
//           loading={
//             isLoading || isFetching
//           }
//           tableWidth="100%"
//           data={allData?.data}
//           onClick={(id) => {
//             setId(id);
//             setFormReport(false);
//           }
//           }
//           searchValue={searchValue}
//           setSearchValue={setSearchValue}
//         />
//       </Modal>
//       <Modal isOpen={selectBillItems} onClose={() => setSelectBillItems(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
//         <BillEntrySelection supplierId={supplierId} payOutItems={payOutItems} setPayOutItems={setPayOutItems} setSelectBillItems={setSelectBillItems} />
//       </Modal>
//       <div className="flex flex-col frame w-full h-full">
//         <FormHeader
//           onNew={onNew}
//           model={MODEL}
//           saveData={saveData}
//           setReadOnly={setReadOnly}
//           deleteData={deleteData}
//           openReport={() => { setFormReport(true) }}
//           childRecord={childRecord.current}
//         />
//         <div className="flex-1 grid gap-x-2">
//           <div className="col-span-3 grid overflow-auto">
//             <div className='col-span-3 grid overflow-auto'>
//               <div className='mr-1'>
//                 <div className={`grid`}>
//                   <div className={"flex flex-col"}>
//                     <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 overflow-auto'>
//                       <legend className='sub-heading'>Bill Info</legend>
//                       <div className='flex flex-col justify-center items-start flex-1 w-full'>
//                         <div className="grid grid-cols-5 w-full">
//                           <DisabledInput name="Doc Id." value={docId}
//                           />
//                           <DateInput name="Doc. Date" value={date} type={"date"} readOnly={readOnly} disabled />
//                           <DropdownInput name="Payment Type"
//                             options={paymentTypes}
//                             value={paymentType} setValue={(value) => { setPayOutItems([]); setPaymentType(value) }} required={true} readOnly={id} />
//                           <div className="col-span-2">
//                             <LongDropdownInput name="Supplier"
//                               options={dropDownListObject(supplierList?.data ? supplierList.data : [], "aliasName", "id")}
//                               value={supplierId} setValue={(value) => { setPayOutItems([]); setSupplierId(value) }} required={true} readOnly={id} />
//                           </div>
//                           <DropdownInput name="Payment Mode"
//                             options={paymentModes}
//                             value={paymentMode} setValue={setPaymentMode} required={true} readOnly={id} />
//                           <TextInput
//                             name={"Check No./ Ref. No."}
//                             required
//                             value={refNo}
//                             setValue={setRefNo}
//                           />
//                           <DateInput name="Paid. Date" required value={payOutDate} type={"date"} setValue={setPayOutDate} readOnly={readOnly} />
//                           <TextInput
//                             type={"number"}
//                             name={"Amount"}
//                             value={amount}
//                             required
//                             setValue={(value) => {
//                               if (value < 0) return
//                               setAmount(value)
//                             }}
//                           />
//                           {(paymentType === "AgainstBill" && !readOnly) &&
//                             <div className="">
//                               <button className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
//                                 onClick={() => {
//                                   if (!supplierId) {
//                                     toast.info("Please Select Suppplier", { position: "top-center" })
//                                     return
//                                   }
//                                   setSelectBillItems(true)
//                                 }}
//                               >Select Bill Items</button>
//                             </div>
//                           }
//                         </div>
//                       </div>
//                     </fieldset>
//                     {(paymentType === "AgainstBill")
//                       &&
//                       <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 overflow-auto'>
//                         <legend className='sub-heading'>Bill Items</legend>
//                         <BillItems readOnly={readOnly} payOutItems={payOutItems} setPayOutItems={setPayOutItems} payOutId={id} />
//                       </fieldset>
//                     }
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }