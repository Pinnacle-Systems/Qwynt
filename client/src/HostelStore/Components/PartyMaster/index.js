import React, { useEffect, useState, useRef, useCallback } from "react";

import secureLocalStorage from "react-secure-storage";
import {
  useGetPartyQuery,
  useGetPartyByIdQuery,
  useAddPartyMutation,
  useUpdatePartyMutation,
  useDeletePartyMutation,
  useLazyGetPartyByIdQuery,
} from "../../../redux/services/PartyMasterService";

import { useGetCityQuery } from "../../../redux/services/CityMasterService";

import { toast } from "react-toastify";
import {
  TextInput,
  DropdownInput,
  CheckBox,
  RadioButton,
  TextArea,
  DateInput,
  MultiSelectDropdown,
  ReusableTable,
  TextInputNew,
  DropdownInputNew,
  ToggleButton,
  TextAreaNew,
  TextInputNew1,
} from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import {
  dropDownListObject,
  dropDownListMergedObject,
  multiSelectOption,
} from "../../../Utils/contructObject";
import moment from "moment";
import Modal from "../../../UiComponents/Modal";

import { CityMaster, Loader } from "../../../Basic/components";
import { useDispatch, useSelector } from "react-redux";
import { findFromList, renameFile } from "../../../Utils/helper";
import { Check, LayoutGrid, Paperclip, Plus, Power, Table } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import ArtDesignReport from "./ArtDesignReport";
import Swal from "sweetalert2";
import { getImageUrlPath } from "../../../Constants";
import { push } from "../../../redux/features/opentabs";
import AddBranch from "./AddBranch";
import { useGetbranchTypeQuery } from "../../../redux/services/BranchTypeMaster";
import { useGetPartyBranchByIdQuery } from "../../../redux/services/PartyBranchMasterService";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { BranchTypeMaster } from "..";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";

export default function Form({
  partyId,
  onCloseForm,
  childId,
  onSuccess,
  onClose,
  editId,
  deleteId,
  deleteLabel,
} = {}) {
  const [form, setForm] = useState(false);
  const [aadharNo, setAadharNo] = useState("");
  const [errors, setErrors] = useState({});

  const [readOnly, setReadOnly] = useState(false);

  const [id, setId] = useState(editId || deleteId || "");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [cstNo, setCstNo] = useState("");
  const [cinNo, setCinNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [website, setWebsite] = useState("");
  const [code, setCode] = useState("");
  const [soa, setSoa] = useState("");
  const [coa, setCoa] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [cstDate, setCstDate] = useState("");
  const [email, setEmail] = useState("");
  const [isSupplier, setIsSupplier] = useState(false);
  const [isCustomer, setIsCustomer] = useState(true);
  const [isBranch, setIsBranch] = useState(false);

  const [active, setActive] = useState(true);
  const [view, setView] = useState("all");
  const [isClient, setClient] = useState();
  const [partyCode, setPartyCode] = useState("");
  const [landMark, setlandMark] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [parentId, setParentId] = useState("");

  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alterContactNumber, setAlterContactNumber] = useState("");
  const [bankname, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [formReport, setFormReport] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [reportName, setReportName] = useState("Customer/Supplier Name");
  const [searchValue, setSearchValue] = useState("");
  const [msmeNo, setMsmeNo] = useState("");
  const [companyAlterNumber, setCompanyAlterNumber] = useState("");
  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchForm, setBranchForm] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [branchTypeId, setBranchTypeId] = useState("");

  const childRecord = useRef(0);
  const dispatch = useDispatch();

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  );

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  );
  const params = {
    companyId,
    // isParent: true
  };
  const {
    data: cityList,
    isLoading: cityLoading,
    isFetching: cityFetching,
  } = useGetCityQuery({ params });
  const { data: branchTypeData } = useGetbranchTypeQuery({});

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPartyQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });
  const [trigger, { data: LazyData }] = useLazyGetPartyByIdQuery();

  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();
  const [dispatchInvalidate] = useInvalidateTags();
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setPanNo(data?.panNo ? data?.panNo : "");
      setName(data?.name ? data?.name : "");

      setAliasName(data?.aliasName ? data?.aliasName : "");

      setDisplayName(data?.displayName ? data?.displayName : "");
      setAddress(data?.address ? data?.address : "");
      setTinNo(data?.tinNo ? data?.tinNo : "");
      setCstNo(data?.cstNo ? data?.cstNo : "");
      setCinNo(data?.cinNo ? data?.cinNo : "");
      setFaxNo(data?.faxNo ? data?.faxNo : "");
      setCinNo(data?.cinNo ? data?.cinNo : "");
      setCoa(data?.coa ? data?.coa : "");
      setSoa(data?.soa ? data?.soa : "");
      setAadharNo(data?.aadharNo || "");

      setContactPersonName(
        data?.contactPersonName ? data?.contactPersonName : "",
      );
      setGstNo(data?.gstNo ? data?.gstNo : "");
      setCostCode(data?.costCode ? data?.costCode : "");
      setCstDate(
        data?.cstDate ? moment.utc(data?.cstDate).format("YYYY-MM-DD") : "",
      );
      setCode(data?.code ? data?.code : "");
      setPincode(data?.pincode ? data?.pincode : "");
      setWebsite(data?.website ? data?.website : "");
      setEmail(data?.email ? data?.email : "");
      setCity(data?.cityId ? data?.cityId : "");
      setIsSupplier(data?.isSupplier ? data.isSupplier : false);
      setIsCustomer(id ? (data?.isCustomer ? data.isCustomer : false) : true);
      setActive(id ? (data?.active ? data.active : false) : true);
      setContactMobile(data?.contactMobile ? data.contactMobile : "");
      setlandMark(data?.landMark ? data?.landMark : "");
      setContact(data?.contact ? data?.contact : "");
      setDesignation(data?.designation ? data?.designation : "");
      setDepartment(data?.department ? data?.department : "");
      setContactPersonEmail(
        data?.contactPersonEmail ? data?.contactPersonEmail : "",
      );
      setContactNumber(data?.contactNumber ? data?.contactNumber : "");
      setAlterContactNumber(
        data?.alterContactNumber ? data?.alterContactNumber : "",
      );
      setBankName(data?.bankname ? data?.bankname : "");
      setBankBranchName(data?.bankBranchName ? data?.bankBranchName : "");
      setAccountNumber(data?.accountNumber ? data?.accountNumber : "");
      setIfscCode(data?.ifscCode ? data?.ifscCode : "");
      setAttachments(data?.attachments ? data?.attachments : []);
      setMsmeNo(data?.msmeNo ? data?.msmeNo : "");
      setCompanyAlterNumber(
        data?.companyAlterNumber ? data?.companyAlterNumber : "",
      );
      setPartyCode(data?.partyCode ? data?.partyCode : "");
      setIsBranch(data?.isBranch ? data?.isBranch : false);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;

      setParentId(data?.parentId ? data?.parentId : "");
      setBranchTypeId(data?.branchTypeId ? data?.branchTypeId : "");
      setIsBranch(data?.isBranch ? data?.isBranch : "");
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const {
    data: singleBranchData,
    isFetching: singleBranchFetching,
    isLoading: singleBranchLoading,
  } = useGetPartyBranchByIdQuery(parentId, {
    skip: id,
  });

  const syncFormWithDbNew = useCallback(
    (data) => {
      if (!parentId) return;

      setPanNo(data?.panNo ? data?.panNo : "");
      // setAliasName(data?.aliasName ? data?.aliasName : "");
      // setlandMark(data?.landMark ? data?.landMark : '')
      // setCity(data?.cityId ? data?.cityId : "");
      // setPincode(data?.pincode ? data?.pincode : "");

      setDisplayName(data?.displayName ? data?.displayName : "");
      setTinNo(data?.tinNo ? data?.tinNo : "");
      setCstNo(data?.cstNo ? data?.cstNo : "");
      setCinNo(data?.cinNo ? data?.cinNo : "");
      setFaxNo(data?.faxNo ? data?.faxNo : "");
      setCinNo(data?.cinNo ? data?.cinNo : "");
      setCoa(data?.coa ? data?.coa : "");
      setSoa(data?.soa ? data?.soa : "");

      // setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "");
      setGstNo(data?.gstNo ? data?.gstNo : "");
      setCostCode(data?.costCode ? data?.costCode : "");
      setCstDate(
        data?.cstDate ? moment.utc(data?.cstDate).format("YYYY-MM-DD") : "",
      );
      setCode(data?.code ? data?.code : "");
      setWebsite(data?.website ? data?.website : "");
      setEmail(data?.email ? data?.email : "");
      setIsSupplier(data?.isSupplier ? data.isSupplier : false);
      setIsCustomer(data?.isCustomer ? data.isCustomer : false);
      // setActive(id ? (data?.active ? data.active : false) : true);
      setContactMobile(data?.contactMobile ? data.contactMobile : "");
      setContact(data?.contact ? data?.contact : "");
      // setDesignation(data?.designation ? data?.designation : "")
      // setDepartment(data?.department ? data?.department : "")
      // setContactPersonEmail(data?.contactPersonEmail ? data?.contactPersonEmail : "")
      // setContactNumber(data?.contactNumber ? data?.contactNumber : "")
      // setAlterContactNumber(data?.alterContactNumber ? data?.alterContactNumber : "")
      setBankName(data?.bankname ? data?.bankname : "");
      setBankBranchName(data?.bankBranchName ? data?.bankBranchName : "");
      setAccountNumber(data?.accountNumber ? data?.accountNumber : "");
      setIfscCode(data?.ifscCode ? data?.ifscCode : "");
      setAttachments(data?.attachments ? data?.attachments : []);
      setMsmeNo(data?.msmeNo ? data?.msmeNo : "");
      setCompanyAlterNumber(
        data?.companyAlterNumber ? data?.companyAlterNumber : "",
      );
      setPartyCode(data?.partyCode ? data?.partyCode : "");
      // setParentId(data?.parentId ? data?.parentId : "")
      // childRecord.current = data?.childRecord ? data?.childRecord : 0;
      setAadharNo(data?.aadharNo ? data?.aadharNo : "");
    },
    [parentId],
  );

  useEffect(() => {
    syncFormWithDbNew(singleBranchData?.data);
  }, [
    singleBranchFetching,
    singleBranchLoading,
    parentId,
    syncFormWithDbNew,
    singleBranchData,
  ]);

  const data = {
    name,
    isSupplier,
    isCustomer,
    code,
    aliasName,
    displayName,
    address,
    cityId: city,
    pincode,
    panNo,
    tinNo,
    cstNo,
    cstDate,
    cinNo,
    faxNo,
    email,
    website,
    contactPersonName,
    gstNo,
    costCode,
    contactMobile,
    active,
    companyId,
    coa: coa ? coa : "",
    soa,
    id,
    userId,
    landMark,
    contact,
    designation,
    department,
    contactPersonEmail,
    contactNumber,
    alterContactNumber,
    bankname,
    bankBranchName,
    accountNumber,
    ifscCode,
    attachments: attachments?.filter((i) => i.filePath),
    msmeNo,
    companyAlterNumber,
    partyCode,
    parentId,
    isBranch,
    branchTypeId,
    aadharNo,
    city,
  };

  const validateData = (data) => {
    let newErrors = {};

    if (!data.name) newErrors.name = "Name is required";
    if (!data.partyCode) newErrors.partyCode = "Party Code is required";
    if (data.active === undefined || data.active === null)
      newErrors.active = "Active Status is required";
    if (!data.address) newErrors.address = "Address is required";
    if (!data.city) newErrors.city = "City is required";
    if (!data.pincode) newErrors.pincode = "Pincode is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const showAlert = (message, type = "error") => {
    Swal.fire({
      title: message,
      icon: type,
      confirmButtonColor: "#3085d6",
    });
  };

  const aadharRegex = /^[0-9]{12}$/; // 12 digits
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // ABCDE1234F
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/; // 6 digit pincode, not starting with 0
    return pincodeRegex.test(pincode);
  };

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key == "attachments") {
          console.log("attachments =>", data[key]);
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              })),
            ),
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("images", option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      dispatchInvalidate();

      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        countryNameRef?.current?.focus();
      } else {
        if (partyId) {
          onCloseForm();
        }
        setForm(false);
        syncFormWithDb(undefined);
      }

      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
    } catch (error) {
      console.log("handle");
    }
  };
  const today = new Date();

  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  function deleteRow(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function openPreview(filePath) {
    window.open(
      filePath instanceof File
        ? URL.createObjectURL(filePath)
        : getImageUrlPath(filePath),
    );
  }

  useEffect(() => {
    if (attachments?.length >= 1) return;
    setAttachments((prev) => {
      let newArray = Array.from({ length: 1 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" };
      });
      return [...prev, ...newArray];
    });
  }, [setAttachments, attachments]);

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);
  const alphaNum12 = /^[A-Z0-9]{15}$/;

  const saveData = (nextProcess) => {
    // Branch validations
    if (isBranch && !parentId) {
      return showAlert("Choose Parent Customer/Supplier", "warning");
    }

    if (isBranch && !branchTypeId) {
      return showAlert("Choose Branch Type", "warning");
    }

    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => countryNameRef.current?.focus(),
      });
      return;
    }

    // Pincode
    // if (data.pincode && !validatePincode(data.pincode)) {
    //   return showAlert("Enter valid 6-digit pincode");
    // }

    // Aadhar
    if (data.aadharNo && !aadharRegex.test(data.aadharNo)) {
      return showAlert("Aadhar must be 12 digits");
    }

    // PAN
    if (data.panNo && !panRegex.test(data.panNo.toUpperCase())) {
      return showAlert("Invalid PAN (ABCDE1234F)");
    }

    // GST
    if (data.gstNo && !gstRegex.test(data.gstNo.toUpperCase())) {
      return showAlert("Invalid GST format");
    }

    // Customer/Supplier check
    if (!isCustomer && !isSupplier) {
      return showAlert("Select Customer or Supplier");
    }

    // Duplicate check
    let foundItem;

    if (isBranch) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some(
          (item) =>
            item.branchTypeId == branchTypeId && item.parentId == parentId,
        );
    } else {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item.name == name && item.gstNo == gstNo);
    }

    if (foundItem) {
      return showAlert(
        isBranch
          ? "Branch already exists"
          : `${isSupplier ? "Supplier" : "Customer"} already exists`,
        "warning",
      );
    }

    // Confirm update
    if (id && !window.confirm("Are you sure update the details...?")) {
      return;
    }

    // Submit
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
      if (!window.confirm("Are you sure to delete.   ..?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "Child Record Exists",
          text: "Data cannot be deleted!",
        });
      } else {
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
          dispatchInvalidate();

          syncFormWithDb(undefined);
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
          });
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
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setId("");
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["Name", "Alias Name"];
  const tableDataNames = ["dataObj.name", "dataObj.aliasName"];

  // if (!form)
  //     return (
  //         <ReportTemplate
  //             heading={MODEL}
  //             tableHeaders={tableHeaders}
  //             tableDataNames={tableDataNames}
  //             loading={
  //                 isLoading || isFetching
  //             }
  //             setForm={setForm}
  //             data={allData?.data}
  //             onClick={onDataClick}
  //             onNew={onNew}
  //             searchValue={searchValue}
  //             setSearchValue={setSearchValue}
  //         />
  //     );
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

  // useEffect(() => {
  //     if (!partyId) return
  //     if (partyId == "new") {
  //         onNew()
  //     }
  //     else {
  //         setId(partyId);
  //     }
  //     // if (childId) {
  //     //     branchModelOpen(true)
  //     //     setBranchId(childId)
  //     // }
  //     // if (openModelForAddress) {
  //     //   setIsAddressExpanded(true);
  //     // }
  // }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    if (partyId === "new") {
      onNew();
      return;
    } else if (!childId) {
      setId(partyId);
      setForm(true);
    }

    // // existing party
    // setId(partyId);
    // setForm(true);

    // open branch modal if childId exists
    if (childId) {
      setBranchModelOpen(true);
      setBranchForm(false);
      setBranchId(childId);
    }
  }, [partyId, childId]);

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },
    {
      header: "Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-96",
    },
    {
      header: "Branch Type",
      accessor: (item) => item?.BranchType?.name || "-",
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-40 pl-2",
    },
    {
      header: "Customer/Supplier",
      accessor: (item) =>
        item.isCustomer && item.isSupplier
          ? "Customer/Supplier"
          : item.isCustomer
            ? "Customer"
            : item.isSupplier
              ? "Supplier"
              : "",
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-40",
    },
    {
      header: "Address",
      accessor: (item) => item.address,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-96",
    },
    // {
    //   header: "Category",
    //   accessor: (item, index) => (item?.isCustomer ? "Customer" : "Supplier"),
    //   className: "font-medium text-gray-900 w-18 uppercase text-left pl-2",
    // },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const handleChange = (type) => {
    setIsSupplier(type == "supplier");
    setIsCustomer(type == "client");
  };

  if (!cityList || cityFetching || cityLoading) {
    return <Loader />;
  }

  let filterParty;

  if (view == "Customer") {
    filterParty = allData?.data?.filter((item) => item.isCustomer);
  }
  if (view === "Supplier") {
    filterParty = allData?.data?.filter((item) => item.isSupplier);
  }
  if (view == "all") {
    filterParty = allData?.data;
  }
  //   const { data: currencyList } = useGetCurrencyMasterQuery({ params });

  const errorClass = (field) =>
    errors[field] ? "border-red-500 bg-red-50" : "";

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (partyId) {
    return (
      <>
        <div className="h-full flex flex-col bg-gray-200 ">
          <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-md font-semibold text-gray-800">
                {id
                  ? !readOnly
                    ? "Edit Customer/Supplier"
                    : "Customer/Supplier Master"
                  : "Add New Customer/Supplier"}
              </h2>
            </div>

            <div className="flex gap-2">
              <div className="flex gap-2">
                {/* <div className="  ">
                                    <button
                                        onClick={() => {
                                            if (id) {
                                                setBranchModelOpen(true)
                                                setBranchForm(false)
                                            }

                                            else {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: `Save the ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                                                    showConfirmButton: false,
                                                });
                                            }

                                        }}
                                        readOnly={readOnly}
                                        className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Add Branch
                                    </button>
                                </div> */}
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
                    >
                      <Check size={14} />
                      {"Save & New"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-4 space-y-3 ">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-row items-center gap-4 col-span-2 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isCustomer}
                          onChange={(e) => setIsCustomer(e.target.checked)}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Customer
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSupplier}
                          onChange={(e) => setIsSupplier(e.target.checked)}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Supplier
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isBranch}
                          onChange={(e) => {
                            if (parentId || branchTypeId) {
                              setParentId("");
                              setBranchTypeId("");
                            }
                            setIsBranch(e.target.checked);
                          }}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Is Branch
                        </label>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <DropdownInputNew
                        name="Customer/supplier"
                        options={dropDownListObject(
                          id
                            ? allData?.data?.filter(
                                (i) => i.id != id && !i.parentId && i.gstNo,
                              )
                            : allData?.data?.filter(
                                (item) =>
                                  item.active &&
                                  item.id != id &&
                                  !item.parentId &&
                                  item.gstNo,
                              ),
                          "name",
                          "id",
                        )}
                        value={parentId}
                        setValue={(value) => {
                          setParentId(value);
                          setName(findFromList(value, allData?.data, "name"));
                        }}
                        // setValue={setParentId}
                        readOnly={readOnly}
                        required={true}
                        disabled={childRecord.current > 0 || !isBranch}
                      />
                    </div>
                    <div className="col-span-2">
                      <DropdownInputNew
                        name="Branch Type"
                        options={dropDownListObject(
                          id
                            ? branchTypeData?.data
                            : branchTypeData?.data?.filter(
                                (item) => item.active,
                              ),
                          "name",
                          "id" || [],
                        )}
                        value={branchTypeId}
                        openOnFocus={true}
                        setValue={(value) => {
                          setBranchTypeId(value);
                        }}
                        required={true}
                        readOnly={readOnly}
                        disabled={
                          childRecord.current > 0 || !isBranch || !parentId
                        }
                      />
                    </div>
                    {!isBranch && (
                      <div className="col-span-2">
                        <TextInputNew1
                          name={"name"}
                          type="text"
                          value={name}
                          inputClass="h-8"
                          ref={countryNameRef}
                          setValue={setName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onBlur={(e) => {
                            if (aliasName) return;
                            setAliasName(e.target.value);
                          }}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    )}

                    {isBranch && (
                      <div className="col-span-2">
                        <TextAreaNew
                          name="Branch Name"
                          inputClass="h-10"
                          value={name}
                          setValue={setName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                    )}
                    {/* <div className="col-span-2">
                                                    <TextInputNew1
                                                        name="Alias Name"
                                                        type="text"
                                                        inputClass="h-8"
                                                        value={aliasName}
                                                        setValue={setAliasName}
                                                        readOnly={readOnly}
                                                        disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div> */}
                    <div className="col-span-1">
                      <TextInputNew1
                        name="Code"
                        type="text"
                        value={partyCode}
                        setValue={setPartyCode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                    </div>

                    <div className=" ml-2">
                      <ToggleButton
                        name="Status"
                        options={statusDropdown}
                        value={active}
                        setActive={setActive}
                        required={true}
                        readOnly={readOnly}
                        className="bg-gray-100 p-1 rounded-lg"
                        activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                        inactiveClass="text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-3 ">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Address Details
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <TextAreaNew
                          name="Address"
                          inputClass="h-10"
                          value={address}
                          setValue={setAddress}
                          required={true}
                          readOnly={readOnly}
                          d
                          isabled={childRecord.current > 0}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-5">
                            <TextInputNew1
                              name="Land Mark"
                              type="text"
                              value={landMark}
                              setValue={setlandMark}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className=" grid grid-cols-5 gap-3">
                          <div className="col-span-4"></div>
                          <TextInputNew1
                            name="Pincode"
                            type="number"
                            value={pincode}
                            required={true}
                            setValue={setPincode}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Contact Details
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="">
                        <TextInputNew1
                          name="Contact Person Name"
                          type="text"
                          value={contactPersonName}
                          setValue={setContactPersonName}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>

                      <TextInputNew1
                        name="Designation"
                        type="text"
                        value={designation}
                        setValue={setDesignation}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <TextInputNew1
                        name="Department"
                        type="text"
                        value={department}
                        setValue={setDepartment}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <div className="col-span-1">
                        <TextInputNew
                          name="Email"
                          type="text"
                          value={contactPersonEmail}
                          setValue={setContactPersonEmail}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                      <div className="col-span-2">
                        <TextInputNew
                          name="Contact Number"
                          value={contactNumber}
                          setValue={setContactNumber}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Business Details
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <TextInputNew
                        name="Pan No"
                        type="pan_no"
                        value={panNo}
                        setValue={setPanNo}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                      <TextInputNew
                        name="GST No"
                        type="text"
                        value={gstNo}
                        setValue={setGstNo}
                        readOnly={readOnly}
                        required={true}
                        disabled={parentId || isBranch}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                      <TextInputNew
                        name="MSME CERTFICATE  No"
                        type="text"
                        value={msmeNo}
                        setValue={setMsmeNo}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                      <TextInputNew
                        name="CIN No"
                        type="text"
                        value={cinNo}
                        setValue={setCinNo}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Bank Details
                  </h3>
                  <div className="space-y-2">
                    <TextInputNew1
                      name="Bank Name"
                      type="text"
                      value={bankname}
                      setValue={setBankName}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      className="focus:ring-2 focus:ring-blue-100 w-10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <TextInputNew1
                          name="Branch Name"
                          type="text"
                          value={bankBranchName}
                          setValue={setBankBranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>

                      <TextInputNew
                        name="Account Number"
                        type="text"
                        value={accountNumber}
                        setValue={setAccountNumber}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <TextInputNew
                        name="IFSC CODE"
                        type="text"
                        value={ifscCode}
                        setValue={setIfscCode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Attachments
                  </h3>

                  <div className="max-h-[200px] overflow-auto">
                    <div className="grid grid-cols-1 gap-3  border-collapse bg-[#F1F1F0]   shadow-sm overflow-auto">
                      <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                        <thead className=" py-2  font-medium  top-o sticky">
                          <tr>
                            <th className="py-2  text-xs  w-10 text-center border-r border-white/50">
                              S.No
                            </th>
                            {/* <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th> */}
                            {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                            <th className="py-2  text-xs w-60 center border-white/50">
                              {" "}
                              Name
                            </th>
                            <th className="py-2  text-xs center w-60 border-r border-white/50">
                              File
                            </th>
                            <th className="py-2  text-xs  w-10 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {attachments?.map((item, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              }`}
                            >
                              <td className="border-r border-white/50 center h-8 text-center ">
                                {index + 1}
                              </td>

                              <td className=" border-r border-white/50' h-8 ">
                                <input
                                  type="text"
                                  className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                                  value={item?.name}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.value,
                                      index,
                                      "name",
                                    )
                                  }
                                />
                              </td>
                              <td className="border-r border-white/50 h-8">
                                <div className="flex items-center gap-2">
                                  {/* Hidden File Input */}
                                  {!readOnly && !item.filePath && (
                                    <>
                                      <input
                                        type="file"
                                        id={`file-upload-${index}`}
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            handleInputChange(
                                              renameFile(e.target.files[0]),
                                              index,
                                              "filePath",
                                            );
                                          }
                                        }}
                                      />

                                      {/* Attach Icon */}
                                      <label
                                        htmlFor={`file-upload-${index}`}
                                        className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                        title="Attach file"
                                      >
                                        📎
                                      </label>
                                    </>
                                  )}

                                  {/* Show File + Actions */}
                                  {item.filePath && (
                                    <>
                                      <span className="truncate max-w-[120px]">
                                        {item.filePath?.name ?? item.filePath}
                                      </span>

                                      <button
                                        onClick={() =>
                                          openPreview(item.filePath)
                                        }
                                        className="text-blue-600 text-xs hover:underline"
                                      >
                                        View
                                      </button>

                                      {!readOnly && (
                                        <button
                                          onClick={() =>
                                            handleInputChange(
                                              "",
                                              index,
                                              "filePath",
                                            )
                                          }
                                          className="text-red-600 text-xs"
                                          title="Remove file"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>

                              <td className="w-[30px] border-gray-200 h-8">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Add Button */}
                                  <button
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addNewComments();
                                      }
                                    }}
                                    onClick={addNewComments}
                                    className="flex items-center px-1 bg-blue-50 rounded"
                                  >
                                    <Plus size={18} className="text-blue-800" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    className="flex items-center px-1 bg-red-50 rounded"
                                    onClick={() => deleteRow(index)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-red-800"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={branchModelOpen}
          form={form}
          widthClass={"w-[90%] h-[89%]"}
          setBranchModelOpen={setBranchModelOpen}
          onClose={() => {
            setBranchModelOpen(false);
          }}
        >
          <AddBranch
            cityList={cityList}
            setReadOnly={setReadOnly}
            partyId={partyId}
            branchForm={branchForm}
            setBranchForm={setBranchForm}
            branchTypeData={branchTypeData}
            companyId={companyId}
            readOnly={readOnly}
            isCustomer={isCustomer}
            isSupplier={isSupplier}
            branchId={branchId}
            setBranchId={setBranchId}
          />
        </Modal>
      </>
    );
  }

  const formBody = (
    <div className="flex-1 p-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 space-y-3 ">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-row items-center gap-4 col-span-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCustomer}
                    onChange={(e) => setIsCustomer(e.target.checked)}
                    disabled={readOnly}
                  />
                  <label className="block text-xs font-bold text-gray-600">
                    Customer
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSupplier}
                    onChange={(e) => setIsSupplier(e.target.checked)}
                    disabled={readOnly}
                  />
                  <label className="block text-xs font-bold text-gray-600">
                    Supplier
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isBranch}
                    onChange={(e) => {
                      if (parentId || branchTypeId) {
                        setParentId("");
                        setBranchTypeId("");
                        setName("");
                        setPartyCode("");
                        setPanNo("");
                        setAadharNo("");
                        setGstNo("");
                        setMsmeNo("");
                        setCinNo("");
                      }
                      setIsBranch(e.target.checked);
                    }}
                    disabled={readOnly}
                  />
                  <label className="block text-xs font-bold text-gray-600">
                    Add Branch
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <DropdownInputNew
                  name="Customer/supplier"
                  options={dropDownListObject(
                    id
                      ? allData?.data?.filter(
                          (i) => i.id != id && !i.parentId && i.gstNo,
                        )
                      : allData?.data?.filter(
                          (item) =>
                            item.active &&
                            item.id != id &&
                            !item.parentId &&
                            item.gstNo,
                        ),
                    "name",
                    "id",
                  )}
                  value={parentId}
                  setValue={(value) => {
                    setParentId(value);
                    setName(findFromList(value, allData?.data, "name"));
                  }}
                  // setValue={setParentId}
                  readOnly={readOnly}
                  required={true}
                  disabled={childRecord.current > 0 || !isBranch}
                />
              </div>
              <div className="col-span-2">
                {/* <DropdownInputNew
                            name="Branch Type"
                            options={dropDownListObject(
                              id
                                ? branchTypeData?.data
                                : branchTypeData?.data?.filter(
                                    (item) => item.active,
                                  ),
                              "name",
                              "id" || [],
                            )}
                            value={branchTypeId}
                            openOnFocus={true}
                            setValue={(value) => {
                              setBranchTypeId(value);
                            }}
                            required={true}
                            readOnly={readOnly}
                            disabled={
                              childRecord.current > 0 || !isBranch || !parentId
                            }
                          /> */}
                <DropdownWithModal
                  name="Branch Type"
                  options={dropDownListObject(
                    id
                      ? branchTypeData?.data
                      : branchTypeData?.data?.filter((item) => item.active),
                    "name",
                    "id",
                  )}
                  value={branchTypeId}
                  setValue={(value) => {
                    setBranchTypeId(value);
                  }}
                  required={true}
                  readOnly={readOnly}
                  disabled={childRecord.current > 0 || !isBranch || !parentId}
                  addNewLabel="+ Add New Branch Type"
                  childComponent={BranchTypeMaster}
                  addNewModalWidth="w-[40%] h-[45%]"
                />
              </div>
              {!isBranch && (
                <div className="col-span-2">
                  <TextInputNew1
                    name={`${isSupplier ? "Supplier Name" : "Customer Name"}`}
                    type="text"
                    value={name}
                    inputClass="h-8"
                    ref={countryNameRef}
                    setValue={(val) => {
                      setName(val);
                      clearError("name");
                    }}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    onBlur={(e) => {
                      if (aliasName) return;
                      setAliasName(e.target.value);
                    }}
                    className={`focus:ring-2 focus:ring-blue-100 ${errorClass("name")}`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs ml-1">
                      {errors.name}
                    </span>
                  )}
                </div>
              )}

              {isBranch && (
                <div className="col-span-2">
                  <TextInputNew1
                    name="Branch Name"
                    inputClass="h-10"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                </div>
              )}
              {/* <div className="col-span-2">
                                                    <TextInputNew1
                                                        name="Alias Name"
                                                        type="text"
                                                        inputClass="h-8"
                                                        value={aliasName}
                                                        setValue={setAliasName}
                                                        readOnly={readOnly}
                                                        disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div> */}
              <div className="col-span-1">
                <TextInputNew1
                  name="Code"
                  type="text"
                  value={partyCode}
                  required={true}
                  setValue={(val) => {
                    setPartyCode(val);
                    clearError("partyCode");
                  }}
                  readOnly={readOnly}
                  disabled={childRecord.current > 0}
                  className={`focus:ring-2 focus:ring-blue-100 ${errorClass("partyCode")}`}
                />
                {errors.partyCode && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors.partyCode}
                  </span>
                )}
              </div>

              <div className=" ml-2 mt-1">
                <ToggleButton
                  name="Status"
                  options={statusDropdown}
                  value={active}
                  setActive={setActive}
                  required={true}
                  readOnly={readOnly}
                  className="bg-gray-100 p-1 rounded-lg"
                  activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                  inactiveClass="text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-3 ">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Address Details
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <TextAreaNew
                    name="Address"
                    inputClass="h-10"
                    value={address}
                    setValue={(val) => {
                      setAddress(val);
                      clearError("address");
                    }}
                    required={true}
                    readOnly={readOnly}
                    d
                    isabled={childRecord.current > 0}
                    errorClass={errorClass("address")}
                  />
                  {errors.address && (
                    <span className="text-red-500 text-xs ml-1">
                      {errors.address}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-5">
                      <TextInputNew1
                        name="Land Mark"
                        type="text"
                        value={landMark}
                        setValue={setlandMark}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className=" grid grid-cols-5 gap-3">
                    <div className="col-span-5">
                      {/* <DropdownInputNew
                                  name="City/State Name"
                                  options={dropDownListMergedObject(
                                    id
                                      ? cityList?.data
                                      : cityList?.data?.filter(
                                          (item) => item.active,
                                        ),
                                    "name",
                                    "id",
                                  )}
                                  country={country}
                                  masterName="CITY MASTER"
                                  // lastTab={activeTab}
                                  value={city}
                                  setValue={setCity}
                                  required={true}
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                  className="focus:ring-2 focus:ring-blue-100"
                                /> */}
                      <DropdownWithModal
                        name="City/State Name"
                        options={dropDownListMergedObject(
                          id
                            ? cityList?.data
                            : cityList?.data?.filter((item) => item.active),
                          "name",
                          "id",
                        )}
                        country={country}
                        masterName="CITY MASTER"
                        required={true}
                        // lastTab={activeTab}
                        value={city}
                        setValue={(val) => {
                          setCity(val);
                          clearError("city");
                        }}
                        readOnly={readOnly}
                        className={`focus:ring-2 focus:ring-blue-100 ${errorClass("city")}`}
                        addNewLabel="+ Add New City"
                        childComponent={CityMaster}
                        addNewModalWidth="w-[50%] h-[55%]"
                      />
                      {errors.city && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.city}
                        </span>
                      )}
                    </div>

                    {/* {errors.pincode && (
                      <span className="text-red-500 text-xs ml-1">
                        {errors.pincode}
                      </span>
                    )} */}
                  </div>
                  <div className="w-[50%] mt-3">
                    <TextInputNew
                      name="Pincode/Zip Code"
                      type="pincode"
                      value={pincode}
                      required={true}
                      setValue={(val) => {
                        setPincode(val);
                        clearError("pincode");
                      }}
                      readOnly={readOnly}
                      // disabled={childRecord.current > 0}
                      className={`focus:ring-2 focus:ring-blue-100 w-10 ${errorClass("pincode")}`}
                    />
                  </div>
                </div>

                {/* <div className="">
                                                        <TextInputNew
                                                            name={"Contact Number"}
                                                            value={contact}

                                                            setValue={setContact}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <TextInputNew1
                                                            name={"Email"}
                                                            type="text"
                                                            value={email}

                                                            setValue={setEmail}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />

                                                    </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Contact Details
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <TextInputNew1
                    name="Contact Person Name"
                    type="text"
                    value={contactPersonName}
                    setValue={setContactPersonName}
                    readOnly={readOnly}
                    // disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100 w-10"
                  />
                </div>

                <TextInputNew1
                  name="Designation"
                  type="text"
                  value={designation}
                  setValue={setDesignation}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100 w-10"
                />
                <TextInputNew1
                  name="Department"
                  type="text"
                  value={department}
                  setValue={setDepartment}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100 w-10"
                />
                <div className="col-span-2">
                  <TextInput
                    name="Email"
                    type="normal"
                    value={contactPersonEmail}
                    setValue={setContactPersonEmail}
                    readOnly={readOnly}
                    // disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100 w-10"
                  />
                </div>
                <div className="col-span-2">
                  <TextInputNew
                    name="Contact Number"
                    value={contactNumber}
                    setValue={setContactNumber}
                    readOnly={readOnly}
                    // disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100 w-10"
                  />
                </div>
                {/* <div className='col-span-1'>
                                                        <TextInputNew
                                                            name="Alternative Contact Number"
                                                            type="number"
                                                            value={alterContactNumber}
                                                            setValue={setAlterContactNumber}

                                                            // readOnly={readOnly}
                                                            // disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Business Details
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* <DropdownInput
                                                    name="Currency"
                                                    options={dropDownListObject(
                                                        id
                                                            ? currencyList?.data ?? []
                                                            : currencyList?.data?.filter(
                                                                (item) => item.active
                                                            ) ?? [],
                                                        "name",
                                                        "id"
                                                    )}
                                                    // lastTab={activeTab}
                                                    masterName="CURRENCY MASTER"
                                                    value={currency}
                                                    setValue={setCurrency}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}

                {/* <DropdownInput
                                                    name="PayTerm"
                                                    options={dropDownListObject(
                                                        id
                                                            ? payTermList?.data
                                                            : payTermList?.data?.filter((item) => item.active),
                                                        "name",
                                                        "id"
                                                    )}
                                                    value={payTermDay}
                                                    setValue={setPayTermDay}
                                                    // required={true}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}
                <TextInputNew
                  name="Pan No"
                  type="pan_no"
                  value={panNo}
                  setValue={setPanNo}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100"
                />
                <TextInputNew
                  name="Aadhar No"
                  type="aadhar"
                  value={aadharNo}
                  setValue={setAadharNo}
                  readOnly={readOnly || parentId || isBranch}
                  disabled={parentId || isBranch}
                  className="focus:ring-2 focus:ring-blue-100"
                />
                <TextInputNew
                  name="GST No"
                  type="gst_no"
                  value={gstNo}
                  setValue={setGstNo}
                  readOnly={readOnly || parentId || isBranch}
                  // required={true}
                  disabled={parentId || isBranch}
                  className="focus:ring-2 focus:ring-blue-100"
                />
                <TextInputNew
                  name="MSME CERTFICATE  No"
                  type="text"
                  value={msmeNo}
                  setValue={setMsmeNo}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100"
                />
                <TextInputNew
                  name="CIN No"
                  type="text"
                  value={cinNo}
                  setValue={setCinNo}
                  readOnly={readOnly}
                  className="focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Bank Details
            </h3>
            <div className="space-y-2">
              <TextInputNew1
                name="Bank Name"
                type="text"
                value={bankname}
                setValue={setBankName}
                readOnly={readOnly}
                // disabled={childRecord.current > 0}
                className="focus:ring-2 focus:ring-blue-100 w-10"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <TextInputNew1
                    name="Branch Name"
                    type="text"
                    value={bankBranchName}
                    setValue={setBankBranchName}
                    readOnly={readOnly}
                    // disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100 w-10"
                  />
                </div>

                <TextInputNew
                  name="Account Number"
                  type="text"
                  value={accountNumber}
                  setValue={setAccountNumber}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100 w-10"
                />
                <TextInputNew
                  name="IFSC CODE"
                  type="text"
                  value={ifscCode}
                  setValue={setIfscCode}
                  readOnly={readOnly}
                  // disabled={childRecord.current > 0}
                  className="focus:ring-2 focus:ring-blue-100 w-10"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">
              Attachments
            </h3>

            <div className="max-h-[200px] overflow-auto">
              <div className="grid grid-cols-1 gap-3  border-collapse bg-[#F1F1F0]   shadow-sm overflow-auto">
                <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                  <thead className=" py-2  font-medium  top-o sticky">
                    <tr>
                      <th className="py-2  text-xs  w-10 text-center border-r border-white/50">
                        S.No
                      </th>
                      {/* <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th> */}
                      {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                      <th className="py-2  text-xs w-60 center border-white/50">
                        {" "}
                        Name
                      </th>
                      <th className="py-2  text-xs center w-60 border-r border-white/50">
                        File
                      </th>
                      <th className="py-2  text-xs  w-10 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attachments?.map((item, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                      >
                        <td className="border-r border-white/50 center h-8 text-center ">
                          {index + 1}
                        </td>

                        <td className=" border-r border-white/50' h-8 ">
                          <input
                            type="text"
                            className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                            value={item?.name}
                            onChange={(e) =>
                              handleInputChange(e.target.value, index, "name")
                            }
                          />
                        </td>
                        <td className="border-r border-white/50 h-8">
                          <div className="flex items-center gap-2">
                            {/* Hidden File Input */}
                            {!readOnly && !item.filePath && (
                              <>
                                <input
                                  type="file"
                                  id={`file-upload-${index}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleInputChange(
                                        renameFile(e.target.files[0]),
                                        index,
                                        "filePath",
                                      );
                                    }
                                  }}
                                />

                                {/* Attach Icon */}
                                <label
                                  htmlFor={`file-upload-${index}`}
                                  className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                  title="Attach file"
                                >
                                  📎
                                </label>
                              </>
                            )}

                            {/* Show File + Actions */}
                            {item.filePath && (
                              <>
                                <span className="truncate max-w-[120px]">
                                  {item.filePath?.name ?? item.filePath}
                                </span>

                                <button
                                  onClick={() => {
                                    if (item.filePath instanceof File) {
                                      window.open(
                                        URL.createObjectURL(item.filePath),
                                      );
                                    } else {
                                      window.open(
                                        getImageUrlPath(item.filePath),
                                      );
                                    }
                                  }}
                                  className="text-blue-600 text-xs hover:underline"
                                >
                                  View
                                </button>

                                {!readOnly && (
                                  <button
                                    onClick={() =>
                                      handleInputChange("", index, "filePath")
                                    }
                                    className="text-red-600 text-xs"
                                    title="Remove file"
                                  >
                                    ✕
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        <td className="w-[30px] border-gray-200 h-8">
                          <div className="flex items-center justify-center gap-1">
                            {/* Add Button */}
                            <button
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addNewComments();
                                }
                              }}
                              onClick={addNewComments}
                              className="flex items-center px-1 bg-blue-50 rounded"
                            >
                              <Plus size={18} className="text-blue-800" />
                            </button>

                            {/* Delete Button */}
                            <button
                              className="flex items-center px-1 bg-red-50 rounded"
                              onClick={() => deleteRow(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-800"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
        toast.success("Customer / Supplier deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(
          err?.data?.message || "Failed to delete Customer / Supplier",
        );
      }
    };

    return (
      <div className="min-h-[650px] flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center bg-white">
          <h2 className="text-lg font-semibold">Delete Customer / Supplier</h2>
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
                  . Remove them first before deleting this Customer / Supplier.
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
        className="h-full flex flex-col bg-gray-200 overflow-hidden"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            {editId ? "Edit Customer/Supplier" : "Add New Customer/Supplier"}
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
        <div className="overflow-y-auto">{formBody}</div>
      </div>
    );
  }

  return (
    <>
      <div onKeyDown={handleKeyDown}>
        <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto mt-1 bg-white">
          <div className="w-full flex justify-between py-0.5 items-center px-0.5">
            <h1 className="text-lg font-bold text-gray-800">
              Customer/Supplier Master{" "}
            </h1>
            <div className="flex items-center gap-4 text-md">
              <button
                onClick={() => {
                  handleCreate();
                  // syncFormWithDb(undefined)
                  // syncFormWithDbNew(undefined)
                  setParentId("");
                }}
                className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={12} />
                <span className=" ">Add New Customer/Supplier</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setView("all");
                    setReportName("Customer/Supplier Name");
                  }}
                  className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                    view === "all"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Table size={16} />
                  All
                </button>
                <button
                  onClick={() => {
                    setView("Customer");
                    setReportName("Customer Name");
                  }}
                  className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                    view === "Customer"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Table size={16} />
                  Customer
                </button>
                <button
                  onClick={() => {
                    setView("Supplier");
                    setReportName("Supplier Name");
                  }}
                  className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                    view === "Supplier"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LayoutGrid size={16} />
                  Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <Mastertable
                    // header={'Party list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    }
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                /> */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 w-">
          <ReusableTable
            columns={columns}
            data={filterParty || []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteData}
            itemsPerPage={10}
          />
        </div>

        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[90%] h-[98%] overflow-hidden"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              syncFormWithDbNew(undefined);
              setId("");
              setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
                <div className="flex items-center gap-2">
                  <h2 className="text-md font-semibold text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Customer/Supplier"
                        : "Customer/Supplier Master"
                      : "Add New Customer/Supplier"}
                  </h2>
                </div>

                <div className="flex gap-2">
                  {/* <div className="  ">
                                        <button
                                            onClick={() => {
                                                if (id) {
                                                    setBranchModelOpen(true)
                                                    setBranchForm(false)
                                                }

                                                else {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: `Save the ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                                                        showConfirmButton: false,
                                                    });
                                                }

                                            }}
                                            readOnly={readOnly}
                                            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Add Branch
                                        </button>
                                    </div> */}
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
              </div>

              <div className="flex-1 overflow-y-auto">
                {" "}
                {/* Wrap formBody with scrollable container */}
                {formBody}
              </div>
            </div>
          </Modal>
        )}
      </div>
      <Modal
        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"p-3 h-[70%] w-[70%]"}
      >
        <ArtDesignReport
          // userRole={userRole}
          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
      <Modal
        isOpen={branchModelOpen}
        form={form}
        widthClass={"w-[90%] h-[89%]"}
        setBranchModelOpen={setBranchModelOpen}
        onClose={() => {
          setBranchModelOpen(false);
        }}
      >
        <AddBranch
          cityList={cityList}
          setReadOnly={setReadOnly}
          partyId={id}
          branchForm={branchForm}
          setBranchForm={setBranchForm}
          branchTypeData={branchTypeData}
          companyId={companyId}
          readOnly={readOnly}
          isCustomer={isCustomer}
          isSupplier={isSupplier}
          branchId={branchId}
          setBranchId={setBranchId}
          parentName={name}
          parentPanNo={panNo}
          parentGstNo={gstNo}
          parentMsme={msmeNo}
          parentCinNo={cinNo}
        />
      </Modal>
    </>
  );
}
