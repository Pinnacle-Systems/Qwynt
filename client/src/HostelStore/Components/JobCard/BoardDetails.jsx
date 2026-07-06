import { useEffect, useState } from "react";
import { Gsm, ProcessMaster, Size } from "..";
import { FxSelectWithAdd } from "../../../Inputs";
import Swal from "sweetalert2";
import { useLazyGetBoardQtyQuery } from "../../../redux/services/StockService";
import { params } from "../../../Utils/helper";
const DEFAULT_ROW_COUNT = 2;

export const emptyRow = () => ({
  processId: "",
  gsmId: "",
  fullBoardId: "",
  stockQty: "",
  noOfSheets: "",
});

const BoardDetails = ({
  boardOptions,
  boardItems,
  setBoardItems,
  boardList,
  sizeList,
  gsmList,
  readOnly,
  id,
  isDisabledPermission,
  isCuttingLocked,
  childRecord,
  storeId,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [triggerGetBoardQty] = useLazyGetBoardQtyQuery();

  const handleInputChange = async (value, index, field) => {
    const updatedRow = {
      ...boardItems[index],
      [field]: value,
    };

    const rows = [...boardItems];
    rows[index] = updatedRow;
    setBoardItems(rows);

    if (field === "fullBoardId" && value) {
      try {
        const response = await triggerGetBoardQty({
          params: {
            processId: updatedRow.processId,
            storeId: storeId,
            gsmId: updatedRow.gsmId,
            sizeId: value,
          },
        }).unwrap();
        if (response.statusCode === 404) {
          Swal.fire({
            icon: "error",
            title: "Not found",
            text: response.message,
          });
          return;
        }
        setBoardItems((prev) => {
          const newRows = [...prev];
          newRows[index] = {
            ...newRows[index],
            stockQty: response?.stockQty || 0,
          };
          return newRows;
        });
      } catch (error) {
        console.error("Board Qty fetch failed", error);
      }
    }
  };

  useEffect(() => {
    if (!Array.isArray(boardItems)) {
      setBoardItems(Array.from({ length: DEFAULT_ROW_COUNT }, emptyRow));
      return;
    }
    if (boardItems.length < DEFAULT_ROW_COUNT) {
      const toAdd = DEFAULT_ROW_COUNT - boardItems.length;
      setBoardItems((prev) => [
        ...prev,
        ...Array.from({ length: toAdd }, emptyRow),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRow = (idx) => {
    setBoardItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Pad back up to DEFAULT_ROW_COUNT if we fall below
      while (next.length < DEFAULT_ROW_COUNT) {
        next.push(emptyRow());
      }
      return next;
    });
  };

  const deleteAll = () => {
    setBoardItems(Array.from({ length: DEFAULT_ROW_COUNT }, emptyRow));
  };

  const handleRightClick = (e, rowIndex) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, rowId: rowIndex });
  };

  return (
    <>
      <div className="overflow-y-auto">
        <table className="w-full border-separate border-spacing-0 border-t border-l border-slate-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="sticky top-0 z-20 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase w-4">
                S.No
              </th>
              <th className="sticky top-0 z-20 border-b border-r border-slate-200 w-24 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                Board Quality
              </th>
              <th className="sticky top-0 z-20  border-b border-r border-slate-200 w-12 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                Gsm
              </th>
              <th className="sticky top-0 z-20  border-b border-r border-slate-200 w-16 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                Full Board
              </th>
              <th className="sticky top-0 z-20 border-b border-r border-slate-200 w-12 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                Stk Qty
              </th>
              <th className="sticky top-0 z-20  border-b border-r border-slate-200 w-12 px-1 py-1 text-center text-[11px] font-bold text-slate-700 uppercase">
                No. Of Sheets
              </th>
            </tr>
          </thead>
          <tbody>
            {boardItems?.map((item, idx) => (
              <tr
                key={idx}
                className="h-8 hover:bg-slate-50 transition-colors"
                onContextMenu={(e) => {
                  if (!readOnly) handleRightClick(e, idx);
                }}
              >
                <td className="border border-slate-200 px-1 py-0 text-center text-[11px] text-black">
                  {idx + 1}
                </td>
                <td
                  className="border  text-[11px] align-top pt-1"
                  //   rowSpan={rowSpan}
                >
                  <FxSelectWithAdd
                    value={item.processId}
                    onChange={(val) => handleInputChange(val, idx, "processId")}
                    options={(boardList || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || childRecord?.current > 0}
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(item.processId, idx, "processId")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Delete")
                        handleInputChange("", idx, "processId");
                    }}
                    addNew={true}
                    childComponent={ProcessMaster}
                    addNewModalWidth="w-[38%] h-[50%]"
                  />
                </td>
                <td
                  className="border text-[11px] align-top pt-1"
                  //   rowSpan={rowSpan}
                >
                  <FxSelectWithAdd
                    value={item.gsmId}
                    onChange={(val) => handleInputChange(val, idx, "gsmId")}
                    options={(gsmList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={
                      readOnly || childRecord?.current > 0 || !item.processId
                    }
                    placeholder=""
                    onBlur={() => handleInputChange(item.gsmId, idx, "gsmId")}
                    onKeyDown={(e) => {
                      if (e.key === "Delete")
                        handleInputChange("", idx, "gsmId");
                    }}
                    addNew={true}
                    childComponent={Gsm}
                    addNewModalWidth="w-[38%] h-[50%]"
                  />
                </td>
                <td
                  className="border  text-[11px] align-top pt-1"
                  //   rowSpan={rowSpan}
                >
                  <FxSelectWithAdd
                    value={item.fullBoardId}
                    onChange={(val) =>
                      handleInputChange(val, idx, "fullBoardId")
                    }
                    options={(sizeList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={
                      readOnly ||
                      childRecord?.current > 0 ||
                      !item.processId ||
                      !item.gsmId
                    }
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(item.fullBoardId, idx, "fullBoardId")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Delete")
                        handleInputChange("", idx, "fullBoardId");
                    }}
                    addNew={true}
                    childComponent={Size}
                    addNewModalWidth="w-[38%] h-[50%]"
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0">
                  <input
                    type="number"
                    className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                    value={item.stockQty}
                    disabled={true}
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0">
                  <input
                    type="number"
                    className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                    value={item.noOfSheets}
                    readOnly={readOnly}
                    onChange={(e) =>
                      handleInputChange(e.target.value, idx, "noOfSheets")
                    }
                    onBlur={() => {
                      const maxQty = Number(item?.stockQty || 0);
                      const sheets = Number(item?.noOfSheets || 0);

                      if (sheets > maxQty) {
                        Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No. of sheets cannot be greater than stock quantity",
                        });

                        handleInputChange("", idx, "noOfSheets");
                        return;
                      }

                      handleInputChange(item.noOfSheets, idx, "noOfSheets");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Delete")
                        handleInputChange("", idx, "noOfSheets");
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: `${contextMenu.mouseY - 20}px`,
            left: `${contextMenu.mouseX + 20}px`,
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
          className="bg-gray-100"
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="flex flex-col gap-1">
            <button
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={() => {
                deleteRow(contextMenu.rowId);
                setContextMenu(null);
              }}
            >
              Delete Row
            </button>
            <button
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={() => {
                deleteAll();
                setContextMenu(null);
              }}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardDetails;
