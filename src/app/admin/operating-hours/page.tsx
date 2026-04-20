"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { OPERATING_HOUR_ENDPOINTS, FACILITY_MANAGEMENT_ENDPOINTS, BRANCH_ENDPOINTS } from "@/api/endpoints";
import { unwrapList } from "@/api/response";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader, EmptyState, StatCard } from "@/components/shared/layout";

interface OperatingHour {
    id: string;
    facilityId?: string;
    branchId?: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
    note?: string;
}

interface FacilityLite {
    id: string;
    name: string;
}

interface BranchLite {
    id: string;
    name: string;
    facilityId?: string;
}

type TargetKind = "facility" | "branch";

const DAYS_OF_WEEK = [
    { value: 1, label: "Thứ 2", short: "T2", icon: "calendar_today" },
    { value: 2, label: "Thứ 3", short: "T3", icon: "calendar_today" },
    { value: 3, label: "Thứ 4", short: "T4", icon: "calendar_today" },
    { value: 4, label: "Thứ 5", short: "T5", icon: "calendar_today" },
    { value: 5, label: "Thứ 6", short: "T6", icon: "calendar_today" },
    { value: 6, label: "Thứ 7", short: "T7", icon: "weekend" },
    { value: 0, label: "Chủ nhật", short: "CN", icon: "weekend" },
] as const;

function mapHour(r: any): OperatingHour {
    return {
        id: String(r.operating_hours_id ?? r.operating_hour_id ?? r.id ?? ""),
        facilityId: String(r.facility_id ?? r.facilityId ?? ""),
        branchId: String(r.branch_id ?? r.branchId ?? ""),
        dayOfWeek: Number(r.day_of_week ?? r.dayOfWeek ?? 0),
        openTime: (r.open_time ?? r.openTime ?? "").slice(0, 5),
        closeTime: (r.close_time ?? r.closeTime ?? "").slice(0, 5),
        isClosed: Boolean(r.is_closed ?? r.isClosed ?? false),
        note: r.note ?? r.description ?? "",
    };
}

export default function OperatingHoursPage() {
    const toast = useToast();
    const [facilities, setFacilities] = useState<FacilityLite[]>([]);
    const [branches, setBranches] = useState<BranchLite[]>([]);
    const [hours, setHours] = useState<OperatingHour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [targetKind, setTargetKind] = useState<TargetKind>("facility");
    const [targetId, setTargetId] = useState<string>("");
    const [editDay, setEditDay] = useState<number | null>(null);
    const [draft, setDraft] = useState<{ openTime: string; closeTime: string; isClosed: boolean; note: string }>({
        openTime: "08:00",
        closeTime: "17:00",
        isClosed: false,
        note: "",
    });
    const [saving, setSaving] = useState(false);

    const loadDropdowns = useCallback(async () => {
        try {
            const [fRes, bRes] = await Promise.all([
                axiosClient.get(FACILITY_MANAGEMENT_ENDPOINTS.DROPDOWN),
                axiosClient.get(BRANCH_ENDPOINTS.DROPDOWN),
            ]);
            const fRaw: any[] = Array.isArray(fRes.data?.data) ? fRes.data.data : Array.isArray(fRes.data) ? fRes.data : [];
            const bRaw: any[] = Array.isArray(bRes.data?.data) ? bRes.data.data : Array.isArray(bRes.data) ? bRes.data : [];
            setFacilities(fRaw.map((d: any) => ({ id: String(d.facility_id ?? d.facilities_id ?? d.id ?? ""), name: d.name ?? d.facility_name ?? "" })).filter((f) => f.id));
            setBranches(bRaw.map((d: any) => ({
                id: String(d.branches_id ?? d.branch_id ?? d.id ?? ""),
                name: d.name ?? d.branch_name ?? "",
                facilityId: String(d.facility_id ?? d.facilities_id ?? ""),
            })).filter((b) => b.id));
        } catch {
            setFacilities([]);
            setBranches([]);
        }
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { limit: 500 };
            if (targetKind === "facility" && targetId) params.facility_id = targetId;
            if (targetKind === "branch" && targetId) params.branch_id = targetId;
            const res = await axiosClient.get(OPERATING_HOUR_ENDPOINTS.LIST, { params });
            const { data } = unwrapList<any>(res);
            setHours(data.map(mapHour));
        } catch {
            setError("Không tải được giờ hoạt động.");
            setHours([]);
        } finally {
            setLoading(false);
        }
    }, [targetKind, targetId]);

    useEffect(() => { loadDropdowns(); }, [loadDropdowns]);

    useEffect(() => {
        if (!targetId) {
            if (targetKind === "facility" && facilities.length > 0) setTargetId(facilities[0].id);
            else if (targetKind === "branch" && branches.length > 0) setTargetId(branches[0].id);
        }
    }, [facilities, branches, targetKind, targetId]);

    useEffect(() => { if (targetId) load(); }, [load, targetId]);

    const hoursByDay = useMemo(() => {
        const map = new Map<number, OperatingHour>();
        hours.forEach((h) => {
            const match =
                (targetKind === "facility" && h.facilityId === targetId) ||
                (targetKind === "branch" && h.branchId === targetId) ||
                (!h.facilityId && !h.branchId);
            if (match) map.set(h.dayOfWeek, h);
        });
        return map;
    }, [hours, targetKind, targetId]);

    const stats = useMemo(() => {
        const open = Array.from(hoursByDay.values()).filter((h) => !h.isClosed).length;
        return {
            open,
            closed: 7 - open,
            configured: hoursByDay.size,
            unconfigured: 7 - hoursByDay.size,
        };
    }, [hoursByDay]);

    const openEdit = (dayOfWeek: number) => {
        const existing = hoursByDay.get(dayOfWeek);
        setDraft({
            openTime: existing?.openTime || "08:00",
            closeTime: existing?.closeTime || "17:00",
            isClosed: existing?.isClosed ?? false,
            note: existing?.note ?? "",
        });
        setEditDay(dayOfWeek);
    };

    const handleSave = async () => {
        if (editDay === null) return;
        if (!draft.isClosed && draft.openTime >= draft.closeTime) {
            toast.warning("Giờ mở phải trước giờ đóng.");
            return;
        }
        setSaving(true);
        try {
            const existing = hoursByDay.get(editDay);
            const payload: any = {
                day_of_week: editDay,
                open_time: draft.openTime,
                close_time: draft.closeTime,
                is_closed: draft.isClosed,
                note: draft.note.trim() || undefined,
            };
            if (targetKind === "facility") payload.facility_id = targetId;
            else payload.branch_id = targetId;

            if (existing) {
                await axiosClient.put(OPERATING_HOUR_ENDPOINTS.UPDATE(existing.id), payload);
                toast.success("Đã cập nhật giờ hoạt động.");
            } else {
                await axiosClient.post(OPERATING_HOUR_ENDPOINTS.CREATE, payload);
                toast.success("Đã tạo cấu hình giờ hoạt động.");
            }
            setEditDay(null);
            await load();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Không lưu được giờ hoạt động.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (dayOfWeek: number) => {
        const existing = hoursByDay.get(dayOfWeek);
        if (!existing) return;
        const dayLabel = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label ?? "";
        if (!confirm(`Xoá cấu hình ${dayLabel}?`)) return;
        try {
            await axiosClient.delete(OPERATING_HOUR_ENDPOINTS.DELETE(existing.id));
            toast.success("Đã xoá cấu hình.");
            await load();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Không xoá được.");
        }
    };

    const handleToggleClosed = async (dayOfWeek: number) => {
        const existing = hoursByDay.get(dayOfWeek);
        if (!existing) {
            openEdit(dayOfWeek);
            return;
        }
        try {
            await axiosClient.put(OPERATING_HOUR_ENDPOINTS.UPDATE(existing.id), {
                day_of_week: dayOfWeek,
                open_time: existing.openTime || "08:00",
                close_time: existing.closeTime || "17:00",
                is_closed: !existing.isClosed,
                note: existing.note,
                ...(targetKind === "facility" ? { facility_id: targetId } : { branch_id: targetId }),
            });
            toast.success(existing.isClosed ? "Đã mở cửa ngày này." : "Đã đánh dấu nghỉ.");
            await load();
        } catch {
            toast.error("Không cập nhật được trạng thái.");
        }
    };

    const targetOptions = targetKind === "facility" ? facilities : branches;
    const targetLabel = targetKind === "facility" ? "cơ sở y tế" : "chi nhánh";

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Giờ hoạt động"
                subtitle="Quản lý giờ mở cửa và ngày nghỉ của cơ sở / chi nhánh"
                icon="schedule"
                breadcrumbs={[{ label: "Quản trị", href: "/admin" }, { label: "Giờ hoạt động" }]}
            />

            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-xl bg-[#f8f9fa] dark:bg-[#13191f] p-1 border border-[#dde0e4] dark:border-[#2d353e]">
                        {(["facility", "branch"] as TargetKind[]).map((k) => (
                            <button
                                key={k}
                                onClick={() => { setTargetKind(k); setTargetId(""); }}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                    targetKind === k
                                        ? "bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] text-white shadow-sm"
                                        : "text-[#687582] dark:text-gray-400 hover:bg-white dark:hover:bg-[#1e242b]"
                                }`}
                            >
                                {k === "facility" ? "Cơ sở y tế" : "Chi nhánh"}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 min-w-[240px]">
                        <select
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white"
                        >
                            <option value="">— Chọn {targetLabel} —</option>
                            {targetOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {!targetId ? (
                <EmptyState
                    icon="store"
                    title={`Chọn ${targetLabel}`}
                    description={`Chọn một ${targetLabel} để cấu hình giờ hoạt động.`}
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Ngày mở cửa" value={stats.open} icon="check_circle" color="emerald" loading={loading} />
                        <StatCard label="Ngày nghỉ" value={stats.closed} icon="event_busy" color="red" loading={loading} />
                        <StatCard label="Đã cấu hình" value={stats.configured} icon="settings" color="blue" loading={loading} />
                        <StatCard label="Chưa cấu hình" value={stats.unconfigured} icon="help" color="amber" loading={loading} />
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "20px" }}>warning</span>
                            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                            {DAYS_OF_WEEK.map((_, i) => <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                            {DAYS_OF_WEEK.map((day) => {
                                const h = hoursByDay.get(day.value);
                                const configured = Boolean(h);
                                const isClosed = h?.isClosed ?? false;
                                return (
                                    <div
                                        key={day.value}
                                        className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
                                            isClosed
                                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                : configured
                                                    ? "bg-white dark:bg-[#1e242b] border-[#dde0e4] dark:border-[#2d353e]"
                                                    : "bg-gray-50 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-700"
                                        }`}
                                    >
                                        <div className={`h-1.5 ${
                                            isClosed ? "bg-gradient-to-r from-red-400 to-rose-500" :
                                            configured ? "bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8]" :
                                            "bg-gray-300 dark:bg-gray-700"
                                        }`} />
                                        <div className="p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="text-xs font-bold text-[#121417] dark:text-white">{day.short}</div>
                                                    <div className="text-[10px] text-[#687582] dark:text-gray-400">{day.label}</div>
                                                </div>
                                                <span className={`material-symbols-outlined ${
                                                    isClosed ? "text-red-500" : configured ? "text-[#3C81C6]" : "text-gray-400"
                                                }`} style={{ fontSize: "20px" }}>
                                                    {isClosed ? "event_busy" : configured ? "event_available" : "help"}
                                                </span>
                                            </div>

                                            {!configured ? (
                                                <div className="text-[10px] text-[#687582] dark:text-gray-500 italic mb-3">Chưa cấu hình</div>
                                            ) : isClosed ? (
                                                <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-3">Đóng cửa</div>
                                            ) : (
                                                <div className="space-y-1 mb-3">
                                                    <div className="font-mono text-xs font-bold text-[#121417] dark:text-white">{h!.openTime}</div>
                                                    <div className="text-[10px] text-[#687582] dark:text-gray-400">đến</div>
                                                    <div className="font-mono text-xs font-bold text-[#121417] dark:text-white">{h!.closeTime}</div>
                                                </div>
                                            )}

                                            {configured && h?.note && (
                                                <div className="text-[10px] text-[#687582] dark:text-gray-400 mb-2 line-clamp-2" title={h.note}>{h.note}</div>
                                            )}

                                            <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => openEdit(day.value)}
                                                    className="flex-1 px-2 py-1 text-[10px] font-medium text-[#3C81C6] hover:bg-[#3C81C6]/10 rounded-md"
                                                >
                                                    {configured ? "Sửa" : "Cấu hình"}
                                                </button>
                                                {configured && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleClosed(day.value)}
                                                            className={`px-2 py-1 rounded-md ${isClosed ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
                                                            title={isClosed ? "Mở cửa" : "Đánh dấu nghỉ"}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{isClosed ? "event_available" : "event_busy"}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(day.value)}
                                                            className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                                            title="Xoá"
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {editDay !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditDay(null)}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3C81C6]">schedule</span>
                            Cấu hình {DAYS_OF_WEEK.find((d) => d.value === editDay)?.label}
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f8f9fa] dark:bg-[#13191f] cursor-pointer">
                                <input type="checkbox" checked={draft.isClosed} onChange={(e) => setDraft({ ...draft, isClosed: e.target.checked })}
                                    className="w-4 h-4 rounded border-[#dde0e4] text-[#3C81C6] focus:ring-[#3C81C6]" />
                                <span className="text-sm text-[#121417] dark:text-white font-medium">Đóng cửa cả ngày</span>
                            </label>
                            {!draft.isClosed && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Giờ mở *</label>
                                        <input type="time" value={draft.openTime} onChange={(e) => setDraft({ ...draft, openTime: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Giờ đóng *</label>
                                        <input type="time" value={draft.closeTime} onChange={(e) => setDraft({ ...draft, closeTime: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Ghi chú</label>
                                <textarea rows={2} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                                    placeholder="VD: Nghỉ lễ, giờ nghỉ trưa 12:00-13:00..."
                                    className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[#dde0e4] dark:border-[#2d353e]">
                            <button onClick={() => setEditDay(null)} disabled={saving} className="px-4 py-2 text-sm text-[#687582] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl disabled:opacity-50">Huỷ</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 inline-flex items-center gap-1">
                                {saving ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang lưu...</>) : (<><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>save</span>Lưu</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
