import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  MultiSelectDropdown,
  ReusableTable,
  TextInput,
  TextInputNew,
  ToggleButton,
} from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { multiSelectOption } from "../../../Utils/contructObject";
import { findFromList } from "../../../Utils/helper";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import { toast } from "react-toastify";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import {
  useAddProcessGroupMasterMutation,
  useDeleteProcessGroupMasterMutation,
  useGetProcessGroupMasterByIdQuery,
  useGetProcessGroupMasterQuery,
  useUpdateProcessGroupMasterMutation,
} from "../../../redux/services/ProcessGroupMaster.service";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService";
import { UserPermissions } from "../../../Utils/UserPermissions";

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
  const [processGroupList, setProcessGroupList] = useState([]);
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [errors, setErrors] = useState({});
  const multiSelectRef = useRef(null);

  const [dispatchInvalidate] = useInvalidateTags();

  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const {
    firstInputRef: processNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetProcessGroupMasterQuery({
    params: {
      ...params,
      active: true,
    },
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProcessGroupMasterByIdQuery(id, { skip: !id });

  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const [addData] = useAddProcessGroupMasterMutation();
  const [updateData] = useUpdateProcessGroupMasterMutation();
  const [removeData] = useDeleteProcessGroupMasterMutation();
  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setName("");
        setProcessGroupList([]);
        setActive(true);
      } else {
        setName(data?.name || "");
        setProcessGroupList(
          data?.processGroupList
            ? data.processGroupList.map((item) => {
                return {
                  label: findFromList(
                    item.processId,
                    processList ? processList.data : [],
                    "name",
                  ),
                  value: item.processId,
                };
              })
            : [],
        );
        setActive(id ? (data?.active ?? false) : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id, processList],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if ((form || onSuccess) && processNameRef.current) {
      processNameRef.current.focus();
    }
  }, [form, onSuccess]);

  const data = {
    id,
    name,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    processGroupList: processGroupList.map((item) => item.value),
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
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      if (nextProcess === "new") {
        syncFormWithDb(undefined);
        onNew();
        processNameRef?.current?.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
      }

      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      dispatchInvalidate();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const saveData = (nextProcess) => {
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some(
          (item) =>
            item.name?.trim().toLowerCase() === name?.trim().toLowerCase(),
        );
    } else {
      foundItem = allData?.data?.some(
        (item) =>
          item.name?.trim().toLowerCase() === name?.trim().toLowerCase(),
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Process Group already exists.",
        icon: "warning",
        timer: 1500,
        didClose: () => {
          processNameRef?.current?.focus();
        },
      });
      return false;
    }

    if (!validateData(data)) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Please fill all required fields...!",
        didClose: () => {
          processNameRef?.current?.focus();
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

  const processOptions = processList
    ? multiSelectOption(
        id ? processList?.data : processList.data.filter((item) => item.active),
        "name",
        "id",
      )
    : [];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId);
    setForm(true);
    setReadOnly(false);
  };

  const handleDelete = async (orderId) => {
    setId(orderId);

    if (orderId) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }

      try {
        let deldata = await removeData(orderId).unwrap();
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
          timer: 1000,
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
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 w-[10px] py-1",
    },
    {
      header: "Process Group Name",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900  w-[200px]  py-1  px-2",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
  ];

  // Form Body
  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1 gap-3 h-full">
        <div className="lg:col-span- space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <fieldset className="rounded mt-2">
              <div className="w-[50%]">
                <TextInputNew
                  name="Process Group Name"
                  type="text"
                  value={name}
                  setValue={setName}
                  required={true}
                  readOnly={readOnly}
                  disabled={childRecord.current > 0}
                  ref={processNameRef}
                />
              </div>
              <div className="w-[50%] mt-5">
                <MultiSelectDropdown
                  name="Process"
                  selected={processGroupList}
                  setSelected={setProcessGroupList}
                  options={processOptions}
                  readOnly={readOnly || childRecord.current > 0}
                  // disabled={childRecord.current > 0}
                  className="size-multiselect"
                  containerRef={multiSelectRef}
                  onTabFromLastItem={() => {
                    toggleButtonRef?.current?.focus();
                  }}
                />
              </div>
              <div className="mt-5">
                <ToggleButton
                  name="Status"
                  options={statusDropdown}
                  value={active}
                  setActive={setActive}
                  required={true}
                  readOnly={readOnly}
                  ref={toggleButtonRef}
                  onKeyDown={handlers.handleToggleKeyDown}
                />
              </div>
            </fieldset>
          </div>
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
      <div className="min-h-[360px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 mt-4 bg-white">
          <h2 className="text-lg font-semibold">Delete Process Group</h2>
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
            {editId ? "Edit Process Group" : "Add New Process Group"}
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
      <div className="w-full flex bg-white justify-between p-1 items-center">
        <h5 className="text-lg font-bold font-segoe text-gray-800">
          Process Group Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border font-segoe text-xs px-2 border-green-600 text-green-600 hover:bg-green-700 hover:text-white rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Process Group
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>

      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[600px] h-[500px]"}
          onClose={() => {
            setForm(false);
            syncFormWithDb(undefined);
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Process Group Master"
                      : "Process Group Master"
                    : "Add New Process Group Master"}
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
                      ref={saveCloseButtonRef} // ✅ Add ref
                      tabIndex={0}
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
                      onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                      ref={saveNewButtonRef} // ✅ Add ref
                      tabIndex={0}
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
  );
}
