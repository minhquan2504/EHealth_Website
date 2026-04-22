/**
 * Routes constants - Tất cả route strings được định nghĩa tại đây
 * KHÔNG hard-code route strings trong components
 */

export const ROUTES = {
  // Public routes (không cần đăng nhập)
  PUBLIC: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
    OTP: "/otp",
    LANDING: "/",
    SPECIALTIES: "/specialties",
    DOCTORS: "/doctors",
    DOCTOR_DETAIL: (id: string) => `/doctors/${id}`,
    SERVICES: "/services",
    BOOKING: "/booking",
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin",
    // Quản lý nhân sự
    USERS: "/admin/users",
    USERS_ROLES: "/admin/users/roles",
    DOCTORS: "/admin/doctors",
    PERMISSIONS: "/admin/permissions",
    MASTER_DATA: "/admin/master-data",
    NOTIF_ROLE_CONFIGS: "/admin/notifications/role-configs",
    NOTIF_BROADCAST: "/admin/notifications/broadcast",
    // Quản lý cơ sở y tế
    DEPARTMENTS: "/admin/departments",
    HOSPITALS: "/admin/hospitals",
    TIME_SLOTS: "/admin/hospitals/time-slots",
    SCHEDULES: "/admin/schedules",
    BRANCHES: "/admin/branches",
    SERVICES: "/admin/services",
    CLINIC_ROOMS: "/admin/clinic-rooms",
    EQUIPMENT: "/admin/equipment",
    BEDS: "/admin/beds",
    SPECIALTIES: "/admin/specialties",
    // Vận hành nhân sự
    SHIFTS: "/admin/shifts",
    STAFF_SCHEDULE: "/admin/staff-schedule",
    DOCTOR_LOAD: "/admin/doctor-load",
    LEAVES: "/admin/leaves",
    SHIFT_SWAPS: "/admin/shift-swaps",
    // Cấu hình vận hành
    SLOTS_CONFIG: "/admin/slots/config",
    SLOTS_LOCKED: "/admin/slots/locked",
    SHIFT_SERVICES: "/admin/shifts/services",
    SERVICE_DURATIONS: "/admin/facilities/service-durations",
    BOOKING_CONFIGS: "/admin/branches/booking-configs",
    OPERATING_HOURS: "/admin/operating-hours",
    FACILITY_STATUS: "/admin/facility-status",
    // Điều phối
    APPOINTMENT_CHANGES: "/admin/appointment-changes",
    DOCTOR_AVAILABILITY: "/admin/doctor-availability",
    // Telemedicine (admin-facing)
    TELE_TYPES: "/admin/teleconsultation/types",
    TELE_BOOKINGS: "/admin/teleconsultation/bookings",
    TELE_ROOMS: "/admin/teleconsultation/rooms",
    TELE_RESULTS: "/admin/teleconsultation/results",
    TELE_PRESCRIPTIONS: "/admin/teleconsultation/prescriptions",
    TELE_FOLLOWUPS: "/admin/teleconsultation/follow-ups",
    TELE_QUALITY: "/admin/teleconsultation/quality",
    // Kho thuốc
    MEDICINES: "/admin/medicines",
    MEDICINES_IMPORT: "/admin/medicines/import",
    MEDICINES_EXPORT: "/admin/medicines/export",
    MEDICINES_STOCK: "/admin/medicines/stock",
    SUPPLIERS: "/admin/suppliers",
    WAREHOUSES: "/admin/warehouses",
    PHARMACY_CATEGORIES: "/admin/pharmacy/categories",
    // Tài chính
    BILLING_INVOICES: "/admin/billing-invoices",
    PRICING_POLICIES: "/admin/pricing-policies",
    E_INVOICES: "/admin/e-invoices",
    PROMOTIONS: "/admin/promotions",
    RECONCILIATION: "/admin/reconciliation",
    REFUNDS: "/admin/refunds",
    PAYMENT_GATEWAY: "/admin/payment-gateway",
    // Thống kê & Khác
    STATISTICS: "/admin/statistics",
    STATISTICS_REVENUE: "/admin/statistics/revenue",
    ACTIVITY_LOGS: "/admin/activity-logs",
    SETTINGS: "/admin/settings",
  },

  // Portal routes (Doctor, Pharmacist, Staff)
  PORTAL: {
    DOCTOR: {
      DASHBOARD: "/portal/doctor",
      TASKS: "/portal/doctor/tasks",
      ALERTS: "/portal/doctor/alerts",
      APPOINTMENTS: "/portal/doctor/appointments",
      QUEUE: "/portal/doctor/queue",
      SCHEDULE: "/portal/doctor/schedule",
      LEAVES: "/portal/doctor/leaves",
      SHIFT_SWAPS: "/portal/doctor/shift-swaps",
      EXAMINATION: "/portal/doctor/examination",
      MEDICAL_RECORDS: "/portal/doctor/medical-records",
      PRESCRIPTIONS: "/portal/doctor/prescriptions",
      AI_ASSISTANT: "/portal/doctor/ai-assistant",
      TELEMEDICINE: "/portal/doctor/telemedicine",
      SETTINGS: "/portal/doctor/settings",
    },
    PHARMACIST: {
      DASHBOARD: "/portal/pharmacist",
      PRESCRIPTIONS: "/portal/pharmacist/prescriptions",
      DISPENSING: "/portal/pharmacist/dispensing",
      INVENTORY: "/portal/pharmacist/inventory",
      SETTINGS: "/portal/pharmacist/settings",
    },
    STAFF: {
      DASHBOARD: "/portal/receptionist",
      RECEPTION: "/portal/receptionist/reception",
      APPOINTMENTS: "/portal/receptionist/appointments",
      QUEUE: "/portal/receptionist/queue",
      PATIENTS: "/portal/receptionist/patients",
      BILLING: "/portal/receptionist/billing",
      SETTINGS: "/portal/receptionist/settings",
    },
  },

  // Patient routes (cần đăng nhập role PATIENT)
  PATIENT: {
    DASHBOARD: "/patient",
    LOGIN: "/patient/login",
    REGISTER: "/patient/register",
    BOOKING_SUCCESS: "/patient/booking-success",
    APPOINTMENTS: "/patient/appointments",
    APPOINTMENT_DETAIL: (id: string) => `/patient/appointments/${id}`,
    PATIENT_PROFILES: "/patient/patient-profiles",
    PROFILE: "/patient/profile",
    MEDICAL_RECORDS: "/patient/medical-records",
    HEALTH_RECORDS: "/patient/health-records",
    BILLING: "/patient/billing",
    TELEMEDICINE: "/patient/telemedicine",
    AI_CONSULT: "/patient/ai-consult",
    MEDICATION_REMINDERS: "/patient/medication-reminders",
  },
} as const;

// Doctor sidebar menu items
export const DOCTOR_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.DOCTOR.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "tasks",
    href: ROUTES.PORTAL.DOCTOR.TASKS,
    icon: "checklist",
    label: "Việc cần làm",
  },
  {
    key: "alerts",
    href: ROUTES.PORTAL.DOCTOR.ALERTS,
    icon: "notifications_active",
    label: "Cảnh báo",
  },
  {
    key: "appointments",
    href: ROUTES.PORTAL.DOCTOR.APPOINTMENTS,
    icon: "calendar_month",
    label: "Lịch hẹn",
  },
  {
    key: "queue",
    href: ROUTES.PORTAL.DOCTOR.QUEUE,
    icon: "groups",
    label: "Hàng đợi",
  },
  {
    key: "schedule",
    href: ROUTES.PORTAL.DOCTOR.SCHEDULE,
    icon: "event_note",
    label: "Lịch làm việc",
  },
  {
    key: "leaves",
    href: ROUTES.PORTAL.DOCTOR.LEAVES,
    icon: "event_busy",
    label: "Nghỉ phép",
  },
  {
    key: "shift-swaps",
    href: ROUTES.PORTAL.DOCTOR.SHIFT_SWAPS,
    icon: "swap_horiz",
    label: "Đổi ca",
  },
  {
    key: "examination",
    href: ROUTES.PORTAL.DOCTOR.EXAMINATION,
    icon: "stethoscope",
    label: "Khám bệnh",
  },
  {
    key: "medical-records",
    href: ROUTES.PORTAL.DOCTOR.MEDICAL_RECORDS,
    icon: "folder_shared",
    label: "Hồ sơ bệnh án",
  },
  {
    key: "prescriptions",
    href: ROUTES.PORTAL.DOCTOR.PRESCRIPTIONS,
    icon: "pill",
    label: "Kê đơn",
  },
  {
    key: "ai-assistant",
    href: ROUTES.PORTAL.DOCTOR.AI_ASSISTANT,
    icon: "smart_toy",
    label: "Trợ lý AI",
  },
  {
    key: "telemedicine",
    href: ROUTES.PORTAL.DOCTOR.TELEMEDICINE,
    icon: "videocam",
    label: "Khám từ xa",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.DOCTOR.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;

// Admin sidebar menu items — hỗ trợ nhóm + submenu
export interface AdminMenuItem {
  key: string;
  href?: string;
  icon: string;
  label: string;
  children?: { key: string; href: string; label: string }[];
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    key: "dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: "dashboard",
    label: "Trang chủ",
  },
  {
    key: "users",
    icon: "badge",
    label: "Quản lý nhân sự",
    children: [
      { key: "users-list", href: ROUTES.ADMIN.USERS, label: "Danh sách nhân sự" },
      { key: "doctors-list", href: ROUTES.ADMIN.DOCTORS, label: "Danh sách Bác sĩ" },
      { key: "users-roles", href: ROUTES.ADMIN.USERS_ROLES, label: "Vai trò" },
      { key: "permissions", href: ROUTES.ADMIN.PERMISSIONS, label: "Permissions/Menus" },
    ],
  },
  {
    key: "system-data",
    icon: "database",
    label: "Dữ liệu hệ thống",
    children: [
      { key: "master-data", href: ROUTES.ADMIN.MASTER_DATA, label: "Master Data" },
      { key: "notif-role-configs", href: ROUTES.ADMIN.NOTIF_ROLE_CONFIGS, label: "Cấu hình thông báo" },
      { key: "notif-broadcast", href: ROUTES.ADMIN.NOTIF_BROADCAST, label: "Gửi broadcast" },
    ],
  },
  {
    key: "hospital",
    icon: "local_hospital",
    label: "Cơ sở y tế",
    children: [
      { key: "hospitals", href: ROUTES.ADMIN.HOSPITALS, label: "Cơ sở / Bệnh viện" },
      { key: "branches", href: ROUTES.ADMIN.BRANCHES, label: "Chi nhánh" },
      { key: "departments", href: ROUTES.ADMIN.DEPARTMENTS, label: "Khoa / Phòng ban" },
      { key: "specialties", href: ROUTES.ADMIN.SPECIALTIES, label: "Chuyên khoa" },
      { key: "services", href: ROUTES.ADMIN.SERVICES, label: "Dịch vụ y tế" },
      { key: "clinic-rooms", href: ROUTES.ADMIN.CLINIC_ROOMS, label: "Phòng khám" },
      { key: "equipment", href: ROUTES.ADMIN.EQUIPMENT, label: "Thiết bị" },
      { key: "beds", href: ROUTES.ADMIN.BEDS, label: "Giường bệnh" },
      { key: "time-slots", href: ROUTES.ADMIN.TIME_SLOTS, label: "Cấu hình khung giờ" },
    ],
  },
  {
    key: "operations",
    icon: "schedule",
    label: "Vận hành nhân sự",
    children: [
      { key: "shifts", href: ROUTES.ADMIN.SHIFTS, label: "Ca làm việc" },
      { key: "staff-schedule", href: ROUTES.ADMIN.STAFF_SCHEDULE, label: "Lịch phân ca" },
      { key: "schedules", href: ROUTES.ADMIN.SCHEDULES, label: "Lịch trực" },
      { key: "leaves", href: ROUTES.ADMIN.LEAVES, label: "Nghỉ phép" },
      { key: "shift-swaps", href: ROUTES.ADMIN.SHIFT_SWAPS, label: "Đổi ca" },
    ],
  },
  {
    key: "ops-config",
    icon: "tune",
    label: "Cấu hình vận hành",
    children: [
      { key: "slots-config", href: ROUTES.ADMIN.SLOTS_CONFIG, label: "Khung giờ khám" },
      { key: "slots-locked", href: ROUTES.ADMIN.SLOTS_LOCKED, label: "Slot bị khoá" },
      { key: "shift-services", href: ROUTES.ADMIN.SHIFT_SERVICES, label: "Gán dịch vụ vào ca" },
      { key: "service-durations", href: ROUTES.ADMIN.SERVICE_DURATIONS, label: "Thời lượng dịch vụ" },
      { key: "booking-configs", href: ROUTES.ADMIN.BOOKING_CONFIGS, label: "Cấu hình booking" },
      { key: "operating-hours", href: ROUTES.ADMIN.OPERATING_HOURS, label: "Giờ hoạt động" },
      { key: "facility-status", href: ROUTES.ADMIN.FACILITY_STATUS, label: "Trạng thái cơ sở" },
    ],
  },
  {
    key: "coordination",
    icon: "hub",
    label: "Điều phối",
    children: [
      { key: "doctor-load", href: ROUTES.ADMIN.DOCTOR_LOAD, label: "Cân bằng tải bác sĩ" },
      { key: "doctor-availability", href: ROUTES.ADMIN.DOCTOR_AVAILABILITY, label: "Độ rảnh bác sĩ" },
      { key: "appointment-changes", href: ROUTES.ADMIN.APPOINTMENT_CHANGES, label: "Thay đổi lịch hẹn" },
    ],
  },
  {
    key: "telemedicine",
    icon: "videocam",
    label: "Khám từ xa",
    children: [
      { key: "tele-types", href: ROUTES.ADMIN.TELE_TYPES, label: "Loại & cấu hình" },
      { key: "tele-bookings", href: ROUTES.ADMIN.TELE_BOOKINGS, label: "Booking" },
      { key: "tele-rooms", href: ROUTES.ADMIN.TELE_ROOMS, label: "Room đang hoạt động" },
      { key: "tele-results", href: ROUTES.ADMIN.TELE_RESULTS, label: "Kết quả khám" },
      { key: "tele-prescriptions", href: ROUTES.ADMIN.TELE_PRESCRIPTIONS, label: "Đơn thuốc online" },
      { key: "tele-followups", href: ROUTES.ADMIN.TELE_FOLLOWUPS, label: "Follow-up" },
      { key: "tele-quality", href: ROUTES.ADMIN.TELE_QUALITY, label: "Chất lượng" },
    ],
  },
  {
    key: "medicines",
    icon: "medication",
    label: "Dược & Kho",
    children: [
      { key: "medicines-list", href: ROUTES.ADMIN.MEDICINES, label: "Danh mục thuốc" },
      { key: "medicines-import", href: ROUTES.ADMIN.MEDICINES_IMPORT, label: "Nhập kho" },
      { key: "medicines-export", href: ROUTES.ADMIN.MEDICINES_EXPORT, label: "Xuất kho" },
      { key: "medicines-stock", href: ROUTES.ADMIN.MEDICINES_STOCK, label: "Tồn kho" },
      { key: "warehouses", href: ROUTES.ADMIN.WAREHOUSES, label: "Quản lý kho" },
      { key: "suppliers", href: ROUTES.ADMIN.SUPPLIERS, label: "Nhà cung cấp" },
      { key: "pharmacy-categories", href: ROUTES.ADMIN.PHARMACY_CATEGORIES, label: "Nhóm thuốc" },
    ],
  },
  {
    key: "finance",
    icon: "payments",
    label: "Tài chính",
    children: [
      { key: "billing-invoices", href: ROUTES.ADMIN.BILLING_INVOICES, label: "Hoá đơn" },
      { key: "pricing-policies", href: ROUTES.ADMIN.PRICING_POLICIES, label: "Chính sách giá" },
      { key: "promotions", href: ROUTES.ADMIN.PROMOTIONS, label: "Khuyến mãi" },
      { key: "e-invoices", href: ROUTES.ADMIN.E_INVOICES, label: "Hoá đơn điện tử" },
      { key: "payment-gateway", href: ROUTES.ADMIN.PAYMENT_GATEWAY, label: "Cổng thanh toán" },
      { key: "reconciliation", href: ROUTES.ADMIN.RECONCILIATION, label: "Đối soát" },
      { key: "refunds", href: ROUTES.ADMIN.REFUNDS, label: "Hoàn tiền" },
    ],
  },
  {
    key: "statistics",
    icon: "bar_chart",
    label: "Thống kê",
    children: [
      { key: "statistics-overview", href: ROUTES.ADMIN.STATISTICS, label: "Tổng quan" },
      { key: "statistics-revenue", href: ROUTES.ADMIN.STATISTICS_REVENUE, label: "Báo cáo doanh thu" },
    ],
  },
  {
    key: "activity-logs",
    href: ROUTES.ADMIN.ACTIVITY_LOGS,
    icon: "history",
    label: "Nhật ký hoạt động",
  },
  {
    key: "settings",
    href: ROUTES.ADMIN.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
];

// Staff sidebar menu items (formerly Receptionist)
export const STAFF_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.STAFF.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "reception",
    href: ROUTES.PORTAL.STAFF.RECEPTION,
    icon: "how_to_reg",
    label: "Tiếp nhận BN",
  },
  {
    key: "appointments",
    href: ROUTES.PORTAL.STAFF.APPOINTMENTS,
    icon: "calendar_month",
    label: "Lịch hẹn",
  },
  {
    key: "queue",
    href: ROUTES.PORTAL.STAFF.QUEUE,
    icon: "groups",
    label: "Hàng đợi",
  },
  {
    key: "patients",
    href: ROUTES.PORTAL.STAFF.PATIENTS,
    icon: "person_add",
    label: "Bệnh nhân",
  },
  {
    key: "billing",
    href: ROUTES.PORTAL.STAFF.BILLING,
    icon: "receipt_long",
    label: "Thanh toán",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.STAFF.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;

// Backward compatibility alias
export const RECEPTIONIST_MENU_ITEMS = STAFF_MENU_ITEMS;

// Pharmacist sidebar menu items
export const PHARMACIST_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.PHARMACIST.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "prescriptions",
    href: ROUTES.PORTAL.PHARMACIST.PRESCRIPTIONS,
    icon: "pill",
    label: "Đơn thuốc",
  },
  {
    key: "dispensing",
    href: ROUTES.PORTAL.PHARMACIST.DISPENSING,
    icon: "local_pharmacy",
    label: "Cấp phát",
  },
  {
    key: "inventory",
    href: ROUTES.PORTAL.PHARMACIST.INVENTORY,
    icon: "inventory_2",
    label: "Kho thuốc",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.PHARMACIST.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;

// Patient sidebar menu items
export const PATIENT_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PATIENT.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "appointments",
    href: ROUTES.PATIENT.APPOINTMENTS,
    icon: "calendar_month",
    label: "Lịch hẹn của tôi",
  },
  {
    key: "patient-profiles",
    href: ROUTES.PATIENT.PATIENT_PROFILES,
    icon: "family_restroom",
    label: "Hồ sơ bệnh nhân",
  },
  {
    key: "medical-records",
    href: ROUTES.PATIENT.MEDICAL_RECORDS,
    icon: "folder_shared",
    label: "Kết quả khám",
  },
  {
    key: "health-records",
    href: ROUTES.PATIENT.HEALTH_RECORDS,
    icon: "monitor_heart",
    label: "Hồ sơ sức khỏe",
  },
  {
    key: "medication-reminders",
    href: ROUTES.PATIENT.MEDICATION_REMINDERS,
    icon: "medication",
    label: "Nhắc thuốc",
  },
  {
    key: "billing",
    href: ROUTES.PATIENT.BILLING,
    icon: "receipt_long",
    label: "Thanh toán",
  },
  {
    key: "telemedicine",
    href: ROUTES.PATIENT.TELEMEDICINE,
    icon: "videocam",
    label: "Khám từ xa",
  },
  {
    key: "ai-consult",
    href: ROUTES.PATIENT.AI_CONSULT,
    icon: "smart_toy",
    label: "AI tư vấn",
  },
  {
    key: "profile",
    href: ROUTES.PATIENT.PROFILE,
    icon: "manage_accounts",
    label: "Tài khoản",
  },
] as const;
