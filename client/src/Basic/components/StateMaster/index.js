import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetStateQuery,
  useGetStateByIdQuery,
  useAddStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,
} from "../../../redux/services/StateMasterService";
import { useGetCountriesQuery } from "../../../redux/services/CountryMasterService";

import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  DropdownInput,
  ReusableTable,
  ToggleButton,
  TextInputNew,
  DropdownInputNew,
  TextInputNew1,
} from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useDispatch } from "react-redux";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import Swal from "sweetalert2";
import { CountryMaster } from "..";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "State Master";

export default function Form({
  onSuccess,
  onClose,
  editId,
  deleteId,
  deleteLabel,
} = {}) {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState(editId || deleteId || "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [country, setCountry] = useState("");
  const [gstNo, setGstNo] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const [dispatchInvalidate] = useInvalidateTags();
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: countriesList,
    isLoading: isCountryLoading,
    isFetching: isCountryFetching,
  } = useGetCountriesQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetStateQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStateByIdQuery(id, { skip: !id });

  const [addData] = useAddStateMutation();
  const [updateData] = useUpdateStateMutation();
  const [removeData] = useDeleteStateMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || "");
      setCode(data?.code || "");
      setCountry(data?.countryId || "");
      setGstNo(data?.gstNo || "");
      setActive(data?.active ?? true);
      childRecord.current = data?.childRecord || 0;
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    active,
    country,
    gstNo,
    id,
  };

  const validateData = (data) => {
    if (data.name && data.code && data?.country) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
      // toast.success(text + "Successfully");
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        countryNameRef?.current?.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
      }
      Swal.fire({
        title: text + "Successfully",
        icon: "success",
      });
      dispatchInvalidate();
    } catch (error) {
      console.log(error);
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return;
    }

    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item.name == name && item.countryId == country);
    } else {
      foundItem = allData?.data?.some(
        (item) => item.name == name && item.countryId == country,
      );
    }
    if (foundItem) {
      Swal.fire({
        text: "The State Name already exists.",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };
  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            // title: 'Submission error',
            text: deldata?.message || "Something went wrong!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        dispatchInvalidate();
        syncFormWithDb(undefined);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setForm(false);
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

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["Code", "Name", "Country", "Status"];
  const tableDataNames = [
    "dataObj.code",
    "dataObj.name",
    "dataObj.country.name",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },
    {
      header: "State Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-64",
    },
    {
      header: "Country Name",
      accessor: (item) => item?.country?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-64",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  // const countryNameRef = useRef(null);

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);

  const formBody = (
    <div className="flex-1 p-3 ">
      <div className="grid grid-cols-1  gap-3  h-full ">
        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
          <fieldset className="grid grid-cols-2 gap-2 rounded mt-2">
            <div className=" ">
              <TextInputNew1
                name="State Name"
                type="text"
                value={name}
                setValue={setName}
                required={true}
                readOnly={readOnly}
                ref={countryNameRef}
                disabled={childRecord.current > 0}
              />
            </div>
            <div className="">
              {/* <DropdownInputNew
                          name="Country"
                          options={dropDownListObject(
                            id
                              ? countriesList?.data
                              : countriesList?.data?.filter(
                                  (item) => item?.active,
                                ),
                            "name",
                            "id",
                          )}
                          value={country}
                          setValue={setCountry}
                          required={true}
                          readOnly={readOnly}
                          className={`w-[150px]`}
                          disabled={childRecord.current > 0}
                        /> */}
              <DropdownWithModal
                name="Country"
                options={dropDownListObject(
                  id
                    ? countriesList?.data
                    : countriesList?.data?.filter((item) => item?.active),
                  "name",
                  "id",
                )}
                value={country}
                setValue={setCountry}
                required={true}
                readOnly={readOnly}
                className={`w-[150px]`}
                disabled={childRecord.current > 0}
                addNewLabel="+ Add New Country"
                childComponent={CountryMaster}
                addNewModalWidth="w-[40%] h-[48%]"
              />
            </div>

            <div className="">
              <TextInputNew1
                name="Code"
                type="text"
                value={code}
                setValue={setCode}
                required={true}
                readOnly={readOnly}
                disabled={childRecord.current > 0}
                onKeyDown={handlers.handleLastInputKeyDown}
              />
            </div>

            {/* <div className="">
                              
                              <TextInputNew
                                name="GST No"
                                type="text"
                                value={gstNo}
                                setValue={setGstNo}
                                readOnly={readOnly}
                              // disabled={(childRecord.current > 0)}

                              />
                            </div> */}

            <div data-skip-focus="true" className="mt-1">
              <ToggleButton
                name="Status"
                value={active}
                setActive={setActive}
                required={true}
                readOnly={readOnly}
                onKeyDown={handlers.handleToggleKeyDown}
                ref={toggleButtonRef}
              />
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );

  if (deleteId) {
    const childCount = singleData?.data?.childRecord ?? 0;
    const isLoadingRecord = isSingleFetching || isSingleLoading;

    const handleConfirmDelete = async () => {
      try {
        const res = await removeData(deleteId).unwrap();
        if (res?.statusCode === 1) {
          toast.error(res?.data?.message || "Cannot delete");
          return;
        }
        toast.success("State deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete state");
      }
    };

    return (
      <div className="min-h-[250px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center bg-white">
          <h2 className="text-lg font-semibold">Delete State</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded mb-3">
          {isLoadingRecord ? (
            <p>Checking...</p>
          ) : childCount > 0 ? (
            <>
              <p className="text-red-600 font-semibold">
                Cannot delete "{deleteLabel}"
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <p>Are you sure delete "{deleteLabel}"?</p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            {editId ? "Edit State" : "Add New State"}
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            {editId ? "Update" : "Save"}
          </button>
        </div>

        {formBody}
      </div>
    );
  }

  return (
    // <div
    //   onKeyDown={handleKeyDown}
    //   className="md:items-start md:justify-items-center grid h-full bg-theme"
    // >
    //   <div className="flex flex-col frame w-full h-full">
    //     <FormHeader
    //       onNew={onNew}
    //       onClose={() => {
    //         setForm(false);
    //         setSearchValue("");
    //       }}
    //       model={MODEL}
    //       saveData={saveData}
    //       setReadOnly={setReadOnly}
    //       deleteData={deleteData}
    //       childRecord={childRecord.current}
    //     />

    //     <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">

    //       <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
    //         <div className="mr-1 md:ml-2">
    //           <fieldset className="frame my-1">
    //             <legend className="sub-heading">State Info</legend>
    //             <div className="grid grid-cols-1 my-2">
    //               <TextInput
    //                 name="State Name"
    //                 type="text"
    //                 value={name}
    //                 setValue={setName}
    //                 required={true}
    //                 readOnly={readOnly}
    //                 disabled={(childRecord.current > 0)}
    //               />
    //               <TextInput
    //                 name="Code"
    //                 type="text"
    //                 value={code}
    //                 setValue={setCode}
    //                 required={true}
    //                 readOnly={readOnly}
    //                 disabled={(childRecord.current > 0)}
    //               />
    //               <TextInput
    //                 name="GST No"
    //                 type="text"
    //                 value={gstNo}
    //                 setValue={setGstNo}
    //                 readOnly={readOnly}
    //                 disabled={(childRecord.current > 0)}
    //               />
    //               <DropdownInput
    //                 name="Country"
    //                 options={dropDownListObject(id ? countriesList.data : countriesList.data.filter(item => item.active), "name", "id")}
    //                 value={country}
    //                 setValue={setCountry}
    //                 required={true}
    //                 readOnly={readOnly}
    //               />
    //               <CheckBox
    //                 name="Active"
    //                 readOnly={readOnly}
    //                 value={active}
    //                 setValue={setActive}
    //               />
    //             </div>
    //           </fieldset>
    //         </div>
    //       </div>
    //       <div className="frame hidden md:block overflow-x-hidden">
    //         <FormReport
    //           searchValue={searchValue}
    //           setSearchValue={setSearchValue}
    //           setId={setId}
    //           tableHeaders={tableHeaders}
    //           tableDataNames={tableDataNames}
    //           data={allData?.data}
    //           loading={
    //             isLoading || isFetching
    //           }
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-lg font-bold text-gray-800">State Master</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New State
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[320px]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit State  Master"
                        : "State  Master"
                      : "Add New State "}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          setSearchValue("");
                          setId(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close");
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef}
                        tabIndex={0} // ✅ Add tabIndex
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && !id && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new");
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0} // ✅ Add tabIndex
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {formBody}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
