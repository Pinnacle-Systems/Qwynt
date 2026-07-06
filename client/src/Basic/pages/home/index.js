import React, { useState } from "react";
import { AppHeader, AppFooter, Dashboard } from "../../components";
import Modal from "../../../UiComponents/Modal";
import { BranchAndFinyearForm, LogoutConfirm } from "../../components";
import ActiveTabList from "../../components/ActiveTabList";
import secureLocalStorage from "react-secure-storage";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Sidebar from "../../components/sidebar";
import Header from "../../../HostelStore/Components/Header";
import { useSelector } from "react-redux";

const Home = () => {
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const isSuperAdmin = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "superAdmin",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const openTabs = useSelector((state) => state.openTabs);

  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>
      <Modal
        isOpen={logout}
        onClose={() => {
          setLogout(false);
        }}
        widthClass={""}
      >
        <LogoutConfirm setLogout={setLogout} />
      </Modal>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ backgroundColor: "#F1F1F0" }}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {isSuperAdmin ? (
            <>
              <SuperAdminHeader
                setIsGlobalOpen={setIsGlobalOpen}
                setLogout={setLogout}
              />
              <div className="p-1 bg-gray-100">
                <ActiveTabList />
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0">
                <Header profile={profile} setProfile={setProfile} />
              </div>
              <div className="shrink-0 h-[42px]" />

              <div className="p-1 flex-1 min-h-0 overflow-hidden">
                <ActiveTabList />
              </div>

              <Sidebar
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isMainDropdownOpen={isMainDropdownOpen}
                setIsMainDropdownOpen={setIsMainDropdownOpen}
              />
              {openTabs.tabs.length === 0 && (
                <Dashboard setProfile={setProfile} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default Home;
