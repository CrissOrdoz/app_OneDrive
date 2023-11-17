document.addEventListener('DOMContentLoaded', function() {

    const socket = io('http://localhost:3008');
    const urlp = `https://graph.microsoft.com/v1.0/me/drive/items/root/children`;
    socket.emit('haConnection', urlp);
    
    const loader = document.getElementById('loader');
    

    socket.on('mostrarLoader', () => {
        loader.classList.remove('hidden');
    });

    socket.on('ocultarLoader', () => {
        loader.classList.add('hidden');
    });

    const foldersList = document.getElementById('foldersList');
    const filesList = document.getElementById('filesList');

    function limpiarTabla(tabla) {
        while (tabla.firstChild) {
            tabla.removeChild(tabla.firstChild);
        }
    }

    // Función para crear una fila de la lista
    function createRow(type, name, id, fold) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${type}</td>
            <td class="nombre" data-id="${id}" data-name="${name}" data-fold="${fold}">${name}</td>
            <td><button class="descargar" data-id="${id}" data-name="${name}" data-fold="${fold}">Descargar</button></td>
        `;
        return tr;
    }

    // Función para agregar eventos de click a los botones de descarga
    function addDownloadButtonEvents() {
        const buttons = document.querySelectorAll('.descargar');
        buttons.forEach(button => {
            button.removeEventListener('click', descargarButtonClickHandler);
            button.addEventListener('click', descargarButtonClickHandler);
        });
    }
    
    function descargarButtonClickHandler() {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const fold= this.dataset.fold;

        const type = this.parentElement.parentElement.children[0].textContent;
        const eventName = (type === 'Carpeta') ? 'descargarFolder' : 'descargarFile';
        socket.emit(eventName, { id, name, fold});
    }
    

    // Función para agregar eventos de click a las filas de carpeta
    function addFolderClickEvents() {
        const carpetas = document.querySelectorAll('.nombre');
        carpetas.forEach(carpeta => {
            carpeta.addEventListener('click', function() {
                const id = this.dataset.id;
                const name = this.dataset.name;
                const fold = this.dataset.fold;                
                socket.emit('mostrarContenidoCarpeta', { id, name, fold });
                
            });
        });
    }

    socket.on('carpetas', (data) => {
        const contenido= data.contenido;
        const nameFolder = data.foldername;
        
        limpiarTabla(foldersList);
        contenido.folders.forEach(folder => {
            const row = createRow('Carpeta', folder.name, folder.id, nameFolder);
            row.classList.add('carpeta'); // Agrega la clase 'carpeta' a la fila
            foldersList.appendChild(row);
        });
        limpiarTabla(filesList);
        contenido.files.forEach(file => {
            const row = createRow('Archivo', file.name, file.id, nameFolder);
            filesList.appendChild(row);
        });

        addDownloadButtonEvents();
        addFolderClickEvents();
        
    });

    

    socket.on('descargaCompletada', (mensaje) => {
        alert(mensaje);
    });

    socket.on('tockenInvalido', (mensaje) => {
        alert(mensaje);
    });









    const rutaLista = document.querySelector('.ruta-lista');

    // Función para actualizar la ruta
    function actualizarRuta(rutalk) {
        const li = document.createElement('li');
        li.classList.add('ruta-item');
        li.textContent = rutalk.name;
        li.dataset.id = rutalk.id; // Asigna el ID de la carpeta como un atributo de datos
        li.dataset.name = rutalk.name;
        li.dataset.fold = rutalk.fold;
        rutaLista.appendChild(li);
        
    }

    // Escuchar eventos para actualizar la ruta
    socket.on('actualizarRuta', (nombres) => {
        actualizarRuta(nombres);
    });

    // Agregar evento de clic a la lista de ruta
    rutaLista.addEventListener('click', (event) => {

        const target = event.target;
        const id = target.dataset.id;
        const name = target.dataset.name;
        const fold = target.dataset.fold;
        socket.emit('mostrarContenidoCarpeta', { id, name, fold });
        let eliminar = false;
        const elementosEliminar = [];
        rutaLista.childNodes.forEach(elemento => {
        if (elemento === target) {
            eliminar = true;
            return;
        }
        if (eliminar) {
            elementosEliminar.push(elemento);
        }
        });
        console.log(elementosEliminar);
        elementosEliminar.forEach(elemento => {
        rutaLista.removeChild(elemento);
        });

        
    });


});
