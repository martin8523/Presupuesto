const API = "https://opensheet.elk.sh/1nOPP_tzOkIx_qDRCpxyR0mOyZMveCB5QlT4CEM1M7eI/Hoja%201";

let items = [];

fetch(API)
 .then(r=>r.json())
 .then(data=>items=data);

const tbody = document.getElementById("detalle");

document.getElementById("fecha").innerText = new Date().toLocaleDateString("es-AR");
document.getElementById("numero").innerText = Date.now().toString().slice(-6);

document.getElementById("agregar").onclick = ()=>agregarFila();
document.getElementById("tipoFactura").onchange = calcular;

function agregarFila(){
  const tr = document.createElement("tr");

  const sel = document.createElement("select");
  sel.innerHTML = `<option value="">--item--</option>`+
    items.map(i=>`<option data-precio="${i.precio}">${i.descripcion}</option>`).join("");

  const cant = document.createElement("input");
  cant.type="number"; cant.value=1;

  const precio = document.createElement("td");
  const sub = document.createElement("td");

  const del = document.createElement("button");
  del.textContent="X";

  tr.innerHTML="<td></td><td></td><td></td><td></td><td></td>";
  tr.children[0].appendChild(sel);
  tr.children[1].appendChild(cant);
  tr.children[2]=precio;
  tr.children[3]=sub;
  tr.children[4].appendChild(del);

  tbody.appendChild(tr);

  sel.onchange=()=>{precio.dataset.valor=sel.selectedOptions[0].dataset.precio; calcular();}
  cant.oninput=calcular;
  del.onclick=()=>{tr.remove(); calcular();}
}

function calcular(){
  let bruto=0;
  document.querySelectorAll("#detalle tr").forEach(tr=>{
    const cant=+tr.querySelector("input").value;
    const precio=+tr.querySelector("td:nth-child(3)").dataset.valor||0;
    const sub=cant*precio;
    tr.querySelector("td:nth-child(3)").innerText=precio.toLocaleString("es-AR");
    tr.querySelector("td:nth-child(4)").innerText=sub.toLocaleString("es-AR");
    bruto+=sub;
  });

  let neto=bruto, iva=0;
  if(document.getElementById("tipoFactura").value==="A"){
    neto=bruto/1.21; iva=bruto-neto;
  }
  const iibb=neto*0.08;

  document.getElementById("neto").innerText=Math.round(neto).toLocaleString("es-AR");
  document.getElementById("iva").innerText=Math.round(iva).toLocaleString("es-AR");
  document.getElementById("iibb").innerText=Math.round(iibb).toLocaleString("es-AR");
  document.getElementById("total").innerText=Math.round(bruto+iibb).toLocaleString("es-AR");
}
