/* =========================================================
   LAB Avaliação — Client JS per a inscripció i identitat
   ========================================================= */

/** 1) POSA AQUÍ LA TEVA URL DEL WEB APP (finalitza amb /exec) **/
const SCRIPT_URL = "PASTE_YOUR_EXEC_URL_HERE";
https://script.google.com/macros/s/AKfycbyJR7Oly_floO3FkFcO7MHOPh5FROgyvjIxMMZeAP2QcU8dqEzrjIu2nE64Ly63SB2vpg/exec
/** Claus i utilitats de localStorage per guardar/recuperar la identitat **/
const IDENT_KEY = "lab_avaliacao_ident";

function saveIdent(ident) {
  try {
    localStorage.setItem(IDENT_KEY, JSON.stringify(ident));
  } catch (e) {
    console.warn("No s'ha pogut desar la identitat al navegador:", e);
  }
}

function loadIdent() {
  try {
    const raw = localStorage.getItem(IDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("No s'ha pogut llegir la identitat del navegador:", e);
    return null;
  }
}

function fillFormFromIdent(ident) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };
  if (!ident) return;
  set("email",   ident.email);
  set("nome",    ident.nome);
  set("codigo",  ident.codigo);
  set("grupo",   ident.grupo);
  set("membros", ident.membros);
}

function setSavedState(form, ok = true) {
  const btn = form ? form.querySelector('button[type="submit"]') : null;
  if (!btn) return;
  if (ok) {
    btn.textContent = "Guardado ✓";
    btn.disabled = true;                      // Si prefereixes que puguin re-enviar, comenta aquesta línia
    btn.classList.add("btn-saved");           // Per si vols estil diferent al CSS
  } else {
    btn.textContent = "Guardar Identificação";
    btn.disabled = false;
    btn.classList.remove("btn-saved");
  }
}

/** 2) Envia dades al teu Apps Script (espera JSON {result:"success"|"error", ...}) **/
async function enviarAlServidor(payload) {
  try {
    const resp = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // Si el web app està ben desplegat, respon JSON
    return await resp.json();
  } catch (error) {
    console.error("Error en enviar les dades:", error);
    // Si el navegador o permisos bloquegen la crida, retornem un error consistent
    return { result: "error", message: String(error || "unknown") };
  }
}

/** 3) Quan la portada carrega: reomple i gestiona l'enviament sense buidar el formulari **/
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-inscripcio");
  if (!form) return; // No som a la portada: no fem res

  // 3.1 Reomple si ja tenim identitat guardada
  const ident = loadIdent();
  if (ident) {
    fillFormFromIdent(ident);
    setSavedState(form, true); // Mostra "Guardado ✓" si ja hi ha dades
  }

  // 3.2 Enviament del formulari (sense refrescar la pàgina)
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // <- CLAU per evitar que el navegador buidi el formulari

    const email   = document.getElementById("email")?.value.trim()   || "";
    const nome    = document.getElementById("nome")?.value.trim()    || "";
    const codigo  = document.getElementById("codigo")?.value.trim()  || "";
    const grupo   = document.getElementById("grupo")?.value.trim()   || "";
    const membros = document.getElementById("membros")?.value.trim() || "";

    // Validació mínima (pots ampliar-la si vols)
    if (!email || !nome || !codigo || !grupo) {
      alert("Si us plau, omple com a mínim: E-mail, Nome, Código do curso i Nome do grupo.");
      return;
    }

    // “estat enviant” al botó
    const btn = form.querySelector('button[type="submit"]');
    const prevTxt = btn ? btn.textContent : null;
    if (btn) {
      btn.textContent = "Enviando…";
      btn.disabled = true;
    }

    // Envia al teu Apps Script
    const resposta = await enviarAlServidor({ email, nome, codigo, grupo, membros });

    // Restaura el botó si cal
    if (btn) btn.textContent = prevTxt ?? "Guardar Identificação";

    if (resposta && resposta.result === "success") {
      // Desa localment i deixa el formulari tal com està (SENSE reset)
      const identNova = { email, nome, codigo, grupo, membros };
      saveIdent(identNova);
      setSavedState(form, true);
      alert("✅ Inscripció registrada correctament!");
    } else {
      console.error("Resposta del servidor:", resposta);
      setSavedState(form, false);
      alert("⚠️ Hi ha hagut un problema. Torna-ho a provar.");
    }
  });
});
