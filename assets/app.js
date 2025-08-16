// assets/app.js

// Substitueix aquesta URL per la teva URL de Web App de Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqtRMEx41iovWYbaztDGFm3PSS906w9-67SFOLGiKxi2EMqckGxJyfGDKl8qZqeU76sA/exec";

async function enviarFormulario(dados) {
  try {
    const resposta = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(dados),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resultado = await resposta.json();
    console.log("Resposta del servidor:", resultado);
    return resultado;
  } catch (error) {
    console.error("Error en enviar les dades:", error);
  }
}

// Exemple d’ús: quan l’usuari cliqui el botó de registre
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-inscripcio");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dados = {
        email: document.getElementById("email").value,
        nome: document.getElementById("nome").value,
        codigo: document.getElementById("codigo").value,
        grupo: document.getElementById("grupo").value,
        membros: document.getElementById("membros").value,
      };

      const resposta = await enviarFormulario(dados);
      if (resposta && resposta.result === "success") {
        alert("✅ Inscripció registrada correctament!");
        window.location.href = "benvinguda.html"; // o la teva pantalla de benvinguda
      } else {
        alert("⚠️ Hi ha hagut un problema. Torna-ho a provar.");
      }
    });
  }
});
