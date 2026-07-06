import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';

import FormHeader from '../../../Basic/components/FormHeader';
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify"
import { TextInput, CheckBox, DropdownInput, DisabledInput, LongDisabledInput, DateInput } from "../../../Inputs"
import ReportTemplate from '../../../Basic/components/ReportTemplate';


import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService'
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices'
import { dropDownListObject } from '../../../Utils/contructObject';
import { getDateFromDateTime, isGridDatasValid } from '../../../Utils/helper';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import PoBillItems from './PoBillItems';
import Modal from "../../../UiComponents/Modal";
import PurchaseBillFormReport from './PurchaseBillFormReport';
import moment from 'moment';
import { useGetStockQuery } from '../../../redux/services/StockService';
import PurchaseOrderFillGrid from './PurchaseOrderFillGrid';
import PurchaseBillFillGrid from './PurchaseBillFillGrid';

import { useGetPurchaseBillByIdQuery } from '../../../redux/services/PurchaseBillService';
import { useAddSalesReturnMutation, useDeleteSalesReturnMutation, useGetSalesReturnByIdQuery, useGetSalesReturnQuery, useUpdateSalesReturnMutation } from '../../../redux/services/SalesReturnService';
import { useGetSalesBillByIdQuery, useGetSalesBillQuery } from '../../../redux/services/SalesBillService';
import { useDispatch } from 'react-redux';

const MODEL = "Sales Return";

export default function Form() {
  const today = new Date()
  const dispatch = useDispatch()
  const [form, setForm] = useState(true);
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formReport, setFormReport] = useState(false)

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [name, setName] = useState("");
  const [purchaseOrderFillGrid, setPurchaseOrderFillGrid] = useState(false)
  const [active, setActive] = useState(true);
  const [purchaseOrderId, setPurchaseOrderId] = useState("")
  const [purchaseBillFillGrid, setPurchaseBillFillGrid] = useState(false)
  const [purchaseBillItems, setPurchaseBillItems] = useState([])

  const [searchValue, setSearchValue] = useState("");
  const [poReturnItems, setPoReturnItems] = useState([])

  const childRecord = useRef(0);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )



  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }

  const { data: allData, isLoading, isFetching } = useGetSalesReturnQuery({ params: { branchId }, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetSalesReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddSalesReturnMutation();
  const [updateData] = useUpdateSalesReturnMutation();
  const [removeData] = useDeleteSalesReturnMutation();

  const { data: purchaseOrderDetails, isFetching: isPurchaseOrderDetailsFetching, isLoading: isPurchaseOrderDetailsLoading } = useGetSalesBillByIdQuery(purchaseOrderId, { skip: !purchaseOrderId });

  console.log(purchaseOrderDetails, 'purchaseOrderDetails');
  const { data: productBrandList } =
    useGetProductBrandQuery({ params });

  const { data: supplierList } =
    useGetPartyQuery({ params });



  const { data: stockList,
  } = useGetStockQuery({ params: { branchId } });

  const { data: singleSupplier, isFetching: isSingleSupplierFetching, isLoading: isSingleSupplierLoading } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });


  const { data: productCategoryList } =
    useGetProductCategoryQuery({ params });

  const getNextDocId = useCallback(() => {

    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])


  const { data: purchaseBillData } = useGetSalesBillQuery({ params: { branchId } });

  const syncFormWithDb = useCallback(
    (data) => {

      if (id) setReadOnly(true);
      if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
      if (data?.docId) {
        setDocId(data.docId);
      }
      setActive(id ? (data?.active ? data.active : false) : true);
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setAddress(data?.address ? data.address : "")
      setPlace(data?.place ? data.place : "")
      setPoReturnItems(data?.SalesReturnItems ? data.SalesReturnItems : []);
      setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
      setPurchaseOrderId(data?.salesBillId ? data?.salesBillId : "")
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  //  useEffect(()=>{
  //        setAddress(singleSupplier?.data ? singleSupplier.data.address :"");
  //        setPlace(singleSupplier?.data ? singleSupplier.data?.City?.name :"") 
  //  },[singleSupplier,isSingleSupplierFetching,isSingleSupplierLoading,supplierId])

  const data = {
    branchId,
    supplierId,
    dueDate,
    salesBillId: purchaseOrderId,
    address,
    place,
    salesReturnItems: poReturnItems.filter(item => item.qty != 0),
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id
  }
  console.log(poReturnItems, 'poreturn');



  // const validateData = (data) => {
  //   if (data.supplierId && data.poBillItems.length > 0 &&  
  //      isGridDatasValid(data.poBillItems, false, ["qty"])) {
  //     return true;
  //   }
  //   return false;
  // }

  const validateData = (data) => {
    if (data?.salesReturnItems?.length > 0) {
      return true;
    }
    return false;
  }



  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      if (returnData.statusCode === 0) {
        setId("")
        syncFormWithDb(undefined)
        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message)
      }
      dispatch({
        type: `stock/invalidateTags`,
        payload: ['Stock'],
      });
    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated")
    } else {
      handleSubmitCustom(addData, data, "Added")
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return
      }
      try {
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong")
      }
      ;
    }
  }

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      event.preventDefault();
      saveData();
    }
  }
  console.log(purchaseBillData,"purchaseBillData")

  const onNew = () => {
    setId("");
    getNextDocId();
    setReadOnly(false);
    setForm(true);
    setSearchValue("")
    syncFormWithDb(undefined);

  }

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = [
    "Code", "Name", "Status"
  ]
  const tableDataNames = ["dataObj.code", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

  if (!supplierList || isSingleSupplierFetching || isSingleSupplierLoading || !purchaseBillData) return <Loader />

  if (!form)
    return <ReportTemplate
      heading={MODEL}
      tableHeaders={tableHeaders}
      tableDataNames={tableDataNames}
      loading={
        isLoading || isFetching
      }
      setForm={setForm}
      data={allData?.data}
      onClick={onDataClick}
      onNew={onNew}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />

  return (


    <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
      <Modal

        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <PurchaseBillFormReport onClick={(id) => { setId(id); setFormReport(false) }} />
      </Modal>
      {/* <Modal isOpen={purchaseOrderFillGrid} onClose={() => { setPurchaseOrderFillGrid(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <PurchaseOrderFillGrid  setPurchaseBillFillGrid={setPurchaseBillFillGrid} setPurchaseOrderFillGrid={setPurchaseOrderFillGrid} setPurchaseOrderId={setPurchaseOrderId} supplierId={supplierId} />
      </Modal> */}
      <Modal isOpen={purchaseBillFillGrid} onClose={() => { setPurchaseBillFillGrid(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <PurchaseBillFillGrid poReturnItems={poReturnItems} setPoReturnItems={setPoReturnItems}
          purchaseBillItems={purchaseBillItems}
          setPurchaseBillItems={setPurchaseBillItems}
          setPurchaseBillFillGrid={setPurchaseBillFillGrid}
          id={purchaseOrderId}
          onDone={() => { setPurchaseBillFillGrid(false) }}
        />
      </Modal>
      <div className='flex flex-col frame w-full h-full'>
        <FormHeader
          onNew={onNew}
          model={MODEL}
          openReport={() => setFormReport(true)}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          //   onClose={() => {setForm(false); 
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Product Info</legend>
                <div className='grid grid-cols-3 my-2'>
                  <DisabledInput name="Trans.No" value={docId} required={true} readOnly={readOnly} />
                  <DisabledInput name="Trans. 
                           Date" value={date} type={"Date"} required={true} readOnly={readOnly} />
                  {/* <DropdownInput name="Customer" options={dropDownListObject(id ? supplierList.data : supplierList.data.filter(value => value.isCustomer).filter(item => item.active), "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}
                  {/* <LongDisabledInput name="Address" value={address} required={true} readOnly={readOnly} />
                  <DisabledInput name="Place" value={place} required={true} readOnly={readOnly} />
                  <DateInput name="Due Date" value={dueDate} setValue={setDueDate} required={true} readOnly={readOnly} /> */}
                  {/* <DisabledInput name={"Purchase Order"} value={purchaseOrderDetails ? purchaseOrderDetails.data.docId : ""} /> */}
                  <DropdownInput 
  name="Sales Bill" 
  options={dropDownListObject(
    (id ? purchaseBillData.data : purchaseBillData.data).filter(item => item.isOn == true),
    "docId", 
    "id"
  )} 
  value={purchaseOrderId} 
  setValue={setPurchaseOrderId} 
  required={true} 
  readOnly={readOnly} 
  disabled={(childRecord.current > 0)} 
/>

                  <button className="w-24 ml-16 p-1 text-xs bg-green-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                    onClick={() => {
                      if (!supplierId && !purchaseOrderId) {
                        toast.info("Please Select SupplierId ", { position: "top-center" })
                        return
                      }
                      setPurchaseBillFillGrid(true)
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setPurchaseBillFillGrid(true) } }}
                  >Select</button>
                  {/* <CheckBox name="Active" value={active} setValue={setActive} readOnly={readOnly} /> */}
                </div>
              </fieldset>
              {

                purchaseOrderDetails &&

                <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto'>
                  <legend className='sub-heading'>Purchase-Return-Details</legend>
                  <PoBillItems purchaseOrderId={purchaseOrderId} id={id} readOnly={readOnly} poReturnItems={poReturnItems} setPoReturnItems={setPoReturnItems} date={singleData?.data?.createdAt} purchaseOrderDetails={purchaseOrderDetails} />
                </fieldset>
              }

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
