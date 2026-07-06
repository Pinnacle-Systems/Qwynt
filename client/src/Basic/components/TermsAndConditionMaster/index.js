import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  useAddTermsandCondtionsMutation,
  useDeleteTermsandCondtionsMutation,
  useGetTermsandCondtionsByIdQuery,
  useGetTermsandCondtionsQuery,
  useLazyGetTermsandCondtionsByIdQuery,
  useUpdateTermsandCondtionsMutation,
} from "../../../redux/uniformService/TermsAndContionService";
import { ReusableTable, TextInputNew1, ToggleButton } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "Terms & Conditions Master";

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
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const [showHint, setShowHint] = useState(false);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetTermsandCondtionsQuery({ params, searchParams: searchValue });

  const rows = allData?.data ?? [];

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetTermsandCondtionsByIdQuery(id, { skip: !id });

  const [trigger, { data: LazyData }] = useLazyGetTermsandCondtionsByIdQuery();

  const [addData] = useAddTermsandCondtionsMutation();
  const [updateData] = useUpdateTermsandCondtionsMutation();
  const [removeData] = useDeleteTermsandCondtionsMutation();

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
      setDescription(data?.description || "");
      setActive(data?.active ?? true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    name,
    description,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const validateData = (data) => {
    if (data.name && data.description) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);

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
        termsNameRef?.current?.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
      }
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
      termsNameRef?.current?.focus();
    }
  };

  const saveData = (nextProcess) => {
    const upperName = name.toUpperCase();
    const finalData = {
      ...data,
      name: upperName,
    };

    if (!validateData(finalData)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => {
          termsNameRef?.current?.focus();
        },
      });
      return;
    }

    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item?.name.toUpperCase() === upperName);
    } else {
      foundItem = allData?.data?.some(
        (item) => item?.name.toUpperCase() === upperName,
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Terms & Conditions Name already exists.",
        icon: "warning",
        didClose: () => {
          termsNameRef?.current?.focus();
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
      handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, finalData, "Added", nextProcess);
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
          await Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        syncFormWithDb(undefined);
      } catch (error) {
        await Swal.fire({
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
      className: "font-medium text-gray-900 w-12 text-center",
    },
    {
      header: "Name",
      accessor: (item) => item?.name,
      className: "font-medium text-gray-900 text-left uppercase w-48",
    },
    {
      header: "Terms & Conditions",
      accessor: (item) => item?.description,
      className: "font-medium text-gray-900 text-left w-[400px]",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-16",
    },
  ];

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };

  const {
    firstInputRef: termsNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;
  const descriptionRef = useRef(null);

  useEffect(() => {
    if ((form || onSuccess) && termsNameRef.current) {
      termsNameRef.current.focus();
    }
  }, [form, onSuccess]);

  const formBody = (
    <div className="flex-1 overflow-auto p-3">
      <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
        <div className="space-y-4">
          <fieldset className="rounded mt-2">
            <div className="mb-3 w-[58%]">
              <TextInputNew1
                name="Terms & Condition Name"
                type="text"
                value={name}
                setValue={setName}
                required={true}
                readOnly={readOnly}
                disabled={childRecord.current > 0}
                ref={termsNameRef}
              />
            </div>
            <div className="mt-3">
              {showHint && (
                <div className="mb-1 text-[11px] text-indigo-600 font-medium">
                  ⌨️ Use <span className="font-semibold">Ctrl + Enter</span> for
                  next row
                </div>
              )}

              <label className="block text-xs font-bold text-gray-600 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-32 focus:outline-none border border-gray-300 rounded p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={description}
                disabled={childRecord.current > 0 || readOnly}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter terms and conditions description..."
                ref={descriptionRef}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") {
                    e.preventDefault();

                    const textarea = e.target;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    const newValue =
                      description.substring(0, start) +
                      "\n" +
                      description.substring(end);

                    setDescription(newValue);

                    // ✅ Restore focus + cursor properly
                    requestAnimationFrame(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + 1, start + 1);
                    });
                  }
                }}
                onFocus={() => setShowHint(true)}
                onBlur={() => setShowHint(false)}
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
        toast.success("Terms & Conditions deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(
          err?.data?.message || "Failed to delete terms & conditions",
        );
      }
    };

    return (
      <div className="h-full flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Delete Terms & Conditions
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded">
          {isLoadingRecord ? (
            <p className="text-xs text-gray-400">Checking records...</p>
          ) : childCount > 0 ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <p className="text-sm font-semibold text-red-600">
                  Cannot Delete
                </p>
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                  <span className="font-semibold text-red-600">
                    {childCount} linked record{childCount > 1 ? "s" : ""}
                  </span>
                  . Remove them first before deleting this terms & conditions.
                </p>
              </div>
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
            {editId ? "Edit Terms & Conditions" : "Add New Terms & Conditions"}
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
      <div className="w-full flex bg-white p-1 justify-between items-center">
        <h5 className="text-lg font-bold text-gray-800">
          Terms & Conditions Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Terms & Conditions
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={rows}
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
                        ? "Edit Terms & Conditions Master"
                        : "Terms & Conditions Master"
                      : "Add New Terms & Conditions"}
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
                        onClick={() => saveData("close")}
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
                        onClick={() => saveData("new")}
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
    </div>
  );
}
