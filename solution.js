/* Datos de la solución: WBS, arquitectura, pantallas por perfil, estados, roles e integraciones */
(function (w) {
  const WBS = {
    T1: { n: "Arquitectura, setup y DevOps on-premise", h: 200, c: "Alta", d: "Repositorios, CI/CD, ambientes dev/QA/prod sobre Windows Server e IIS en el datacenter de SPB (stack C# .NET, Angular, SQL Server; Python solo para IA), observabilidad, hardening (OWASP, cifrado, auditoría)." },
    T2: { n: "Autenticación unificada y perfiles", h: 200, c: "Alta", d: "Integración con el mecanismo actual del Portal Integral (usuarios y contraseñas en BD, sin proveedor de identidad), sesión compartida y tokens, AD/LDAP (internos), roles y permisos por área, administración de usuarios internos. Preparado para Keycloak (opcional O3)." },
    T3: { n: "Shell de UI y design system", h: 200, c: "Media", d: "Barra lateral y superior iguales al Portal Integral, colores corporativos, componentes reutilizables (tablas, formularios dinámicos, carga, visor, bandejas), responsive." },
    T4: { n: "Motor de reglas parametrizable + administración", h: 280, c: "Alta", d: "Matrices: documentos por modalidad/trámite (incluida proveedores), submodalidades de terceros, categorías PQRS, áreas, criticidad, SLA, checklist de sistemas. Pantallas de administración autogestionadas por SAC." },
    T5: { n: "Motor de workflow, bandejas y trazabilidad", h: 320, c: "Alta", d: "Máquina de estados, bandejas por área/usuario, asignación, actuaciones, historial, auditoría de cada acción, comentarios internos." },
    T6: { n: "Gestor documental y expediente digital", h: 280, c: "Alta", d: "Documentos y evidencias con metadatos, versionado, vigencias, tablas de retención de SPB (5-10 años), visor, control de acceso, respaldo; migración de expedientes desde el file server del datacenter." },
    T7: { n: "Servicio de IA documental", h: 480, c: "Alta", d: "OCR + clasificación + extracción estructurada + validación cruzada; colas, reintentos, evidencias, dataset real y ciclo de ajuste." },
    T8: { n: "Notificaciones, plantillas, PDF y firma electrónica", h: 240, c: "Media", d: "Correo/SMS, plantillas editables, oficios/cartas/actas en PDF, firma electrónica con el proveedor que SPB defina (hoy no hay; propuesta Certicámara o GSE), numeración de radicados." },
    T9: { n: "Encuestas de satisfacción (NPS/CSAT)", h: 120, c: "Baja", d: "Encuestas configurables por proceso, envío automático, modalidad obligatoria, resultados y tablero." },
    T10: { n: "Indicadores, reportes y alertas", h: 280, c: "Media", d: "Base de tableros, exportación PDF/Excel/CSV, alertas y recordatorios automáticos." },
    T11: { n: "Consentimiento de tratamiento de datos", h: 24, c: "Baja", d: "Política, aceptación obligatoria y evidencia electrónica en todos los flujos." },
    A1: { n: "Identificación de la solicitud", h: 140, c: "Media", d: "Tipo de trámite, modalidades (12 + proveedores), NIT, validación RUES con cola, caché y control de tasa (50 req/min), excepciones, historial." },
    A2: { n: "Determinación inteligente de requisitos", h: 80, c: "Baja", d: "Motor de reglas: requeridos, vigentes y pendientes según modalidad, trámite e historial." },
    A3: { n: "Carga documental y formularios de registro", h: 240, c: "Alta", d: "Carga, clasificación y extracción con IA, prellenado de formularios por modalidad, corrección, guardado parcial." },
    A4: { n: "Validación cruzada y lista OFAC", h: 180, c: "Alta", d: "IA docs vs RUES vs formulario, observaciones automáticas, continuar con novedades, consulta OFAC asistida (manual, sin API) con evidencia, notificación a Cumplimiento." },
    A5: { n: "Expediente digital del cliente (360)", h: 120, c: "Media", d: "Información maestra, formularios, historial documental, trazabilidad, modalidades aprobadas, documentos por vencer." },
    A6: { n: "Registro de terceros", h: 160, c: "Media", d: "Submodalidades (conductores, autoridades, contratistas, administradoras, entidades, entes de control), documentos y validaciones tipo PICAT." },
    A7: { n: "Módulo PICAT (seguridad social y enrolamiento)", h: 520, c: "Alta", d: "Planilla y ARL con extracción IA, validación contra ENLACE (REST), aprobación automática si cumple y revisión de Seguridad si el servicio no responde o hay novedades, enrolamiento y cancelación, chalecos por empresa, integración REST con C-Cure 9000." },
    A8: { n: "Usuarios del Portal de Negocios", h: 160, c: "Media", d: "Hasta 3 usuarios, consulta por NIT, aprobación, creación automática en el Portal Integral, contraseña temporal, validación de correos." },
    A9: { n: "Módulo transporte propio", h: 120, c: "Media", d: "Tarjetas de propiedad con extracción IA, validación contra la empresa, vehículos autorizados." },
    A10: { n: "Flujo de aprobaciones e integraciones", h: 320, c: "Alta", d: "Bandejas SAC, Seguros, SESAMA, Seguridad Física, Cumplimiento; checklist de sistemas; orquestación SAP, N4, Billing, Portal Integral, PICAT con reintentos, log y reprocesos. PLCOLAB descartado por SPB." },
    A11: { n: "Comunicaciones automáticas", h: 80, c: "Baja", d: "Oficio de registro firmado, carta PICAT, acta de usuario, bienvenida." },
    A12: { n: "Encuesta de satisfacción del registro", h: 24, c: "Baja", d: "Encuesta al cierre del trámite (módulo transversal)." },
    A13: { n: "Modalidad proveedores", h: 100, c: "Media", d: "Modalidad con la lista de documentos y campos ya definida por Compras, parametrizable desde T4 (proveedor es una modalidad más)." },
    A14: { n: "Asistente de autogestión (chatbot)", h: 240, c: "Alta", d: "Orientación sobre requisitos, estado del trámite, errores documentales; base de conocimiento y acceso al estado del caso." },
    A15: { n: "Detección de riesgos y alertas", h: 120, c: "Media", d: "Vencidos y por vencer, NIT inconsistentes, empresas inactivas en RUES, duplicados; alertas al cliente y a SAC." },
    A16: { n: "Consultas y seguimiento del cliente", h: 120, c: "Media", d: "Estado en tiempo real, observaciones, historial, documentos, responsable actual; tableros de registro." },
    B1: { n: "Radicación inteligente", h: 120, c: "Media", d: "Registrados y no registrados (datos básicos + código, captcha), tipo, política de datos." },
    B2: { n: "Motor de requisitos PQRS", h: 100, c: "Media", d: "Formularios dinámicos según tipo, categoría, canal, servicio y perfil." },
    B3: { n: "Asistente de redacción y detección de duplicados", h: 200, c: "Alta", d: "Mejora de redacción, aclaraciones, información faltante; duplicados por documento, temática, cliente y casos recientes." },
    B4: { n: "Validación documental y radicación", h: 160, c: "Alta", d: "Clasificación y extracción de adjuntos, legibilidad y completitud, radicado único, expediente, confirmación, seguimiento en línea." },
    B5: { n: "Clasificación y tipificación inteligente", h: 200, c: "Alta", d: "Categoría, subcategoría, servicio, área, criticidad, prioridad y SLA; enrutamiento por reglas o a SAC." },
    B6: { n: "Validación por Servicio al Cliente", h: 80, c: "Baja", d: "Validar, reclasificar, reasignar, pedir información, rechazar; trazabilidad." },
    B7: { n: "Gestión del caso por áreas", h: 280, c: "Alta", d: "Bandeja por área, actuaciones, evidencias, solicitud de información, traspaso entre áreas, comentarios internos, Seguros directo con el cliente." },
    B8: { n: "Control de SLA y escalamientos", h: 120, c: "Media", d: "Estados, tiempos normativos, alertas 80/90%, escalamiento al 100%, suspensión por 'pendiente cliente'." },
    B9: { n: "Respuesta oficial y cierre", h: 160, c: "Alta", d: "Borrador IA, edición SAC, documento institucional firmado por la Dirección SAC, envío y cierre." },
    B10: { n: "Encuesta de satisfacción PQRS", h: 24, c: "Baja", d: "NPS/CSAT obligatoria al cierre." },
    B11: { n: "Indicadores y reportes PQRS", h: 120, c: "Media", d: "Volumen, tiempos, SLA, top categorías, causas raíz, tendencias, informes ejecutivos." },
    B12: { n: "Canales adicionales", h: 100, c: "Media", d: "Radicación por agente interno (teléfono, presencial). El buzón de correo pasó al opcional O1 por decisión de SPB (23 sep 2026)." },
    O1: { n: "Canal correo electrónico y WhatsApp / chat (opcional)", h: 220, c: "Alta", d: "Buzón de correo monitoreado que crea casos y radicación/consulta por WhatsApp Business API." },
    O2: { n: "IA avanzada PQRS (opcional)", h: 240, c: "Alta", d: "Resumen del expediente, casos similares, sentimiento, predicción de tiempos, alertas predictivas, mejora continua." },
    O3: { n: "Proveedor de identidad Keycloak (opcional)", h: 120, c: "Media", d: "Keycloak como proveedor de identidad para externos e internos, migración de credenciales y SSO; solo si SPB lo decide." }
  };

  const LAYERS = [
    { name: "Personas que usan el portal", blocks: [
      { id: "u-cliente", cls: "ext", t: "Cliente registrado", s: "Importadores, agencias, transportadores…", d: "Entra por el Portal Integral con inicio de sesión único. Usa registro, actualización, PICAT, usuarios, vehículos, PQRS y el asistente." },
      { id: "u-nores", cls: "ext", t: "Usuario no registrado", s: "Comunidad, ciudadanos", d: "Solo puede radicar y consultar PQRS con radicado y código. Obligación legal de SPB." },
      { id: "u-sac", cls: "ext", t: "SAC", s: "Servicio al Cliente", d: "Dueño del proceso: bandejas de registro y PQRS, aprobación final, respuestas oficiales, matrices, plantillas, tableros." },
      { id: "u-areas", cls: "ext", t: "Áreas", s: "Seguros, SESAMA, Seg. Física, Cumplimiento, Operaciones, Facturación…", d: "Revisan y aprueban según modalidad; gestionan PQRS de su competencia. Seguridad Física maneja PICAT." },
      { id: "u-ger", cls: "ext", t: "Gerencia / Junta", s: "Tableros ejecutivos", d: "Indicadores en tiempo real, cumplimiento de SLA, NPS, informes programados." }
    ]},
    { name: "Capa de presentación (mismo look del Portal Integral)", blocks: [
      { id: "T3", cls: "core", t: "Shell de UI y design system", s: "T3 · 200 h" },
      { id: "T2", cls: "core", t: "Autenticación unificada", s: "T2 · 200 h · BD Portal Integral + AD/LDAP" },
      { id: "T11", cls: "core", t: "Consentimiento de datos", s: "T11 · 24 h" },
      { id: "A14", cls: "ia", t: "Asistente (chatbot)", s: "A14 · 240 h" }
    ]},
    { name: "Producto 1 · Registro inteligente de clientes, usuarios y terceros (squad Registro)", blocks: [
      { id: "A1", cls: "reg", t: "Identificación + RUES", s: "A1 · 140 h" }, { id: "A2", cls: "reg", t: "Requisitos por reglas", s: "A2 · 80 h" }, { id: "A3", cls: "reg", t: "Carga documental + formularios", s: "A3 · 240 h" }, { id: "A4", cls: "reg", t: "Validación cruzada + OFAC", s: "A4 · 180 h" },
      { id: "A5", cls: "reg", t: "Expediente 360", s: "A5 · 120 h" }, { id: "A6", cls: "reg", t: "Registro de terceros", s: "A6 · 160 h" }, { id: "A7", cls: "reg", t: "PICAT + ENLACE + C-Cure", s: "A7 · 520 h" }, { id: "A8", cls: "reg", t: "Usuarios Portal de Negocios", s: "A8 · 160 h" },
      { id: "A9", cls: "reg", t: "Transporte propio", s: "A9 · 120 h" }, { id: "A10", cls: "reg", t: "Aprobaciones + integraciones", s: "A10 · 320 h" }, { id: "A11", cls: "reg", t: "Comunicaciones", s: "A11 · 80 h" }, { id: "A12", cls: "reg", t: "Encuesta registro", s: "A12 · 24 h" },
      { id: "A13", cls: "reg", t: "Modalidad proveedores", s: "A13 · 100 h" }, { id: "A15", cls: "reg", t: "Riesgos y alertas", s: "A15 · 120 h" }, { id: "A16", cls: "reg", t: "Seguimiento del cliente", s: "A16 · 120 h" }
    ]},
    { name: "Producto 2 · Sistema inteligente de gestión de PQRS (squad PQRS)", blocks: [
      { id: "B1", cls: "pqr", t: "Radicación inteligente", s: "B1 · 120 h" }, { id: "B2", cls: "pqr", t: "Motor de requisitos", s: "B2 · 100 h" }, { id: "B3", cls: "pqr", t: "Redacción + duplicados", s: "B3 · 200 h" }, { id: "B4", cls: "pqr", t: "Validación documental + radicado", s: "B4 · 160 h" },
      { id: "B5", cls: "pqr", t: "Clasificación inteligente", s: "B5 · 200 h" }, { id: "B6", cls: "pqr", t: "Validación SAC", s: "B6 · 80 h" }, { id: "B7", cls: "pqr", t: "Gestión por áreas", s: "B7 · 280 h" }, { id: "B8", cls: "pqr", t: "SLA y escalamientos", s: "B8 · 120 h" },
      { id: "B9", cls: "pqr", t: "Respuesta oficial", s: "B9 · 160 h" }, { id: "B10", cls: "pqr", t: "Encuesta PQRS", s: "B10 · 24 h" }, { id: "B11", cls: "pqr", t: "Indicadores PQRS", s: "B11 · 120 h" }, { id: "B12", cls: "pqr", t: "Agente interno", s: "B12 · 100 h" },
      { id: "O1", cls: "opt", t: "Correo y WhatsApp (opcional)", s: "O1 · 220 h" }, { id: "O2", cls: "opt", t: "IA avanzada (opcional)", s: "O2 · 240 h" }, { id: "O3", cls: "opt", t: "Keycloak (opcional)", s: "O3 · 120 h" }
    ]},
    { name: "Núcleo transversal (lo comparten los dos productos)", blocks: [
      { id: "T4", cls: "core", t: "Motor de reglas + matrices", s: "T4 · 280 h" }, { id: "T5", cls: "core", t: "Workflow, bandejas, trazabilidad", s: "T5 · 320 h" }, { id: "T6", cls: "core", t: "Gestor documental / expediente", s: "T6 · 280 h" },
      { id: "T8", cls: "core", t: "Notificaciones, PDF, firma", s: "T8 · 240 h" }, { id: "T9", cls: "core", t: "Encuestas", s: "T9 · 120 h" }, { id: "T10", cls: "core", t: "Indicadores y alertas", s: "T10 · 280 h" }
    ]},
    { name: "Servicio de IA", blocks: [
      { id: "T7", cls: "ia", t: "IA documental", s: "T7 · 480 h · OCR + clasificación + extracción + validación" },
      { id: "ia-llm", cls: "ia", t: "Modelo de lenguaje", s: "Redacción, clasificación PQRS, borradores, asistente", d: "Decisión de SPB (23 sep 2026): servicios en nube (Azure OpenAI / Anthropic / Google) con acuerdo de confidencialidad, USD 3.000-8.000/año. El servidor con 1-2 GPU en el datacenter (USD 25.000-60.000 único) se mantiene solo como comparativo de costos que SPB pidió." },
      { id: "ia-ocr", cls: "ia", t: "OCR", s: "Azure Document Intelligence / Google Document AI (nube)", d: "~360.000 páginas/año. En nube USD 600-5.000/año; la opción local (PaddleOCR con GPU) queda solo como comparativo." }
    ]},
    { name: "Capa de integración (adaptadores con colas, reintentos y bitácora)", blocks: [
      { id: "i-rues", cls: "int", t: "RUES", s: "Existente · SPB", d: "Consulta de matrícula, razón social, representante legal, actividad económica. Ya contratado por SPB; límite de 50 peticiones/min, IP y credenciales autorizadas (respuesta #6)." },
      { id: "i-ofac", cls: "int", t: "OFAC / SARLAFT", s: "Consulta manual · sin API", d: "Consulta de listas restrictivas. Sin API, hoy manual (respuesta #4): consulta asistida con evidencia en el expediente; SPB define cómo sistematizarla." },
      { id: "i-sap", cls: "int", t: "SAP", s: "Servicio a exponer por SPB", d: "Creación/actualización del cliente o tercero al aprobar (servicio existente para clientes; el de proveedores lo construye SPB). PLCOLAB descartado por SPB." },
      { id: "i-n4", cls: "int", t: "N4", s: "Servicio a exponer por SPB (tienen fuentes)", d: "Creación de la entidad según modalidad (agencia, transportador, línea…). Billing se alimenta vía N4." },
      { id: "i-pi", cls: "int", t: "Portal Integral", s: "Usuarios y vehículos · a habilitar", d: "Creación automática de usuarios (hoy manual, servicio no existe) y de vehículos autorizados. Riesgo alto; respaldo: cola manual." },
      { id: "i-picat", cls: "int", t: "C-Cure 9000", s: "Control de acceso físico · REST existente", d: "PICAT se reimplementa en el nuevo portal y se conecta vía servicios REST de C-Cure 9000 (respuesta #8)." },
      { id: "i-firma", cls: "int", t: "Firma electrónica", s: "Proveedor por definir (Certicámara / GSE)", d: "Firma de oficios y respuestas oficiales. SPB no tiene proveedor ni firma electrónicamente hoy (respuesta #5); propuesta: Certicámara o GSE." },
      { id: "i-mail", cls: "int", t: "Correo / SMS / buzón", s: "SMTP y buzón monitoreado", d: "Notificaciones salientes. La radicación de PQRS desde correo es opcional (O1)." },
      { id: "i-planilla", cls: "int", t: "ENLACE (planillas)", s: "REST · contratación en estudio por SPB", d: "Validación de la planilla de seguridad social con aprobación automática; si no responde, revisa Seguridad (parte del alcance base, A7)." }
    ]},
    { name: "Plataforma e infraestructura on-premise (datacenter de SPB)", blocks: [
      { id: "T1", cls: "core", t: "Arquitectura, DevOps, seguridad", s: "T1 · 200 h" },
      { id: "inf-app", cls: "ext", t: "Servidores IIS: app, API, workers", s: "3 ambientes: dev, QA, prod · Windows Server", d: "Servicios .NET sobre IIS en servidores Windows de SPB (contenedores solo con justificación técnica); workers para colas de IA e integraciones." },
      { id: "inf-db", cls: "ext", t: "Base de datos + almacenamiento", s: "SQL Server · 3-6 TB iniciales · retención 10 años", d: "SQL Server para procesos y metadatos; almacenamiento de objetos para documentos con políticas de retención e inmutabilidad de evidencias." },
      { id: "inf-idp", cls: "ext", t: "Autenticación", s: "BD del Portal Integral + AD/LDAP", d: "Sin proveedor de identidad (respuesta #2); Keycloak en el radar de SPB, cotizado como opcional O3." }
    ]}
  ];

  const PROFILES = {
    "Cliente registrado": { menu: "cliente", pages: [
      { t: "Inicio", d: "Resumen: trámites en curso, modalidades aprobadas, documentos por vencer, PQRS abiertas, avisos.", w: ["A16"] },
      { t: "Registro y modalidades", d: "Nueva solicitud (primera vez, actualización, adición, cambio), borradores guardados, modalidades vigentes y sus estados.", w: ["A1", "A2", "A3", "A4"] },
      { t: "Mis trámites", d: "Lista y detalle de cada radicado: línea de tiempo, responsable actual, observaciones, solicitudes de información, documentos.", w: ["A16", "T5"] },
      { t: "Mis documentos", d: "Expediente del cliente: documentos vigentes, vencidos, por vencer, versiones, descargas, oficios y actas recibidos.", w: ["A5", "T6", "A15"] },
      { t: "PICAT · Personal", d: "Enrolados, vigencias, chalecos, carga mensual de planilla y ARL, solicitudes de enrolamiento y cancelación.", w: ["A7"] },
      { t: "Usuarios y vehículos", d: "Usuarios del Portal de Negocios (hasta 3), correos operativos, vehículos propios con tarjeta de propiedad.", w: ["A8", "A9"] },
      { t: "PQRS", d: "Radicar, mis casos, responder solicitudes de información, ver respuesta oficial, encuesta.", w: ["B1", "B4", "B7", "B10"] },
      { t: "Asistente", d: "Chat con contexto del NIT: requisitos, estado, errores documentales, iniciar trámites.", w: ["A14"] }
    ]},
    "Usuario no registrado": { menu: null, pages: [
      { t: "Radicar PQRS", d: "Página pública: datos básicos, verificación de correo, captcha, tipo, formulario dinámico, adjuntos, radicado + código.", w: ["B1", "B2", "B4"] },
      { t: "Consultar estado", d: "Con radicado y código: etapa, tiempo restante, solicitudes de información, respuesta oficial, encuesta.", w: ["B4", "B10"] }
    ]},
    "SAC (Servicio al Cliente)": { menu: "sac", pages: [
      { t: "Bandeja de registros", d: "Solicitudes por validar, en áreas, pendientes del cliente, vencidas; filtros; asignación; aprobación final y ejecución de integraciones.", w: ["T5", "A10"] },
      { t: "Bandeja PQRS", d: "Casos que la IA no clasificó con confianza, validación, reclasificación, radicación en nombre de terceros, buzón de correo (opcional O1), semáforo SLA, respuestas por firmar.", w: ["B6", "B8", "B9", "B12"] },
      { t: "Expedientes (360)", d: "Búsqueda por NIT: información maestra, modalidades, documentos, historial de trámites y PQRS, evidencias IA, OFAC.", w: ["A5", "T6"] },
      { t: "Alertas y vencimientos", d: "Documentos por vencer/vencidos, RUES inactivo, duplicados, campañas de recordatorio para abril.", w: ["A15", "T10"] },
      { t: "Tableros", d: "Registro y PQRS: tiempos, SLA, volúmenes, NPS, causas raíz; exportación e informes programados.", w: ["T10", "B11", "A16"] },
      { t: "Matrices y reglas", d: "Documentos por modalidad/trámite, submodalidades de terceros, categorías PQRS, áreas, criticidad, SLA, checklist de sistemas.", w: ["T4"] },
      { t: "Plantillas y encuestas", d: "Oficios, cartas, actas, respuestas; encuestas por proceso y su obligatoriedad.", w: ["T8", "T9"] }
    ]},
    "Área revisora (Seguros, SESAMA, Cumplimiento, Operaciones…)": { menu: "area", pages: [
      { t: "Bandeja de aprobaciones", d: "Solicitudes de registro que requieren concepto del área según modalidad; aprobar, aprobar con condición, devolver, rechazar.", w: ["A10", "T5"] },
      { t: "Bandeja PQRS", d: "Casos asignados: actuaciones, evidencias, solicitud de información, traspaso, comentarios internos, proyectar respuesta.", w: ["B7", "B8"] },
      { t: "Tableros de mi área", d: "Casos abiertos/cerrados/vencidos, tiempos, carga por gestor.", w: ["T10"] }
    ]},
    "Seguridad Física (PICAT)": { menu: "segfis", pages: [
      { t: "Bandeja PICAT", d: "Planillas y solicitudes de enrolamiento por revisar, con novedades por persona y evidencia de la IA.", w: ["A7"] },
      { t: "Enrolados y cancelaciones", d: "Base de personas autorizadas por empresa, vigencias, suspensiones, cancelaciones.", w: ["A7"] },
      { t: "Chalecos", d: "Numeración consecutiva por empresa, reasignaciones, histórico.", w: ["A7"] }
    ]},
    "Administrador TI": { menu: "admin", pages: [
      { t: "Integraciones", d: "Estado de cada adaptador, bitácora de llamadas, reprocesos, colas y reintentos.", w: ["A10", "T1"] },
      { t: "Usuarios internos y roles", d: "Sincronización con AD/LDAP, asignación de roles por área.", w: ["T2"] },
      { t: "Auditoría", d: "Bitácora de acciones (quién, cuándo, qué), consultas al expediente, exportación para autoridades.", w: ["T5", "T6"] },
      { t: "Parámetros de IA", d: "Umbrales de confianza, proveedor de IA en nube, métricas de precisión, dataset de ajuste.", w: ["T7"] }
    ]}
  };

  const STATES = {
    registro: {
      title: "Trámite de registro / actualización",
      nodes: [
        { id: "borr", t: "Borrador", x: 40, y: 80 }, { id: "rad", t: "Radicado", x: 190, y: 80 }, { id: "sac", t: "En validación SAC", x: 340, y: 80 },
        { id: "pend", t: "Pendiente del cliente", x: 340, y: 200, cls: "warn" }, { id: "areas", t: "En revisión por áreas", x: 520, y: 80 },
        { id: "final", t: "Aprobación final", x: 700, y: 80 }, { id: "integ", t: "Integrando", x: 860, y: 80 }, { id: "parcial", t: "Integración parcial", x: 860, y: 200, cls: "warn" },
        { id: "activo", t: "Cliente activo", x: 1020, y: 80, cls: "ok" }, { id: "rech", t: "Rechazado", x: 700, y: 200, cls: "bad" }, { id: "desist", t: "Desistido", x: 190, y: 200, cls: "bad" }
      ],
      edges: [["borr", "rad", "radica"], ["rad", "sac", "auto"], ["sac", "pend", "pide info"], ["pend", "sac", "responde"], ["sac", "areas", "valida"], ["areas", "pend", "pide info"], ["areas", "final", "todas aprueban"], ["final", "integ", "aprueba"], ["integ", "activo", "OK"], ["integ", "parcial", "falla"], ["parcial", "activo", "reproceso"], ["sac", "rech", "rechaza"], ["areas", "rech", "rechaza"], ["pend", "desist", "vence plazo"]]
    },
    pqrs: {
      title: "Caso PQRS",
      nodes: [
        { id: "borr", t: "Borrador", x: 40, y: 80 }, { id: "rad", t: "Radicado", x: 190, y: 80 }, { id: "clas", t: "Clasificado", x: 340, y: 80 },
        { id: "valsac", t: "En validación SAC", x: 340, y: 200, cls: "warn" }, { id: "gest", t: "En gestión (área)", x: 520, y: 80 },
        { id: "pend", t: "Pendiente del cliente (SLA suspendido)", x: 520, y: 200, cls: "warn" }, { id: "esc", t: "Escalado", x: 700, y: 200, cls: "bad" },
        { id: "resp", t: "Respuesta en firma", x: 700, y: 80 }, { id: "respd", t: "Respondido", x: 860, y: 80 }, { id: "cerr", t: "Cerrado", x: 1020, y: 80, cls: "ok" }, { id: "rech", t: "No procede / rechazado", x: 190, y: 200, cls: "bad" }
      ],
      edges: [["borr", "rad", "radica"], ["rad", "clas", "IA"], ["clas", "valsac", "conf. baja"], ["valsac", "clas", "confirma"], ["clas", "gest", "asigna"], ["gest", "pend", "pide info"], ["pend", "gest", "responde"], ["gest", "esc", "SLA 100%"], ["esc", "gest", "atiende"], ["gest", "resp", "proyecta"], ["resp", "respd", "firma y envía"], ["respd", "cerr", "encuesta"], ["valsac", "rech", "no procede"], ["gest", "gest", "traspaso entre áreas"]]
    }
  };

  const SLA = [
    ["Petición · Gestión de usuarios", "≤ 5 días hábiles al cliente · 2 días el área", "Matriz de SPB (23 sep 2026)"],
    ["Petición · Facturas SPB · Reintegros", "≤ 10 días hábiles al cliente · 2 días el área", "Matriz de SPB (23 sep 2026)"],
    ["Queja · Novedades en proceso operativo", "≤ 5 días hábiles al cliente · 7 días el área", "Matriz de SPB (23 sep 2026)"],
    ["Queja · Novedades en proceso administrativo", "≤ 15 días hábiles al cliente · 7 días el área", "Matriz de SPB (23 sep 2026)"],
    ["Reclamo · Facturas SPB", "≤ 5 días hábiles al cliente · área no definida (se asume 2 días)", "Matriz de SPB (23 sep 2026)"],
    ["Reclamo · Averías y/o faltantes · Daño motonave · Daños a equipos o vehículos de terceros", "≤ 45 días hábiles al cliente · 15 días el área", "Matriz de SPB (23 sep 2026)"],
    ["Regla general PQRS", "El tiempo al cliente corre desde la radicación; el del área, desde la asignación del ticket", "SPB (23 sep 2026)"],
    ["Registro: validación SAC", "2 días hábiles (supuesto)", "SLA interno"],
    ["Registro: concepto de área", "3-5 días hábiles (supuesto)", "SLA interno"]
  ];

  const ROLES = [
    { r: "Cliente registrado", acc: "Sesión del Portal Integral (usuario y contraseña en BD)", b: "Mis trámites, Mis documentos, PICAT, Usuarios y vehículos, PQRS", a: "Radicar y actualizar registro, cargar documentos, responder solicitudes de información, radicar PQRS, ver estado, encuesta, chatbot", v: "Solo su NIT" },
    { r: "Usuario no registrado", acc: "Correo verificado + código", b: "Radicar PQRS, Consultar estado", a: "Radicar, adjuntar, responder información, ver respuesta, encuesta", v: "Solo sus radicados" },
    { r: "Analista SAC", acc: "AD/LDAP · rol SAC", b: "Bandeja de registros, Bandeja PQRS, Expedientes, Alertas", a: "Validar, pedir información, rechazar, reasignar, reclasificar PQRS, radicar en nombre de, proyectar respuesta, ver evidencia IA", v: "Todos los clientes" },
    { r: "Dirección SAC", acc: "AD/LDAP · rol Dirección", b: "Todo SAC + Aprobación final + Firma", a: "Aprobación final del registro, ejecutar integraciones, firmar respuestas oficiales y oficios, tableros", v: "Todos" },
    { r: "Seguros / SESAMA / Cumplimiento", acc: "AD/LDAP · rol de área", b: "Bandeja de aprobaciones, Bandeja PQRS (de su área)", a: "Aprobar / con condición / devolver / rechazar registros; gestionar PQRS asignadas; Seguros interactúa directo con el cliente", v: "Solicitudes y casos de su área" },
    { r: "Seguridad Física", acc: "AD/LDAP · rol Seguridad", b: "Bandeja PICAT, Enrolados, Chalecos, Aprobaciones (modalidades con PICAT)", a: "Aprobar planillas, enrolar y cancelar personas, asignar chalecos, suspender", v: "Personal y empresas con PICAT" },
    { r: "Operaciones / Facturación / Comercial", acc: "AD/LDAP · rol de área", b: "Bandeja PQRS", a: "Actuaciones, evidencias, pedir información, traspasar, proyectar respuesta", v: "Casos de su área" },
    { r: "Administrador funcional (SAC)", acc: "AD/LDAP · rol Admin funcional", b: "Matrices y reglas, Plantillas, Encuestas, Categorías, SLA", a: "Parametrizar sin desarrollo (respuesta #19: autogestión del equipo SAC)", v: "Configuración" },
    { r: "Administrador TI", acc: "AD/LDAP · rol Admin TI", b: "Integraciones, Usuarios internos, Auditoría, Parámetros IA", a: "Reprocesar integraciones, roles, auditoría, umbrales de IA", v: "Técnico" },
    { r: "Gerencia / Junta", acc: "AD/LDAP · rol Consulta", b: "Tableros ejecutivos", a: "Consultar indicadores, informes programados", v: "Agregado" }
  ];

  const INTEG = [
    { s: "RUES", when: "Durante el registro (identificación) y en cruces periódicos", what: "Consulta por NIT: estado de matrícula, razón social, representante legal, actividad", who: "Existente · SPB (usuario/contraseña, IP autorizada)", risk: "Bajo · límite 50 req/min, cola y caché" },
    { s: "OFAC / SARLAFT", when: "Validación cruzada, antes de radicar", what: "Consulta asistida de la empresa y el representante legal en listas restrictivas; evidencia al expediente; aviso a Cumplimiento", who: "Manual, sin API (SPB)", risk: "Medio · sistematización pendiente" },
    { s: "SAP", when: "Al aprobar el registro / al cambiar datos maestros", what: "Crear o actualizar cliente/tercero (PLCOLAB descartado por SPB)", who: "Servicio a exponer por SPB", risk: "Alto · disponibilidad y fechas" },
    { s: "N4 (Navis)", when: "Al aprobar el registro / vehículos", what: "Crear la entidad por modalidad (agencia, transportador, línea, operador); vehículos autorizados; Billing se alimenta desde N4", who: "Servicio a exponer por SPB (tienen fuentes)", risk: "Alto · disponibilidad y fechas" },
    { s: "Portal Integral", when: "Al aprobar usuarios", what: "Consultar usuarios por NIT; crear usuarios con contraseña temporal; crear vehículos", who: "Servicio a habilitar por SPB (hoy no existe)", risk: "Alto · respaldo: cola manual" },
    { s: "ENLACE (planillas de seguridad social)", when: "Al cargar la planilla", what: "Validar afiliaciones; aprobación automática si cumple; si no responde o devuelve nulo, revisa Seguridad", who: "Contratación en estudio por SPB · REST", risk: "Alto · servicio aún no contratado" },
    { s: "C-Cure 9000", when: "Al aprobar enrolamientos y cancelaciones", what: "Sincronizar personas y permisos de acceso físico", who: "Servicios REST existentes de SPB", risk: "Medio · ambiente de pruebas" },
    { s: "Firma electrónica", when: "Oficios de registro, cartas PICAT, respuestas oficiales", what: "Firmar PDF con certificado de la Dirección SAC; sello de tiempo", who: "Proveedor por definir (propuesta: Certicámara o GSE)", risk: "Medio · sin proveedor hoy" },
    { s: "Correo / SMS", when: "En cada cambio de estado; buzón de PQRS", what: "Notificaciones salientes con plantillas; lectura del buzón para crear casos solo en el opcional O1", who: "SMTP de SPB; buzón, SMS y WhatsApp opcionales", risk: "Bajo" },
    { s: "Autenticación del Portal Integral", when: "Todo ingreso", what: "Externos contra la base de datos del Portal Integral (sin proveedor de identidad); internos AD/LDAP; roles. Keycloak opcional (O3)", who: "SPB (stack .NET / SQL Server)", risk: "Medio · sin proveedor de identidad (respuestas #1 y #2)" },
    { s: "IA (LLM + OCR)", when: "Carga documental, redacción, clasificación, respuestas, asistente", what: "Servicios en nube con acuerdo de confidencialidad (decisión de SPB, 23 sep 2026)", who: "Licencias a cargo de SPB", risk: "Bajo · acceso saliente desde el datacenter" }
  ];

  const PHASES = [
    { f: "Fase 0 · Inception y arquitectura", d: "4 semanas", c: "Levantamiento con SAC, Seguros, SESAMA, Seguridad Física, Compras y TI; matrices y tableros; arquitectura on-premise; prototipo UX; contratos de integración; prueba de concepto de IA con documentos reales; plan de releases." },
    { f: "Fase 1 · Release 1 (sprints 1-6)", d: "12 semanas", c: "Plataforma base + Registro núcleo (identificación, requisitos, carga IA, validación y OFAC, expediente, aprobaciones SAC, integraciones) + PQRS núcleo (radicación, requisitos, clasificación, áreas, SLA, respuesta). Dos squads." },
    { f: "Fase 2 · Release 2 (sprints 7-12)", d: "12 semanas", c: "Registro: PICAT, terceros, usuarios, transporte, proveedores, chatbot, riesgos, comunicaciones. PQRS: redacción y duplicados, validación IA de adjuntos, canales, encuestas, tableros." },
    { f: "Fase 3 · Estabilización y producción", d: "6 semanas", c: "Aceptación con SPB, carga y seguridad, migración de expedientes desde el file server, capacitación a SAC, producción de los dos módulos en junio de 2027 (exigencia de SPB), hypercare 4 semanas." }
  ];

  w.SOL = { WBS, LAYERS, PROFILES, STATES, SLA, ROLES, INTEG, PHASES };
})(window);
