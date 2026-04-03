"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./data";

export function LandingNavbar({ activeSection, scrollTo }: { activeSection: string; scrollTo: (id: string) => void }) {
    const [mobileMenu, setMobileMenu] = useState(false);
    const handleNav = (id: string) => { setMobileMenu(false); scrollTo(id); };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/80 shadow-sm" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" aria-label="EHealth - Trang chủ">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-[22px]">local_hospital</span>
                    </div>
                    <div>
                        <span className="text-xl font-black text-[#121417] tracking-tight">E<span className="text-[#3C81C6]">Health</span></span>
                        <p className="text-[9px] text-[#687582] -mt-0.5 tracking-[0.2em] uppercase font-semibold">Hospital & Clinic</p>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-[#4a5568]">
                    {NAV_ITEMS.map(n => (
                        <button key={n.id} onClick={() => handleNav(n.id)}
                            className={`px-3 py-2 rounded-lg hover:text-[#3C81C6] hover:bg-blue-50/60 transition-all ${activeSection === n.id ? "text-[#3C81C6] bg-blue-50/60" : ""}`}
                            aria-label={`Đi đến ${n.label}`}>{n.label}</button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#4a5568] hover:text-[#3C81C6] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                        <span className="material-symbols-outlined text-[18px]">person</span>Đăng nhập
                    </Link>
                    <a href="/booking" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] hover:from-[#2a6da8] hover:to-[#1e40af] text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 active:scale-95"
                        aria-label="Đặt lịch khám">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Đặt lịch khám
                    </a>
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={mobileMenu ? "Đóng menu" : "Mở menu"} aria-expanded={mobileMenu}>
                        <span className="material-symbols-outlined text-[24px] text-[#121417]">{mobileMenu ? "close" : "menu"}</span>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${mobileMenu ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-6 py-4 space-y-1">
                    {NAV_ITEMS.map(n => (
                        <button key={n.id} onClick={() => handleNav(n.id)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#4a5568] hover:bg-blue-50 hover:text-[#3C81C6] transition-colors">{n.label}</button>
                    ))}
                    <div className="pt-3 space-y-2 border-t border-gray-100 mt-2">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#4a5568] hover:bg-blue-50">
                            <span className="material-symbols-outlined text-[18px]">person</span>Đăng nhập
                        </Link>
                        <a href="/booking" className="w-full py-3 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] text-white rounded-xl text-sm font-bold active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>Đặt lịch khám
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}