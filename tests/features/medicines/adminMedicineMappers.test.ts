import { describe, expect, it } from "vitest";
import {
    mapApiDrugToMedicine,
    mapApiInventoryToStockItem,
    resolveStableMedicineId,
} from "@/features/medicines/utils/adminMedicineMappers";

describe("adminMedicineMappers", () => {
    it("builds a stable medicine id from fallbacks", () => {
        expect(resolveStableMedicineId({ code: "MED-001" })).toBe("MED-001");
        expect(resolveStableMedicineId({ drugId: "drug-123" })).toBe("drug-123");
        expect(resolveStableMedicineId({})).toBeNull();
    });

    it("maps raw drug payloads into medicine rows with stable ids", () => {
        const medicine = mapApiDrugToMedicine({
            code: "MED-001",
            name: "Paracetamol",
            active_ingredient: "Paracetamol",
            quantity: 0,
            minQuantity: 20,
            price: 5000,
            category: "Giam dau",
        });

        expect(medicine).toEqual(
            expect.objectContaining({
                id: "MED-001",
                code: "MED-001",
                name: "Paracetamol",
                stockLevel: "OUT",
                status: "OUT_OF_STOCK",
            })
        );
    });

    it("maps raw inventory payloads into stock rows with stock levels", () => {
        const stockItem = mapApiInventoryToStockItem({
            drugId: "drug-2",
            drugCode: "MED-002",
            drugName: "Amoxicillin",
            quantity: 5,
            minQuantity: 10,
            maxQuantity: 50,
            lotNumber: "LOT-01",
            expiryDate: "2026-06-01",
        });

        expect(stockItem).toEqual(
            expect.objectContaining({
                id: "drug-2",
                code: "MED-002",
                name: "Amoxicillin",
                stockLevel: "LOW",
            })
        );
    });
});
