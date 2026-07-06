// hooks/useIsApprover.js
import secureLocalStorage from "react-secure-storage";
import { useGetApprovalQuery } from "../redux/uniformService/ApprovalMasterServices";

export function isUserApprover(approvalConfigs = [], pageName, userId) {
  if (!pageName || !userId) return false;

  const config = approvalConfigs.find(
    (c) => c.Module?.name?.toUpperCase() === pageName.toUpperCase() && c.active,
  );

  // No active config found → no approval needed → hide buttons
  if (!config) return false;

  // Always check LevelUsers regardless of isAlwaysApproved
  // isAlwaysApproved is a backend auto-approval flag, not a UI permission flag
  return config.approvalLevels.some((level) =>
    level.LevelUsers.some((lu) => lu.userId === userId),
  );
}

export function useIsApprover(pageName, userId) {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );

  const { data, isLoading } = useGetApprovalQuery({ params: { branchId } });

  const canApprove = isUserApprover(data?.data ?? [], pageName, userId);

  return { canApprove, isLoading };
}
