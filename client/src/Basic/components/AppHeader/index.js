import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";

import { MastersDropDown } from "../MasterDropDown";
import AccountDetailsDropDown from "../AccountDetailsDropdown";
import { APP_NAME } from "../../../Strings";
import { ROLES_API, PAGES_API } from "../../../Api";
import { CloseButtonOnly, SearchButton } from "../../../Buttons";
import { latestExpireDateWithinNDays } from "../../../Utils/helper";
import { GLOBE_ICON } from "../../../icons";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import MultiLevelDropDown from "../../../UiComponents/MultiSelectDropDown";
import useLogout, { socket } from "../../../CustomHooks/useLogout";

import Anugraha from "../../../assets/gwynt_logo.png";
import { Dropdown } from "react-multi-select-component";
import PageSearch from "./PageSearch";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AppHeader = ({ setIsGlobalOpen, setLogout }) => {
  useLogout();
  const [hideNavBar, sethideNavBar] = useState(true);

  // Real-time approval notifications
  useEffect(() => {
    const handleApprovalNotification = (data) => {
      const msg = data.message || "Approval notification received";
      if (data.type === "APPROVAL_REQUIRED") {
        toast.info("\uD83D\uDD14 " + msg, {
          autoClose: 8000,
          position: "top-right",
        });
      } else if (data.type === "APPROVED") {
        toast.success("\u2705 " + msg, {
          autoClose: 6000,
          position: "top-right",
        });
      } else if (data.type === "REJECTED") {
        toast.error("\u274C " + msg, {
          autoClose: 6000,
          position: "top-right",
        });
      } else {
        toast.info(msg, { autoClose: 5000 });
      }
    };
    socket.on("approval_notification", handleApprovalNotification);
    return () => {
      socket.off("approval_notification", handleApprovalNotification);
    };
  }, []);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  console.log("alowed Pages", allowedPages);

  const {
    data: pageGroup,
    isLoading,
    isFetching,
  } = useGetPageGroupQuery({ searchParams: "" });

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };

  // const defaultAdmin = JSON.parse(
  //   secureLocalStorage.getItem(
  //     sessionStorage.getItem("sessionId") + "defaultAdmin"
  //   )
  // );

  const retrieveAllowedPages = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin",
        ),
      )
    ) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
      }).then(
        (result) => {
          console.log("result", result.data.data);
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        },
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId",
          )}`,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read,
                ).map((page) => {
                  return {
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId,
                  };
                }),
              );
            }
          } else {
            console.log(result);
          }
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        },
      );
    }
  }, []);
  useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
  const hideExpireWarning = () => {
    let expireWarningDiv = document.getElementById("expireWarning");
    expireWarningDiv.style.display = "none";
  };
  function findElement(id, arr) {
    if (!arr) return "";
    let data = arr.find((item) => parseInt(item.id) === parseInt(id));
    return data ? data.name : "";
  }
  const masters = allowedPages.filter((page) => page.type === "Masters");
  const mastersGroup = [
    ...new Set(masters.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });
  const transactions = allowedPages.filter(
    (page) => page.type === "Transactions",
  );
  const transactionsGroup = [
    ...new Set(transactions.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });
  const reports = allowedPages.filter((page) => page.type === "Reports");
  const reportGroups = [
    ...new Set(reports.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });

  return (
    <div className="relative">
      <nav className="nav-bar-bg flex md:items-center flex-wrap p-">
        <div className="logo-heading flex flex-shrink-0 mr-6 break-words">
          <div className="flex bg-white rounded px-1 m-1 text-black items-end text-2xl">
            <img src={Anugraha} className="h-12 w-20 rounded-xl" />
            {/* <span className="flex font-semibold break-words">{APP_NAME} </span> */}
          </div>
        </div>
        <div className="block lg:hidden justify-items-start">
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-3 py-2 button-border"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title className="text-white">Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div className="flex-grow flex items-center lg:w-auto">
          <div className="nav-item flex-grow">
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown
                heading={"Masters"}
                groups={mastersGroup}
                pages={masters}
              />
            </div>
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown
                heading={"Transactions"}
                groups={transactionsGroup}
                pages={transactions}
              />
            </div>
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown
                heading={"Reports"}
                groups={reportGroups}
                pages={reports}
              />
            </div>
          </div>
          <div className="nav-item flex justify-between gap-3 items-center">
            <PageSearch pageList={allowedPages} />
            <div
              className="text-lg"
              onClick={() => {
                setIsGlobalOpen(true);
              }}
            >
              {GLOBE_ICON}
            </div>
            <div className="flex">
              {" "}
              <p>WELCOME</p> &nbsp;{" "}
              <pre>
                {" "}
                {secureLocalStorage.getItem(
                  sessionStorage.getItem("sessionId") + "username",
                )}
              </pre>
            </div>
            <AccountDetailsDropDown
              setLogout={setLogout}
              items={allowedPages.filter((page) => page.type === "AdminAccess")}
            />
          </div>
        </div>
      </nav>
      <div
        id="expireWarning"
        className={
          latestExpireDateWithinNDays()
            ? "bg-yellow-600 justify-center  text-black gap-1 items-center block"
            : "bg-yellow-600 justify-center  text-black gap-1 items-center hidden"
        }
      >
        <p>
          {" "}
          Your Subscription Plan will Expire on{" "}
          {secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "latestActivePlanExpireDate",
          )}
          .{" "}
        </p>
        <span className="">
          <CloseButtonOnly onClick={hideExpireWarning} />
        </span>
      </div>
    </div>
  );
};

export default AppHeader;
