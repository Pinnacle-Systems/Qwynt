import React, { useEffect, useState } from 'react';
import { PLUS } from '../../../icons';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { useGetPurchaseBillByIdQuery } from '../../../redux/services/PurchaseBillService';
import { useGetSalesBillByIdQuery } from '../../../redux/services/SalesBillService';
import { findFromList } from '../../../Utils/helper';

const PurchaseBillFillGrid = ({ poReturnItems, setPoReturnItems, setPurchaseBillItems, purchaseBillItems, setPurchaseBillFillGrid, id, onDone }) => {

    console.log(poReturnItems, 'poReturnItems');
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productBrandList } =
        useGetProductBrandQuery({ params });


    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetSalesBillByIdQuery(id, { skip: !id });
    const { data: productList } = useGetProductQuery({ params });

    function getProductUomPriceDetails(productId) {
        const items = findFromList(productId, productList?.data ? productList?.data : [], "ProductUomPriceDetails")
        return items ? items : []
    }

    useEffect(() => {
        setPurchaseBillItems(prev => {

            let newItem = structuredClone(prev)
            newItem = singleData?.data?.SalesBillItems
            return newItem
        })
    }, [singleData, setPurchaseBillItems, isSingleFetching, isSingleLoading, id])

    function deleteItem(id) {
        setPoReturnItems(prev => {
            return prev.filter(item => parseInt(item.salesBillItemsId) !== parseInt(id))
        })
    }

    function addItem(id) {
        singleData?.data?.SalesBillItems.forEach(element => {
            console.log(singleData, 'singleData');
            if (parseInt(id) == parseInt(element.id)) {


                setPoReturnItems(prev => {
                    let newItem = structuredClone(prev)
                    newItem.push({
                        salesBillItemsId: id,
                        productId: element.productId,
                        uomId: element.uomId,
                        Product: {
                            name: element.Product.name,
                            
                        },
                        salesQty: element.qty,
                        alreadyReturnQty: element.alreadyReturnQty
                    })

                    return newItem

                })
            }
        });

    }
     console.log(purchaseBillItems,"purchaseBillItems")


    const isItemSelected = (id) => {
        let foundIndex = poReturnItems.findIndex(item => parseInt(item.salesBillItemsId) === parseInt(id))

        return foundIndex !== -1
    }

    const handleChange = (id) => {
        if (isItemSelected(id)) {
            deleteItem(id)
        } else {
            addItem(id)
        }
    }



    if (!singleData || isSingleFetching || isSingleLoading) return <Loader />

    return (
        <>

            <div className={` relative w-full overflow-y-auto py-1`}>
                <div className='flex justify-between mb-2'>
                    <h1 className='text-center mx-auto font-bold'>Sales Bill Items</h1>
                    <button className='text-center font-bold bg-green-400 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
                </div>
                <table className=" border border-gray-500 text-xs table-auto  w-full">
                    <thead className='bg-green-300 top-0 border-b border-gray-500'>
                        <tr className=''>
                            <th className="table-data w-10"></th>

                            <th className="table-data ">Product Name<span className="text-red-500 p-5">*</span></th>

                            <th className="table-data  w-20">Qty<span className="text-red-500 p-0.5">*</span></th>
                            <th className="table-data  w-16">Price<span className="text-red-500 p-0.5">*</span></th>
                            <th className="table-data  w-16 p-0.5">Amount</th>


                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>{console.log(purchaseBillItems, "purchaseBillItems")}


                        {(purchaseBillItems ? purchaseBillItems : []).map((item, index) =>

                            <tr key={index} className="w-full table-row" onClick={() => { handleChange(item.id) }}>{console.log(purchaseBillItems, 'purchase bill items')}
                                <td className="table-data flex justify-items-center items-center ">
                                    <input type='checkbox' checked={isItemSelected(item.id)} />
                                </td>
                                <td className="table-data w-2 text-left px-1 py-1">
                                    {item.Product.name}
                                </td>

                                <td className='table-data text-right pr-1'>
                                    {item?.qty}

                                </td>
                                <td className='table-data text-right pr-1'>
                                    {item?.price ? item.price : 0.000}

                                </td>



                                <td className='table-data text-right pr-1'>
                                    {(!item.qty || !item.price) ? 0 : (parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)}

                                </td>

                            </tr>
                        )}


                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PurchaseBillFillGrid