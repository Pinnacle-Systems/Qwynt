import React, { useEffect, useState } from 'react'
import { TextInput } from '../../../Inputs';
import { GenerateButton } from '../../../Buttons';
import Modal from '../../../UiComponents/Modal';
import tw from '../../../Utils/tailwind-react-pdf';
import { PDFViewer } from '@react-pdf/renderer';
import LedgerReportPrintFormatcus from './PrintFormat';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import PartyDropdownSearch from '../PaymentDetail/PartyDropdownSearch';

const Ledger = () => {
    const openTabs = useSelector((state) => state.openTabs);

    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    const [partyId, setPartyId] = useState('');
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const { data } = useGetPartyQuery({ params: { isPartyLedgerReportCus: true, partyId, startDate, endDate } }, { skip: !partyId || !startDate || !endDate });
    const ledgerData = data?.data;
    const dispatch = useDispatch();

    useEffect(() => {   
        const currentTabPreviewId = openTabs.tabs.find(i => i.name === "PURCHASE LEDGER")?.previewId;
        if (!currentTabPreviewId) return;
        setPartyId(currentTabPreviewId);
        dispatch(push({
            name: "PURCHASE LEDGER",
            previewId: null
        })); 
    }, [openTabs, dispatch]);

    return (
        <>
            <Modal isOpen={printModalOpen} onClose={() => setPrintModalOpen(false)} widthClass={"w-[90%] h-[90%]"}>
                <PDFViewer style={tw("w-full h-full")}>
                    <LedgerReportPrintFormatcus ledgerData={ledgerData} startDate={startDate} endDate={endDate} />
                </PDFViewer>
            </Modal>
            <div id='registrationFormReport' className="flex flex-col w-full h-[95%]">
                <div className="md:flex md:items-center md:justify-between page-heading p-1">
                    <div className="heading text-center md:mx-10">Purchase Party Ledger</div>
                </div>
                <fieldset className='frame my-1'>
                    <legend className='sub-heading'>Parameters</legend>
                    <div className='grid grid-cols-5 my-2'>
                        <div className='col-span-2'>
                            <PartyDropdownSearch
                                name={"Supplier"} selected={partyId} setSelected={setPartyId} />
                        </div>
                        <TextInput name="Start.Date" value={startDate} setValue={setStartDate} type={"Date"} required={true} />
                        <TextInput name="End.Date" value={endDate} setValue={setEndDate} type={"Date"} required={true} />
                        <GenerateButton color='text-green-500' onClick={() => {
                            if (!partyId) return toast.info("Select Party...!!!");
                            if (!startDate) return toast.info("Select Start Date...!!!");
                            if (!endDate) return toast.info("Select End Date...!!!");
                            setPrintModalOpen(true);
                        }} />
                    </div>
                </fieldset>
            </div>
        </>
    );
};

export default Ledger;
