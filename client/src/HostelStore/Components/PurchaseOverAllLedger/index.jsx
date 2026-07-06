import React from 'react'
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService'
import { useState } from 'react';
import { VIEW } from '../../../icons';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';

const PartyOverAllLedger = () => {
    const [searchPartyName, setSearchPartyName] = useState('');
    const { data } = useGetPartyQuery({ params: { isPartyPurchaseOverAllReport: true, searchValue: searchPartyName } });
    const partyList = data?.data || [];
    const dispatch = useDispatch();
    return (
        <div className={` relative w-full overflow-y-auto mx-auto py-1`}>
            <table className=" border border-gray-500 text-sm table-auto w-[80%] mx-auto">
                <thead className='top-0'>
                    <tr className='page-heading text-white'>
                        <th className="table-data w-2 text-center p-0.5">S.no</th>
                        <th className="table-data w-44">
                            <div className='grid'>
                                <span>Party</span>
                                <input type="text" className='focus:outline-none rounded-md text-gray-700' value={searchPartyName}
                                    onChange={(e) => { setSearchPartyName(e.target.value) }} />
                            </div>
                        </th>
                        <th className="table-data w-5"> Purchase Value</th>
                        <th className="table-data w-5">Payment Value</th>
                        <th className="table-data w-5">Balance</th>
                        <th className="table-data w-5">View</th>
                    </tr>
                </thead>
                <tbody className='overflow-y-auto h-full w-full'>
                    {partyList.map((party, index) =>
                        <tr className="w-full table-row p-1">
                            <td className="table-data text-center px-1 py-1">
                                {index + 1}
                            </td>
                            <td className="table-data text-left px-1 py-1">
                                {party.name}
                            </td>
                            <td className="table-data">
                                <div className='flex items-center justify-center'>
                                    {party?.purchaseAmount}
                                </div>
                            </td>
                            <td className="table-data">
                                <div className='flex items-center justify-center'>
                                    {party?.paymentAmount}
                                </div>
                            </td>
                            <td className="table-data">
                                <div className='flex items-center justify-center'>
                                    {party?.balance}
                                </div>
                            </td>
                            <td className="table-data">
                                <div className='flex items-center justify-center' onClick={() => {
                                    dispatch(push({
                                        name: "PURCHASE LEDGER",
                                        previewId: party.id
                                    }))
                                }}>
                                    {VIEW}
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default PartyOverAllLedger
