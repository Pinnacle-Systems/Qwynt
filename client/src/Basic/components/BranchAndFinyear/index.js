import React, { useEffect, useState, useCallback, useRef } from "react";
import { BRANCHES_API, FIN_YEAR_API, USERS_API } from "../../../Api";
import {
  dropDownFinYear,
  dropDownListObject,
} from "../../../Utils/contructObject";
import { getData } from "../../../Utils/Apicalls";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { HOME_PATH } from "../../../Route/urlPaths";
import { toast } from "react-toastify";
import axios from "axios";
import useLogout from "../../../CustomHooks/useLogout";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const BranchAndFinYearForm = ({ setIsGlobalOpen }) => {
  useLogout();
  const branchRef = useRef(null);
  const finYearRef = useRef(null);
  const submitRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [currentFinYear, setcurrentFinYear] = useState(
    secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentFinYear",
    )
      ? secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "currentFinYear",
        )
      : "",
  );
  const [currentBranch, setCurrentBranch] = useState(
    secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId",
    )
      ? secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "currentBranchId",
        )
      : "",
  );

  const [finYears, setFinYears] = useState([]);
  const [branches, setBranches] = useState([]);

  const retrieveFinYearData = useCallback(
    () =>
      getData(FIN_YEAR_API, setFinYears, setLoading, {
        companyId: secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "userCompanyId",
        ),
      }),
    [],
  );
  useEffect(retrieveFinYearData, [retrieveFinYearData]);

  const retrieveBranchData = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin",
        ),
      )
    ) {
      getData(BRANCHES_API, setBranches, setLoading, {
        active: true,
        companyId: secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "userCompanyId",
        ),
      });
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          USERS_API +
          `/${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")}`,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setBranches(
                result?.data?.data?.UserOnBranch.map((branch) => {
                  return {
                    branchName: branch.Branch.branchName,
                    id: branch.Branch.id,
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
  useEffect(retrieveBranchData, [retrieveBranchData]);

  const navigate = useNavigate();

  const onSubmit = () => {
    if (!(currentBranch && currentFinYear)) {
      toast.info("Select Branch and Fin. Year", { position: "top-center" });
      return;
    }
    secureLocalStorage.setItem(
      sessionStorage.getItem("sessionId") + "currentBranchId",
      currentBranch,
    );
    secureLocalStorage.setItem(
      sessionStorage.getItem("sessionId") + "currentFinYear",
      currentFinYear,
    );
    secureLocalStorage.setItem(
      sessionStorage.getItem("sessionId") + "currentFinYearActive",
      isCurrentFinYearActive(),
    );
    navigate(HOME_PATH);
    window.location.reload();
  };

  const isCurrentFinYearActive = () => {
    return finYears.find((finYr) => finYr.id === parseInt(currentFinYear))
      .active;
  };

  return (
    <div className="w-[380px] max-w-full mx-auto bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden font-sans transform transition-all">
      <form
        className="w-full px-6 py-3 flex flex-col gap-5"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        {/* Seamless Header inside Form */}
        <div className="flex items-center gap-3.5 text-gray-900 border-b border-gray-100 pb-4">
          <div className="bg-black text-white p-2 rounded-lg shadow-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M3 10V5a2 2 0 012-2h14a2 2 0 012 2v5M3 10v9a2 2 0 002 2h14a2 2 0 002-2v-9M3 10h18M9 4v6M15 4v6"
              ></path>
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight">
              Session Details
            </h2>
            <p className="text-gray-500 text-[12px] mt-0.5 leading-none">
              Please select your working environment.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {/* Branch */}
          <div>
            <label
              className="block mb-1.5 text-[13px] font-semibold text-gray-700"
              htmlFor="branch"
            >
              Branch Location
            </label>
            <div className="relative">
              <select
                ref={branchRef}
                className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-md text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black appearance-none hover:border-gray-300 cursor-pointer shadow-sm"
                id="branch"
                name="branch"
                value={currentBranch}
                autoFocus={true}
                onChange={(e) => setCurrentBranch(e.target.value)}
              >
                <option value="" hidden>
                  Select branch...
                </option>
                {dropDownListObject(branches, "branchName", "id").map(
                  (branch) => (
                    <option key={branch.value} value={branch.value}>
                      {branch.show}
                    </option>
                  ),
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Financial Year */}
          <div>
            <label
              className="block mb-1.5 text-[13px] font-semibold text-gray-700"
              htmlFor="finyear"
            >
              Financial Year
            </label>
            <div className="relative">
              <select
                className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-md text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black appearance-none hover:border-gray-300 cursor-pointer shadow-sm"
                id="finyear"
                name="finyear"
                value={currentFinYear}
                onChange={(e) => setcurrentFinYear(e.target.value)}
                onBlur={() => {
                  if (currentFinYear) {
                    submitRef.current?.focus();
                  }
                }}
              >
                <option value="" hidden>
                  Select year...
                </option>
                {dropDownFinYear(finYears).map((finyear) => (
                  <option key={finyear.value} value={finyear.value}>
                    {finyear.show}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-2">
          <button
            onClick={() => setIsGlobalOpen(false)}
            className="px-4 py-2 text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all shadow-sm"
            type="button"
            tabIndex={-1}
          >
            Cancel
          </button>

          <button
            ref={submitRef}
            onClick={onSubmit}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-black border border-black rounded-md hover:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center"
            type="button"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onSubmit();
              }
            }}
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default BranchAndFinYearForm;
