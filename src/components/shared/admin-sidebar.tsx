"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU_ITEMS, type AdminMenuItem } from "@/constants/routes";
import { UI_TEXT } from "@/constants/ui-text";

// Helper: kiểm tra item có child đang active không
function isChildActiveForItem(item: AdminMenuItem, pathname: string) {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
}

// Helper: collect ALL known hrefs (including children) so we can check for more-specific matches
function getAllHrefs(items: AdminMenuItem[]): string[] {
    const hrefs: string[] = [];
    for (const item of items) {
        if (item.href) hrefs.push(item.href);
        if (item.children) {
            for (const child of item.children) {
                hrefs.push(child.href);
            }
        }
    }
    return hrefs;
}

// Helper: check if a standalone item (no children) should be active
// Only active if pathname exactly matches OR pathname is a subroute AND
// no other more-specific menu href matches the pathname
function isItemActive(itemHref: string, pathname: string, allHrefs: string[]): boolean {
    // Exact match → always active
    if (pathname === itemHref) return true;
    // Dashboard special case: only exact match
    if (itemHref === "/admin") return false;
    // Check if pathname is a subroute of this item
    if (!pathname.startsWith(itemHref + '/')) return false;
    // Make sure no OTHER href is a more specific match
    // (e.g. /admin/medicines/inventory should match "medicines-inventory" child, not "medicines" parent)
    const hasMoreSpecific = allHrefs.some(
        (href) => href !== itemHref && href.startsWith(itemHref + '/') && pathname.startsWith(href)
    );
    return !hasMoreSpecific;
}

// Sidebar menu item — nhận trạng thái open từ cha
function SidebarItem({
    item,
    pathname,
    isOpen,
    onToggle,
    allHrefs,
}: {
    item: AdminMenuItem;
    pathname: string;
    isOpen: boolean;
    onToggle: () => void;
    allHrefs: string[];
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && isChildActiveForItem(item, pathname);
    const isDirectActive = item.href ? isItemActive(item.href, pathname, allHrefs) : false;
    // For items with children, only child determines active (not parent href)
    const isActive = hasChildren ? isChildActive : isDirectActive;

    // Item đơn (không có children)
    if (!hasChildren && item.href) {
        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-[#3C81C6]/10 text-[#3C81C6] dark:bg-[#3C81C6]/20"
                    : "text-[#687582] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "" : "group-hover:text-[#3C81C6]"} transition-colors`}>
                    {item.icon}
                </span>
                <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                </span>
            </Link>
        );
    }

    // Item nhóm (có children) — accordion
    return (
        <div>
            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-[#3C81C6]/5 text-[#3C81C6] dark:bg-[#3C81C6]/10"
                    : "text-[#687582] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#3C81C6]" : "group-hover:text-[#3C81C6]"} transition-colors`}>
                    {item.icon}
                </span>
                <span className={`text-sm flex-1 text-left ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                </span>
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    expand_more
                </span>
            </button>

            {/* Submenu — accordion animation */}
            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-48 mt-0.5" : "max-h-0"}`}>
                <div className="ml-[22px] pl-4 border-l-2 border-[#e5e7eb] dark:border-[#2d353e] space-y-0.5 py-0.5">
                    {item.children!.map((child) => {
                        const childActive = isItemActive(child.href, pathname, allHrefs);
                        return (
                            <Link
                                key={child.key}
                                href={child.href}
                                className={`block px-3 py-2 rounded-lg text-[13px] transition-colors ${childActive
                                    ? "bg-[#3C81C6]/10 text-[#3C81C6] font-bold dark:bg-[#3C81C6]/20"
                                    : "text-[#687582] dark:text-gray-400 hover:text-[#3C81C6] hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                                    }`}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const allHrefs = getAllHrefs(ADMIN_MENU_ITEMS);
    // Accordion: chỉ 1 nhóm mở tại 1 thời điểm
    const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);

    // Tự động mở nhóm active khi pathname thay đổi
    const getActiveGroupKey = useCallback((path: string) => {
        for (const item of ADMIN_MENU_ITEMS) {
            if (item.children && item.children.length > 0 && isChildActiveForItem(item, path)) {
                return item.key;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        setOpenGroupKey(getActiveGroupKey(pathname));
    }, [pathname, getActiveGroupKey]);

    const handleToggleGroup = (key: string) => {
        setOpenGroupKey((prev) => (prev === key ? null : key));
    };

    return (
        <aside className="w-72 bg-white dark:bg-[#1e242b] border-r border-[#dde0e4] dark:border-[#2d353e] flex flex-col flex-shrink-0 h-full transition-all duration-300">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="bg-[#3C81C6]/10 p-2 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#3C81C6] text-3xl">
                        local_hospital
                    </span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[#121417] dark:text-white text-lg font-bold leading-tight">
                        {UI_TEXT.APP.NAME}
                    </h1>
                    <p className="text-[#687582] dark:text-gray-400 text-xs font-normal">
                        {UI_TEXT.APP.TAGLINE}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5">
                {ADMIN_MENU_ITEMS.map((item) => (
                    <SidebarItem
                        key={item.key}
                        item={item}
                        pathname={pathname}
                        isOpen={openGroupKey === item.key}
                        onToggle={() => handleToggleGroup(item.key)}
                        allHrefs={allHrefs}
                    />
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[#dde0e4] dark:border-[#2d353e] mt-auto">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div
                        className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200"
                        style={{
                            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQYIqPn_-s62aeppqoiMtHkuez698P9PXA0a03QBC6Wns_EQXjLkFJ_kJ7tzpoo_H3_6578fCpsYqlWJfw_vA4F3u8ONBugqU-9uZxbs3JMaXbLuLbBLdJSvRr8C2lzIA5O1q7CaeG3LI0a5VYEyfkU7hZU-J_MwS62b8d2X8QUV72FNA27BURKLxPpwBtvxL6J6Grch4aSlFi9g5EGsWwf5FzDDyl1Zz9Gq53I6G74TUGy4o-QzsXSD42oWJNRv5LKMCEdlkD0LIl')`,
                        }}
                    />
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-bold truncate text-[#121417] dark:text-white">
                            Admin Quản trị
                        </p>
                        <p className="text-xs text-[#687582] dark:text-gray-400 truncate">
                            admin@ehealth.vn
                        </p>
                    </div>
                    <button className="ml-auto text-[#687582] hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
