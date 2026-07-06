import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetFinYearQuery,
  useGetFinYearByIdQuery,
  useAddFinYearMutation,
  useUpdateFinYearMutation,
  useDeleteFinYearMutation,
} from "../../../redux/services/FinYearMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { DateInput, CheckBox, DisabledInput } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { getYearShortCode } from "../../../Utils/helper";
import moment from "moment";

const MODEL = "Fin Year Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetFinYearQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetFinYearByIdQuery(id, { skip: !id });

  const [addData] = useAddFinYearMutation();
  const [updateData] = useUpdateFinYearMutation();
  const [removeData] = useDeleteFinYearMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setTo(data?.to ? moment.utc(data.to).format("YYYY-MM-DD") : "");
      setFrom(data?.from ? moment.utc(data.from).format("YYYY-MM-DD") : "");
      setActive(id ? (data?.active ? data.active : false) : true);
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    from,
    to,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    id,
  };

  const validateData = (data) => {
    if (data.from && data.to) {
      return true;
    }
    return false;
  };

  const validateOneActiveFinYear = (active) => {
    if (Boolean(active)) {
      return !allData.data.some((finYear) =>
        id === finYear.id ? false : Boolean(finYear.active),
      );
    }
    return true;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateOneActiveFinYear(data.active)) {
      toast.info("One Fin year can be active...!", { position: "top-center" });
      return;
    }
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
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
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["from", "to", "Status"];
  const tableDataNames = [
    "MOMENT.utc(dataObj.from).format('DD-MM-YYYY')",
    "MOMENT.utc(dataObj.to).format('DD-MM-YYYY')",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={isLoading || isFetching}
        setForm={setForm}
        data={allData?.data}
        onClick={onDataClick}
        onNew={onNew}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
    );

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme"
    >
      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          onClose={() => {
            setForm(false);
            setSearchValue("");
          }}
          model={MODEL}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
          <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
            <div className="mr-1 md:ml-2">
              <fieldset className="frame my-1">
                <legend className="sub-heading">Financial Year details</legend>
                <div className="row-span-2">
                  <DateInput
                    name="From"
                    value={from}
                    setValue={setFrom}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                  <DateInput
                    name="To"
                    value={to}
                    setValue={setTo}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                  <DisabledInput
                    name="Short Code"
                    value={from && to ? getYearShortCode(from, to) : ""}
                    disabled={childRecord.current > 0}
                  />
                  <CheckBox
                    name="Active"
                    readOnly={readOnly}
                    value={active}
                    setValue={setActive}
                  />
                </div>
              </fieldset>
            </div>
          </div>
          <div className="frame hidden md:block overflow-x-hidden">
            <FormReport
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              setId={setId}
              tableHeaders={tableHeaders}
              tableDataNames={tableDataNames}
              data={allData?.data}
              loading={isLoading || isFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
