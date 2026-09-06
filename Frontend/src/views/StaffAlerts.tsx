"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext, CentreAlert, AlertType } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function StaffAlerts({ navigate }: Props) {
  const { t } = useLanguage();
  const {
    alerts,
    activeQueueCount,
    createAlert,
    dismissAlert,
    showToast,
  } = useStaffContext();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmReachModal, setConfirmReachModal] = useState<boolean>(false);

  // Form State
  const [alertType, setAlertType] = useState<AlertType>("queue");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All farmers currently in queue");

  const activeAlerts = alerts.filter(a => a.status === "active");
  const pastAlerts = alerts.filter(a => a.status !== "active");

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast("Please fill in title and message", "error");
      return;
    }
    setConfirmReachModal(true);
  };

  const handleExecuteBroadcast = () => {
    createAlert({
      type: alertType,
      title: title.trim(),
      message: message.trim(),
      audience,
    });
    setConfirmReachModal(false);
    setCreateModalOpen(false);
    setTitle("");
    setMessage("");
  };

  return (
    <StaffShell navigate={navigate} current="staff-notifications">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header and New Alert button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("alerts_broadcast_title", "Centre & Queue Broadcast Alerts")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Broadcast Service
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Dispatch real-time notifications and SMS updates to farmers arriving at the centre
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              icon={<Icon name="bell" size={15} />}
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary text-white hover:bg-[#155c30] shadow-sm font-semibold"
            >
              + Create Broadcast Alert
            </Button>
          </div>
        </div>

        {/* Active Broadcasts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground font-display text-base">
              Active Broadcasts &amp; Advisories ({activeAlerts.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Currently visible on farmer apps and SMS
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm border-dashed">
              <Icon name="bell" size={28} className="mx-auto text-muted-foreground/40 mb-2" />
              No active alerts currently broadcast. Click &ldquo;+ Create Broadcast Alert&rdquo; to notify farmers.
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlerts.map(alert => {
                const isQueue = alert.type === "queue";
                const isCentre = alert.type === "centre";

                return (
                  <Card
                    key={alert.id}
                    className={`p-4 border flex flex-col justify-between ${
                      isQueue
                        ? "bg-amber-50/70 border-amber-200"
                        : isCentre
                        ? "bg-blue-50/70 border-blue-200"
                        : "bg-emerald-50/70 border-emerald-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            name={isQueue ? "warning" : "info_icon"}
                            size={16}
                            className={isQueue ? "text-amber-700" : "text-blue-700"}
                          />
                          <span className="text-sm font-bold text-foreground capitalize">
                            {alert.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/80 border border-border">
                          {alert.type}
                        </span>
                      </div>

                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        <p className="font-semibold text-foreground">{alert.audience}</p>
                        <p className="font-mono text-xs mt-0.5">{alert.timestamp} · Reached {alert.reach} farmers</p>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-muted text-foreground border border-border transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Broadcast History Table */}
        <Card className="overflow-hidden border border-border bg-white shadow-xs">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-foreground font-display text-base">
              Broadcast Archive &amp; Past Dispatches
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical record of sent notices with delivery reach
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Headline</th>
                  <th className="px-4 py-3.5">Target Audience</th>
                  <th className="px-4 py-3.5">Farmers Reached</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {a.timestamp}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold capitalize text-foreground">
                      {a.type}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{a.message}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-foreground">
                      {a.audience}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        {a.reach} recipients
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          a.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create Broadcast Alert */}
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setCreateModalOpen(false)}
          >
            <form
              onSubmit={handleOpenConfirm}
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="bell" size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground font-display text-base">
                    Draft Broadcast Alert
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Alert Category
                  </label>
                  <select
                    value={alertType}
                    onChange={e => setAlertType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="queue">Queue Flow &amp; Delays</option>
                    <option value="procurement">Weighbridge &amp; Testing</option>
                    <option value="centre">Centre Operating Status</option>
                    <option value="slot">Slot Openings &amp; Capacity</option>
                    <option value="general">General Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Audience Filter
                  </label>
                  <select
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="All farmers currently in queue">
                      All farmers currently in today&apos;s queue ({activeQueueCount} farmers)
                    </option>
                    <option value="Afternoon slot holders (12:00–17:00)">
                      Afternoon slot holders (12:00–17:00)
                    </option>
                    <option value="Delayed verification cases">
                      Delayed verification cases only
                    </option>
                    <option value="All registered centre farmers">
                      All registered centre farmers (Broadcast)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Alert Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Weighbridge Bay 2 Temporary Inspection Pause"
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Notice Message (Sent via SMS &amp; App)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="e.g. Due to moisture sensor recalibration, tokens #08 to #12 may experience a brief 10 min hold. Please remain in the waiting shelter."
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button type="submit" size="sm" fullWidth>
                  Proceed to Broadcast
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Farmer Reach Confirmation */}
        {confirmReachModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setConfirmReachModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Icon name="bell" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground font-display text-base">
                    Confirm Broadcast Dispatch
                  </h3>
                  <p className="text-xs text-muted-foreground">High-priority multi-channel announcement</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-sm">
                <p className="text-foreground font-semibold">
                  Send this announcement to <strong>{audience}</strong>?
                </p>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs leading-relaxed">{message}</p>
                </div>

                <p className="text-muted-foreground text-xs">
                  • Estimated farmer reach: <strong>~{activeQueueCount} recipients</strong>
                  <br />
                  • Notification channels: Push notification + Direct SMS dispatch.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" fullWidth onClick={handleExecuteBroadcast}>
                  Confirm &amp; Send Broadcast
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setConfirmReachModal(false)}
                >
                  Edit Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
