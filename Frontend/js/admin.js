const vol = JSON.parse(localStorage.getItem("volunteer"));
const box = document.getElementById("volBox");

if (vol) {
  box.innerHTML = `
    <p><b>Name:</b> ${vol.name}</p>
    <p><b>Phone:</b> ${vol.phone}</p>
    <p><b>Type:</b> ${vol.type}</p>
    <p><b>Organization:</b> ${vol.organization}</p>
    <p><b>Status:</b> ${vol.status}</p>
    <button onclick="approveVolunteer()">Approve</button>
  `;
}

async function loadPendingVolunteers() {
  const res = await fetch("http://localhost:5000/api/volunteers/approved"); 
  const approved = await res.json();
  console.log("Approved volunteers:", approved);
  // You can also create a /pending endpoint if needed
}

loadPendingVolunteers();
