/* Helpers para dibujar pantallas simuladas del portal */
(function (w) {
  const MENUS = {
    cliente: [
      { g: "Portal Integral" }, { t: "Inicio" }, { t: "Operaciones (portal actual)" },
      { g: "Portal del Cliente" }, { t: "Mis trámites" }, { t: "Registro y modalidades" }, { t: "Mis documentos" },
      { t: "PICAT · Personal" }, { t: "Usuarios y vehículos" }, { t: "PQRS" }, { t: "Asistente" }
    ],
    sac: [
      { g: "Servicio al Cliente" }, { t: "Bandeja de registros" }, { t: "Bandeja PQRS" }, { t: "Expedientes (360)" },
      { t: "Alertas y vencimientos" }, { t: "Tableros" },
      { g: "Administración" }, { t: "Matrices y reglas" }, { t: "Plantillas" }, { t: "Encuestas" }, { t: "Usuarios internos" }
    ],
    area: [
      { g: "Mi área" }, { t: "Bandeja de aprobaciones" }, { t: "Bandeja PQRS" }, { t: "Casos cerrados" }, { t: "Tableros de mi área" }
    ],
    segfis: [
      { g: "Seguridad Física" }, { t: "Bandeja PICAT" }, { t: "Enrolados" }, { t: "Cancelaciones" }, { t: "Chalecos" }, { t: "Tableros" }
    ],
    admin: [
      { g: "Administración" }, { t: "Matrices y reglas" }, { t: "Categorías PQRS" }, { t: "SLA por tipo" }, { t: "Plantillas" }, { t: "Integraciones" }, { t: "Auditoría" }
    ]
  };

  function shell(o) {
    const menu = MENUS[o.menu || "cliente"];
    const pub = o.public ? " public" : "";
    let sb = "";
    if (!o.public) {
      sb = '<div class="sb">' + menu.map(m => m.g ? `<div class="grp">${m.g}</div>` : `<div class="${m.t === o.active ? "on" : ""}">${m.t}</div>`).join("") + "</div>";
    }
    return `<div class="shell${pub}">
      <div class="tb"><span class="logo">SPB <em>Portal Integral</em></span>
        <span class="user">${o.user ? `<span>${o.user}</span><i></i>` : `<span>Acceso público</span>`}</span></div>
      ${sb}
      <div class="ct">${o.crumbs ? `<div class="crumbs">${o.crumbs}</div>` : ""}${o.title ? `<h3>${o.title}</h3>` : ""}${o.body || ""}</div>
    </div>`;
  }

  const fld = (label, value, cls) => `<div class="fld"><label>${label}</label><div class="v ${cls || ""}">${value || ""}</div></div>`;
  const tag = (t, cls) => `<span class="tag ${cls || "gray"}">${t}</span>`;
  const chips = (arr, on) => `<div class="chips">${arr.map(c => `<span class="chip ${on && on.includes(c) ? "on" : ""}">${c}</span>`).join("")}</div>`;
  const doc = (name, sub, right, ic) => `<div class="doc"><div class="ic">${ic || "PDF"}</div><div class="nm"><b>${name}</b><span>${sub || ""}</span></div>${right || ""}</div>`;
  const btns = (arr) => `<div class="btnrow">${arr.map(b => `<span class="mbtn ${b.cls || ""}">${b.t}</span>`).join("")}</div>`;
  const alert = (cls, html) => `<div class="alert ${cls}">${html}</div>`;
  const tbl = (head, rows, selIdx) => `<table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === selIdx ? "sel" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const timeline = (items) => `<ul class="timeline">${items.map(i => `<li class="${i.s || ""}"><b>${i.t}</b><span>${i.d || ""}</span></li>`).join("")}</ul>`;
  const kpis = (arr) => `<div class="cards">${arr.map(k => `<div class="kpi"><b>${k.v}</b><span>${k.l}</span></div>`).join("")}</div>`;
  const sla = (pct) => { const c = pct >= 100 ? "r" : pct >= 80 ? "y" : "g"; return `<div class="sla"><i class="${c}" style="width:${Math.min(pct, 100)}%"></i></div><div class="sla-marks"><span>0%</span><span>80% alerta</span><span>90% alerta</span><span>100% escala</span></div>`; };
  const modal = (title, body) => `<div class="overlay"><div class="modal"><h3>${title}</h3>${body}</div></div>`;
  const chat = (msgs) => `<div class="chat">${msgs.map(m => `<div class="m ${m.b ? "bot" : "usr"}">${m.t}</div>`).join("")}</div>`;

  const MODALIDADES = ["Importador / Exportador", "Importador directo", "Exportador directo", "OTM", "Agencia de aduanas", "Agencia de carga", "Empresa de transporte", "Operador portuario", "Agente marítimo", "Línea marítima", "Menajes", "Registro de terceros", "Proveedores (nueva)"];

  w.UI = { shell, fld, tag, chips, doc, btns, alert, tbl, timeline, kpis, sla, modal, chat, MODALIDADES };
})(window);
