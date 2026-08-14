import { defineStore } from "pinia";

// ==================== NORMALIZAÇÃO DO PAYLOAD (LUA → INTERFACE) ====================
// O client envia { Action = "Open", Payload = Vehicles } onde cada veículo tem:
//   Model, Name, Tax, Mode, Weight, Engine, Body, Fuel, Plate, Health, TaxTime, RentalTime
// A interface espera: id, model, name, plate, weight, fee, time e
// stats { motor, lataria, chassi, gasolina }.

// Modelos de veículos elétricos de GTA V (mesma convenção da HUD): neles o
// status de "gasolina" vira "bateria". Expanda esta lista se a base tiver
// outros modelos elétricos.
const ELECTRIC_VEHICLES = [
  "caddy2",
  "cyclone",
  "dilettante",
  "khamelion",
  "neon",
  "powersurge",
  "raiden",
  "surge",
  "tezeract",
  "virtue",
  "voltic",
];

const isElectric = (model) => ELECTRIC_VEHICLES.includes(String(model || "").toLowerCase());

const clamp = (value, min = 0, max = 100) => {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  // Floor para sempre exibir números inteiros (99.8% → 99%, 99.9% → 99%)
  return Math.floor(Math.min(max, Math.max(min, num)));
};

export const normalizeVehicle = (vehicle, index) => ({
  id: vehicle.Model || `vehicle-${index}`,
  model: vehicle.Model,
  name: vehicle.Name,
  plate: vehicle.Plate || null,
  weight: vehicle.Weight != null ? clamp(vehicle.Weight, 0, 9999) : null,
  // IPVA em dia: o servidor preenche TaxTime quando a taxa ainda não venceu
  // (false quando venceu). Com taxa válida, o botão de pagar fica desativado.
  taxPaid: Boolean(vehicle.TaxTime),
  // Tempo restante formatado pelo servidor (ex.: "5 Dias, 3 Horas, 44 Minutos").
  time: vehicle.TaxTime || null,
  // Veículos de serviço (flag Work do servidor ou Mode = "Work" da vrp):
  // não podem ser transferidos — o card esconde o botão de transferir.
  work: Boolean(vehicle.Work) || vehicle.Mode === "Work",
  // Veículo de serviço adquirido: o servidor envia Owned=true quando existe
  // registro do jogador para o modelo (false = ainda não possui). Veículos
  // normais não enviam a flag e são tratados como adquiridos.
  owned: vehicle.Owned !== false,
  // Veículos alugados: o servidor envia RentalTime (timer ativo, "Vencido"
  // quando expirou, ou false quando não é alugado). Qualquer valor presente
  // marca o veículo como alugado — o card mostra o selo amarelo.
  rented: Boolean(vehicle.RentalTime),
  // Veículos elétricos: o card troca "Gasolina" por "Bateria" no status.
  electric: isElectric(vehicle.Model),
  stats: {
    motor: clamp(vehicle.Engine),
    lataria: clamp(vehicle.Body),
    chassi: clamp(vehicle.Health),
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
