function handleType() {
  const type = document.getElementById("type").value;
  const orgName = document.getElementById("orgName");
  const orgPlace = document.getElementById("orgPlace");

  if (type === "NGO") {
    orgName.style.display = "block";
    orgPlace.style.display = "block";
    orgName.placeholder = "NGO Name";
    orgPlace.placeholder = "NGO Place";
  }
  else if (type === "OldAgeHome") {
    orgName.style.display = "block";
    orgPlace.style.display = "block";
    orgName.placeholder = "Old Age Home Name";
    orgPlace.placeholder = "Old Age Home Place";
  }
  else {
    orgName.style.display = "none";
    orgPlace.style.display = "none";
    orgName.value = "";
    orgPlace.value = "";
  }
}

async function registerVolunteer() {
  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    type: document.getElementById("type").value,
    organization: document.getElementById("orgName").value || "Individual",
    place: document.getElementById("orgPlace").value || "N/A"
  };

  const res = await fetch("http://localhost:5000/api/volunteers/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  document.getElementById("msg").innerText = result.message;
}

