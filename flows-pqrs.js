/* Flujos del producto 2: Sistema inteligente de gestión de PQRS */
(function (w) {
  const U = w.UI;
  const F = w.FLOWS = w.FLOWS || [];

  /* ============ FLUJO 7: Radicación de PQRS ============ */
  F.push({
    id: "pqr-radicacion", group: "Gestión de PQRS", title: "Radicación de una PQRS (registrado o no registrado)",
    actor: "Cliente registrado o ciudadano sin cuenta", actors: ["Cliente / Ciudadano", "Asistente IA", "IA documental"],
    summary: "La puerta de entrada única de peticiones, quejas, reclamos y solicitudes. Abierta por ley a usuarios no registrados (la comunidad vecina, por ejemplo). La IA ayuda a redactar, detecta duplicados, valida adjuntos y entrega un radicado con seguimiento en línea.",
    steps: [
      {
        id: "r1", title: "Entrada: ¿tienes cuenta?", who: "Cliente / Ciudadano",
        screen: U.shell({ public: true, title: "Peticiones, quejas, reclamos y solicitudes",
          body: `<div class="cards"><div class="card"><b>Soy cliente registrado</b><p class="small">Ingresa con tu usuario del Portal Integral. Tus datos se cargan solos y ves todas tus PQRS en un lugar.</p>${U.btns([{ t: "Ingresar" }])}</div>
            <div class="card"><b>No tengo cuenta</b><p class="small">Cualquier persona puede radicar. Solo necesitamos nombre, correo, teléfono y documento; te daremos un código para consultar el estado.</p>${U.btns([{ t: "Radicar sin cuenta", cls: "sec" }])}</div>
            <div class="card"><b>Consultar el estado</b><p class="small">Ingresa tu radicado y código de seguimiento.</p><div class="frm">${U.fld("Radicado", "PQR-2026-", "ph")}${U.fld("Código", "••••••", "ph")}</div></div></div>`
        }),
        system: ["Página pública dentro del mismo dominio y look del Portal Integral.", "Usuarios no registrados: captcha, límite de tasa y validación de correo para evitar spam (riesgo identificado).", "Usuarios registrados entran por el inicio de sesión único."],
        state: "—", wbs: ["B1", "T2"],
        choices: [{ t: "Cliente registrado", to: "r2", cls: "ok" }, { t: "Sin cuenta (no registrado)", to: "r1b" }]
      },
      {
        id: "r1b", title: "Datos básicos del no registrado (rama)", who: "Ciudadano", branch: true,
        screen: U.shell({ public: true, crumbs: "PQRS › Radicar sin cuenta", title: "Cuéntanos quién eres",
          body: `<div class="frm">${U.fld("Nombre completo", "Rosa Elena Valencia")}${U.fld("Tipo y número de documento", "CC 31.222.333")}${U.fld("Correo electrónico", "rosa.valencia@gmail.com " + U.tag("Verificar", "warn"))}${U.fld("Teléfono", "+57 315 000 0000")}${U.fld("Empresa (opcional)", "", "ph")}${U.fld("Verificación", "☑ No soy un robot")}</div>
            ${U.alert("info", "Te enviamos un código de 6 dígitos al correo para confirmar que es tuyo. Con él podrás consultar tu caso después.")}
            ${U.btns([{ t: "Continuar" }])}`
        }),
        system: ["Se crea un 'usuario ligero' sin acceso al portal: solo puede ver sus PQRS con radicado + código.", "Verificación de correo por código antes de radicar."],
        state: "—", wbs: ["B1"],
        choices: [{ t: "Correo verificado → continuar", to: "r2", cls: "ok" }]
      },
      {
        id: "r2", title: "Tipo de requerimiento y política de datos", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Nueva", title: "¿Qué quieres presentar?",
          body: `<div class="cards"><div class="card"><b>Petición</b><p class="small">Gestión de usuarios, facturas SPB o reintegros.</p></div><div class="card" style="border-color:var(--navy);background:var(--infobg)"><b>Reclamo ✔</b><p class="small">Facturas SPB, averías o faltantes, daño a motonave, daños a equipos o vehículos de terceros.</p></div><div class="card"><b>Queja</b><p class="small">Novedades en el proceso operativo o administrativo.</p></div></div>
            <p class="small">☑ Acepto la política de tratamiento de datos personales (versión 3.1 · 2026)</p>
            ${U.btns([{ t: "Continuar" }])}`
        }),
        system: ["Tres tipos y nueve categorías según la matriz de SPB (23 sep 2026); tipo y categoría fijan el tiempo de respuesta al cliente y el del área.", "Evidencia electrónica de la aceptación de la política."],
        state: "Borrador", wbs: ["B1", "T11"]
      },
      {
        id: "r3", title: "Formulario dinámico según el motor de requisitos", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Nueva › Reclamo", title: "Detalle del reclamo",
          body: `<div class="frm">${U.fld("Categoría", "Facturas SPB ▾")}${U.fld("Subcategoría", "Cobro no reconocido ▾")}${U.fld("Servicio relacionado", "Almacenamiento de contenedores ▾")}${U.fld("Número de factura", "FV-2026-118203 " + U.tag("Obligatorio para esta categoría", "info"))}${U.fld("Contenedor / BL (opcional)", "MSCU 482 001-7")}${U.fld("Canal", "Portal web")}</div>
            <div class="frm one">${U.fld("Describe lo ocurrido", "nos cobraron 3 dias de bodegaje del contenedor pero el contenedor salio el mismo dia que llego, adjunto la factura y el tiquete de salida", "")}</div>
            <b class="small">Adjuntos sugeridos para esta categoría</b>${U.chips(["Factura (obligatorio)", "Tiquete de salida / báscula", "Comunicaciones previas"], ["Factura (obligatorio)"])}
            ${U.btns([{ t: "Revisar con el asistente", cls: "sec" }, { t: "Continuar" }])}`
        }),
        system: ["El motor de reglas decide campos obligatorios, documentos y área potencial según tipo × categoría × canal × servicio × perfil del cliente.", "La matriz de categorías, subcategorías y áreas la administra SAC desde el portal."],
        data: ["Matriz de categorías PQRS → área responsable → criticidad → SLA (la entrega SPB)"],
        state: "Borrador", wbs: ["B2", "T4"]
      },
      {
        id: "r4", title: "Asistente de redacción", who: "Cliente + IA",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Nueva › Reclamo › Asistente", title: "Te ayudamos a que tu reclamo quede claro",
          body: `<div class="diff"><div class="card"><h5>Tu texto</h5><p class="small">nos cobraron 3 dias de bodegaje del contenedor pero el contenedor salio el mismo dia que llego, adjunto la factura y el tiquete de salida</p></div>
            <div class="card" style="border-color:var(--ia)"><h5>Propuesta del asistente</h5><p class="small">Solicito revisar la factura FV-2026-118203, en la que se cobran 3 días de almacenamiento del contenedor MSCU 482 001-7. El contenedor ingresó y salió del terminal el mismo día, por lo que el cobro no corresponde. Adjunto la factura y el tiquete de salida como soporte. Solicito la corrección de la factura o la nota crédito correspondiente.</p></div></div>
            ${U.alert("ia", "<b>Para agilizar tu caso, ¿puedes indicar?</b> · Fecha de ingreso y salida del contenedor · Si ya hablaste con alguien de SPB (nombre o correo)")}
            ${U.btns([{ t: "Usar la propuesta" }, { t: "Mantener mi texto", cls: "sec" }])}`
        }),
        ia: ["Mejora estructura y tono, corrige errores, identifica información faltante y hace preguntas de aclaración.", "Nunca cambia el sentido: el cliente decide qué versión enviar y ambas quedan guardadas."],
        state: "Borrador", wbs: ["B3"]
      },
      {
        id: "r5", title: "Detección de duplicados", who: "IA → Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Nueva › Reclamo", title: "Encontramos un caso parecido",
          body: `${U.alert("warn", "<b>PQR-2026-0142</b> · Reclamo · Facturación · factura FV-2026-118203 · radicado el 02/09/2026 · <b>Estado: en gestión por Facturación</b> (día 9 de 15)")}
            <p class="small">Coincide en: número de factura, contenedor y cliente. Si es el mismo tema, te recomendamos <b>agregar información al caso existente</b> en lugar de abrir uno nuevo: así no se reinicia el tiempo de respuesta.</p>
            ${U.btns([{ t: "Agregar a PQR-2026-0142", cls: "ok" }, { t: "Es un caso distinto, continuar", cls: "warn" }, { t: "Desistir", cls: "ghost" }])}`
        }),
        ia: ["Similitud por número documental, temática (embeddings del texto), cliente y casos recientes.", "Si el cliente continúa, los actores internos verán los casos relacionados (abiertos o cerrados) desde el caso nuevo."],
        state: "Borrador", wbs: ["B3"],
        choices: [{ t: "Agregar al caso existente (termina aquí)", to: "r8", cls: "ok" }, { t: "Caso distinto → continuar", to: "r6" }]
      },
      {
        id: "r6", title: "Adjuntos validados con IA", who: "Cliente + IA documental",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Nueva › Reclamo › Adjuntos", title: "Soportes",
          body: `${U.doc("FV-2026-118203.pdf", "Reconocido como <b>Factura</b> · Nº FV-2026-118203 · $ 1.245.300 · 3 días almacenamiento", U.tag("Legible · completo", "ok"))}
            ${U.doc("IMG_4471.jpg", "Reconocido como <b>Tiquete de báscula / salida</b> · 28/08/2026 16:42 · MSCU 482 001-7", U.tag("Legible", "ok"), "JPG")}
            ${U.doc("IMG_4472.jpg", "No se pudo leer: imagen muy oscura", U.tag("Ilegible · reemplazar", "bad"), "JPG")}
            ${U.alert("ia", "La factura y el tiquete coinciden en número de contenedor. Fecha de salida 28/08 = fecha de ingreso 28/08: la información respalda tu reclamo.")}
            ${U.btns([{ t: "Radicar reclamo" }, { t: "Reemplazar imagen", cls: "sec" }])}`
        }),
        ia: ["Clasificación de adjuntos (facturas, comunicaciones, fotos, certificaciones, evidencias, contratos), extracción de datos clave y validación de legibilidad y completitud.", "Resultado: aprobado, requiere corrección o información incompleta; el usuario puede continuar dejando la novedad registrada."],
        state: "Borrador", wbs: ["B4", "T7"]
      },
      {
        id: "r7", title: "Radicado y confirmación", who: "Sistema → Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", title: "Reclamo radicado",
          body: `${U.alert("ok", "<b>Radicado PQR-2026-0187</b> · 14/09/2026 11:05 · Reclamo · Facturas SPB · Cobro no reconocido")}
            <div class="card"><b>Tiempo de respuesta</b><p class="small">Tienes respuesta a más tardar el <b>21/09/2026</b> (5 días hábiles para reclamos sobre facturas SPB, según la matriz de tiempos de SPB). Te avisaremos por correo en cada cambio de estado.</p>${U.sla(2)}</div>
            <p class="small">Enviamos la confirmación a comercial@navierasur.com. Consulta tu caso en <b>PQRS › Mis casos</b> o con el código de seguimiento.</p>
            ${U.btns([{ t: "Ver mi caso" }, { t: "Descargar comprobante", cls: "sec" }])}`
        }),
        system: ["Número único de radicación, expediente electrónico del caso, confirmación automática y SLA visible al cliente.", "Arranca en paralelo la clasificación automática (siguiente flujo)."],
        int: ["Correo"],
        state: "Radicado", wbs: ["B4", "T8", "T5"]
      },
      {
        id: "r8", title: "Seguimiento en línea del caso", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Mis casos › PQR-2026-0187", title: "PQR-2026-0187 · Cobro no reconocido",
          body: `<div class="state-now">Estado: ${U.tag("En gestión · Facturación", "info")} · Día 2 de 5</div>${U.sla(40)}` +
            U.timeline([
              { t: "Radicado", d: "14/09 11:05" },
              { t: "Clasificado y asignado a Facturación", d: "14/09 11:06 · automático" },
              { t: "Facturación solicitó información", d: "16/09 · 'Confirme la hora de ingreso del contenedor' · respondido 16/09", s: "" },
              { t: "En análisis", d: "Facturación · responsable: Carolina P.", s: "now" },
              { t: "Respuesta oficial", d: "Pendiente", s: "pending" }
            ]) +
            `<b class="small">Casos anteriores</b>${U.tbl(["Radicado", "Tipo", "Estado", "Cierre"], [["PQR-2026-0142", "Reclamo · Facturación", U.tag("Cerrado", "ok"), "10/09/2026 · nota crédito emitida"]])}`
        }),
        system: ["El cliente ve etapa, responsable, tiempo restante y solicitudes de información; responde desde el mismo caso.", "Menos llamadas y correos preguntando '¿en qué va mi caso?': objetivo explícito de SPB."],
        state: "En gestión", wbs: ["B4", "B7"]
      }
    ]
  });

  /* ============ FLUJO 8: Gestión interna de PQRS ============ */
  F.push({
    id: "pqr-gestion", group: "Gestión de PQRS", title: "Gestión interna: clasificación, áreas, SLA y respuesta",
    actor: "SAC y áreas responsables", actors: ["IA de clasificación", "SAC", "Área (Facturación)", "Dirección SAC"],
    summary: "Del radicado a la respuesta firmada: la IA tipifica y enruta, SAC valida cuando hace falta, el área gestiona con trazabilidad, el SLA escala solo, y la respuesta se redacta con apoyo de IA y se firma por la Dirección de Servicio al Cliente.",
    steps: [
      {
        id: "g1", title: "Clasificación y enrutamiento automático", who: "IA",
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Sistema", crumbs: "PQR-2026-0187 › Clasificación automática", title: "Resultado de la tipificación",
          body: U.tbl(["Dimensión", "Valor propuesto", "Confianza"], [["Tipo", "Reclamo (confirmado por el cliente)", "—"], ["Categoría / subcategoría", "Facturas SPB / Cobro no reconocido", U.tag("96%", "ok")], ["Servicio", "Almacenamiento de contenedores", U.tag("93%", "ok")], ["Área responsable", "Facturación", U.tag("95%", "ok")], ["Criticidad / prioridad", "Media · cliente con 2 casos en 30 días", U.tag("regla", "gray")], ["SLA", "5 días hábiles al cliente (reclamo · facturas SPB) · área: 2 días desde la asignación", U.tag("matriz", "gray")]]) +
            U.alert("ok", "Confianza alta: se asigna directamente a <b>Facturación</b> sin pasar por SAC. Regla: los tiquetes de báscula van a Operaciones; lo que no se puede clasificar va a SAC.")
        }),
        ia: ["Análisis del texto, los adjuntos y el histórico del cliente para proponer categoría, subcategoría, servicio, área, criticidad y prioridad.", "Reglas de negocio + modelo; umbral de confianza configurable para enrutar directo o enviar a SAC."],
        system: ["Se calculan la fecha límite al cliente (desde la radicación) y la del área (desde la asignación), según la matriz de SPB, y se arman las alertas de SLA."],
        state: "Clasificado · Asignado a Facturación", wbs: ["B5", "T4"],
        choices: [{ t: "Confianza alta → va directo al área", to: "g3", cls: "ok" }, { t: "Confianza baja → SAC valida", to: "g2" }]
      },
      {
        id: "g2", title: "Validación por Servicio al Cliente (rama)", who: "Analista SAC", branch: true,
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Jesús · SAC", title: "Bandeja PQRS · Por validar",
          body: U.kpis([{ v: "7", l: "Por validar (IA insegura)" }, { v: "54", l: "En áreas" }, { v: "11", l: "Pendientes del cliente" }, { v: "3", l: "Escalados" }]) +
            U.tbl(["Radicado", "Cliente", "Texto (resumen IA)", "Propuesta IA", "Conf.", "Acción"], [["PQR-2026-0190", "Rosa Valencia (no reg.)", "Ruido de camiones en la noche frente a su casa", "Comunidad · Seguridad Física", U.tag("58%", "warn"), "Validar ▾"], ["PQR-2026-0191", "Cargo Express", "Solicita certificación de operaciones 2025 y reclama demora en atención", "Petición · SAC / Comercial", U.tag("61%", "warn"), "Validar ▾"]], 0) +
            U.btns([{ t: "Confirmar clasificación", cls: "ok" }, { t: "Reclasificar", cls: "sec" }, { t: "Solicitar información", cls: "warn" }, { t: "Rechazar (no procede)", cls: "bad" }])
        }),
        system: ["SAC solo toca lo que la IA no resolvió con confianza: validar, reclasificar, reasignar, pedir información o rechazar, todo con trazabilidad.", "Cada corrección alimenta el ciclo de mejora del clasificador (mejora continua del flujograma)."],
        state: "En validación SAC", wbs: ["B6"],
        choices: [{ t: "Clasificación confirmada → al área", to: "g3", cls: "ok" }]
      },
      {
        id: "g3", title: "Gestión del caso por el área", who: "Gestor del área (Facturación)",
        screen: U.shell({ menu: "area", active: "Bandeja PQRS", user: "Carolina P. · Facturación", crumbs: "Bandeja PQRS › PQR-2026-0187", title: "PQR-2026-0187 · Cobro no reconocido · Naviera Sur",
          body: `<div class="state-now">${U.tag("En gestión", "info")} · SLA del área: día 1 de 2 · al cliente: día 2 de 5</div>${U.sla(40)}
            <div class="diff"><div class="card"><h5>Resumen del caso (IA)</h5><p class="small">El cliente reclama 3 días de almacenamiento en FV-2026-118203 para el contenedor MSCU 482 001-7; el tiquete de salida adjunto indica ingreso y salida el 28/08. Caso relacionado PQR-2026-0142 cerrado con nota crédito.</p></div>
            <div class="card"><h5>Actuaciones</h5>${U.timeline([{ t: "Consulta en N4: ingreso 28/08 09:10 · salida 28/08 16:42", d: "16/09 · Carolina P." }, { t: "Información solicitada al cliente (hora de ingreso)", d: "16/09 · SLA suspendido 6 h" }, { t: "Concepto: procede nota crédito por 3 días", d: "17/09 · Carolina P.", s: "now" }])}</div></div>
            ${U.btns([{ t: "Registrar actuación" }, { t: "Solicitar información al cliente", cls: "warn" }, { t: "Traspasar a otra área", cls: "sec" }, { t: "Comentario interno", cls: "ghost" }, { t: "Proyectar respuesta", cls: "ok" }])}`
        }),
        system: ["Bandeja por área con actuaciones, adjuntos y evidencias; traspaso entre áreas con historial; comentarios internos que el cliente no ve.", "'Pendiente información del cliente' suspende el SLA.", "Seguros gestiona sus casos directamente con el cliente dentro del mismo caso (decisión de la reunión)."],
        state: "En gestión por el área", wbs: ["B7", "B8", "T5"]
      },
      {
        id: "g4", title: "Control de SLA y escalamiento", who: "Sistema → Jefes de área / SAC",
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Jesús · SAC", title: "Semáforo de SLA · casos abiertos",
          body: U.tbl(["Radicado", "Área", "Tipo", "Avance SLA", "Estado"], [["PQR-2026-0187", "Facturación", "Reclamo", U.sla(38), U.tag("En tiempo", "ok")], ["PQR-2026-0171", "Operaciones", "Queja", U.sla(84), U.tag("Alerta 80% · aviso al gestor", "warn")], ["PQR-2026-0163", "Seguros", "Reclamo", U.sla(92), U.tag("Alerta 90% · aviso al jefe", "warn")], ["PQR-2026-0150", "Comercial", "Petición", U.sla(100), U.tag("Escalado a la Dirección", "bad")]]) +
            U.alert("info", "Reglas: 80% alerta al gestor · 90% alerta al jefe de área y SAC · 100% escalamiento automático y registro en el tablero de gerencia. Suspensión mientras el caso esté 'pendiente del cliente'.")
        }),
        system: ["Dos relojes por caso según la matriz de SPB: al cliente (5, 10, 15 o 45 días hábiles desde la radicación) y del área (2, 7 o 15 días desde la asignación); alertas y escalamientos por correo y en bandeja.", "Escalamiento también por cantidad de traspasos entre áreas (regla del flujograma)."],
        state: "—", wbs: ["B8", "T10"]
      },
      {
        id: "g5", title: "Respuesta oficial con apoyo de IA y firma", who: "Gestor → SAC → Dirección SAC",
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Jesús · SAC", crumbs: "PQR-2026-0187 › Respuesta", title: "Proyecto de respuesta oficial",
          body: `<div class="diff"><div class="card"><h5>Insumos</h5><p class="small">Concepto de Facturación: procede nota crédito NC-2026-0899 por $1.245.300. Evidencia N4 de ingreso/salida 28/08.</p></div>
            <div class="card" style="border-color:var(--ia)"><h5>Borrador generado (editable)</h5><p class="small">Señores NAVIERA SUR S.A.<br>Ref.: Radicado PQR-2026-0187<br><br>En atención a su reclamo relacionado con la factura FV-2026-118203, le informamos que, verificados los registros del terminal, el contenedor MSCU 482 001-7 ingresó y salió el 28 de agosto de 2026, por lo que no procede el cobro de almacenamiento. En consecuencia, se emitió la nota crédito NC-2026-0899…<br><br>Cordialmente,<br>Dirección de Servicio al Cliente</p></div></div>
            ${U.tbl(["Paso", "Responsable", "Estado"], [["Borrador IA", "Sistema", U.tag("Generado", "ia")], ["Edición y revisión", "SAC", U.tag("En curso", "info")], ["Firma electrónica", "Dirección de Servicio al Cliente", U.tag("Pendiente", "gray")], ["Envío correo + portal y cierre", "Sistema", U.tag("Pendiente", "gray")]])}
            ${U.btns([{ t: "Enviar a firma", cls: "ok" }, { t: "Devolver al área", cls: "sec" }])}`
        }),
        ia: ["Borrador personalizado con tono institucional a partir del concepto del área, el histórico y la plantilla de respuesta por categoría."],
        system: ["Documento con formato institucional, firmado electrónicamente por la Dirección de Servicio al Cliente (siempre sale de SAC, según la reunión).", "Envío por correo y portal; el caso pasa a 'Respondido' y luego 'Cerrado' tras la encuesta."],
        int: ["Firma electrónica", "Correo"],
        state: "Respondido", wbs: ["B9", "T8"]
      },
      {
        id: "g6", title: "Encuesta obligatoria y cierre", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "PQRS", user: "Naviera Sur S.A.", crumbs: "PQRS › Mis casos › PQR-2026-0187", title: "Tu caso tiene respuesta",
          body: U.modal("Antes de ver la respuesta, califica la atención", `<p class="small">¿Qué tan satisfecho estás con la respuesta? <span class="star">★★★★★</span></p><p class="small">¿El tiempo fue adecuado? <span class="star">★★★★☆</span></p><p class="small">¿Fue fácil radicar y hacer seguimiento? <span class="star">★★★★★</span></p>${U.fld("Comentarios (opcional)", "", "ph")}<p class="small">Esta encuesta es obligatoria. Al enviarla verás el documento de respuesta.</p>${U.btns([{ t: "Enviar y ver respuesta" }])}`)
        }),
        system: ["Encuesta NPS/CSAT obligatoria al cierre: calidad de la respuesta, tiempo, facilidad.", "SPB no respondió la pregunta #15: se asume bloqueo hasta responder, también para no registrados; alternativa: recordatorios insistentes.", "Resultados en el tablero de satisfacción por área y categoría."],
        state: "Cerrado", wbs: ["B10", "T9"]
      },
      {
        id: "g7", title: "Tableros e indicadores", who: "SAC · Gerencia",
        screen: U.shell({ menu: "sac", active: "Tableros", user: "Liliana · Dirección SAC", title: "Tablero PQRS · Septiembre 2026",
          body: U.kpis([{ v: "212", l: "Radicadas en el mes" }, { v: "91%", l: "Cumplimiento SLA" }, { v: "6,4 d", l: "Tiempo promedio de respuesta" }, { v: "72", l: "NPS" }]) +
            U.tbl(["Categoría", "Casos", "% del total", "Tiempo prom.", "SLA", "Tendencia"], [["Reclamo · Facturas SPB", "84", "40%", "3,1 d", "88%", "▲ +12%"], ["Queja · Proceso operativo", "51", "24%", "4,2 d", "94%", "▼ -4%"], ["Seguridad · accesos", "33", "16%", "4,8 d", "97%", "="], ["Comunidad", "19", "9%", "8,9 d", "79%", "▲ +30%"]]) +
            U.alert("info", "Causa raíz más frecuente (IA): cobros de almacenamiento cuando el contenedor sale el mismo día. Sugerencia: revisar la regla de facturación en Billing.") +
            U.btns([{ t: "Exportar PDF", cls: "sec" }, { t: "Exportar Excel", cls: "sec" }, { t: "Programar informe", cls: "ghost" }])
        }),
        system: ["Volumen por tipo/canal/área, tiempos por etapa, cumplimiento de SLA, top categorías y causas raíz, tendencias; informes ejecutivos programados.", "SPB no tiene lista cerrada de tableros (respuesta #12: analítica para toma de decisiones y reportes según módulos y data); la estimación cubre ~12 indicadores y 6 informes por producto."],
        state: "—", wbs: ["B11", "T10"],
        q: ["#12 (respondida el 23 sep 2026): sin lista cerrada; se mantiene el supuesto de 12 indicadores y 6 informes por producto y se cierra en la Fase 0."]
      }
    ]
  });

  /* ============ FLUJO 9: Canales adicionales ============ */
  F.push({
    id: "pqr-canales", group: "Gestión de PQRS", title: "Canales adicionales: agente interno (correo y WhatsApp opcionales)",
    actor: "Agente SAC y buzón de correo", actors: ["Agente SAC", "Buzón de correo", "IA"],
    summary: "No todo entra por el portal: el agente radica en nombre de quien llama o llega a la oficina. SPB decidió (23 sep 2026) arrancar solo con portal web y agente interno; el buzón de correo y WhatsApp quedan como opcional O1.",
    steps: [
      {
        id: "k1", title: "Radicación por agente interno", who: "Agente SAC (teléfono / presencial)",
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Jesús · SAC", crumbs: "Bandeja PQRS › Radicar en nombre de", title: "Radicar PQRS en nombre de un usuario",
          body: `<div class="frm">${U.fld("Canal", "Línea telefónica ▾")}${U.fld("Buscar cliente", "NIT o cédula · 'Cargo Express' " + U.tag("Registrado", "ok"))}${U.fld("Persona que llama", "Andrés Ortiz · coordinador logístico")}${U.fld("Tipo", "Petición ▾")}</div>
            <div class="frm one">${U.fld("Descripción (el asistente la ordena)", "Solicita activar un usuario adicional del Portal de Negocios para el coordinador de exportaciones…")}</div>
            ${U.alert("ia", "Clasificación sugerida: Petición · Gestión de usuarios · 5 días hábiles al cliente · 2 días el área. Sin duplicados.")}
            ${U.btns([{ t: "Radicar y enviar confirmación al cliente" }])}`
        }),
        system: ["Mismo flujo y mismas reglas; el canal queda registrado para los indicadores.", "El cliente recibe la confirmación y el código como si lo hubiera hecho él."],
        state: "Radicado", wbs: ["B12"]
      },
      {
        id: "k2", title: "Buzón de correo monitoreado (opcional O1, fuera de la primera versión)", who: "Sistema + SAC",
        screen: U.shell({ menu: "sac", active: "Bandeja PQRS", user: "Jesús · SAC", title: "Correos recibidos en pqrs@sprbun.com · pendientes de confirmar",
          body: U.tbl(["Recibido", "Remitente", "Asunto", "Propuesta IA", "Acción"], [["14/09 08:12", "gerencia@cargoexpress.co", "Reclamo demora en entrega contenedor", "Reclamo · Operaciones · cliente registrado (NIT coincide)", U.tag("Crear caso", "ok")], ["14/09 09:40", "vecino.bv@hotmail.com", "Polvo en la vía de acceso", "Queja · Comunidad · no registrado", U.tag("Crear caso", "ok")], ["14/09 10:02", "promo@ofertas.biz", "¡Gana un crucero!", "Spam", U.tag("Descartar", "bad")]]) +
            U.alert("info", "El buzón crea el caso automáticamente cuando la confianza es alta y responde al remitente con el radicado; si no, queda aquí para que SAC lo confirme. Hoy parte de las PQRS llega por correo y se gestiona por fuera del sistema. SPB decidió (23 sep 2026) dejarlo para una fase posterior.")
        }),
        ia: ["Lectura del correo y adjuntos, identificación del remitente contra la base de clientes, clasificación y detección de spam."],
        system: ["Respuesta automática con radicado y código; hilo del correo enlazado al caso.", "Correo y WhatsApp Business API forman el opcional O1 (220 h); la primera versión arranca con portal web y agente interno (respuesta #13 de SPB)."],
        int: ["Buzón de correo (IMAP/Graph) de SPB"],
        state: "Radicado", wbs: ["O1"]
      }
    ]
  });
})(window);
