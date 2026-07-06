import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useAddStyleItemMasterMutation,
  useDeleteStyleItemMasterMutation,
  useGetStyleItemMasterByIdQuery,
  useGetStyleItemMasterQuery,
  useLazyGetStyleItemMasterByIdQuery,
  useUpdateStyleItemMasterMutation,
} from "../../../redux/services/StyleItemMasterService";
import Swal from "sweetalert2";
import { Check, Power } from "lucide-react";
import {
  DropdownInput,
  ReusableTable,
  TextInputNew,
  TextInputNew1,
  ToggleButton,
} from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetSizeTemplateQuery } from "../../../redux/services/SizeTemplateMaster";
import { useGetItemGroupMasterQuery } from "../../../redux/services/ItemGroupMasterService";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { ItemGroup, UomMaster, SizeTemplate, HsnMaster, Gsm } from "..";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "Item Master";
export default function Form({ onSuccess, defaultName = "" }) {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [accessory, setAccessory] = useState(false);
  const [active, setActive] = useState(false);
  const [aliasName, setAliasName] = useState(defaultName || "");
  const [hsnId, setHsnId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [itemGroupId, setItemGroupId] = useState("");
  const [sizeTemplateId, setSizeTemplateId] = useState("");
  const [uomId, setUomId] = useState("");
  const [gsmId, setGsmId] = useState("");

  const [dispatchInvalidate] = useInvalidateTags();
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: uomList } = useGetUomQuery({ params });
  const { data: sizeTemplateList } = useGetSizeTemplateQuery({ params });
  const { data: itemGroupList } = useGetItemGroupMasterQuery({ params });
  const { data: gsmList } = useGetGsmMasterQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetStyleItemMasterQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStyleItemMasterByIdQuery(id, { skip: !id });
  const [trigger, { data: LazyData }] = useLazyGetStyleItemMasterByIdQuery();

  const [addData] = useAddStyleItemMasterMutation();
  const [updateData] = useUpdateStyleItemMasterMutation();
  const [removeData] = useDeleteStyleItemMasterMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || defaultName || "");
      setActive(id ? (data?.active ?? false) : true);
      setAliasName(data?.aliasName || defaultName || "");
      setHsnId(data?.hsnId ? data?.hsnId : "");
      setItemGroupId(data?.itemGroupId ? data?.itemGroupId : "");
      setUomId(data?.uomId ? data?.uomId : "");
      setSizeTemplateId(data?.sizeTemplateId ? data?.sizeTemplateId : "");
      setGsmId(data?.gsmId ? data?.gsmId : "");
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
    aliasName,
    hsnId,
    itemGroupId,
    sizeTemplateId,
    uomId,
    gsmId,
  };

  const validateData = (data) => {
    if (data.name && data.itemGroupId && data?.uomId && data?.hsnId) {
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
        onSuccess(returnData?.data.id);
        return;
      }
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        countryNameRef?.current?.focus();
      } else {
        setForm(false);
      }
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        // draggable: true,
        // timer: 1000,
        // showConfirmButton: false,
        // didOpen: () => {
        //   Swal.showLoading();
        // },
      });
      syncFormWithDb(undefined);

      dispatchInvalidate();
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
        text: "The Item Name already exists.",
        icon: "warning",
        timer: 1500,
        didClose: () => {
          countryNameRef?.current?.focus();
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
          countryNameRef?.current?.focus();
        },
      });
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure save the details ...?")) {
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
              title: deldata?.message || "Data cannot be deleted!",
            });
            return;
          }
          setId("");
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
            timer: 1000,
          });
          syncFormWithDb(undefined);

          setForm(false);
          dispatchInvalidate();
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
      header: "Item Name",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900  w-[400px]  py-1  px-2",
      search: "Item Name",
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

  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1  gap-3  h-full">
        <div className="lg:col-span- space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <fieldset className=" rounded mt-2">
              <div className="w-full grid grid-cols-3 gap-3">
                <div className="mb-3">
                  <TextInputNew1
                    ref={countryNameRef}
                    name="Item Name"
                    type="text"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                </div>
                <div className="mb-3">
                  <TextInputNew1
                    name="Alias Name"
                    type="text"
                    value={aliasName}
                    setValue={setAliasName}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                </div>
                <div className="mb-3">
                  {/* <DropdownInput
                            name="Item Group"
                            options={dropDownListObject(
                              id
                                ? itemGroupList?.data
                                : itemGroupList?.data?.filter(
                                    (item) => item.active,
                                  ),
                              "name",
                              "id",
                            )}
                            value={itemGroupId}
                            setValue={(value) => {
                              setItemGroupId(value);
                            }}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            clear={true}
                            required={true}
                          /> */}
                  <DropdownWithModal
                    name="Item Group"
                    options={dropDownListObject(
                      id
                        ? itemGroupList?.data
                        : itemGroupList?.data?.filter((item) => item?.active),
                      "name",
                      "id",
                    )}
                    value={itemGroupId}
                    setValue={setItemGroupId}
                    required={true}
                    readOnly={readOnly}
                    className={`w-[150px]`}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Item Group"
                    childComponent={ItemGroup}
                    addNewModalWidth="w-[40%] h-[45%]"
                  />
                </div>
                <div className="mb-3">
                  <DropdownWithModal
                    name="Hsn"
                    options={dropDownListObject(
                      id
                        ? hsnList?.data
                        : hsnList?.data?.filter((item) => item?.active),
                      "name",
                      "id",
                    )}
                    value={hsnId}
                    setValue={setHsnId}
                    readOnly={readOnly}
                    className={`w-[150px]`}
                    disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Hsn"
                    childComponent={HsnMaster}
                    addNewModalWidth="w-[40%] h-[50%]"
                    required={true}
                  />
                </div>
                <div className="mb-3">
                  {/* <DropdownInput
                            name="UOM"
                            options={dropDownListObject(
                              id
                                ? uomList?.data
                                : uomList?.data?.filter((item) => item.active),
                              "name",
                              "id",
                            )}
                            value={uomId}
                            setValue={(value) => {
                              setUomId(value);
                            }}
                            required={true}
                            disabled={childRecord.current > 0}
                            readOnly={readOnly}
                          /> */}
                  <DropdownWithModal
                    name="Uom"
                    options={dropDownListObject(
                      id
                        ? uomList?.data
                        : uomList?.data?.filter((item) => item?.active),
                      "name",
                      "id",
                    )}
                    value={uomId}
                    setValue={setUomId}
                    required={true}
                    readOnly={readOnly}
                    className={`w-[150px]`}
                    disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Uom"
                    childComponent={UomMaster}
                    addNewModalWidth="w-[40%] h-[45%]"
                  />
                </div>
                <div className="mb-3">
                  <DropdownWithModal
                    name="Size Template"
                    options={dropDownListObject(
                      id
                        ? sizeTemplateList?.data
                        : sizeTemplateList?.data?.filter(
                            (item) => item?.active,
                          ),
                      "name",
                      "id",
                    )}
                    value={sizeTemplateId}
                    setValue={setSizeTemplateId}
                    readOnly={readOnly}
                    className={`w-[150px]`}
                    disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Size Template"
                    childComponent={SizeTemplate}
                    addNewModalWidth="w-[40%] h-[62%]"
                  />
                </div>
                <div className="mb-3">
                  <DropdownWithModal
                    name="GSM"
                    options={dropDownListObject(
                      id
                        ? gsmList?.data
                        : gsmList?.data?.filter((item) => item?.active),
                      "name",
                      "id",
                    )}
                    value={gsmId}
                    setValue={setGsmId}
                    readOnly={readOnly}
                    className={`w-[150px]`}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Gsm"
                    childComponent={Gsm}
                    addNewModalWidth="w-[40%] h-[50%]"
                  />
                </div>
                <div className="mb-5">
                  <ToggleButton
                    name="Status"
                    options={statusDropdown}
                    value={active}
                    setActive={setActive}
                    required={true}
                    readOnly={readOnly}
                    ref={toggleButtonRef}
                    onKeyDown={handlers.handleToggleKeyDown}
                    tabIndex={0}
                  />
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Add New Style Item
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
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Item Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Item
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
          widthClass={"w-[800px] max-w-6xl h-[400px]"}
          onClose={() => {
            setForm(false);
            syncFormWithDb(undefined);
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mt-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Item"
                      : "Item Master"
                    : "Add New Item"}
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
