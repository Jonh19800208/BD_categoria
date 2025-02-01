class Trabajador {
    constructor(nombre, apellidos, departamento, categoria, fechaInicio, fechaAntiguedad) {
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.departamento = departamento;
        this.categoria = categoria;
        this.fechaInicio = new Date(fechaInicio);
        this.fechaAntiguedad = new Date(fechaAntiguedad);
    }

    verificarCambioCategoria() {
        const fechaActual = new Date();
        const diferenciaMeses = this.calcularDiferenciaEnMeses(this.fechaInicio, fechaActual);
        
        if (diferenciaMeses >= 23) {
            return true;
        }
        return false;
    }

    calcularDiferenciaEnMeses(fecha1, fecha2) {
        return (fecha2.getFullYear() - fecha1.getFullYear()) * 12 + 
               (fecha2.getMonth() - fecha1.getMonth());
    }

    cambiarCategoria() {
        const categorias = ['A', 'B', 'C'];
        const indiceActual = categorias.indexOf(this.categoria);
        
        if (indiceActual < categorias.length - 1) {
            this.categoria = categorias[indiceActual + 1];
            this.fechaInicio = new Date();
            return true;
        }
        return false;
    }

    static generarContenidoTexto(trabajadores) {
        return trabajadores.map(t => `Nombre: ${t.nombre}
Apellidos: ${t.apellidos}
Departamento: ${t.departamento}
Categoría: ${t.categoria}
Fecha Inicio Contrato: ${t.fechaInicio.toLocaleDateString()}
Fecha Antigüedad: ${t.fechaAntiguedad.toLocaleDateString()}
Sección Sindical: CC.OO DAMM (El Puig)
---
`).join('');
    }
}

class GestorTrabajadores {
    constructor() {
        this.trabajadores = [];
        this.inicializarLocalStorage();
        this.cargarTrabajadores();
        this.inicializarEventos();
    }

    inicializarEventos() {
        document.getElementById('guardarCambios').addEventListener('click', () => this.guardarCambios());
    }

    inicializarLocalStorage() {
        if (!localStorage.getItem('trabajadores')) {
            localStorage.setItem('trabajadores', JSON.stringify([]));
        }
    }

    cargarTrabajadores() {
        const trabajadoresGuardados = JSON.parse(localStorage.getItem('trabajadores'));
        this.trabajadores = trabajadoresGuardados.map(t => 
            new Trabajador(t.nombre, t.apellidos, t.departamento, t.categoria, t.fechaInicio, t.fechaAntiguedad)
        );
        this.renderizarTrabajadores();
    }

    agregarTrabajador(trabajador) {
        this.trabajadores.push(trabajador);
        this.guardarTrabajadores();
        this.renderizarTrabajadores();
    }

    guardarTrabajadores() {
        localStorage.setItem('trabajadores', JSON.stringify(this.trabajadores));
    }

    guardarCambios() {
        const contenido = Trabajador.generarContenidoTexto(this.trabajadores);
        const blob = new Blob([contenido], { type: 'text/plain' });
        const nombreArchivo = `Trabajadores_CCOO_DAMM_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    renderizarTrabajadores() {
        const tbody = document.getElementById('trabajadoresBody');
        tbody.innerHTML = '';

        this.trabajadores.forEach((trabajador, index) => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${trabajador.nombre}</td>
                <td>${trabajador.apellidos}</td>
                <td>${trabajador.departamento}</td>
                <td>${trabajador.categoria}</td>
                <td>${trabajador.fechaInicio.toLocaleDateString()}</td>
                <td>${trabajador.fechaAntiguedad.toLocaleDateString()}</td>
                <td>
                    <button onclick="gestorTrabajadores.verificarYActualizarTrabajador(${index})">Verificar Categoría</button>
                    <button onclick="gestorTrabajadores.editarTrabajador(${index})">Editar</button>
                </td>
            `;

            if (trabajador.verificarCambioCategoria()) {
                fila.classList.add('alerta');
            }

            tbody.appendChild(fila);
        });
    }

    editarTrabajador(index) {
        const tbody = document.getElementById('trabajadoresBody');
        const fila = tbody.rows[index];
        const trabajador = this.trabajadores[index];

        // Convertir cada celda a un input editable
        const campos = ['nombre', 'apellidos', 'departamento', 'categoria'];
        const fechaCampos = ['fechaInicio', 'fechaAntiguedad'];

        campos.forEach((campo, i) => {
            const valorActual = trabajador[campo];
            if (campo === 'departamento' || campo === 'categoria') {
                fila.cells[i].innerHTML = `
                    <select class="edit-input edit-${campo}">
                        ${campo === 'departamento' ? 
                            ['Envasado', 'Logística', 'Elaboración', 'Calidad', 'Mantenimiento']
                                .map(dep => `<option value="${dep}" ${valorActual === dep ? 'selected' : ''}>${dep}</option>`).join('') :
                            ['A', 'B', 'C']
                                .map(cat => `<option value="${cat}" ${valorActual === cat ? 'selected' : ''}>${cat}</option>`).join('')
                        }
                    </select>
                `;
            } else {
                fila.cells[i].innerHTML = `<input type="text" class="edit-input edit-${campo}" value="${valorActual}">`;
            }
        });

        fechaCampos.forEach((campo, i) => {
            const fechaActual = trabajador[campo].toISOString().split('T')[0];
            fila.cells[i + 4].innerHTML = `<input type="date" class="edit-input edit-${campo}" value="${fechaActual}">`;
        });

        fila.classList.add('editing');
    }

    verificarYActualizarTrabajador(index) {
        const trabajador = this.trabajadores[index];
        
        if (trabajador.verificarCambioCategoria()) {
            if (trabajador.cambiarCategoria()) {
                alert(`El trabajador ${trabajador.nombre} ${trabajador.apellidos} ha cambiado a categoría ${trabajador.categoria}`);
                this.guardarTrabajadores();
                this.renderizarTrabajadores();
            } else {
                alert('No es posible cambiar a una categoría superior');
            }
        } else {
            alert('Aún no es momento de cambiar de categoría');
        }
    }
}

const gestorTrabajadores = new GestorTrabajadores();

document.getElementById('trabajadorForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const departamento = document.getElementById('departamento').value;
    const categoria = document.getElementById('categoria').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaAntiguedad = document.getElementById('fechaAntiguedad').value;

    const nuevoTrabajador = new Trabajador(nombre, apellidos, departamento, categoria, fechaInicio, fechaAntiguedad);
    gestorTrabajadores.agregarTrabajador(nuevoTrabajador);

    // Limpiar formulario
    e.target.reset();
});