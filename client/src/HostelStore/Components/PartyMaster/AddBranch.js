import { Check, Eye, Paperclip, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { DropdownInputNew, DropdownWithSearch, ReusableTable, TextArea, TextAreaNew, TextInputNew, TextInputNew1, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { dropDownListMergedObject, dropDownListObject } from "../../../Utils/contructObject";
import { getImageUrlPath } from "../../../Constants";
import { renameFile } from "../../../Utils/helper";
import partyBranchMasterApi, { useAddPartyBranchMutation, useDeletePartyBranchMutation, useGetPartyBranchByIdQuery, useGetPartyBranchQuery, useUpdatePartyBranchMutation } from "../../../redux/services/PartyBranchMasterService";
import moment from "moment";
import { useGetbranchTypeQuery } from "../../../redux/services/BranchTypeMaster";
import { useAddPartyMutation, useDeletePartyMutation, useGetPartyByIdQuery, useUpdatePartyMutation } from "../../../redux/services/PartyMasterService";
import { useDispatch } from "react-redux";
import cityMasterApi from "../../../redux/services/CityMasterService";



const AddBranch = ({ partyId, setPartyId, cityList, branchInfo, readOnly, setReadOnly,
  branchForm, setBranchForm, branchState, refetch, companyId, branchTypeData, isSupplier, isCustomer, branchId, setBranchId,
  parentName,
  parentGstNo
}) => {

  // const {
  //   branchName,
  //   setBranchName,
  //   branchCode,
  //   setBranchCode,
  //   branchAddress,
  //   setBranchAddress,
  //   branchContact,
  //   setBranchContact,
  //   branchContactPerson,
  //   setBranchcontactPerson,
  //   branchEmail,
  //   setBranchEmail,
  //   openingHours,
  //   branchWebsite,
  //   branchAliasName,
  //   setBranchAliasName,
  //   setBranchActive,
  //   branchCity,
  //   setBranchCity,
  //   branchLandMark,
  //   setBranchLandMark,
  //   branchPincode,
  //   setBranchPincode,
  //   branchContactDesignation,
  //   setBranchcontactDesignation,
  //   branchContactDepartment,
  //   setBranchcontactDepartment,
  //   branchBankname,
  //   setBranchBankName,
  //   branchBankBranchName,
  //   setBranchBankBranchName,
  //   branchAccountNumber,
  //   setBranchAccountNumber,
  //   branchIfscCode,
  //   setBranchIfscCode,
  //   branchType,
  //   setBranchType,
  //   branchContactPersonContact,
  //   setBranchContactPersonContact,
  //   branchContactPersonAlterContact,
  //   setBranchContactPersonAlterContact,

  // } = branchState;

  const [form, setForm] = useState(false);


  const [id, setId] = useState("");
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
  const [soa, setSoa] = useState("")
  const [coa, setCoa] = useState("")
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
  const [contactMobile, setContactMobile] = useState('');
  const [cstDate, setCstDate] = useState("");
  const [email, setEmail] = useState("");

  const [active, setActive] = useState(true);
  const [view, setView] = useState("all");
  const [isClient, setClient] = useState();
  const [partyCode, setPartyCode] = useState("");
  const [landMark, setlandMark] = useState("");
  const [country, setCountry] = useState('')
  const [contact, setContact] = useState('')
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('')
  const [contactPersonEmail, setContactPersonEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [alterContactNumber, setAlterContactNumber] = useState('')
  const [bankname, setBankName] = useState('')
  const [bankBranchName, setBankBranchName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [attachments, setAttachments] = useState([]);
  const [reportName, setReportName] = useState("Customer/Supplier Name")
  const [searchValue, setSearchValue] = useState("");
  const [msmeNo, setMsmeNo] = useState("")
  const [companyAlterNumber, setCompanyAlterNumber] = useState('')
  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [formReport, setFormReport] = useState(false);


  const [branchCity, setBranchCity] = useState("");
  const [branchLandMark, setBranchLandMark] = useState("");
  const [branchPincode, setBranchPincode] = useState("");

  const [branchContactDesignation, setBranchcontactDesignation] = useState("");
  const [branchContactDepartment, setBranchcontactDepartment] = useState("");

  const [branchBankname, setBranchBankName] = useState("");
  const [branchBankBranchName, setBranchBankBranchName] = useState("");
  const [branchAccountNumber, setBranchAccountNumber] = useState("");
  const [branchIfscCode, setBranchIfscCode] = useState("");

  const [branchTypeId, setBranchTypeId] = useState("");

  const [branchContactPersonContact, setBranchContactPersonContact] = useState("");
  const [branchContactPersonAlterContact, setBranchContactPersonAlterContact] = useState("");
  let childRecord = {
    current: 0
  }

  console.log(branchId, "branchId")

  const [isBranchcontact, setIsBranchcontact] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [contactForm, setContactForm] = useState(false)
  const today = new Date();

  const dispatch = useDispatch();


  function handleInputChange(value, index, field) {

    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
  };

  function deleteRow(index) {
    console.log(index, "index");

    setAttachments(prev => prev.filter((_, i) => i !== index))
  }
  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
  }
  function openPreview(filePath) {
    window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))

  }

  useEffect(() => {
    if (attachments?.length >= 1) return
    setAttachments(prev => {
      let newArray = Array.from({ length: 1 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setAttachments, attachments])

  const { data: allData } = useGetPartyBranchQuery({
    params: {
      partyId
    }
  });


  // const {
  //   data: singleBranchData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetPartyBranchByIdQuery(branchId, { skip: !branchId });

  const {
    data: singleBranchData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyBranchByIdQuery(branchId, { skip: !branchId });

  console.log(allData, "allData", branchId)


  const [addData] = useAddPartyBranchMutation();
  const [updateData] = useUpdatePartyBranchMutation();
  const [removeData] = useDeletePartyBranchMutation();




  const syncFormWithDb = useCallback(
    (data) => {
      setReadOnly(false)
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
      setSoa(data?.soa ? data?.soa : "")

      setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "");
      setGstNo(data?.gstNo ? data?.gstNo : "");
      setCostCode(data?.costCode ? data?.costCode : "");
      setCstDate(data?.cstDate ? moment.utc(data?.cstDate).format('YYYY-MM-DD') : "");
      setCode(data?.code ? data?.code : "");
      setPincode(data?.pincode ? data?.pincode : "");
      setWebsite(data?.website ? data?.website : "");
      setEmail(data?.email ? data?.email : "");
      setCity(data?.cityId ? data?.cityId : "");

      setActive(id ? (data?.active ? data.active : false) : true);
      setContactMobile((data?.contactMobile ? data.contactMobile : ''));
      setlandMark(data?.landMark ? data?.landMark : '')
      setContact(data?.contact ? data?.contact : '')
      setDesignation(data?.designation ? data?.designation : "")
      setDepartment(data?.department ? data?.department : "")
      setContactPersonEmail(data?.contactPersonEmail ? data?.contactPersonEmail : "")
      setContactNumber(data?.contactNumber ? data?.contactNumber : "")
      setAlterContactNumber(data?.alterContactNumber ? data?.alterContactNumber : "")
      setBankName(data?.bankname ? data?.bankname : "")
      setBankBranchName(data?.bankBranchName ? data?.bankBranchName : "")
      setAccountNumber(data?.accountNumber ? data?.accountNumber : "")
      setIfscCode(data?.ifscCode ? data?.ifscCode : '')
      setAttachments(data?.Branchattachments ? data?.Branchattachments : [])
      setMsmeNo(data?.msmeNo ? data?.msmeNo : "")
      setCompanyAlterNumber(data?.companyAlterNumber ? data?.companyAlterNumber : "")
      setPartyCode(data?.partyCode ? data?.partyCode : "")
      setBranchTypeId(data?.branchTypeId ? data?.branchTypeId : "")

    },

    [branchId]
  );

  useEffect(() => {
    syncFormWithDb(singleBranchData?.data);
  }, [isSingleLoading, isSingleFetching, singleBranchData, branchId, syncFormWithDb]);




  const data = {
    name, isSupplier, isCustomer, code, aliasName, displayName, address, cityId: city, pincode, panNo, tinNo, cstNo, cstDate, cinNo,
    faxNo, email, website, contactPersonName, gstNo, costCode, contactMobile, branchId,
    active, coa: coa ? coa : "", soa,
    id,
    landMark, contact, designation, department, contactPersonEmail, contactNumber, alterContactNumber, bankname,
    bankBranchName, accountNumber, ifscCode, attachments, msmeNo, companyAlterNumber, partyCode, partyId, branchTypeId, companyId
  };

  console.log(data, "data")



  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {

        console.log(key, "key")
        if (key == 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
          data[key].forEach(option => {
            if (option?.filePath instanceof File) {
              formData.append('images', option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }
      console.log(formData, "formData")

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ branchId, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      dispatch(partyBranchMasterApi.util.invalidateTags(["partyBranchMaster"]));
      dispatch(cityMasterApi.util.invalidateTags(["cityMaster"]));

      // dispatch({
      //   type: `accessoryItemMaster/invalidateTags`,
      //   payload: ['AccessoryItemMaster'],
      // });
      // dispatch({
      //   type: `CityMaster/invalidateTags`,
      //   payload: ['City/State Name'],
      // });
      // dispatch({
      //   type: `CurrencyMaster/invalidateTags`,
      //   payload: ['Currency'],
      // });
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
      } else {
        if (partyId) {
          // onCloseForm()
        }
        setBranchForm(true);
      }
      // setBranchId('')
      // setBranchForm(true)

      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",

      });
    } catch (error) {
      console.log("handle");
    }
  };

  const handleDelete = async (orderId) => {
    if (orderId) {
      if (!window.confirm("Are you sure to delete..     .?")) {
        return;
      }
      try {
        await removeData(orderId)

        Swal.fire({
          icon: 'success',
          title: `Deleted Successfully`,
          showConfirmButton: false,
          timer: 2000
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
      }
    }

  };

  const validateData = (data) => {

    if (data.name && data?.branchTypeId && data?.address && data?.cityId && data?.pincode) {


      return true

    }
    return false
  };

  const saveData = (nextProcess) => {

    if (!validateData(data)) {
      Swal.fire({
        title: 'Please fill all required fields...!',
        icon: 'error',
      });
      return
    }
    let foundItem;
    if (branchId) {
      foundItem = allData?.data
        ?.filter((i) => i.id != branchId)
        ?.some((item) => item.name == name);
    } else {
      foundItem = allData?.data?.some((item) => item.name == name);
    }
    if (foundItem) {
      Swal.fire({
        text: `The Branch name is already  exists `,
        icon: "warning",
      });
      return false;
    }
    //     handleSubmitCustom(updateData, data, "Updated");
    // } else {
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (branchId) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    }
    else {

      handleSubmitCustom(addData, data, "Added", nextProcess);

    }
    // else{
    //   toast.info("no Party selected")
    // }
  };

  const columns = [
    {
      header: 'S.No',
      accessor: (item, index) => index + 1,
      className: 'font-medium text-gray-900 w-[5px] text-center'
    },

    {
      header: 'Branch Name',
      accessor: (item) => item.name,
      className: "font-medium text-gray-900 text-left uppercase w-96",
    },

    {
      header: 'Branch Address',
      accessor: (item) => item.address,
      className: "font-medium text-gray-900 text-left uppercase w-2/4",
    },


  ];


  // useEffect(() => {
  //   if (branchInfo?.length >= 1) return
  //   setBranchInfo(prev => {
  //     let newArray = Array.from({ length: 1 - prev.length }, () => {
  //       return {
  //         address: "", branchName: ''
  //       }
  //     })
  //     return [...prev, ...newArray]
  //   }
  //   )
  // }, [setBranchInfo, branchInfo])



  const handleView = (id) => {
    console.log(id, "id")
    setBranchId(id)
    setBranchForm(false)
    //  setReadOnly(true);
  };

  const handleEdit = (id) => {
    setBranchId(id)
    setBranchForm(false)
    //  setReadOnly(false);
  };
  const onNew = () => {
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setId("");
    setBranchId('')
    syncFormWithDb(undefined);
  };
  const countryNameRef = useRef(null);

  useEffect(() => {
    if (form && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form]);

  return (


    <>

      {/* <Modal isOpen={formReport}
        onClose={() => setFormReport(false)} widthClass={"p-3 h-[70%] w-[70%]"}
      >
        <ArtDesignReport
          // userRole={userRole}
          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
        // searchValue={searchValue}
        // setSearchValue={setSearchValue}
        />
      </Modal> */}


      {branchForm == true ?



        (

          <div className="flex flex-col bg-gray-200 p-4 h-[80vh] rounded-md">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-800 tracking-tight " >
                  Branch List
                </h1>
              </div>

              <button
                onClick={() => {
                  setBranchForm(!branchForm)
                  onNew();
                }}
                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs">
                <FaPlus className="w-4 h-4" />
                Add  Branch
              </button>
            </div>

            <div className="h-[70vh]  flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
              <ReusableTable
                columns={columns}
                data={allData?.data}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                itemsPerPage={10}
              />
            </div>
          </div>)


        :

        (


          <div className="bg-gray-200 shadow-xl w-full  overflow-auto p-2 h-[98%] ">
            <div className="flex justify-between bg-white items-center my-2 rounded-md  px-4 ">
              <h2 className="text-gray-800 font-semibold text-lg p-1">Add New Branch</h2>
              <h2 className="text-lg font-semibold text-zinc-800 p-1">{parentName}</h2>

              <div className='flex flex-row gap-3'>

                <button
                  type="button"
                  onClick={() => setBranchForm(true)}

                  className="px-3 py-1 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 text-xs flex items-center gap-1 rounded"
                >
                  <Eye className="w-4 h-4" />
                  View Branch List
                </button>
                {/* <button
                      type="button"
                      onClick={() => 
                       onclose}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                </button>  */}
                {partyId && (
                  <button
                    type="submit"
                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    onClick={() => {
                      saveData("new")
                    }}
                  >
                    <Check size={14} />
                    {branchId ? "update" : "save & New"}
                  </button>
                )

                }
                <div className="flex gap-2">
                  {!readOnly && !branchId && (
                    <button
                      type="button"
                      onClick={() => {
                        saveData("close");
                      }}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-blue-600 
                                                                 border border-blue-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {"Save & Close"}
                    </button>
                  )}
                </div>

              </div>
            </div>

            <div className="flex-1 overflow-auto p-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">




                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[250px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                    <div className="grid grid-cols-2 gap-2">


                      {/* <DropdownWithSearch
                        options={branchTypeData?.data}
                        labelField={"name"}
                        required={true}

                        label={"Branch Category"}
                        value={branchType}
                        setValue={setBranchType}
                      /> */}

                      <DropdownInputNew
                        name="Branch Category"
                        options={dropDownListObject(
                          id
                            ? branchTypeData?.data
                            : branchTypeData?.data?.filter(
                              (item) => item.active
                            ),
                          "name",
                          "id" || []
                        )}
                        value={branchTypeId}
                        ref={countryNameRef}
                        openOnFocus={true}
                        setValue={(value) => setBranchTypeId(value)}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />

                      <div className="col-span-2">
                        <TextInputNew1
                          name={"Branch Name"}
                          type="text"
                          value={name}
                          inputClass="h-8"
                          // ref={countryNameRef}
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
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[250px] overflow-y-auto">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                    <div className="space-y-2">


                      <div className="grid grid-cols-2 gap-2">

                        <div className="col-span-2">

                          <TextAreaNew name="Address"
                            inputClass="h-10" value={address}
                            setValue={setAddress} required={true}
                            readOnly={readOnly} d
                            isabled={(childRecord.current > 0)} />
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
                            <div className="col-span-4">
                              <DropdownInputNew
                                name="City/State Name"
                                options={dropDownListMergedObject(
                                  id
                                    ? cityList?.data
                                    : cityList?.data?.filter((item) => item.active),
                                  "name",
                                  "id"
                                )}
                                country={country}
                                masterName="CITY MASTER"
                                // lastTab={activeTab}
                                value={city}
                                setValue={setCity}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
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

                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[250px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                    <div className="space-y-2">



                      <div className="grid grid-cols-2 gap-2">
                        <div className="">

                          <TextInputNew1
                            name="Contact Person Name"
                            type="text"
                            value={contactPersonName}

                            setValue={setContactPersonName}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>

                        <TextInputNew1
                          name="Designation"
                          type="text"
                          value={designation}

                          setValue={setDesignation}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInputNew1
                          name="Department"
                          type="text"
                          value={department}

                          setValue={setDepartment}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <div className='col-span-1'>


                          <TextInputNew
                            name="Email"
                            type="text"
                            value={contactPersonEmail}

                            setValue={setContactPersonEmail}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className='col-span-2'>

                          <TextInputNew
                            name="Contact Number"
                            value={contactNumber}
                            setValue={setContactNumber}

                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
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
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
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
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInputNew
                          name="GST No"
                          type="text"
                          value={parentGstNo}
                          setValue={setGstNo}
                          readOnly={readOnly}
                          required={true}
                          disabled={true}
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
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank  Details</h3>
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
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Attachments</h3>



                    <div className="max-h-[200px] overflow-auto">
                      <div className="grid grid-cols-1 gap-3  border-collapse bg-[#F1F1F0]   shadow-sm overflow-auto">
                        <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                          <thead className=" py-2  font-medium  top-o sticky">
                            <tr>
                              <th className="py-2  text-xs  w-10 text-center border-r border-white/50">S.No</th>
                              {/* <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th> */}
                              {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                              <th className="py-2  text-xs w-60 center border-white/50"> Name</th>
                              <th className="py-2  text-xs center w-60 border-r border-white/50">File</th>
                              <th className="py-2  text-xs  w-10 text-center">
                                Actions
                              </th>

                            </tr>
                          </thead>


                          <tbody>
                            {attachments?.map((item, index) => (
                              <tr
                                key={index}
                                className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                  }`}
                              >
                                <td className="border-r border-white/50 center h-8 text-center "
                                >
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
                                                "filePath"
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
                                          onClick={() => openPreview(item.filePath)}
                                          className="text-blue-600 text-xs hover:underline"
                                        >
                                          View
                                        </button>

                                        {!readOnly && (
                                          <button
                                            onClick={() => handleInputChange('', index, "filePath")}
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



        )


      }

    </>
  )
}

export default AddBranch