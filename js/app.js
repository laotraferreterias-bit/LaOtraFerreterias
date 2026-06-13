let productos = [];
let productosFiltrados = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const PRODUCTOS_POR_PAGINA = 40;
let categoriaSeleccionada = "";
let subcategoriaSeleccionada = "";
let paginaActual = 1;
//Ahi le pongo comentarios porque me dijiste xd
//Este toma los productos del json y ya
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
// Hace los botones de categorias y subcat, nada mas.
// Si le das click cambia el filtro y se vuelve a dibujar todo.
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
// Calcula los productos que tocan en esta pag y los muestra.
function mostrarProductosPagina(){

    const inicio =
        (paginaActual - 1) *
        PRODUCTOS_POR_PAGINA;

    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;

    const pagina =
    agruparProductos(
        productosFiltrados
    ).slice(inicio, fin);

    mostrarProductos(pagina);

    actualizarPaginacion();

}
// Pinta los productos en pantalla.
// Crea cada tarjeta con su info y boton para agregar.
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

        tarjeta.innerHTML = `

            ${
                //Por si no hay imagen
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
               
            ${
                producto.medida
                ? `
                <div class="codigo">
                    Medida: ${producto.medida}
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

        <label>Medida</label>

        <select
            class="selectorMedida"
            data-nombre="${producto.nombre}">
            
            ${
            //Para las variantes que hay de los productos (Las medidas)
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

            </div>

            <div class="card-footer">
                <button
                    data-codigo="${
                        tieneVariantes
                        ? producto.variantes[0].codigo
                        : producto.codigo
                    }">
                        Agregar
                </button>
            </div>

        `;

        const boton =
            tarjeta.querySelector(
                "button"
            );

        boton.addEventListener(
            "click",
            () => agregarCarrito(boton.dataset.codigo)
        );

        contenedor.appendChild(
            tarjeta
        );

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

                    boton.dataset.codigo =
                        selector.value;

                    if(variante && imagen){
                        imagen.src = variante.imagen || producto.imagen || "";
                    }

                }
            );

        }

    });

}

// Mete el producto al carrito con el codigo.
// Si ya esta, le suma 1.
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

// Guarda el carrito en el navegador y actualiza la vista (como me enseño victor xd)
function guardarCarrito(){

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    actualizarCarrito();

}

// Refresca la lista del carrito y el contador de items.
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

// Cambia la cantidad de ese producto en el carrito.
// Si se pone en 0 lo borra.
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
// Actualiza la cantidad con el numero que escribió el user.
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
// Saca el producto del carrito y guarda.
function eliminarProducto(codigo){

    carrito = carrito.filter(
        p => String(p.codigo) !== String(codigo)
    );

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
// Aplica el filtro del buscador y las categorias y muestra el resultado.
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

// Arma el mensaje con el carrito y abre WhatsApp para mandar la cotizacion(Ahora por sucursales jsjsjs).
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

}// Lanza confeti y hace rebotar el boton del carrito cuando agregas algo(Gracias a un video de tik tok le agregue esto).
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
