// import React from "react";
// import { Plus, Trash2 } from "lucide-react";

// export default function RuleBuilder({
//   conditions,
//   setConditions,
//   ruleLogicalOperator,
//   setRuleLogicalOperator,
//   fieldOptions,
//   operatorOptions,
//   readOnly,
// }) {
//   const addCondition = () => {
//     setConditions([
//       ...conditions,
//       {
//         fieldId: "",
//         operatorId: "",
//         valueType: "STATIC",
//         value: "",
//         compareFieldId: "",
//       },
//     ]);
//   };

//   const removeCondition = (index) => {
//     setConditions(conditions.filter((_, i) => i !== index));
//   };

//   const updateCondition = (index, field, value) => {
//     const newConditions = [...conditions];
//     newConditions[index][field] = value;
//     if (field === "valueType") {
//       newConditions[index].value = "";
//       newConditions[index].compareFieldId = "";
//     }
//     setConditions(newConditions);
//   };

//   return (
//     <div className="w-full">
//       <div className="flex justify-between items-center mb-4">
//         <label className="text-sm font-semibold text-slate-700">
//           Approval Workflow Trigger Rules
//         </label>
//         {!readOnly && (
//           <button
//             type="button"
//             onClick={addCondition}
//             className="flex items-center justify-center gap-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-medium px-3 py-1.5  transition-colors shadow-sm"
//           >
//             <Plus size={14} /> Add Rule
//           </button>
//         )}
//       </div>

//       {conditions.length > 1 && (
//         <div className="mb-4 flex items-center gap-2">
//           <span className="text-xs font-medium text-slate-500">
//             Combine rules using:
//           </span>
//           <select
//             value={ruleLogicalOperator}
//             onChange={(e) => setRuleLogicalOperator(e.target.value)}
//             disabled={readOnly}
//             className="text-xs font-medium border text-center border-slate-300 rounded-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-24 h-7 bg-white"
//           >
//             <option value="AND">AND (All)</option>
//             <option value="OR">OR (Any)</option>
//           </select>
//         </div>
//       )}

//       {conditions.length === 0 ? (
//         <div className="text-xs text-slate-400  py-3 text-center border border-dashed border-slate-300 bg-white rounded-sm">
//           No trigger rules specified. This workflow will always trigger for
//           every form submitted!
//         </div>
//       ) : (
//         <div className="flex flex-col gap-2">
//           {conditions.map((cond, index) => (
//             <div
//               key={index}
//               className="flex flex-wrap items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm shadow-sm transition-all hover:bg-slate-50"
//             >
//               <span className="text-xs font-bold text-slate-300 w-5 text-center">
//                 {index + 1}.
//               </span>

//               <select
//                 value={cond.fieldId}
//                 onChange={(e) =>
//                   updateCondition(index, "fieldId", e.target.value)
//                 }
//                 disabled={readOnly}
//                 className="text-xs border border-slate-300 rounded-sm h-7 px-2 focus:outline-none focus:border-indigo-500 min-w-[160px] bg-white"
//               >
//                 <option value="">Select Field...</option>
//                 {fieldOptions?.map((f) => (
//                   <option key={f.id} value={f.id}>
//                     {f.label || f.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={cond.operatorId}
//                 onChange={(e) =>
//                   updateCondition(index, "operatorId", e.target.value)
//                 }
//                 disabled={readOnly}
//                 className="text-xs font-medium border border-slate-300 rounded-sm h-7 px-2 focus:outline-none focus:border-indigo-500 min-w-[120px] bg-slate-50"
//               >
//                 <option value="">Operator...</option>
//                 {(() => {
//                   const selectedField = fieldOptions?.find(
//                     (f) => Number(f.id) === Number(cond.fieldId),
//                   );
//                   const availableOperators =
//                     selectedField?.Operators?.length > 0
//                       ? selectedField.Operators
//                       : operatorOptions;
//                   return availableOperators?.map((op) => (
//                     <option key={op.id} value={op.id}>
//                       {op.label} ({op.operator})
//                     </option>
//                   ));
//                 })()}
//               </select>

//               <select
//                 value={cond.valueType}
//                 onChange={(e) =>
//                   updateCondition(index, "valueType", e.target.value)
//                 }
//                 disabled={readOnly}
//                 className="text-xs font-medium text-slate-600 border border-slate-300 bg-slate-100 rounded-sm h-7 px-2 focus:outline-none focus:border-indigo-500"
//               >
//                 <option value="STATIC">Static Value</option>
//                 <option value="DYNAMIC">Dynamic Field</option>
//               </select>

//               {cond.valueType === "STATIC" ? (
//                 <input
//                   type="text"
//                   value={cond.value || ""}
//                   onChange={(e) =>
//                     updateCondition(index, "value", e.target.value)
//                   }
//                   disabled={readOnly}
//                   placeholder="Enter expected value..."
//                   className="text-xs border border-slate-300 rounded-sm h-7 px-2 focus:outline-none focus:border-indigo-500 flex-1 min-w-[120px]"
//                 />
//               ) : (
//                 <select
//                   value={cond.compareFieldId || ""}
//                   onChange={(e) =>
//                     updateCondition(index, "compareFieldId", e.target.value)
//                   }
//                   disabled={readOnly}
//                   className="text-xs border border-slate-300 rounded-sm h-7 px-2 focus:outline-none focus:border-indigo-500 flex-1 min-w-[120px] bg-white text-indigo-700 font-medium"
//                 >
//                   <option value="">Select Comparison Field...</option>
//                   {fieldOptions?.map((f) => (
//                     <option key={f.id} value={f.id}>
//                       {f.label || f.name}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               {!readOnly && (
//                 <button
//                   type="button"
//                   onClick={() => removeCondition(index)}
//                   className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-100"
//                   title="Remove Rule"
//                 >
//                   <Trash2 size={12} strokeWidth={2.5} />
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function RuleBuilder({
  conditions,
  setConditions,
  ruleLogicalOperator,
  setRuleLogicalOperator,
  fieldOptions,
  operatorOptions,
  readOnly,
  isAlwaysApproved,
}) {
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        fieldId: "",
        operatorId: "",
        valueType: "STATIC",
        value: "",
        compareFieldId: "",
      },
    ]);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const removeAllConditions = () => {
    setConditions([]);
  };

  const [contextMenu, setContextMenu] = React.useState(null);

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!conditions || conditions.length === 0) {
      setConditions([
        {
          fieldId: "",
          operatorId: "",
          valueType: "STATIC",
          value: "",
          compareFieldId: "",
        },
        {
          fieldId: "",
          operatorId: "",
          valueType: "STATIC",
          value: "",
          compareFieldId: "",
        },
      ]);
    }
  }, []);

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    if (readOnly) return;
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, index });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    if (field === "valueType") {
      newConditions[index].value = "";
      newConditions[index].compareFieldId = "";
    }
    setConditions(newConditions);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" && index === conditions.length - 1) {
      e.preventDefault();
      if (!readOnly && !isAlwaysApproved) {
        addCondition();
      }
    }
  };

  return (
    <div className="w-full">
      {isAlwaysApproved ? (
        <div className="text-xs text-indigo-600 font-medium py-6 text-center border border-dashed border-indigo-200 bg-indigo-50/50 rounded-lg flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span>
            "Approval Required" is Choosed. No trigger rules are required.
          </span>
          <p className="text-[10px] text-slate-400 font-normal px-10">
            All records submitted for this module will automatically enter the
            approval workflow levels defined in the next tab.
          </p>
        </div>
      ) : conditions.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-300 bg-white rounded-sm flex flex-col items-center gap-3">
          <span>
            No trigger rules specified. Please add rules or enable "Approval
            Required".
          </span>
          {!readOnly && !isAlwaysApproved && (
            <button
              type="button"
              onClick={addCondition}
              className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-100 transition font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add First Rule
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <table className="w-[50vw] border-collapse table-fixed text-[11px]">
            <thead className="bg-gray-100 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
              <tr className="text-[11px] uppercase tracking-wider font-bold">
                <th className="w-4  py-2 text-center border-r border-slate-300">
                  S.No
                </th>
                <th className="w-12 px-2 py-2 text-center border-r border-slate-300">
                  Field
                </th>
                <th className="w-16 px-2 py-2 text-center border-r border-slate-300">
                  Operator
                </th>
                <th className="w-12 px-2 py-2 text-center border-r border-slate-300">
                  Value Type
                </th>
                <th className="w-24 px-2 py-2 text-center border-r border-slate-300">
                  Value / Compare Field
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conditions.map((cond, index) => {
                const selectedField = fieldOptions?.find(
                  (f) => Number(f.id) === Number(cond.fieldId),
                );
                const availableOperators =
                  selectedField?.Operators?.length > 0
                    ? selectedField.Operators
                    : operatorOptions;

                return (
                  <tr
                    key={index}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-[#f5f6fa]"
                    } hover:bg-blue-50/20 transition-colors`}
                    style={{ height: "34px" }}
                  >
                    {/* S.No */}
                    <td className="text-center text-[11px] font-semibold text-slate-500 border-r border-slate-200">
                      {index + 1}
                    </td>

                    {/* Field */}
                    <td className="border-r border-slate-200 p-0 relative">
                      <select
                        value={cond.fieldId}
                        onChange={(e) =>
                          updateCondition(index, "fieldId", e.target.value)
                        }
                        disabled={readOnly}
                        className="w-full  text-[11px] text-black bg-transparent border-none outline-none  pl-2 pr-6 cursor-pointer disabled:cursor-default"
                      >
                        <option value="">Select Field...</option>
                        {fieldOptions?.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label || f.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Operator */}
                    <td className="border-r border-slate-200 p-0 relative">
                      <select
                        value={cond.operatorId}
                        onChange={(e) =>
                          updateCondition(index, "operatorId", e.target.value)
                        }
                        disabled={readOnly}
                        className="w-full  text-[11px] text-black  bg-transparent border-none outline-none  pl-2 pr-6 cursor-pointer disabled:cursor-default"
                      >
                        <option value="">Operator...</option>
                        {availableOperators?.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.label} ({op.operator})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Value Type */}
                    <td className="border-r border-slate-200 p-0 relative">
                      <select
                        value={cond.valueType}
                        onChange={(e) =>
                          updateCondition(index, "valueType", e.target.value)
                        }
                        disabled={readOnly}
                        className="w-full  text-[11px] text-black  bg-transparent border-none outline-none  pl-2 pr-6 cursor-pointer disabled:cursor-default"
                      >
                        <option value="STATIC">Static Value</option>
                        <option value="DYNAMIC">Dynamic Field</option>
                      </select>
                    </td>

                    {/* Value / Compare Field */}
                    <td className="border-r border-slate-200 p-0 relative">
                      {cond.valueType === "STATIC" ? (
                        <input
                          type="text"
                          value={cond.value || ""}
                          onChange={(e) =>
                            updateCondition(index, "value", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          disabled={readOnly}
                          placeholder="Enter expected value..."
                          className="w-full  text-[11px] text-black  bg-transparent border-none outline-none px-2 placeholder:text-slate-300 disabled:cursor-default"
                        />
                      ) : (
                        <>
                          <select
                            value={cond.compareFieldId || ""}
                            onChange={(e) =>
                              updateCondition(
                                index,
                                "compareFieldId",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            disabled={readOnly}
                            className="w-full  text-[11px] text-indigo-600 font-medium bg-transparent border-none outline-none  pl-2 pr-6 cursor-pointer disabled:cursor-default"
                          >
                            <option value="">Select Comparison Field...</option>
                            {fieldOptions?.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label || f.name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
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
              removeCondition(contextMenu.index);
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
              removeAllConditions();
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
