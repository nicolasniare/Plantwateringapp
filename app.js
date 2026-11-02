(function () {
  "use strict";

  const storage = {
    get(key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        return false;
      }
      return true;
    }
  };

  const plants = Array.isArray(storage.get("tend-plants", null))
    ? storage.get("tend-plants", [])
    : STARTER_PLANTS.map(function (plant) {
      const watered = new Date();
      watered.setDate(watered.getDate() - plant.daysSinceWatered);
      return {
        id: plant.id,
        name: plant.name,
        type: plant.type,
        interval: plant.interval,
        amount: plant.amount,
        photo: plant.photo,
        lastWatered: toDateKey(watered)
      };
    });
  let remindersEnabled = storage.get("tend-reminders", false);
  let activeFilter = "all";
  let toastTimer;

  const plantGrid = document.getElementById("plant-grid");
  const emptyState = document.getElementById("empty-state");
  const dialog = document.getElementById("plant-dialog");
  const form = document.getElementById("plant-form");
  const typeSelect = document.getElementById("plant-type");
  const frequencySelect = document.getElementById("plant-frequency");
  const reminderToggle = document.getElementById("reminder-toggle");
  const toast = document.getElementById("toast");

  function toDateKey(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function todayKey() {
    return toDateKey(new Date());
  }

  function dayDifference(dateKey) {
    const watered = new Date(dateKey + "T00:00:00");
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return Math.round((current - watered) / 86400000);
  }

  function dueIn(plant) {
    return plant.interval - dayDifference(plant.lastWatered);
  }

  function savePlants() {
    storage.set("tend-plants", plants);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function formatDue(plant) {
    const days = dueIn(plant);
    if (days < 0) return "Overdue by " + Math.abs(days) + " " + (Math.abs(days) === 1 ? "day" : "days");
    if (days === 0) return "Water today";
    return "In " + days + " " + (days === 1 ? "day" : "days");
  }

  function createPlantCard(plant) {
    const isDue = dueIn(plant) <= 0;
    const wateredToday = plant.lastWatered === todayKey();
    const card = document.createElement("article");
    card.className = "plant-card" + (isDue ? " is-due" : "");

    const photoWrap = document.createElement("div");
    photoWrap.className = "plant-photo-wrap";
    const photo = document.createElement("img");
    photo.className = "plant-photo";
    photo.src = plant.photo || "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=80";
    photo.alt = plant.name + ", a " + plant.type;
    photo.loading = "lazy";
    photoWrap.append(photo);

    const status = document.createElement("span");
    status.className = "plant-status" + (isDue ? " status-due" : "");
    status.textContent = formatDue(plant);
    photoWrap.append(status);

    const content = document.createElement("div");
    content.className = "plant-card-content";
    const type = document.createElement("p");
    type.className = "plant-type";
    type.textContent = plant.type;
    const nameRow = document.createElement("div");
    nameRow.className = "plant-name-row";
    const name = document.createElement("h3");
    name.textContent = plant.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.setAttribute("aria-label", "Remove " + plant.name);
    remove.title = "Remove plant";
    remove.textContent = "×";
    remove.addEventListener("click", function () { removePlant(plant.id); });
    nameRow.append(name, remove);

    const details = document.createElement("div");
    details.className = "plant-details";
    const schedule = document.createElement("span");
    schedule.textContent = "Every " + plant.interval + " days";
    const amount = document.createElement("span");
    amount.textContent = plant.amount + " ml";
    details.append(schedule, amount);

    const waterButton = document.createElement("button");
    waterButton.type = "button";
    waterButton.className = "water-button" + (wateredToday ? " is-watered" : "");
    waterButton.textContent = wateredToday ? "✓ Watered today" : "Mark as watered";
    waterButton.disabled = wateredToday;
    waterButton.addEventListener("click", function () { waterPlant(plant.id); });

    content.append(type, nameRow, details, waterButton);
    card.append(photoWrap, content);
    return card;
  }

  function renderPlants() {
    const sortedPlants = plants.slice().sort(function (first, second) {
      return dueIn(first) - dueIn(second);
    });
    const duePlants = sortedPlants.filter(function (plant) { return dueIn(plant) <= 0; });
    const visiblePlants = activeFilter === "due" ? duePlants : sortedPlants;
    const wateredCount = plants.filter(function (plant) { return plant.lastWatered === todayKey(); }).length;

    document.getElementById("due-count").textContent = duePlants.length;
    document.getElementById("due-detail").textContent = duePlants.length === 1 ? "plant needs water" : "plants need water";
    document.getElementById("total-count").textContent = plants.length;
    document.getElementById("watered-count").textContent = wateredCount;
    document.getElementById("plant-summary").textContent = plants.length === 0
      ? "Your garden is ready for its first little friend."
      : plants.length + (plants.length === 1 ? " plant in your garden" : " plants in your garden");
    document.getElementById("hero-summary").textContent = duePlants.length === 0
      ? "Everyone's looking good. Enjoy a slow moment in your garden."
      : duePlants.length + (duePlants.length === 1 ? " plant could use a drink today." : " plants could use a drink today.");
    document.getElementById("empty-title").textContent = activeFilter === "due" && plants.length > 0 ? "All caught up" : "A little room to grow";
    document.getElementById("empty-copy").textContent = activeFilter === "due" && plants.length > 0
      ? "No plants need water right now. Come back tomorrow."
      : "Add your first plant and give it a name.";
    emptyState.hidden = visiblePlants.length > 0;
    document.getElementById("empty-add-button").hidden = activeFilter === "due" && plants.length > 0;
    plantGrid.replaceChildren.apply(plantGrid, visiblePlants.map(createPlantCard));
  }

  function removePlant(id) {
    const index = plants.findIndex(function (plant) { return plant.id === id; });
    if (index === -1) return;
    const name = plants[index].name;
    if (!window.confirm("Remove " + name + " from your garden?")) return;
    plants.splice(index, 1);
    savePlants();
    renderPlants();
    showToast(name + " was removed from your garden.");
  }

  function waterPlant(id) {
    const plant = plants.find(function (item) { return item.id === id; });
    if (!plant) return;
    plant.lastWatered = todayKey();
    savePlants();
    renderPlants();
    showToast(plant.name + " is all watered. Lovely work.");
  }

  function setReminderButton() {
    reminderToggle.setAttribute("aria-pressed", remindersEnabled ? "true" : "false");
    document.getElementById("reminder-label").textContent = remindersEnabled ? "Reminders on" : "Turn reminders on";
  }

  function checkForReminder() {
    if (!remindersEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const today = todayKey();
    if (storage.get("tend-last-reminder", "") === today) return;
    const duePlants = plants.filter(function (plant) { return dueIn(plant) <= 0; });
    if (duePlants.length === 0) return;
    const names = duePlants.slice(0, 3).map(function (plant) { return plant.name; }).join(", ");
    const extra = duePlants.length > 3 ? " and " + (duePlants.length - 3) + " more" : "";
    try {
      new Notification("A little water, a lot of love", {
        body: names + extra + " could use a drink today."
      });
      storage.set("tend-last-reminder", today);
    } catch (error) {
      showToast("Browser reminders need a secure connection and permission.");
    }
  }

  reminderToggle.addEventListener("click", async function () {
    if (remindersEnabled) {
      remindersEnabled = false;
      storage.set("tend-reminders", false);
      setReminderButton();
      showToast("Daily browser reminders are off.");
      return;
    }
    if (!("Notification" in window)) {
      showToast("This browser does not support notifications.");
      return;
    }
    try {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== "granted") {
        showToast("Notifications were not enabled. You can still check today's care here.");
        return;
      }
      remindersEnabled = true;
      storage.set("tend-reminders", true);
      setReminderButton();
      checkForReminder();
      showToast("Daily reminders are on while Tend is open.");
    } catch (error) {
      showToast("Browser reminders need a secure connection and permission.");
    }
  });

  function showView() {
    const requested = (window.location.hash || "#home").slice(1);
    const views = document.querySelectorAll("[data-view]");
    const exists = Array.prototype.some.call(views, function (view) {
      return view.id === requested;
    });
    const current = exists ? requested : "home";

    views.forEach(function (view) {
      view.hidden = view.id !== current;
    });

    document.querySelectorAll(".side-nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", showView);

  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (filterButton) {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      renderPlants();
    });
  });

  function updateTypeDefaults() {
    const selectedType = PLANT_TYPES.find(function (type) { return type.name === typeSelect.value; }) || PLANT_TYPES[0];
    frequencySelect.value = String(selectedType.interval);
    document.getElementById("plant-amount").value = selectedType.amount;
  }

  function openDialog() {
    form.reset();
    updateTypeDefaults();
    dialog.showModal();
    document.getElementById("plant-name").focus();
  }

  document.getElementById("add-plant-button").addEventListener("click", openDialog);
  document.getElementById("empty-add-button").addEventListener("click", openDialog);
  document.getElementById("close-dialog").addEventListener("click", function () { dialog.close(); });
  document.getElementById("cancel-dialog").addEventListener("click", function () { dialog.close(); });
  typeSelect.addEventListener("change", updateTypeDefaults);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const type = PLANT_TYPES.find(function (item) { return item.name === typeSelect.value; }) || PLANT_TYPES[0];
    plants.push({
      id: "plant-" + Date.now(),
      name: document.getElementById("plant-name").value.trim(),
      type: type.name,
      interval: Number(frequencySelect.value),
      amount: Number(document.getElementById("plant-amount").value),
      photo: type.photo,
      lastWatered: todayKey()
    });
    savePlants();
    activeFilter = "all";
    document.querySelector('[data-filter="all"]').click();
    dialog.close();
    showToast("A new leafy friend joined your garden.");
  });

  function renderSitters() {
    const grid = document.getElementById("sitter-grid");
    grid.replaceChildren.apply(grid, SAMPLE_SITTERS.map(function (sitter) {
      const card = document.createElement("article");
      card.className = "sitter-card";
      const avatar = document.createElement("span");
      avatar.className = "sitter-avatar avatar-" + sitter.color;
      avatar.textContent = sitter.initials;
      const info = document.createElement("div");
      info.className = "sitter-info";
      const name = document.createElement("h3");
      name.textContent = sitter.name;
      const area = document.createElement("p");
      area.textContent = sitter.area + " · Plant lover";
      info.append(name, area);
      const rate = document.createElement("p");
      rate.className = "sitter-rate";
      const price = document.createElement("strong");
      price.textContent = "$" + sitter.rate;
      const unit = document.createElement("span");
      unit.textContent = " / visit";
      rate.append(price, unit);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-outline";
      button.textContent = "Request a visit";
      button.addEventListener("click", function () {
        showToast("Demo only. No sitter request or payment was sent.");
      });
      card.append(avatar, info, rate, button);
      return card;
    }));
  }

  document.getElementById("today-date").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long", month: "long", day: "numeric"
  }).format(new Date());
  typeSelect.replaceChildren.apply(typeSelect, PLANT_TYPES.map(function (type) {
    const option = document.createElement("option");
    option.value = type.name;
    option.textContent = type.name;
    return option;
  }));
  frequencySelect.replaceChildren.apply(frequencySelect, [2, 3, 4, 5, 7, 10, 14, 21].map(function (days) {
    const option = document.createElement("option");
    option.value = days;
    option.textContent = days + (days === 1 ? " day" : " days");
    return option;
  }));
  setReminderButton();
  renderPlants();
  renderSitters();
  showView();
  checkForReminder();
  window.setInterval(checkForReminder, 60000);
})();
