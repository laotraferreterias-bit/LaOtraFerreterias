let productos = [];
let productosFiltrados = [];
let productosAgrupados = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const PRODUCTOS_POR_PAGINA = 40;
let categoriaSeleccionada = "";
let subcategoriaSeleccionada = "";
let paginaActual = 1;
// nica en serio este js lo hice medio a la rápida xddd
// agarra el json de productos y ya
fetch("data/productos.json")
.then(res => res.json())
.then(data => {

    productos = data;
    productosFiltrados = [...productos];

    crearBotonesCategorias();

    mostrarProductosPagina();
    actualizarCarrito();

})
.catch(error => {

    console.error(error);

});
// hace los botones de categorias y subcats, na mas
// si le das click cambia el filtro y se repinta todo otra vez
function crearBotonesCategorias(){

    const contenedor =
    document.getElementById("categorias");

    contenedor.innerHTML = "";

    // Botón TODOS
    const btnTodos =
    document.createElement("button");

    btnTodos.textContent =
    "TODOS LOS PRODUCTOS";

    btnTodos.className =
    "btnCategoria";

    if(
        categoriaSeleccionada === ""
    ){
        btnTodos.classList.add("activa");
    }

    btnTodos.onclick = () => {
        //Aqui se hacen los click en las categorias y subcategorias
        categoriaSeleccionada = "";
        subcategoriaSeleccionada = "";

        aplicarFiltros();
        crearBotonesCategorias();

    };

    contenedor.appendChild(btnTodos);


    // Categorías
    const categorias = [

        ...new Set(
            productos.map(
                p => p.categoria
            )
        )

    ].sort();


    categorias.forEach(cat => {

        const grupo =
        document.createElement("div");

        grupo.className =
        "grupoCategoria";


        const boton =
        document.createElement("button");

        boton.className =
        "btnCategoria";

        boton.innerHTML = `
    <span>${cat}</span>
    <span>
        ${
            categoriaSeleccionada === cat
            ? "⌄"
            : "›"
        }
    </span>
`;

        if(
            categoriaSeleccionada === cat
        ){
            boton.classList.add("activa");
        }


        boton.onclick = () => {

            if(
                categoriaSeleccionada === cat
            ){

                categoriaSeleccionada = "";
                subcategoriaSeleccionada = "";

            }else{

                categoriaSeleccionada = cat;
                subcategoriaSeleccionada = "";

            }

            aplicarFiltros();
            crearBotonesCategorias();

        };

        grupo.appendChild(boton);


        // Subcategorías
        if(
            categoriaSeleccionada === cat
        ){

            const subcontenedor =
            document.createElement("div");

            subcontenedor.className =
            "subcategoriasOcultas";


            const subcategorias = [

                ...new Set(

                    productos
                    .filter(
                        p =>
                        p.categoria === cat
                    )
                    .map(
                        p => p.subcategoria
                    )

                )

            ].sort();


            subcategorias.forEach(sub => {

                const btnSub =
                document.createElement("button");

                btnSub.textContent =
                sub;

                btnSub.className =
                "btnSubcategoria";

                if(
                    subcategoriaSeleccionada
                    === sub
                ){
                    btnSub.classList.add("activa");
                }

                btnSub.onclick = () => {

                    subcategoriaSeleccionada =
                    (
                        subcategoriaSeleccionada
                        === sub
                    )
                    ? ""
                    : sub;

                    aplicarFiltros();
                    crearBotonesCategorias();

                };

                subcontenedor.appendChild(
                    btnSub
                );

            });

            grupo.appendChild(
                subcontenedor
            );

        }

        contenedor.appendChild(
            grupo
        );

    });

}
// checa que productos entran en la pagina y los muestra, para que no queden mal contados
function mostrarProductosPagina(){

    // Agrupar una sola vez para que la paginación sea correcta
    productosAgrupados = agruparProductos(
        productosFiltrados
    );

    const inicio =
        (paginaActual - 1) *
        PRODUCTOS_POR_PAGINA;

    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;

    const pagina = productosAgrupados.slice(inicio, fin);

    mostrarProductos(pagina);

    actualizarPaginacion();

}
function resolverRutasImagen(producto){

    const rutaOriginal =
        producto && producto.imagen
            ? String(producto.imagen).trim()
            : "";

    if(!rutaOriginal){
        return {
            principal: "",
            alternativa: ""
        };
    }

    const rutaSinBarra = rutaOriginal.replace(/^\/+/, "");

    const alternativa =
        rutaSinBarra.startsWith("imagenes/")
            ? rutaSinBarra.replace(/^imagenes\//, "imagenes2/")
            : "";

    return {
        principal: rutaOriginal,
        alternativa
    };

}

// dibuja los productos en pantalla
// cada tarjeta es una carta con su info y botoncito para agregar
function mostrarProductos(lista){

    const contenedor =
    document.getElementById("productos");

    contenedor.innerHTML = "";

    lista.forEach(producto => {

    const tieneVariantes =
        producto.variantes &&
        producto.variantes.length > 0;

        const tarjeta =
        document.createElement("div");

        tarjeta.className = "card";

        const tieneInfo =
            (producto.informacion &&
             String(producto.informacion).trim() !== "") ||
            (tieneVariantes &&
             producto.variantes.some(v =>
                v.informacion && String(v.informacion).trim() !== ""
             ));

        const infoInicial =
            tieneVariantes &&
            producto.variantes[0] &&
            producto.variantes[0].informacion &&
            String(producto.variantes[0].informacion).trim() !== ""
            ? producto.variantes[0].informacion
            : producto.informacion || '';

        const { principal, alternativa } = resolverRutasImagen(producto);

        tarjeta.innerHTML = `

            ${
                principal ?

                `<img
                    src="${principal}"
                    loading="lazy"
                    alt="${producto.nombre}"
                    data-fallback="${alternativa || ''}"
                    onerror="this.onerror=null; const fallback=this.getAttribute('data-fallback'); if(fallback && this.getAttribute('src') !== fallback){ this.src=fallback; } else { this.outerHTML='<div class=sin-imagen>Sin imagen</div>'; }"
                >`

                :

                `<div class="sin-imagen">
                    Sin imagen
                </div>`
            }
            
            <div class="card-body">
            
                <h3>${producto.nombre}</h3>
               
            ${
                producto.medida
                ? `
                <div class="codigo">
                    Opciones: ${producto.medida}
                </div>
                `
                : ""
            }

            <div class="codigo">
                Categoria:
                ${producto.categoria}
            </div>

            ${
    tieneVariantes
    ?
    `
    <div class="campoMedida">

        <label>Opciones</label>

        <select
            class="selectorMedida"
            data-nombre="${producto.nombre}">
            
            ${
            // para las variantes de producto, pueden ser medidas o colores o lo que sea
                producto.variantes
                .map(v => `
                    <option
                        value="${v.codigo}"
                        data-unidad="${v.unidad}"
                    >
                        ${v.medida}
                    </option>
                `)
                .join("")
            }

        </select>

    </div>

    <div class="codigo codigoProducto">

        Código:
        ${producto.variantes[0].codigo}

    </div>
    `
    :
    `
    <div class="codigo">
        Código:
        ${producto.codigo}
    </div>
    `
}

            <div class="codigo">
                Unidad:
                ${producto.unidad || producto.Unidad || ""}
            </div>

            ${
                (producto.unidad2 && producto.unidad2.trim() !== "")
                ?
                `
                <div class="codigo">
                    Unidad alternativa:
                    <select class="selectorUnidad">
                        <option value="${producto.unidad}">${producto.unidad}</option>
                        <option value="${producto.unidad2}">${producto.unidad2}</option>
                    </select>
                </div>
                `
                : ""
            }

            </div>

            <div class="card-footer">
                <button
                    data-codigo="${
                        tieneVariantes
                        ? producto.variantes[0].codigo
                        : producto.codigo
                    }"
                    data-unidad="${producto.unidad || ''}"
                    data-medida="${producto.medida || ''}">
                        Agregar
                </button>
                ${
                    tieneInfo
                    ? `
                    <button
                        class="btnInfo"
                        data-info="${encodeURIComponent(infoInicial)}">
                        Información
                    </button>
                    `
                    : ""
                }

            </div>

        `;

        const boton =
            tarjeta.querySelector(
                "button"
            );

        const selectorUnidad =
            tarjeta.querySelector(
                ".selectorUnidad"
            );

        // Si hay selector de unidad, inicializamos el data-unidad del botón
        if(selectorUnidad){
            boton.dataset.unidad = selectorUnidad.value || (boton.dataset.unidad || "");
            selectorUnidad.addEventListener("change", () => {
                boton.dataset.unidad = selectorUnidad.value;
            });
        }

        boton.addEventListener(
            "click",
            () => {
                const unidadSel = boton.dataset.unidad || boton.getAttribute('data-unidad') || '';
                const medidaSel = boton.dataset.medida || boton.getAttribute('data-medida') || '';
                agregarCarrito(boton.dataset.codigo, 1, unidadSel, medidaSel);
            }
        );

        contenedor.appendChild(
            tarjeta
        );

        const btnInfo = tarjeta.querySelector('.btnInfo');
        if(btnInfo){
            btnInfo.addEventListener('click', () => {
                const info = decodeURIComponent(btnInfo.dataset.info || '');
                const overlay = document.getElementById('overlay');
                if(overlay) overlay.classList.add('activo');

                let modal = document.getElementById('infoModal');
                if(!modal){
                    modal = document.createElement('div');
                    modal.id = 'infoModal';
                    modal.className = 'infoModal';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="infoModalContent">
                        <button id="cerrarInfo" class="btnCerrarInfo">✕</button>
                        <h3>${producto.nombre}</h3>
                        <div class="infoTexto">${info.replace(/\n/g,'<br>')}</div>
                    </div>
                `;

                const cerrar = modal.querySelector('#cerrarInfo');
                if(cerrar){
                    cerrar.addEventListener('click', () => {
                        if(overlay) overlay.classList.remove('activo');
                        modal.remove();
                    });
                }

                if(overlay){
                    overlay.addEventListener('click', () => {
                        overlay.classList.remove('activo');
                        if(modal) modal.remove();
                    }, { once: true });
                }

            });
        }

        // Forzar layout de tarjeta en columna para que el botón quede abajo
        tarjeta.style.display = "flex";
        tarjeta.style.flexDirection = "column";
        const cuerpo = tarjeta.querySelector(".card-body");
        if(cuerpo){
            cuerpo.style.flex = "1";
        }

        if(tieneVariantes){

            const selector =
                tarjeta.querySelector(
                    ".selectorMedida"
                );

            const codigoDiv =
                tarjeta.querySelector(
                    ".codigoProducto"
                );

            const boton =
                tarjeta.querySelector(
                    "button"
                );

            const imagen =
                tarjeta.querySelector("img");

            selector.addEventListener(
                "change",
                () => {

                            const variante =
                        producto.variantes.find(
                            v => String(v.codigo) === String(selector.value)
                        );

                    codigoDiv.innerHTML =
                        `Código: ${selector.value}`;

                    boton.dataset.codigo = selector.value;

                    // actualizar medida en el boton (texto de la option)
                    const opt = selector.options[selector.selectedIndex];
                    const medidaSel = opt ? opt.text : '';
                    boton.dataset.medida = medidaSel;

                    // si la variante trae unidad, actualizar selector de unidad (SOLO SI EXISTE)
                    const selUnidad = tarjeta.querySelector('.selectorUnidad');
                    if(selUnidad && variante && variante.unidad){
                        selUnidad.value = variante.unidad;
                        boton.dataset.unidad = variante.unidad;
                    }

                    if(variante && imagen){
                        imagen.src = variante.imagen || producto.imagen || "";
                    }

                    const btnInfo = tarjeta.querySelector('.btnInfo');
                    if(btnInfo){
                        const nuevaInfo =
                            variante && variante.informacion && String(variante.informacion).trim() !== ""
                            ? variante.informacion
                            : producto.informacion || '';

                        if(String(nuevaInfo).trim() !== ""){
                            btnInfo.dataset.info = encodeURIComponent(nuevaInfo);
                            btnInfo.style.display = '';
                        } else {
                            btnInfo.style.display = 'none';
                        }
                    }

                }
            );

        }

    });

}

// mete el producto al carrito con el codigo
// si ya esta, solo le suma mas cantidad y ya
function generarKey(codigo, unidad, medida){
    return `${codigo}::${unidad||''}::${medida||''}`;
}

function agregarCarrito(codigo, cantidad = 1, unidad = '', medida = ''){

    cantidad = Number(cantidad);
    if(isNaN(cantidad) || cantidad < 1) cantidad = 1;

    const carritoVacio = carrito.length === 0;

    const producto =
    productos.find(
        p => String(p.codigo) === String(codigo)
    );

    if(!producto) return;

    const key = generarKey(codigo, unidad, medida);

    const existente =
    carrito.find(
        p => p._key === key
    );

    if(existente){

        existente.cantidad += cantidad;

    }else{

        const item = {
            ...producto,
            cantidad: cantidad,
            unidadSeleccionada: unidad || producto.unidad || '',
            medidaSeleccionada: medida || producto.medida || '',
            _key: key
        };

        carrito.push(item);

    }

    guardarCarrito();

    if(carritoVacio){
        lanzarConfetiCarrito();
    }

}

// Guarda el carrito en el navegador y actualiza la vista (como me enseño victor xd)
function guardarCarrito(){

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    actualizarCarrito();

}

// refresca el carrito en la pantalla y pone bien el contador de items
function actualizarCarrito(){

    const lista =
    document.getElementById(
        "listaCarrito"
    );

    lista.innerHTML = "";

    let total = 0;

    carrito.forEach(item => {

        total += item.cantidad;

        const div = document.createElement("div");
        div.className = "itemCarrito";

        const unidadTexto = item.unidadSeleccionada || item.unidad || "";
        const medidaTexto = item.medidaSeleccionada || item.medida || "";

        div.innerHTML = `
            <strong>${item.nombre}</strong>
            <br>
            Código: ${item.codigo}
            ${unidadTexto ? `<br>Unidad: ${unidadTexto}` : ''}
            ${medidaTexto ? `<br>Medida: ${medidaTexto}` : ''}
            <div class="controles">
                <button class="btnMenos" data-key="${item._key}">−</button>

                <input
                    type="number"
                    min="1"
                    value="${item.cantidad}"
                    class="cantidadInput"
                    data-key="${item._key}"
                >

                <button class="btnMas" data-key="${item._key}">+</button>

                <button class="btnEliminar" data-key="${item._key}">🗑️</button>
            </div>
        `;

        lista.appendChild(div);

        // Agregar event listeners usando data-key en lugar de onclick inline
        const btnMenos = div.querySelector('.btnMenos');
        const btnMas = div.querySelector('.btnMas');
        const btnEliminar = div.querySelector('.btnEliminar');
        const inputCantidad = div.querySelector('.cantidadInput');

        if(btnMenos){
            btnMenos.addEventListener('click', () => {
                cambiarCantidad(item._key, -1);
            });
        }

        if(btnMas){
            btnMas.addEventListener('click', () => {
                cambiarCantidad(item._key, 1);
            });
        }

        if(inputCantidad){
            inputCantidad.addEventListener('change', () => {
                actualizarCantidad(item._key, inputCantidad.value);
            });
        }

        if(btnEliminar){
            btnEliminar.addEventListener('click', () => {
                eliminarProducto(item._key);
            });
        }

    });

    document
    .getElementById(
        "cantidadArticulos"
    )
    .innerText =
    `${total} artículos`;
    const contadorMovil =
document.getElementById(
    "contadorMovil"
);

if(contadorMovil){

    contadorMovil.innerText =
    total;

}

}

// Cambia la cantidad de ese producto en el carrito.
// Si se pone en 0 lo borra.
function cambiarCantidad(
    key,
    cambio
){

    const item = carrito.find(p => p._key === key);

    if(!item) return;

    item.cantidad += cambio;

    if(item.cantidad <= 0){
        carrito = carrito.filter(p => p._key !== key);
    }

    guardarCarrito();

}
// Actualiza la cantidad con el numero que escribió el user.
function actualizarCantidad(key, nuevaCantidad){

    nuevaCantidad = parseInt(nuevaCantidad);

    if(isNaN(nuevaCantidad) || nuevaCantidad < 1){
        eliminarProducto(key);
        return;
    }

    const item = carrito.find(p => p._key === key);

    if(!item) return;

    item.cantidad = nuevaCantidad;

    guardarCarrito();

}
// Saca el producto del carrito y guarda.
function eliminarProducto(key){

    carrito = carrito.filter(p => p._key !== key);

    guardarCarrito();

}
// Actualiza los botones de pagina y dice en que pagina estamos.
function actualizarPaginacion(){

    let paginacion =
    document.getElementById(
        "paginacion"
    );

    if(!paginacion){

        paginacion =
        document.createElement(
            "div"
        );

        paginacion.id =
        "paginacion";

        document
        .getElementById(
            "productos"
        )
        .after(
            paginacion
        );

    }

    const totalPaginas =
    Math.ceil(
        productosAgrupados.length
        /
        PRODUCTOS_POR_PAGINA
    );

    paginacion.innerHTML = `

        <button
        ${paginaActual === 1 ? "disabled" : ""}
        onclick="paginaAnterior()">

            ← Anterior

        </button>

        <span>

            Página
            ${paginaActual}
            de
            ${totalPaginas}

        </span>

        <button
        ${paginaActual === totalPaginas ? "disabled" : ""}
        onclick="paginaSiguiente()">

            Siguiente →

        </button>

    `;

}

// Va a la pagina anterior si hay.
function paginaAnterior(){

    if(paginaActual > 1){

        paginaActual--;

        mostrarProductosPagina();

        window.scrollTo(
            0,
            0
        );

    }

}

// Va a la pagina siguiente si no es la ultima.
function paginaSiguiente(){

    const totalPaginas =
    Math.ceil(
        productosAgrupados.length
        /
        PRODUCTOS_POR_PAGINA
    );

    if(paginaActual < totalPaginas){

        paginaActual++;

        mostrarProductosPagina();

        window.scrollTo(
            0,
            0
        );

    }

}

// Normaliza el texto para buscar tranqui sin tildes ni mayus (Rosita descubrio ese problema xd).
function normalizarTexto(texto){

    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}
// Junta productos iguales con variantes para no repetir tarjetas. (Ya jalo, lo que me decias de las variables)
function agruparProductos(lista){

    const grupos = {};

    lista.forEach(producto => {

        const tieneMedida =
            producto.medida &&
            producto.medida.trim() !== "";

        if(!tieneMedida){

            grupos["SIN-" + producto.codigo] = {
                ...producto,
                variantes: null
            };

            return;
        }

        const clave =
            producto.nombre;

        if(!grupos[clave]){

            grupos[clave] = {

                ...producto,

                variantes: []

            };

        }

        grupos[clave]
        .variantes
        .push(producto);

    });

    // Si un grupo tiene solo 1 variante, no lo devolvemos como grupo:
    // retornamos la variante individual para que no se muestre selector.
    return Object.values(grupos).map(g => {
        if(g && g.variantes && Array.isArray(g.variantes)){
            if(g.variantes.length === 1){
                return g.variantes[0];
            }
            return g;
        }
        return g;
    });

}
// aplica lo que escribiste en el buscador y los filtros de categoria/subcategoria
function aplicarFiltros(){

    const texto =
    normalizarTexto(
        document
        .getElementById("buscador")
        .value
    );

    const palabras =
        texto === ""
        ? []
        : texto.split(/\s+/);

    productosFiltrados =
    productos.filter(producto => {

        const nombre =
        normalizarTexto(producto.nombre);

        const codigo =
        normalizarTexto(producto.codigo);

        const coincideTexto =

            palabras.length === 0 ||

            palabras.every(palabra =>

                codigo.includes(palabra)

                ||

                nombre
                .split(/\s+/)
                .some(termino =>
                    termino.startsWith(palabra)
                )

            );

        const coincideCategoria =

            categoriaSeleccionada === ""

            ||

            producto.categoria === categoriaSeleccionada;

        const coincideSubcategoria =

            subcategoriaSeleccionada === ""

            ||

            producto.subcategoria === subcategoriaSeleccionada;

        return (

            coincideTexto
            &&

            coincideCategoria
            &&

            coincideSubcategoria

        );

    });

    paginaActual = 1;

    mostrarProductosPagina();

}

document
.getElementById("buscador")
.addEventListener(
    "input",
    aplicarFiltros
);


document
.getElementById("btnWhats")
.addEventListener(
    "click",
    enviarWhatsApp
);

// arma el mensaje con el carrito y abre whatsapp para mandar la cotizacion, facil y rapido
function enviarWhatsApp(){

    if(carrito.length === 0){

        alert(
            "No hay productos seleccionados"
        );

        return;

    }

    let mensaje =

`Hola, me gustaría solicitar una cotización.

`;

    carrito.forEach((item, index) => {
        const unidadTexto = item.unidadSeleccionada || item.unidad || '';
        const medidaTexto = item.medidaSeleccionada || item.medida || '';

        mensaje += `${index+1}. ${item.nombre}\n`;
        mensaje += `Código: ${item.codigo}\n`;
        if(unidadTexto) mensaje += `Unidad: ${unidadTexto}\n`;
        if(medidaTexto) mensaje += `Medida: ${medidaTexto}\n`;
        mensaje += `Cantidad: ${item.cantidad}\n\n`;

    });

    const telefono =
document.getElementById("sucursal").value;

const nombreSucursal =
document.getElementById("sucursal").selectedOptions[0].text;

mensaje +=
`Sucursal seleccionada: ${nombreSucursal}`;

const url =
`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(
        url,
        "_blank"
    );

}
const abrirCarrito =
document.getElementById(
    "abrirCarrito"
);

const cerrarCarrito =
document.getElementById(
    "cerrarCarrito"
);

if(abrirCarrito){

    abrirCarrito.addEventListener(
        "click",
        () => {

            document
            .getElementById("carrito")
            .classList
            .add("abierto");

        }
    );

}

if(cerrarCarrito){

    cerrarCarrito.addEventListener(
        "click",
        () => {

            document
            .getElementById("carrito")
            .classList
            .remove("abierto");

        }
    );

}// Lanza confeti y hace rebotar el boton del carrito cuando agregas algo, puro tiktok vibes
function lanzarConfetiCarrito(){

    const boton =
    document.getElementById("abrirCarrito");

    if(!boton || typeof confetti === "undefined") return;

    const rect =
    boton.getBoundingClientRect();

    confetti({
        particleCount: 80,
        spread: 70,
        origin: {
            x: (rect.left + rect.width/2) / window.innerWidth,
            y: (rect.top + rect.height/2) / window.innerHeight
        }
    });

    boton.classList.remove("rebote");

    void boton.offsetWidth;

    boton.classList.add("rebote");

    setTimeout(() => {
        boton.classList.remove("rebote");
    }, 600);
}
const abrirFiltros =
document.getElementById("abrirFiltros");

const panelFiltros =
document.querySelector(".filtros");

const overlayFiltros =
document.getElementById("overlayFiltros");

if(abrirFiltros){

    abrirFiltros.addEventListener(
        "click",
        () => {

            panelFiltros.classList.add("abierto");

            overlayFiltros.classList.add("activo");

        }
    );

}

if(overlayFiltros){

    overlayFiltros.addEventListener(
        "click",
        () => {

            panelFiltros.classList.remove("abierto");

            overlayFiltros.classList.remove("activo");

        }
    );

}