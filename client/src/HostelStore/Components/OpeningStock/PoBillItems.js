import React, { useEffect } from "react";
import { useGetProductQuery } from "../../../redux/services/ProductMasterService";
import secureLocalStorage from "react-secure-storage";
import { findFromList } from "../../../Utils/helper";
import { DELETE, PLUS } from "../../../icons";
import { DropdownWithSearch } from "../../../Inputs";
import { Loader } from "../../../Basic/components";

const PoBillItems = ({ id, readOnly, setPoBillItems, poBillItems }) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: productList, isLoading } = useGetProductQuery({ params });

  useEffect(() => {
    if (poBillItems.length >= 10) return;
    setPoBillItems((prev) => {
      const newArray = Array.from({ length: 10 - prev.length }, () => ({
        productCategoryId: "",
        productBrandId: "",
        productId: "",
        qty: "0",
        price: "0.00",
        salePrice: "0.00",
        amount: "0.000",
      }));
      return [...prev, ...newArray];
    });
  }, [setPoBillItems, poBillItems.length]);

  const handleInputChange = (value, index, field) => {
    const newBlend = [...poBillItems];
    
    const updatedItem = { ...newBlend[index] };
    
    updatedItem[field] = value;
    
    if (field === "uomId") {
      const productId = updatedItem["productId"];
      const priceDetails = getProductUomPriceDetails(productId).find(
        (i) => parseInt(i.uomId) === parseInt(value)
      );
      updatedItem["price"] = priceDetails?.price || 0;
    }
    
    newBlend[index] = updatedItem;
    
    setPoBillItems(newBlend);
  };
  

  const deleteRow = (index) => {
    setPoBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewRow = () => {
    setPoBillItems((prev) => [
      ...prev,
      {
        productId: "",
        stockQty: "0",
        qty: "0",
        price: "0.00",
        amount: "0.000",
        salePrice: "0.00",
      },
    ]);
  };
  console.log(productList,"productList")

  const getProductUomPriceDetails = (productId) => {
    const items = findFromList(
      productId,
      productList?.data || [],
      "ProductUomPriceDetails"
    );
    return items || [];
  };

  const getTotal = (field1, field2) => {
    return poBillItems
      .reduce((acc, curr) => {
        return (
          acc + parseFloat(curr[field1] || 0) * parseFloat(curr[field2] || 0)
        );
      }, 0)
      .toFixed(2);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="relative w-full overflow-y-auto py-1">
      <table className="table border border-gray-500 text-xs table-auto w-full">
        <thead className="bg-emerald-800 text-white font-thin tracking-wider text-sm top-0 border-b border-gray-500">
          <tr>
            <th className="table-data w-2 text-center p-2">S.no</th>
            <th className="table-data">
              Product Name<span className="text-red-500 p-5">*</span>
            </th>
            <th className="table-data">
              No of Box<span className="text-red-500 p-5">*</span>
            </th>
            <th className="table-data">
              Qty<span className="text-red-500 p-0.5">*</span>
            </th>
            <th className="table-data p-0.5">
              <button onClick={addNewRow}>{PLUS}</button>
            </th>
          </tr>
        </thead>
        <tbody className="overflow-y-auto h-full w-full">
          {poBillItems.map((item, index) => (
            <tr key={index} className="w-full table-row">
              <td className="table-data w-2 text-left px-1 py-1">
                {index + 1}
              </td>
              <td className="table-data">
               {readOnly ? findFromList(item.productId,productList.data,"name"): <DropdownWithSearch
                  value={item.productId           
                  }
                  readOnly={readOnly}
                  setValue={(value) =>
                    handleInputChange(value, index, "productId")
                  }
                  options={productList?.data?.filter((item) => item.active)}
                /> } 
              </td>
              <td className="table-data w-44">
                <input
                  type="number"
                  className="text-right rounded py-1 px-1 w-full table-data-input"
                  onFocus={(e) => e.target.select()}
                  value={item.box || ""}
                  disabled={readOnly}
                  onChange={(e) =>
                    handleInputChange(e.target.value, index, "box")
                  }
                  onBlur={(e) =>
                    handleInputChange(parseFloat(e.target.value), index, "box")
                  }
                />
              </td>
              <td className="table-data w-44">
                <input
                  type="number"
                  className="text-right rounded py-1 px-1 w-full table-data-input"
                  onFocus={(e) => e.target.select()}
                  value={item.qty || ""}
                  disabled={readOnly}
                  onChange={(e) =>
                    handleInputChange(e.target.value, index, "qty")
                  }
                  onBlur={(e) =>
                    handleInputChange(
                      parseFloat(e.target.value).toFixed(2),
                      index,
                      "qty"
                    )
                  }
                />
              </td>
           
              <td className="border border-gray-500 text-xs text-center">
                <button
                  type="button"
                  onClick={() => deleteRow(index)}
                  className="text-xs text-red-600"
                >
                  {DELETE}
                </button>
              </td>
            </tr>
          ))}
      
        </tbody>
      </table>
    </div>
  );
}; 

export default PoBillItems;
