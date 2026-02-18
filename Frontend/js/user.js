let latitude = null;
let longitude = null;

function getLocation(){
  navigator.geolocation.getCurrentPosition(
    pos => {
      latitude = pos.coords.latitude.toFixed(5);
      longitude = pos.coords.longitude.toFixed(5);
      alert("Live location captured");
    },
    () => alert("Location access denied")
  );
}

async function submitFood() {
  const data = {
    eventName: document.getElementById("event").value,
    quantity: Number(document.getElementById("people").value),
    manualLocation: document.getElementById("manualLoc").value,
    lat: window.latitude || null,
    lng: window.longitude || null
  };

  try {
    const res = await fetch("http://localhost:5000/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("userMsg").innerText =
      "Saved to MongoDB. Request ID: " + result._id;

    document.getElementById("apiStatus").innerText =
      "Backend Connected ✔";

  } catch (err) {
    document.getElementById("apiStatus").innerText =
      "Backend NOT Connected ✖";
  }
}
