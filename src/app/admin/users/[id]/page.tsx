"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_USERS } from "@/lib/mock-data/admin";
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/constants/roles";
import { USER_STATUS } from "@/constants/status";
import type { User } from "@/types";

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const found = MOCK_USERS.find((u) => u.id === userId);
        setUser(found || null);
    }, [userId]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">person_off</span>
                <p className="text-lg text-gray-500 mb-4">Không tìm thấy người dùng</p>
                <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 bg-[#3C81C6] text-white rounded-xl text-sm font-bold hover:bg-[#2a6da8] transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const roleColor = ROLE_COLORS[user.role as Role] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
    const isActive = user.status === USER_STATUS.ACTIVE;

    return (
        <>
            {/* Breadcrumb + Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#687582]">
                    <Link href="/admin/users" className="hover:text-[#3C81C6] transition-colors">
                        Người dùng
                    </Link>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="text-[#121417] dark:text-white font-medium">{user.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e242b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lại
                    </button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-[#1e242b] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl shadow-sm overflow-hidden">
                {/* Banner gradient */}
                <div className="h-32 bg-gradient-to-r from-[#3C81C6] via-[#60a5fa] to-[#93c5fd] relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1e242b] border-4 border-white dark:border-[#1e242b] shadow-lg flex items-center justify-center">
                            {user.avatar ? (
                                <div className="w-full h-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${user.avatar}')` }} />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-[#3C81C6]">person</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-16 pb-6 px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#121417] dark:text-white">{user.fullName}</h1>
                            <p className="text-[#687582] dark:text-gray-400 mt-1">{user.email}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${roleColor.bg} ${roleColor.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${roleColor.dot} mr-1.5`} />
                                    {ROLE_LABELS[user.role as Role] || user.role}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                                    {isActive ? "Đang hoạt động" : "Đã khóa"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin cá nhân */}
                <div className="bg-white dark:bg-[#1e242b] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]">badge</span>
                        Thông tin cá nhân
                    </h2>
                    <div className="space-y-4">
                        <InfoRow label="Họ và tên" value={user.fullName} icon="person" />
                        <InfoRow label="Email" value={user.email} icon="email" />
                        <InfoRow label="Vai trò" value={ROLE_LABELS[user.role as Role] || user.role} icon="shield_person" />
                        <InfoRow label="Số điện thoại" value="0901 234 567" icon="phone" />
                        <InfoRow label="Giới tính" value="Nam" icon="wc" />
                        <InfoRow label="Ngày sinh" value="15/06/1990" icon="cake" />
                    </div>
                </div>

                {/* Thông tin tài khoản */}
                <div className="bg-white dark:bg-[#1e242b] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]">manage_accounts</span>
                        Thông tin tài khoản
                    </h2>
                    <div className="space-y-4">
                        <InfoRow label="Mã nhân viên" value={`NV${user.id.padStart(5, "0")}`} icon="fingerprint" />
                        <InfoRow label="Ngày tạo tài khoản" value={user.createdAt} icon="event" />
                        <InfoRow label="Truy cập cuối" value={user.lastAccess || "—"} icon="schedule" />
                        <InfoRow label="Trạng thái" value={isActive ? "Đang hoạt động" : "Đã khóa"} icon="toggle_on" />
                        <InfoRow label="Khoa / Phòng ban" value="Khoa Nội Tổng Quát" icon="domain" />
                        <InfoRow label="Chức vụ" value={ROLE_LABELS[user.role as Role] || user.role} icon="work" />
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="bg-white dark:bg-[#1e242b] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl shadow-sm p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]">history</span>
                        Hoạt động gần đây
                    </h2>
                    <div className="space-y-3">
                        {[
                            { action: "Đăng nhập hệ thống", time: "Hôm nay, 08:30", icon: "login" },
                            { action: "Cập nhật hồ sơ bệnh nhân #BN12345", time: "Hôm qua, 15:20", icon: "edit_note" },
                            { action: "Tạo lịch hẹn khám mới", time: "Hôm qua, 10:15", icon: "calendar_add_on" },
                            { action: "Xuất báo cáo tháng 02/2026", time: "01/03/2026, 09:00", icon: "download" },
                            { action: "Đổi mật khẩu tài khoản", time: "25/02/2026, 14:30", icon: "lock_reset" },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-[#3C81C6]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-[#3C81C6]">{activity.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#121417] dark:text-white">{activity.action}</p>
                                    <p className="text-xs text-[#687582] dark:text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="material-symbols-outlined text-[18px] text-[#687582]">{icon}</span>
            <div className="flex-1">
                <p className="text-xs text-[#687582] dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-[#121417] dark:text-white">{value}</p>
            </div>
        </div>
    );
}
