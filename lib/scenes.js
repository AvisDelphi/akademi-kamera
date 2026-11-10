// lib/scenes.js
// Lighting presets for the simulator. EV100 values follow the commonly published
// "exposure value" lighting tables (e.g. sunny-16 conditions ≈ EV 15).
// Distances describe the fixed composition: a person (focus point) in front,
// a car on the road behind, and buildings/trees far in the background.

export const SCENES = [
  {
    id: "terik",
    name: "Siang terik",
    description: "Matahari langsung, bayangan tegas (EV 15).",
    ev100: 15,
    sky: ["#5aa0e6", "#bfe0f7"],
    ground: "#8c8f86",
    lightsOn: false,
    subjectDistanceM: 3,
    carDistanceM: 15,
    backgroundDistanceM: 40,
    carSpeedKmh: 50,
  },
  {
    id: "berawan",
    name: "Berawan",
    description: "Langit tertutup awan, cahaya lembut (EV 12).",
    ev100: 12,
    sky: ["#9aa6b1", "#d5dade"],
    ground: "#7a7d78",
    lightsOn: false,
    subjectDistanceM: 3,
    carDistanceM: 15,
    backgroundDistanceM: 40,
    carSpeedKmh: 50,
  },
  {
    id: "senja",
    name: "Senja",
    description: "Matahari baru terbenam, lampu kota mulai menyala (EV 9).",
    ev100: 9,
    sky: ["#3d4a7a", "#f2a65e"],
    ground: "#5b5752",
    lightsOn: true,
    subjectDistanceM: 3,
    carDistanceM: 15,
    backgroundDistanceM: 40,
    carSpeedKmh: 50,
  },
  {
    id: "malam",
    name: "Jalan kota malam",
    description: "Penerangan lampu jalan (EV 5).",
    ev100: 5,
    sky: ["#0f1630", "#2a3157"],
    ground: "#3a3a3f",
    lightsOn: true,
    subjectDistanceM: 3,
    carDistanceM: 15,
    backgroundDistanceM: 40,
    carSpeedKmh: 50,
  },
];

export const getScene = (id) => SCENES.find((s) => s.id === id) ?? SCENES[0];
