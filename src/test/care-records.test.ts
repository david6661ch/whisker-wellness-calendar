import { describe, expect, it } from "vitest";
import { contactSchema, expenseSchema, expenseSummary, filterExpenses, telephoneHref, type Expense } from "@/lib/care-records";
const expense = { description: "Comida", category: "Alimentación" as const, pet_id: "luna" as const, amount: 25000, date: "2026-11-05", notes: "" };
const rows: Expense[] = [{ id: "1", ...expense }, { id: "2", ...expense, pet_id: "milo", category: "Veterinario", amount: 80000 }, { id: "3", ...expense, date: "2026-10-20", amount: 10000 }];
describe("Registros de cuidados", () => {
  it("rechaza teléfonos con protocolos o caracteres de inyección", () => { expect(() => telephoneHref("javascript:alert(1)")).toThrow(); expect(telephoneHref("+57 300 123 4567")).toBe("tel:%2B573001234567"); });
  it("requiere nombre, teléfono y relación en contactos", () => { expect(contactSchema.safeParse({ name: "", phone: "123", relationship: "", address: "", notes: "", pet_id: null, favorite: false, emergency: false }).success).toBe(false); });
  it("requiere un gasto positivo con máximo dos decimales", () => { expect(expenseSchema.safeParse({ ...expense, amount: 0 }).success).toBe(false); expect(expenseSchema.safeParse({ ...expense, amount: 1.234 }).success).toBe(false); });
  it("solo permite las ocho categorías y una mascota existente", () => { expect(expenseSchema.safeParse({ ...expense, category: "Inventada" }).success).toBe(false); expect(expenseSchema.safeParse({ ...expense, pet_id: "desconocida" }).success).toBe(false); });
  it("rechaza fechas imposibles", () => { expect(expenseSchema.safeParse({ ...expense, date: "2026-02-30" }).success).toBe(false); });
  it("filtra por mascota", () => { expect(filterExpenses(rows, { pet: "luna", category: "", from: "", to: "" }).map(r => r.id)).toEqual(["1", "3"]); });
  it("filtra por categoría", () => { expect(filterExpenses(rows, { pet: "", category: "Veterinario", from: "", to: "" }).map(r => r.id)).toEqual(["2"]); });
  it("incluye ambos límites del período", () => { expect(filterExpenses(rows, { pet: "", category: "", from: "2026-11-05", to: "2026-11-05" }).map(r => r.id)).toEqual(["1", "2"]); });
  it("suma el mes y el acumulado de todas las mascotas", () => { expect(expenseSummary(rows, "2026-11")).toMatchObject({ monthly: 105000, total: 115000 }); });
  it("agrega correctamente los gastos por categoría", () => { expect(expenseSummary(rows, "2026-11").categories).toEqual([{ category: "Alimentación", total: 35000 }, { category: "Veterinario", total: 80000 }]); });
});