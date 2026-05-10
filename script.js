import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcYsNqiD3mdowWngvqZhXIyGSIvqpzny8",
  authDomain: "asclick-6faf9.firebaseapp.com",
  projectId: "asclick-6faf9",
  storageBucket: "asclick-6faf9.firebasestorage.app",
  messagingSenderId: "501315978480",
  appId: "1:501315978480:web:58aa1bfab5e71bbc66ae35"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let autoTipoActual = "robados";

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const loginMsg = document.getElementById("loginMsg");

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "";
  } catch (error) {
    loginMsg.textContent = "No se pudo iniciar sesión: " + error.message;
  }
};

window.register = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "";
  } catch (error) {
    loginMsg.textContent = "No se pudo crear la cuenta: " + error.message;
  }
};

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    await cargarTodo();
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
});

window.showSection = function (id) {
  document.querySelectorAll(".module").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "asclick") cargarAsClick();
  if (id === "autoprotect") cargarAutos();
  if (id === "tjd") cargarTJD();
};

async function cargarTodo() {
  await cargarAsClick();
  await cargarAutos();
  await cargarTJD();
}

window.guardarAsClick = async function () {
  const servicio = document.getElementById("asServicio").value;
  const nombre = document.getElementById("asNombre").value.trim();
  const telefono = document.getElementById("asTelefono").value.trim();
  const vehiculo = document.getElementById("asVehiculo").value.trim();
  const ubicacion = document.getElementById("asUbicacion").value.trim();

  if (!servicio || !nombre || !telefono || !ubicacion) {
    alert("Completa servicio, nombre, teléfono y ubicación.");
    return;
  }

  await addDoc(collection(db, "asclick_reportes"), {
    servicio,
    nombre,
    telefono,
    vehiculo,
    ubicacion,
    estado: "pendiente",
    uid: auth.currentUser.uid,
    fecha: serverTimestamp()
  });

  const mensaje =
    `AS CLICK%0A` +
    `Servicio: ${servicio}%0A` +
    `Cliente: ${nombre}%0A` +
    `Teléfono: ${telefono}%0A` +
    `Vehículo: ${vehiculo}%0A` +
    `Ubicación: ${ubicacion}`;

  window.open(`https://wa.me/?text=${mensaje}`, "_blank");

  limpiarAsClick();
  await cargarAsClick();
};

function limpiarAsClick() {
  document.getElementById("asServicio").value = "";
  document.getElementById("asNombre").value = "";
  document.getElementById("asTelefono").value = "";
  document.getElementById("asVehiculo").value = "";
  document.getElementById("asUbicacion").value = "";
}

async function cargarAsClick() {
  const cont = document.getElementById("listaAsClick");
  cont.innerHTML = "";

  const q = query(collection(db, "asclick_reportes"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  snap.forEach((d) => {
    const r = d.data();

    cont.innerHTML += `
      <div class="item">
        <h3>${r.servicio || ""}</h3>
        <p><b>Cliente:</b> ${r.nombre || ""}</p>
        <p><b>Teléfono:</b> ${r.telefono || ""}</p>
        <p><b>Vehículo:</b> ${r.vehiculo || ""}</p>
        <p><b>Ubicación:</b> ${r.ubicacion || ""}</p>
        <p><b>Estado:</b> ${r.estado || "pendiente"}</p>
        <button class="delete" onclick="eliminarDoc('asclick_reportes','${d.id}')">Eliminar</button>
      </div>
    `;
  });
}

window.setAutoTipo = async function (tipo) {
  autoTipoActual = tipo;

  const titulo = document.getElementById("autoTitulo");
  if (tipo === "robados") titulo.textContent = "Autos robados";
  if (tipo === "localizados") titulo.textContent = "Autos localizados";
  if (tipo === "recuperados") titulo.textContent = "Autos recuperados";

  await cargarAutos();
};

window.guardarAuto = async function () {
  const marca = document.getElementById("autoMarca").value.trim();
  const submarca = document.getElementById("autoSubmarca").value.trim();
  const placas = document.getElementById("autoPlacas").value.trim().toUpperCase();
  const serie = document.getElementById("autoSerie").value.trim();
  const estado = document.getElementById("autoEstado").value.trim();
  const foto = document.getElementById("autoFoto").value.trim();
  const recompensa = document.getElementById("autoRecompensa").value;

  if (!marca || !placas || !estado) {
    alert("Completa marca, placas y estado.");
    return;
  }

  await addDoc(collection(db, "autoprotect_" + autoTipoActual), {
    marca,
    submarca,
    placas,
    serie,
    estado,
    foto,
    recompensa,
    uid: auth.currentUser.uid,
    fecha: serverTimestamp()
  });

  limpiarAuto();
  await cargarAutos();
};

function limpiarAuto() {
  document.getElementById("autoMarca").value = "";
  document.getElementById("autoSubmarca").value = "";
  document.getElementById("autoPlacas").value = "";
  document.getElementById("autoSerie").value = "";
  document.getElementById("autoEstado").value = "";
  document.getElementById("autoFoto").value = "";
  document.getElementById("autoRecompensa").value = "no";
}

async function cargarAutos() {
  const cont = document.getElementById("listaAutos");
  cont.innerHTML = "";

  const q = query(collection(db, "autoprotect_" + autoTipoActual), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  snap.forEach((d) => {
    const a = d.data();
    const clase = a.recompensa === "si" ? "item gold" : "item";

    cont.innerHTML += `
      <div class="${clase}">
        <h3>${a.marca || ""} ${a.submarca || ""}</h3>
        <p><b>Placas:</b> ${a.placas || ""}</p>
        <p><b>Serie:</b> ${a.serie || ""}</p>
        <p><b>Estado:</b> ${a.estado || ""}</p>
        <p><b>Recompensa:</b> ${a.recompensa === "si" ? "Sí" : "No"}</p>
        ${a.foto ? `<img src="${a.foto}" alt="Foto auto">` : ""}
        <button class="delete" onclick="eliminarDoc('autoprotect_${autoTipoActual}','${d.id}')">Eliminar</button>
      </div>
    `;
  });
}

window.abrirCorralon = function () {
  alert("Zona de Corralón será solo un enlace dentro de Auto Protect.");

  /*
    Aquí después puedes poner el link real:
    window.open("https://tu-link-zona-corralon.com", "_blank");
  */
};

window.guardarTJD = async function () {
  const nombre = document.getElementById("tjdNombre").value.trim();
  const categoria = document.getElementById("tjdCategoria").value.trim();
  const telefono = document.getElementById("tjdTelefono").value.trim();
  const whatsapp = document.getElementById("tjdWhatsapp").value.trim();
  const direccion = document.getElementById("tjdDireccion").value.trim();
  const oferta = document.getElementById("tjdOferta").value.trim();
  const foto = document.getElementById("tjdFoto").value.trim();

  if (!nombre || !categoria || !telefono) {
    alert("Completa nombre, categoría y teléfono.");
    return;
  }

  await addDoc(collection(db, "tjd_negocios"), {
    nombre,
    categoria,
    telefono,
    whatsapp,
    direccion,
    oferta,
    foto,
    activo: true,
    uid: auth.currentUser.uid,
    fecha: serverTimestamp()
  });

  limpiarTJD();
  await cargarTJD();
};

function limpiarTJD() {
  document.getElementById("tjdNombre").value = "";
  document.getElementById("tjdCategoria").value = "";
  document.getElementById("tjdTelefono").value = "";
  document.getElementById("tjdWhatsapp").value = "";
  document.getElementById("tjdDireccion").value = "";
  document.getElementById("tjdOferta").value = "";
  document.getElementById("tjdFoto").value = "";
}

async function cargarTJD() {
  const cont = document.getElementById("listaTJD");
  cont.innerHTML = "";

  const q = query(collection(db, "tjd_negocios"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  snap.forEach((d) => {
    const n = d.data();

    cont.innerHTML += `
      <div class="item">
        <h3>${n.nombre || ""}</h3>
        <p><b>Categoría:</b> ${n.categoria || ""}</p>
        <p><b>Teléfono:</b> ${n.telefono || ""}</p>
        <p><b>WhatsApp:</b> ${n.whatsapp || ""}</p>
        <p><b>Dirección:</b> ${n.direccion || ""}</p>
        <p><b>Oferta:</b> ${n.oferta || ""}</p>
        ${n.foto ? `<img src="${n.foto}" alt="Foto negocio">` : ""}
        <button class="delete" onclick="eliminarDoc('tjd_negocios','${d.id}')">Eliminar</button>
      </div>
    `;
  });
}

window.eliminarDoc = async function (coleccion, id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este registro?");
  if (!confirmar) return;

  await deleteDoc(doc(db, coleccion, id));

  await cargarTodo();
};
