// motor.js - Código unificado de UI, Lógica, Temas y Buscador

const estructuraCruda = [
    { g: "FWC", t: "especial_fwc", p: ["FWC"], b: ["🏆"] },
    { g: "Grupo A", t: "estandar", p: ["México", "Sudáfrica", "Corea del Sur", "República Checa"], c: ["mx","za","kr","cz"] },
    { g: "Grupo B", t: "estandar", p: ["Canadá", "Bosnia y Herzegovina", "Qatar", "Suiza"], c: ["ca","ba","qa","ch"] },
    { g: "Grupo C", t: "estandar", p: ["Brasil", "Marruecos", "Haití", "Escocia"], c: ["br","ma","ht","gb-sct"] },
    { g: "Grupo D", t: "estandar", p: ["Estados Unidos", "Paraguay", "Australia", "Turquía"], c: ["us","py","au","tr"] },
    { g: "Grupo E", t: "estandar", p: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"], c: ["de","cw","ci","ec"] },
    { g: "Grupo F", t: "estandar", p: ["Países Bajos", "Japón", "Suecia", "Túnez"], c: ["nl","jp","se","tn"] },
    { g: "Grupo G", t: "estandar", p: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"], c: ["be","eg","ir","nz"] },
    { g: "Grupo H", t: "estandar", p: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"], c: ["es","cv","sa","uy"] },
    { g: "Grupo I", t: "estandar", p: ["Francia", "Senegal", "Irak", "Noruega"], c: ["fr","sn","iq","no"] },
    { g: "Grupo J", t: "estandar", p: ["Argentina", "Argelia", "Austria", "Jordania"], c: ["ar","dz","at","jo"] },
    { g: "Grupo K", t: "estandar", p: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"], c: ["pt","cd","uz","co"] },
    { g: "Grupo L", t: "estandar", p: ["Inglaterra", "Croacia", "Ghana", "Panamá"], c: ["gb-eng","hr","gh","pa"] },
    { g: "Coca-Cola", t: "especial_coca", p: ["Coca-Cola"], b: ["🥤"] }
];

const albumData = estructuraCruda.map(grupo => {
    return {
        grupo: grupo.g, tipo: grupo.t,
        paises: grupo.p.map((nombrePais, idx) => {
            let elementoBandera = "";
            if (grupo.t === 'estandar') {
                elementoBandera = `<img src="https://flagcdn.com/w40/${grupo.c[idx]}.png" style="width:24px; height:auto; border-radius:3px; vertical-align:middle;">`;
            } else {
                elementoBandera = `<span style="font-size:1.2rem;">${grupo.b[idx]}</span>`;
            }
            return { nombre: nombrePais, banderaHtml: elementoBandera };
        })
    };
});

const TOTAL_ESTAMPAS = 20 + (48 * 20) + 14; 
let coleccion = JSON.parse(localStorage.getItem('figuritas_core_2026')) || {};
let filtroActual = 'todos';
let textoBusqueda = '';
const container = document.getElementById('album-container');

// --- GESTIÓN DE TEMAS (APARIENCIA) ---
function inicializarTema() {
    const temaGuardado = localStorage.getItem('album_tema') || 'dark';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    const selector = document.getElementById('theme-selector');
    if (selector) selector.value = temaGuardado;
}

function cambiarTema(nuevoTema) {
    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('album_tema', nuevoTema);
}

// --- CONSTRUCCIÓN DEL ÁLBUM ---
albumData.forEach((seccion, index) => {
    const titulo = document.createElement('div');
    titulo.className = 'section-title';
    titulo.innerText = seccion.grupo;
    const grupoContentCont = document.createElement('div');
    grupoContentCont.className = 'group-content';
    grupoContentCont.id = `content-group-${index}`;

    if (seccion.tipo === 'estandar') {
        titulo.classList.add('clickable');
        const arrow = document.createElement('span');
        arrow.className = 'arrow'; arrow.id = `arrow-group-${index}`; arrow.innerText = '▼';
        titulo.appendChild(arrow);
        grupoContentCont.classList.add('collapsed');
        titulo.onclick = () => {
            const isCollapsed = grupoContentCont.classList.contains('collapsed');
            if (isCollapsed) { grupoContentCont.classList.remove('collapsed'); arrow.innerText = '▲'; }
            else { grupoContentCont.classList.add('collapsed'); arrow.innerText = '▼'; }
        };
    }
    container.appendChild(titulo);

    seccion.paises.forEach(paisObj => {
        const paisNombre = paisObj.nombre;
        const card = document.createElement('div');
        card.className = 'pais-card'; card.setAttribute('data-pais', paisNombre);
        const header = document.createElement('div'); header.className = 'pais-header';
        const info = document.createElement('div'); info.className = 'pais-info';
        const nombreHTML = document.createElement('div'); nombreHTML.className = 'pais-nombre';
        nombreHTML.innerHTML = `${paisObj.banderaHtml} <span>${paisNombre}</span>`;
        const cont = document.createElement('div'); cont.className = 'pais-contador'; cont.id = `count-${paisNombre}`;

        info.appendChild(nombreHTML); info.appendChild(cont); header.appendChild(info);
        const reset = document.createElement('button'); reset.className = 'btn-reset'; reset.innerText = 'REINICIAR';
        reset.onclick = (e) => { e.stopPropagation(); reiniciarPais(paisNombre, seccion.tipo); };
        header.appendChild(reset); card.appendChild(header);

        const grid = document.createElement('div'); grid.className = 'grid-estampas';
        let inicioLoop = 1, finLoop = 20;
        if (seccion.tipo === 'especial_fwc') { inicioLoop = 0; finLoop = 19; }
        if (seccion.tipo === 'especial_coca') { inicioLoop = 1; finLoop = 14; }

        for (let i = inicioLoop; i <= finLoop; i++) {
            const btn = document.createElement('button'); btn.className = 'estampa-btn'; btn.id = `btn-${paisNombre}-${i}`;
            btn.innerText = seccion.tipo === 'especial_fwc' ? (i < 10 ? '0' + i : i) : i;
            const key = `${paisNombre}-E${i}`;
            actualizarStyleBoton(btn, coleccion[key] || 0);

            btn.addEventListener('click', () => { coleccion[key] = (coleccion[key] || 0) + 1; guardarYActualizar(btn, key, coleccion[key]); });
            btn.addEventListener('contextmenu', (e) => { e.preventDefault(); descontarEstampa(btn, key); });
            let tMousedown;
            btn.addEventListener('touchstart', () => { tMousedown = setTimeout(() => { descontarEstampa(btn, key); tMousedown = null; }, 600); });
            btn.addEventListener('touchend', (e) => { if (tMousedown) clearTimeout(tMousedown); else e.preventDefault(); });
            grid.appendChild(btn);
        }
        card.appendChild(grid); grupoContentCont.appendChild(card);
    });
    container.appendChild(grupoContentCont);
});

function descontarEstampa(btn, key) {
    if ((coleccion[key] || 0) > 0) {
        coleccion[key]--;
        if (coleccion[key] === 0) delete coleccion[key];
        guardarYActualizar(btn, key, coleccion[key] || 0);
    }
}
function guardarYActualizar(btn, key, estado) { localStorage.setItem('figuritas_core_2026', JSON.stringify(coleccion)); actualizarStyleBoton(btn, estado); actualizarTodo(); }
function actualizarStyleBoton(btn, cantidad) {
    btn.classList.remove('owned', 'repeated'); const badge = btn.querySelector('.rep-badge'); if (badge) badge.remove();
    if (cantidad === 1) btn.classList.add('owned');
    else if (cantidad > 1) { btn.classList.add('repeated'); const b = document.createElement('span'); b.className = 'rep-badge'; b.innerText = `+${cantidad - 1}`; btn.appendChild(b); }
}
function reiniciarPais(paisNombre, tipo) {
    if (confirm(`¿Reiniciar ${paisNombre}?`)) {
        let inicio = 1, fin = 20; if (tipo === 'especial_fwc') { inicio = 0; fin = 19; } if (tipo === 'especial_coca') { inicio = 1; fin = 14; }
        for (let i = inicio; i <= fin; i++) { const key = `${paisNombre}-E${i}`; delete coleccion[key]; const b = document.getElementById(`btn-${paisNombre}-${i}`); if (b) actualizarStyleBoton(b, 0); }
        localStorage.setItem('figuritas_core_2026', JSON.stringify(coleccion)); actualizarTodo();
    }
}

// --- LOGICA DE FILTROS Y BUSCADOR ---
function cambiarFiltro(tipo, elemento) { filtroActual = tipo; document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); elemento.classList.add('active'); actualizarTodo(); }
function filtrarPorBusqueda() { textoBusqueda = document.getElementById('search-box').value.toLowerCase().trim(); actualizarTodo(); }

function actualizarTodo() {
    let t = 0, r = 0;
    albumData.forEach((seccion, idx) => {
        let paisesOcultosEnSeccion = 0;
        const grupoContentCont = document.getElementById(`content-group-${idx}`);
        
        seccion.paises.forEach(p => {
            let pCount = 0, vCount = 0;
            let inicio = 1, fin = 20; if (seccion.tipo === 'especial_fwc') { inicio = 0; fin = 19; } if (seccion.tipo === 'especial_coca') { inicio = 1; fin = 14; }
            
            for (let i = inicio; i <= fin; i++) {
                const q = coleccion[`${p.nombre}-E${i}`] || 0; const b = document.getElementById(`btn-${p.nombre}-${i}`);
                if (q >= 1) t++; if (q > 1) r += (q - 1); if (q >= 1) pCount++;
                let vis = !(filtroActual === 'faltantes' && q > 0 || filtroActual === 'repetidas' && q <= 1);
                if (vis) { if (b) b.classList.remove('hidden'); vCount++; } else { if (b) b.classList.add('hidden'); }
            }
            
            const elCont = document.getElementById(`count-${p.nombre}`);
            if (elCont) elCont.innerText = `${pCount} / ${(fin - inicio) + 1}`;
            
            const card = document.querySelector(`[data-pais="${p.nombre}"]`);
            if (card) {
                // El país coincide con la búsqueda textual
                const coincideBusqueda = p.nombre.toLowerCase().includes(textoBusqueda);
                
                if (!coincideBusqueda || (vCount === 0 && filtroActual !== 'todos')) { 
                    card.classList.add('hidden'); 
                    paisesOcultosEnSeccion++; 
                } else { 
                    card.classList.remove('hidden'); 
                }
            }
        });
        
        const tit = Array.from(document.querySelectorAll('.section-title')).find(el => el.childNodes[0].textContent.trim() === seccion.grupo);
        if (paisesOcultosEnSeccion === seccion.paises.length) { 
            if (tit) tit.classList.add('hidden'); 
            if (grupoContentCont) grupoContentCont.classList.add('hidden');
        } else { 
            if (tit) tit.classList.remove('hidden'); 
            if (grupoContentCont) grupoContentCont.classList.remove('hidden');
            // Si el usuario escribe una búsqueda, forzamos la apertura temporal para que vea el resultado rápido
            if (textoBusqueda !== '' && seccion.tipo === 'estandar' && grupoContentCont.classList.contains('collapsed')) {
                grupoContentCont.classList.remove('collapsed');
                const arrow = document.getElementById(`arrow-group-${idx}`);
                if (arrow) arrow.innerText = '▲';
            }
        }
    });
    
    const f = TOTAL_ESTAMPAS - t, pct = Math.round((t / TOTAL_ESTAMPAS) * 100) || 0;
    const elPct = document.getElementById('stat-pct'); if (elPct) elPct.innerText = `${pct}%`;
    const elTengo = document.getElementById('stat-tengo'); if (elTengo) elTengo.innerText = t;
    const elFalta = document.getElementById('stat-falta'); if (elFalta) elFalta.innerText = f;
    const elRep = document.getElementById('stat-rep'); if (elRep) elRep.innerText = r;
    const elRing = document.getElementById('chart-ring'); if (elRing) elRing.style.strokeDashoffset = 113.1 - (pct / 100) * 113.1;
}

// Inicializadores obligatorios al cargar la app
inicializarTema();
actualizarTodo();