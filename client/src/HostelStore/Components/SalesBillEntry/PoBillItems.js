import React, { useEffect, useState } from "react";
import { DELETE, PLUS } from "../../../icons";
import { useGetProductQuery } from "../../../redux/services/ProductMasterService";
import { useGetProductCategoryQuery } from "../../../redux/services/ProductCategoryServices";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetProductBrandQuery } from "../../../redux/services/ProductBrandService";
import { Loader } from "../../../Basic/components";
import secureLocalStorage from "react-secure-storage";
import StockItem from "./StockItem";
import { toast } from "react-toastify";

import { findFromList } from "../../../Utils/helper";
import SalesPrice from "./SalesPrice";
import { DropdownWithSearch } from "../../../Inputs";

const PoBillItems = ({
  id,
  readOnly,
  setPoBillItems,
  poBillItems,
  date,
  isOn
}) => {
  console.log(readOnly,"readOnlyt")
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: productBrandList } = useGetProductBrandQuery({ params });
  const [salePrice, setSalePrice] = useState("");

  const { data: supplierList } = useGetPartyQuery({ params });

  const { data: productCategoryList } = useGetProductCategoryQuery({ params });

  const { data: productList } = useGetProductQuery({ params });

  function handleInputChange(value, index, field, stockQty) {
    const newBlend = structuredClone(poBillItems);
    newBlend[index][field] = value;
    if (field === "qty") {
      if (parseFloat(stockQty) < parseFloat(value)) {
        toast.info("Sales Qty Can not be more than Stock Qty", {
          position: "top-center",
        });
        return;
      }
    }
    setPoBillItems(newBlend);
  }

  useEffect(() => {
    if (poBillItems.length >= 1) return;
    setPoBillItems((prev) => {
      let newArray = Array.from({ length: 1 - prev.length }, (i) => {
        return {
          productCategoryId: "",
          productBrandId: "",
          productId: "",
          stockQty: "0",
          qty: "0",
          price: "0.00",
          amount: "0.000",
        };
      });
      return [...prev, ...newArray];
    });
  }, [setPoBillItems, poBillItems]);

  function getTotal(field1, field2) {
    const total = poBillItems.reduce((accumulator, current) => {
      return (
        accumulator +
        parseFloat(
          current[field1] && current[field2]
            ? current[field1] * current[field2]
            : 0
        )
      );
    }, 0);
    return parseFloat(total);
  }

  if (!productBrandList || !productCategoryList || !productList)
    return <Loader />;
  function getProductUomPriceDetails(productId) {
    const items = findFromList(
      productId,
      productList?.data ? productList?.data : [],
      "ProductUomPriceDetails"
    );
    return items ? items : [];
  }

  const handleSalePriceChange = (value) => {
    setSalePrice(value);
  };

  function deleteRow(index) {
    setPoBillItems((prev) => prev.filter((_, i) => i !== index));
  }
  function addNewRow() {
    setPoBillItems((prev) => [
      ...prev,
      {
        productCategoryId: "",
        productBrandId: "",
        productId: "",
        stockQty: "0",
        qty: "0",
        price: "0.00",
        amount: "0.000",
      },
    ]);
  }
  return (
    <>
      <div className={` relative w-full overflow-y-auto py-1`}>
        <table className=" border border-gray-500 text-xs table-auto  w-full">
          <thead className="bg-emerald-800 p-1 text-white font-thin tracking-wider text-sm top-0 border-b border-gray-500">
            <tr className="">
              <th className="table-data  w-2 text-center p-0.5">S.no</th>
                          <th className="table-data ">
                Product Name<span className="text-red-500 p-0.5">*</span>
              </th>
           
              <th className="table-data  w-20">Stock.Qty</th>

              <th className="table-data  w-20">
                Qty<span className="text-red-500 p-0.5">*</span>
              </th>
              <th className="table-data  w-20">
                Price<span className="text-red-500 p-0.5">*</span>
              </th>

              <th className="table-data  w-16 p-0.5">Amount</th>
              <th className="table-data  w-16 p-0.5">Add Stock</th>

              {!readOnly && (
                <th className="table-data  w-16 p-0.5">
                  {" "}
                  <button className="text-2xl" onClick={addNewRow}>
                    +
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="overflow-y-auto h-full w-full">
            {(poBillItems ? poBillItems : []).map((item, index) => (
              <tr key={index} className="w-full  table-row">
                <td className="table-data w-2 text-left px-1 py-1">
                  {index + 1}
                </td>

                <td className="table-data">
                  {readOnly ? (
                    findFromList(item.productId, productList.data, "name")
                  ) : (
                    <DropdownWithSearch
                      value={item.productId}
                      readOnly={readOnly}
                      setValue={(value) =>
                        handleInputChange(value, index, "productId")
                      }
                      options={productList?.data?.filter((item) => item.active)}
                    />
                  )}
                </td>
                <SalesPrice
                  handleSalePriceChange={handleSalePriceChange}
                  id={item.id}
                  date={date}
                  item={item}
                  readOnly={readOnly}
                  productId={item.productId}
                  index={index}
                  setPoBillItems={setPoBillItems}
                  poBillItems={poBillItems}
                  uomId={item.uomId}
                  qty={item.qty}
                  isOn ={isOn}
                  
                />
                {!readOnly && (
                  <td className="border border-gray-500 text-xs text-center">
                    <button
                      type="button"
                      onClick={() => {
                        deleteRow(index);
                      }}
                      className="text-xs text-red-600 "
                    >
                      {DELETE}
                    </button>
                  </td>
                )}
              </tr>
            ))}
              <tr className="bg-emerald-800 text-sm font-thin text-white tracking-wider w-full border border-gray-400 h-7 font-bold">
            <td className="table-data text-center w-10 font-bold" colSpan={5}>
              Total
            </td>
            <td className="table-data text-right pr-1 w-10">
              {getTotal("qty", "price")}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PoBillItems;
