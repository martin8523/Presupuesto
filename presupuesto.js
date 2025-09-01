document.addEventListener("DOMContentLoaded", () => {
  const detalle = document.getElementById("detalle-items");
  const btnAgregar = document.getElementById("btn-agregar");
  const btnImprimir = document.getElementById("btn-imprimir");
  const totalEl = document.getElementById("total");

  const itemsDisponibles = [
    { descripcion: "Ataud para Nicho N° 15", precio: 630000 },
    { descripcion: "Ataud para Nicho Semi-Extraordinario", precio: 752000 },
    { descripcion: "Ataud para Nicho Extraordinario", precio: 1160000 },
    { descripcion: "Nicho Nuevo", precio: 700000 },
    { descripcion: "Nicho Usado", precio: 350000 },
    { descripcion: "VELACION X HORA", precio: 160000 },
    { descripcion: "GASTOS ADMINISTRATIVOS", precio: 80000 },
    { descripcion: "Ataud para Tierra N° 15", precio: 418000 },
    { descripcion: "Ataud para Tierra Semi-Extraordinario", precio: 490000 },
 
    

    // agregar más ítems según sea necesario
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
  }

  function agregarFila() {
    const fila = document.createElement("div");
    fila.className = "item-row";

    // Selección de ítem
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

    // Descripción y precio
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

    // Botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "❌";

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

  btnAgregar.addEventListener("click", agregarFila);
  btnImprimir.addEventListener("click", () => window.print());
});
