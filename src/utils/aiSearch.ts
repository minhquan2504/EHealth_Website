export type AISearchResultType = 'patient' | 'medicine' | 'appointment' | 'record';

export interface AISearchResult {
    id: string;
    type: AISearchResultType;
    title: string;
    subtitle: string;
    href: string;
}

export interface AISearchResponsePayload {
    data?: unknown;
    message?: string;
    results?: unknown[];
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asObject = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const readString = (value: unknown, fallback: string = ''): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return fallback;
};

const normalizeType = (value: unknown): AISearchResultType => {
    const type = readString(value).trim().toLowerCase();
    if (type === 'patient' || type === 'medicine' || type === 'appointment') {
        return type;
    }
    return 'record';
};

export const isSafeInternalHref = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false;
    }

    return value.startsWith('/') && !value.startsWith('//');
};

const normalizeSearchResult = (raw: unknown, index: number): AISearchResult | null => {
    const row = asObject(raw);
    const title = readString(row.title ?? row.name ?? row.label);
    if (!title) {
        return null;
    }

    const hrefValue = row.href ?? row.url ?? row.path;

    return {
        id: readString(row.id ?? row.code, `ai-search-${index}`),
        type: normalizeType(row.type),
        title,
        subtitle: readString(row.subtitle ?? row.description ?? row.snippet),
        href: isSafeInternalHref(hrefValue) ? hrefValue : '#',
    };
};

const tryParseJson = (value: string): unknown => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const findResultsArray = (payload: unknown): unknown[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    const root = asObject(payload);
    const nestedData = root.data;

    if (Array.isArray(root.results)) {
        return root.results;
    }

    if (Array.isArray(nestedData)) {
        return nestedData;
    }

    if (isRecord(nestedData) && Array.isArray(nestedData.results)) {
        return nestedData.results;
    }

    const message = readString(root.message) || (isRecord(nestedData) ? readString(nestedData.message) : '');
    if (!message) {
        return [];
    }

    const parsed = tryParseJson(message);
    return parsed ? findResultsArray(parsed) : [];
};

export const extractAISearchResults = (payload: unknown): AISearchResult[] => {
    const seen = new Set<string>();

    return findResultsArray(payload)
        .map((item, index) => normalizeSearchResult(item, index))
        .filter((item): item is AISearchResult => item !== null)
        .filter((item) => {
            const key = `${item.id}:${item.href}:${item.title}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
};

export const getLocalFallbackSearchResults = (query: string, role: string): AISearchResult[] => {
    const safeQuery = query.trim();
    const lowerRole = role.trim().toLowerCase();

    if (lowerRole === 'doctor') {
        return [
            { id: 'doctor-appointment', type: 'appointment', title: `Appointments: ${safeQuery}`, subtitle: 'Open doctor appointment list', href: '/portal/doctor/appointments' },
            { id: 'doctor-records', type: 'record', title: `Records: ${safeQuery}`, subtitle: 'Open medical records workspace', href: '/portal/doctor/medical-records' },
        ];
    }

    if (lowerRole === 'pharmacist') {
        return [
            { id: 'pharmacy-inventory', type: 'medicine', title: `Inventory: ${safeQuery}`, subtitle: 'Open pharmacist inventory', href: '/portal/pharmacist/inventory' },
            { id: 'pharmacy-prescriptions', type: 'record', title: `Prescriptions: ${safeQuery}`, subtitle: 'Open prescription queue', href: '/portal/pharmacist/prescriptions' },
        ];
    }

    if (lowerRole === 'receptionist') {
        return [
            { id: 'staff-appointments', type: 'appointment', title: `Appointments: ${safeQuery}`, subtitle: 'Open receptionist appointments', href: '/portal/receptionist/appointments' },
            { id: 'staff-patients', type: 'patient', title: `Patients: ${safeQuery}`, subtitle: 'Open patient list', href: '/portal/receptionist/patients' },
        ];
    }

    if (lowerRole === 'patient') {
        return [
            { id: 'patient-appointments', type: 'appointment', title: `Appointments: ${safeQuery}`, subtitle: 'Open your appointments', href: '/patient/appointments' },
            { id: 'patient-records', type: 'record', title: `Records: ${safeQuery}`, subtitle: 'Open your medical records', href: '/patient/medical-records' },
        ];
    }

    return [
        { id: 'admin-dashboard', type: 'record', title: `Dashboard: ${safeQuery}`, subtitle: 'Open admin dashboard', href: '/admin' },
        { id: 'admin-statistics', type: 'appointment', title: `Statistics: ${safeQuery}`, subtitle: 'Open admin statistics', href: '/admin/statistics' },
        { id: 'admin-medicines', type: 'medicine', title: `Medicines: ${safeQuery}`, subtitle: 'Open medicine catalog', href: '/admin/medicines' },
    ];
};
