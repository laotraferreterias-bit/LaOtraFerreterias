let productos = [];
let productosFiltrados = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const TELEFONO = "529341128504";

const PRODUCTOS_POR_PAGINA = 40;

let paginaActual = 1;

fetch("data/productos.json")
.then(res => res.json())
.then(data => {

    productos = data;
    productosFiltrados = [...productos];

    cargarCategorias();   // ← AGREGA ESTA LÍNEA

    mostrarProductosPagina();
    actualizarCarrito();

})
.catch(error => {

    console.error(error);

});

function mostrarProductosPagina(){

    const inicio =
        (paginaActual - 1) *
        PRODUCTOS_POR_PAGINA;

    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;

    const pagina =
        productosFiltrados.slice(
            inicio,
            fin
        );

    mostrarProductos(pagina);

    actualizarPaginacion();

}

function mostrarProductos(lista){

    const contenedor =
    document.getElementById("productos");

    contenedor.innerHTML = "";

    lista.forEach(producto => {

        const tarjeta =
        document.createElement("div");

        tarjeta.className = "card";

        tarjeta.innerHTML = `

            ${
                producto.imagen ?

                `<img
                    src="${producto.imagen}"
                    loading="lazy"
                    alt="${producto.nombre}"
                    onerror="this.outerHTML='<div class=sin-imagen>Sin imagen</div>'"
                >`

                :

                `<div class="sin-imagen">
                    Sin imagen
                </div>`
            }

            <div class="card-body">

                <h3>${producto.nombre}</h3>

                <div class="codigo">
                    Código:
                    ${producto.codigo}
                </div>

                <div class="codigo">
                    Unidad:
                    ${producto.unidad || producto.Unidad || ""}
                </div>


                <button
                data-codigo="${producto.codigo}">

                    Agregar

                </button>

            </div>

        `;

        tarjeta
        .querySelector("button")
        .addEventListener(
            "click",
            () => agregarCarrito(producto.codigo)
        );

        contenedor.appendChild(
            tarjeta
        );

    });

}

function agregarCarrito(codigo){

    const carritoVacio = carrito.length === 0;

    const producto =
    productos.find(
        p =>
        String(p.codigo)
        ===
        String(codigo)
    );

    if(!producto) return;

    const existente =
    carrito.find(
        p =>
        String(p.codigo)
        ===
        String(codigo)
    );

    if(existente){

        existente.cantidad++;

    }else{

        carrito.push({

            ...producto,

            cantidad:1

        });

    }

    guardarCarrito();

    if(carritoVacio){

    lanzarConfetiCarrito();

}

}

function guardarCarrito(){

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    actualizarCarrito();

}

function actualizarCarrito(){

    const lista =
    document.getElementById(
        "listaCarrito"
    );

    lista.innerHTML = "";

    let total = 0;

    carrito.forEach(item => {

        total += item.cantidad;

        const div =
        document.createElement("div");

        div.className =
        "itemCarrito";

        div.innerHTML = `

            <strong>

                ${item.nombre}

            </strong>

            <br>

            Código:
            ${item.codigo}

            <div class="controles">

    <button
    onclick="cambiarCantidad('${item.codigo}',-1)">
        −
    </button>

    <input
        type="number"
        min="1"
        value="${item.cantidad}"
        onchange="actualizarCantidad('${item.codigo}', this.value)"
        class="cantidadInput"
    >

    <button
    onclick="cambiarCantidad('${item.codigo}',1)">
        +
    </button>

    <button
    class="btnEliminar"
    onclick="eliminarProducto('${item.codigo}')">
        🗑️
    </button>

</div>

        `;

        lista.appendChild(div);

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

function cambiarCantidad(
    codigo,
    cambio
){

    const item =
    carrito.find(
        p =>
        String(p.codigo)
        ===
        String(codigo)
    );

    if(!item) return;

    item.cantidad += cambio;

    if(item.cantidad <= 0){

        carrito =
        carrito.filter(
            p =>
            String(p.codigo)
            !==
            String(codigo)
        );

    }

    guardarCarrito();

}
function actualizarCantidad(codigo, nuevaCantidad){

    nuevaCantidad = parseInt(nuevaCantidad);

    if(isNaN(nuevaCantidad) || nuevaCantidad < 1){

        eliminarProducto(codigo);
        return;
    }

    const item = carrito.find(
        p => String(p.codigo) === String(codigo)
    );

    if(!item) return;

    item.cantidad = nuevaCantidad;

    guardarCarrito();

}
function eliminarProducto(codigo){

    carrito = carrito.filter(
        p => String(p.codigo) !== String(codigo)
    );

    guardarCarrito();

}
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
        productosFiltrados.length
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

function paginaSiguiente(){

    const totalPaginas =
    Math.ceil(
        productosFiltrados.length
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

function cargarCategorias(){

    const select =
    document.getElementById(
        "filtroCategoria"
    );

    const categorias = [

        ...new Set(
            productos
            .map(p => p.categoria)
        )

    ].sort();

    categorias.forEach(cat => {

        const opcion =
        document.createElement("option");

        opcion.value = cat;

        opcion.textContent = cat;

        select.appendChild(opcion);

    });

}
function normalizarTexto(texto){

    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}
function aplicarFiltros(){

    const texto =
    normalizarTexto(
        document
        .getElementById("buscador")
        .value
    );

    const categoria =
    document
    .getElementById("filtroCategoria")
    .value;

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

            categoria === ""

            ||

            producto.categoria === categoria;

        return (
            coincideTexto
            &&
            coincideCategoria
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
.getElementById("filtroCategoria")
.addEventListener(
    "change",
    aplicarFiltros
);

document
.getElementById("btnWhats")
.addEventListener(
    "click",
    enviarWhatsApp
);

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

    carrito.forEach(
        (item,index)=>{

        mensaje +=

`${index+1}. ${item.nombre}
Código: ${item.codigo}
Cantidad: ${item.cantidad}

`;

    });

    const url =

`https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`;

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

}
function lanzarConfetiCarrito(){

    const boton =
    document.getElementById("abrirCarrito");

    if(!boton || typeof confetti === "undefined") return;

    const rect =
    boton.getBoundingClientRect();

    const x =
    (rect.left + rect.width/2) / window.innerWidth;

    const y =
    (rect.top + rect.height/2) / window.innerHeight;

    confetti({

        particleCount: 80,

        spread: 70,

        origin: {
            x: x,
            y: y
        }

    });

}
boton.classList.add("rebote");

setTimeout(() => {
    boton.classList.remove("rebote");
}, 600);