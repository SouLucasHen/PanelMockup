import { defineStore } from "pinia";

// ==================== NORMALIZAÇÃO DO PAYLOAD (LUA → INTERFACE) ====================
// O client envia { Action = "Open", Payload = Vehicles } onde cada veículo tem:
//   Model, Name, Tax, Mode, Weight, Engine, Body, Fuel, TaxTime, RentalTime
// A interface espera: id, model, name, trunk, fee, stats { motor, lataria, gasolina }.

const clamp = (value, min = 0, max = 100) => {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR").format(num);
};

export const normalizeVehicle = (vehicle, index) => ({
  id: vehicle.Model || `vehicle-${index}`,
  model: vehicle.Model,
  name: vehicle.Name,
  trunk: vehicle.Weight != null ? `${clamp(vehicle.Weight, 0, 9999)}kg` : "—",
  fee: vehicle.Tax != null ? `R$ ${formatCurrency(vehicle.Tax)}` : "—",
  // IPVA em dia: o servidor preenche TaxTime quando a taxa ainda não venceu
  // (false quando venceu). Com taxa válida, o botão de pagar fica desativado.
  taxPaid: Boolean(vehicle.TaxTime),
  stats: {
    motor: clamp(vehicle.Engine),
    lataria: clamp(vehicle.Body),
    gasolina: clamp(vehicle.Fuel),
  },
});

export const useGarageStore = defineStore("garage", {
  state: () => ({
    vehicles: [],
    selectedVehicleId: null,
    search: "",
  }),
  getters: {
    selectedVehicle(state) {
      return state.vehicles.find((v) => v.id === state.selectedVehicleId) || null;
    },
    filteredVehicles(state) {
      const query = (state.search || "").trim().toLowerCase();
      if (!query) return state.vehicles;
      return state.vehicles.filter(
        (v) =>
          (v.name || "").toLowerCase().includes(query) ||
          (v.model || "").toLowerCase().includes(query),
      );
    },
  },
  actions: {
    setVehicles(list) {
      this.vehicles = (list || []).map(normalizeVehicle);
      this.selectedVehicleId = null;
      this.search = "";
    },
    toggleVehicle(id) {
      this.selectedVehicleId = this.selectedVehicleId === id ? null : id;
    },
    deselectVehicle() {
      this.selectedVehicleId = null;
    },
  },
});
