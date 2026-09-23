/* Flujos del producto 1: Registro inteligente de clientes, usuarios y terceros */
(function (w) {
  const U = w.UI;
  const F = w.FLOWS = w.FLOWS || [];
  const M = U.MODALIDADES;

  /* ============ FLUJO 1: Registro por primera vez ============ */
  F.push({
    id: "reg-primera-vez", group: "Registro de clientes", title: "Registro de cliente por primera vez",
    actor: "Cliente externo (ej. una agencia de aduanas)", actors: ["Cliente", "IA documental", "SAC"],
    summary: "El camino completo de un cliente nuevo: entra por el Portal Integral, acepta la política de datos, identifica su NIT contra RUES, el motor de reglas le dice qué documentos necesita, la IA clasifica y extrae, se valida cruzado con RUES y OFAC y queda radicado para aprobación.",
    steps: [
      {
        id: "s1", title: "Entrada por el Portal Integral", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Inicio", user: "Aduanas del Pacífico S.A.S.", title: "Bienvenido, Aduanas del Pacífico",
          body: U.kpis([{ v: "0", l: "Trámites en curso" }, { v: "0", l: "Modalidades aprobadas" }, { v: "0", l: "PQRS abiertas" }]) +
            `<div class="card soft"><b>Aún no tienes un registro activo con SPB.</b><p class="small">Para operar en el terminal debes registrarte en al menos una modalidad. El proceso es guiado y la mayoría de los datos se leen automáticamente de tus documentos.</p>${U.btns([{ t: "Iniciar registro" }, { t: "Ver requisitos por modalidad", cls: "sec" }])}</div>
            <div class="card"><b>Novedades</b><p class="small">La actualización anual de documentos abre en abril. Te avisaremos con 30 días de anticipación.</p></div>`
        }),
        system: ["El usuario ya está autenticado en el Portal Integral (usuarios y contraseñas en su base de datos, sin proveedor de identidad); el nuevo portal comparte esa sesión y no vuelve a pedir credenciales.", "Misma barra lateral, barra superior y colores del Portal Integral: para el cliente es un solo portal.", "El portal consulta si el NIT tiene expediente previo para personalizar el inicio."],
        data: ["Identidad del usuario y NIT asociado (base de datos del Portal Integral)"],
        state: "Sin trámite", wbs: ["T2", "T3", "A16"],
        q: ["#1 y #2 (respondidas el 23 sep 2026): stack .NET / Angular / SQL Server / IIS; no hay proveedor de identidad, se integra con la autenticación por base de datos; Keycloak como opcional O3."]
      },
      {
        id: "s2", title: "Autorización de tratamiento de datos", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.",
          body: U.modal("Autorización de tratamiento de datos personales",
            `<div class="card soft small" style="max-height:110px;overflow:auto">Sociedad Portuaria Regional de Buenaventura S.A. informa que los datos suministrados serán tratados conforme a la Ley 1581 de 2012 y su política de tratamiento de datos, con la finalidad de gestionar el registro, la operación portuaria, la seguridad y el cumplimiento normativo...</div>
             <p class="small">☑ He leído y acepto la política de tratamiento de datos personales.</p>
             ${U.btns([{ t: "Aceptar y continuar" }, { t: "No acepto", cls: "ghost" }])}`)
        }),
        system: ["Se registra evidencia electrónica: usuario, NIT, fecha, hora, versión de la política aceptada y dirección IP.", "Sin aceptación no se puede continuar; la evidencia queda en el expediente y es auditable.", "La misma pieza se reutiliza en PQRS, PICAT y usuarios."],
        state: "Sin trámite", wbs: ["T11"]
      },
      {
        id: "s3", title: "Identificación de la solicitud", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 1 de 5", title: "¿Qué trámite vas a realizar?",
          body: `<div class="frm">${U.fld("Tipo de solicitud", "Registro por primera vez ▾")}${U.fld("NIT de la empresa", "900.123.456-7")}</div>
            <label class="small">Modalidades (puedes elegir una o varias)</label>${U.chips(M, ["Agencia de aduanas", "Empresa de transporte"])}
            ${U.alert("info", "Cada modalidad tiene su propio flujo de aprobación y sus propios documentos. El sistema los consolidará para que no cargues nada dos veces.")}
            ${U.btns([{ t: "Validar NIT en RUES" }, { t: "Guardar y salir", cls: "ghost" }])}`
        }),
        system: ["Tipos de solicitud: primera vez, actualización, adición de modalidad, cambio de modalidad.", "Se consulta el historial del cliente en el expediente para saber qué ya tiene vigente.", "El botón dispara la consulta al servicio RUES que SPB ya tiene contratado (usuario y contraseña)."],
        int: ["RUES (servicio existente de SPB): estado de la matrícula, razón social, representante legal, actividad económica."],
        data: ["Tipo de trámite, modalidades seleccionadas, NIT"],
        state: "Borrador", wbs: ["A1", "T4"],
        q: ["#6 (respondida el 23 sep 2026): RUES devuelve representante legal, estado de matrícula y actividad; límite 50 peticiones/min e IP autorizadas, por eso A1 incluye cola y caché."],
        choices: [{ t: "El NIT existe en RUES ✔", to: "s4", cls: "ok" }, { t: "El NIT no existe en RUES ✖", to: "s3b", cls: "bad" }]
      },
      {
        id: "s3b", title: "NIT no encontrado (rama)", who: "Cliente", branch: true,
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 1 de 5", title: "¿Qué trámite vas a realizar?",
          body: `<div class="frm">${U.fld("Tipo de solicitud", "Registro por primera vez ▾")}${U.fld("NIT de la empresa", "900.123.465-7", "err")}</div>
            ${U.alert("bad", "<b>No encontramos este NIT en el RUES.</b> Verifica el número. Si tu empresa no está obligada a matrícula mercantil (entidad pública, persona natural, extranjera), selecciona la excepción y adjunta el RUT o documento equivalente.")}
            ${U.btns([{ t: "Corregir NIT", cls: "sec" }, { t: "Declarar excepción (RUT / DIAN)", cls: "warn" }])}`
        }),
        system: ["El flujograma de SPB dice 'no permite continuar'; en la reunión se pidió manejar excepciones (empresas que no están en RUES y se validan con DIAN).", "Con excepción, el trámite se marca para revisión manual reforzada por SAC y se exige el RUT."],
        int: ["RUES, y como alternativa el servicio DIAN que SPB ya usa."],
        state: "Borrador", wbs: ["A1"],
        choices: [{ t: "Corregir y volver a validar", to: "s3", cls: "ok" }, { t: "Continuar con excepción", to: "s4" }]
      },
      {
        id: "s4", title: "Requisitos determinados por el motor de reglas", who: "Sistema → Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 2 de 5", title: "Esto es lo que necesitas cargar",
          body: `${U.alert("ok", "<b>RUES:</b> ADUANAS DEL PACÍFICO S.A.S. · Matrícula activa · Rep. legal: María Fernanda Ruiz · Actividad 5229")}
            <b class="small">Agencia de aduanas</b>
            ${U.doc("Certificado de existencia y representación legal", "Cámara de comercio · vigencia ≤ 30 días", U.tag("Requerido", "warn"))}
            ${U.doc("RUT actualizado", "DIAN", U.tag("Requerido", "warn"))}
            ${U.doc("Resolución DIAN de autorización como agencia de aduanas", "", U.tag("Requerido", "warn"))}
            ${U.doc("Póliza de cumplimiento", "Área de Seguros la revisa", U.tag("Requerido", "warn"))}
            <b class="small">Empresa de transporte</b>
            ${U.doc("Habilitación Ministerio de Transporte", "", U.tag("Requerido", "warn"))}
            ${U.doc("Póliza de responsabilidad civil", "", U.tag("Requerido", "warn"))}
            ${U.doc("Certificado de existencia y representación legal", "Compartido con la otra modalidad", U.tag("Ya en lista", "ok"))}
            <b class="small">Comunes</b>
            ${U.doc("Formato de vinculación SARLAFT", "Cumplimiento", U.tag("Requerido", "warn"))}
            ${U.btns([{ t: "Continuar a carga de documentos" }])}`
        }),
        system: ["El motor de reglas cruza modalidad × tipo de trámite × historial del cliente y arma la lista: requeridos, ya vigentes y pendientes.", "Los documentos compartidos entre modalidades se piden una sola vez.", "La matriz la administra SPB desde el portal (no es código)."],
        data: ["Matriz de documentos por modalidad y trámite (la entrega SPB en la fase de inception)"],
        state: "Borrador", wbs: ["A2", "T4"]
      },
      {
        id: "s5", title: "Carga documental con IA", who: "Cliente + IA",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 3 de 5", title: "Carga tus documentos",
          body: `<div class="drop">Arrastra aquí tus archivos (PDF, JPG, PNG) o haz clic para buscarlos. No importa el orden: el sistema reconoce cada documento.</div>
            ${U.doc("camara_comercio_2026.pdf", "Reconocido como <b>Certificado de existencia y representación</b> · confianza 98% · expedido 02/09/2026", U.tag("Clasificado", "ia"))}
            ${U.doc("rut.pdf", "Reconocido como <b>RUT</b> · confianza 99%", U.tag("Clasificado", "ia"))}
            ${U.doc("scan_0031.jpg", "Reconocido como <b>Póliza de cumplimiento</b> · confianza 71% · imagen borrosa", U.tag("Confirmar tipo", "warn"), "JPG")}
            ${U.doc("resolucion_dian.pdf", "Procesando… OCR y clasificación", U.tag("Procesando", "gray"))}
            ${U.alert("ia", "<b>Extraído de la cámara de comercio:</b> razón social, NIT, representante legal, fecha de expedición, objeto social, domicilio. Revisarás estos datos en el siguiente paso.")}
            ${U.btns([{ t: "Continuar" }, { t: "Guardar parcial", cls: "ghost" }])}`
        }),
        ia: ["Pipeline: OCR → clasificación del tipo de documento → extracción estructurada (razón social, NIT, representante legal, vigencias, pólizas, valores asegurados).", "Cada resultado guarda evidencia (página, recorte, confianza) para que el revisor la vea.", "Confianza baja = el usuario confirma el tipo; nunca se bloquea el trámite por la IA.", "Se procesa en cola con reintentos; el usuario puede seguir cargando mientras tanto."],
        system: ["Guardado parcial: el cliente puede salir y retomar el borrador.", "Los archivos entran al gestor documental con metadatos y versión."],
        state: "Borrador", wbs: ["A3", "T7", "T6"],
        q: ["#9 (respondida el 23 sep 2026): SPB acepta IA en nube; se presenta comparativo de costos frente a GPU local.", "#10: muestra de documentos reales para calibrar la extracción (SPB aún no la envía)."]
      },
      {
        id: "s6", title: "Formulario prellenado", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 4 de 5", title: "Confirma los datos de tu empresa",
          body: `<p class="small">Los campos marcados en morado se leyeron de tus documentos. Corrige lo que haga falta.</p>
            <div class="frm">${U.fld("Razón social", "ADUANAS DEL PACÍFICO S.A.S. " + U.tag("Cámara de comercio", "ia"), "ia")}${U.fld("NIT", "900.123.456-7 " + U.tag("RUT", "ia"), "ia")}
            ${U.fld("Representante legal", "María Fernanda Ruiz " + U.tag("Cámara de comercio", "ia"), "ia")}${U.fld("Cédula rep. legal", "31.456.789 " + U.tag("Cámara de comercio", "ia"), "ia")}
            ${U.fld("Dirección", "Cra 3 # 4-20, Buenaventura", "ia")}${U.fld("Correo operativo", "operaciones@aduanaspacifico.co")}
            ${U.fld("Teléfono", "+57 602 241 0000")}${U.fld("Póliza de cumplimiento · vigencia", "01/03/2026 – 28/02/2027 " + U.tag("Póliza", "ia"), "ia")}</div>
            <b class="small">Datos específicos · Empresa de transporte</b>
            <div class="frm">${U.fld("Nº habilitación MinTransporte", "", "ph")}${U.fld("Vehículos propios", "Sí (se registran en el módulo de transporte)")}</div>
            ${U.btns([{ t: "Continuar a validación" }, { t: "Guardar parcial", cls: "ghost" }])}`
        }),
        system: ["Formulario dinámico por modalidad: los campos específicos aparecen según lo elegido.", "Cada valor guarda su origen (documento y página) o si lo escribió el usuario.", "Validación de formato de correos: sintaxis, dominio existente y errores típicos (gmial.com)."],
        data: ["Datos maestros del cliente por modalidad"],
        state: "Borrador", wbs: ["A3", "T3"]
      },
      {
        id: "s7", title: "Validación cruzada y lista OFAC", who: "IA → Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Aduanas del Pacífico S.A.S.", crumbs: "Registro › Nueva solicitud › Paso 5 de 5", title: "Resultado de la validación",
          body: U.tbl(["Dato", "Documento", "RUES", "Formulario", "Resultado"], [
            ["Razón social", "ADUANAS DEL PACÍFICO S.A.S.", "ADUANAS DEL PACÍFICO S.A.S.", "ADUANAS DEL PACÍFICO S.A.S.", U.tag("Coincide", "ok")],
            ["NIT", "900.123.456-7", "900.123.456-7", "900.123.456-7", U.tag("Coincide", "ok")],
            ["Representante legal", "María Fernanda Ruiz", "María F. Ruiz Castro", "María Fernanda Ruiz", U.tag("Coincide (98%)", "ok")],
            ["Vigencia cámara de comercio", "02/09/2026", "—", "—", U.tag("12 días · OK", "ok")],
            ["Póliza de cumplimiento", "Vence 28/02/2027", "—", "—", U.tag("Vence < 6 meses", "warn")],
            ["Resolución DIAN", "Nº 000123 de 2019", "—", "—", U.tag("Legible", "ok")],
            ["Lista OFAC / SARLAFT", "—", "—", "—", U.tag("Sin coincidencias", "ok")]
          ]) +
            U.alert("warn", "<b>1 observación:</b> la póliza de cumplimiento vence antes de 6 meses. Puedes cargar una póliza renovada o continuar; SAC y Seguros lo revisarán.") +
            U.btns([{ t: "Corregir y cargar de nuevo", cls: "sec" }, { t: "Continuar con observaciones", cls: "warn" }])
        }),
        ia: ["Comparación semántica campo a campo entre documentos, RUES y formulario; tolerante a abreviaturas y tildes.", "Genera observaciones automáticas legibles para el cliente y para SAC."],
        int: ["OFAC/SARLAFT: consulta manual del analista de Cumplimiento (sin API, SPB 23 sep 2026); la evidencia (fecha, resultado, captura) queda en el expediente."],
        system: ["Principio acordado en la reunión: el usuario siempre puede radicar con novedades; el sistema no bloquea."],
        state: "Borrador", wbs: ["A4"],
        q: ["#4 (respondida el 23 sep 2026): no hay API, la consulta es manual; SPB debe definir cómo sistematizarla."],
        choices: [{ t: "Corregir (vuelve a carga)", to: "s5", cls: "ok" }, { t: "Continuar con observaciones", to: "s8" }]
      },
      {
        id: "s8", title: "Radicación y confirmación", who: "Sistema → Cliente",
        screen: U.shell({ menu: "cliente", active: "Mis trámites", user: "Aduanas del Pacífico S.A.S.", title: "Solicitud radicada",
          body: `${U.alert("ok", "<b>Radicado REG-2026-004512</b> · 14/09/2026 10:32 · Registro por primera vez · Agencia de aduanas, Empresa de transporte")}
            <div class="card"><b>¿Qué sigue?</b><ol class="small"><li>Servicio al Cliente valida el expediente (SLA interno: 2 días hábiles).</li><li>Seguros revisa las pólizas y SESAMA los requisitos de la modalidad.</li><li>Cumplimiento verifica el resultado OFAC.</li><li>Recibirás el oficio de registro firmado y tus accesos al Portal de Negocios.</li></ol></div>
            <p class="small">Te enviamos la confirmación a operaciones@aduanaspacifico.co. Puedes seguir el estado en <b>Mis trámites</b>.</p>
            ${U.btns([{ t: "Ir a Mis trámites" }, { t: "Descargar comprobante", cls: "sec" }])}`
        }),
        system: ["Numeración consecutiva de radicados.", "Se crea el expediente digital con documentos, evidencias de IA, aceptación de datos, resultado OFAC y observaciones.", "Correo de confirmación con plantilla institucional.", "El workflow enruta según las modalidades: crea las tareas para SAC y en paralelo para Seguros, SESAMA y Cumplimiento."],
        int: ["Correo (SMTP de SPB)"],
        state: "Radicado · En validación SAC", wbs: ["T5", "T8", "T6", "A11"]
      },
      {
        id: "s9", title: "Seguimiento en línea", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Mis trámites", user: "Aduanas del Pacífico S.A.S.", crumbs: "Mis trámites › REG-2026-004512", title: "REG-2026-004512 · Registro por primera vez",
          body: `<div class="state-now">Estado actual: ${U.tag("En revisión de Seguros", "info")} · Responsable: Área de Seguros · Día 3 de 8</div>` +
            U.timeline([
              { t: "Radicado", d: "14/09/2026 10:32 · Cliente", s: "" },
              { t: "Validado por Servicio al Cliente", d: "15/09/2026 09:10 · SAC · 'Expediente completo, observación de póliza enviada a Seguros'", s: "" },
              { t: "Revisión de pólizas", d: "En curso · Área de Seguros", s: "now" },
              { t: "Revisión SESAMA (requisitos empresa de transporte)", d: "En curso · en paralelo", s: "now" },
              { t: "Verificación Cumplimiento (OFAC)", d: "Pendiente", s: "pending" },
              { t: "Aprobación final y creación en sistemas", d: "Pendiente", s: "pending" }
            ]) +
            `<b class="small">Documentos del expediente</b>${U.doc("Certificado de existencia y representación", "Vigente hasta 02/10/2026", U.tag("Aceptado", "ok"))}${U.doc("Póliza de cumplimiento", "Observación: vence 28/02/2027", U.tag("En revisión", "warn"))}`
        }),
        system: ["El cliente ve estado, responsable actual, observaciones e historial de aprobaciones en tiempo real: esto es lo que hoy genera llamadas y correos.", "Si un área pide información adicional, aparece aquí y llega correo; el trámite pasa a 'Pendiente del cliente'."],
        state: "En revisión por áreas", wbs: ["A16", "T5"],
        next: "s10"
      },
      {
        id: "s10", title: "Aprobación, oficio y encuesta", who: "Sistema → Cliente",
        screen: U.shell({ menu: "cliente", active: "Mis trámites", user: "Aduanas del Pacífico S.A.S.", crumbs: "Mis trámites › REG-2026-004512", title: "¡Registro aprobado!",
          body: `${U.alert("ok", "<b>Tu empresa quedó registrada</b> en las modalidades Agencia de aduanas y Empresa de transporte. Ya puedes operar en el Portal de Negocios.")}
            ${U.doc("Oficio de registro Nº SAC-2026-1187", "Firmado electrónicamente por la Dirección de Servicio al Cliente", U.tag("Descargar", "info"))}
            ${U.doc("Acta de usuarios del Portal de Negocios", "2 usuarios creados · contraseñas temporales enviadas", U.tag("Descargar", "info"))}
            ${U.modal("Antes de continuar, cuéntanos cómo te fue", `<p class="small">¿Qué tan probable es que recomiendes el proceso de registro de SPB? <span class="star">★★★★★</span></p><p class="small">¿Qué fue lo más difícil?</p>${U.fld("", "Escribe aquí…", "ph")}<p class="small">La encuesta es obligatoria (instrucción de la Gerencia General). Podrás ver tus documentos al enviarla.</p>${U.btns([{ t: "Enviar encuesta" }])}`)}`
        }),
        system: ["Al aprobar, el orquestador de integraciones crea el cliente en SAP, N4, Billing y Portal Integral (ver flujo 'Aprobaciones internas e integraciones').", "Se generan y firman los documentos de salida a partir de plantillas institucionales.", "Encuesta NPS obligatoria: la pantalla se bloquea hasta responder (decisión de SPB pendiente de confirmar el mecanismo exacto)."],
        int: ["Firma electrónica (SPB no tiene proveedor; propuesta Certicámara o GSE)", "Portal Integral: creación de usuarios (servicio que SPB debe habilitar)"],
        state: "Aprobado · Cliente activo", wbs: ["A11", "A12", "T9", "T8", "A10"],
        q: ["#5 (respondida el 23 sep 2026): sin proveedor de firma; hay que proponerlo.", "#15: SPB no respondió; se asume bloqueo hasta responder, también para no registrados."]
      }
    ]
  });

  /* ============ FLUJO 2: Actualización anual ============ */
  F.push({
    id: "reg-actualizacion", group: "Registro de clientes", title: "Actualización anual de documentos (abril)",
    actor: "Cliente ya registrado", actors: ["Cliente", "Sistema de alertas", "SAC"],
    summary: "Cada año los 11.320 clientes actualizan documentos desde abril. El portal avisa antes del vencimiento, pide solo lo que está vencido o por vencer y reutiliza todo lo demás. Es el primer hito que SPB quiere cubrir con el Release 1.",
    steps: [
      {
        id: "a1", title: "Alerta de vencimiento", who: "Sistema → Cliente",
        screen: U.shell({ menu: "cliente", active: "Mis documentos", user: "Transportes del Valle Ltda.", title: "Mis documentos",
          body: `${U.alert("warn", "<b>Tienes 3 documentos por vencer</b> antes de la actualización anual (abril). Actualízalos para no perder tu registro ni tus accesos.")}
            ${U.doc("Certificado de existencia y representación", "Vence 31/03/2027", U.tag("Vence en 18 días", "warn"))}
            ${U.doc("Póliza de responsabilidad civil", "Vence 15/04/2027", U.tag("Vence en 33 días", "warn"))}
            ${U.doc("Habilitación MinTransporte", "Vence 30/04/2027", U.tag("Vence en 48 días", "warn"))}
            ${U.doc("RUT", "Sin vencimiento · versión 2025", U.tag("Vigente", "ok"))}
            ${U.doc("Formato SARLAFT", "Actualizado 10/2026", U.tag("Vigente", "ok"))}
            ${U.btns([{ t: "Iniciar actualización" }])}`
        }),
        system: ["Job diario que revisa vigencias del expediente y dispara alertas al cliente (correo y portal) a 60, 30 y 7 días.", "SAC ve el consolidado de clientes con documentos vencidos o por vencer en su tablero de alertas.", "Detecta también empresas inactivas en RUES y NIT inconsistentes."],
        state: "Cliente activo · Documentos por vencer", wbs: ["A15", "T10"]
      },
      {
        id: "a2", title: "Trámite de actualización prellenado", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Transportes del Valle Ltda.", crumbs: "Registro › Actualización anual", title: "Actualización anual 2027",
          body: `<div class="frm">${U.fld("Tipo de solicitud", "Actualización de documentos")}${U.fld("Modalidades vigentes", "Empresa de transporte · Operador portuario")}</div>
            ${U.alert("ok", "RUES consultado: matrícula renovada 2027 · sin cambios de representante legal.")}
            <b class="small">Solo necesitas cargar esto</b>
            ${U.doc("Certificado de existencia y representación", "Vigencia ≤ 30 días", U.tag("Requerido", "warn"))}
            ${U.doc("Póliza de responsabilidad civil renovada", "", U.tag("Requerido", "warn"))}
            ${U.doc("Habilitación MinTransporte", "", U.tag("Requerido", "warn"))}
            <b class="small">Se reutilizan del expediente</b>
            ${U.doc("RUT", "", U.tag("Vigente", "ok"))}${U.doc("Formato SARLAFT", "", U.tag("Vigente", "ok"))}${U.doc("Tarjetas de propiedad (4 vehículos)", "", U.tag("Vigente", "ok"))}
            ${U.btns([{ t: "Cargar documentos" }])}`
        }),
        system: ["El motor de reglas parte del expediente: pide únicamente lo vencido o por vencer para las modalidades vigentes.", "Se reconsulta RUES para detectar cambios de representante legal o estado de la matrícula."],
        int: ["RUES"],
        state: "Borrador de actualización", wbs: ["A1", "A2", "A5"]
      },
      {
        id: "a3", title: "Carga, validación y radicación", who: "Cliente + IA",
        screen: U.shell({ menu: "cliente", active: "Registro y modalidades", user: "Transportes del Valle Ltda.", crumbs: "Registro › Actualización anual", title: "Validación",
          body: U.tbl(["Documento", "Extraído", "Contra expediente / RUES", "Resultado"], [
            ["Cámara de comercio", "Exp. 20/03/2027 · Rep. legal Jorge Mena", "Rep. legal anterior: Jorge Mena", U.tag("OK", "ok")],
            ["Póliza RC", "Vigencia 15/04/2027 – 14/04/2028 · $800M", "Mínimo exigido $500M", U.tag("OK", "ok")],
            ["Habilitación MinTransporte", "Res. 0456 · vence 30/04/2028", "—", U.tag("OK", "ok")]
          ]) + U.alert("ok", "Sin observaciones. Al radicar, tu registro se mantiene activo mientras SAC valida.") + U.btns([{ t: "Radicar actualización" }])
        }),
        ia: ["Misma extracción y validación cruzada del registro inicial; ahora además compara contra el expediente anterior (cambios de representante legal, valores asegurados)."],
        system: ["Estado 'Actualización en validación' sin suspender la operación del cliente, salvo regla de SPB en contrario.", "Si SAC aprueba, se actualizan vigencias en el expediente y se sincronizan datos que cambiaron hacia SAP / N4 si aplica."],
        state: "Radicado · Actualización en validación", wbs: ["A3", "A4", "A10"],
        q: ["#16 (respondida el 23 sep 2026): 18.984 registros y actualizaciones al año (1.582/mes) y 5.640 PQR al año; costos de IA recalculados con ~480.000 páginas/año."]
      }
    ]
  });

  /* ============ FLUJO 3: Aprobaciones internas e integraciones ============ */
  F.push({
    id: "reg-aprobaciones", group: "Registro de clientes", title: "Aprobaciones internas e integraciones",
    actor: "SAC, Seguros, SESAMA, Seguridad Física, Cumplimiento", actors: ["SAC", "Seguros", "SESAMA", "Cumplimiento", "Orquestador"],
    summary: "Lo que pasa del lado de SPB después de que un cliente radica: bandejas por área, revisión del expediente con la evidencia de la IA, aprobación por modalidad, checklist de sistemas y ejecución automática de las integraciones que hoy se hacen a mano.",
    steps: [
      {
        id: "b1", title: "Bandeja de Servicio al Cliente", who: "Analista SAC (usuario interno · AD/LDAP)",
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Jesús · SAC", title: "Bandeja de registros",
          body: U.kpis([{ v: "23", l: "Por validar" }, { v: "9", l: "En áreas" }, { v: "4", l: "Pendientes del cliente" }, { v: "2", l: "SLA vencido" }]) +
            U.tbl(["Radicado", "Cliente", "Trámite", "Modalidades", "Obs. IA", "SLA", "Estado"], [
              ["REG-2026-004512", "Aduanas del Pacífico", "Primera vez", "Ag. aduanas · Transporte", U.tag("1", "warn"), "1d 4h", U.tag("Por validar", "info")],
              ["REG-2026-004510", "Naviera Sur", "Adición modalidad", "Agente marítimo", U.tag("0", "ok"), "6h", U.tag("Por validar", "info")],
              ["REG-2026-004498", "Logística Andina", "Actualización", "Importador", U.tag("3", "bad"), "vencido", U.tag("Pendiente cliente", "warn")],
              ["REG-2026-004490", "Menajes Buenaventura", "Primera vez", "Menajes", U.tag("0", "ok"), "2d", U.tag("En Seguros", "gray")]
            ], 0)
        }),
        system: ["Usuarios internos entran con su cuenta de dominio (AD/LDAP); el rol determina bandejas y acciones.", "Filtros por modalidad, estado, SLA, responsable; asignación y reasignación entre analistas.", "Semáforo de SLA interno por etapa."],
        state: "Radicado · En validación SAC", wbs: ["T2", "T5"]
      },
      {
        id: "b2", title: "Revisión del expediente (vista 360)", who: "Analista SAC",
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Jesús · SAC", crumbs: "Bandeja › REG-2026-004512", title: "Aduanas del Pacífico S.A.S. · NIT 900.123.456-7",
          body: `<div class="chips"><span class="chip on">Resumen</span><span class="chip">Documentos (6)</span><span class="chip">Formularios</span><span class="chip">Validaciones IA</span><span class="chip">OFAC</span><span class="chip">Historial</span><span class="chip">Comentarios internos (2)</span></div>
            <div class="diff"><div class="card"><h5>Documento · Póliza de cumplimiento</h5><div class="card soft small" style="min-height:70px">[vista previa del PDF con el recorte resaltado por la IA: "Vigencia: 01/03/2026 al 28/02/2027"]</div></div>
            <div class="card"><h5>Lo que leyó la IA</h5><div class="frm one">${U.fld("Aseguradora", "Seguros Bolívar", "ia")}${U.fld("Valor asegurado", "$ 350.000.000", "ia")}${U.fld("Vigencia hasta", "28/02/2027 " + U.tag("< 6 meses", "warn"), "ia")}</div></div></div>
            ${U.alert("warn", "Observación automática: la póliza vence en menos de 6 meses. Regla de la matriz: Seguros decide si acepta con compromiso de renovación.")}
            <b class="small">Checklist de sistemas para esta modalidad</b>${U.chips(["SAP (cliente)", "N4 (agencia)", "Billing", "Portal Integral (usuarios)", "PICAT"], ["SAP (cliente)", "N4 (agencia)", "Billing", "Portal Integral (usuarios)"])}
            ${U.btns([{ t: "Validar y enviar a áreas", cls: "ok" }, { t: "Solicitar información al cliente", cls: "warn" }, { t: "Rechazar", cls: "bad" }, { t: "Reasignar", cls: "ghost" }])}`
        }),
        system: ["Todo lo que la IA leyó tiene evidencia visual; el analista corrige si hace falta y esa corrección alimenta el ciclo de ajuste del modelo.", "El checklist de sistemas viene de la matriz por modalidad: define qué integraciones se ejecutarán al aprobar.", "Cada acción queda en la bitácora: quién, cuándo, qué, comentario."],
        state: "En validación SAC", wbs: ["A5", "T5", "T4", "T6"],
        choices: [{ t: "Validar y enviar a áreas", to: "b3", cls: "ok" }, { t: "Solicitar información al cliente", to: "b2b" }]
      },
      {
        id: "b2b", title: "Solicitud de información al cliente (rama)", who: "SAC → Cliente", branch: true,
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Jesús · SAC", crumbs: "Bandeja › REG-2026-004512 › Solicitar información",
          body: U.modal("Solicitar información adicional", `<div class="frm one">${U.fld("Documentos a solicitar", "☑ Póliza de cumplimiento renovada   ☐ Otro")}${U.fld("Mensaje al cliente", "Por favor cargue la póliza renovada con vigencia mínima de 12 meses. El trámite queda en espera hasta recibirla.")}${U.fld("Plazo", "5 días hábiles")}</div>${U.btns([{ t: "Enviar solicitud" }])}`)
        }),
        system: ["El trámite pasa a 'Pendiente del cliente' y el SLA interno se suspende.", "El cliente recibe correo y ve la solicitud en Mis trámites; al cargar, el trámite vuelve a la bandeja de SAC con los nuevos documentos validados por IA.", "Si el plazo vence sin respuesta, alerta y posible cierre por desistimiento según regla de SPB."],
        state: "Pendiente del cliente", wbs: ["T5", "T8", "A16"],
        choices: [{ t: "El cliente respondió → volver a la bandeja", to: "b2", cls: "ok" }]
      },
      {
        id: "b3", title: "Revisión por áreas según modalidad", who: "Seguros · SESAMA · Cumplimiento",
        screen: U.shell({ menu: "area", active: "Bandeja de aprobaciones", user: "Ana · Área de Seguros", crumbs: "Bandeja › REG-2026-004512", title: "Revisión de pólizas · Aduanas del Pacífico",
          body: `<div class="state-now">Flujo de esta solicitud: ${U.tag("SAC ✔", "ok")} → ${U.tag("Seguros (tú)", "info")} ‖ ${U.tag("SESAMA", "gray")} ‖ ${U.tag("Cumplimiento", "gray")} → ${U.tag("SAC aprobación final", "gray")}</div>
            ${U.doc("Póliza de cumplimiento · Seguros Bolívar", "Valor $350M · vence 28/02/2027 · observación de vigencia", U.tag("Revisar", "warn"))}
            ${U.doc("Póliza RC · Empresa de transporte", "Valor $800M · vence 14/04/2028", U.tag("OK", "ok"))}
            <div class="frm one">${U.fld("Concepto del área", "Se acepta con compromiso de renovación antes del 31/01/2027. Programar alerta.")}</div>
            ${U.btns([{ t: "Aprobar", cls: "ok" }, { t: "Aprobar con condición", cls: "warn" }, { t: "Devolver a SAC", cls: "sec" }, { t: "Rechazar", cls: "bad" }])}
            ${U.tbl(["Modalidad", "Áreas que revisan"], [["Agencia de aduanas", "Seguros · Cumplimiento"], ["Empresa de transporte", "Seguros · SESAMA"], ["Operador portuario", "Seguros · SESAMA · Seguridad Física"], ["Registro de terceros", "Seguridad Física (PICAT)"]])}`
        }),
        system: ["Las áreas revisan en paralelo; el workflow espera a todas antes de pasar a aprobación final.", "La matriz modalidad → áreas es parametrizable por SPB.", "Aprobación con condición genera una alerta futura (ej. renovación de póliza)."],
        state: "En revisión por áreas", wbs: ["A10", "T5", "T4"]
      },
      {
        id: "b4", title: "Aprobación final y checklist de sistemas", who: "Coordinador SAC",
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Liliana · Dirección SAC", crumbs: "Bandeja › REG-2026-004512 › Aprobación final", title: "Aprobación final del registro",
          body: `${U.tbl(["Área", "Resultado", "Fecha", "Concepto"], [["SAC", U.tag("Validado", "ok"), "15/09", "Expediente completo"], ["Seguros", U.tag("Aprobado con condición", "warn"), "17/09", "Renovar póliza antes de 31/01/2027"], ["SESAMA", U.tag("Aprobado", "ok"), "16/09", "Cumple requisitos de transporte"], ["Cumplimiento", U.tag("Sin alertas OFAC", "ok"), "16/09", "Evidencia adjunta"]])}
            <b class="small">Se ejecutará al aprobar</b>${U.chips(["Crear cliente en SAP", "Crear agencia y transportador en N4", "Billing (vía N4)", "Crear 2 usuarios Portal Integral", "Oficio firmado", "Acta de usuarios"], ["Crear cliente en SAP", "Crear agencia y transportador en N4", "Billing (vía N4)", "Crear 2 usuarios Portal Integral", "Oficio firmado", "Acta de usuarios"])}
            ${U.btns([{ t: "Aprobar y ejecutar integraciones", cls: "ok" }, { t: "Devolver", cls: "sec" }])}`
        }),
        system: ["Un solo clic dispara el orquestador; hoy cada sistema se alimenta a mano por distintas personas.", "La aprobación queda firmada por el rol autorizado y registrada en auditoría."],
        state: "Aprobado · Integrando", wbs: ["A10", "T5"]
      },
      {
        id: "b5", title: "Orquestador de integraciones", who: "Sistema (con supervisión de TI/SAC)",
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Liliana · Dirección SAC", crumbs: "REG-2026-004512 › Integraciones", title: "Ejecución de integraciones · REG-2026-004512",
          body: U.tbl(["Sistema", "Operación", "Servicio", "Estado", "Detalle"], [
            ["SAP", "Crear cliente / tercero", "Expuesto por SPB", U.tag("OK", "ok"), "Código SAP 0001234567 · 1,2 s"],
            ["N4", "Crear agencia de aduanas y transportador", "Expuesto por SPB", U.tag("OK", "ok"), "Business unit ADUPAC"],
            ["Billing", "Cuenta de facturación", "Vía N4", U.tag("Reintentando 2/5", "warn"), "Timeout · siguiente intento en 5 min"],
            ["Portal Integral", "Crear 2 usuarios", "Servicio a habilitar por SPB", U.tag("OK", "ok"), "Contraseñas temporales enviadas"],
            ["PICAT", "No aplica a estas modalidades", "—", U.tag("Omitido", "gray"), "—"]
          ]) + U.alert("info", "El trámite queda 'Aprobado · integración parcial' hasta que Billing responda. Si agota reintentos, se crea una tarea manual para TI con reproceso desde aquí.") + U.btns([{ t: "Reprocesar Billing", cls: "sec" }, { t: "Ver bitácora", cls: "ghost" }])
        }),
        int: ["SAP, N4, Billing (vía N4), Portal Integral, PICAT: todos expuestos y mantenidos por SPB; OLSoftware los consume. PLCOLAB descartado por SPB (23 sep 2026).", "Cola con reintentos exponenciales, bitácora por llamada (request/response) y reproceso manual."],
        system: ["Nunca queda un cliente 'a medias' sin que alguien lo sepa: estado parcial visible y alertas a TI."],
        state: "Aprobado · Integrando / Cliente activo", wbs: ["A10", "T1"],
        q: ["#3 (respondida el 23 sep 2026): SAP tiene servicio de clientes pero no de proveedores (1 a 2 meses); N4, Billing y PICAT los gestiona TI de SPB en semanas; PLCOLAB no existirá."]
      },
      {
        id: "b6", title: "Comunicaciones automáticas de salida", who: "Sistema → Cliente",
        screen: U.shell({ menu: "sac", active: "Plantillas", user: "Liliana · Dirección SAC", title: "Documentos generados · REG-2026-004512",
          body: `${U.doc("Oficio de registro SAC-2026-1187.pdf", "Plantilla 'Oficio de registro' · firmado electrónicamente · enviado 18/09 08:05", U.tag("Firmado", "ok"))}
            ${U.doc("Acta de usuarios Portal de Negocios.pdf", "2 usuarios · credenciales temporales · recomendaciones de seguridad", U.tag("Enviado", "ok"))}
            ${U.doc("Mensaje de bienvenida", "Correo con guía de primeros pasos y contacto SAC", U.tag("Enviado", "ok"))}
            <div class="card soft small"><b>Plantilla editable por SAC</b><br>Buenaventura, {{fecha}}<br>Señores {{razon_social}} · NIT {{nit}}<br>Nos permitimos informar que su empresa ha sido registrada en la(s) modalidad(es) {{modalidades}}…<br><i>Firma: Dirección de Servicio al Cliente</i></div>`
        }),
        system: ["Plantillas institucionales con variables, editables desde el portal sin desarrollo.", "PDF generado y firmado con el proveedor de firma electrónica de SPB; el documento queda en el expediente con hash."],
        int: ["Firma electrónica", "Correo / SMS"],
        state: "Cliente activo", wbs: ["A11", "T8"]
      }
    ]
  });

  /* ============ FLUJO 4: PICAT ============ */
  F.push({
    id: "reg-picat", group: "Registro de clientes", title: "PICAT · Seguridad social y enrolamiento",
    actor: "Empresa cliente (transporte / operador) y Seguridad Física", actors: ["Empresa", "IA documental", "Seguridad Física"],
    summary: "SPB quiere sacar el módulo PICAT del portal anterior y traerlo al nuevo: la empresa carga planillas de seguridad social y ARL, la IA lee empleados y estados de afiliación, la planilla se valida contra el servicio ENLACE y se aprueba automáticamente si cumple; Seguridad revisa solo cuando el servicio no responde o hay novedades, y el enrolamiento se sincroniza con C-Cure 9000 (alcance definido por SPB el 23 sep 2026).",
    steps: [
      {
        id: "p1", title: "Mi personal enrolado", who: "Empresa cliente",
        screen: U.shell({ menu: "cliente", active: "PICAT · Personal", user: "Transportes del Valle Ltda.", title: "PICAT · Personal autorizado",
          body: U.kpis([{ v: "38", l: "Personas enroladas" }, { v: "5", l: "Afiliaciones por vencer" }, { v: "2", l: "Solicitudes en curso" }]) +
            U.tbl(["Cédula", "Nombre", "Cargo", "Chaleco", "Afiliación", "Estado"], [["16.700.111", "Carlos Mosquera", "Conductor", "TV-021", "Vigente hasta 30/09", U.tag("Activo", "ok")], ["1.111.222.333", "Luis Angulo", "Conductor", "TV-022", "Vence 20/09", U.tag("Por vencer", "warn")], ["94.555.666", "Pedro Riascos", "Ayudante", "TV-019", "Sin planilla del mes", U.tag("Suspendido", "bad")]]) +
            U.btns([{ t: "Cargar planilla del mes" }, { t: "Solicitar enrolamiento", cls: "sec" }, { t: "Cancelar persona", cls: "ghost" }])
        }),
        system: ["Módulo dentro del mismo portal (hoy vive en el portal anterior).", "La empresa ve su personal, vigencias y chalecos; el sistema suspende automáticamente a quien no tenga cobertura vigente."],
        state: "—", wbs: ["A7", "A6"],
        q: ["#7 (respondida el 23 sep 2026): PICAT se reimplementa en el nuevo portal con validación automática vía ENLACE e integración REST con C-Cure 9000."]
      },
      {
        id: "p2", title: "Carga de planilla y lectura con IA", who: "Empresa + IA",
        screen: U.shell({ menu: "cliente", active: "PICAT · Personal", user: "Transportes del Valle Ltda.", crumbs: "PICAT › Cargar planilla", title: "Planilla de seguridad social · septiembre 2026",
          body: `${U.doc("planilla_pila_092026.pdf", "Reconocida como <b>Planilla PILA</b> · operador Aportes en Línea · periodo 09/2026 · 41 cotizantes", U.tag("Clasificado", "ia"))}
            ${U.doc("certificado_arl.pdf", "Reconocido como <b>Certificado ARL</b> · Positiva · vigente", U.tag("Clasificado", "ia"))}
            ${U.tbl(["Cédula", "Nombre", "EPS", "AFP", "ARL", "Días", "Resultado"], [["16.700.111", "Carlos Mosquera", "✔", "✔", "✔ Riesgo IV", "30", U.tag("Cubierto", "ok")], ["1.111.222.333", "Luis Angulo", "✔", "✔", "✔", "30", U.tag("Cubierto", "ok")], ["94.555.666", "Pedro Riascos", "✔", "✔", "✖ no aparece", "15", U.tag("Sin ARL", "bad")], ["1.005.444.777", "Nuevo: Andrés Caicedo", "✔", "✔", "✔", "30", U.tag("Nuevo · enrolar", "info")]])}
            ${U.alert("warn", "1 persona sin cobertura ARL y 1 persona nueva no enrolada. Puedes continuar; Seguridad Física decidirá.")}
            ${U.btns([{ t: "Enviar a Seguridad Física", cls: "warn" }, { t: "Corregir", cls: "sec" }])}`
        }),
        ia: ["Extracción tabular de la planilla: empresa, periodo, cotizantes, novedades, días cotizados, riesgo ARL.", "Cruce con el listado de enrolados: detecta nuevos, retirados y sin cobertura."],
        system: ["Consulta al servicio ENLACE (REST) para validar afiliaciones y cobertura según las reglas de SPB (matriz).", "Si todo cumple, la solicitud se aprueba automáticamente sin pasar por Seguridad.", "Si ENLACE no responde, devuelve nulo o hay novedades (sin ARL, persona nueva), el caso va a la bandeja de Seguridad."],
        state: "Solicitud PICAT radicada", wbs: ["A7", "T7"],
        q: ["#8 (respondida el 23 sep 2026): contratación con ENLACE aún en estudio; conexión web service REST. Riesgo alto hasta que se contrate."]
      },
      {
        id: "p3", title: "Aprobación de Seguridad Física", who: "Seguridad Física",
        screen: U.shell({ menu: "segfis", active: "Bandeja PICAT", user: "Diego · Seguridad Física", crumbs: "Bandeja PICAT › PIC-2026-0871", title: "Transportes del Valle · Planilla 09/2026",
          body: `${U.tbl(["Persona", "Novedad", "Evidencia", "Decisión"], [["Pedro Riascos", "Sin ARL en planilla", "Página 3, fila 22", "☐ Mantener suspendido ☑ Suspender"], ["Andrés Caicedo", "Nuevo · enrolamiento", "Cédula + planilla", "☑ Enrolar · chaleco TV-023"], ["Resto (36)", "Sin novedad", "—", "☑ Renovar vigencia hasta 31/10"]])}
            ${U.alert("info", "Chalecos: consecutivo por empresa. Último asignado TV-022 → siguiente TV-023.")}
            ${U.btns([{ t: "Aprobar y enrolar", cls: "ok" }, { t: "Devolver a la empresa", cls: "sec" }])}`
        }),
        system: ["Bandeja propia de Seguridad Física con decisiones por persona.", "Enrolamiento y cancelación de personas; numeración consecutiva de chalecos por empresa.", "Al aprobar: se actualiza la base de enrolados del nuevo módulo y se sincronizan personas y permisos con C-Cure 9000 por sus servicios REST."],
        int: ["C-Cure 9000 (control de acceso físico) vía servicios REST existentes de SPB."],
        state: "Aprobado por Seguridad Física", wbs: ["A7", "A10"]
      },
      {
        id: "p4", title: "Carta PICAT y credenciales", who: "Sistema → Empresa",
        screen: U.shell({ menu: "cliente", active: "PICAT · Personal", user: "Transportes del Valle Ltda.", title: "PICAT · Resultado de la solicitud PIC-2026-0871",
          body: `${U.alert("ok", "37 personas con vigencia renovada hasta 31/10/2026 · 1 nuevo enrolado · 1 suspendido")}
            ${U.doc("Carta PICAT PIC-2026-0871.pdf", "Numeración de chalecos, instrucciones de ingreso y vigencias", U.tag("Descargar", "info"))}
            ${U.tbl(["Persona", "Chaleco", "Vigencia", "Estado"], [["Andrés Caicedo", "TV-023", "31/10/2026", U.tag("Enrolado", "ok")], ["Pedro Riascos", "TV-019", "—", U.tag("Suspendido · sin ARL", "bad")]])}
            ${U.modal("Encuesta de satisfacción", `<p class="small">¿Qué tan fácil fue cargar la planilla este mes? <span class="star">★★★★☆</span></p>${U.btns([{ t: "Enviar" }])}`)}`
        }),
        system: ["Carta PICAT generada desde plantilla; encuesta obligatoria al cierre.", "Alertas mensuales de planilla pendiente y de afiliaciones por vencer."],
        state: "Cerrado", wbs: ["A11", "A12", "A15"]
      }
    ]
  });

  /* ============ FLUJO 5: Usuarios y transporte propio ============ */
  F.push({
    id: "reg-usuarios", group: "Registro de clientes", title: "Usuarios del Portal de Negocios y transporte propio",
    actor: "Cliente registrado", actors: ["Cliente", "SAC", "Portal Integral"],
    summary: "Dos trámites cortos que hoy son manuales: pedir hasta 3 usuarios para el Portal de Negocios (con creación automática en el Portal Integral) y registrar vehículos propios leyendo las tarjetas de propiedad con IA.",
    steps: [
      {
        id: "u1", title: "Solicitud de usuarios", who: "Cliente",
        screen: U.shell({ menu: "cliente", active: "Usuarios y vehículos", user: "Aduanas del Pacífico S.A.S.", crumbs: "Usuarios y vehículos › Usuarios", title: "Usuarios del Portal de Negocios",
          body: `${U.tbl(["Usuario", "Correo", "Estado"], [["mruiz", "mruiz@aduanaspacifico.co", U.tag("Activo", "ok")], ["jperez", "jperez@aduanaspacifico.co", U.tag("Activo", "ok")]])}
            <p class="small">Puedes tener hasta <b>3 usuarios activos</b>. Te queda 1 cupo.</p>
            <div class="frm">${U.fld("Nombre completo", "Laura Gómez")}${U.fld("Cédula", "1.112.223.334")}${U.fld("Correo", "lgomez@aduanaspacifico.co " + U.tag("Dominio verificado", "ok"))}${U.fld("Correo operativo de notificaciones", "operaciones@aduanaspacifco.co " + U.tag("¿Quisiste decir aduanaspacifico.co?", "warn"), "err")}</div>
            ${U.btns([{ t: "Solicitar usuario" }])}`
        }),
        system: ["Consulta de usuarios activos por NIT en el Portal Integral (servicio de SPB).", "Validación de correos: formato, dominio existente, errores tipográficos frecuentes.", "Límite de 3 usuarios parametrizable."],
        int: ["Portal Integral: consulta de usuarios por NIT."],
        state: "Solicitud de usuario radicada", wbs: ["A8"]
      },
      {
        id: "u2", title: "Aprobación y creación automática", who: "SAC → Portal Integral",
        screen: U.shell({ menu: "sac", active: "Bandeja de registros", user: "Jesús · SAC", crumbs: "Bandeja › USR-2026-0332", title: "Solicitud de usuario · Aduanas del Pacífico",
          body: `<div class="frm">${U.fld("Solicitado por", "María Fernanda Ruiz (rep. legal) · sesión verificada")}${U.fld("Usuario a crear", "lgomez · Laura Gómez")}</div>
            ${U.alert("info", "Al aprobar, el usuario se crea automáticamente en el Portal Integral con contraseña temporal y se envía el acta. Hoy este paso lo hace TI manualmente.")}
            ${U.tbl(["Paso", "Estado"], [["Aprobación SAC", U.tag("Aprobado", "ok")], ["Crear usuario en Portal Integral", U.tag("OK · id 88213", "ok")], ["Enviar contraseña temporal", U.tag("Enviado", "ok")], ["Acta de usuario (PDF)", U.tag("Generado", "ok")]])}`
        }),
        int: ["Portal Integral: creación de usuarios (servicio que SPB confirmó revisar; riesgo alto si no existe → cola manual como respaldo)."],
        system: ["Acta de usuario con credenciales y recomendaciones de seguridad; obligación de cambiar contraseña en el primer ingreso."],
        state: "Usuario creado", wbs: ["A8", "A10", "A11"]
      },
      {
        id: "u3", title: "Transporte propio: tarjetas de propiedad", who: "Cliente + IA",
        screen: U.shell({ menu: "cliente", active: "Usuarios y vehículos", user: "Transportes del Valle Ltda.", crumbs: "Usuarios y vehículos › Vehículos", title: "Vehículos autorizados",
          body: `<div class="drop">Carga las tarjetas de propiedad (frente y respaldo)</div>
            ${U.tbl(["Placa", "Propietario", "Marca / modelo", "Origen", "Validación", "Estado"], [["WGT-123", "Transportes del Valle Ltda.", "Kenworth T800 / 2019", U.tag("IA · tarjeta", "ia"), "Propietario = empresa", U.tag("Autorizado", "ok")], ["SKL-987", "Transportes del Valle Ltda.", "International 9400 / 2016", U.tag("IA · tarjeta", "ia"), "Propietario = empresa", U.tag("Autorizado", "ok")], ["ABC-456", "Jorge Mena (persona natural)", "Chevrolet NPR / 2021", U.tag("IA · tarjeta", "ia"), "Propietario ≠ empresa", U.tag("Requiere contrato / autorización", "warn")]])}
            ${U.btns([{ t: "Enviar a aprobación" }])}`
        }),
        ia: ["Extracción de placa, propietario, marca, modelo, línea y número de motor desde la tarjeta de propiedad (imagen de celular incluida)."],
        system: ["Regla: el propietario debe ser la empresa; si no, se pide el documento que lo autorice.", "Al aprobar, se crean los vehículos autorizados en el Portal de Negocios (servicio de SPB)."],
        int: ["Portal Integral / N4: creación de vehículos autorizados."],
        state: "Vehículos en aprobación", wbs: ["A9", "T7"]
      }
    ]
  });

  /* ============ FLUJO 6: Asistente y alertas ============ */
  F.push({
    id: "reg-asistente", group: "Registro de clientes", title: "Asistente de autogestión (chatbot) y riesgos",
    actor: "Cliente", actors: ["Cliente", "Asistente IA", "SAC"],
    summary: "El asistente responde sobre requisitos, estado del trámite y errores documentales con acceso al expediente del cliente. Junto con las alertas de riesgo, busca bajar la carga de llamadas a SAC.",
    steps: [
      {
        id: "c1", title: "Asistente con contexto del trámite", who: "Cliente + Asistente IA",
        screen: U.shell({ menu: "cliente", active: "Asistente", user: "Naviera Sur S.A.", title: "Asistente SPB",
          body: U.chat([
            { b: 1, t: "Hola, soy el asistente del Portal del Cliente. Puedo ayudarte con requisitos, el estado de tus trámites o errores en documentos." },
            { t: "¿Por qué mi trámite de agente marítimo sigue en revisión?" },
            { b: 1, t: "Tu solicitud <b>REG-2026-004510</b> está en <b>Seguros</b> desde el 16/09. Hay una observación: la póliza de responsabilidad civil no indica el valor asegurado. Puedes cargar la carátula completa en <b>Mis trámites › Documentos</b> y el área la revisará el mismo día." },
            { t: "¿Qué documentos necesito para agregar la modalidad de operador portuario?" },
            { b: 1, t: "Para <b>Operador portuario</b> te faltarían: habilitación de la Superintendencia de Transporte, póliza de RC extracontractual y planilla de seguridad social del personal (PICAT). Ya tienes vigentes cámara de comercio, RUT y SARLAFT. ¿Quieres que inicie el trámite de adición?" }
          ])
        }),
        ia: ["Modelo de lenguaje con base de conocimiento de requisitos (matriz) y acceso controlado al estado del trámite del usuario autenticado.", "Escala a SAC (crea una PQRS o tarea) cuando no puede resolver."],
        system: ["Solo responde sobre datos del NIT autenticado; registra la conversación para auditoría y mejora."],
        state: "—", wbs: ["A14"]
      },
      {
        id: "c2", title: "Alertas de riesgo para SAC", who: "SAC",
        screen: U.shell({ menu: "sac", active: "Alertas y vencimientos", user: "Jesús · SAC", title: "Alertas y vencimientos",
          body: U.kpis([{ v: "412", l: "Clientes con docs por vencer (30 días)" }, { v: "37", l: "Documentos vencidos" }, { v: "6", l: "Empresas inactivas en RUES" }, { v: "3", l: "Posibles duplicados" }]) +
            U.tbl(["Cliente", "Alerta", "Detalle", "Acción"], [["Logística Andina", U.tag("RUES inactivo", "bad"), "Matrícula cancelada 08/2026", "Suspender · notificar"], ["Menajes Buenaventura", U.tag("Duplicado", "warn"), "Mismo rep. legal y correo que Menajes BUN S.A.S.", "Revisar"], ["412 clientes", U.tag("Por vencer", "warn"), "Actualización anual abril 2027", "Campaña de recordatorio"]])
        }),
        system: ["Cruces periódicos: vigencias, RUES, NIT inconsistentes, duplicados por correo/representante legal/dirección.", "Acciones masivas: campaña de recordatorio antes de abril."],
        int: ["RUES (consulta periódica)"],
        state: "—", wbs: ["A15", "T10"]
      }
    ]
  });
})(window);
