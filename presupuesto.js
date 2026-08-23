function generarEstructurasDocumentos() {
  // 1. Captura de Datos del Solicitante / Contratante
  const nombreSolicitante = document.getElementById("c-nombre")?.value.trim() || "Sin Nombre";
  const dniSolicitante = document.getElementById("c-dni")?.value.trim() || "—";
  const domicilioSolicitante = document.getElementById("c-domicilio")?.value.trim() || "—";

  // 2. Captura del Fallecido (Destinatario del Presupuesto principal)
  // Se busca prioritariamente en el input del encabezado del presupuesto
  const elFallecidoInput = document.getElementById("destinatario") || 
                           document.querySelector('input[placeholder*="Bolaños"]') ||
                           document.getElementById("c-fallecido");
                           
  const nombreFallecido = elFallecidoInput && elFallecidoInput.value.trim() !== "" 
                          ? elFallecidoInput.value.trim() 
                          : "—";

  // 3. Captura precisa del Método de Pago y Cuotas
  const selectMetodo = document.getElementById("metodoPago");
  let valorMetodo = "";
  let textoMetodo = "";

  if (selectMetodo) {
    valorMetodo = (selectMetodo.value || "").toLowerCase().trim();
    if (selectMetodo.selectedIndex >= 0) {
      textoMetodo = (selectMetodo.options[selectMetodo.selectedIndex].text || "").toLowerCase().trim();
    }
  }

  const inputCuotas = document.getElementById("cantidadCuotas") || document.getElementById("c-cuotas");
  const cuotasSeleccionadas = inputCuotas ? (parseInt(inputCuotas.value, 10) || 1) : 1;

  // 4. Captura de Garante
  const chkGarante = document.getElementById("chkGarante");
  const tieneGarante = chkGarante && chkGarante.checked;
  const gNombre = document.getElementById("g-nombre")?.value.trim() || "—";
  const gDni = document.getElementById("g-dni")?.value.trim() || "—";
  const gDomicilio = document.getElementById("g-domicilio")?.value.trim() || "—";
  const gTelefono = document.getElementById("g-telefono")?.value.trim() || "—";

  const fechaActualTexto = new Date().toLocaleDateString("es-AR");

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

  // Generación de Filas de la Tabla
  let tablaHtmlItems = "";
  if (chkPreexistente && chkPreexistente.checked) {
    tablaHtmlItems = `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">Prestaciones Generales de Sepelio (Según Presupuesto N° ${numeroSerie})</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">1</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${totalContrato.toLocaleString("es-AR")}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${totalContrato.toLocaleString("es-AR")}</td>
      </tr>
    `;
  } else {
    itemsContrato.forEach(it => {
      tablaHtmlItems += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${it.descripcion}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${it.precio.toLocaleString("es-AR")}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${it.importe.toLocaleString("es-AR")}</td>
        </tr>
      `;
    });
  }

  // LÓGICA DE DETECCIÓN DE FORMA DE PAGO
  let detallePagoHtml = "";

  const esCuotas = valorMetodo.includes("cuota") || valorMetodo.includes("plan") || valorMetodo.includes("finan") || 
                   textoMetodo.includes("cuota") || textoMetodo.includes("plan") || textoMetodo.includes("finan") || 
                   cuotasSeleccionadas > 1;

  const esTransferencia = valorMetodo.includes("transf") || valorMetodo.includes("banco") || 
                          textoMetodo.includes("transf") || textoMetodo.includes("banco");

  const esCombinado = valorMetodo.includes("combin") || valorMetodo.includes("mixto") || 
                      textoMetodo.includes("combin") || textoMetodo.includes("mixto") ||
                      (textoMetodo.includes("efectivo") && textoMetodo.includes("transf"));

  if (esCuotas) {
    const valorCuota = Math.round(totalContrato / cuotasSeleccionadas);
    detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante un <strong>Plan de Pago Financiado</strong> de <strong>${cuotasSeleccionadas} cuotas</strong> mensuales y consecutivas, ascendiendo cada una de ellas a un importe de <strong>$${valorCuota.toLocaleString("es-AR")}</strong>. Dichas cuotas tendrán un vencimiento perentorio a abonar <strong>entre los días 10 y 20 de cada mes</strong> calendario de forma sucesiva.`;
  } else if (esCombinado) {
    detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante la modalidad combinada de <strong>Efectivo y Transferencia Bancaria</strong> (detalles específicos registrados en el apartado de observaciones comerciales).`;
  } else if (esTransferencia) {
    detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante <strong>Transferencia Bancaria</strong> a las cuentas institucionales habilitadas por la prestataria.`;
  } else {
    detallePagoHtml = `EL CONTRATANTE se obliga al cumplimiento del pago asignado en <strong>1 pago</strong> en <strong>Efectivo</strong> por la totalidad del monto establecido en la sede de la administración.`;
  }

  const textoItemsMinuscula = tablaHtmlItems.toLowerCase();
  const incluyeNichoReal = textoItemsMinuscula.includes("nicho nuevo") || textoItemsMinuscula.includes("nicho usado") || textoItemsMinuscula.includes("arrendamiento");
  
  let clausulaNichoHtml = "";
  let tituloClausulaFirmas = "QUINTA: DECLARACIÓN DE CONFORMIDAD";

  if (incluyeNichoReal) {
    tituloClausulaFirmas = "SEXTA: DECLARACIÓN DE CONFORMIDAD";
    clausulaNichoHtml = `
      <div style="page-break-inside: avoid;">
        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 12px; margin-bottom: 4px; padding-bottom: 2px; font-size: 12px; font-weight: bold; text-transform: uppercase;">QUINTA: CONCESIÓN Y DERECHOS DE NICHO</h3>
        <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; margin-top: 0; line-height: 1.4;">
          Respecto a los conceptos de arrendamiento o adjudicación de nicho incluidos en el objeto de este contrato, la prestataria otorga el derecho de uso y conservación del espacio designado conforme a los plazos legales establecidos por las ordenanzas municipales vigentes y las reglamentaciones internas de la sección cementerio de la Cooperativa. Cumplido dicho plazo contractual u ordinario, los familiares o responsables directos deberán solicitar la renovación del arrendamiento o, en su defecto, determinar el destino de los restos según los protocolos vigentes.
        </p>
      </div>
    `;
  }

  let clausulaGaranteHtml = "";
  if (tieneGarante) {
    tituloClausulaFirmas = incluyeNichoReal ? "SÉPTIMA: DECLARACIÓN DE CONFORMIDAD" : "SEXTA: DECLARACIÓN DE CONFORMIDAD";
    clausulaGaranteHtml = `
      <div style="page-break-inside: avoid;">
        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 12px; margin-bottom: 4px; padding-bottom: 2px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${incluyeNichoReal ? 'SEXTA' : 'QUINTA'}: GARANTÍA Y FIANZA SOLIDARIA</h3>
        <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; margin-top: 0; line-height: 1.4;">
          Se constituye como Garante liso, llano y principal pagador de todas las obligaciones derivadas del presente contrato al/la <strong>Sr./Sra. ${gNombre}</strong>, DNI N° <strong>${gDni}</strong>, con domicilio legal en <strong>${gDomicilio}</strong> y teléfono <strong>${gTelefono}</strong>. El/la Garante asume la responsabilidad solidaria y directa sobre el total de los importes adeudados en caso de que EL CONTRATANTE no realice el o los pagos en el tiempo y forma estipulados, renunciando a los beneficios de exclusión y división de bienes.
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

  // ESTRUCTURA PRESUPUESTO
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
      <strong>Solicitante:</strong> ${nombreSolicitante} | <strong>DNI:</strong> ${dniSolicitante} | <strong>Domicilio:</strong> ${domicilioSolicitante}<br>
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

  // ESTRUCTURA CONTRATO
  const elContrato = document.createElement("div");
  elContrato.style.width = "100%"; elContrato.style.fontFamily = "Arial, sans-serif"; elContrato.style.color = "#222222"; elContrato.style.padding = "10px"; elContrato.style.backgroundColor = "#ffffff";
  elContrato.innerHTML = `
    ${bannerHtml}
    <div style="text-align: center; margin-bottom: 15px;">
      <h1 style="margin: 0; color: #540d97; font-size: 19px; font-weight: bold; text-transform: uppercase;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
      <p style="margin: 2px 0; color: #565656; font-size: 11px;">Vinculado al Presupuesto N° ${numeroSerie}</p>
    </div>
    <p style="font-size: 11.5px; margin-bottom: 10px; text-align: justify; line-height: 1.45;">
      Conste por el presente documento el <strong>Contrato de Prestación de Servicios Particulares</strong> entre la empresa y el/la <strong>Sr./Sra. ${nombreSolicitante}</strong>, bajo las siguientes cláusulas:
    </p>
    
    <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">ARTÍCULO 1: OBJETO DEL SERVICIO</h3>
    <p style="font-size: 11.5px; margin-bottom: 12px; line-height: 1.45; text-align: justify;">
      El servicio será prestado para el fallecido: <strong>${nombreFallecido}</strong>; solicitado por <strong>${nombreSolicitante}</strong> (DNI N° <strong>${dniSolicitante}</strong>, Domicilio: <strong>${domicilioSolicitante}</strong>) el día de la fecha <strong>${fechaActualTexto}</strong>.
    </p>

    <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">SEGUNDA: PARTES Y REPRESENTACIÓN</h3>
    <p style="font-size: 11.5px; margin-bottom: 12px; line-height: 1.4;">
      EL CONTRATANTE / SOLICITANTE declara bajo juramento actuar en representación directa y legal de los familiares con derecho a disponer sobre las exequias y prestaciones solicitadas.
    </p>

    <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">TERCERA: MONTO Y PRESTACIONES</h3>
    <p style="font-size: 11.5px; margin-bottom: 12px; line-height: 1.4;">
      Las prestaciones quedan detalladas en el <strong>Presupuesto N° ${numeroSerie}</strong> por un importe total pactado de <strong>$${totalContrato.toLocaleString("es-AR")}</strong>.
    </p>

    <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">CUARTA: MODALIDAD DE PAGO</h3>
    <p style="font-size: 11.5px; margin-bottom: 6px; line-height: 1.45;">${detallePagoHtml}</p>

    ${clausulaNichoHtml}
    ${clausulaGaranteHtml}

    <div style="page-break-inside: avoid;">
      <h3 style="border-bottom: 2px solid #540d97; color: #540d97; font-size: 12px; font-weight: bold; text-transform: uppercase;">${tituloClausulaFirmas}</h3>
      <p style="font-size: 11.5px; margin-bottom: 15px; line-height: 1.4;">En prueba de conformidad, se firman ejemplares en la localidad de Saladillo.</p>
      
      <div style="margin-top: 55px; width: 100%; display: block; clear: both; margin-bottom: 10px; page-break-inside: avoid;">
        <div style="width: 30%; float: left; text-align: center; border-top: 1px solid #222222; padding-top: 6px;">
          <p style="margin: 0; font-size: 11px; font-weight: bold;">Firma del Solicitante</p>
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
    nombreTitularLimpio: nombreSolicitante.replace(/\s+/g, '_')
  };
}
