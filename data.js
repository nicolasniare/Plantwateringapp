// Sample garden data for this browser-only prototype.
const STARTER_PLANTS = [
  { id: "monstera-1", name: "Monty", type: "Monstera", interval: 7, amount: 350, daysSinceWatered: 7, photo: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=80" },
  { id: "calathea-1", name: "Calathea", type: "Calathea", interval: 4, amount: 250, daysSinceWatered: 5, photo: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80" },
  { id: "snake-1", name: "Snake plant", type: "Snake plant", interval: 14, amount: 300, daysSinceWatered: 9, photo: "https://images.unsplash.com/photo-1509423350716-97f2360af2e4?auto=format&fit=crop&w=700&q=80" },
  { id: "basil-1", name: "Window basil", type: "Herbs", interval: 2, amount: 180, daysSinceWatered: 1, photo: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=700&q=80" },
  { id: "pothos-1", name: "Golden pothos", type: "Pothos", interval: 7, amount: 250, daysSinceWatered: 3, photo: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80" }
];

const PLANT_TYPES = [
  { name: "Monstera", interval: 7, amount: 350, photo: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=80" },
  { name: "Pothos", interval: 7, amount: 250, photo: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80" },
  { name: "Snake plant", interval: 14, amount: 300, photo: "https://images.unsplash.com/photo-1509423350716-97f2360af2e4?auto=format&fit=crop&w=700&q=80" },
  { name: "Calathea", interval: 4, amount: 250, photo: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80" },
  { name: "Peace lily", interval: 5, amount: 300, photo: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=700&q=80" },
  { name: "Succulent", interval: 14, amount: 120, photo: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80" },
  { name: "Herbs", interval: 2, amount: 180, photo: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=700&q=80" },
  { name: "Other", interval: 7, amount: 250, photo: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=80" }
];

const SAMPLE_SITTERS = [
  { name: "Avery L.", area: "Downtown", rate: 18, initials: "AL", color: "sage" },
  { name: "Morgan R.", area: "North End", rate: 22, initials: "MR", color: "coral" },
  { name: "Jamie K.", area: "Riverside", rate: 20, initials: "JK", color: "yellow" }
];
