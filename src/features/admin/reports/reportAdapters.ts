import { unwrap } from '@/api/response';

type UnknownRecord = Record<string, unknown>;

export interface DashboardStatsDto {
    totalRevenue: number;
    revenueChange: number;
    todayVisits: number;
    visitsChange: number;
    doctorsOnDuty: number;
    totalDoctors: number;
    medicineAlerts: number;
}

export interface DashboardOverviewDto {
    totalPatients: number;
    patientChange: number;
    avgDailyVisits: number;
    visitChange: number;
    rating: number;
    ratingTrend: 'up' | 'down' | 'flat';
}

export interface DashboardDepartmentDto {
    department: string;
    icon: string;
    color: string;
    totalDoctors: number;
    onDuty: number;
    patientsWaiting: number;
}

export interface DashboardAppointmentDto {
    id: string;
    patientName: string;
    patientAge: number | null;
    doctorName: string;
    department: string;
    time: string;
    date: string;
    status: string;
    type: string;
}

export interface DashboardQueueItemDto {
    id: string;
    order: number;
    patientName: string;
    patientCode: string;
    department: string;
    doctor: string;
    waitTime: string;
    status: string;
}

export interface DashboardMedicineAlertDto {
    id: string;
    name: string;
    code: string;
    stock: number;
    unit: string;
    alertType: string;
    alertLabel: string;
    expiryDate: string;
}

export interface DashboardReportDto {
    stats: DashboardStatsDto;
    patientGrowth: Array<{ month: string; value: number }>;
    revenueData: Array<{ month: string; value: number }>;
    departments: DashboardDepartmentDto[];
    upcomingAppointments: DashboardAppointmentDto[];
    patientQueue: DashboardQueueItemDto[];
    medicineAlerts: DashboardMedicineAlertDto[];
    fillRate: number;
    overview: DashboardOverviewDto;
}

export interface RevenueDepartmentDto {
    departmentName: string;
    revenue: number;
    patientCount: number;
}

export interface RevenueComparisonDto {
    label: string;
    revenue: number;
    target: number;
}

export interface RevenueDoctorDto {
    name: string;
    departmentName: string;
    revenue: number;
    patientCount: number;
}

export interface RevenueReportDto {
    total: number;
    growth: number;
    avgPerDoctor: number;
    avgChange: number;
    totalPatients: number;
    patientGrowth: number;
    chartData: Array<{ label: string; value: number }>;
    byDepartment: RevenueDepartmentDto[];
    comparison: RevenueComparisonDto[];
    topDoctors: RevenueDoctorDto[];
}

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asObject = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const readString = (value: unknown, fallback: string = ''): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return fallback;
};

const readNullableString = (value: unknown): string | null => {
    const text = readString(value).trim();
    return text ? text : null;
};

const readNumber = (value: unknown, fallback: number = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
};

const normalizeTrend = (value: unknown): 'up' | 'down' | 'flat' => {
    const text = readString(value).trim().toLowerCase();
    if (text === 'up' || text === 'down') {
        return text;
    }
    return 'flat';
};

const normalizeAppointmentStatus = (value: unknown): string => {
    switch (readString(value).trim().toUpperCase()) {
        case 'CONFIRMED':
            return 'confirmed';
        case 'IN_PROGRESS':
        case 'EXAMINING':
            return 'in_progress';
        case 'CANCELLED':
            return 'cancelled';
        case 'PENDING':
        case 'WAITING':
        default:
            return 'waiting';
    }
};

const normalizeQueueStatus = (value: unknown): string => {
    switch (readString(value).trim().toUpperCase()) {
        case 'IN_PROGRESS':
        case 'EXAMINING':
            return 'examining';
        case 'CHECKED_IN':
            return 'checked_in';
        case 'WAITING':
        case 'PENDING':
        default:
            return 'waiting';
    }
};

const normalizeAlertType = (value: unknown): string => {
    switch (readString(value).trim().toUpperCase()) {
        case 'OUT_OF_STOCK':
            return 'out_of_stock';
        case 'EXPIRING':
            return 'expiring';
        case 'LOW_STOCK_AND_EXPIRING':
            return 'low_stock_and_expiring';
        case 'LOW_STOCK':
        default:
            return 'low_stock';
    }
};

const normalizeMonthSeries = (value: unknown, key: 'month' | 'label' = 'month') =>
    asArray(value)
        .map((item) => {
            const row = asObject(item);
            const label = readString(row[key] ?? row.label ?? row.month);
            if (!label) {
                return null;
            }
            return {
                month: label,
                value: readNumber(row.value),
            };
        })
        .filter((item): item is { month: string; value: number } => item !== null);

export const emptyDashboardReport = (): DashboardReportDto => ({
    stats: {
        totalRevenue: 0,
        revenueChange: 0,
        todayVisits: 0,
        visitsChange: 0,
        doctorsOnDuty: 0,
        totalDoctors: 0,
        medicineAlerts: 0,
    },
    patientGrowth: [],
    revenueData: [],
    departments: [],
    upcomingAppointments: [],
    patientQueue: [],
    medicineAlerts: [],
    fillRate: 0,
    overview: {
        totalPatients: 0,
        patientChange: 0,
        avgDailyVisits: 0,
        visitChange: 0,
        rating: 0,
        ratingTrend: 'flat',
    },
});

export const emptyRevenueReport = (): RevenueReportDto => ({
    total: 0,
    growth: 0,
    avgPerDoctor: 0,
    avgChange: 0,
    totalPatients: 0,
    patientGrowth: 0,
    chartData: [],
    byDepartment: [],
    comparison: [],
    topDoctors: [],
});

export const normalizeDashboardReport = (raw: unknown): DashboardReportDto => {
    const base = emptyDashboardReport();
    const data = asObject(unwrap(raw));
    const stats = asObject(data.stats);
    const overview = asObject(data.overview);

    return {
        stats: {
            totalRevenue: readNumber(stats.totalRevenue),
            revenueChange: readNumber(stats.revenueChange),
            todayVisits: readNumber(stats.todayVisits),
            visitsChange: readNumber(stats.visitsChange),
            doctorsOnDuty: readNumber(stats.doctorsOnDuty),
            totalDoctors: readNumber(stats.totalDoctors),
            medicineAlerts: readNumber(stats.medicineAlerts),
        },
        patientGrowth: normalizeMonthSeries(data.patientGrowth),
        revenueData: normalizeMonthSeries(data.revenueData),
        departments: asArray(data.departments)
            .map((item) => {
                const row = asObject(item);
                const department = readString(row.department);
                if (!department) {
                    return null;
                }
                return {
                    department,
                    icon: readString(row.icon, 'local_hospital'),
                    color: readString(row.color, '#3C81C6'),
                    totalDoctors: readNumber(row.totalDoctors),
                    onDuty: readNumber(row.onDuty),
                    patientsWaiting: readNumber(row.patientsWaiting),
                };
            })
            .filter((item): item is DashboardDepartmentDto => item !== null),
        upcomingAppointments: asArray(data.upcomingAppointments)
            .map((item, index) => {
                const row = asObject(item);
                return {
                    id: readString(row.id, `appointment-${index}`),
                    patientName: readString(row.patientName, 'Unknown patient'),
                    patientAge: readNullableString(row.patientAge) === null ? null : readNumber(row.patientAge),
                    doctorName: readString(row.doctorName, 'Unassigned'),
                    department: readString(row.department, 'General'),
                    time: readString(row.time, '--:--'),
                    date: readString(row.date),
                    status: normalizeAppointmentStatus(row.status),
                    type: readString(row.type, 'General consultation'),
                };
            }),
        patientQueue: asArray(data.patientQueue)
            .map((item, index) => {
                const row = asObject(item);
                return {
                    id: readString(row.id, `queue-${index}`),
                    order: readNumber(row.order, index + 1),
                    patientName: readString(row.patientName, 'Unknown patient'),
                    patientCode: readString(row.patientCode, 'N/A'),
                    department: readString(row.department, 'General'),
                    doctor: readString(row.doctor, 'Unassigned'),
                    waitTime: readString(row.waitTime, '0 min'),
                    status: normalizeQueueStatus(row.status),
                };
            }),
        medicineAlerts: asArray(data.medicineAlerts)
            .map((item, index) => {
                const row = asObject(item);
                return {
                    id: readString(row.id, `medicine-alert-${index}`),
                    name: readString(row.name, 'Unknown medicine'),
                    code: readString(row.code, `medicine-alert-${index}`),
                    stock: readNumber(row.stock),
                    unit: readString(row.unit, 'unit'),
                    alertType: normalizeAlertType(row.alertType),
                    alertLabel: readString(row.alertLabel, 'Alert'),
                    expiryDate: readString(row.expiryDate, '-'),
                };
            }),
        fillRate: readNumber(data.fillRate),
        overview: {
            totalPatients: readNumber(overview.totalPatients),
            patientChange: readNumber(overview.patientChange),
            avgDailyVisits: readNumber(overview.avgDailyVisits),
            visitChange: readNumber(overview.visitChange),
            rating: readNumber(overview.rating),
            ratingTrend: normalizeTrend(overview.ratingTrend),
        },
    };
};

export const normalizeRevenueReport = (raw: unknown): RevenueReportDto => {
    const data = asObject(unwrap(raw));

    return {
        total: readNumber(data.total),
        growth: readNumber(data.growth),
        avgPerDoctor: readNumber(data.avgPerDoctor),
        avgChange: readNumber(data.avgChange),
        totalPatients: readNumber(data.totalPatients),
        patientGrowth: readNumber(data.patientGrowth),
        chartData: asArray(data.chartData)
            .map((item) => {
                const row = asObject(item);
                const label = readString(row.label);
                if (!label) {
                    return null;
                }
                return {
                    label,
                    value: readNumber(row.value),
                };
            })
            .filter((item): item is { label: string; value: number } => item !== null),
        byDepartment: asArray(data.byDepartment)
            .map((item) => {
                const row = asObject(item);
                const departmentName = readString(row.departmentName);
                if (!departmentName) {
                    return null;
                }
                return {
                    departmentName,
                    revenue: readNumber(row.revenue),
                    patientCount: readNumber(row.patientCount),
                };
            })
            .filter((item): item is RevenueDepartmentDto => item !== null),
        comparison: asArray(data.comparison)
            .map((item) => {
                const row = asObject(item);
                const label = readString(row.label);
                if (!label) {
                    return null;
                }
                return {
                    label,
                    revenue: readNumber(row.revenue),
                    target: readNumber(row.target),
                };
            })
            .filter((item): item is RevenueComparisonDto => item !== null),
        topDoctors: asArray(data.topDoctors)
            .map((item) => {
                const row = asObject(item);
                const name = readString(row.name);
                if (!name) {
                    return null;
                }
                return {
                    name,
                    departmentName: readString(row.departmentName, 'General'),
                    revenue: readNumber(row.revenue),
                    patientCount: readNumber(row.patientCount),
                };
            })
            .filter((item): item is RevenueDoctorDto => item !== null),
    };
};
