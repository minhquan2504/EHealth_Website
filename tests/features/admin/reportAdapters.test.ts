import { describe, expect, it } from "vitest";
import {
    normalizeDashboardReport,
    normalizeRevenueReport,
} from "@/features/admin/reports/reportAdapters";

describe("reportAdapters", () => {
    it("normalizes dashboard payload into the admin dashboard dto", () => {
        const report = normalizeDashboardReport({
            data: {
                success: true,
                data: {
                    stats: {
                        totalRevenue: 12500000,
                        revenueChange: 12,
                        todayVisits: 32,
                        visitsChange: -5,
                        doctorsOnDuty: 7,
                        totalDoctors: 10,
                        medicineAlerts: 3,
                    },
                    patientGrowth: [{ month: "T1", value: 25 }],
                    revenueData: [{ month: "T1", value: 4200000 }],
                    departments: [{ department: "Tim mach", icon: "cardiology", color: "#ef4444", totalDoctors: 5, onDuty: 3, patientsWaiting: 8 }],
                    upcomingAppointments: [{ id: "apt-1", patientName: "Nguyen Van A", patientAge: 40, doctorName: "BS B", department: "Tim mach", time: "08:00", date: "2026-04-17", status: "PENDING", type: "Tai kham" }],
                    patientQueue: [{ id: "queue-1", order: 1, patientName: "Le Thi C", patientCode: "BN001", department: "Tong quat", doctor: "BS D", waitTime: "15 phut", status: "IN_PROGRESS" }],
                    medicineAlerts: [{ id: "med-1", name: "Aspirin", code: "MED-01", stock: 5, unit: "vien", alertType: "LOW_STOCK_AND_EXPIRING", alertLabel: "Can xu ly", expiryDate: "2026-05-01" }],
                    fillRate: 82,
                    overview: {
                        totalPatients: 500,
                        patientChange: 10,
                        avgDailyVisits: 18,
                        visitChange: 5,
                        rating: 4.5,
                        ratingTrend: "up",
                    },
                },
            },
        });

        expect(report.stats.totalRevenue).toBe(12500000);
        expect(report.upcomingAppointments[0]?.status).toBe("waiting");
        expect(report.patientQueue[0]?.status).toBe("examining");
        expect(report.medicineAlerts[0]?.alertType).toBe("low_stock_and_expiring");
        expect(report.overview.ratingTrend).toBe("up");
    });

    it("normalizes revenue payload without guessing fallback fields", () => {
        const report = normalizeRevenueReport({
            data: {
                success: true,
                data: {
                    total: 56000000,
                    growth: 9,
                    avgPerDoctor: 14000000,
                    avgChange: 4,
                    totalPatients: 120,
                    patientGrowth: 6,
                    chartData: [{ label: "Tuan 1", value: 12000000 }],
                    byDepartment: [{ departmentName: "Noi tong quat", revenue: 22000000, patientCount: 48 }],
                    comparison: [{ label: "Tuan 1", revenue: 12000000, target: 10000000 }],
                    topDoctors: [{ name: "BS E", departmentName: "Noi tong quat", revenue: 18000000, patientCount: 24 }],
                },
            },
        });

        expect(report.total).toBe(56000000);
        expect(report.chartData).toEqual([{ label: "Tuan 1", value: 12000000 }]);
        expect(report.byDepartment[0]).toEqual({
            departmentName: "Noi tong quat",
            revenue: 22000000,
            patientCount: 48,
        });
        expect(report.topDoctors[0]?.departmentName).toBe("Noi tong quat");
    });
});
