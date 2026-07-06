import React, { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  useAddLocationMasterMutation,
  useDeleteLocationMasterMutation,
  useGetLocationMasterByIdQuery,
  useGetLocationMasterQuery,
  useLazyGetLocationMasterByIdQuery,
  useUpdateLocationMasterMutation,
} from "../../../redux/services/LocationMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import secureLocalStorage from "react-secure-storage";
import { Check, Power } from "lucide-react";
import {
  TextInput,
  ToggleButton,
  ReusableTable,
  CheckBox,
  DropdownInput,
} from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import Modal from "../../../UiComponents/Modal";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { toast } from "react-toastify";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "Location Master";

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
  const [storeName, setStoreName] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isFabric, setIsFabric] = useState(false);
  const [isYarn, setIsYarn] = useState(false);
  const [isAccessory, setIsAccessory] = useState(false);
  const [isGarments, setIsGarments] = useState(false);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const {
    firstInputRef: branchRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;
  // Create refs for form fields
  const locationNameRef = useRef(null);
  // const dispatch = useDispatch();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetLocationMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetLocationMasterByIdQuery(id, { skip: !id });

  const {
    data: branchList,
    isLoading: isBranchLoading,
    isFetching: isBranchFetching,
  } = useGetBranchQuery({ params });

  const [trigger, { data: singleDataLazy, isFetchingLazy }] =
    useLazyGetLocationMasterByIdQuery();

  const [addData] = useAddLocationMasterMutation();
  const [updateData] = useUpdateLocationMasterMutation();
  const [removeData] = useDeleteLocationMasterMutation();

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
        setStoreName("");
        setLocationId("");
        setIsAccessory(false);
        setIsFabric(false);
        setIsYarn(false);
        setIsGarments(false);
        setActive(id ? data?.active : true);
      } else {
        setStoreName(data?.storeName || "");
        setLocationId(data?.locationId || "");
        setIsAccessory(data?.isAccessory || false);
        setIsFabric(data?.isFabric || false);
        setIsYarn(data?.isYarn || false);
        setIsGarments(data?.isGarments || false);
        setActive(id ? (data?.active ?? false) : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if ((form || onSuccess) && branchRef.current) {
      branchRef.current.focus();
    }
  }, [form, onSuccess]);

  const data = {
    id,
    storeName,
    locationId,
    isYarn,
    isAccessory,
    isFabric,
    isGarments,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const validateData = (data) => {
    if (data.storeName && data.locationId) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
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
        // Focus on branch field after Save & New
        branchRef.current.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
      }
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didClose: () => {
          branchRef.current.focus();
        },
      });
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some(
          (item) =>
            item.storeName?.trim().toLowerCase() ===
            storeName?.trim().toLowerCase(),
        );
    } else {
      foundItem = allData?.data?.some(
        (item) =>
          item.storeName?.trim().toLowerCase() ===
          storeName?.trim().toLowerCase(),
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Location Name already exists.",
        icon: "warning",
        timer: 1500,
        didClose: () => {
          branchRef?.current?.focus();
        },
      });
      return false;
    }
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        timer: 1000,
        didClose: () => {
          branchRef?.current?.focus();
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

  const handleDelete = async (id) => {
    setId(id);
    const { data } = await trigger(id);
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
          let deldata = await removeData(id).unwrap();
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
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
    {
      header: "Company (Branch) / Location",
      accessor: (item) =>
        `${item.Location?.branchName ? ` ${item.Location.branchName} /` : ""} ${item.storeName}`,
      className: "font-medium text-gray-900  w-[250px]  py-1  px-2",
      search: "Location Name",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
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

  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1  gap-3  h-full">
        <div className="lg:col-span- space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <fieldset className=" rounded mt-2">
              <div className="">
                {/* <div className="flex flex-wrap justify-between mt-4">
                          <div className="mb-3">
                            <CheckBox
                              name="Yarn"
                              value={isYarn}
                              setValue={setIsYarn}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-3">
                            <CheckBox
                              name="Fabric"
                              value={isFabric}
                              setValue={setIsFabric}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-3">
                            <CheckBox
                              name="Accessory"
                              value={isAccessory}
                              setValue={setIsAccessory}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-3">
                            <CheckBox
                              name="Garments"
                              value={isGarments}
                              setValue={setIsGarments}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                        </div> */}
                <div className="flex-col">
                  <div className="mb-3 w-[48%]">
                    <DropdownInput
                      ref={branchRef}
                      name="Company/Branch"
                      options={dropDownListObject(
                        id
                          ? branchList?.data
                          : branchList?.data?.filter((item) => item.active),
                        "branchName",
                        "id",
                      )}
                      value={locationId}
                      setValue={setLocationId}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      autoFocus={true}
                    />
                  </div>
                  <div className="mb-3 w-[48%]">
                    <TextInput
                      ref={locationNameRef}
                      name="Location"
                      type="text"
                      value={storeName}
                      setValue={setStoreName}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      required={true}
                    />
                  </div>
                </div>

                <div className="mb-5 mt-3">
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
          toast.error(res?.data?.message || "Cannot delete");
          return;
        }
        toast.success("Location deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete Location");
      }
    };

    return (
      <div className="min-h-[300px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center bg-white">
          <h2 className="text-lg font-semibold">Delete Location</h2>
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
                  . Remove them first before deleting this Location.
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
            {editId ? "Edit Location" : "Add New Location"}
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
        <h5 className="text-lg font-bold font-segoe text-gray-800 ">
          Location Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border font-segoe border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-xs px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Location
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
          widthClass={"w-[550px] max-w-6xl h-[400px]"}
          onClose={() => {
            setForm(false);
            syncFormWithDb(undefined);
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mt-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Location  "
                      : "Location Master"
                    : "Add New  Location "}
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setReadOnly(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => saveData("close")}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                          border border-green-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                      {!id && (
                        <button
                          type="button"
                          onClick={() => saveData("new")}
                          className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                            border border-blue-600 flex items-center gap-1 text-xs"
                          onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                          ref={saveNewButtonRef} // ✅ Add ref
                          tabIndex={0}
                        >
                          <Check size={14} />
                          {"Save & New"}
                        </button>
                      )}
                    </>
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
