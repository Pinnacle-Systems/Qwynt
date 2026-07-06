export function ApprovalBadge({ approvalStatus }) {
  if (!approvalStatus) return null;

  const colorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    gray: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
        colorMap[approvalStatus.color] ?? colorMap.gray
      }`}
    >
      {approvalStatus.label === "PENDING"
        ? "Waiting For Approval"
        : approvalStatus.label}
    </span>
  );
}
