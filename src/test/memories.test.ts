import { describe, expect, it } from "vitest";
import { memorialSchema, memorySchema, placeSchema, sharedTime, placeStats, type VisitedPlace } from "@/lib/memories";

const validPath = "123e4567-e89b-42d3-a456-426614174000/foto.jpg";

describe("memorialSchema", () => {
  const base = { linked_pet_id: null, name: "Rocky", species: "Perro", breed: "", birth_date: null, death_date: "2024-05-10", bio: "", memories_text: "", dedication: "", photo_path: null, before_signup: true };
  it("acepta un memorial sin perfil previo en PetCare", () => {
    expect(memorialSchema.safeParse(base).success).toBe(true);
  });
  it("exige la fecha de fallecimiento", () => {
    expect(memorialSchema.safeParse({ ...base, death_date: "" }).success).toBe(false);
  });
  it("rechaza rutas de archivo que no pertenecen al formato de usuario", () => {
    expect(memorialSchema.safeParse({ ...base, photo_path: "../otro/archivo.jpg" }).success).toBe(false);
  });
});

describe("memorySchema", () => {
  const base = { title: "Primer paseo", description: "", memory_date: "2023-01-15", media_type: "photo" as const, media_path: validPath, favorite: false, album_id: null, pet_ids: ["luna"] };
  it("acepta recuerdos de antes de crear la cuenta", () => {
    expect(memorySchema.safeParse({ ...base, memory_date: "2010-06-01" }).success).toBe(true);
  });
  it("exige un archivo", () => {
    expect(memorySchema.safeParse({ ...base, media_path: "" }).success).toBe(false);
  });
});

describe("placeSchema", () => {
  const base = { name: "Parque El Virrey", category: "Parques" as const, address: "Bogotá", lat: 4.67, lng: -74.05, visit_date: "2026-01-10", pet_ids: ["luna"], description: "", photo_path: null, rating: 4, review: "", pet_friendly: true, water_available: null, good_treatment: null, recommended: null };
  it("exige al menos una mascota por visita", () => {
    expect(placeSchema.safeParse({ ...base, pet_ids: [] }).success).toBe(false);
  });
  it("limita la calificación a 1-5 estrellas", () => {
    expect(placeSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
    expect(placeSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
  });
  it("rechaza coordenadas fuera de rango", () => {
    expect(placeSchema.safeParse({ ...base, lat: 91 }).success).toBe(false);
    expect(placeSchema.safeParse({ ...base, lng: -181 }).success).toBe(false);
  });
});

describe("sharedTime", () => {
  it("calcula años y meses de compañía", () => {
    expect(sharedTime("2020-01-01", "2024-03-01")).toBe("4 años y 2 meses a tu lado");
  });
  it("devuelve null sin fecha de nacimiento o con fechas invertidas", () => {
    expect(sharedTime(null, "2024-03-01")).toBeNull();
    expect(sharedTime("2025-01-01", "2024-03-01")).toBeNull();
  });
});

describe("placeStats", () => {
  const place = (over: Partial<VisitedPlace>): VisitedPlace => ({ id: "1", name: "Parque", category: "Parques", address: "Calle 1, Bogotá", lat: 4.6, lng: -74.1, visit_date: "2026-01-01", pet_ids: ["luna"], description: "", photo_path: null, photo_url: null, rating: null, review: "", pet_friendly: null, water_available: null, good_treatment: null, recommended: null, ...over });
  it("cuenta lugares, ciudades, el más visitado y la mascota con más experiencias sin convertirlo en competición", () => {
    const stats = placeStats([
      place({ id: "1" }),
      place({ id: "2", address: "Calle 2, Medellín", pet_ids: ["milo"] }),
      place({ id: "3", pet_ids: ["milo"] }),
    ]);
    expect(stats.total).toBe(3);
    expect(stats.cities).toBe(2);
    expect(stats.mostVisited).toEqual({ name: "Parque", count: 2 });
    expect(stats.topPet).toEqual({ id: "milo", count: 2 });
    expect(stats.categories[0]).toEqual(["Parques", 3]);
  });
});
