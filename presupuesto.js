document.addEventListener("DOMContentLoaded", () => {
  const detalle = document.getElementById("detalle-items");
  const btnAgregar = document.getElementById("btn-agregar");
  const btnImprimir = document.getElementById("btn-imprimir");
  const totalEl = document.getElementById("total");

  // NUEVOS ELEMENTOS PARA EL MODAL Y CONTRATO
  const btnAbrirContrato = document.getElementById("btn-abrir-contrato");
  const btnFinalizarContrato = document.getElementById("btn-finalizar-contrato");
  const formContrato = document.getElementById("form-contrato");
  let modalInstancia = null;

  // Inicializar el modal de Bootstrap si existe en el DOM
  if (typeof bootstrap !== 'undefined' && document.getElementById('modalContrato')) {
    modalInstancia = new bootstrap.Modal(document.getElementById('modalContrato'));
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

  document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-AR");

  function calcularTotal() {
    let total = 0;
    detalle.querySelectorAll(".item-row").forEach(row => {
      const cantidad = parseFloat(row.querySelector(".cantidad").value) || 0;
      const precio = parseFloat(row.querySelector(".precio").textContent) || 0;
      total += cantidad * precio;
      row.querySelector(".importe").textContent = (cantidad * precio).toFixed(0);
    });
    totalEl.textContent = total.toLocaleString("es-AR");
    return total;
  }

  function obtenerItemsSeleccionados() {
    const items = [];
    detalle.querySelectorAll(".item-row").forEach(row => {
      const select = row.querySelector("select");
      const cantidad = parseInt(row.querySelector(".cantidad").value) || 0;
      const precio = parseFloat(row.querySelector(".precio").textContent) || 0;
      const importe = cantidad * precio;

      if (select.value && cantidad > 0) {
        items.push({
          descripcion: select.value,
          cantidad: cantidad,
          precio: precio,
          importe: importe
        });
      }
    });
    return items;
  }

  function agregarFila() {
    const fila = document.createElement("div");
    fila.className = "item-row";

    const select = document.createElement("select");
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

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "1";
    inputCantidad.value = "1";
    inputCantidad.className = "cantidad";

    const labelPrecio = document.createElement("label");
    labelPrecio.textContent = "0";
    labelPrecio.className = "precio";

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
      if (!selected.value) {
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

  // LÓGICA DEL NUEVO FLUJO DE CONTRATOS

  // 1. Validar que haya ítems y abrir el Modal
  if (btnAbrirContrato) {
    btnAbrirContrato.addEventListener("click", () => {
      const items = obtenerItemsSeleccionados();
      if (items.length === 0) {
        alert("Por favor, agregue y seleccione al menos un ítem al presupuesto antes de generar el contrato.");
        return;
      }
      if (modalInstancia) {
        formContrato.reset(); // Limpia inputs previos
        modalInstancia.show();
      }
    });
  }

  // 2. Procesar formulario y armar el PDF imprimible
  if (btnFinalizarContrato) {
    btnFinalizarContrato.addEventListener("click", () => {
      // Validar inputs requeridos del modal
      if (!formContrato.checkValidity()) {
        formContrato.reportValidity();
        return;
      }

      // Obtener datos capturados
      const nombreTitular = document.getElementById("c-nombre").value;
      const dniTitular = document.getElementById("c-dni").value;
      const domicilioTitular = document.getElementById("c-domicilio").value;
      const telefonoTitular = document.getElementById("c-telefono").value;
      const metodoPago = document.getElementById("c-metodo-pago").value;
      const observaciones = document.getElementById("c-observaciones").value || "Sin observaciones adicionales.";
      const fechaActual = new Date().toLocaleDateString("es-AR");

      const itemsContrato = obtenerItemsSeleccionados();
      const totalContrato = calcularTotal();

      // Construcción dinámica de las filas de la tabla para el PDF
      let tablaHtmlItems = "";
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

      // Crear contenedor temporal del Contrato (con estilos específicos para impresión A4)
const elementoContrato = document.createElement("div");
      elementoContrato.style.width = "680px"; // Ancho fijo ideal para renderizado A4 de html2pdf
      elementoContrato.style.padding = "0px 25px 10px 25px"; // Cero espacio arriba para evitar desplazamientos
      elementoContrato.style.marginTop = "-15px"; // Fuerza el inicio del documento bien arriba eliminando vacíos
      elementoContrato.style.fontFamily = "Arial, sans-serif";
      elementoContrato.style.color = "#333";
      elementoContrato.style.lineHeight = "1.35"; // Interlineado compacto y limpio

      elementoContrato.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: center; margin: 0 0 10px 0; padding: 0;">
          <img src="logo.png" style="width: 100%; max-width: 680px; height: auto; display: block; margin: 0;" alt="CESPAZ">
        </div>

        <div style="text-align: center; margin-bottom: 12px; padding: 0;">
          <h1 style="margin: 0; color: #540d97; font-size: 19px; font-weight: bold; letter-spacing: 0.5px;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
          <p style="margin: 2px 0; color: #565656; font-size: 11px;">Saladillo, Pcia. de Bs. As. — Fecha: ${fechaActual}</p>
        </div>

        <p style="font-size: 11.5px; margin-top: 0; margin-bottom: 8px;">Conste por el presente documento el <strong>Contrato de Prestación de Servicios Particulares</strong> que se celebra de mutuo acuerdo bajo las condiciones siguientes:</p>

        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 10px; margin-bottom: 4px; padding-bottom: 2px; font-size: 13.5px; font-weight: bold;">PRIMERA: PARTES CONTRATANTES</h3>
        <p style="font-size: 11.5px; margin-bottom: 8px; text-align: justify; margin-top: 0;">Se suscribe la presente prestación entre la empresa proveedora de servicios figurante al pie del documento, y por la otra parte el/la <strong>Sr./Sra. ${nombreTitular}</strong>, con documento/identificación fiscal N° <strong>${dniTitular}</strong>, con domicilio constituido en <strong>${domicilioTitular}</strong>, y contacto telefónico N° <strong>${telefonoTitular}</strong>, en adelante denominado/a "EL CONTRATANTE".</p>

        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 10px; margin-bottom: 4px; padding-bottom: 2px; font-size: 13.5px; font-weight: bold;">SEGUNDA: DETALLE DE PRESTACIONES</h3>
        <p style="font-size: 11.5px; margin-bottom: 6px; margin-top: 0;">La empresa se compromete a la provisión de las prestaciones y/o bienes detallados a continuación, seleccionados por el solicitante:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 8px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #f2f2f2; border-bottom: 1px solid #111;">
              <th style="padding: 5px; border: 1px solid #ddd; font-size: 11px; font-weight: bold; text-align: left; width: 50%;">Descripción / Concepto</th>
              <th style="padding: 5px; border: 1px solid #ddd; font-size: 11px; font-weight: bold; text-align: center; width: 10%;">Cant.</th>
              <th style="padding: 5px; border: 1px solid #ddd; font-size: 11px; font-weight: bold; text-align: right; width: 20%;">P. Unitario</th>
              <th style="padding: 5px; border: 1px solid #ddd; font-size: 11px; font-weight: bold; text-align: right; width: 20%;">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${tablaHtmlItems}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f9f9f9;">
              <td colspan="3" style="padding: 5px; border: 1px solid #ddd; font-size: 11px; text-align: right;">Total Contractual:</td>
              <td style="padding: 5px; border: 1px solid #ddd; font-size: 11.5px; text-align: right; color: #540d97; font-weight: bold;">$${totalContrato.toLocaleString("es-AR")}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 10px; margin-bottom: 4px; padding-bottom: 2px; font-size: 13.5px; font-weight: bold;">TERCERA: MODALIDAD DE PAGO Y LIQUIDACIÓN</h3>
        <p style="font-size: 11.5px; margin-bottom: 3px; margin-top: 0;">EL CONTRATANTE se obliga al cumplimiento del pago asignado mediante la vía de: <strong>${metodoPago}</strong>.</p>
        <p style="font-size: 11.5px; margin-bottom: 8px; margin-top: 0;"><strong>Observación comercial:</strong> ${observaciones}</p>

        <h3 style="border-bottom: 2px solid #540d97; color: #540d97; margin-top: 10px; margin-bottom: 4px; padding-bottom: 2px; font-size: 13.5px; font-weight: bold;">CUARTA: DECLARACIÓN DE CONFORMIDAD</h3>
        <p style="font-size: 11.5px; margin-bottom: 12px; text-align: justify; margin-top: 0;">En prueba de plena conformidad con las cláusulas precedentes y para su fiel y estricto cumplimiento, las partes proceden a estampar su firma en dos ejemplares de un mismo tenor y a un solo efecto en la fecha indicada en el encabezado del presente instrumento.</p>

        <div style="margin-top: 30px; margin-bottom: 20px; display: flex; justify-content: space-between; padding: 0 15px;">
          <div style="width: 210px; text-align: center; border-top: 1px solid #333; padding-top: 3px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold; color: #000;">Firma del Contratante</p>
            <p style="margin: 0; font-size: 10px; color: #666;">Aclaración / DNI</p>
          </div>
          <div style="width: 210px; text-align: center; border-top: 1px solid #333; padding-top: 3px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold; color: #000;">Por la Empresa</p>
            <p style="margin: 0; font-size: 10px; color: #666;">Firma y Sello Autorizado</p>
          </div>
        </div>

        <div style="margin-top: 25px; padding-top: 6px; border-top: 1px solid #ddd; text-align: center; font-size: 9.5px; color: #555; line-height: 1.3;">
          <p style="margin: 1px 0;">12 de Octubre (7260) - Saladillo - Bs.As. | Tel: (2345) 65-3131</p>
          <p style="margin: 1px 0;">e-mail: serviciossociales@coopsal.com.ar | www.coopsal.com.ar/CESPAZ</p>
        </div>
      `;

      // Opciones de configuración con márgenes superiores ajustados
      const opcionesPdf = {
        margin: [8, 12, 8, 12], // Reducción de márgenes físicos del PDF para ganar área de impresión útil
        filename: `Contrato_${nombreTitular.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Ejecutar la generación del PDF y descargarlo de inmediato
      html2pdf().set(opcionesPdf).from(elementoContrato).save().then(() => {
        // Cerrar el modal automáticamente al finalizar la descarga
        if (modalInstancia) {
          modalInstancia.hide();
        }
      }).catch(err => {
        console.error("Error al generar el PDF del contrato:", err);
        alert("Ocurrió un inconveniente al procesar el archivo PDF.");
      });
 });
  }
    btnAgregar.addEventListener("click", agregarFila);
  btnImprimir.addEventListener("click", () => window.print());
});
