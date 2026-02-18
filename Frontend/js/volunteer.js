async function loadFoodRequests() {
  try {
    const res = await fetch("http://localhost:5000/api/food");
    const foods = await res.json();

    const box = document.getElementById("requestBox");
    box.innerHTML = "";

    foods.forEach((f) => {
      const div = document.createElement("div");
      div.className = "request";
      div.innerHTML = `
        <p><b>Event:</b> ${f.eventName}</p>
        <p><b>Quantity:</b> ${f.quantity} people</p>
        <p><b>Location:</b> ${f.manualLocation || "Live"}</p>
        <p style="font-size:12px;color:#64748b;">
          ID: ${f._id} | ${new Date(f.createdAt).toLocaleString()}
        </p>
        <button class="success">Accept & Collect</button>
      `;
      box.appendChild(div);
    });
  } catch (e) {
    document.getElementById("requestBox").innerText =
      "Backend not reachable";
  }
}

window.onload = loadFoodRequests;
