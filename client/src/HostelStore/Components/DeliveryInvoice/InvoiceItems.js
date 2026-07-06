import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { formatAmountIN } from "../../../Utils/helper";

const InvoiceItems = ({ supplierId, setTableDataView, setInvoiceItems, invoiceItems, readOnly,
    styleItemList, colorList,
    yarnList, id,
    uomList, customerRef }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")
    const [contextMenu, setContextMenu] = useState(null);


    useEffect(() => {
        if (invoiceItems?.length >= 6) return
        setInvoiceItems(prev => {
            let newArray = Array?.from({ length: 6 - prev?.length }, () => {
                return {
                    styleId: "",
                    styleItemId: "",
                    uomId: "",
                    noOfBox: "",
                    qty: "",
                    price: "",
                    colorId: "",
                    id: "",
                    invoiceQty: ""



                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setInvoiceItems, invoiceItems])


    const handleInputChange = (value, index, field,) => {



        const newBlend = structuredClone(invoiceItems);




        newBlend[index][field] = value;




        setInvoiceItems(newBlend);

    };







    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "0",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "0",
            discountValue: "0.00",
            noOfBags: 0,
            weightPerBag: 0,
        };
        setInvoiceItems([...invoiceItems, newRow]);
    };








    const handleDeleteRow = (id) => {
        setInvoiceItems((yarnBlend) => {
            if (yarnBlend.length <= 1) {
                return yarnBlend;
            }
            return yarnBlend.filter((_, index) => index !== parseInt(id));
        });
    };
    // const handleDeleteAllRows = () => {
    //     setInvoiceItems((prevRows) => {
    //         if (prevRows.length <= 1) return prevRows;
    //         return [prevRows[0]];
    //     });
    // };
    const handleDeleteAllRows = () => {
        setInvoiceItems([]);
    };


    const handleRightClick = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };
    return (

        <>
            <div className={` border border-slate-200 relative w-full overflow-y-auto  max-h-[380px] overflow-auto`}>
                <div className="flex justify-between items-center  p-1">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <button className="font-bold text-slate-700 bord"
                        ref={customerRef}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setTableDataView(true)

                            }
                        }}
                        disabled={id}
                        onClick={() => {
                            if (!supplierId) {
                                Swal.fire({
                                    icon: 'success',
                                    title: ` Choose Supplier`,
                                    showConfirmButton: false,
                                    timer: 2000
                                });
                            }
                            else {

                                setTableDataView(true)
                            }
                        }}
                    >
                        Fill DeliveryChallan Items
                    </button>


                </div>
                <div className="w-full max-h-[228px] overflow-y-auto mb-0">
                    <table className="w-full border-collapse table-fixed ">
                        <thead className="text-gray-800 bg-gray-200">
                            <tr>
                                <th className=" sticky top-0 z-10 bg-gray-200 w-12 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    S.No
                                </th>

                                <th className="sticky top-0  z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Dc No
                                </th>

                                <th className="sticky top-0 w-32 z-10 bg-gray-200 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Style No
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-44 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Item
                                </th>
                                <th className="sticky top-0 z-10 bg-gray-200 w-16 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Hsn
                                </th>
                                <th className="sticky top-0 z-10 bg-gray-200 w-44 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Color
                                </th>

                                <th className= "sticky top-0 z-10 bg-gray-200 w-16 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    No of Box
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-12 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    UOM
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Invoice Qty
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Balance Invoice Qty
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Qty <span className="text-red-500">*</span>
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Price <span className="text-red-500">*</span>
                                </th>

                                <th className="sticky top-0 z-10 bg-gray-200 w-20 px-4 py-2 text-center font-medium text-[13px] border border-gray-300">
                                    Gross Amount
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {(invoiceItems ? invoiceItems : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer "
                                    onContextMenu={(e) => {
                                        if (!readOnly) {
                                            handleRightClick(e, index, "shiftTimeHrs");
                                        }
                                    }}
                                >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 bg-gray-100">{index + 1}</td>

                                    <td className="py-0.5 border border-gray-300 text-[11px] bg-gray-100">
                                        {row?.DeliveryChallan?.docId}

                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] bg-gray-100">
                                        {row?.Style?.name}

                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] bg-gray-100">
                                        {row?.StyleItem?.name}
                                    </td>

                                    <td className="py-0.5 border border-gray-300 text-[11px] bg-gray-100">
                                        {row?.Hsn?.name}
                                    </td>
                                    <td className="p-0.5 w-12 border border-gray-300 text-[11px] py-0.5 bg-gray-100">
                                        {row?.Color?.name}
                                    </td>
                                    <td className="p-0.5 w-16 border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs bg-gray-100">
                                        {row.noOfBox}
                                    </td>









                                    <td className="p-0.5 w-12 border border-gray-300 text-[11px]  bg-gray-100">
                                        {row?.Uom?.name}
                                    </td>



                                    <td className="p-0.5 border border-gray-300 text-right text-[11px]  px-2 text-xs bg-gray-100">
                                        <input
                                            className=" rounded  w-full  text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={parseFloat(row?.qty).toFixed(3)}
                                            disabled={true}


                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}

                                            placeHolder="0.000"

                                            onChange={(e) => {
                                                const numVal = parseFloat(e.target.value) || 0;
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                handleInputChange(numVal, index, "qty", row.requiredQty, balanceQty);


                                            }}
                                            onBlur={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatted, index, "qty", row.requiredQty, balanceQty);
                                            }}

                                        />
                                    </td>


                                    <td className="p-0.5 w-12 border border-gray-300 text-[11px] py-0.5 bg-gray-100  text-right">
                                        {row.balanceQty ? parseFloat(row.balanceQty).toFixed(3) : ""}
                                    </td>

                                    <td className="p-0.5 border border-gray-300 bg-white text-right text-[11px] px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full  text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={row?.invoiceQty}
                                            disabled={!row.styleId}


                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}

                                            placeHolder="0.000"

                                            onChange={(e) => {
                                                const numVal = parseFloat(e.target.value) || 0;


                                                if (numVal > row.balanceQty) {
                                                    Swal.fire({
                                                        title: "Invoice quantity cannot be more than balance quantity",
                                                        icon: 'error',

                                                    });
                                                    return;
                                                }
                                                else {
                                                    handleInputChange(numVal, index, "invoiceQty", row.requiredQty,);

                                                }



                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                e.target.value = formatted;
                                                if (val > row.balanceQty) {
                                                    Swal.fire({
                                                        title: "Invalid Quantity",
                                                        text: "Invoice quantity cannot be more than balance quantity",
                                                        icon: "error",
                                                    });
                                                    return;
                                                }
                                                else {
                                                    handleInputChange(val === "" ? 0 : formatted, index, "invoiceQty", row.balanceQty);

                                                }
                                            }}

                                        />
                                    </td>
                                    <td className="p-0.5 border border-gray-300 bg-white text-right text-[11px]  px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={row?.price}
                                            disabled={!row.styleId}


                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}

                                            placeHolder="0.000"

                                            onChange={(e) => {
                                                const numVal = parseFloat(e.target.value) || 0;
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));

                                                handleInputChange(numVal, index, "price", row.requiredQty, balanceQty);


                                            }}
                                            onBlur={(e) => {
                                                const balanceQty = Math.max(0, (parseFloat(row?.requiredQty) || 0) - (parseFloat(row?.alreadyPoqty) || 0));
                                                const val = e.target.value;
                                                const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(2);
                                                e.target.value = formatted;
                                                handleInputChange(val === "" ? 0 : formatAmountIN(formatted), index, "price", row.requiredQty, balanceQty);
                                            }}

                                        />
                                    </td>

                                    <td className="p-0.5 border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        {formatAmountIN(parseFloat(parseFloat(row.invoiceQty || 0) * parseFloat(row.price || 0)).toFixed(2))}
                                    </td>








                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>

            </div>
            {contextMenu && (
                <div
                    style={{
                        position: "absolute",
                        top: `${contextMenu.mouseY - 50}px`,
                        left: `${contextMenu.mouseX - 30}px`,

                        // background: "gray",
                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                        padding: "8px",
                        borderRadius: "4px",
                        zIndex: 1000,
                    }}
                    className="bg-gray-100"
                    onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                >
                    <div className="flex flex-col gap-1">
                        <button
                            className=" text-black text-[12px] text-left rounded px-1"
                            onClick={() => {
                                handleDeleteRow(contextMenu.rowId);
                                handleCloseContextMenu();
                            }}
                        >
                            Delete{" "}
                        </button>
                        <button
                            className=" text-black text-[12px] text-left rounded px-1"
                            onClick={() => {
                                handleDeleteAllRows();
                                handleCloseContextMenu();
                            }}
                        >
                            Delete All
                        </button>
                    </div>
                </div>
            )}

        </>
    )
}

export default InvoiceItems;