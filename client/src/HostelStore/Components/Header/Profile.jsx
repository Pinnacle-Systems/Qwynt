import { LogOut } from 'lucide-react'
import Modal from '../../../UiComponents/Modal';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import useOutsideClick from '../../../CustomHooks/handleOutsideClick';
import { useState } from 'react';
import Logout from '../../../Basic/components/LogoutConfirm';

const Profile = ({ dp, setProfile, items = [], setLogout, logout }) => {



    const toggleNavMenu = () => {
        setProfile(false);
    };

    const dispatch = useDispatch()


    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);

    console.log("items", items, secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentPage"))



    return (
        <div className="absolute right-0 top-10 w-60 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden transition-all duration-200 ease-in-out transform origin-top-right">
            <div className="flex flex-col">
                {/* Header section with User Info */}
                <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 bg-white">
                        <img className="h-full w-full object-cover" src={dp} alt="User avatar" />
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate tracking-tight">
                            {secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "username")}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                            {singleData?.data?.email || "User Account"}
                        </p>
                    </div>
                </div>

                {/* Navigation items */}
                <div className="p-1.5 flex flex-col gap-0.5 max-h-56 overflow-y-auto">
                    <button
                        onClick={() => {
                            dispatch(push({ id: 1000000, name: "ACCOUNT SETTINGS" }));
                            setProfile(true);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-semibold text-slate-700 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                    >
                        Account Settings
                    </button>
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                dispatch(push({ id: item.id, name: item.name }));
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "currentPage",
                                    item.id
                                );
                                setProfile(true);
                            }}
                            className="w-full text-left px-2.5 py-2 text-xs font-medium text-slate-600 rounded-md hover:bg-slate-100 transition-colors truncate"
                        >
                            <span className="capitalize">{typeof item.name === 'string' ? item.name.toLowerCase() : item.name}</span>
                        </button>
                    ))}
                </div>

                {/* Footer section with Logout */}
                <div className="p-1.5 border-t border-slate-100 bg-slate-50">
                    <button
                        type="button"
                        onClick={() => {
                            setLogout(true);
                            setProfile(true);
                        }}
                        className="w-full flex items-center px-2.5 py-2 text-xs font-bold text-rose-600 rounded-md hover:bg-rose-100 transition-colors"
                    >
                        <LogOut className="mr-2" size={14} strokeWidth={2.5} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile
