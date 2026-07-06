import React, { useEffect, useState, useCallback } from "react";
import {
  useGetApprovalOperatorsQuery,
  useAddApprovalOperatorMutation,
  useUpdateApprovalOperatorMutation,
  useDeleteApprovalOperatorMutation,
} from "../../../redux/uniformService/ApprovalMasterServices";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";

const MODEL = "Approval Rule Operator";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [operator, setOperator] = useState("");
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetApprovalOperatorsQuery();

  const [addData] = useAddApprovalOperatorMutation();
  const [updateData] = useUpdateApprovalOperatorMutation();
  const [removeData] = useDeleteApprovalOperatorMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setOperator(data?.operator || "");
      setLabel(data?.label || "");
      setActive(id ? (data?.active ?? false) : true);
    },
    [id],
  );

  useEffect(() => {
    if (id && allData?.data) {
      const singleData = allData.data.find((d) => d.id === id);
      syncFormWithDb(singleData);
    } else {
      syncFormWithDb(undefined);
    }
  }, [id, allData, syncFormWithDb]);

  const data = { 
    operator, 
    label, 
    active, 
    ...(id ? { id } : {}) 
  };

  const validateData = (data) => {
    return data.operator && data.label;
  };

  const handleSubmitCustom = async (callback, reqData, text) => {
    try {
      const res = await callback(reqData).unwrap();
      if (res.statusCode === 1) {
        toast.error(res.message);
        return;
      }
      setId("");
      syncFormWithDb(undefined);
      toast.success(text + " Successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!");
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) return;
      try {
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("Something went wrong");
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
    syncFormWithDb(undefined);
  };

  function onDataClick(selectedId) {
    setId(selectedId);
    setForm(true);
  }

  const tableHeaders = ["Operator", "Label", "Status"];
  const tableDataNames = [
    "dataObj.operator",
    "dataObj.label",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  let filteredData = allData?.data || [];
  if (searchValue) {
    filteredData = filteredData.filter(
      (d) =>
        d.operator.toLowerCase().includes(searchValue.toLowerCase()) ||
        d.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }
  console.log(tableDataNames, "tableDataNames");
  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={isLoading || isFetching}
        setForm={setForm}
        data={filteredData}
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
                <legend className="sub-heading">Operator Info</legend>
                <div className="grid grid-cols-1 my-2">
                  <TextInput
                    name="Operator Symbol (e.g. >=)"
                    type="text"
                    value={operator}
                    setValue={setOperator}
                    required={true}
                    readOnly={readOnly}
                  />
                  <TextInput
                    name="Label (e.g. Greater Than)"
                    type="text"
                    value={label}
                    setValue={setLabel}
                    required={true}
                    readOnly={readOnly}
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
              data={filteredData}
              loading={isLoading || isFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
