/* Lógica de la aplicación */
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const U = window.UI, S = window.SOL, FLOWS = window.FLOWS;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  /* Modo público (GitHub Pages): sin horas salvo ?horas=1 */
  const SHOW_H = !window.SPB_PUBLIC || /[?&]horas=1/.test(location.search);
  const noH = s => SHOW_H ? (s || "") : String(s || "").replace(/\s*·\s*[\d.]+ h/g, "");

  /* ---------- Tabs ---------- */
  function showTab(name) {
    $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    $$(".page").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
    try { localStorage.setItem("spb.tab", name); } catch (e) { }
  }
  $$(".tabs button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));

  /* ---------- WBS helpers ---------- */
  function wbsChips(ids) {
    return `<div class="wbs">${(ids || []).map(id => { const x = S.WBS[id]; return x ? `<span title="${esc(x.d)}"><b>${id}</b> ${esc(x.n)}${SHOW_H ? ` · ${x.h} h` : ""}</span>` : `<span><b>${id}</b></span>`; }).join("")}</div>`;
  }

  /* ---------- Flujos ---------- */
  let curFlow = null, curIdx = 0, visited = new Set(), timer = null;

  function renderFlowList() {
    const groups = [];
    FLOWS.forEach(f => { if (!groups.includes(f.group)) groups.push(f.group); });
    $("#flow-list").innerHTML = groups.map(g => `<div class="flow-group">${g}</div>` + FLOWS.filter(f => f.group === g).map(f =>
      `<div class="flow-card" data-id="${f.id}"><b>${f.title}</b><span>${f.actor}</span><div class="tag gray" style="margin-top:4px">${f.steps.length} pasos</div></div>`).join("")).join("");
    $$(".flow-card").forEach(c => c.addEventListener("click", () => openFlow(c.dataset.id)));
  }

  function openFlow(id, idx) {
    stopAuto();
    curFlow = FLOWS.find(f => f.id === id) || FLOWS[0];
    curIdx = idx || 0; visited = new Set([curIdx]);
    $$(".flow-card").forEach(c => c.classList.toggle("active", c.dataset.id === curFlow.id));
    try { localStorage.setItem("spb.flow", curFlow.id); } catch (e) { }
    renderStep();
    if (window.innerWidth < 1000) $("#player").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stepIndex(id) { return curFlow.steps.findIndex(s => s.id === id); }

  function goTo(i) {
    if (i < 0 || i >= curFlow.steps.length) return;
    curIdx = i; visited.add(i); renderStep();
  }

  function nextIndex() {
    const st = curFlow.steps[curIdx];
    if (st.next) return stepIndex(st.next);
    let i = curIdx + 1;
    while (i < curFlow.steps.length && curFlow.steps[i].branch) i++;
    return i < curFlow.steps.length ? i : -1;
  }

  function renderStep() {
    const f = curFlow, st = f.steps[curIdx];
    $("#player-head").innerHTML = `<div class="meta"><h2>${f.title}</h2><p class="small">${f.summary}</p></div>
      <div class="actors">${f.actors.map(a => `<span class="tag navy">${a}</span>`).join("")}</div>`;

    $("#stepper").innerHTML = f.steps.map((s, i) => `<div class="step-dot ${i === curIdx ? "current" : visited.has(i) && i < curIdx ? "done" : ""} ${s.branch ? "branch" : ""}" data-i="${i}"><div class="n">${s.branch ? "↳" : i + 1}</div><div class="t">${s.title}</div></div>`).join("");
    $$(".step-dot").forEach(d => d.addEventListener("click", () => goTo(+d.dataset.i)));
    const cur = $(".step-dot.current"); if (cur) cur.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

    const blocks = [];
    blocks.push(`<div class="dblock"><h4>👤 Quién actúa</h4><div>${st.who}</div></div>`);
    if (st.system) blocks.push(`<div class="dblock"><h4>⚙️ Qué hace el sistema</h4><ul>${st.system.map(x => `<li>${x}</li>`).join("")}</ul></div>`);
    if (st.ia) blocks.push(`<div class="dblock ia"><h4>🧠 Inteligencia artificial</h4><ul>${st.ia.map(x => `<li>${x}</li>`).join("")}</ul></div>`);
    if (st.int) blocks.push(`<div class="dblock int"><h4>🔌 Integraciones</h4><ul>${st.int.map(x => `<li>${x}</li>`).join("")}</ul></div>`);
    if (st.data) blocks.push(`<div class="dblock"><h4>🗂️ Datos / parámetros</h4><ul>${st.data.map(x => `<li>${x}</li>`).join("")}</ul></div>`);
    if (st.state) blocks.push(`<div class="dblock"><h4>🔖 Estado del trámite / caso</h4><div class="state-now">${U.tag(st.state, "info")}</div></div>`);
    if (st.wbs) blocks.push(`<div class="dblock"><h4>📦 Módulos de la estimación</h4>${wbsChips(st.wbs)}</div>`);
    if (st.q) blocks.push(`<div class="dblock q"><h4>❓ Definiciones con SPB</h4><ul>${st.q.map(x => `<li>${x}</li>`).join("")}</ul></div>`);

    $("#step-body").innerHTML = `<div class="screen-col"><div class="step-title"><h3>${st.branch ? "↳ " : ""}${curIdx + 1}. ${st.title}</h3><span class="who">${st.who}</span></div>${st.screen}</div>
      <div class="detail-col">${blocks.join("")}</div>`;

    const ni = nextIndex();
    let choices = "";
    if (st.choices) choices = `<div class="choices"><span class="lbl">Decisión:</span>${st.choices.map(c => `<button class="cbtn ${c.cls || ""}" data-to="${c.to}">${c.t}</button>`).join("")}</div>`;
    $("#nav").innerHTML = `<button class="nbtn sec" id="prev" ${curIdx === 0 ? "disabled" : ""}>← Anterior</button>
      <button class="nbtn" id="next" ${ni < 0 ? "disabled" : ""}>${ni < 0 ? "Fin del flujo" : "Siguiente →"}</button>
      ${choices}<span class="spacer"></span>
      <button class="nbtn sec" id="auto">${timer ? "⏸ Pausar" : "▶ Reproducir"}</button>
      <span class="small">Paso ${curIdx + 1} de ${f.steps.length} · <span class="kbd">←</span> <span class="kbd">→</span> para navegar</span>`;
    $("#prev").addEventListener("click", () => goTo(curIdx - 1));
    $("#next").addEventListener("click", () => { if (ni >= 0) goTo(ni); });
    $$(".cbtn", $("#nav")).forEach(b => b.addEventListener("click", () => { stopAuto(); goTo(stepIndex(b.dataset.to)); }));
    $("#auto").addEventListener("click", () => timer ? stopAuto() : startAuto());
  }

  function startAuto() {
    timer = setInterval(() => { const ni = nextIndex(); if (ni < 0) { stopAuto(); return; } goTo(ni); }, 6000);
    const b = $("#auto"); if (b) b.textContent = "⏸ Pausar";
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; const b = $("#auto"); if (b) b.textContent = "▶ Reproducir"; } }

  document.addEventListener("keydown", e => {
    if (!$("#tab-flujos").classList.contains("active") || !curFlow) return;
    if (e.key === "ArrowRight") { const ni = nextIndex(); if (ni >= 0) goTo(ni); }
    if (e.key === "ArrowLeft") goTo(curIdx - 1);
  });

  /* ---------- Solución / arquitectura ---------- */
  function renderArch() {
    $("#arch-layers").innerHTML = S.LAYERS.map(l => `<div class="layer"><h4>${l.name}</h4><div class="blocks">${l.blocks.map(b => `<div class="blk ${b.cls}" data-id="${b.id}"><b>${b.t}</b><span>${noH(b.s)}</span></div>`).join("")}</div></div>`).join("");
    $$(".blk").forEach(b => b.addEventListener("click", () => showBlock(b.dataset.id)));
    const totals = { T: 0, A: 0, B: 0, O: 0 };
    Object.keys(S.WBS).forEach(k => totals[k[0]] += S.WBS[k].h);
    $("#arch-panel").innerHTML = SHOW_H ? `<h3>Haz clic en un bloque</h3><p class="small">Verás qué hace, cuántas horas de desarrollo tiene en la WBS y en qué flujos aparece.</p>
      <h4>Horas de desarrollo por producto</h4>
      ${["T", "A", "B", "O"].map(k => { const n = { T: "Transversal", A: "Registro", B: "PQRS", O: "Opcionales" }[k]; return `<div class="small"><b>${n}</b> · ${totals[k].toLocaleString("es-CO")} h</div><div class="bar"><i style="width:${Math.round(totals[k] / 2584 * 100)}%"></i></div>`; }).join("")}
      <p class="small">Base: 7.012 h de desarrollo → 13.144 h totales con análisis (18 %), QA (25 %), arquitectura (8 %), gestión (12 %) y contingencia (15 %). 34 semanas, 13 personas.</p>
      <h4>Fases</h4>${S.PHASES.map(p => `<div class="small" style="margin-bottom:6px"><b>${p.f}</b> · ${p.d}<br>${p.c}</div>`).join("")}`
      : `<h3>Haz clic en un bloque</h3><p class="small">Verás qué hace cada módulo y en qué flujos aparece.</p>
      <h4>Fases propuestas</h4>${S.PHASES.map(p => `<div class="small" style="margin-bottom:6px"><b>${p.f}</b> · ${p.d}<br>${p.c}</div>`).join("")}`;
  }

  function showBlock(id) {
    $$(".blk").forEach(b => b.classList.toggle("on", b.dataset.id === id));
    const blk = S.LAYERS.flatMap(l => l.blocks).find(b => b.id === id);
    const x = S.WBS[id];
    const flowsUsing = FLOWS.filter(f => f.steps.some(s => (s.wbs || []).includes(id)));
    let html = `<h3>${blk.t}</h3>`;
    if (x) html += `<p class="small">${U.tag(id, "navy")} ${U.tag("Complejidad " + x.c, x.c === "Alta" ? "bad" : x.c === "Media" ? "warn" : "ok")} ${SHOW_H ? U.tag(x.h + " h desarrollo", "info") : ""}</p><p>${x.d}</p>`;
    else html += `<p class="small">${blk.s || ""}</p><p>${blk.d || ""}</p>`;
    if (flowsUsing.length) html += `<h4>Aparece en los flujos</h4><ul class="small">${flowsUsing.map(f => `<li><a href="#" data-flow="${f.id}">${f.title}</a></li>`).join("")}</ul>`;
    $("#arch-panel").innerHTML = html;
    $$("#arch-panel a[data-flow]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); showTab("flujos"); openFlow(a.dataset.flow); }));
  }

  /* ---------- Pantallas por perfil ---------- */
  function renderProfiles() {
    const names = Object.keys(S.PROFILES);
    $("#profiles").innerHTML = names.map((n, i) => `<button class="${i === 0 ? "on" : ""}" data-p="${n}">${n}</button>`).join("");
    $$("#profiles button").forEach(b => b.addEventListener("click", () => { $$("#profiles button").forEach(x => x.classList.toggle("on", x === b)); showProfile(b.dataset.p); }));
    showProfile(names[0]);
  }
  function showProfile(name) {
    const p = S.PROFILES[name];
    const first = p.pages[0].t;
    const shell = p.menu ? U.shell({ menu: p.menu, active: first, user: name, title: first, body: `<p class="small">${p.pages[0].d}</p>` }) : U.shell({ public: true, title: first, body: `<p class="small">${p.pages[0].d}</p>` });
    $("#sitemap").innerHTML = `<div><h4>Menú lateral que vería este perfil</h4>${shell}</div>
      <div><h4>Páginas y qué contienen</h4><div class="pages">${p.pages.map(pg => `<div class="pg"><b>${pg.t}</b><p>${pg.d}</p>${wbsChips(pg.w)}</div>`).join("")}</div></div>`;
  }

  /* ---------- Estados (SVG) ---------- */
  function renderStates() {
    $("#states").innerHTML = Object.keys(S.STATES).map(k => `<div class="svgwrap"><h3>${S.STATES[k].title}</h3>${stateSvg(S.STATES[k])}</div>`).join("") +
      `<div class="svgwrap"><h3>Tiempos de respuesta y SLA</h3><table class="tbl sla-table"><thead><tr><th>Tipo</th><th>Tiempo</th><th>Fuente</th></tr></thead><tbody>${S.SLA.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="small">Alertas al 80 % y 90 % del tiempo, escalamiento automático al 100 %. El reloj se detiene mientras el caso está "pendiente del cliente". Tiempos definidos por SPB el 23 sep 2026 (respuesta #17): al cliente desde la radicación y del área desde la asignación del ticket.</p></div>`;
  }
  function stateSvg(d) {
    const W = 128, H = 44, colors = { ok: ["#e6f6ee", "#1e8e5a"], warn: ["#fff4e0", "#b7791f"], bad: ["#fdecea", "#c0392b"] };
    const pos = {}; d.nodes.forEach(n => pos[n.id] = n);
    const maxX = Math.max(...d.nodes.map(n => n.x)) + W + 40, maxY = Math.max(...d.nodes.map(n => n.y)) + H + 40;
    let s = `<svg viewBox="0 0 ${maxX} ${maxY}" width="${maxX}" height="${maxY}" style="max-width:100%;height:auto"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#6a7b8c"/></marker></defs>`;
    d.edges.forEach(([a, b, l]) => {
      const A = pos[a], B = pos[b];
      let path, lx, ly;
      if (a === b) { path = `M${A.x + W - 20},${A.y} C${A.x + W + 30},${A.y - 40} ${A.x + W - 70},${A.y - 40} ${A.x + 20},${A.y}`; lx = A.x + W / 2; ly = A.y - 32; }
      else if (A.y === B.y) {
        const dir = B.x > A.x ? 1 : -1;
        if (Math.abs(B.x - A.x) > W + 40) { const off = -28; path = `M${A.x + W / 2},${A.y} C${A.x + W / 2},${A.y + off * 2} ${B.x + W / 2},${B.y + off * 2} ${B.x + W / 2},${B.y}`; lx = (A.x + B.x + W) / 2; ly = A.y + off - 4; }
        else { const x1 = dir > 0 ? A.x + W : A.x, x2 = dir > 0 ? B.x : B.x + W; path = `M${x1},${A.y + H / 2} L${x2},${B.y + H / 2}`; lx = (x1 + x2) / 2; ly = A.y - 5; }
      } else {
        const x1 = A.x + W / 2 + (B.x > A.x ? 20 : B.x < A.x ? -20 : (B.y > A.y ? -25 : 25)), x2 = B.x + W / 2 + (B.x > A.x ? -20 : B.x < A.x ? 20 : (B.y > A.y ? -25 : 25));
        const y1 = B.y > A.y ? A.y + H : A.y, y2 = B.y > A.y ? B.y : B.y + H;
        path = `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`; lx = (x1 + x2) / 2 + (B.x === A.x ? (B.y > A.y ? -34 : 34) : 0); ly = (y1 + y2) / 2 + 4;
      }
      s += `<path d="${path}" fill="none" stroke="#6a7b8c" stroke-width="1.4" marker-end="url(#arr)"/>`;
      if (l) s += `<text x="${lx}" y="${ly}" font-size="10" fill="#5d6b7a" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${l}</text>`;
    });
    d.nodes.forEach(n => {
      const c = colors[n.cls] || ["#fff", "#0b3a6b"];
      s += `<rect x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="8" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.5"/>`;
      const words = n.t.split(" "); let lines = [""]; words.forEach(wd => { if ((lines[lines.length - 1] + " " + wd).trim().length > 22) lines.push(wd); else lines[lines.length - 1] = (lines[lines.length - 1] + " " + wd).trim(); });
      lines.forEach((ln, i) => { s += `<text x="${n.x + W / 2}" y="${n.y + H / 2 + (i - (lines.length - 1) / 2) * 13 + 4}" font-size="11.5" font-weight="600" fill="${c[1]}" text-anchor="middle">${ln}</text>`; });
    });
    return s + "</svg>";
  }

  /* ---------- Roles ---------- */
  function renderRoles() {
    $("#roles").innerHTML = `<table><thead><tr><th>Rol</th><th>Acceso</th><th>Bandejas / menús</th><th>Acciones</th><th>Ve</th></tr></thead><tbody>${S.ROLES.map(r => `<tr><td>${r.r}</td><td>${r.acc}</td><td>${r.b}</td><td>${r.a}</td><td>${r.v}</td></tr>`).join("")}</tbody></table>`;
  }

  /* ---------- Integraciones ---------- */
  function renderInteg() {
    $("#integ").innerHTML = S.INTEG.map(i => `<div class="sys"><b>${i.s}</b><div class="who">${i.who}</div><ul><li><b>Cuándo:</b> ${i.when}</li><li><b>Qué:</b> ${i.what}</li></ul><span class="tag ${/Alto/.test(i.risk) ? "bad" : /Medio/.test(i.risk) ? "warn" : "ok"}">Riesgo ${i.risk}</span></div>`).join("");
  }

  /* ---------- Init ---------- */
  renderFlowList(); renderArch(); renderProfiles(); renderStates(); renderRoles(); renderInteg();
  let tab = "flujos", flow = FLOWS[0].id;
  try { tab = localStorage.getItem("spb.tab") || tab; flow = localStorage.getItem("spb.flow") || flow; } catch (e) { }
  if (!FLOWS.some(f => f.id === flow)) flow = FLOWS[0].id;
  const hash = (location.hash || "").replace("#", "");
  if (hash && $(`.tabs button[data-tab="${hash}"]`)) tab = hash;
  showTab($(`.tabs button[data-tab="${tab}"]`) ? tab : "flujos");
  openFlow(flow);
})();
