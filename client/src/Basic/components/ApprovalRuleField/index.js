import React, { useEffect, useState, useCallback } from "react";
import {
  useGetApprovalFieldsQuery,
  useAddApprovalFieldMutation,
  useUpdateApprovalFieldMutation,
  useDeleteApprovalFieldMutation,
  useGetApprovalOperatorsQuery,
  useGetApprovalModulesQuery,
} from "../../../redux/uniformService/ApprovalMasterServices";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  DropdownInput,
  MultiSelectDropdown,
} from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import {
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";

const MODEL = "Approval Rule Field";

const AGGREGATION_OPTIONS = [
  { id: "", name: "None (single relation)" },
  { id: "SUM", name: "SUM" },
  { id: "COUNT", name: "COUNT" },
  { id: "MAX", name: "MAX" },
  { id: "MIN", name: "MIN" },
  { id: "AVG", name: "AVG" },
];

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("");
  const [active, setActive] = useState(true);
  const [parentRelation, setParentRelation] = useState("");
  const [fieldPath, setFieldPath] = useState("");
  const [aggregation, setAggregation] = useState(""); // ✅ NEW
  const [operatorIds, setOperatorIds] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const { data: allData, isLoading, isFetching } = useGetApprovalFieldsQuery();
  const { data: operatorData } = useGetApprovalOperatorsQuery();
  const { data: moduleList } = useGetApprovalModulesQuery();

  const [addData] = useAddApprovalFieldMutation();
  const [updateData] = useUpdateApprovalFieldMutation();
  const [removeData] = useDeleteApprovalFieldMutation();

  // ✅ FIX: syncFormWithDb should NOT set readOnly — that belongs in a separate effect
  const syncFormWithDb = useCallback((data) => {
    setModuleId(data?.moduleId || "");
    setName(data?.name || "");
    setLabel(data?.label || "");
    setType(data?.type || "");
    setActive(data?.active ?? true);
    setParentRelation(data?.parentRelation || "");
    setFieldPath(data?.fieldPath || "");
    setAggregation(data?.aggregation || ""); // ✅ NEW
    setOperatorIds(
      data?.Operators?.map((op) => ({ label: op.label, value: op.id })) || [],
    );
  }, []);

  useEffect(() => {
    if (id && allData?.data) {
      const singleData = allData.data.find((d) => d.id === id);
      syncFormWithDb(singleData);
    } else {
      syncFormWithDb(undefined);
    }
  }, [id, allData, syncFormWithDb]);

  // ✅ Separate effect for readOnly — only runs when id changes (not on every data refetch)
  useEffect(() => {
    if (id) setReadOnly(true);
  }, [id]);

  const data = {
    moduleId: Number(moduleId),
    name,
    label,
    type,
    parentRelation: parentRelation?.trim() || null,
    fieldPath: fieldPath?.trim() || null,
    aggregation: aggregation || null, // ✅ NEW
    active,
    operatorIds: operatorIds.map((o) => o.value),
    ...(id ? { id } : {}),
  };

  const validateData = (data) => {
    if (!data.moduleId || !data.name || !data.label || !data.type) {
      return false;
    }
    // ✅ Validation: aggregation is required when parentRelation is set on array fields
    // We can't know from the frontend if it's an array, so warn the user instead
    return true;
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

  const tableHeaders = [
    "Module Name",
    "Relation",
    "Nested Path",
    "Field Name",
    "Label",
    "Aggregation", // ✅ NEW column
    "Type",
    "Status",
  ];
  const tableDataNames = [
    "dataObj.Module.name",
    "dataObj.parentRelation",
    "dataObj.fieldPath",
    "dataObj.name",
    "dataObj.label",
    "dataObj.aggregation", // ✅ NEW
    "dataObj.type",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  let filteredData = allData?.data || [];
  if (searchValue) {
    filteredData = filteredData.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (d.label && d.label.toLowerCase().includes(searchValue.toLowerCase())),
    );
  }

  const datatypeOptions = dropDownListObject(
    [
      { id: "text", name: "Text" },
      { id: "number", name: "Number" },
      { id: "boolean", name: "Boolean" },
      { id: "date", name: "Date" },
    ],
    "name",
    "id",
  );

  const aggregationOptions = dropDownListObject(
    AGGREGATION_OPTIONS,
    "name",
    "id",
  );
  const allowedOperatorOptions = multiSelectOption(
    operatorData?.data || [],
    "label",
    "id",
  );

  // ✅ Show aggregation only when parentRelation is filled (helps users understand when it applies)
  const showAggregation = !!parentRelation?.trim();

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
                <legend className="sub-heading">Field Dictionary Info</legend>
                <div className="grid grid-cols-1 my-2">
                  <DropdownInput
                    name="Module (Entity)"
                    options={dropDownListObject(
                      moduleList?.data || [],
                      "name",
                      "id",
                    )}
                    value={moduleId}
                    setValue={setModuleId}
                    required={true}
                    readOnly={readOnly}
                  />
                  <TextInput
                    name="Parent Relation (e.g. Supplier, poItems)"
                    type="normal"
                    value={parentRelation}
                    setValue={setParentRelation}
                    readOnly={readOnly}
                  />
                  <TextInput
                    name="Nested Path (e.g. Address.City)"
                    type="normal"
                    value={fieldPath}
                    setValue={setFieldPath}
                    readOnly={readOnly}
                  />

                  {/* ✅ NEW — Aggregation dropdown, only shown when parentRelation is filled */}
                  {showAggregation && (
                    <>
                      <DropdownInput
                        name="Aggregation (for array relations like poItems)"
                        options={aggregationOptions}
                        value={aggregation}
                        setValue={setAggregation}
                        readOnly={readOnly}
                      />
                      <p className="text-[10px] text-gray-500 -mt-1 mb-2 px-1">
                        Use SUM/COUNT/MAX/MIN/AVG for array relations (e.g.
                        poItems). Leave as "None" for single relations (e.g.
                        Supplier).
                      </p>
                    </>
                  )}

                  <TextInput
                    name="DB Variable Name (e.g. netBillValue)"
                    type="normal"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                  />
                  <TextInput
                    name="UI Label (e.g. Total Amount)"
                    type="text"
                    value={label}
                    setValue={setLabel}
                    required={true}
                    readOnly={readOnly}
                  />
                  <DropdownInput
                    name="Data Type"
                    options={datatypeOptions}
                    value={type}
                    setValue={setType}
                    required={true}
                    readOnly={readOnly}
                  />
                  <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Allowed Operators
                    </label>
                    <MultiSelectDropdown
                      name=""
                      selected={operatorIds}
                      setSelected={setOperatorIds}
                      options={allowedOperatorOptions}
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                  </div>
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
