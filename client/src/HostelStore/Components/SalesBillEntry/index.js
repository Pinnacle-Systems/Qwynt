import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";

import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  DropdownInput,
  DisabledInput,
  ReusableInput,
} from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { RetailPrintFormatFinishedGoodsSales } from "..";

import {
  useGetSalesBillQuery,
  useGetSalesBillByIdQuery,
  useAddSalesBillMutation,
  useUpdateSalesBillMutation,
  useDeleteSalesBillMutation,
} from "../../../redux/services/SalesBillService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { getDateFromDateTime } from "../../../Utils/helper";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import PoBillItems from "./PoBillItems";
import Modal from "../../../UiComponents/Modal";
import PurchaseBillFormReport from "./PurchaseBillFormReport";
import moment from "moment";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "@etsoo/reactprint";
import PrintReportOpen from "./PrintReportOpen";
import ToggleButton from "./ToggleButton ";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MODEL = "Sales Bill Entry";

export default function Form() {
  const today = new Date();
  const [form, setForm] = useState(true);
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [netBillValue, setNetBillValue] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [place, setPlace] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [formReport, setFormReport] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [amount, setAmount] = useState("");
  const [active, setActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [poBillItems, setPoBillItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment(new Date()).format("YYYY-MM-DD"));

  const [printReportOpen, setPrintReportOpen] = useState(false);
  const childRecord = useRef(0);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  const dispatch = useDispatch();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetSalesBillQuery({ params: { branchId }, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesBillByIdQuery(id, { skip: !id });

  const [addData] = useAddSalesBillMutation();
  const [updateData] = useUpdateSalesBillMutation();
  const [removeData] = useDeleteSalesBillMutation();
  const componentRef = useRef();

  const { data: supplierList } = useGetPartyQuery({ params });

  const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId);
    }
  }, [allData, isLoading, isFetching, id]);

  useEffect(getNextDocId, [getNextDocId]);

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      if (data?.docId) {
        setDocId(data.docId);
      }
      if (data?.createdAt)
        setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
      setActive(data?.active ? data.active : false);
      setSelectedDate(data?.selectedDate ? moment.utc(data?.selectedDate).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"))
      setIsOn(data?.isOn ? data.isOn : false);
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setContactMobile(data?.contactMobile ? data.contactMobile : "");
      setPlace(data?.place ? data.place : "");
      setPoBillItems(data?.SalesBillItems ? data.SalesBillItems : []);
      setNetBillValue(data?.netBillValue ? data.netBillValue : "0");
      setDueDate(
        data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : ""
      );
      setActive(data?.amount ? data.amount : "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    branchId,
    amount,
    dueDate,
    contactMobile,
    place,
    isOn,
    supplierId,
    netBillValue, selectedDate,
    salesBillItems: poBillItems.filter(
      (item) => item.qty != 0 && item.salePrice != 0
    ),
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    active,
    id,
  };


  const validateData = (data) => {
    if (data.selectedDate) {
      return true;
    }


    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      if (returnData.statusCode === 0) {
        setPrintReportOpen(true);
        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message);
      }

      dispatch({
        type: `stock/invalidateTags`,
        payload: ["Stock"],
      });
    } catch (error) {
      console.log("handle");
    }
  };

  const validateNetBillValue = () => {
    if (
      getTotal("qty", "price").toFixed(2) ===
      parseFloat(netBillValue).toFixed(2)
    ) {
      return true;
    }
    return false;
  };

  function getTotal(field1, field2) {
    const total = poBillItems.reduce((accumulator, current) => {
      return (
        accumulator +
        parseFloat(
          current[field1] && current[field2]
            ? current[field1] * current[field2]
            : 0
        )
      );
    }, 0);
    return parseFloat(total);
  }

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (!validateNetBillValue()) {
      toast.info("Net Bill Value Not Matching Total Amount...!", {
        position: "top-center",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    getNextDocId();
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = ["Code", "Name", "Status"];
  const tableDataNames = [
    "dataObj.code",
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];
  const handlePrint = () => {
    setPrintModalOpen(true);
  };

  function openPrint(value) {
    if (value) {
      handlePrint();
    } else {
      onNew();
    }
  }

  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={isLoading || isFetching}
        setForm={setForm}
        data={allData?.data ? allData?.data : []}
        onClick={onDataClick}
        onNew={onNew}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
    );

  const supplierData = supplierList?.data ? supplierList.data : [];

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme"
    >
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <RetailPrintFormatFinishedGoodsSales
            contactMobile={contactMobile}
            data={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            id={id}
            isOn={isOn}
            poBillItems={poBillItems}
            docId={docId ? docId : ""}
          />
        </PDFViewer>
      </Modal>

      <Modal
        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}
      >
        <PurchaseBillFormReport
          onClick={(id) => {
            setId(id);
            setFormReport(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={printReportOpen}
        onClose={() => setPrintReportOpen(false)}
        widthClass={"px-2 h-[20%] w-[35%]"}
      >
        <PrintReportOpen
          setPrintModalOpen={setPrintModalOpen}
          printModalOpen={printModalOpen}
        />
      </Modal>

      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          model={MODEL}
          openReport={() => setFormReport(true)}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          onPrint={id ? handlePrint : null}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
          <div className="col-span-4 grid md:grid-cols-1 border overflow-auto">
            <div className="mr-1 md:ml-2">
              <fieldset className="frame my-1">
                <legend className="sub-heading">Product Info</legend>
                <div className="grid grid-cols-6 my-2">
                  <DisabledInput
                    name="Bill.No"
                    value={docId}
                    required={true}
                    readOnly={readOnly}
                  />
                  <ReusableInput
                    label="Bill. Date"
                    value={selectedDate}
                    setValue={setSelectedDate}
                    type={"Date"}
                    required={true}
                    readOnly={readOnly}
                  />
                  <DropdownInput
                    name="Customer"
                    options={dropDownListObject(
                      id
                        ? supplierData
                        : supplierData
                          .filter((value) => value.isCustomer)
                          .filter((item) => item.active),
                      "name",
                      "id"
                    )}
                    value={supplierId}
                    setValue={setSupplierId}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                  <TextInput
                    name={"NetBillValue"}
                    value={netBillValue}
                    setValue={setNetBillValue}
                    readOnly={readOnly}
                    required
                  />
                  <div
                    className={`ml-5 border-2 ml-24 ${isOn ? "border-emerald-800" : "border-red-800"
                      } w-48 rounded-xl p-1`}
                  >
                    <ToggleButton
                      label={isOn ? "Confirmed" : "Not Confirmed"}
                      isOn={isOn}
                      setIsOn={setIsOn}
                      readOnly={readOnly}
                    />
                  </div>
                  {/* <div className="w-full max-w-xs mx-auto">{console.log("selectedDate", selectedDate)}
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholderText="Choose a date"
                    />
                  </div> */}
                </div>
              </fieldset>
              <fieldset className="frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto">
                <legend className="sub-heading">Sales-Bill-Details</legend>
                <PoBillItems
                  date={singleData?.data?.createdAt}
                  id={id}
                  readOnly={readOnly}
                  poBillItems={poBillItems}
                  setPoBillItems={setPoBillItems}
                  isOn={isOn}
                />
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
