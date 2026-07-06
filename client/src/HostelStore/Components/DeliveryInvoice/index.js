import React, { useEffect, useState, useRef, useCallback } from "react";

import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";

import { toast } from "react-toastify";


import moment from "moment";


import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";




import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { useGetProductByIdQuery } from "../../../redux/services/ProductMasterService";
// import ChallanForm from "./DeliveryChallanForm";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
// import DeliveryChallanFormReport from "./DeliveryChallanReport";
import DeliveryChallanApi, { useDeleteDeliveryChallanMutation } from "../../../redux/services/DeliveryChallanService";
import InvoiceForm from "./DeliveryInvoiceForm";
import DeliveryInvoiceFormReport from "./DeliveryInvoiceReport";
import { useDeleteDeliveryInvoiceMutation } from "../../../redux/services/DeliveryInvoiceService";
import { useDispatch } from "react-redux";



export default function Form() {

  const today = new Date()
  const componentRef = useRef();

  const [readOnly, setReadOnly] = useState(false);
  const [docId, setDocId] = useState("new")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transType, setTransType] = useState("GreyYarn");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [tempPoItems, setTempPoItems] = useState([]);


  const [remarks, setRemarks] = useState("")


  const [searchValue, setSearchValue] = useState("");
  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")

  const childRecord = useRef(0);
  const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    branchId, companyId, finYearId
  };



  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });



  const [removeData] = useDeleteDeliveryInvoiceMutation();



    const dispatch = useDispatch();









  // const getNextDocId = useCallback(() => {
  //   if (id || isLoading || isFetching) return
  //   if (allData?.nextDocId) {
  //     setDocId(allData.nextDocId)
  //   }
  // }, [allData, isLoading, isFetching, id])

  // useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductByIdQuery(id, { skip: !id });

  //   const [addData] = useAddPoMutation();
  //   const [updateData] = useUpdatePoMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }

    setTransType(data?.transType ? data.transType : "GreyYarn");
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));

    setPoItems(data?.PoItems ? data?.PoItems : [])
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);

    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setDiscountType(data?.discountType ? data?.discountType : "Percentage")
    setDiscountValue(data?.discountValue ? data?.discountValue : "0")
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
    setDeliveryType(data?.deliveryType ? data?.deliveryType : "")
    if (data) {
      setDeliveryToId(data?.deliveryType === "ToSelf" ? data?.deliveryBranchId : data?.deliveryPartyId)
    } else {
      setDeliveryToId("")
    }
    setRemarks(data?.remarks ? data.remarks : "")

  }, [id]);




  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    transType, supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems.filter(po => po.yarnId || po.fabricId || po.accessoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId
  }




  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "qty", "price"];
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, ...["yarnId", "noOfBags"]]
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    }
    return data.supplierId && data.dueDate && data.payTermId
      && isGridDatasValid(data.poItems, false, mandatoryFields) && data.poItems.length !== 0
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }

      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
        return
      }
      setId("")
      syncFormWithDb(undefined)
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle");
    }
  };


  //   const saveData = () => {

  //     if (id) {
  //       handleSubmitCustom(updateData, data, "Updated");
  //     } else {
  //       handleSubmitCustom(addData, data, "Added");
  //     }
  //   }


  //   const handleKeyDown = (event) => {
  //     let charCode = String.fromCharCode(event.which).toLowerCase();
  //     if ((event.ctrlKey || event.metaKey) && charCode === "s") {
  //       event.preventDefault();
  //       saveData();
  //     }
  //   };









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
        dispatch(DeliveryChallanApi.util.invalidateTags(["DeliveryChallan"]));

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };


  const onNew = () => {
    setId("");
    setReadOnly(false);
    setTempPoItems([])
    setDocId("New")


  }


  return (



    <>
      {purchaseOrderForm ? (

        <InvoiceForm onClose={() => { setPurchaseOrderForm(false); setReadOnly(prev => !prev) }} supplierList={supplierList}
          branchList={branchList} docId={docId} params={params} id={id} setDocId={setDocId} onNew={onNew} setId={setId}
        />
      ) : (
        <div className="p-2 bg-[#F1F1F0] ">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

            <h1 className="text-2xl font-bold text-gray-800  shadow-2xl">Invoice</h1>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setPurchaseOrderForm(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DeliveryInvoiceFormReport
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={10}
            />
          </div>

        </div>
      )}
    </>
  );
}