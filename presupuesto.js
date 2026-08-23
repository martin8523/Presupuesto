document.addEventListener("DOMContentLoaded", () => {
  const detalle = document.getElementById("detalle-items");
  const btnAgregar = document.getElementById("btn-agregar");
  const btnImprimir = document.getElementById("btn-imprimir");
  const totalEl = document.getElementById("total");

  // ELEMENTOS PARA EL MODAL Y CONTRATO
  const btnAbrirContrato = document.getElementById("btn-abrir-contrato");
  const formContrato = document.getElementById("form-contrato");
  let modalInstancia = null;

  // Generación única de la estampa numérica al cargar la página (PR- + 3 cifras aleatorias + MM + AAAA)
  let numeroPresupuestoAuto = "";
  function generarEstampaInicial() {
    const aleatorio = Math.floor(100 + Math.random() * 900); // Fijo 3 dígitos
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    numeroPresupuestoAuto = `PR-${aleatorio}${mes}${anio}`;
    
    const contenedorEstampa = document.getElementById("nro-presupuesto-estampa");
    if (contenedorEstampa) {
      contenedorEstampa.innerText = numeroPresupuestoAuto;
    }
  }
  generarEstampaInicial();

  // Inicializar el modal de Bootstrap si existe en el DOM
  if (typeof bootstrap !== 'undefined' && document.getElementById('modalContrato')) {
    modalInstancia = new bootstrap.Modal(document.getElementById('modalContrato'));
  }

  // LISTENERS PARA MOSTRAR/OCULTAR CAMPOS SEGÚN EL MÉTODO DE PAGO
  const selectMetodoPago = document.getElementById("metodoPago");
  const divCuotas = document.getElementById("contenedorCuotas");
  const divCombinado = document.getElementById("contenedorCombinado");

  if (selectMetodoPago) {
    selectMetodoPago.addEventListener("change", () => {
      const val = selectMetodoPago.value.toLowerCase();
      
      // Control de contenedor de Cuotas
      if (divCuotas) {
        divCuotas.style.display = (val.includes("plan") || val.includes("cuota") || val.includes("finan")) ? "block" : "none";
      }

      // Control de contenedor Combinado (Efectivo y Transferencia)
      if (divCombinado) {
        divCombinado.style.display = (val.includes("combinado") || val.includes("mixto") || (val.includes("efectivo") && val.includes("transferencia"))) ? "block" : "none";
      }
    });
  }

  const itemsDisponibles = [
    { descripcion: "Ataud para Nicho N° 15", precio: 645000 },
    { descripcion: "Ataud para Nicho Semi-Extraordinario", precio: 752000 },
    { descripcion: "Ataud para Nicho Extraordinario", precio: 1160000 },
    { descripcion: "Nicho Nuevo", precio: 1030000 },
    { descripcion: "Nicho Usado", precio: 515000 },
    { descripcion: "Cremacion", precio: 1180000 },
    { descripcion: "Servicio Velacion 8 Hs ", precio: 3415000 },
    { descripcion: "Hora de Velación", precio: 427000 },
    { descripcion: "Gastos Administrativos", precio: 75000 },
    { descripcion: "Auto Acompañamiento", precio: 125000 },
    { descripcion: "Ataud para Tierra N° 15", precio: 418000 },
    { descripcion: "Ataud para Tierra Semi-Extraordinario", precio: 490000 },
    { descripcion: "Ataud para Tierra Extraordinario", precio: 8800000 },
    { descripcion: "Diferencia por Cambio de Ataud 15", precio: 227000 },
    { descripcion: "Diferencia por Cambio de Ataud Semi", precio: 262000 },
    { descripcion: "Diferencia por Cambio de Ataud Extra", precio: 460000 },
    { descripcion: "Ataud Angelito Nicho 2", precio: 330000 },
    { descripcion: "Ataud Angelito Nicho 4", precio: 345000 },
    { descripcion: "Ataud Angelito Nicho 6", precio: 350000 },
    { descripcion: "Ataud Angelito Nicho 8", precio: 390000 },
    { descripcion: "Ataud Angelito Nicho 10", precio: 430000 },
    { descripcion: "Ataud Angelito Nicho 12", precio: 505000 }
  ];

  const fechaEl = document.getElementById("fecha");
  if (fechaEl) fechaEl.textContent = new Date().toLocaleDateString("es-AR");

  function calcularTotal() {
    let total = 0;
    if (!detalle) return 0;
    detalle.querySelectorAll(".item-row").forEach(row => {
      const cantidad = parseFloat(row.querySelector(".cantidad")?.value) || 0;
      const precio = parseFloat(row.querySelector(".precio")?.textContent) || 0;
      total += cantidad * precio;
      const importeEl = row.querySelector(".importe");
      if (importeEl) importeEl.textContent = (cantidad * precio).toFixed(0);
    });
    if (totalEl) totalEl.textContent = total.toLocaleString("es-AR");
    return total;
  }

  function obtenerItemsSeleccionados() {
    const items = [];
    if (!detalle) return items;
    detalle.querySelectorAll(".item-row").forEach(row => {
      const select = row.querySelector("select");
      const cantidad = parseInt(row.querySelector(".cantidad")?.value) || 0;
      const precio = parseFloat(row.querySelector(".precio")?.textContent) || 0;

      if (select && select.value && cantidad > 0) {
        items.push({
          descripcion: select.value,
          cantidad: cantidad,
          precio: precio,
          importe: cantidad * precio
        });
      }
    });
    return items;
  }

  function agregarFila() {
    if (!detalle) return;
    const fila = document.createElement("div");
    fila.className = "item-row";

    const idUnico = Date.now() + Math.floor(Math.random() * 1000);

    const select = document.createElement("select");
    select.id = `select-item-${idUnico}`;
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "-- Seleccione ítem --";
    select.appendChild(emptyOption);

    itemsDisponibles.forEach(it => {
      const opt = document.createElement("option");
      opt.value = it.descripcion;
      opt.textContent = it.descripcion;
      opt.dataset.precio = it.precio;
      select.appendChild(opt);
    });

    const labelDesc = document.createElement("label");
    labelDesc.textContent = "";
    labelDesc.setAttribute("for", `select-item-${idUnico}`);

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "1";
    inputCantidad.value = "1";
    inputCantidad.className = "cantidad";
    inputCantidad.id = `cantidad-item-${idUnico}`;

    const labelPrecio = document.createElement("label");
    labelPrecio.textContent = "0";
    labelPrecio.className = "precio";
    labelPrecio.setAttribute("for", `cantidad-item-${idUnico}`);

    const labelImporte = document.createElement("label");
    labelImporte.textContent = "0";
    labelImporte.className = "importe";

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "❌";
    btnEliminar.id = "ButonX";

    fila.appendChild(select);
    fila.appendChild(labelDesc);
    fila.appendChild(inputCantidad);
    fila.appendChild(labelPrecio);
    fila.appendChild(labelImporte);
    fila.appendChild(btnEliminar);

    detalle.appendChild(fila);

    select.addEventListener("change", () => {
      const selected = select.selectedOptions[0];
      if (!selected || !selected.value) {
        labelDesc.textContent = "";
        labelPrecio.textContent = "0";
      } else {
        labelDesc.textContent = selected.value;
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

  if (btnAgregar) {
    btnAgregar.addEventListener("click", agregarFila);
  }

  if (btnImprimir) {
    btnImprimir.addEventListener("click", () => {
      window.print();
    });
  }

  // LÓGICA DEL FLUJO DE CONTRATOS
  if (btnAbrirContrato) {
    btnAbrirContrato.addEventListener("click", () => {
      const chkPreexistente = document.getElementById("chkPreexistente");
      const esPreexistente = chkPreexistente && chkPreexistente.checked;
      const items = obtenerItemsSeleccionados();

      if (items.length === 0 && !esPreexistente) {
        alert("Por favor, agregue y seleccione al menos un ítem al presupuesto o marque la casilla de Presupuesto Preexistente antes de generar el contrato.");
        return;
      }
      if (modalInstancia) {
        if (formContrato) formContrato.reset();
        if (divCuotas) divCuotas.style.display = "none";
        if (divCombinado) divCombinado.style.display = "none";
        
        const contGarante = document.getElementById("camposGarante");
        if (contGarante) contGarante.style.display = "none";
        
        modalInstancia.show();
      }
    });
  }

  // FUNCIÓN MAESTRA PARA CONSTRUIR LOS DOCUMENTOS
  function generarEstructurasDocumentos() {
    const nombreTitular = document.getElementById("c-nombre")?.value.trim() || "Sin Nombre";
    const dniTitular = document.getElementById("c-dni")?.value.trim() || "—";
    const domicilioTitular = document.getElementById("c-domicilio")?.value.trim() || "—";
    const telefonoTitular = document.getElementById("c-telefono")?.value.trim() || "—";

    const elFallecidoInput = document.getElementById("destinatario") || 
                             document.querySelector('input[placeholder*="Bolaños"]') ||
                             document.getElementById("c-fallecido");
    const nombreFallecido = elFallecidoInput && elFallecidoInput.value.trim() !== "" 
                            ? elFallecidoInput.value.trim() 
                            : "—";

    const selectMetodo = document.getElementById("metodoPago");
    let metodoPago = selectMetodo ? selectMetodo.value : "Efectivo";

    const inputCuotas = document.getElementById("cantidadCuotas") || document.getElementById("c-cuotas");
    const cuotasSeleccionadas = inputCuotas ? (parseInt(inputCuotas.value, 10) || 1) : 1;

    // Entradas para Pago Combinado
    const montoEfectivoInput = document.getElementById("montoEfectivoCombinado") || document.getElementById("c-monto-efectivo");
    const montoTransferenciaInput = document.getElementById("montoTransferenciaCombinado") || document.getElementById("c-monto-transferencia");
    const valMontoEfectivo = montoEfectivoInput ? (parseFloat(montoEfectivoInput.value) || 0) : 0;
    const valMontoTransferencia = montoTransferenciaInput ? (parseFloat(montoTransferenciaInput.value) || 0) : 0;

    const chkGarante = document.getElementById("chkGarante");
    const tieneGarante = chkGarante && chkGarante.checked;
    const gNombre = document.getElementById("g-nombre")?.value.trim() || "—";
    const gDni = document.getElementById("g-dni")?.value.trim() || "—";
    const gDomicilio = document.getElementById("g-domicilio")?.value.trim() || "—";
    const gTelefono = document.getElementById("g-telefono")?.value.trim() || "—";

    const fechaObjeto = new Date();
    const fechaActualTexto = fechaObjeto.toLocaleDateString("es-AR");

    let numeroSerie = numeroPresupuestoAuto;
    let totalContrato = calcularTotal();
    const itemsContrato = obtenerItemsSeleccionados();

    const chkPreexistente = document.getElementById("chkPreexistente");
    if (chkPreexistente && chkPreexistente.checked) {
      const manualNro = document.getElementById("nroPresupuestoManual")?.value;
      const manualMonto = document.getElementById("montoManual")?.value;
      if (manualNro && manualNro.trim() !== "") numeroSerie = manualNro.trim();
      if (manualMonto && !isNaN(parseFloat(manualMonto))) totalContrato = parseFloat(manualMonto);
    }

    let tablaHtmlItems = "";
    if (chkPreexistente && chkPreexistente.checked) {
      tablaHtmlItems = `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: left; word-wrap: break-word;">Prestaciones Generales de Sepelio (Según Presupuesto N° ${numeroSerie})</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${totalContrato.toLocaleString("es-AR")}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${totalContrato.toLocaleString("es-AR")}</td>
        </tr>
      `;
    } else {
      itemsContrato.forEach(it => {
        tablaHtmlItems += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left; word-wrap: break-word;">${it.descripcion}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.cantidad}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${it.precio.toLocaleString("es-AR")}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${it.importe.toLocaleString("es-AR")}</td>
          </tr>
        `;
      });
    }

    // LÓGICA Y REDACCIÓN DE MODALIDAD DE PAGO
    let detallePagoHtml = "";
    const pagoClave = metodoPago.toLowerCase();

    if (pagoClave.includes("plan") || pagoClave.includes("cuota") || pagoClave.includes("finan")) {
      const valorCuota = Math.round(totalContrato / cuotasSeleccionadas);
      detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante un <strong>Plan de Pago Financiado</strong> de <strong>${cuotasSeleccionadas} cuotas</strong> mensuales y consecutivas, ascendiendo cada una de ellas a un importe de <strong>$${valorCuota.toLocaleString("es-AR")}</strong>. Dichas cuotas tendrán un vencimiento perentorio a abonar <strong>entre los días 10 y 20 de cada mes</strong> calendario de forma sucesiva.`;
    } else if (pagoClave.includes("combinado") || pagoClave.includes("mixto") || (pagoClave.includes("efectivo") && pagoClave.includes("transferencia"))) {
      detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante la modalidad combinada de <strong>Efectivo y Transferencia Bancaria</strong>, abonando la suma de <strong>$${valMontoEfectivo.toLocaleString("es-AR")}</strong> en efectivo y la suma de <strong>$${valMontoTransferencia.toLocaleString("es-AR")}</strong> vía transferencia bancaria a las cuentas habilitadas de la prestataria.`;
    } else if (pagoClave.includes("transferencia") || pagoClave.includes("banco")) {
      detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante <strong>Transferencia Bancaria</strong> a las cuentas institucionales habilitadas por la prestataria por un monto total de <strong>$${totalContrato.toLocaleString("es-AR")}</strong>.`;
    } else {
      // OPCIÓN EFECTIVO
      detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado se abonara en 1 pago al contado el importe de: <strong>$${totalContrato.toLocaleString("es-AR")}</strong>.`;
    }

    const textoItemsMinuscula = tablaHtmlItems.toLowerCase();
    const incluyeNichoReal = textoItemsMinuscula.includes("nicho nuevo") || textoItemsMinuscula.includes("nicho usado") || textoItemsMinuscula.includes("arrendamiento");
    
    let clausulaNichoHtml = "";
    let tituloClausulaFirmas = "CUARTA: DECLARACIÓN DE CONFORMIDAD";

    if (incluyeNichoReal) {
      tituloClausulaFirmas = "QUINTA: DECLARACIÓN DE CONFORMIDAD";
      clausulaNichoHtml = `
        <div style="page-break-inside: avoid;">
          <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 12px; margin-bottom: 4px; padding-bottom: 2px; font-size: 12px; font-weight: bold; text-transform: uppercase;">CUARTA: CONCESIÓN Y DERECHOS DE NICHO</h3>
          <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; margin-top: 0; line-height: 1.4; word-wrap: break-word; white-space: normal;">
            Respecto a los conceptos de arrendamiento o adjudicación de nicho incluidos en el objeto de este contrato, la prestataria otorga el derecho de uso y conservación del espacio designado conforme a los plazos legales establecidos por las ordenanzas municipales vigentes y las reglamentaciones internas de la sección cementerio de la Cooperativa.
          </p>
        </div>
      `;
    }

    let clausulaGaranteHtml = "";
    if (tieneGarante) {
      tituloClausulaFirmas = incluyeNichoReal ? "SEXTA: DECLARACIÓN DE CONFORMIDAD" : "QUINTA: DECLARACIÓN DE CONFORMIDAD";
      clausulaGaranteHtml = `
        <div style="page-break-inside: avoid;">
          <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 12px; margin-bottom: 4px; padding-bottom: 2px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${incluyeNichoReal ? 'QUINTA' : 'CUARTA BIS'}: GARANTÍA Y FIANZA SOLIDARIA</h3>
          <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; margin-top: 0; line-height: 1.4; word-wrap: break-word; white-space: normal;">
            Se constituye como Garante liso, llano y principal pagador de todas las obligaciones derivadas del presente contrato al/la <strong>Sr./Sra. ${gNombre}</strong>, DNI N° <strong>${gDni}</strong>, con domicilio legal en <strong>${gDomicilio}</strong> y teléfono <strong>${gTelefono}</strong>.
          </p>
        </div>
      `;
    }

    const bannerHtml = `
      <div style="width: 100%; text-align: center; margin-bottom: 15px;">
        <img src="logo.png" style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto;" alt="CESPAZ">
      </div>
    `;

    const footerHtml = `
      <div style="width: 100%; margin-top: 35px; padding-top: 6px; border-top: 1px solid #cccccc; text-align: center; font-size: 9.5px; color: #444444; line-height: 1.35; font-family: Arial, sans-serif; clear: both; page-break-inside: avoid;">
        <p style="margin: 2px 0;">12 de Octubre (7260) - Saladillo - Bs.As. | Tel: (2345) 65-3131</p>
        <p style="margin: 2px 0;">e-mail: serviciossociales@coopsal.com.ar | www.coopsal.com.ar/CESPAZ</p>
      </div>
    `;

    const elPresupuesto = document.createElement("div");
    elPresupuesto.style.width = "100%"; elPresupuesto.style.fontFamily = "Arial, sans-serif"; elPresupuesto.style.color = "#222222"; elPresupuesto.style.padding = "10px"; elPresupuesto.style.backgroundColor = "#ffffff";
    elPresupuesto.innerHTML = `
      ${bannerHtml}
      <div style="text-align: center; margin-bottom: 15px;">
        <h1 style="margin: 0; color: #540d97; font-size: 20px; font-weight: bold; text-transform: uppercase;">PRESUPUESTO DE PRESTACIONES</h1>
        <p style="margin: 3px 0; color: #e65c00; font-size: 13px; font-weight: bold;">N° SERIE: ${numeroSerie}</p>
        <p style="margin: 2px 0; color: #565656; font-size: 11px;">Saladillo — Fecha: ${fechaActualTexto}</p>
      </div>
      <div style="background-color: #fcfcfc; padding: 10px; border: 1px solid #dddddd; border-radius: 4px; margin-bottom: 15px; font-size: 12px; line-height: 1.5;">
        <strong>Solicitante:</strong> ${nombreTitular} | <strong>DNI:</strong> ${dniTitular} | <strong>Domicilio:</strong> ${domicilioTitular}<br>
        <strong>Destinatario (Fallecido/a):</strong> ${nombreFallecido}
      </div>
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11.5px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #540d97; color: #ffffff;">
            <th style="padding: 7px; text-align: left; width: 50%;">Descripción / Concepto</th>
            <th style="padding: 7px; text-align: center; width: 10%;">Cant.</th>
            <th style="padding: 7px; text-align: right; width: 20%;">P. Unitario</th>
            <th style="padding: 7px; text-align: right; width: 20%;">Importe</th>
          </tr>
        </thead>
        <tbody>${tablaHtmlItems}</tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <td colspan="3" style="padding: 7px; border: 1px solid #dddddd; text-align: right;">Monto Total:</td>
            <td style="padding: 7px; border: 1px solid #dddddd; text-align: right; color: #540d97;">$${totalContrato.toLocaleString("es-AR")}</td>
          </tr>
        </tfoot>
      </table>
      ${footerHtml}
    `;

    const elContrato = document.createElement("div");
    elContrato.style.width = "100%"; elContrato.style.fontFamily = "Arial, sans-serif"; elContrato.style.color = "#222222"; elContrato.style.padding = "10px"; elContrato.style.backgroundColor = "#ffffff";
    elContrato.innerHTML = `
      ${bannerHtml}
      <div style="text-align: center; margin-bottom: 15px;">
        <h1 style="margin: 0; color: #540d97; font-size: 19px; font-weight: bold; text-transform: uppercase;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
        <p style="margin: 2px 0; color: #565656; font-size: 11px;">Vinculado al Presupuesto N° ${numeroSerie}</p>
      </div>
      <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; line-height: 1.45;">
        Conste por el presente documento el <strong>Contrato de Prestación de Servicios Particulares</strong> entre la empresa y el/la <strong>Sr./Sra. ${nombreTitular}</strong>, bajo las siguientes cláusulas:
      </p>
      <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">PRIMERA: PARTES CONTRATANTES Y DESTINATARIO</h3>
      <p style="font-size: 11.5px; margin-bottom: 12px; line-height: 1.4;">
        Solicitante: <strong>${nombreTitular}</strong>, DNI N° <strong>${dniTitular}</strong>, Domicilio: <strong>${domicilioTitular}</strong>.<br>
        Servicio solicitado para el/la extinto/a: <strong>${nombreFallecido}</strong>.
      </p>
      <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">SEGUNDA: OBJETO Y VALOR</h3>
      <p style="font-size: 11.5px; margin-bottom: 12px; line-height: 1.4;">Suministrar prestaciones según <strong>Presupuesto N° ${numeroSerie}</strong> por un valor de <strong>$${totalContrato.toLocaleString("es-AR")}</strong>.</p>
      <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">TERCERA: MODALIDAD DE PAGO</h3>
      <p style="font-size: 11.5px; margin-bottom: 6px; line-height: 1.45;">${detallePagoHtml}</p>
      ${clausulaNichoHtml}
      ${clausulaGaranteHtml}
      <div style="page-break-inside: avoid;">
        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">${tituloClausulaFirmas}</h3>
        <p style="font-size: 11.5px; margin-bottom: 15px; line-height: 1.4;">En prueba de conformidad, se firman ejemplares en la localidad de Saladillo.</p>
        
        <div style="margin-top: 55px; width: 100%; display: block; clear: both; margin-bottom: 10px; page-break-inside: avoid;">
          <div style="width: 30%; float: left; text-align: center; border-top: 1px solid #222222; padding-top: 6px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold;">Firma del Contratante</p>
          </div>
          
          ${tieneGarante ? `
          <div style="width: 30%; float: left; margin-left: 5%; text-align: center; border-top: 1px solid #222222; padding-top: 6px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold;">Firma del Garante</p>
          </div>
          ` : ''}
          
          <div style="width: 30%; float: right; text-align: center; border-top: 1px solid #222222; padding-top: 6px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold;">Por la Empresa</p>
          </div>
          <div style="clear: both;"></div>
        </div>
      </div>
      ${footerHtml}
    `;

    return { 
      elementoPresupuesto: elPresupuesto, 
      elementoContrato: elContrato, 
      nombreArchivoSerie: numeroSerie.replace(/[^a-zA-Z0-9-_]/g, '_'),
      nombreTitularLimpio: nombreTitular.replace(/\s+/g, '_')
    };
  }

  function resetearModalLuegoDeAccion() {
    if (modalInstancia) modalInstancia.hide();
    if (formContrato) formContrato.reset();
    
    if (divCuotas) divCuotas.style.display = "none";
    if (divCombinado) divCombinado.style.display = "none";

    const chkPreexistente = document.getElementById("chkPreexistente");
    if (chkPreexistente) chkPreexistente.checked = false;
    const contCampos = document.getElementById("camposPreexistentes");
    if (contCampos) contCampos.style.display = "none";
    
    const chkGaranteReset = document.getElementById("chkGarante");
    if (chkGaranteReset) chkGaranteReset.checked = false;
    const contGarante = document.getElementById("camposGarante");
    if (contGarante) contGarante.style.display = "none";

    generarEstampaInicial();
  }

  const configuracionPdfNativa = {
    margin: [15, 15, 15, 15],
    image: { type: 'jpeg', quality: 1.0 }, 
    html2canvas: { scale: 3, logging: false, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['css', 'avoid-all'] } 
  };

  // BOTÓN IMPRIMIR DESDE MODAL
  const btnImprimirContrato = document.getElementById("btnImprimirContrato");
  if (btnImprimirContrato) {
    btnImprimirContrato.addEventListener("click", (evento) => {
      evento.preventDefault();
      if (formContrato && !formContrato.checkValidity()) { 
        formContrato.reportValidity(); 
        return; 
      }

      const docs = generarEstructurasDocumentos();

      const contenedorTemporal = document.createElement("div");
      contenedorTemporal.id = "zona-impresion-temporal";
      
      contenedorTemporal.innerHTML = `
        <style>
          #zona-impresion-temporal {
            display: none;
          }
          @media print {
            body > * {
              display: none !important;
            }
            #zona-impresion-temporal {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .salto-pagina { 
              page-break-before: always; 
            }
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
        resetearModalLuegoDeAccion();
      }, 500); 
    });
  }

  // BOTÓN DESCARGAR PDF DESDE MODAL
  const btnDescargarContrato = document.getElementById("btnDescargarContrato");
  if (btnDescargarContrato) {
    btnDescargarContrato.addEventListener("click", (evento) => {
      evento.preventDefault();
      if (formContrato && !formContrato.checkValidity()) { 
        formContrato.reportValidity(); 
        return; 
      }

      const docs = generarEstructurasDocumentos();

      const optP = { ...configuracionPdfNativa, filename: `Presupuesto_${docs.nombreArchivoSerie}.pdf` };
      const optC = { ...configuracionPdfNativa, filename: `Contrato_${docs.nombreTitularLimpio}.pdf` };

      if (typeof html2pdf !== "undefined") {
        html2pdf().set(optP).from(docs.elementoPresupuesto).save().then(() => {
          return html2pdf().set(optC).from(docs.elementoContrato).save();
        }).then(() => {
          resetearModalLuegoDeAccion();
        }).catch(err => {
          console.error("Error al generar PDF:", err);
        });
      } else {
        alert("La librería html2pdf no está disponible.");
      }
    });
  }
});
