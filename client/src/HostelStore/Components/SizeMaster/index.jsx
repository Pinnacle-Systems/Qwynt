import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Check, Power } from "lucide-react";
import { ReusableTable, TextInputNew, TextInputNew1, ToggleButton } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
import { useAddSizeMasterMutation, useDeleteSizeMasterMutation, useGetSizeMasterByIdQuery, useGetSizeMasterQuery, useLazyGetSizeMasterByIdQuery, useUpdateSizeMasterMutation } from "../../../redux/services/SizemasterService";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { UserPermissions } from "../../../Utils/UserPermissions";

export default function Form({ onSuccess, defaultName = "" }) {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [isPoWise, setIsPowise] = useState(false);
  const [active, setActive] = useState(true);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [dispatchInvalidate] = useInvalidateTags();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetSizeMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSizeMasterByIdQuery(id, { skip: !id });
  const [trigger, { data: LazyData }] = useLazyGetSizeMasterByIdQuery();

  const [addData] = useAddSizeMasterMutation();
  const [updateData] = useUpdateSizeMasterMutation();
  const [removeData] = useDeleteSizeMasterMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name ? data.name : defaultName || "");
      setIsPowise(id ? (data?.isPoWise ? data.isPoWise : false) : false);
      setActive(id ? (data?.active ? data.active : false) : true);
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
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
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
        onSuccess(returnData?.data.id);
        return;
      }
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        countryNameRef?.current?.focus()

      } else {
        setForm(false);
        syncFormWithDb(undefined);

      }
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        // draggable: true,
        // timer: 1000,
        // showConfirmButton: false,
        // didOpen: () => {
        //     Swal.showLoading();
        // }
      });
      dispatchInvalidate();

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
        }
        // draggable: true,
        // timer: 1000,
        // showConfirmButton: false,
        // didOpen: () => {
        //     Swal.showLoading();
        // }
      });
      return;
    }
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item.name === name);
    } else {
      foundItem = allData?.data?.some((item) => item.name === name);
    }

    if (foundItem) {
      Swal.fire({
        text: "The Size Name already exists.",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        }
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
    const { data } = await trigger(id);

    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "Child Record",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          await removeData(id);
          setId("");
          Swal.fire({
            title: "Deleted" + "  " + "Successfully",
            icon: "success",
            // draggable: true,
            // timer: 1000,
            // showConfirmButton: false,
            // didOpen: () => {
            //     Swal.showLoading();
            // }
          });
          syncFormWithDb(undefined);

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
      header: "Size",
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

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);


  useEffect(() => {
    if (onSuccess) {
      setTimeout(() => {
        // 🔥 force blur whoever is holding focus (react-select)
        if (document.activeElement) {
          document.activeElement.blur();
        }

        // then focus your input
        countryNameRef.current?.focus();
      }, 50); // small delay important
    }
  }, [onSuccess]);

  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1  gap-3  h-full">
        <div className="lg:col-span- space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <div className="space-y-4 ">
              <fieldset className=" rounded mt-2">
                <div className="grid grid-cols-2 my-2">
                  <div className="w-[50%">
                    <TextInputNew1
                      ref={countryNameRef}
                      name="Size"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />
                  </div>
                  {/* <CheckBox name="Po wise" readOnly={readOnly} value={isPoWise} setValue={setIsPowise} /> */}
                </div>
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
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Add New Size
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            Save
          </button>
        </div>

        {formBody}
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} className="p-1 h-[87%]">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-lg font-bold text-gray-800">Size Master</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Size
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 ">
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
            widthClass={"w-[600px] h-[350px]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <div className="h-full flex flex-col bg-gray-200">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Size  Master"
                        : "Size  Master"
                      : "Add New Size  Master"}
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
    </div>
  );
}
