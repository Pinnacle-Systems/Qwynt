import React, { useEffect, useState, useCallback } from "react";
import {
  useGetApprovalModulesQuery,
  useAddApprovalModuleMutation,
  useUpdateApprovalModuleMutation,
  useDeleteApprovalModuleMutation,
} from "../../../redux/uniformService/ApprovalMasterServices";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";

const MODEL = "Approval Rule Module";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const { data: allData, isLoading, isFetching } = useGetApprovalModulesQuery();

  const [addData] = useAddApprovalModuleMutation();
  const [updateData] = useUpdateApprovalModuleMutation();
  const [removeData] = useDeleteApprovalModuleMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name || "");
      setActive(id ? (data?.active ?? false) : true);
    },
    [id]
  );

  useEffect(() => {
    if (id && allData?.data) {
       const singleData = allData.data.find(d => d.id === id);
       syncFormWithDb(singleData);
    } else {
       syncFormWithDb(undefined);
    }
  }, [id, allData, syncFormWithDb]);

  const data = { 
    name, 
    active, 
    ...(id ? { id } : {}) 
  };

  const validateData = (data) => {
    return data.name;
  };

  const handleSubmitCustom = async (callback, reqData, text) => {
    try {
      const res = await callback(reqData).unwrap();
      if(res.statusCode === 1) {
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
      toast.info("Please fill required fields...!");
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;
    
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const tableHeaders = ["Module Name", "Status"];
  const tableDataNames = [
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  if (form) {
    return (
      <div className="flex flex-col h-full bg-white">
        <FormHeader
          onClose={() => setForm(false)}
          saveData={saveData}
          deleteData={() => {
             if(window.confirm("Delete this module?")) {
                 handleSubmitCustom(removeData, id, "Deleted");
                 setForm(false);
             }
          }}
          onNew={() => {
            setId("");
            syncFormWithDb(undefined);
            setReadOnly(false);
          }}
          model={id ? `Edit ${MODEL}` : `Add ${MODEL}`}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
        <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            <div className="w-full max-w-xl">
              <fieldset className="frame my-1">
                <legend className="sub-heading">Module Info</legend>
                <div className="grid grid-cols-1 my-2">
                  <TextInput
                    name="Module Name (e.g. PURCHASE ORDER)"
                    type="text"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                  />
                  <CheckBox
                    name="Active"
                    value={active}
                    setValue={setActive}
                    readOnly={readOnly}
                  />
                </div>
              </fieldset>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        data={allData?.data || []}
        onNew={() => {
          setId("");
          setForm(true);
        }}
        onClick={(id) => {
          setId(id);
          setForm(true);
        }}
        loading={isLoading || isFetching}
      />
    </div>
  );
}
