import React from 'react'
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService'
import { useState } from 'react';
import { VIEW } from '../../../icons';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { DateInput } from '../../../Inputs';
import moment from 'moment';

const PartyOverAllLedger = () => {
    const [searchPartyName, setSearchPartyName] = useState('');
    const [startDate, setStartDate] = useState(moment(new Date()).format("YYYY-MM-DD"));

    const { data } = useGetPartyQuery({
        params:
        {
            isPartyOverAllReport: true,
            searchValue: searchPartyName,
            startDate: startDate,isAddessCombined: true
        }
    });
    const partyList = data?.data || [];

    console.log(partyList, "partyList");

    const dispatch = useDispatch();
    return (
        <>
            <div className='grid grid-cols-9 py-2'>
                <div className='col-span-4'>

                </div>
                <div>
                    <DateInput
                        inputHead="font-bold text-sm"
                        name="Date : "
                        value={startDate}
                        setValue={setStartDate}
                    />
                </div>

            </div>
            <div className={` relative w-full overflow-y-auto mx-auto py-1`}>


                <table className=" border border-gray-500 text-sm table-auto w-[80%] mx-auto">
                    <thead className='top-0'>
                        <tr className='bg-gray-700 text-white'>
                            <th className="table-data w-2 text-center p-0.5">S.no</th>
                            <th className="table-data w-44">
                                <div className='grid'>
                                    <span>Party</span>
                                    <input type="text" className='focus:outline-none rounded-md text-gray-700' value={searchPartyName}
                                        onChange={(e) => { setSearchPartyName(e.target.value) }} />
                                </div>
                            </th>
                            {/* <th className="table-data w-5">Sales Value</th> */}
                            {/* <th className="table-data w-5">Payment Value</th> */}
                            <th className="table-data w-5">Outstanding Balance</th>
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
                                {/* <td className="table-data">
                                <div className='flex items-center justify-center'>
                                    {party?.ledgerAmount}
                                </div>
                            </td> */}
                                {/* <td className="table-data">
                                <div className='flex items-center justify-center'>
                                    {party?.paidAmount}
                                </div>
                            </td> */}
                                <td className="table-data">
                                    <div className='flex items-center justify-center'>
                                        {/* {party?.outstandingAmount  ?  parseFloat(party?.outstandingAmount).toFixed(2)  : (0.000.toFixed(2))} */}
                                        {Number(party?.outstandingAmount || 0).toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </div>
                                </td>
                                <td className="table-data">
                                    <div className='flex items-center justify-center' onClick={() => {
                                        dispatch(push({
                                            name: "CUSTOMER LEDGER",
                                            previewId: party.id,
                                            date: startDate
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
        </>

    )
}

export default PartyOverAllLedger
