document.addEventListener("DOMContentLoaded", () => {
  const detalle    = document.getElementById("detalle-items");
  const btnAgregar = document.getElementById("btn-agregar");
  const btnImprimir= document.getElementById("btn-imprimir");
  const totalEl    = document.getElementById("total");
  const formContrato = document.getElementById("form-contrato");

  let modalInstancia = null;

  // ── Número de presupuesto único por sesión ──────────────────────────────
  let numeroPresupuestoAuto = "";

  function generarEstampaInicial() {
    const aleatorio = Math.floor(100 + Math.random() * 900);
    const fecha = new Date();
    const mes  = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    numeroPresupuestoAuto = `PR-${aleatorio}${mes}${anio}`;
    const contenedor = document.getElementById("nro-presupuesto-estampa");
    if (contenedor) contenedor.innerText = numeroPresupuestoAuto;
  }
  generarEstampaInicial();

  // ── Modal Bootstrap ─────────────────────────────────────────────────────
  if (typeof bootstrap !== "undefined" && document.getElementById("modalContrato")) {
    modalInstancia = new bootstrap.Modal(document.getElementById("modalContrato"));
  }

  // ── Eventos de campos del modal (correctamente en JS, no en HTML) ───────
  document.getElementById("metodoPago")?.addEventListener("change", evaluarModalidadPago);
  document.getElementById("chkGarante")?.addEventListener("change", toggleCamposGarante);
  document.getElementById("chkPreexistente")?.addEventListener("change", togglePresupuestoPreexistente);

  function evaluarModalidadPago() {
    const metodo = document.getElementById("metodoPago").value;
    const contenedor = document.getElementById("contenedorCuotas");
    if (contenedor) {
      contenedor.style.display = (metodo === "Plan de Pago Financiado") ? "block" : "none";
    }
  }

  function togglePresupuestoPreexistente() {
    const chk = document.getElementById("chkPreexistente");
    const contenedor = document.getElementById("camposPreexistentes");
    if (chk && contenedor) contenedor.style.display = chk.checked ? "block" : "none";
  }

  function toggleCamposGarante() {
    const chk = document.getElementById("chkGarante");
    const contenedor = document.getElementById("camposGarante");
    if (chk && contenedor) contenedor.style.display = chk.checked ? "block" : "none";
  }

  // ── Catálogo de ítems ───────────────────────────────────────────────────
  const itemsDisponibles = [
    { descripcion: "Ataud para Nicho N° 15",                precio: 645000  },
    { descripcion: "Ataud para Nicho Semi-Extraordinario",  precio: 752000  },
    { descripcion: "Ataud para Nicho Extraordinario",       precio: 1160000 },
    { descripcion: "Nicho Nuevo",                           precio: 1030000 },
    { descripcion: "Nicho Usado",                           precio: 515000  },
    { descripcion: "Cremacion",                             precio: 1180000 },
    { descripcion: "Servicio Velacion 8 Hs",                precio: 3415000 },
    { descripcion: "Hora de Velación",                      precio: 427000  },
    { descripcion: "Gastos Administrativos",                precio: 75000   },
    { descripcion: "Auto Acompañamiento",                   precio: 125000  },
    { descripcion: "Ataud para Tierra N° 15",               precio: 418000  },
    { descripcion: "Ataud para Tierra Semi-Extraordinario", precio: 490000  },
    { descripcion: "Ataud para Tierra Extraordinario",      precio: 8800000 },
    { descripcion: "Diferencia por Cambio de Ataud 15",     precio: 227000  },
    { descripcion: "Diferencia por Cambio de Ataud Semi",   precio: 262000  },
    { descripcion: "Diferencia por Cambio de Ataud Extra",  precio: 460000  },
    { descripcion: "Ataud Angelito Nicho 2",                precio: 330000  },
    { descripcion: "Ataud Angelito Nicho 4",                precio: 345000  },
    { descripcion: "Ataud Angelito Nicho 6",                precio: 350000  },
    { descripcion: "Ataud Angelito Nicho 8",                precio: 390000  },
    { descripcion: "Ataud Angelito Nicho 10",               precio: 430000  },
    { descripcion: "Ataud Angelito Nicho 12",               precio: 505000  },
  ];

  document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-AR");

  // ── Cálculo del total ───────────────────────────────────────────────────
  function calcularTotal() {
    let total = 0;
    detalle.querySelectorAll(".item-row").forEach(row => {
      const cantidad = parseFloat(row.querySelector(".cantidad").value) || 0;
      const precio   = parseFloat(row.querySelector(".precio").textContent) || 0;
      const subtotal = cantidad * precio;
      row.querySelector(".importe").textContent = subtotal.toFixed(0);
      total += subtotal;
    });
    totalEl.textContent = total.toLocaleString("es-AR");
    return total;
  }

  // ── Obtener ítems seleccionados con datos ───────────────────────────────
  function obtenerItemsSeleccionados() {
    const items = [];
    detalle.querySelectorAll(".item-row").forEach(row => {
      const select   = row.querySelector("select");
      const cantidad = parseInt(row.querySelector(".cantidad").value) || 0;
      const precio   = parseFloat(row.querySelector(".precio").textContent) || 0;
      if (select.value && cantidad > 0) {
        items.push({
          descripcion: select.value,
          cantidad,
          precio,
          importe: cantidad * precio,
        });
      }
    });
    return items;
  }

  // ── Agregar fila de ítem ────────────────────────────────────────────────
  function agregarFila() {
    const fila = document.createElement("div");
    fila.className = "item-row";

    const idUnico = Date.now() + Math.floor(Math.random() * 1000);

    // Select
    const select = document.createElement("select");
    select.id = `select-item-${idUnico}`;
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "-- Seleccione ítem --";
    select.appendChild(emptyOpt);
    itemsDisponibles.forEach(it => {
      const opt = document.createElement("option");
      opt.value = it.descripcion;
      opt.textContent = it.descripcion;
      opt.dataset.precio = it.precio;
      select.appendChild(opt);
    });

    // Input cantidad
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min  = "1";
    inputCantidad.value = "1";
    inputCantidad.className = "cantidad";
    inputCantidad.id = `cantidad-item-${idUnico}`;
    inputCantidad.setAttribute("aria-label", "Cantidad");

    // Precio (label visual)
    const labelPrecio = document.createElement("label");
    labelPrecio.textContent = "0";
    labelPrecio.className = "precio";
    labelPrecio.setAttribute("for", `cantidad-item-${idUnico}`);
    labelPrecio.setAttribute("aria-label", "Precio unitario");

    // Subtotal (label visual)
    const labelImporte = document.createElement("label");
    labelImporte.textContent = "0";
    labelImporte.className = "importe";
    labelImporte.setAttribute("aria-label", "Subtotal");

    // Botón eliminar — CLASE, no ID (permite múltiples instancias)
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "❌";
    btnEliminar.className = "btn-eliminar-fila";
    btnEliminar.setAttribute("aria-label", "Eliminar ítem");

    fila.appendChild(select);
    fila.appendChild(inputCantidad);
    fila.appendChild(labelPrecio);
    fila.appendChild(labelImporte);
    fila.appendChild(btnEliminar);

    detalle.appendChild(fila);

    select.addEventListener("change", () => {
      const selected = select.selectedOptions[0];
      if (!selected.value) {
        labelPrecio.textContent = "0";
      } else {
        labelPrecio.textContent = parseFloat(selected.dataset.precio).toFixed(0);
      }
      calcularTotal();
    });

    inputCantidad.addEventListener("input", calcularTotal);

    btnEliminar.addEventListener("click", () => {
      fila.remove();
      calcularTotal();
    });

    calcularTotal();
  }

  if (btnAgregar)  btnAgregar.addEventListener("click", agregarFila);
  if (btnImprimir) btnImprimir.addEventListener("click", () => window.print());

  // ── Abrir modal de contrato ─────────────────────────────────────────────
  document.getElementById("btn-abrir-contrato")?.addEventListener("click", () => {
    const chkPreexistente = document.getElementById("chkPreexistente");
    const esPreexistente  = chkPreexistente && chkPreexistente.checked;
    const items = obtenerItemsSeleccionados();

    if (items.length === 0 && !esPreexistente) {
      alert("Por favor, agregue al menos un ítem al presupuesto, o marque la casilla de Presupuesto Preexistente.");
      return;
    }

    if (modalInstancia) {
      formContrato.reset();
      // Ocultar secciones condicionales al abrir
      ["contenedorCuotas", "camposGarante", "camposPreexistentes"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
      modalInstancia.show();
    }
  });

  // ── Reset del modal ─────────────────────────────────────────────────────
  function resetearModal() {
    if (modalInstancia) modalInstancia.hide();
    formContrato.reset();
    ["contenedorCuotas", "camposGarante", "camposPreexistentes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    ["chkGarante", "chkPreexistente"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    generarEstampaInicial();
  }

  // ── Construcción de documentos HTML para impresión ─────────────────────
  function generarEstructurasDocumentos() {
    const nombreTitular     = document.getElementById("c-nombre")?.value || "Sin Nombre";
    const dniTitular        = document.getElementById("c-dni")?.value    || "—";
    const domicilioTitular  = document.getElementById("c-domicilio")?.value || "—";
    const metodoPago        = document.getElementById("metodoPago")?.value  || "Efectivo";
    const cuotasSeleccionadas = parseInt(document.getElementById("cantidadCuotas")?.value) || 3;

    const chkGarante    = document.getElementById("chkGarante");
    const tieneGarante  = chkGarante && chkGarante.checked;
    const gNombre    = document.getElementById("g-nombre")?.value    || "—";
    const gDni       = document.getElementById("g-dni")?.value       || "—";
    const gDomicilio = document.getElementById("g-domicilio")?.value || "—";
    const gTelefono  = document.getElementById("g-telefono")?.value  || "—";

    const fechaActualTexto = new Date().toLocaleDateString("es-AR");
    let numeroSerie   = numeroPresupuestoAuto;
    let totalContrato = calcularTotal();
    const itemsContrato = obtenerItemsSeleccionados();

    const chkPreexistente = document.getElementById("chkPreexistente");
    if (chkPreexistente?.checked) {
      const manualNro   = document.getElementById("nroPresupuestoManual")?.value;
      const manualMonto = document.getElementById("montoManual")?.value;
      if (manualNro?.trim())          numeroSerie   = manualNro.trim();
      if (manualMonto && !isNaN(parseFloat(manualMonto))) totalContrato = parseFloat(manualMonto);
    }

    // Tabla de ítems
    let tablaHtmlItems = "";
    if (chkPreexistente?.checked) {
      tablaHtmlItems = `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;text-align:left;">Prestaciones Generales de Sepelio (Según Presupuesto N° ${numeroSerie})</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">1</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${totalContrato.toLocaleString("es-AR")}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${totalContrato.toLocaleString("es-AR")}</td>
        </tr>`;
    } else {
      itemsContrato.forEach(it => {
        tablaHtmlItems += `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;text-align:left;">${it.descripcion}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.cantidad}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${it.precio.toLocaleString("es-AR")}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${it.importe.toLocaleString("es-AR")}</td>
          </tr>`;
      });
    }

    // Detalle de pago
    const pagoClave = metodoPago.toLowerCase();
    let detallePagoHtml = "";
    if (pagoClave.includes("plan") || pagoClave.includes("finan")) {
      const valorCuota = Math.round(totalContrato / cuotasSeleccionadas);
      detallePagoHtml = `EL CONTRATANTE se obliga al pago mediante un <strong>Plan de Pago Financiado</strong> de <strong>${cuotasSeleccionadas} cuotas</strong> mensuales de <strong>$${valorCuota.toLocaleString("es-AR")}</strong> cada una, con vencimiento entre los días 10 y 20 de cada mes.`;
    } else if (pagoClave.includes("efectivo y") || pagoClave.includes("combinado")) {
      detallePagoHtml = `EL CONTRATANTE se obliga al pago mediante la modalidad combinada de <strong>Efectivo y Transferencia Bancaria</strong>.`;
    } else if (pagoClave.includes("transferencia")) {
      detallePagoHtml = `EL CONTRATANTE se obliga al pago mediante <strong>Transferencia Bancaria</strong> a las cuentas institucionales habilitadas.`;
    } else {
      detallePagoHtml = `EL CONTRATANTE se obliga al pago en un único pago en <strong>Efectivo</strong>.`;
    }

    const textoItemsBajo = tablaHtmlItems.toLowerCase();
    const incluyeNicho = textoItemsBajo.includes("nicho nuevo") || textoItemsBajo.includes("nicho usado") || textoItemsBajo.includes("arrendamiento");

    let clausulaNichoHtml = "";
    let tituloFirmas = "CUARTA: DECLARACIÓN DE CONFORMIDAD";

    if (incluyeNicho) {
      tituloFirmas = "QUINTA: DECLARACIÓN DE CONFORMIDAD";
      clausulaNichoHtml = `
        <div style="page-break-inside:avoid;">
          <h3 style="border-bottom:2px solid #540d97;color:#540d97;margin-top:12px;margin-bottom:4px;padding-bottom:2px;font-size:12px;font-weight:bold;text-transform:uppercase;">CUARTA: CONCESIÓN Y DERECHOS DE NICHO</h3>
          <p style="font-size:11.5px;margin-bottom:10px;text-align:justify;line-height:1.4;">
            Respecto a los conceptos de arrendamiento o adjudicación de nicho incluidos en el objeto de este contrato, la prestataria otorga el derecho de uso y conservación del espacio designado conforme a los plazos legales establecidos por las ordenanzas municipales vigentes y las reglamentaciones internas de la sección Ces Paz de la Cooperativa.
          </p>
        </div>`;
    }

    let clausulaGaranteHtml = "";
    if (tieneGarante) {
      tituloFirmas = incluyeNicho ? "SEXTA: DECLARACIÓN DE CONFORMIDAD" : "QUINTA: DECLARACIÓN DE CONFORMIDAD";
      const numClausula = incluyeNicho ? "QUINTA" : "CUARTA BIS";
      clausulaGaranteHtml = `
        <div style="page-break-inside:avoid;">
          <h3 style="border-bottom:2px solid #540d97;color:#540d97;margin-top:12px;margin-bottom:4px;padding-bottom:2px;font-size:12px;font-weight:bold;text-transform:uppercase;">${numClausula}: GARANTÍA Y FIANZA SOLIDARIA</h3>
          <p style="font-size:11.5px;margin-bottom:10px;text-align:justify;line-height:1.4;">
            Se constituye como Garante liso, llano y principal pagador a <strong>${gNombre}</strong>, DNI N° <strong>${gDni}</strong>, domicilio en <strong>${gDomicilio}</strong>, teléfono <strong>${gTelefono}</strong>. El/la Garante asume responsabilidad solidaria sobre el total adeudado, renunciando a los beneficios de exclusión y división de bienes.
          </p>
        </div>`;
    }

    const bannerHtml = `
      <div style="width:100%;text-align:center;margin-bottom:15px;">
        <img src="logo.png" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;" alt="CESPAZ">
      </div>`;

    const footerHtml = `
      <div style="width:100%;margin-top:35px;padding-top:6px;border-top:1px solid #ccc;text-align:center;font-size:9.5px;color:#444;line-height:1.35;font-family:Arial,sans-serif;clear:both;page-break-inside:avoid;">
        <p style="margin:2px 0;">Belgrano 3384 (7260) - Saladillo - Bs.As. | Tel: (2345) 65-3131</p>
        <p style="margin:2px 0;">e-mail: serviciossociales@coopsal.com.ar | www.coopsal.com.ar/CESPAZ</p>
      </div>`;

    // ── Documento Presupuesto ──
    const elPresupuesto = document.createElement("div");
    Object.assign(elPresupuesto.style, { width:"100%", fontFamily:"Arial,sans-serif", color:"#222", padding:"10px", backgroundColor:"#fff" });
    elPresupuesto.innerHTML = `
      ${bannerHtml}
      <div style="text-align:center;margin-bottom:15px;">
        <h1 style="margin:0;color:#540d97;font-size:20px;font-weight:bold;text-transform:uppercase;">PRESUPUESTO DE PRESTACIONES</h1>
        <p style="margin:3px 0;color:#e65c00;font-size:13px;font-weight:bold;">N° SERIE: ${numeroSerie}</p>
        <p style="margin:2px 0;color:#565656;font-size:11px;">Saladillo — Fecha: ${fechaActualTexto}</p>
      </div>
      <div style="background:#fcfcfc;padding:10px;border:1px solid #ddd;border-radius:4px;margin-bottom:15px;font-size:12px;">
        <strong>Destinatario / Titular:</strong> ${nombreTitular}<br>
        <strong>Documento:</strong> ${dniTitular} | <strong>Domicilio:</strong> ${domicilioTitular}
      </div>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:11.5px;margin-bottom:15px;">
        <thead>
          <tr style="background-color:#540d97;color:#fff;">
            <th style="padding:7px;text-align:left;width:50%;">Descripción / Concepto</th>
            <th style="padding:7px;text-align:center;width:10%;">Cant.</th>
            <th style="padding:7px;text-align:right;width:20%;">P. Unitario</th>
            <th style="padding:7px;text-align:right;width:20%;">Importe</th>
          </tr>
        </thead>
        <tbody>${tablaHtmlItems}</tbody>
        <tfoot>
          <tr style="font-weight:bold;background-color:#f5f5f5;">
            <td colspan="3" style="padding:7px;border:1px solid #ddd;text-align:right;">Monto Total:</td>
            <td style="padding:7px;border:1px solid #ddd;text-align:right;color:#540d97;">$${totalContrato.toLocaleString("es-AR")}</td>
          </tr>
        </tfoot>
      </table>
      ${footerHtml}`;

    // ── Documento Contrato ──
    const elContrato = document.createElement("div");
    Object.assign(elContrato.style, { width:"100%", fontFamily:"Arial,sans-serif", color:"#222", padding:"10px", backgroundColor:"#fff" });
    elContrato.innerHTML = `
      ${bannerHtml}
      <div style="text-align:center;margin-bottom:15px;">
        <h1 style="margin:0;color:#540d97;font-size:19px;font-weight:bold;text-transform:uppercase;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
        <p style="margin:2px 0;color:#565656;font-size:11px;">Vinculado al Presupuesto N° ${numeroSerie}</p>
      </div>
      <p style="font-size:11.5px;margin-bottom:10px;text-align:justify;line-height:1.45;">
        Conste por el presente documento el <strong>Contrato de Prestación de Servicios Particulares</strong> entre la empresa y el/la <strong>Sr./Sra. ${nombreTitular}</strong>, bajo las siguientes cláusulas:
      </p>
      <h3 style="border-bottom:2px solid #540d97;color:#540d97;font-size:12px;font-weight:bold;text-transform:uppercase;">PRIMERA: PARTES CONTRATANTES</h3>
      <p style="font-size:11.5px;margin-bottom:12px;line-height:1.4;">Tomador: <strong>${nombreTitular}</strong>, DNI N° <strong>${dniTitular}</strong>, Domicilio: <strong>${domicilioTitular}</strong>.</p>
      <h3 style="border-bottom:2px solid #540d97;color:#540d97;font-size:12px;font-weight:bold;text-transform:uppercase;">SEGUNDA: OBJETO Y VALOR</h3>
      <p style="font-size:11.5px;margin-bottom:12px;line-height:1.4;">Suministrar prestaciones según <strong>Presupuesto N° ${numeroSerie}</strong> por un valor de <strong>$${totalContrato.toLocaleString("es-AR")}</strong>.</p>
      <h3 style="border-bottom:2px solid #540d97;color:#540d97;font-size:12px;font-weight:bold;text-transform:uppercase;">TERCERA: MODALIDAD DE PAGO</h3>
      <p style="font-size:11.5px;margin-bottom:6px;line-height:1.45;">${detallePagoHtml}</p>
      ${clausulaNichoHtml}
      ${clausulaGaranteHtml}
      <div style="page-break-inside:avoid;">
        <h3 style="border-bottom:2px solid #540d97;color:#540d97;font-size:12px;font-weight:bold;text-transform:uppercase;">${tituloFirmas}</h3>
        <p style="font-size:11.5px;margin-bottom:15px;line-height:1.4;">En prueba de conformidad, se firman ejemplares en la localidad de Saladillo.</p>
        <div style="margin-top:55px;width:100%;display:block;clear:both;margin-bottom:10px;page-break-inside:avoid;">
          <div style="width:30%;float:left;text-align:center;border-top:1px solid #222;padding-top:6px;">
            <p style="margin:0;font-size:11px;font-weight:bold;">Firma del Contratante</p>
          </div>
          ${tieneGarante ? `
          <div style="width:30%;float:left;margin-left:5%;text-align:center;border-top:1px solid #222;padding-top:6px;">
            <p style="margin:0;font-size:11px;font-weight:bold;">Firma del Garante</p>
          </div>` : ""}
          <div style="width:30%;float:right;text-align:center;border-top:1px solid #222;padding-top:6px;">
            <p style="margin:0;font-size:11px;font-weight:bold;">Por la Empresa</p>
          </div>
          <div style="clear:both;"></div>
        </div>
      </div>
      ${footerHtml}`;

    return {
      elementoPresupuesto: elPresupuesto,
      elementoContrato:    elContrato,
      nombreArchivoSerie:  numeroSerie.replace(/[^a-zA-Z0-9-_]/g, "_"),
      nombreTitularLimpio: nombreTitular.replace(/\s+/g, "_"),
    };
  }

  // ── Botón Imprimir Documentos ───────────────────────────────────────────
  document.getElementById("btnImprimirContrato")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!formContrato.checkValidity()) { formContrato.reportValidity(); return; }

    const docs = generarEstructurasDocumentos();

    const contenedorTemporal = document.createElement("div");
    contenedorTemporal.id = "zona-impresion-temporal";
    contenedorTemporal.innerHTML = `
      <style>
        #zona-impresion-temporal { display: none; }
        @media print {
          body > *:not(#zona-impresion-temporal) { display: none !important; }
          #zona-impresion-temporal {
            display: block !important;
            position: absolute;
            left: 0; top: 0;
            width: 100%;
          }
          .salto-pagina { page-break-before: always; }
        }
      </style>
      <div>${docs.elementoPresupuesto.innerHTML}</div>
      <div class="salto-pagina"></div>
      <div>${docs.elementoContrato.innerHTML}</div>
    `;

    document.body.appendChild(contenedorTemporal);
    window.print();

    setTimeout(() => {
      contenedorTemporal.remove();
      resetearModal();
    }, 500);
  });
});
