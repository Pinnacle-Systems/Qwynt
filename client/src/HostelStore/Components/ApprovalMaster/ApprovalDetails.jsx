// import React, { useEffect } from "react";
// import { Plus, Trash2, MoreVertical } from "lucide-react";
// import { MultiSelectDropdownWithoutBorder, DropdownInputNew } from "../../../Inputs";

// export default function ApprovalDetails({
//   approvalLevelItems,
//   setApprovalLevelItems,
//   userList,
//   readOnly,
// }) {
//   // ── Handlers ──────────────────────────────────────────
//   const addRow = () => {
//     setApprovalLevelItems((prev) => [
//       ...prev,
//       {
//         levelNo: prev.length + 1,
//         approveType: "OR",
//         users: [],
//       },
//     ]);
//   };

//   const removeRow = (index) => {
//     setApprovalLevelItems((prev) =>
//       prev
//         .filter((_, i) => i !== index)
//         .map((row, i) => ({ ...row, levelNo: i + 1 })),
//     );
//   };

//   const updateRow = (index, field, value) => {
//     setApprovalLevelItems((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   };

//   const userOptions =
//     userList?.map((u) => ({
//       label: u.username,
//       value: u.id,
//     })) || [];

//   const approveTypeOptions = [
//     { show: "OR (Any)", value: "OR" },
//     { show: "AND (All)", value: "AND" },
//   ];

//   useEffect(() => {
//     if (!approvalLevelItems || approvalLevelItems.length === 0) {
//       const defaultRows = Array.from({ length: 4 }, (_, i) => ({
//         levelNo: i + 1,
//         approveType: "OR",
//         users: [],
//       }));
//       setApprovalLevelItems(defaultRows);
//     }
//   }, []);

//   return (
//     <div className="w-full flex flex-col h-full">
//       <div className="flex justify-between items-center mb-4">
//         <label className="text-sm font-semibold text-slate-700">
//           Approval Workflow Trigger Rules
//         </label>
//         {!readOnly && (
//           <div className="mt-3 flex justify-start">
//             <button
//               type="button"
//               onClick={addRow}
//               className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 hover:text-blue-700 transition font-bold text-xs flex items-center gap-1.5"
//             >
//               <Plus size={14} /> Add Approval Level
//             </button>
//           </div>
//         )}
//       </div>
//       <div className="flex-1 overflow-auto border border-slate-200 rounded-md shadow-sm bg-white">
//         <table className="w-[50vw] border-collapse table-fixed">
//           <thead className="bg-gray-100 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
//             <tr className="text-[11px] uppercase tracking-wider font-bold">
//               <th className="w-8 px-2 py-2 text-center border-r">S.No</th>
//               <th className="w-36 px-2 py-2 text-center border-r">
//                 Approve Type
//               </th>
//               {/* <th className="px-2 py-2 text-center border-r">
//                 Level Rules (Condition)
//               </th> */}
//               <th className="w-64 px-2 py-2 text-center border-r">
//                 Authorized Approvers
//               </th>
//               {!readOnly && (
//                 <th className="w-12 px-2 py-2 text-center">Actions</th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {approvalLevelItems.map((row, index) => (
//               <tr
//                 key={index}
//                 className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-indigo-50/20 transition-colors h-10`}
//               >
//                 {/* S.No */}
//                 <td className="text-center font-bold text-slate-500 text-[11px] border-r">
//                   {row.levelNo}
//                 </td>

//                 {/* Approve Type */}
//                 <td className="px-1 border-r">
//                   <div className="scale-90 origin-center">
//                     <DropdownInputNew
//                       options={approveTypeOptions}
//                       value={row.approveType}
//                       setValue={(val) => updateRow(index, "approveType", val)}
//                       readOnly={readOnly}
//                       className="text-xs"
//                     />
//                   </div>
//                 </td>

//                 {/* Condition Placeholder (Optional for future) */}
//                 {/* <td className="px-2 border-r  text-[10px] text-slate-400 text-center">
//                   {row.approveType === "AND"
//                     ? "All Selected Users Must Approve"
//                     : "Any One Selected User Can Approve"}
//                 </td> */}

//                 {/* Authorized Approvers */}
//                 <td
//                   className="px-1 border-r relative"
//                   style={{ zIndex: (approvalLevelItems.length - index) * 10 }}
//                 >
//                   <div className="scale-90 origin-center">
//                     <MultiSelectDropdownWithoutBorder
//                       name=""
//                       selected={row.users}
//                       setSelected={(val) => updateRow(index, "users", val)}
//                       options={userOptions}
//                       readOnly={readOnly}
//                       placeholder={readOnly ? "" : "Select Users..."}
//                       className="text-[11px]"
//                     />
//                   </div>
//                 </td>

//                 {/* Actions */}
//                 {!readOnly && (
//                   <td className="text-center">
//                     <button
//                       type="button"
//                       onClick={() => removeRow(index)}
//                       className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
//                       title="Remove Level"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MultiSelectDropdownWithoutBorder } from "../../../Inputs";

function DropdownPortal({ triggerRef, children, isOpen }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 99999,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div style={style}>{children}</div>,
    document.body,
  );
}

export default function ApprovalDetails({
  approvalLevelItems,
  setApprovalLevelItems,
  userList,
  readOnly,
}) {
  const addRow = () => {
    setApprovalLevelItems((prev) => [
      ...prev,
      { levelNo: prev.length + 1, approveType: "OR", users: [] },
    ]);
  };

  const removeRow = (index) => {
    setApprovalLevelItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, levelNo: i + 1 })),
    );
  };

  const removeAllRows = () => {
    setApprovalLevelItems([]);
  };

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    if (readOnly) return;
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, index });
  };

  const updateRow = (index, field, value) => {
    setApprovalLevelItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" && index === approvalLevelItems.length - 1) {
      e.preventDefault();
      if (!readOnly) {
        addRow();
      }
    }
  };

  // For multi-select: toggle a user id in the users array
  const toggleUser = (index, userId) => {
    setApprovalLevelItems((prev) => {
      const updated = [...prev];
      const currentUsers = updated[index].users || [];
      const exists = currentUsers.includes(userId);
      updated[index] = {
        ...updated[index],
        users: exists
          ? currentUsers.filter((u) => u !== userId)
          : [...currentUsers, userId],
      };
      return updated;
    });
  };

  const userOptions =
    userList?.map((u) => ({ label: u.username, value: u.id })) || [];

  const approveTypeOptions = [
    { show: "OR (Any)", value: "OR" },
    { show: "AND (All)", value: "AND" },
  ];

  useEffect(() => {
    if (!approvalLevelItems || approvalLevelItems.length === 0) {
      setApprovalLevelItems(
        Array.from({ length: 2 }, (_, i) => ({
          levelNo: i + 1,
          approveType: "OR",
          users: [],
        })),
      );
    }
  }, []);

  return (
    <div className="w-full flex flex-col h-full overflow-visible">
      {/* Header */}
      {approvalLevelItems.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-300 bg-white rounded-sm flex flex-col items-center gap-3">
          <span>No approval levels specified.</span>
          {!readOnly && (
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-100 transition font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add First Level
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-md shadow-sm bg-white ">
          <table className="w-[47vw] border-collapse table-fixed">
            <thead className="bg-gray-100 text-slate-700 border-b border-slate-200">
              {/* thead — remove sticky since overflow:visible breaks sticky */}
              <tr className="text-[11px] uppercase tracking-wider font-bold">
                <th className="w-6 py-2 text-center border-r border-slate-200">
                  S.No
                </th>
                <th className="w-16 px-2 py-2 text-center border-r border-slate-200">
                  Level Title
                </th>
                <th className="w-20  py-2 text-center border-r border-slate-200">
                  Approval Condition
                </th>
                <th className="w-44 px-2 py-2 text-center border-r border-slate-200">
                  Approvers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvalLevelItems.map((row, index) => (
                <tr
                  key={index}
                  onContextMenu={(e) => handleContextMenu(e, index)}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#f5f6fa]"
                  } hover:bg-indigo-50/20 transition-colors`}
                  style={{ height: "34px" }}
                >
                  {/* S.No */}
                  <td className="text-center  text-black text-[11px] border-r border-slate-200 ">
                    {row.levelNo}
                  </td>
                  <td className="text-right pr-2  text-black text-[11px] border-r border-slate-200 ">
                    Level {row.levelNo} Approval
                  </td>
                  {/* Approve Type */}
                  <td className="border-r border-slate-200 p-0 relative">
                    <select
                      value={row.approveType}
                      onChange={(e) =>
                        updateRow(index, "approveType", e.target.value)
                      }
                      disabled={readOnly}
                      className="absolute inset-0 w-full h-full text-[11px] text-black bg-transparent border-none outline-none pl-2 pr-6 cursor-pointer"
                    >
                      {approveTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.show}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Authorized Approvers — position:static + overflow:visible */}
                  <td
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`border-r border-slate-200 p-0 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#f5f6fa]"
                    }`}
                    style={{
                      position: "static", // ← no containing block
                      overflow: "visible", // ← don't clip dropdown
                      zIndex: (approvalLevelItems.length - index) * 10,
                    }}
                  >
                    <div
                      className={`relative flex items-center w-full h-full  ${
                        index % 2 === 0 ? "bg-white" : "bg-[#f5f6fa]"
                      }`}
                    >
                      {/* The multiselect — hide its default arrow via CSS */}
                      <div className="flex-1 overflow-visible [&_.dropdown-container]:border-none [&_.dropdown-container]:shadow-none [&_.dropdown-container:focus-within]:border-none [&_.dropdown-container:focus-within]:shadow-none">
                        <MultiSelectDropdownWithoutBorder
                          name=""
                          selected={row.users}
                          setSelected={(val) => updateRow(index, "users", val)}
                          options={userOptions}
                          readOnly={readOnly}
                          placeholder="Select Users..."
                          className="text-[10px] border-none outline-none w-full"
                        />
                      </div>

                      {/* Custom chevron matching Approve Type column */}
                      {/* Custom chevron matching native select arrow */}
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Context Menu Modal */}
      {contextMenu !== null && (
        <div
          className="fixed z-50 bg-gray-200 border border-gray-300 rounded shadow-lg py-1 w-32"
          style={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
          }}
        >
          <button
            type="button"
            className="w-full text-left px-4 py-1.5 text-[11px] text-black hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              removeRow(contextMenu.index);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-1.5 text-[11px] text-black hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              removeAllRows();
              setContextMenu(null);
            }}
          >
            Delete All
          </button>
        </div>
      )}
    </div>
  );
}
