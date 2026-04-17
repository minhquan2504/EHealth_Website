"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UI_TEXT } from "@/constants/ui-text";
import { getDrugs } from "@/services/medicineService";
import { MEDICINE_STATUS } from "@/constants/status";
import { validateFile } from "@/utils/fileValidation";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { MedicineFormModal } from "@/features/medicines/components/medicine-form-modal";
import { AddStockModal } from "@/features/medicines/components/add-stock-modal";
import { mapApiDrugToMedicine } from "@/features/medicines/utils/adminMedicineMappers";
import type { Medicine } from "@/types";

const MEDICINE_CATEGORIES = [
    "Khang sinh",
    "Giam dau",
    "Vitamin va Khoang chat",
    "Ho hap",
    "Tieu hoa",
    "Tim mach",
    "Than kinh",
    "Da lieu",
];

type SortField = "code" | "name" | "price" | "stock" | "status";
type SortOrder = "asc" | "desc";

function formatCurrency(num: number): string {
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(1)} Ty`;
    }
    return `${num.toLocaleString("vi-VN")}d`;
}

const isWithinNextDays = (dateValue: string | undefined, days: number): boolean => {
    if (!dateValue) {
        return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() + days);

    return date >= now && date <= cutoff;
};

export default function MedicinesPage() {
    const router = useRouter();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [stockMedicine, setStockMedicine] = useState<Medicine | null>(null);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const loadMedicines = async () => {
        const response = await getDrugs({ limit: 200 });
        const items = Array.isArray(response?.data) ? response.data : [];
        setMedicines(
            items
                .map((item) => mapApiDrugToMedicine(item))
                .filter((item): item is Medicine => item !== null)
        );
    };

    useEffect(() => {
        loadMedicines().catch(() => {
            setMedicines([]);
        });
    }, []);

    const filteredMedicines = useMemo(() => {
        const result = medicines.filter((medicine) => {
            const matchesSearch =
                searchQuery === "" ||
                medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                medicine.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                medicine.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                categoryFilter === "all" || medicine.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        result.sort((left, right) => {
            let comparison = 0;
            if (sortField === "code") {
                comparison = left.code.localeCompare(right.code);
            } else if (sortField === "name") {
                comparison = left.name.localeCompare(right.name);
            } else if (sortField === "price") {
                comparison = left.price - right.price;
            } else if (sortField === "stock") {
                comparison = left.stock - right.stock;
            } else if (sortField === "status") {
                comparison = left.status.localeCompare(right.status);
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return result;
    }, [medicines, searchQuery, categoryFilter, sortField, sortOrder]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleExport = async () => {
        try {
            const { exportDrugs } = await import("@/services/medicineService");
            const blob = await exportDrugs();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `medicines_${new Date().toISOString().split("T")[0]}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            const headers = ["Ma", "Ten", "Hoat chat", "Don vi", "Gia", "Ton kho", "Trang thai"];
            const rows = filteredMedicines.map((medicine) => [
                medicine.code,
                medicine.name,
                medicine.activeIngredient,
                medicine.unit,
                medicine.price.toString(),
                medicine.stock.toString(),
                medicine.status,
            ]);
            const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `medicines_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleEditMedicine = (medicine: Medicine) => {
        setEditingMedicine(medicine);
        setIsModalOpen(true);
    };

    const handleDeleteMedicine = async (medicineId: string) => {
        if (!confirm("Ban co chac chan muon xoa thuoc nay?")) {
            return;
        }

        try {
            const { deleteDrug } = await import("@/services/medicineService");
            await deleteDrug(medicineId);
        } catch {
            // Keep local fallback.
        }

        setMedicines((current) => current.filter((medicine) => medicine.id !== medicineId));
    };

    const handleAddStock = (medicine: Medicine) => {
        setStockMedicine(medicine);
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async (medicineId: string, quantity: number, note: string) => {
        setMedicines((current) =>
            current.map((medicine) =>
                medicine.id === medicineId
                    ? {
                        ...medicine,
                        stock: medicine.stock + quantity,
                        stockLevel: medicine.stock + quantity > 100 ? "HIGH" : medicine.stock + quantity > 50 ? "NORMAL" : "LOW",
                    }
                    : medicine
            )
        );

        try {
            const { inventoryService } = await import("@/services/inventoryService");
            await inventoryService.createStockIn({
                items: [{ drugId: medicineId, quantity, note: note || undefined }],
            });
        } catch {
            // Local optimistic update is enough.
        }
    };

    const handleSubmitMedicine = async (medicineData: Partial<Medicine>) => {
        try {
            const { createDrug, updateDrug } = await import("@/services/medicineService");
            if (editingMedicine) {
                const updated = await updateDrug(editingMedicine.id, {
                    name: medicineData.name,
                    unit: medicineData.unit,
                    price: medicineData.price,
                    category: medicineData.category,
                    activeIngredient: medicineData.activeIngredient,
                    quantity: medicineData.stock,
                }).catch(() => null);

                const mapped = updated ? mapApiDrugToMedicine(updated) : null;
                setMedicines((current) =>
                    current.map((medicine) =>
                        medicine.id === editingMedicine.id
                            ? (mapped ?? { ...medicine, ...medicineData })
                            : medicine
                    )
                );
                return;
            }

            const created = await createDrug({
                name: medicineData.name || "",
                unit: medicineData.unit || "Hop",
                price: medicineData.price || 0,
                category: medicineData.category,
                activeIngredient: medicineData.activeIngredient,
                quantity: medicineData.stock,
            }).catch(() => null);

            const mapped = created ? mapApiDrugToMedicine(created) : null;
            const newMedicine: Medicine = mapped ?? {
                id: String(Date.now()),
                code: `SP-${new Date().getFullYear()}-${String(medicines.length + 1).padStart(3, "0")}`,
                name: medicineData.name || "",
                activeIngredient: medicineData.activeIngredient || "",
                unit: medicineData.unit || "Hop",
                unitDetail: medicineData.unitDetail,
                price: medicineData.price || 0,
                stock: medicineData.stock || 0,
                stockLevel: medicineData.stockLevel || "NORMAL",
                category: medicineData.category || "",
                status: MEDICINE_STATUS.IN_BUSINESS,
                expiryDate: medicineData.expiryDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setMedicines((current) => [newMedicine, ...current]);
        } catch {
            // Keep local state only.
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case MEDICINE_STATUS.IN_BUSINESS:
                return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: UI_TEXT.STATUS.IN_BUSINESS };
            case MEDICINE_STATUS.SUSPENDED:
                return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", label: UI_TEXT.STATUS.SUSPENDED };
            case MEDICINE_STATUS.OUT_OF_STOCK:
                return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: UI_TEXT.STATUS.OUT_OF_STOCK };
            default:
                return { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-600 dark:text-gray-300", label: status };
        }
    };

    const getStockStyle = (level: string) => {
        switch (level) {
            case "HIGH":
                return "text-green-600 bg-green-50 dark:bg-green-900/20";
            case "NORMAL":
                return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
            case "LOW":
                return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
            case "OUT":
                return "text-red-600 bg-red-50 dark:bg-red-900/20";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const dynamicStats = {
        total: medicines.length,
        lowStock: medicines.filter((medicine) => medicine.stockLevel === "LOW" || medicine.stockLevel === "OUT").length,
        expiringSoon: medicines.filter((medicine) => isWithinNextDays(medicine.expiryDate, 30)).length,
        totalValue: medicines.reduce((sum, medicine) => sum + medicine.price * medicine.stock, 0),
    };

    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-[#121417] dark:text-white">
                        {UI_TEXT.ADMIN.MEDICINES.TITLE}
                    </h1>
                    <p className="text-[#687582] dark:text-gray-400">
                        {UI_TEXT.ADMIN.MEDICINES.SUBTITLE}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".xlsx,.xls,.csv";
                            input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) {
                                    return;
                                }
                                const validation = validateFile(file, { maxSize: 5 * 1024 * 1024, allowedTypes: ["csv", "xlsx", "xls"] });
                                if (!validation.valid) {
                                    alert(validation.message);
                                    return;
                                }
                                try {
                                    const { importDrugs } = await import("@/services/medicineService");
                                    const result = await importDrugs(file);
                                    alert(`Nhap thanh cong${result?.imported ? `: ${result.imported} thuoc` : ""}!`);
                                    await loadMedicines();
                                } catch {
                                    alert("Nhap file that bai. Vui long thu lai.");
                                }
                            };
                            input.click();
                        }}
                        className="flex items-center gap-2 rounded-xl border border-[#dde0e4] bg-white px-5 py-2.5 text-sm font-bold text-[#121417] shadow-sm transition-colors hover:bg-gray-50 dark:border-[#2d353e] dark:bg-[#1e242b] dark:text-white dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        {UI_TEXT.ADMIN.MEDICINES.IMPORT_EXCEL}
                    </button>
                    <button
                        onClick={() => router.push("/admin/medicines/new")}
                        className="flex items-center gap-2 rounded-xl bg-[#3C81C6] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-[#2a6da8] dark:shadow-none"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        {UI_TEXT.ADMIN.MEDICINES.ADD_MEDICINE}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-xl border border-[#dde0e4] bg-white p-4 shadow-sm dark:border-[#2d353e] dark:bg-[#1e242b]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                        <span className="material-symbols-outlined">medication</span>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] dark:text-gray-400">{UI_TEXT.ADMIN.MEDICINES.TOTAL_MEDICINES}</p>
                        <p className="text-xl font-bold text-[#121417] dark:text-white">{dynamicStats.total.toLocaleString("vi-VN")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#dde0e4] bg-white p-4 shadow-sm dark:border-[#2d353e] dark:bg-[#1e242b]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] dark:text-gray-400">{UI_TEXT.ADMIN.MEDICINES.LOW_STOCK}</p>
                        <p className="text-xl font-bold text-[#121417] dark:text-white">{dynamicStats.lowStock}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#dde0e4] bg-white p-4 shadow-sm dark:border-[#2d353e] dark:bg-[#1e242b]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] dark:text-gray-400">{UI_TEXT.ADMIN.MEDICINES.EXPIRING_SOON}</p>
                        <p className="text-xl font-bold text-[#121417] dark:text-white">{dynamicStats.expiringSoon}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#dde0e4] bg-white p-4 shadow-sm dark:border-[#2d353e] dark:bg-[#1e242b]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] dark:text-gray-400">{UI_TEXT.ADMIN.MEDICINES.TOTAL_VALUE}</p>
                        <p className="text-xl font-bold text-[#121417] dark:text-white">{formatCurrency(dynamicStats.totalValue)}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-[#dde0e4] bg-white shadow-sm dark:border-[#2d353e] dark:bg-[#1e242b]">
                <div className="flex flex-col items-center justify-between gap-4 border-b border-[#dde0e4] p-4 sm:flex-row dark:border-[#2d353e]">
                    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#687582]">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-[#3C81C6] focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder={UI_TEXT.ADMIN.MEDICINES.SEARCH_PLACEHOLDER}
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-10 text-sm text-[#687582] transition-all focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        >
                            <option value="all">{UI_TEXT.ADMIN.MEDICINES.ALL_CATEGORIES}</option>
                            {MEDICINE_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="rounded-xl border border-gray-200 p-2.5 text-[#687582] transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            title="Xuat du lieu"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCategoryFilter("all");
                            }}
                            className="rounded-xl border border-gray-200 p-2.5 text-[#687582] transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            title="Xoa bo loc"
                        >
                            <span className="material-symbols-outlined text-[20px]">filter_list_off</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-[#dde0e4] bg-gray-50/50 dark:border-[#2d353e] dark:bg-gray-800/50">
                            <tr>
                                <th onClick={() => toggleSort("code")} className="cursor-pointer select-none px-6 py-4 text-xs font-semibold uppercase text-[#687582] hover:text-[#3C81C6] dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Ma thuoc
                                        {sortField === "code" && <span className="material-symbols-outlined text-[14px]">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>}
                                    </span>
                                </th>
                                <th onClick={() => toggleSort("name")} className="cursor-pointer select-none px-6 py-4 text-xs font-semibold uppercase text-[#687582] hover:text-[#3C81C6] dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Ten thuoc
                                        {sortField === "name" && <span className="material-symbols-outlined text-[14px]">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>}
                                    </span>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-[#687582] dark:text-gray-400">Hoat chat</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-[#687582] dark:text-gray-400">Don vi</th>
                                <th onClick={() => toggleSort("price")} className="cursor-pointer select-none px-6 py-4 text-xs font-semibold uppercase text-[#687582] hover:text-[#3C81C6] dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Gia ban
                                        {sortField === "price" && <span className="material-symbols-outlined text-[14px]">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>}
                                    </span>
                                </th>
                                <th onClick={() => toggleSort("stock")} className="cursor-pointer select-none px-6 py-4 text-xs font-semibold uppercase text-[#687582] hover:text-[#3C81C6] dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Ton kho
                                        {sortField === "stock" && <span className="material-symbols-outlined text-[14px]">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>}
                                    </span>
                                </th>
                                <th onClick={() => toggleSort("status")} className="cursor-pointer select-none px-6 py-4 text-xs font-semibold uppercase text-[#687582] hover:text-[#3C81C6] dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Trang thai
                                        {sortField === "status" && <span className="material-symbols-outlined text-[14px]">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>}
                                    </span>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-[#687582] dark:text-gray-400">{UI_TEXT.COMMON.ACTIONS}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dde0e4] dark:divide-[#2d353e]">
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#687582] dark:text-gray-400">
                                        <span className="material-symbols-outlined mb-2 block text-4xl">search_off</span>
                                        {UI_TEXT.TABLE.NO_RESULTS}
                                    </td>
                                </tr>
                            ) : filteredMedicines.map((medicine) => {
                                const statusStyle = getStatusStyle(medicine.status);
                                return (
                                    <tr key={medicine.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-[#3C81C6]">{medicine.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[#121417] dark:text-white">{medicine.name}</p>
                                            <p className="text-xs text-[#687582] dark:text-gray-400">{medicine.category}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="max-w-[200px] truncate text-sm text-[#121417] dark:text-gray-200">{medicine.activeIngredient}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#121417] dark:text-gray-200">{medicine.unit}</p>
                                            {medicine.unitDetail && (
                                                <p className="text-xs text-[#687582] dark:text-gray-400">{medicine.unitDetail}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-[#121417] dark:text-white">
                                                {medicine.price.toLocaleString("vi-VN")}d
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${getStockStyle(medicine.stockLevel)}`}>
                                                {medicine.stock.toLocaleString("vi-VN")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                                                {statusStyle.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu
                                                items={[
                                                    {
                                                        label: "Chinh sua",
                                                        icon: "edit",
                                                        onClick: () => handleEditMedicine(medicine),
                                                    },
                                                    {
                                                        label: "Nhap them kho",
                                                        icon: "add_box",
                                                        onClick: () => handleAddStock(medicine),
                                                    },
                                                    {
                                                        label: "Xoa",
                                                        icon: "delete",
                                                        onClick: () => handleDeleteMedicine(medicine.id),
                                                        variant: "danger",
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <MedicineFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitMedicine}
                initialData={editingMedicine || undefined}
                mode={editingMedicine ? "edit" : "create"}
            />

            {stockMedicine && (
                <AddStockModal
                    isOpen={isStockModalOpen}
                    onClose={() => {
                        setIsStockModalOpen(false);
                        setStockMedicine(null);
                    }}
                    onSubmit={handleStockSubmit}
                    medicine={stockMedicine}
                />
            )}
        </>
    );
}
