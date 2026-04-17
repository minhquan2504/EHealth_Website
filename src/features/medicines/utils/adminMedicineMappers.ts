import { MEDICINE_STATUS, STOCK_LEVEL } from '@/constants/status';
import type { Medicine } from '@/types';

type UnknownRecord = Record<string, unknown>;

export interface AdminStockItem {
    id: string;
    code: string;
    name: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    batchNumber: string;
    expiryDate: string;
    stockLevel: 'HIGH' | 'NORMAL' | 'LOW' | 'OUT';
}

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

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

const normalizeStockLevel = (quantity: number, minStock: number, explicit?: unknown): Medicine['stockLevel'] => {
    const text = readString(explicit).trim().toUpperCase();
    if (text === STOCK_LEVEL.HIGH || text === STOCK_LEVEL.NORMAL || text === STOCK_LEVEL.LOW || text === STOCK_LEVEL.OUT) {
        return text as Medicine['stockLevel'];
    }

    if (quantity <= 0) {
        return STOCK_LEVEL.OUT;
    }

    if (quantity <= Math.max(minStock, 0)) {
        return STOCK_LEVEL.LOW;
    }

    if (minStock > 0 && quantity >= minStock * 3) {
        return STOCK_LEVEL.HIGH;
    }

    return STOCK_LEVEL.NORMAL;
};

const normalizeMedicineStatus = (value: unknown, quantity: number): Medicine['status'] => {
    const text = readString(value).trim().toUpperCase();

    if (text === MEDICINE_STATUS.IN_BUSINESS || text === MEDICINE_STATUS.SUSPENDED || text === MEDICINE_STATUS.OUT_OF_STOCK) {
        return text as Medicine['status'];
    }

    if (text === 'LOW_STOCK' || text === 'AVAILABLE' || text === 'ACTIVE') {
        return MEDICINE_STATUS.IN_BUSINESS;
    }

    if (text === 'OUT' || text === 'OUT_OF_STOCK') {
        return MEDICINE_STATUS.OUT_OF_STOCK;
    }

    return quantity <= 0 ? MEDICINE_STATUS.OUT_OF_STOCK : MEDICINE_STATUS.IN_BUSINESS;
};

export const resolveStableMedicineId = (raw: unknown): string | null => {
    const row = asObject(raw);
    const value =
        row.id ??
        row.drugId ??
        row.drug_id ??
        row.pharmacyInventoryId ??
        row.pharmacy_inventory_id ??
        row.code ??
        row.drugCode ??
        row.drug_code;

    const id = readString(value).trim();
    return id ? id : null;
};

export const mapApiDrugToMedicine = (raw: unknown): Medicine | null => {
    const row = asObject(raw);
    const id = resolveStableMedicineId(row);
    if (!id) {
        return null;
    }

    const stock = readNumber(row.quantity ?? row.stock);
    const minStock = readNumber(row.minQuantity ?? row.minStock);

    return {
        id,
        code: readString(row.code ?? row.drugCode, id),
        name: readString(row.name, 'Unknown medicine'),
        activeIngredient: readString(row.activeIngredient ?? row.active_ingredient ?? row.genericName),
        unit: readString(row.unit, 'unit'),
        unitDetail: readString(row.unitDetail),
        price: readNumber(row.price),
        stock,
        stockLevel: normalizeStockLevel(stock, minStock, row.stockLevel),
        category: readString(row.category, 'Uncategorized'),
        status: normalizeMedicineStatus(row.status, stock),
        expiryDate: readString(row.expiryDate ?? row.expiry_date),
        createdAt: readString(row.createdAt ?? row.created_at, ''),
        updatedAt: readString(row.updatedAt ?? row.updated_at, ''),
    };
};

export const mapApiInventoryToStockItem = (raw: unknown): AdminStockItem | null => {
    const row = asObject(raw);
    const id = resolveStableMedicineId(row);
    if (!id) {
        return null;
    }

    const currentStock = readNumber(row.quantity ?? row.currentStock ?? row.stock);
    const minStock = readNumber(row.minQuantity ?? row.minStock ?? row.reorderPoint);
    const maxStock = readNumber(row.maxQuantity ?? row.maxStock, minStock > 0 ? minStock * 5 : Math.max(currentStock, 1));

    return {
        id,
        code: readString(row.drugCode ?? row.drug_code ?? row.code, id),
        name: readString(row.drugName ?? row.name, 'Unknown medicine'),
        unit: readString(row.unit, 'unit'),
        currentStock,
        minStock,
        maxStock,
        batchNumber: readString(row.batchNumber ?? row.lotNumber ?? row.lot_number),
        expiryDate: readString(row.expiryDate ?? row.nearestExpiry ?? row.expiry_date),
        stockLevel: normalizeStockLevel(currentStock, minStock, row.stockLevel),
    };
};
