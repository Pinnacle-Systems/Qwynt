import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { TextInputNew, ToggleButton, ReusableTable } from "../../../Inputs";
import { Check, Power } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";
import {
  useAddPaytermMasterMutation,
  useDeletePaytermMasterMutation,
  useGetPaytermMasterByIdQuery,
  useGetPaytermMasterQuery,
  useUpdatePaytermMasterMutation,
} from "../../../redux/services/payTermMasterService";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "Pay Term Master";

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
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState("");
  const [active, setActive] = useState(true);
  const [aliasName, setAliasName] = useState("");
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
  } = useGetPaytermMasterQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPaytermMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddPaytermMasterMutation();
  const [updateData] = useUpdatePaytermMasterMutation();
  const [removeData] = useDeletePaytermMasterMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name ? data.name : "");
      setDays(data?.days ? data.days : 0);
      setYears(data?.years ? data?.years : 0);
      setMonths(data?.months ? data?.months : 0);
      setActive(id ? (data?.active ? data.active : false) : true);
      setAliasName(data?.aliasName ? data?.aliasName : "");
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
    days,
    active,
    aliasName,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    years,
    months,
  };

  const validateData = (data) => {
    if (!data.name) {
      return { isValid: false, message: "Pay Term Name is required" };
    }
    // const hasValidDuration =
    //   Number(data.days) > 0 ||
    //   Number(data.months) > 0 ||
    //   Number(data.years) > 0;

    // if (!hasValidDuration) {
    //   return {
    //     isValid: false,
    //     message: "Enter at least one: Days, Months, or Years greater than 0",
    //   };
    // }

    return { isValid: true };
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
        payTermNameRef?.current?.focus();
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
      payTermNameRef?.current?.focus();
    }
  };

  const saveData = (nextProcess) => {
    const upperName = name.toUpperCase();
    const finalData = {
      ...data,
      name: upperName,
    };

    const validation = validateData(finalData);

    if (!validation.isValid) {
      Swal.fire({
        title: validation.message,
        icon: "error",
        didClose: () => {
          payTermNameRef?.current?.focus();
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
        text: "The Pay Term Name already exists.",
        icon: "warning",
        didClose: () => {
          payTermNameRef?.current?.focus();
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
    // {
    //   header: "Days",
    //   accessor: (item) => item.days,
    //   className: "font-medium text-gray-900 text-center w-24",
    // },
    {
      header: "Pay Term",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900 text-left uppercase w-64",
    },
    // {
    //   header: "Alias Name",
    //   accessor: (item) => item.aliasName || "-",
    //   className: "font-medium text-gray-900 text-left w-48",
    // },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-16",
    },
  ];

  const {
    firstInputRef: payTermNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;
  const descriptionRef = useRef(null);

  useEffect(() => {
    if ((form || onSuccess) && payTermNameRef.current) {
      payTermNameRef.current.focus();
    }
  }, [form, onSuccess]);
  const totalDays =
    (parseInt(years) || 0) * 365 +
    (parseInt(months) || 0) * 30 +
    (parseInt(days) || 0);

  const formBody = (
    <div className="flex-1 p-3">
      <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
        <div className="p-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="w-60">
              <TextInputNew
                name="Pay Term"
                type="text"
                value={name}
                setValue={setName}
                required={true}
                readOnly={readOnly}
                disabled={childRecord.current > 0}
                ref={payTermNameRef}
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Pay Term Period
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={years}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setYears(e.target.value)}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    onFocus={(e) => e.target.select()}
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="29"
                    value={days}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setDays(e.target.value)}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm text-right"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-center text-gray-500 w-full">
              Total Days :{" "}
              <span className="font-bold text-gray-700 text-[12px]">
                {totalDays} Days
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ToggleButton
              name="Status"
              options={statusDropdown}
              value={active}
              setActive={setActive}
              required={true}
              readOnly={readOnly}
              ref={toggleButtonRef}
              onKeyDown={handlers.handleToggleKeyDown}
              disabled={childRecord.current > 0}
            />
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
        toast.success("Pay Term deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete pay term");
      }
    };

    return (
      <div className="min-h-[380px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Delete Pay Term
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded mb-3">
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
                  . Remove them first before deleting this pay term.
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
            {editId ? "Edit Pay Term" : "Add New Pay Term"}
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
        <h5 className="text-lg font-bold text-gray-800">Pay Term Master</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Pay Term
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[550px] h-[460px]"}
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
                      ? "Edit Pay Term Master"
                      : "Pay Term Master"
                    : "Add New Pay Term"}
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
  );
}
