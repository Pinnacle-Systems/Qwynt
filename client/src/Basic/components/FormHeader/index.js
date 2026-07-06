import React from "react";
import { useSelector } from "react-redux";
import {
  NewButton,
  SaveButton,
  EditButton,
  DeleteButton,
  CloseButton,
  PrintButtonOnly,
  SearchButton
} from "../../../Buttons";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";
import { useGetPagesQuery } from "../../../redux/services/PageMasterService";


const FormHeader = ({
  model,
  saveData,
  setReadOnly,
  deleteData,
  onClose = null,
  onNew,
  childRecord = 0,
  onPrint = null,
  openReport = null,
  childRecordValidationActions = ["edit", "delete"],
}) => {

  const openTabs = useSelector((state) => state.openTabs);

  const activeTab = openTabs.tabs.find(tab => tab.active);
  const { data: pageData } = useGetPagesQuery({})

  const currentPageId = (pageData?.data || []).find(i => i.name === activeTab.name)?.id || '';

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });


  const IsSuperAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
      )
    );
  };

  const IsDefaultAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "defaultAdmin"
      )
    );
  };


  const isCurrentFinYearActive = () => {
    return Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYearActive"
      )
    );
  };

  const hasPermission = (callback, type) => {
    if (childRecordValidationActions.includes(type) && childRecord !== 0) {
      toast.error("Child Record Exists", { position: "top-center" });
      return;
    }
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          callback();
        } else if (currentPagePermissions.data[type]) {
          callback();
        } else {
          toast.info(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.info(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };
  return (
    <>
      {isLoading || isFetching ? (
        <div></div>
      ) : (
        <div className="md:flex md:items-center md:justify-between page-heading">
          {model ? (
            <div className="font-bold heading text-center md:mx-10">
              {model}
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex sub-heading">
            <NewButton onClick={() => { hasPermission(onNew, "create") }} />
            <EditButton
              onClick={() => {
                hasPermission(setReadOnly, "edit");
              }}
            />
            <SaveButton
              onClick={saveData}
            />
            <DeleteButton
              onClick={() => {
                hasPermission(deleteData, "delete");
              }}
            />
            {openReport && <SearchButton onClick={openReport} />}
            {onPrint &&
              <PrintButtonOnly onClick={onPrint}
              />}
            {onClose &&
              <CloseButton onClick={onClose} />
            }
          </div>
        </div>
      )}
    </>
  );
};

export default FormHeader;
