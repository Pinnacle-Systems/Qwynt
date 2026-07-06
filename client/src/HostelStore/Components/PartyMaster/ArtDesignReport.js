import { Check, Plus } from "lucide-react";
import moment from "moment";
import { useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import { renameFile } from "../../../Utils/helper";
import { getImageUrlPath } from "../../../Constants";


const ArtDesignReport = ({ id,  readOnly, userRole, setFormReport, formReport, setAttachments, attachments, setDueDate }) => {

  const today = new Date();
  const Model = "Attachments"


  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  console.log(attachments,"attachments")




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



  function handleInputChange(value, index, field) {
    console.log(value, 'value', index, "index", field, "field")

    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  };

  function deleteRow(index) {
    console.log(index,"index");
    
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  function openPreview(filePath) {
    window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))

  }

  return (
    <>
      <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full  overflow-auto p-3  ">
        {/* <div className="flex justify-between bg-white items-center my-2 rounded-md  px-3 py-1">
                        <h3 className="text-gray-800 font-semibold text-sm p-1">{Model}</h3>
                        <div className='flex flex-row gap-3'>
                   
                     
                            <button
                          // onClick={saveData}
              
                            className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                    border border-green-600 flex items-center gap-1 text-xs">
                            <Check className="w-4 h-4" />
                            {id ? "Update" : "Save"}
                          </button>
                        </div>
                          
                      </div> */}


        <div className="flex-1 overflow-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">


            <div className="lg:col-span-12 space-y-3">
              {/* <div className="bg-white p-3 rounded-md border border-gray-200  "> */}
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[340px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium text-slate-700">List Of Attachments</h2>
                  <div className="flex gap-2 items-center">

                    <button
                      onClick={() => {
                        addNewComments()
                      }}
                      className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                    >
                      <HiPlus className="w-3 h-3 mr-1" />
                      Add Item
                    </button>
                  </div>

                </div>
                <div className="grid grid-cols-1 gap-3 p-3  border-collapse bg-[#F1F1F0] rounded-xl shadow-sm overflow-auto">
                  <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                    <thead className=" py-2  font-medium ">
                      <tr>
                        <th className="py-2  font-medium  w-10 text-center border-r border-white/50">S.No</th>
                        <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th>
                        {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                        <th className="py-2  font-medium  center border-white/50"> Name</th>
                        <th className="py-2  font-medium center w-60 border-r border-white/50">File</th>
                        <th className="py-2  font-medium  w-10 text-center">
                          actions
                        </th>

                      </tr>
                    </thead>


                    <tbody>
                      {attachments?.map((item,index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            }`}
                        >
                          <td className="border-r border-white/50 center h-8 text-center "
                          >
                            {index + 1}
                          </td>
                          <td className=" border-r border-white/50 h-8 ">
                            <input
                              type="date"
                              disabled
                              className="text-center rounded py-1 w-full  focus:outline-none focus:ring focus:border-blue-300"
                              value={
                                moment(item?.date).format("YYYY-MM-DD")
                              }
                              onChange={(e) =>
                                handleInputChange(e.target.value, index, "date")
                              }
                            />
                          </td>
        
                          <td className=" border-r border-white/50' h-8 ">
                            <input
                              type="text"
                              className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                              value={item?.name}
                              disabled={userRole == ""}
                              onChange={(e) =>
                                handleInputChange(e.target.value, index, "name")
                              }

                            />
                          </td>

                          <td className=" border-r border-white/50' h-8 ">
                            <div className='flex gap-2'>
                              {(!readOnly && !item.filePath) &&
                                <input
                                  disabled={userRole == ""}
                                  title=" "
                                  type="file"
                                  onChange={(e) =>
                                    e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                  }
                                />

                              }
                              {item.filePath &&
                                <>
                                  {item.filePath?.name ? item.filePath?.name : item?.filePath}
                                  <button onClick={() => { openPreview(item.filePath) }}>
                                    View
                                  </button>
                                  {!readOnly &&
                                    <button disabled={userRole == ""} onClick={() => { handleInputChange('', index, "filePath") }}></button>
                                  }
                                </>
                              }



                            </div>
                          </td>

                          <td className=" w-[30px] border-gray-200 gap-1   h-8 justify-end">
                            <div className="flex">
                              {/* {onView && ( */}
                              <button
                                className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                              //   onClick={() => onView(item.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              {/* )} */}
                              {/* {onEdit && ( */}
                              <button
                                className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                              //   onClick={() => onEdit(item.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              {/* )} */}
                              {/* {onDelete && ( */}
                              <button
                                className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
                                onClick={() => deleteRow(index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {/* <span className="text-xs">delete</span> */}
                              </button>
                              {/* )} */}
                            </div>
                          </td>




                        </tr>
                      ))}


                    </tbody>
                  </table>


                </div>
              </div>
              {/* </div>  */}


            </div>
          </div>
        </div>
      </div>
      {/* <div className="w-full grid grid-cols-1 mt-2  px-5">
            <div className="grid grid-cols-1 gap-4 p-1">
              <table className="border border-gray-300 text-sm table-auto w-full">
                <thead className="bg-gray-300 border border-gray-400">
                  <tr>
                    <th className="py-1 px-3 w-10 text-left border border-gray-400">S.No</th>
                    <th className="py-1 px-3 w-24 text-left border border-gray-400">Date</th>
                    <th className="py-1 px-3 text-left border border-gray-400">Comments</th>
                    <th className="py-1 px-3 text-left w-60 border border-gray-400">File</th>
                    {userRole === "VENDOR" &&
                      <th className="py-1 px-3 w-10 text-center">
                        <button
                          onClick={addNewComments}
                          className="text-green-500 hover:text-green-700 transition duration-150"
                        >
                          {Plus}
                        </button>
                      </th>
                    }
                  </tr>
                </thead>


                <tbody>
                  {(attachments ?? []).map((item, index) => (
                    <AttachementForm
                      key={index}
                      item={item}
                      index={index}
                      readOnly={false}
                      setAttachments={setAttachments}
                      attachments={attachments}
                      userRole={userRole}
                    />
                  ))}
                </tbody>
              </table>

            </div>
       

        <div className="h-[60px] flex items-center justify-end px-5">
          <button
            onClick={() => setFormReport?.(false)}
            className="bg-blue-500 text-white px-3  rounded hover:bg-blue-600"
          >
            DONE
          </button>
        </div>
       </div> */}

    </>

  )
}

export default ArtDesignReport
