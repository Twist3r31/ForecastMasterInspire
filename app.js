/**
 * Forecast Master — Tornado Target (with analysis layers)
 */

(function () {
  "use strict";

  // ---------- State ----------
  let map = null;
  let currentScenario = null;
  let targetMarker = null;
  let targetLatLng = null;
  let reportMarkers = [];
  let hasSubmitted = false;
  let activeOverlays = {}; // id -> Leaflet ImageOverlay

  // Session stats
  let gamesPlayed = 0;
  let totalScore = 0;
  let bestDistance = Infinity;
  let distanceSum = 0;

  // ---------- DOM ----------
  const statusText = document.getElementById("status-text");
  const monthHint = document.getElementById("month-hint");
  const targetInfo = document.getElementById("target-info");
  const scoreDisplay = document.getElementById("score-display");
  const scoreValue = document.getElementById("score-value");
  const distanceValue = document.getElementById("distance-value");
  const btnNewDay = document.getElementById("btn-new-day");
  const btnSubmit = document.getElementById("btn-submit");
  const btnReset = document.getElementById("btn-reset");
  const resultsModal = document.getElementById("results-modal");
  const modalClose = document.getElementById("modal-close");
  const resultsTitle = document.getElementById("results-title");
  const resultsDate = document.getElementById("results-date");
  const resultsScore = document.getElementById("results-score");
  const resultsDistance = document.getElementById("results-distance");
  const resultsReports = document.getElementById("results-reports");
  const btnPlayAgain = document.getElementById("btn-play-again");
  const parametersList = document.getElementById("parameters-list");

  const statGames = document.getElementById("stat-games");
  const statTotal = document.getElementById("stat-total");
  const statBest = document.getElementById("stat-best");
  const statAvg = document.getElementById("stat-avg");

  // ---------- Map init ----------
  function initMap() {
    map = L.map("map", {
      center: [39.0, -98.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on("click", onMapClick);
  }

  // ---------- Helpers ----------
  function haversineMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateScore(distanceMiles) {
    const maxPoints = 5000;
    const perfectRadius = 25;
    const zeroRadius = 200;

    if (distanceMiles <= perfectRadius) return maxPoints;
    if (distanceMiles >= zeroRadius) return 0;
    const ratio = (zeroRadius - distanceMiles) / (zeroRadius - perfectRadius);
    return Math.round(maxPoints * ratio);
  }

  function clearReportMarkers() {
    reportMarkers.forEach((m) => map.removeLayer(m));
    reportMarkers = [];
  }

  function clearTarget() {
    if (targetMarker) {
      map.removeLayer(targetMarker);
      targetMarker = null;
    }
    targetLatLng = null;
    targetInfo.textContent = "No target placed";
    btnSubmit.disabled = true;
    btnReset.disabled = true;
  }

  function clearOverlays() {
    Object.values(activeOverlays).forEach((ov) => map.removeLayer(ov));
    activeOverlays = {};
  }

  function updateStatsUI() {
    statGames.textContent = gamesPlayed;
    statTotal.textContent = totalScore.toLocaleString();
    statBest.textContent =
      bestDistance === Infinity ? "—" : bestDistance.toFixed(1) + " mi";
    statAvg.textContent =
      gamesPlayed === 0 ? "—" : (distanceSum / gamesPlayed).toFixed(1) + " mi";
  }

  // ---------- Parameters / Layers UI ----------
  function renderParameters(scenario) {
    parametersList.innerHTML = "";

    if (!scenario.layers || scenario.layers.length === 0) {
      parametersList.innerHTML = '<div class="param-empty">No analysis layers for this day yet</div>';
      return;
    }

    // Group layers
    const groups = {};
    scenario.layers.forEach((layer) => {
      if (!groups[layer.group]) groups[layer.group] = [];
      groups[layer.group].push(layer);
    });

    Object.keys(groups).forEach((groupName) => {
      const label = document.createElement("div");
      label.className = "param-group-label";
      label.textContent = groupName;
      parametersList.appendChild(label);

      groups[groupName].forEach((layer) => {
        const btn = document.createElement("button");
        btn.className = "param-btn";
        btn.textContent = layer.name;
        btn.dataset.layerId = layer.id;

        if (!layer.url) {
          btn.title = "Image not yet added for this day";
          btn.style.opacity = "0.55";
        }

        btn.addEventListener("click", () => toggleLayer(layer, btn));
        parametersList.appendChild(btn);
      });
    });
  }

  function toggleLayer(layer, btn) {
    // If no real image URL yet, show a message
    if (!layer.url) {
      alert(
        "This analysis image has not been added yet.\n\n" +
        "To add it:\n" +
        "1. Download the historical plot for this day\n" +
        "2. Put it in an /images/ folder in the repo\n" +
        "3. Set the layer.url in scenarios.js to the image path\n\n" +
        "Example: url: \"images/20110427_surface.png\""
      );
      return;
    }

    // Toggle existing overlay
    if (activeOverlays[layer.id]) {
      map.removeLayer(activeOverlays[layer.id]);
      delete activeOverlays[layer.id];
      btn.classList.remove("active");
      return;
    }

    // Default CONUS-ish bounds (you can refine per image later)
    const bounds = L.latLngBounds(
      [24.0, -125.0], // SW
      [50.0, -66.0]   // NE
    );

    const overlay = L.imageOverlay(layer.url, bounds, {
      opacity: 0.75,
      interactive: false
    }).addTo(map);

    activeOverlays[layer.id] = overlay;
    btn.classList.add("active");
  }

  // ---------- Core flow ----------
  function generateDay() {
    const idx = Math.floor(Math.random() * SCENARIOS.length);
    currentScenario = SCENARIOS[idx];
    hasSubmitted = false;

    clearTarget();
    clearReportMarkers();
    clearOverlays();
    scoreDisplay.classList.add("hidden");

    map.setView(currentScenario.center, currentScenario.zoom);

    statusText.innerHTML = `Mystery day loaded.<br>Place your tornado target.`;
    monthHint.textContent = `This event takes place in ${currentScenario.monthHint}`;
    monthHint.classList.remove("hidden");

    renderParameters(currentScenario);

    btnNewDay.disabled = false;
    btnSubmit.disabled = true;
    btnReset.disabled = true;
  }

  function onMapClick(e) {
    if (!currentScenario || hasSubmitted) return;

    targetLatLng = e.latlng;

    if (targetMarker) {
      targetMarker.setLatLng(targetLatLng);
    } else {
      const icon = L.divIcon({
        className: "target-icon",
        iconSize: [18, 18]
      });
      targetMarker = L.marker(targetLatLng, { icon, draggable: true }).addTo(map);
      targetMarker.on("dragend", function (ev) {
        targetLatLng = ev.target.getLatLng();
        updateTargetInfo();
      });
    }

    updateTargetInfo();
    btnSubmit.disabled = false;
    btnReset.disabled = false;
  }

  function updateTargetInfo() {
    if (!targetLatLng) return;
    targetInfo.innerHTML = `Target: ${targetLatLng.lat.toFixed(3)}, ${targetLatLng.lng.toFixed(3)}`;
  }

  function submitForecast() {
    if (!currentScenario || !targetLatLng || hasSubmitted) return;
    hasSubmitted = true;

    let nearest = null;
    let minDist = Infinity;

    currentScenario.reports.forEach((r) => {
      const d = haversineMiles(targetLatLng.lat, targetLatLng.lng, r.lat, r.lon);
      if (d < minDist) {
        minDist = d;
        nearest = r;
      }
    });

    const score = calculateScore(minDist);

    clearReportMarkers();
    currentScenario.reports.forEach((r) => {
      const icon = L.divIcon({
        className: "report-icon",
        iconSize: [12, 12]
      });
      const m = L.marker([r.lat, r.lon], { icon })
        .addTo(map)
        .bindPopup(`<strong>${r.rating}</strong><br>${r.comment || ""}`);
      reportMarkers.push(m);
    });

    const group = L.featureGroup([targetMarker, ...reportMarkers]);
    map.fitBounds(group.getBounds().pad(0.3));

    scoreValue.textContent = score.toLocaleString();
    distanceValue.textContent = `${minDist.toFixed(1)} miles from nearest tornado`;
    scoreDisplay.classList.remove("hidden");

    statusText.innerHTML = `Submitted!<br>See results below.`;
    btnSubmit.disabled = true;
    btnReset.disabled = true;

    gamesPlayed += 1;
    totalScore += score;
    distanceSum += minDist;
    if (minDist < bestDistance) bestDistance = minDist;
    updateStatsUI();

    resultsTitle.textContent =
      score >= 4000 ? "Excellent Forecast!" : score >= 2000 ? "Solid Forecast" : "Keep Practicing";
    resultsDate.textContent = `Mystery Day: ${currentScenario.date}`;
    resultsScore.textContent = `${score.toLocaleString()} pts`;
    resultsDistance.textContent = `You were ${minDist.toFixed(1)} miles from the nearest tornado report`;
    resultsReports.innerHTML = `${currentScenario.reports.length} tornado reports shown on map<br>
      Nearest: <strong>${nearest.rating}</strong> — ${nearest.comment || "report"}`;
    resultsModal.classList.remove("hidden");
  }

  function resetTarget() {
    if (hasSubmitted) return;
    clearTarget();
  }

  function closeModal() {
    resultsModal.classList.add("hidden");
  }

  // ---------- Event listeners ----------
  btnNewDay.addEventListener("click", generateDay);
  btnSubmit.addEventListener("click", submitForecast);
  btnReset.addEventListener("click", resetTarget);
  modalClose.addEventListener("click", closeModal);
  btnPlayAgain.addEventListener("click", () => {
    closeModal();
    generateDay();
  });

  resultsModal.addEventListener("click", (e) => {
    if (e.target === resultsModal) closeModal();
  });

  // ---------- Boot ----------
  initMap();
  updateStatsUI();
  statusText.textContent = "Click Generate Day to begin a mystery tornado day.";
})();
