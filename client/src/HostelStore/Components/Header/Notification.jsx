import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Bell } from "lucide-react";
import { getCommonParams } from "../../../Utils/helper";
import { push } from "../../../redux/features/opentabs";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import {
  useGetPendingApprovallQuery,
  useMarkNotificationAsReadMutation,
} from "../../../redux/uniformService/ApprovalMasterServices";
import { TICK_ICON, VIEW } from "../../../icons";
import { useGetNotificationsQuery, useMarkPendingJobCardAsReadMutation } from "../../../redux/uniformService/NotificationService";

const STATUS_DISPLAY = {
  APPROVED: { label: "✅ Approved", isSelfResult: true },
  REJECTED: { label: "↩️ Sent Back", isSelfResult: true },
  SUPERSEDED: { label: "🔄 Re-approval Needed", isSelfResult: true },
  PENDING: { label: "⏳ Awaiting Approval", isSelfResult: false },
  _DEFAULT: { label: "🔔 Approval Request", isSelfResult: false },
};

function getStatusConfig(log, userId) {
  const isSelf = log.raisedById === parseInt(userId);
  if (isSelf && STATUS_DISPLAY[log.status]?.isSelfResult)
    return { ...STATUS_DISPLAY[log.status], isResult: true };
  if (!isSelf && log.status === "PENDING")
    return { ...STATUS_DISPLAY._DEFAULT, isResult: false };
  return { ...STATUS_DISPLAY.PENDING, isResult: false };
}

// ── Reusable read indicator ───────────────────────────────────────────
const ReadBadge = ({ isRead }) =>
  isRead ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
      ✓ Read
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
      ● Unread
    </span>
  );

const Notification = () => {
  const { userId } = getCommonParams();
  const dispatch = useDispatch();

  // ── Approval notifications ────────────────────────────────────────
  const { data, isLoading } = useGetPendingApprovallQuery(
    { params: { userId } },
    { pollingInterval: 30000, skip: !userId },
  );
  const [markApprovalRead, { isLoading: isMarkingApproval }] =
    useMarkNotificationAsReadMutation();

  // ── Job card notifications ────────────────────────────────────────
  const { data: jobCardNotifications } = useGetNotificationsQuery(
    { params: { userId } },
    { skip: !userId },
  );
  const [markJobCardRead, { isLoading: isMarkingJobCard }] =
    useMarkPendingJobCardAsReadMutation();

  const approvalNotifications = data?.data ?? [];
  const jobCardPending = jobCardNotifications?.data || [];

  const actionRequired = approvalNotifications.filter(log => !getStatusConfig(log, userId).isResult);
  const resultNotifications = approvalNotifications.filter(log => getStatusConfig(log, userId).isResult);

  const totalCount = approvalNotifications.length + jobCardPending.length;

  const [open, setOpen] = useState(false);
  const ref = useRef();
  useOutsideClick(() => setOpen(false), ref);

  function openRecord(log) {
    dispatch(push({ name: log.referencePage, previewId: log.referenceId }));
    setOpen(false);
  }

  async function handleMarkApprovalRead(e, logId) {
    e.stopPropagation();
    try { await markApprovalRead({ id: logId, userId }).unwrap(); }
    catch (err) { console.error("Failed to mark approval as read:", err); }
  }

  async function handleMarkAllApprovalRead(e) {
    e.stopPropagation();
    try {
      await Promise.all(
        resultNotifications.map(n => markApprovalRead({ id: n.id, userId }).unwrap())
      );
    } catch (err) { console.error("Failed to mark all as read:", err); }
  }

  async function handleMarkJobCardRead(e, logId) {
    e.stopPropagation();
    try { await markJobCardRead({ id: logId, userId }).unwrap(); }
    catch (err) { console.error("Failed to mark job card notification as read:", err); }
  }

  async function handleMarkAllJobCardRead(e) {
    e.stopPropagation();
    try {
      await Promise.all(
        jobCardPending.filter(n => !n.isRead).map(n => markJobCardRead({ id: n.id, userId }).unwrap())
      );
    } catch (err) { console.error("Failed to mark all job card notifications as read:", err); }
  }

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-2 rounded-full">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 mt-2 w-[520px] bg-white shadow-xl rounded-xl border z-50 overflow-hidden animate-fadeIn">

          {/* Header */}
          <div className="px-4 py-3 border-b font-semibold text-gray-700 flex justify-between items-center">
            <span>Notifications</span>
            <span className="text-xs text-gray-400">
              {totalCount} notification{totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="max-h-[520px] overflow-auto text-xs">
            {isLoading ? (
              <div className="p-4 text-gray-400 text-center">Loading...</div>
            ) : totalCount === 0 ? (
              <div className="p-6 text-gray-400 text-center">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              <>
                {/* ══ SECTION 1 — Action Required (approval) ═══════ */}
                {actionRequired.length > 0 && (
                  <>
                    <SectionHeader
                      color="orange"
                      label="Action Required"
                      count={actionRequired.length}
                    />
                    <table className="w-full text-left text-gray-600">
                      <thead className="text-gray-500 uppercase text-[10px] bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Module</th>
                          <th className="px-3 py-2">Doc ID</th>
                          <th className="px-2 py-2">Level</th>
                          <th className="px-3 py-2">By</th>
                          {/* <th className="px-2 py-2">Is Read</th> */}
                          <th className="px-2 py-2">View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actionRequired.map(log => {
                          const config = getStatusConfig(log, userId);
                          const totalLevels = log.ApprovalConfig?.approvalLevels?.length ?? "?";
                          return (
                            <tr
                              key={log.id}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => openRecord(log)}
                            >
                              <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">{config.label}</td>
                              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{log.referencePage}</td>
                              <td className="px-3 py-2.5 text-blue-500 font-medium whitespace-nowrap">#{log.referenceDocId ?? log.referenceId}</td>
                              <td className="px-2 py-2.5 whitespace-nowrap">
                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                  {log.currentLevel}/{totalLevels}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.RaisedBy?.username ?? "—"}</td>
                              {/* <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                                <ReadBadge isRead={log.isRead ?? false} />
                              </td> */}
                              <td className="px-2 py-2.5" onClick={e => { e.stopPropagation(); openRecord(log); }}>
                                <button className="text-blue-500 hover:text-blue-700">{VIEW}</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}

                {/* ══ SECTION 2 — Your Requests (approval results) ═ */}
                {resultNotifications.length > 0 && (
                  <>
                    <SectionHeader
                      color="blue"
                      label="Your Requests"
                      count={resultNotifications.length}
                      action={
                        <button
                          onClick={handleMarkAllApprovalRead}
                          disabled={isMarkingApproval}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40"
                        >
                          ✓ Mark all read
                        </button>
                      }
                    />
                    <table className="w-full text-left text-gray-600">
                      <thead className="text-gray-500 uppercase text-[10px] bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Module</th>
                          <th className="px-3 py-2">Doc ID</th>
                          <th className="px-2 py-2">Level</th>
                          {/* <th className="px-2 py-2">Is Read</th> */}
                          <th className="px-2 py-2">View</th>
                          <th className="px-2 py-2">Mark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultNotifications.map(log => {
                          const config = getStatusConfig(log, userId);
                          const totalLevels = log.ApprovalConfig?.approvalLevels?.length ?? "?";
                          return (
                            <tr
                              key={log.id}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => openRecord(log)}
                            >
                              <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">{config.label}</td>
                              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{log.referencePage}</td>
                              <td className="px-3 py-2.5 text-blue-500 font-medium whitespace-nowrap">#{log.referenceDocId ?? log.referenceId}</td>
                              <td className="px-2 py-2.5 whitespace-nowrap">
                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                  {log.currentLevel}/{totalLevels}
                                </span>
                              </td>
                              {/* <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                                <ReadBadge isRead={log.isRead ?? false} />
                              </td> */}
                              <td className="px-2 py-2.5" onClick={e => { e.stopPropagation(); openRecord(log); }}>
                                <button className="text-blue-500 hover:text-blue-700">{VIEW}</button>
                              </td>
                              <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={e => handleMarkApprovalRead(e, log.id)}
                                  disabled={isMarkingApproval || log.isRead}
                                  title="Mark as read"
                                  className="p-1 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition disabled:opacity-30"
                                >
                                  {TICK_ICON}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}

                {/* ══ SECTION 3 — Job Card Pending ═════════════════ */}
                {jobCardPending.length > 0 && (
                  <>
                    <SectionHeader
                      color="red"
                      label="Job Card Pending"
                      count={jobCardPending.length}
                    // action={
                    //   jobCardPending.some(n => !n.isRead) && (
                    //     <button
                    //       onClick={handleMarkAllJobCardRead}
                    //       disabled={isMarkingJobCard}
                    //       className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40"
                    //     >
                    //       ✓ Mark all read
                    //     </button>
                    //   )
                    // }
                    />
                    <table className="w-full text-left text-gray-600">
                      <thead className="text-gray-500 uppercase text-[10px] bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-10">Type</th>
                          <th className="px-3 py-2">Message</th>
                          {/* <th className="px-3 py-2">Doc ID</th> */}
                          {/* <th className="px-2 py-2">Is Read</th> */}
                          {/* <th className="px-2 py-2">View</th> */}
                          {/* <th className="px-2 py-2">Mark</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {jobCardPending.map(log => (
                          <tr
                            key={log.id}
                            className={`border-b hover:bg-gray-50 cursor-pointer ${!log.isRead ? "bg-red-50/40" : ""}`}
                            // onClick={() => openRecord(log)}
                          >
                            {/* Type badge */}
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${log.type === "WARNING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                                }`}>
                                {log.type}
                              </span>
                            </td>
                            {/* Message */}
                            <td className="px-3 py-2.5 text-gray-600 max-w-[180px] truncate" title={log.message}>
                              {log.message}
                            </td>
                            {/* Reference Doc */}
                            {/* <td className="px-3 py-2.5 text-blue-500 font-medium whitespace-nowrap">
                              #{log.referenceId}
                            </td> */}
                            {/* Is Read */}
                            {/* <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                              <ReadBadge isRead={log.isRead} />
                            </td> */}
                            {/* View */}
                            {/* <td className="px-2 py-2.5" onClick={e => { e.stopPropagation(); openRecord(log); }}>
                              <button className="text-blue-500 hover:text-blue-700">{VIEW}</button>
                            </td> */}
                            {/* Mark read */}
                            {/* <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={e => handleMarkJobCardRead(e, log.id)}
                                disabled={isMarkingJobCard || log.isRead}
                                title="Mark as read"
                                className="p-1 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition disabled:opacity-30"
                              >
                                {TICK_ICON}
                              </button>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small helper component for section headers ────────────────────────
const colorMap = {
  orange: "bg-orange-50 border-orange-100 text-orange-600",
  blue: "bg-blue-50 border-blue-100 text-blue-600",
  red: "bg-red-50 border-red-100 text-red-600",
};

const SectionHeader = ({ color, label, count, action }) => (
  <div className={`px-4 py-1.5 border-b border-t ${colorMap[color]} flex justify-between items-center`}>
    <span className="text-[10px] font-bold uppercase tracking-wider">
      {label} — {count}
    </span>
    {action && <div>{action}</div>}
  </div>
);

// In NotificationService.js
// markJobCardNotificationAsRead: builder.mutation({
//   query: ({ id, userId }) => ({
//     url: `${NOTIFICATION_API}/${id}/read`,
//     method: "PATCH",
//     body: { userId },
//   }),
//   invalidatesTags: ["Notification"],
// }),

export default Notification;