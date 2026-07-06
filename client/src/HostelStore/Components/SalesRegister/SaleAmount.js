import React from 'react'
import { useGetSalesBillByIdQuery } from '../../../redux/services/SalesBillService';

const SaleAmount = ({ id }) => {
  const { data: singleData } = useGetSalesBillByIdQuery(id, { skip: !id });

  let saleAmount = 0;

  let data = singleData?.data?.SalesBillItems ? singleData?.data?.SalesBillItems : []

  for (const obj of data) {
    saleAmount += (obj.qty) * (obj.salePrice);
  }

  return (
    <>
      {parseFloat(saleAmount).toFixed(2)}
    </>
  )
}

export default SaleAmount