document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log("Botón presionado:", btn.textContent.trim());
  });
});

document.querySelector(".account-btn").addEventListener("click", () => {
  alert("Aquí irá login / registro de miembros.");
});

document.querySelectorAll(".service button").forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("Solicitud enviada a la central AS CLICK.");
  });
});

document.querySelector(".search-mini button").addEventListener("click", () => {
  const value = document.querySelector(".search-mini input").value;
  alert("Buscando en corralones: " + (value || "sin dato"));
});
