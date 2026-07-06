
export default function DeliveryItemsSelection({ transactionId, onClose, readOnly, tempInvoiceItems, invoiceItems, setInvoiceItems,


}) {



    function handleDone() {
        onClose()
    }



  const filledPoItems = [
    ...tempInvoiceItems,
    ...Array(Math.max(0, 15 - tempInvoiceItems.length)).fill({}), // empty rows
  ];


  console.log(filledPoItems,"filledPoItems",invoiceItems)




    function addItem(id, obj) {
        setInvoiceItems(prevItems => {
            if (prevItems.some(item => item.id == id)) {
                return prevItems;
            }

            const newItems = [...prevItems];

            const index = newItems.findIndex(item => item?.styleId == "");

            if (index !== -1) {
                newItems[index] = obj;
            } else {
                newItems.push(obj);
            }

            return newItems;
        });
    }

    function removeItem(id) {
        setInvoiceItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });
    }

    function handleChange(id, obj) {
        console.log(id, "iddddd")

        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function isItemAdded(id) {

        if (transactionId) {
            return invoiceItems?.findIndex(item => parseInt(item?.deliveryChallanId) == parseInt(id)) !== -1
        }
        else {
            return (invoiceItems)?.findIndex(item => parseInt(item?.id) == parseInt(id)) !== -1

        }

    }


    // function isItemAdded(id) {
    //     if (!id) return false;
    // console.log(transactionId,invoiceItems,"invoiceItemsinvoiceItems",id)

    //     if (transactionId) {
    //         return invoiceItems?.some(
    //             item => (item?.deliveryChallanItemsId) == (id)
    //         );
    //     }

    //     return invoiceItems?.some(
    //         item => (item?.id) == (id)
    //     );
    // }


    function handleSelectAllChange(value, invoiceItems) {

        console.log({ value }, 'value')
        if (value) {
            invoiceItems?.forEach(item => addItem(item.id, item))
        } else {
            invoiceItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(invoiceItems) {


        return invoiceItems?.every(item => isItemAdded(item.id));
    }






    return (

        <>

            <div className='border border-gray-200  shadow-sm bg-[#f1f1f0]'>
                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                            Delivey Challan Items
                        </h2>

                    </div>
                    <div className="flex gap-2">

                        <div className="flex gap-2">
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={handleDone}
                                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto rounded-md ">

                    <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full max-h-[450px]">

                        <div className="flex flex-row w-full">
                            <div className="flex flex-col w-full">
                                <div className="mt-4 mb-5 w-full">

                                    <div className=" w-full ">

                                        <table className="border-collapse w-full">
                                            <thead className="bg-gray-200 text-gray-800">
                                                <tr>
                                                    <th className=" px-2 py-1 text-center text-xs w-11">
                                                        <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempInvoiceItems ? tempInvoiceItems : [])}
                                                            checked={getSelectAll(tempInvoiceItems ? tempInvoiceItems : [])}
                                                        />
                                                    </th>
                                                    <th
                                                        className={`w-2 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        S.No
                                                    </th>
                                                    <th
                                                        className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Dc No
                                                    </th>
                                                    <th

                                                        className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Style No
                                                    </th>

                                                    <th

                                                        className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Item
                                                    </th>
                                                    <th

                                                        className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Color
                                                    </th>
                                                    <th

                                                        className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        No of Box
                                                    </th>

                                                    <th

                                                        className={`w-11 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        UOM
                                                    </th>
                                                    <th

                                                        className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                                    >
                                                        Qty
                                                    </th>



                                                </tr>
                                            </thead>

                                            <tbody>

                                                {filledPoItems?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                                                            No data found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filledPoItems?.map((item, index) => (
                                                        <tr
                                                            key={index}
                                                            className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                                }`}
                                                            onClick={() => {
                                                                handleChange(item.id, item)
                                                                 
                                                            }}
                                                        >
                                                            <td className='py-1 text-center'>
                                                                <input type="checkbox" name="" id=""
                                                                    checked={isItemAdded(item.id, item)}
                                                                // disabled={(parseFloat(item?.requiredQty) || 0) - (parseFloat(item?.alreadyPoqty) || 0) === 0}
                                                                />
                                                            </td>
                                                            <td className=" border border-gray-300 px-2 py-1 text-center text-xs">
                                                                {index + 1}
                                                            </td>
                                                            <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                                {item?.DeliveryChallan?.docId}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Style?.name}
                                                            </td>


                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.StyleItem?.name}
                                                            </td>

                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Color?.name}
                                                            </td>
                                                            <td className=" border text-right border-gray-300 text-[11px] py-1.5 px-1">
                                                                {item?.noOfBox}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Uom?.name}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {item?.qty?.toFixed(3)}
                                                            </td>



                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}















