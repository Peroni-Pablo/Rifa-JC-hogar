function actualizarBotonesBloquedos() {
    const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
    const confirmados = registros.filter(r => r.estado === "confirmado").map(r => r.numero);
    const registrados = registros.map(r => r.numero);
    
    document.querySelectorAll(".numero-btn").forEach(btn => {
        const numero = btn.textContent;
        
        if (confirmados.includes(numero)) {
            // número confirmado - bloqueado completamente
            btn.disabled = true;
            btn.style.opacity = "0.4";
            btn.style.cursor = "not-allowed";
            btn.style.backgroundColor = "#90ee90";
            btn.title = "Número confirmado";
        } else if (registrados.includes(numero)) {
            // número en espera - deshabilitado pero visible
            btn.disabled = true;
            btn.style.opacity = "0.6";
            btn.style.cursor = "not-allowed";
            btn.style.backgroundColor = "#ffeb99";
            btn.title = "En espera de confirmación";
        } else {
            // número disponible
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "#e6e6e6";
            btn.title = "Disponible";
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("gridNumeros");

    // Modal wiring: mostrar al tocar el icono de información
    const infoIcon = document.getElementById('infoIcon');
    const modal = document.getElementById('miModal');
    const cerrar = document.getElementById('cerrarModal');
    if (infoIcon && modal && cerrar) {
        infoIcon.addEventListener('click', () => {
            modal.setAttribute('aria-hidden', 'false');
        });
        cerrar.addEventListener('click', () => {
            modal.setAttribute('aria-hidden', 'true');
        });
        // cerrar al hacer click fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
        });
    }

    // Función para cargar y mostrar precios en el modal
    function cargarPreciosEnModal() {
        const precios = JSON.parse(localStorage.getItem("loteria_precios")) || { precio1: 5000, precio2: 8000 };
        document.getElementById("precio1").textContent = precios.precio1;
        document.getElementById("precio2").textContent = precios.precio2;
    }

    // Modal wiring: mostrar al tocar el icono de moneda
    const coinIcon = document.getElementById('coinIcon');
    const cbuModal = document.getElementById('cbuModal');
    const cerrarCbu = document.getElementById('cerrarCbuModal');
    if (coinIcon && cbuModal && cerrarCbu) {
        coinIcon.addEventListener('click', () => {
            cargarPreciosEnModal();
            cbuModal.setAttribute('aria-hidden', 'false');
        });
        cerrarCbu.addEventListener('click', () => {
            cbuModal.setAttribute('aria-hidden', 'true');
        });
        // cerrar al hacer click fuera del contenido
        cbuModal.addEventListener('click', (e) => {
            if (e.target === cbuModal) cbuModal.setAttribute('aria-hidden', 'true');
        });
    }

    // Escuchar cambios en localStorage para actualizar precios en tiempo real
    window.addEventListener('storage', function(e) {
        if (e.key === 'loteria_precios') {
            cargarPreciosEnModal();
        }
    });

    // Cargar precios al iniciar la página
    cargarPreciosEnModal();

    // listen for registration modal elements
    const registroModal = document.getElementById('registroModal');
    const cerrarRegistro = document.getElementById('cerrarRegistro');
    const cancelarRegistro = document.getElementById('cancelarRegistro');
    const aceptarRegistro = document.getElementById('aceptarRegistro');
    const numeroSeleccionadoEl = document.getElementById('numeroSeleccionado');
    const inputNombre = document.getElementById('inputNombre');
    const inputDni = document.getElementById('inputDni');
    let numeroActual = null;

    function abrirRegistroModal(numero) {
        numeroActual = numero;
        numeroSeleccionadoEl.textContent = numero;
        inputNombre.value = '';
        inputDni.value = '';
        registroModal.setAttribute('aria-hidden', 'false');
    }

    function cerrarRegistroModal() {
        registroModal.setAttribute('aria-hidden', 'true');
    }

    if (cerrarRegistro) {
        cerrarRegistro.addEventListener('click', cerrarRegistroModal);
    }
    if (cancelarRegistro) {
        cancelarRegistro.addEventListener('click', cerrarRegistroModal);
    }
    if (aceptarRegistro) {
        aceptarRegistro.addEventListener('click', () => {
            const nombre = inputNombre.value.trim();
            const dni = inputDni.value.trim();
            if (nombre === '') {
                alert('Debes ingresar un nombre válido.');
                return;
            }
            if (dni === '' || isNaN(dni) || dni.length < 7 || dni.length > 9) {
                alert('Debes ingresar un DNI válido (7-9 dígitos).');
                return;
            }

            // guardar registro
            const registros = JSON.parse(localStorage.getItem("loteria_registros")) || [];
            const numeroYaExiste = registros.some(r => r.numero === numeroActual);
            if (numeroYaExiste) {
                alert("Este número ya ha sido seleccionado.");
                cerrarRegistroModal();
                return;
            }
            registros.push({
                numero: numeroActual,
                nombre: nombre,
                dni: dni,
                estado: "pendiente",
                timestamp: new Date().toLocaleString()
            });
            localStorage.setItem("loteria_registros", JSON.stringify(registros));
            alert("Gracias, " + nombre + ". Tu selección ha sido registrada.");
            cerrarRegistroModal();
            actualizarBotonesBloquedos();
        });
    }

    // cerrar al hacer click fuera del contenido
    if (registroModal) {
        registroModal.addEventListener('click', (e) => {
            if (e.target === registroModal) cerrarRegistroModal();
        });
    }

    for (let i = 0; i < 100; i++) {
        const boton = document.createElement("button");
        boton.classList.add("numero-btn");
        boton.textContent = i.toString().padStart(2, "0");
        
        boton.addEventListener("click", () => {
            abrirRegistroModal(boton.textContent);
        });

        grid.appendChild(boton);
    }
    
    // Actualizar botones al cargar
    actualizarBotonesBloquedos();
    actualizarEstadoNumeros();
});

// Escuchar cambios en localStorage desde otras pestañas
window.addEventListener('storage', function(e) {
    if (e.key === 'loteria_registros') {
        actualizarBotonesBloquedos();
    }
    if (e.key === 'numeros_activos') {
        actualizarEstadoNumeros();
    }
});

function actualizarEstadoNumeros() {
    const activos = localStorage.getItem("numeros_activos") !== "false";
    const grid = document.getElementById("gridNumeros");
    if (activos) {
        grid.style.pointerEvents = "auto";
        grid.style.opacity = "1";
    } else {
        grid.style.pointerEvents = "none";
        grid.style.opacity = "0.5";
    }
}

async function cargarNumeros() {

const { data, error } = await supabase
.from('numeros_rifa')
.select('*');

console.log(data);

}

cargarNumeros();