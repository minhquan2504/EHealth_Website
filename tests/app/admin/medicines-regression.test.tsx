import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MedicinesPage from "@/app/admin/medicines/page";
import MedicineStockPage from "@/app/admin/medicines/stock/page";

const { pushMock, getDrugsMock, getInventoryListMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    getDrugsMock: vi.fn(),
    getInventoryListMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/medicineService", () => ({
    getDrugs: getDrugsMock,
}));

vi.mock("@/services/inventoryService", () => ({
    inventoryService: {
        getList: getInventoryListMock,
    },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: () => <div data-testid="dropdown-menu" />,
}));

vi.mock("@/features/medicines/components/medicine-form-modal", () => ({
    MedicineFormModal: () => null,
}));

vi.mock("@/features/medicines/components/add-stock-modal", () => ({
    AddStockModal: () => null,
}));

const hasKeyWarning = (calls: unknown[][]): boolean =>
    calls.some((call) =>
        call.some((part) => typeof part === "string" && part.includes('Each child in a list should have a unique "key" prop'))
    );

describe("admin medicines regression", () => {
    beforeEach(() => {
        pushMock.mockReset();
        getDrugsMock.mockReset();
        getInventoryListMock.mockReset();
    });

    it("renders medicines page without React key warnings when ids fall back to code", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        getDrugsMock.mockResolvedValue({
            data: [
                { code: "MED-001", name: "Aspirin", active_ingredient: "Acetylsalicylic acid", quantity: 10, minQuantity: 20, price: 5000, category: "Giam dau" },
                { id: "drug-2", code: "MED-002", name: "Vitamin C", activeIngredient: "Vitamin C", quantity: 50, minQuantity: 10, price: 8000, category: "Vitamin" },
            ],
        });

        render(<MedicinesPage />);

        await waitFor(() => expect(screen.getByText("Aspirin")).toBeInTheDocument());
        expect(hasKeyWarning(consoleErrorSpy.mock.calls)).toBe(false);

        consoleErrorSpy.mockRestore();
    });

    it("renders medicine stock page without React key warnings when ids fall back to drugId", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        getInventoryListMock.mockResolvedValue({
            data: [
                { drugId: "drug-1", drugCode: "MED-001", drugName: "Aspirin", quantity: 5, minQuantity: 10, maxQuantity: 30, lotNumber: "LOT-1" },
                { id: "inventory-2", drugCode: "MED-002", drugName: "Vitamin C", quantity: 30, minQuantity: 10, maxQuantity: 50, lotNumber: "LOT-2" },
            ],
        });

        render(<MedicineStockPage />);

        await waitFor(() => expect(screen.getByText("Aspirin")).toBeInTheDocument());
        expect(hasKeyWarning(consoleErrorSpy.mock.calls)).toBe(false);

        consoleErrorSpy.mockRestore();
    });
});
