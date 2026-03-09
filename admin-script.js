document.addEventListener("DOMContentLoaded", function() {
    cargarRegistros();
    inicializarToggle();
    cargarPreciosEnInputs();
    cargarPreviewImagen();
});

function cargarRegistros() {
    const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
    const tabla = document.getElementById("tablaRegistros");
    
    if (registros.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay registros aún</td></tr>';
        return;
    }

    // Ordenar por número
    registros.sort((a, b) => a.numero - b.numero);

    tabla.innerHTML = "";
    registros.forEach((registro, index) => {
        const fila = document.createElement("tr");
        
        const numeroCell = document.createElement("td");
        numeroCell.textContent = registro.numero;
        
        const nombreCell = document.createElement("td");
        nombreCell.textContent = registro.nombre;
        
        const dniCell = document.createElement("td");
        dniCell.textContent = registro.dni || "";
        
        const estadoCell = document.createElement("td");
        const estadoSpan = document.createElement("span");
        estadoSpan.className = `estado ${registro.estado}`;
        estadoSpan.textContent = registro.estado.charAt(0).toUpperCase() + registro.estado.slice(1);
        estadoCell.appendChild(estadoSpan);
        
        const accionesCell = document.createElement("td");
        accionesCell.className = "acciones";
        
        // Botón confirmar
        const btnConfirmar = document.createElement("button");
        btnConfirmar.className = "btn-accion btn-confirmar";
        btnConfirmar.textContent = "Confirmar";
        btnConfirmar.disabled = registro.estado !== "pendiente";
        btnConfirmar.onclick = () => cambiarEstado(registro.numero, "confirmado");
        
        // Botón rechazar
        const btnRechazar = document.createElement("button");
        btnRechazar.className = "btn-accion btn-rechazar";
        btnRechazar.textContent = "Rechazar";
        btnRechazar.disabled = registro.estado !== "pendiente";
        btnRechazar.onclick = () => cambiarEstado(registro.numero, "rechazado");
        
        // Botón borrar
        const btnBorrar = document.createElement("button");
        btnBorrar.className = "btn-accion btn-borrar";
        btnBorrar.textContent = "Borrar";
        btnBorrar.onclick = () => borrarRegistro(registro.numero);
        
        accionesCell.appendChild(btnConfirmar);
        accionesCell.appendChild(btnRechazar);
        accionesCell.appendChild(btnBorrar);
        
        fila.appendChild(numeroCell);
        fila.appendChild(nombreCell);
        fila.appendChild(dniCell);
        fila.appendChild(estadoCell);
        fila.appendChild(accionesCell);
        
        tabla.appendChild(fila);
    });
}

function cambiarEstado(numero, nuevoEstado) {
    const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
    
    // Buscar el índice del registro por número (clave única)
    const idx = registros.findIndex(r => r.numero === numero);
    if (idx === -1) return;

    if (nuevoEstado === "rechazado") {
        // Eliminar el registro para liberar el número
        registros.splice(idx, 1);
    } else {
        registros[idx].estado = nuevoEstado;
    }

    localStorage.setItem("loteria_registros", JSON.stringify(registros));
    cargarRegistros();
}

function borrarRegistro(numero) {
    if (confirm("¿Estás seguro de que deseas borrar el registro de este número?")) {
        const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
        const idx = registros.findIndex(r => r.numero === numero);
        if (idx !== -1) {
            registros.splice(idx, 1);
            localStorage.setItem("loteria_registros", JSON.stringify(registros));
            cargarRegistros();
        }
    }
}

function limpiarDatos() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los registros? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("loteria_registros");
        cargarRegistros();
        alert("Todos los datos han sido eliminados.");
    }
}

function inicializarToggle() {
    const btn = document.getElementById("toggleNumeros");
    let activos = localStorage.getItem("numeros_activos");
    if (activos === null) {
        localStorage.setItem("numeros_activos", "true");
        activos = "true";
    }
    if (activos === "true") {
        btn.textContent = "Desactivar números";
        btn.classList.add("btn-desactivar");
    } else {
        btn.textContent = "Activar números";
        btn.classList.add("btn-activar");
    }
}

function toggleNumeros() {
    const btn = document.getElementById("toggleNumeros");
    let activos = localStorage.getItem("numeros_activos");
    if (activos === "true") {
        // deactivate
        localStorage.setItem("numeros_activos", "false");
        btn.textContent = "Activar números";
        btn.classList.remove("btn-desactivar");
        btn.classList.add("btn-activar");
    } else {
        // activate
        localStorage.setItem("numeros_activos", "true");
        btn.textContent = "Desactivar números";
        btn.classList.remove("btn-activar");
        btn.classList.add("btn-desactivar");
    }
}

function descargarCSV(datos) {

    let contenido = "Numero;DNI;Nombre;Estado\n";

    datos.forEach(fila => {
        contenido += `${fila.numero};${fila.dni};${fila.nombre};${fila.estado}\n`;
    });

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rifa.csv";

    link.click();
}

function descargarRifa() {
    const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
    const registrosMap = {};
    registros.forEach(r => {
        registrosMap[r.numero] = r;
    });

    const datos = [];
    for (let i = 0; i < 100; i++) {
        const numero = i.toString().padStart(2, "0");
        const registro = registrosMap[numero];
        if (registro) {
            datos.push({ numero, dni: registro.dni, nombre: registro.nombre, estado: registro.estado });
        } else {
            datos.push({ numero, dni: "", nombre: "", estado: "Disponible" });
        }
    }

    descargarCSV(datos);
}

function cargarPreciosEnInputs() {
    const precios = JSON.parse(localStorage.getItem("loteria_precios")) || { precio1: 5000, precio2: 8000 };
    document.getElementById("precio1").value = precios.precio1;
    document.getElementById("precio2").value = precios.precio2;
}

function guardarPrecios() {
    const precio1 = document.getElementById("precio1").value || 5000;
    const precio2 = document.getElementById("precio2").value || 8000;
    
    const precios = {
        precio1: parseInt(precio1),
        precio2: parseInt(precio2)
    };
    
    localStorage.setItem("loteria_precios", JSON.stringify(precios));
    alert("Precios guardados correctamente. Se actualizarán en el índex inmediatamente.");
    
    // Notificar al index que los precios han cambiado
    window.dispatchEvent(new Event("preciosActualizados"));
}

function guardarImagenSorteo() {
    const inputImagen = document.getElementById("imagenSorteo");
    const archivo = inputImagen.files[0];
    
    if (!archivo) {
        alert("Por favor selecciona una imagen");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagenBase64 = e.target.result;
        localStorage.setItem("loteria_imagen_sorteo", imagenBase64);
        alert("Imagen guardada correctamente. Aparecerá cuando los usuarios entren a la página.");
        cargarPreviewImagen();
    };
    reader.readAsDataURL(archivo);
}

function cargarPreviewImagen() {
    const imagenBase64 = localStorage.getItem("loteria_imagen_sorteo");
    const previewDiv = document.getElementById("previewImagen");
    
    if (imagenBase64) {
        previewDiv.innerHTML = `<img src="${imagenBase64}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
    } else {
        previewDiv.innerHTML = "<p>No hay imagen guardada</p>";
    }
}

function eliminarImagenSorteo() {
    if (confirm("¿Estás seguro de que deseas eliminar la imagen del sorteo?")) {
        localStorage.removeItem("loteria_imagen_sorteo");
        alert("Imagen eliminada correctamente.");
        cargarPreviewImagen();
    }
}
