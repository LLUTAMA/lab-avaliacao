/* LAB Avaliação – client JS per a inscripció i identitat
   - Envia el formulari d’inscripció a Google Apps Script (pestanya “Inscricoes”)
   - Desa/recupera la identificació al navegador per reutilitzar-la als blocs
*/

/** 1) POSADA LA TEVA URL DEL WEB APP (exec)  **/
const SCRIPT_URL =
 https://script.google.com/macros/s/AKfycbyJR7Oly_floO3FkFcO7MHOPh5FROgyvjIxMMZeAP2QcU8dqEzrjIu2nE64Ly63SB2vpg/exec

/** Utils de localStorage per guardar i recuperar la identitat **/
const IDENT_KEY = "lab_avaliacao_ident";

function saveIdent(ident) {
  try {
    localStorage.setItem(IDENT_KEY, JSON.stringify(ident));
  } catch (_) {}
}

function loadIdent() {
  try {
    const raw = localStorage.getItem(IDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/** Envia dades al teu Apps Script (retorna JSON {result:"success"|"error", ...}) */
async function enviarAlServidor(payload) {
  const resp = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // Si el web app està ben desplegat, podem llegir JSON
  try {
    return await resp.json();
  } catch {
    // En cas que el navegador bloquegi, fem un “èxit optimista”
    return { result: resp.ok ? "success" : "error" };
  }
}

/** Quan la pàgina carrega… */
document.addEventListener("DOMContentLoaded", () => {
  // 2) Reomplir el formulari d’identificació si ja tenim dades guardades
  const ident = loadIdent();
  if (ident) {
    const $ = (id) => document.getElementById(id);
    if ($("email")) $("email").value = ident.email || "";
    if ($("nome")) $("nome").value = ident.nome || "";
    if ($("codigo")) $("codigo").value = ident.codigo || "";
    if ($("grupo")) $("grupo").value = ident.grupo || "";
    if ($("membros")) $("membros").value = ident.membros || "";
  }

  // 3) Gestionar l’enviament del formulari d’inscripció (index.html)
  const form = document.getElementById("form-inscripcio");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const nome = document.getElementById("nome").value.trim();
      const codigo = document.getElementById("codigo").value.trim();
      const grupo = document.getElementById("grupo").value.trim();
      const membros = document.getElementById("membros").value.trim();

      if (!email || !nome || !codigo || !grupo) {
        alert("Si us plau, omple els camps obligatoris.");
        return;
      }

      // Guardem al navegador per reutilitzar als blocs
      saveIdent({ email, nome, codigo, grupo, membros });

      // Preparem el payload per al teu Apps Script
      const payload = {
        sheetName: "Inscricoes",   // <<< pestanya on guardem inscripcions
        email,
        nome,
        codigo,
        grupo,
        membros,
      };

      try {
        const result = await enviarAlServidor(payload);

        if (result && result.result === "success") {
          alert("✅ Inscripció registrada correctament!");
          // ves al Bloco 1
          window.location.href = "bloco1.html";
        } else {
          alert("⚠️ Hi ha hagut un problema. Torna-ho a provar.");
        }
      } catch (err) {
        console.error(err);
        alert("⚠️ Hi ha hagut un problema. Torna-ho a provar.");
      }
    });
  }
});
