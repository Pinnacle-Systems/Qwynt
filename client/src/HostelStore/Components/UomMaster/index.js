import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ReusableTable,
  ToggleButton,
  TextInputNew,
} from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import {
  useGetUomQuery,
  useGetUomByIdQuery,
  useAddUomMutation,
  useUpdateUomMutation,
  useDeleteUomMutation,
  useLazyGetUomByIdQuery,
} from "../../../redux/services/UomMasterService.js";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal/index.js";
import { statusDropdown } from "../../../Utils/DropdownData.js";
import Swal from "sweetalert2";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions.js";

const MODEL = "Uom Master";

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
  // const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

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
  } = useGetUomQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUomByIdQuery(id, { skip: !id });
  const [trigger, { data: LazyData }] = useLazyGetUomByIdQuery();

  const [addData] = useAddUomMutation();
  const [updateData] = useUpdateUomMutation();
  const [removeData] = useDeleteUomMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      // setCode(data?.code ? data.code : "");
      setActive(id ? (data?.active ? data.active : false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id],
  );
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);
  const data = {
    name,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    active,
    id,
  };
  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  };
  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);

      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData?.data.id);
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
        title: text + "  " + "Successfully",
        icon: "success",
      });
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
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
        ?.some(
          (item) =>
            item.name?.trim().toLowerCase() === name?.trim().toLowerCase(),
        );
    } else {
      foundItem = allData?.data?.some((item) => item.name === name);
    }

    if (foundItem) {
      Swal.fire({
        title: "The Uom Name already exists.",
        icon: "error",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return;
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

  const deleteData = async (id, childRecord) => {
    const { data } = await trigger(id);

    if (childRecord) {
      Swal.fire({
        icon: "error",
        title: "Child record Exists",
      });
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record Exists",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let returnData = await removeData(id).unwrap();
          if (returnData.statusCode === 0) {
            setId("");
            syncFormWithDb(undefined);
            Swal.fire({
              title: "Deleted Successfully",
              icon: "success",
            });
            syncFormWithDb(undefined);
          } else {
            Swal.fire({
              icon: "error",
              title: returnData?.message || "Something went wrong!",
            });
          }
        } catch (error) {
          toast.error("something went wrong");
        }
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
    setForm(true);
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["Name", "Status"];
  const tableDataNames = ["dataObj.name", "dataObj.active ? ACTIVE : INACTIVE"];
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
      header: "Uom",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-48",
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
  const descriptionRef = useRef(null);

  const formBody = (
    <div className="flex-1 p-3 ">
      <div className="grid grid-cols-1  gap-3  h-full ">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <div className="space-y-4 ">
              <div className="grid grid-cols-2  gap-3  h-full">
                <fieldset className="">
                  <div className="mb-5">
                    <TextInputNew
                      name="Uom Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      ref={countryNameRef}
                    />
                  </div>
                  <div>
                    <ToggleButton
                      name="Status"
                      options={statusDropdown}
                      value={active}
                      setActive={setActive}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      ref={toggleButtonRef}
                      onKeyDown={handlers.handleToggleKeyDown}
                    />
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);

  if (deleteId) {
    const childCount = singleData?.data?.childRecord ?? 0;
    const isLoadingRecord = isSingleFetching || isSingleLoading;

    const handleConfirmDelete = async () => {
      try {
        const res = await removeData(deleteId).unwrap();
        if (res?.statusCode === 1) {
          toast.error(
            res?.data?.message || "Cannot delete: child records exist",
          );
          return;
        }
        toast.success("Deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete");
      }
    };

    return (
      <div className="min-h-[250px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 mt-4 bg-white">
          <h2 className="text-lg font-semibold">Delete Uom</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded mb-3">
          {isLoadingRecord ? (
            <p>Checking...</p>
          ) : childCount > 0 ? (
            <>
              <p className="text-red-600 font-semibold">Cannot Delete</p>
              <p>
                "{deleteLabel}" has {childCount} linked records.
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
              <>
                <p className="text-sm text-gray-700 text-center">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">"{deleteLabel}"</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
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
            {editId ? "Edit Uom" : "Add New Uom"}
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
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-lg font-bold text-gray-800">
          Unit Of Mesaurement Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Unit Of Mesaurement
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
            widthClass={"w-[40%] h-[50%]"}
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
                        ? "Edit Unit Of Mesaurement"
                        : "Unit Of Mesaurement Master"
                      : "Add New Unit Of Mesaurement  "}
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
                        ref={saveCloseButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                                                                                 border border-blue-600 flex items-center gap-1 text-xs"
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
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                                                                       border border-green-600 flex items-center gap-1 text-xs"
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
