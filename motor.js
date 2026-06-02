// motor.js - Código unificado de UI, Lógica, Temas, Buscador, Escáner, Infografías en Canvas y Modo Intercambio

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
let modoIntercambioActivo = false;
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

// --- CONTROL DEL MENÚ LATERAL (SIDEBAR) ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
}

// --- CONSTRUCCIÓN DEL ÁLBUM ---
albumData.forEach((seccion, index) => {
    const titulo = document.createElement('div');
    titulo.className = 'section-title clickable'; 
    titulo.innerText = seccion.grupo;
    
    const grupoContentCont = document.createElement('div');
    grupoContentCont.className = 'group-content collapsed'; 
    grupoContentCont.id = `content-group-${index}`;

    const arrow = document.createElement('span');
    arrow.className = 'arrow'; arrow.id = `arrow-group-${index}`; arrow.innerText = '▼';
    titulo.appendChild(arrow);
    
    titulo.onclick = () => {
        const isCollapsed = grupoContentCont.classList.contains('collapsed');
        if (isCollapsed) { grupoContentCont.classList.remove('collapsed'); arrow.innerText = '▲'; }
        else { grupoContentCont.classList.add('collapsed'); arrow.innerText = '▼'; }
    };
    
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
function cambiarFiltro(tipo, elemento) { 
    filtroActual = tipo; 
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); 
    elemento.classList.add('active'); 
    
    // El escáner solo se muestra en la pestaña de repetidas
    const scannerWrapper = document.getElementById('scanner-container-wrapper');
    if (scannerWrapper && !modoIntercambioActivo) {
        if (tipo === 'repetidas') scannerWrapper.classList.remove('hidden');
        else scannerWrapper.classList.add('hidden');
    }
    actualizarTodo(); 
}
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
            if (textoBusqueda !== '' && grupoContentCont.classList.contains('collapsed')) {
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

// --- DICCIONARIO FIFA INTERNO ---
const mapaCodigosFIFA = {
    "FWC": "FWC", "CC": "Coca-Cola", 
    "MEX": "México", "RSA": "Sudáfrica", "KOR": "Corea del Sur", "CZE": "República Checa",
    "CAN": "Canadá", "BIH": "Bosnia y Herzegovina", "QAT": "Qatar", "SUI": "Suiza", 
    "BRA": "Brasil", "MAR": "Marruecos", "HAI": "Haití", "SCO": "Escocia", 
    "USA": "Estados Unidos", "PAR": "Paraguay", "AUS": "Australia", "TUR": "Turquía",
    "GER": "Alemania", "CUW": "Curazao", "CIV": "Costa de Marfil", "ECU": "Ecuador", 
    "NED": "Países Bajos", "JPN": "Japón", "SWE": "Suecia", "TUN": "Túnez", 
    "BEL": "Bélgica", "EGY": "Egipto", "IRN": "Irán", "NZL": "Nueva Zelanda",
    "ESP": "España", "CPV": "Cabo Verde", "KSA": "Arabia Saudita", "URU": "Uruguay", 
    "FRA": "Francia", "SEN": "Senegal", "IRQ": "Irak", "NOR": "Noruega", 
    "ARG": "Argentina", "ALG": "Argelia", "AUT": "Austria", "JOR": "Jordania",
    "POR": "Portugal", "COD": "RD Congo", "UZB": "Uzbekistán", "COL": "Colombia", 
    "ENG": "Inglaterra", "CRO": "Croacia", "GHA": "Ghana", "PAN": "Panamá"
};

// --- ESCÁNER EXPRESS DE INTERCAMBIO ---
function toggleScanner() {
    const box = document.getElementById('scanner-box');
    box.classList.toggle('hidden'); box.classList.toggle('collapsed');
}

function procesarIntercambio() {
    const texto = document.getElementById('scanner-input').value.toUpperCase();
    const resultadoDiv = document.getElementById('scanner-result');
    if (!texto.trim()) { resultadoDiv.innerHTML = '<span style="color:#ef4444;">Primero pega un texto.</span>'; return; }

    const regex = /([A-Z]{2,3})[^\w\d]*(\d{1,2})/g;
    let coincidencias; const repetidasParaDar = []; let estampasDetectadas = 0;

    while ((coincidencias = regex.exec(texto)) !== null) {
        const codigo = coincidencias[1]; let numero = parseInt(coincidencias[2], 10);
        const paisNombre = mapaCodigosFIFA[codigo];
        if (paisNombre) {
            estampasDetectadas++; if (paisNombre === 'FWC' && numero < 0) numero = 0; 
            const key = `${paisNombre}-E${numero}`; const cantidad = coleccion[key] || 0;
            if (cantidad > 1) repetidasParaDar.push(`<b>${codigo} ${numero}</b> (tienes ${cantidad - 1} de sobra)`);
        }
    }
    if (estampasDetectadas === 0) { resultadoDiv.innerHTML = '<span style="color:var(--text-muted);">No detecté códigos válidos (ej. MEX 10, ARG 3).</span>'; return; }
    if (repetidasParaDar.length > 0) {
        resultadoDiv.innerHTML = `✅ <b>¡Match encontrado!</b> Le puedes dar:<br><div style="margin-top:8px; padding:10px; background:rgba(34,197,94,0.15); border:1px solid var(--owned-bg); border-radius:6px;">${repetidasParaDar.join('<br>')}</div>`;
    } else { resultadoDiv.innerHTML = `❌ <b>Sin suerte.</b> La lista pide ${estampasDetectadas} estampas, pero no tienes ninguna repetida de esas.`; }
}

// --- GENERADOR DE INFOGRAFÍAS (CANVAS) ---
let globalCanvasUrl = ''; 
function agruparNumeros(numerosRaw, esFWC) {
    if (numerosRaw.length === 0) return "";
    let rangos = []; let inicio = numerosRaw[0]; let fin = numerosRaw[0];
    const formatNum = (n) => (esFWC && n < 10) ? '0' + n : n;

    for (let i = 1; i < numerosRaw.length; i++) {
        if (numerosRaw[i] === fin + 1) {
            fin = numerosRaw[i];
        } else {
            if (inicio === fin) rangos.push(`${formatNum(inicio)}`);
            else rangos.push(`${formatNum(inicio)}-${formatNum(fin)}`);
            inicio = numerosRaw[i]; fin = numerosRaw[i];
        }
    }
    if (inicio === fin) rangos.push(`${formatNum(inicio)}`);
    else rangos.push(`${formatNum(inicio)}-${formatNum(fin)}`);
    return rangos.join(', ');
}

function generarInfografia(tipo) {
    toggleSidebar();
    
    const listaFinal = [];
    estructuraCruda.forEach(grupo => {
        grupo.p.forEach(paisNombre => {
            const codigoFIFA = Object.keys(mapaCodigosFIFA).find(k => mapaCodigosFIFA[k] === paisNombre);
            if (!codigoFIFA) return;
            
            let inicio = 1, fin = 20;
            if (grupo.t === 'especial_fwc') { inicio = 0; fin = 19; }
            if (grupo.t === 'especial_coca') { inicio = 1; fin = 14; }
            
            const numerosRaw = [];
            for (let i = inicio; i <= fin; i++) {
                const q = coleccion[`${paisNombre}-E${i}`] || 0;
                if (tipo === 'faltantes' && q === 0) numerosRaw.push(i);
                else if (tipo === 'repetidas' && q > 1) numerosRaw.push(i);
            }
            if (numerosRaw.length > 0) {
                const esFWC = (grupo.t === 'especial_fwc');
                listaFinal.push({ cod: codigoFIFA, nums: agruparNumeros(numerosRaw, esFWC) });
            }
        });
    });

    if (listaFinal.length === 0) { alert(`Tu lista de "${tipo.toUpperCase()}" está vacía ahora mismo.`); return; }

    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    const width = 600; const padding = 25; const itemHeight = 35; const columnas = 2;
    const totalFilas = Math.ceil(listaFinal.length / columnas);
    const headerHeight = 90; const footerHeight = 45;
    const height = headerHeight + (totalFilas * itemHeight) + (padding * 2) + footerHeight;
    
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, width, height);
    
    const gradiente = ctx.createLinearGradient(0, 0, width, 0);
    gradiente.addColorStop(0, '#4f46e5'); gradiente.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradiente; ctx.fillRect(0, 0, width, headerHeight);
    
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px -apple-system, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(tipo === 'faltantes' ? '📋 MIS FALTANTES - MUNDIAL 2026' : '🔁 MIS REPETIDAS - MUNDIAL 2026', width / 2, 40);
    ctx.font = '13px -apple-system, sans-serif'; ctx.fillStyle = '#94a3b8';
    ctx.fillText('Actualizado al instante desde mi Sticker Tracker PWA', width / 2, 65);
    
    ctx.textAlign = 'left'; const colWidth = 260;
    
    listaFinal.forEach((item, index) => {
        const c = index % columnas; const r = Math.floor(index / columnas);
        const x = padding + (c * (colWidth + 30)); const y = headerHeight + padding + (r * itemHeight) + 15;
        
        ctx.fillStyle = tipo === 'faltantes' ? '#334155' : '#eab308'; ctx.fillRect(x, y - 16, 46, 22);
        ctx.fillStyle = tipo === 'faltantes' ? '#f8fafc' : '#0f172a'; ctx.font = 'bold 12px -apple-system, sans-serif'; ctx.fillText(item.cod, x + 8, y);
        
        ctx.fillStyle = '#f8fafc'; ctx.font = '13px monospace';
        let textoNums = item.nums; if (ctx.measureText(textoNums).width > colWidth - 55) ctx.font = '11px monospace';
        ctx.fillText(textoNums, x + 56, y);
    });
    
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, height - footerHeight, width, footerHeight);
    ctx.fillStyle = '#94a3b8'; ctx.font = 'italic 11px -apple-system, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('¿Tienes alguna? ¡Mándame mensaje y armamos el intercambio!', width / 2, height - 18);

    globalCanvasUrl = canvas.toDataURL('image/png');
    document.getElementById('modal-generated-img').src = globalCanvasUrl;
    document.getElementById('image-modal').classList.remove('hidden');
}
function cerrarModal() { document.getElementById('image-modal').classList.add('hidden'); }
function descargarImagen() {
    const link = document.createElement('a'); link.download = `Album2026_${filtroActual}_${Date.now()}.png`;
    link.href = globalCanvasUrl; link.click();
}

// --- NUEVO: MODO DÍA DE INTERCAMBIO ---
function toggleModoIntercambio() {
    modoIntercambioActivo = !modoIntercambioActivo;
    
    // Ocultar/Mostrar UI Principal
    document.getElementById('album-container').classList.toggle('hidden', modoIntercambioActivo);
    document.querySelector('.controls-row').classList.toggle('hidden', modoIntercambioActivo);
    document.querySelector('.filter-bar').classList.toggle('hidden', modoIntercambioActivo);
    
    const scannerWrap = document.getElementById('scanner-container-wrapper');
    if (modoIntercambioActivo) {
        if (scannerWrap) scannerWrap.classList.add('hidden');
    } else {
        if (scannerWrap && filtroActual === 'repetidas') scannerWrap.classList.remove('hidden');
    }

    const exchangeCont = document.getElementById('exchange-mode-container');
    if (modoIntercambioActivo) {
        if (document.getElementById('sidebar').classList.contains('open')) toggleSidebar();
        exchangeCont.classList.remove('hidden');
        renderizarGrillaIntercambio();
    } else {
        exchangeCont.classList.add('hidden');
        actualizarTodo(); 
    }
}

function renderizarGrillaIntercambio() {
    const grid = document.getElementById('exchange-grid');
    grid.innerHTML = '';
    
    const repetidas = [];
    estructuraCruda.forEach(grupo => {
        grupo.p.forEach(paisNombre => {
            const codigoFIFA = Object.keys(mapaCodigosFIFA).find(k => mapaCodigosFIFA[k] === paisNombre);
            let inicio = 1, fin = 20;
            if (grupo.t === 'especial_fwc') { inicio = 0; fin = 19; }
            if (grupo.t === 'especial_coca') { inicio = 1; fin = 14; }
            
            for (let i = inicio; i <= fin; i++) {
                const key = `${paisNombre}-E${i}`;
                const q = coleccion[key] || 0;
                if (q > 1) {
                    let numDisplay = (grupo.t === 'especial_fwc' && i < 10) ? '0'+i : i;
                    repetidas.push({ key, cod: codigoFIFA, num: numDisplay, qty: q });
                }
            }
        });
    });

    if (repetidas.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px; font-weight: bold; background: var(--card-bg); border-radius: 8px;">No tienes estampas repetidas disponibles.</div>';
        return;
    }

    repetidas.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'estampa-btn repeated';
        btn.style.height = '80px';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';
        
        btn.innerHTML = `
            <span style="font-size: 0.8rem; color: #000; opacity: 0.6; font-weight: 800; letter-spacing: 1px;">${item.cod}</span>
            <span style="font-size: 1.6rem; font-weight: 900; line-height: 1.1;">${item.num}</span>
            <span class="rep-badge" style="font-size: 0.85rem; padding: 2px 5px; bottom: 6px; right: 6px; top: auto;">+${item.qty - 1}</span>
        `;
        
        btn.onclick = () => {
            if (coleccion[item.key] > 1) {
                coleccion[item.key]--;
                localStorage.setItem('figuritas_core_2026', JSON.stringify(coleccion));
                
                if (coleccion[item.key] === 1) {
                    btn.remove();
                    if (grid.children.length === 0) {
                        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px; font-weight: bold; background: var(--card-bg); border-radius: 8px;">¡Te quedaste sin repetidas!</div>';
                    }
                } else {
                    btn.querySelector('.rep-badge').innerText = `+${coleccion[item.key] - 1}`;
                }
                actualizarTodo(); // Mantiene las estadísticas del header actualizadas en tiempo real
            }
        };
        grid.appendChild(btn);
    });
}

// --- NUEVO: CALCULADORA DE COSTO RESTANTE ---
function calcularCostoFaltante() {
    toggleSidebar();
    
    let faltantesNormales = 0;
    const COSTO_POR_ESTAMPA = 3.57;

    estructuraCruda.forEach(grupo => {
        if (grupo.t === 'especial_coca') return;
        
        grupo.p.forEach(paisNombre => {
            let inicio = 1, fin = 20;
            if (grupo.t === 'especial_fwc') { inicio = 0; fin = 19; }
            
            for (let i = inicio; i <= fin; i++) {
                const key = `${paisNombre}-E${i}`;
                const cantidad = coleccion[key] || 0;
                
                if (cantidad === 0) {
                    faltantesNormales++;
                }
            }
        });
    });

    if (faltantesNormales === 0) {
        alert("¡Felicidades! Ya tienes todas las estampas normales. Solo te falta preocuparte por las de Coca-Cola (si es que aún te faltan).");
        return;
    }

    const costoEstimado = (faltantesNormales * COSTO_POR_ESTAMPA).toFixed(2);
    
    alert(`📊 INFORME DE ÁLBUM:\n\nTe faltan ${faltantesNormales} estampas (sin contar las especiales de Coca-Cola).\n\n💸 Dinero estimado necesario: $${costoEstimado} MXN.`);
}

inicializarTema();
actualizarTodo();