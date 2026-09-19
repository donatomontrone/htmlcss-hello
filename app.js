const rooms = {
  "bedroom-a": { name: "Camera 1", temp: 21.7, light: true, brightness: 38, blind: 91, climate: 21.5, presence: false, description: "Zona notte · nessuna presenza" },
  "bedroom-b": { name: "Camera 2", temp: 21.2, light: false, brightness: 0, blind: 83, climate: 21.0, presence: false, description: "Zona notte · nessuna presenza" },
  service: { name: "Servizi", temp: 22.0, light: false, brightness: 0, blind: 88, climate: 21.0, presence: false, description: "Servizi · nessuna presenza" },
  kitchen: { name: "Cucina", temp: 22.6, light: true, brightness: 72, blind: 64, climate: 22.0, presence: true, description: "Zona giorno · presenza rilevata ora" },
  living: { name: "Living", temp: 22.4, light: true, brightness: 64, blind: 72, climate: 22.0, presence: true, description: "Zona giorno · presenza rilevata ora" },
};

let selectedRoom = "living";
let activeScene = "home";

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const selectedName = $("#selectedRoomName");
const selectedTemp = $("#selectedRoomTemp");
const selectedDescription = $("#selectedRoomDescription");
const lightState = $("#lightState");
const lightToggle = $("#lightToggle");
const blindState = $("#blindState");
const blindValue = $("#blindValue");
const climateState = $("#climateState");
const activeCount = $("#activeCount");
const roomDialog = $("#roomDialog");
const toast = $("#toast");

function updateClock() {
  $("#clock").textContent = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);

function updateActiveCount() {
  const roomLights = Object.values(rooms).filter(room => room.light).length;
  activeCount.textContent = String(roomLights + (activeScene === "home" ? 1 : 0));
}

function renderRoom(roomId) {
  selectedRoom = roomId;
  const room = rooms[roomId];
  selectedName.textContent = room.name;
  selectedTemp.textContent = `${room.temp.toFixed(1)}°`;
  selectedDescription.textContent = room.description;
  lightState.textContent = room.light ? `Accese · ${room.brightness}%` : "Spente";
  lightToggle.classList.toggle("is-on", room.light);
  blindState.textContent = `Aperte · ${room.blind}%`;
  blindValue.textContent = `${room.blind}%`;
  climateState.textContent = `Comfort · ${room.climate.toFixed(1)}°`;

  $$(".room").forEach(el => el.classList.toggle("is-selected", el.dataset.room === roomId));
  $("#dialogTitle").textContent = room.name;
  $("#dialogTemp").textContent = `${room.temp.toFixed(1)}°`;
}

function syncRoomVisual(roomId) {
  const room = rooms[roomId];
  const roomEl = $(`.room[data-room="${roomId}"]`);
  const marker = $(`.device-marker[data-device-room="${roomId}"]`);
  if (roomEl) roomEl.classList.toggle("is-on", room.light);
  if (marker) marker.classList.toggle("is-on", room.light);

  const favorite = $(`.favorite-device[data-favorite-room="${roomId}"]`);
  if (favorite) {
    favorite.classList.toggle("is-on", room.light);
    const value = $("b", favorite);
    if (value && ["living", "kitchen", "bedroom-b"].includes(roomId)) {
      value.textContent = room.light ? (room.brightness ? `${room.brightness}%` : "ON") : "OFF";
    }
  }
  updateActiveCount();
}

function toggleRoomLight(roomId = selectedRoom) {
  const room = rooms[roomId];
  room.light = !room.light;
  if (room.light && room.brightness === 0) room.brightness = 55;
  syncRoomVisual(roomId);
  if (roomId === selectedRoom) renderRoom(roomId);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

$$(".room").forEach(roomEl => {
  const activate = () => renderRoom(roomEl.dataset.room);
  roomEl.addEventListener("click", activate);
  roomEl.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  });
});

$("#lightControl").addEventListener("click", () => toggleRoomLight());

$$(".favorite-device[data-favorite-room]").forEach(button => {
  button.addEventListener("click", () => {
    const roomId = button.dataset.favoriteRoom;
    renderRoom(roomId);
    if (roomId !== "service") toggleRoomLight(roomId);
  });
});

$$("[data-plan-mode]").forEach(button => {
  button.addEventListener("click", () => {
    $$("[data-plan-mode]").forEach(x => x.classList.toggle("is-active", x === button));
    $("#floorStage").classList.toggle("clean", button.dataset.planMode === "clean");
  });
});

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("night");
  const dark = document.body.classList.contains("night");
  $("#themeToggle").setAttribute("aria-label", dark ? "Attiva modalità giorno" : "Attiva modalità notte");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#0a0c0f" : "#eef1f5");
});

$$(".scene-card").forEach(button => {
  button.addEventListener("click", () => {
    activeScene = button.dataset.scene;
    $$(".scene-card").forEach(card => {
      const active = card === button;
      card.classList.toggle("is-active", active);
      $(".scene-status", card).textContent = active ? "Attivo" : "Avvia";
    });

    if (activeScene === "night" || activeScene === "away") {
      Object.keys(rooms).forEach(id => {
        rooms[id].light = false;
        syncRoomVisual(id);
      });
    }
    if (activeScene === "home") {
      rooms.living.light = true;
      rooms.kitchen.light = true;
      syncRoomVisual("living");
      syncRoomVisual("kitchen");
    }
    renderRoom(selectedRoom);
    showToast(activeScene === "night"
      ? "Scenario Buonanotte attivato"
      : activeScene === "away"
        ? "Casa in modalità Fuori casa"
        : "Scenario A casa attivato");
  });
});

$("#detailButton").addEventListener("click", () => {
  renderRoom(selectedRoom);
  roomDialog.showModal();
});
$("#dialogClose").addEventListener("click", () => roomDialog.close());
roomDialog.addEventListener("click", event => {
  const rect = roomDialog.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside) roomDialog.close();
});
$("[data-dialog-action='light']").addEventListener("click", () => toggleRoomLight());

$$(".nav-tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".nav-tab").forEach(x => x.classList.toggle("is-active", x === tab));
  if (tab.dataset.view === "rooms") {
    document.querySelector(".dashboard-grid").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (tab.dataset.view === "scenes") {
    document.querySelector(".quick-section").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (tab.dataset.view === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}));

$("#blindControl").addEventListener("click", () => showToast("Controllo tapparella pronto per Home Assistant"));
$("#climateControl").addEventListener("click", () => showToast("Controllo clima pronto per Home Assistant"));
$("#editScenes").addEventListener("click", () => showToast("Editor scenari: prossimo step"));

renderRoom(selectedRoom);
Object.keys(rooms).forEach(syncRoomVisual);
