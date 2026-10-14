/* Comportamiento de la página: cotizador, gente pintada, tablero de precios, visor y animación. */
(function () {
  'use strict';

  var T = window.TARIFAS;
  var C = window.Cotizador;
  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- precios en la página, siempre desde tarifas.js ---------- */
  $$('[data-desde]').forEach(function (el) { el.textContent = C.pesos(T.pasadia.grupos[0][1]); });
  $$('[data-desde-cu]').forEach(function (el) { el.textContent = C.pesos(T.pasadia.grupos[0][1] / T.pasadia.grupos[0][0]); });
  var resumen = $('[data-resumen]');
  var waFlotante = $('[data-wa-flotante]');
  var precioPlan = {
    pasadia: 'Desde ' + C.pesos(T.pasadia.grupos[0][1]),
    estadia: 'Desde ' + C.pesos(T.estadia.grupos[0][1]),
    noche: C.pesos(T.noche.porPersona) + ' por persona'
  };
  $$('[data-plan-precio]').forEach(function (el) { el.textContent = precioPlan[el.dataset.planPrecio]; });

  function fila(dl, etiqueta, valor) {
    var g = document.createElement('div');
    var dt = document.createElement('dt'); dt.textContent = etiqueta;
    var p = document.createElement('span'); p.className = 'puntos'; p.setAttribute('aria-hidden', 'true');
    var dd = document.createElement('dd'); dd.textContent = valor;
    g.append(dt, p, dd);
    dl.appendChild(g);
  }
  var tPasadia = $('[data-tabla="pasadia"]');
  if (tPasadia) T.pasadia.grupos.forEach(function (g) { fila(tPasadia, 'Hasta ' + g[0] + ' personas', C.pesos(g[1])); });
  var tHoras = $('[data-tabla="horas"]');
  if (tHoras) T.pasadia.horasExtra.forEach(function (v, h) { if (h) fila(tHoras, h === 1 ? '1 hora' : h + ' horas', C.pesos(v)); });
  var tEstadia = $('[data-tabla="estadia"]');
  if (tEstadia) {
    T.estadia.grupos.forEach(function (g) { fila(tEstadia, 'Hasta ' + g[0] + ' personas', C.pesos(g[1])); });
    fila(tEstadia, 'Persona adicional', C.pesos(T.estadia.personaAdicional));
  }
  var tNoche = $('[data-tabla="noche"]');
  if (tNoche) fila(tNoche, 'Con desayuno', C.pesos(T.noche.porPersona));

  /* ---------- gente pintada en la escena ---------- */
  var capa = $('[data-gente]');
  var cuentaEscena = $('[data-escena-cuenta]');
  var numeroEscena = $('[data-escena-numero]');
  // 29 figuras sueltas con su alto en píxeles (las parejas y el papá con el niño en hombros cuentan doble, no se usan)
  var FIGURAS = [
    [1, 399], [2, 382], [3, 385], [4, 396], [5, 300], [6, 321], [7, 370], [8, 395], [10, 372],
    [11, 378], [12, 263], [13, 374], [14, 384], [16, 378], [17, 399], [18, 403], [19, 398], [20, 347],
    [21, 396], [22, 383], [23, 395], [24, 402], [25, 391], [26, 377], [27, 386], [28, 394], [29, 321],
    [30, 384], [32, 386]
  ];
  var ADULTO = 396;          // estatura de referencia de un adulto en el recorte
  var ALTO_FRENTE = 30;      // un adulto en primer plano mide 30% del alto de la escena
  var PIE_ATRAS = 31;        // el prado termina a este % desde abajo (después viene la casa)
  var semilla = 13;
  function azar() { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; }

  // puestos sobre el prado: llegan en grupitos, con perspectiva (atrás más pequeños) y sin chocarse
  var puestos = (function () {
    var lista = [];
    function libre(x, prof) {
      var ancho = 3.2 * (1 - 0.55 * prof);           // separación mínima, más apretada al fondo
      for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        if (Math.abs(p.prof - prof) < 0.08 && Math.abs(p.x - x) < ancho) return false;
      }
      return true;
    }
    var intentos = 0;
    while (lista.length < 80 && intentos < 6000) {
      intentos++;
      // centro del grupo: primero adelante y al centro, luego se va abriendo hacia los lados y el fondo
      var avance = lista.length / 80;
      var prof = Math.min(0.98, Math.pow(azar(), 1.6 - avance) * (0.35 + avance * 0.75));
      var abierto = 20 + avance * 42;
      var cx = 50 + (azar() - 0.5) * 2 * abierto;
      var tam = 2 + Math.floor(azar() * 3);           // grupos de 2 a 4
      for (var k = 0; k < tam && lista.length < 80; k++) {
        var x = cx + (k - (tam - 1) / 2) * 3.4 * (1 - 0.5 * prof) + (azar() - 0.5) * 1.5;
        var pr = Math.max(0, Math.min(1, prof + (azar() - 0.5) * 0.06));
        if (x < 4 || x > 96 || !libre(x, pr)) continue;
        lista.push({ x: x, prof: pr });
      }
    }
    // figuras repartidas en ciclos barajados: nunca se repite una antes de usarlas todas
    var orden = [];
    while (orden.length < lista.length) {
      var ciclo = FIGURAS.slice();
      for (var j = ciclo.length - 1; j > 0; j--) { var r = Math.floor(azar() * (j + 1)); var tmp = ciclo[j]; ciclo[j] = ciclo[r]; ciclo[r] = tmp; }
      if (orden.length && ciclo[0] === orden[orden.length - 1]) ciclo.push(ciclo.shift());
      orden = orden.concat(ciclo);
    }
    lista.forEach(function (p, i) { p.figura = orden[i]; p.espejo = Math.floor(i / FIGURAS.length) % 2 === 1 ? azar() < 0.7 : azar() < 0.25; });
    return lista;
  })();

  function persona(i) {
    var p = puestos[i];
    var escala = 1 - 0.55 * p.prof;                     // perspectiva
    var el = document.createElement('div');
    el.className = 'persona';
    el.style.left = p.x.toFixed(2) + '%';
    el.style.bottom = (2 + p.prof * (PIE_ATRAS - 2)).toFixed(2) + '%';
    el.style.height = (ALTO_FRENTE * escala * p.figura[1] / ADULTO).toFixed(2) + '%';
    el.style.zIndex = String(1000 - Math.round(p.prof * 900));
    var img = document.createElement('img');
    img.src = 'assets/img/gente/persona-' + String(p.figura[0]).padStart(2, '0') + '.webp';
    img.alt = '';
    img.decoding = 'async';
    if (p.espejo) img.className = 'espejo';
    el.appendChild(img);
    return el;
  }

  var pintadas = [];
  function pintarGente(n) {
    if (!capa) return;
    n = Math.max(0, Math.min(80, n || 0));
    if (cuentaEscena) cuentaEscena.textContent = n === 1 ? '1 persona' : n + ' personas';
    if (numeroEscena) numeroEscena.textContent = n;
    var nuevas = 0;
    while (pintadas.length < n) {
      var el = persona(pintadas.length);
      capa.appendChild(el);
      pintadas.push(el);
      if (!reducir && el.animate) {
        el.animate(
          [
            { transform: 'translate(-50%, 14%) scale(0.92)', opacity: 0 },
            { transform: 'translate(-50%, -3%) scale(1.01)', opacity: 1, offset: 0.7 },
            { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }
          ],
          { duration: 420, delay: Math.min(nuevas, 16) * 28, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' }
        );
      }
      nuevas++;
    }
    while (pintadas.length > n) {
      var sale = pintadas.pop();
      if (!reducir && sale.animate) {
        var a = sale.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%, 8%)' }], { duration: 160, easing: 'ease-out' });
        a.onfinish = (function (e) { return function () { e.remove(); }; })(sale);
      } else {
        sale.remove();
      }
    }
  }

  /* ---------- cotizador ---------- */
  var form = $('[data-cotizador]');
  if (form) {
    var inPersonas = $('#personas', form);
    var deslizador = $('[data-deslizador]', form);
    var campoHoras = $('[data-campo-horas]', form);
    var ayuda = $('[data-ayuda-personas]', form);
    var frase = $('[data-frase]', form);
    var desglose = $('[data-desglose]', form);
    var abono = $('[data-abono]', form);
    var avisos = $('[data-avisos]', form);
    var enlace = $('[data-wa-reserva]', form);
    var porPersona = $('[data-por-persona]', form);
    var inFecha = $('#fecha', form);
    var inNombre = $('#nombre', form);

    // la fecha no puede ser en el pasado
    var hoy = new Date();
    inFecha.min = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');

    var MAX = { pasadia: 80, estadia: T.estadia.maxPersonas, noche: T.noche.maxPersonas };
    var AYUDA = {
      pasadia: 'Adultos y niños cuentan igual. Pasadía de 1 a 80 personas.',
      estadia: 'Hasta 20 personas el precio es por grupo; de ahí en adelante, ' + C.pesos(T.estadia.personaAdicional) + ' por persona en hamaca o colchoneta.',
      noche: 'En cama caben ' + T.noche.maxPersonas + ' personas. Fines de semana, desde 3.'
    };

    function plan() { return form.elements.plan.value; }

    function leer() {
      return {
        plan: plan(),
        personas: parseInt(inPersonas.value, 10),
        horasExtra: plan() === 'pasadia' ? form.elements.horasExtra.value : 0,
        fecha: inFecha.value
      };
    }

    function pintar() {
      var p = plan();
      var max = MAX[p];
      inPersonas.max = max;
      deslizador.max = max;
      campoHoras.disabled = p !== 'pasadia';
      ayuda.textContent = AYUDA[p];
      ayuda.classList.remove('es-aviso');

      var n = parseInt(inPersonas.value, 10);
      if (Number.isInteger(n)) deslizador.value = Math.min(Math.max(n, 1), max);
      pintarGente(Number.isInteger(n) ? Math.min(n, 80) : 0);

      var r = C.cotizar(leer());
      desglose.textContent = '';
      avisos.textContent = '';
      if (!r.ok) {
        frase.textContent = r.motivo;
        frase.classList.add('es-error');
        abono.textContent = '';
        porPersona.textContent = '';
        if (resumen) resumen.textContent = 'Arma tu paseo';
        enlace.setAttribute('aria-disabled', 'true');
        enlace.href = C.urlWhatsApp(C.mensajeWhatsApp(r, inNombre.value.trim()));
        if (n > max) { ayuda.textContent = 'Máximo ' + max + ' personas en este plan.'; ayuda.classList.add('es-aviso'); }
        return;
      }
      frase.classList.remove('es-error');
      // la cifra resaltada dentro de la frase
      var total = C.pesos(r.total);
      var partes = r.frase.split(total);
      frase.textContent = partes[0];
      var cifra = document.createElement('span');
      cifra.className = 'cifra';
      cifra.textContent = total;
      frase.append(cifra, partes.slice(1).join(total));

      r.desglose.forEach(function (d) {
        var li = document.createElement('li');
        var a = document.createElement('span'); a.textContent = d[0];
        var b = document.createElement('span'); b.textContent = C.pesos(d[1]);
        li.append(a, b);
        desglose.appendChild(li);
      });
      abono.textContent = 'Para reservar: ' + C.pesos(r.abono) + ' (50%). El saldo, ' + C.pesos(r.saldo) + ', un día antes.';
      r.avisos.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; avisos.appendChild(li); });
      porPersona.textContent = r.personas > 1 ? 'Sale a ' + C.pesos(r.porPersona) + ' por persona.' : '';
      enlace.removeAttribute('aria-disabled');
      enlace.href = C.urlWhatsApp(C.mensajeWhatsApp(r, inNombre.value.trim()));
      if (resumen) {
        resumen.textContent = r.personas + (r.personas === 1 ? ' persona · ' : ' personas · ') + r.nombre + ' · ';
        var bt = document.createElement('b'); bt.textContent = C.pesos(r.total); resumen.appendChild(bt);
      }
      if (waFlotante) waFlotante.href = enlace.href;
    }

    form.addEventListener('input', function (e) {
      if (e.target === deslizador) inPersonas.value = deslizador.value;
      pintar();
    });
    form.addEventListener('change', pintar);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-paso]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = parseInt(inPersonas.value, 10) || 0;
        inPersonas.value = Math.max(1, Math.min(MAX[plan()], n + Number(b.dataset.paso)));
        pintar();
      });
    });

    // ocasiones: arman el paseo y llevan al cotizador
    $$('[data-ocasiones] [data-plan]').forEach(function (b) {
      b.addEventListener('click', function () {
        form.elements.plan.value = b.dataset.plan;
        inPersonas.value = b.dataset.personas;
        pintar();
        $('#cotiza').scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
        setTimeout(function () { inPersonas.focus({ preventScroll: true }); }, reducir ? 0 : 600);
      });
    });

    pintar();
  }

  // enlaces directos de WhatsApp con un saludo
  $$('[data-wa-simple]').forEach(function (a) {
    a.href = C.urlWhatsApp('Hola, quiero información de la Casafinca El Tesoro del Sinú.');
  });

  /* ---------- barra superior y menú ---------- */
  var barra = $('[data-barra]');
  var botonMenu = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  var barraMovil = $('[data-barra-movil]');
  var portada = $('#inicio');
  var cotiza = $('#cotiza');

  function alDesplazar() {
    var y = window.scrollY;
    if (barra) barra.classList.toggle('es-fija', y > (portada ? portada.offsetHeight - 80 : 200));
    if (barraMovil && cotiza) {
      var r = cotiza.getBoundingClientRect();
      var enCotiza = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.3;
      var portadaFin = portada ? portada.getBoundingClientRect().bottom : 0;
      barraMovil.classList.toggle('visible', portadaFin < 0 && !enCotiza);
    }
  }
  var pendiente = false;
  window.addEventListener('scroll', function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; alDesplazar(); });
  }, { passive: true });
  alDesplazar();

  if (botonMenu && menu) {
    var cerrarMenu = function () { menu.classList.remove('abierto'); botonMenu.setAttribute('aria-expanded', 'false'); };
    botonMenu.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      botonMenu.setAttribute('aria-expanded', String(abierto));
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', cerrarMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ---------- visor de fotos ---------- */
  var visor = $('[data-visor]');
  var botonesFoto = $$('[data-foto]');
  var actual = 0;
  function mostrar(i) {
    actual = (i + botonesFoto.length) % botonesFoto.length;
    var b = botonesFoto[actual];
    var img = $('img', b);
    var pie = b.closest('figure').querySelector('figcaption');
    var vImg = $('[data-visor-img]', visor);
    vImg.src = 'assets/img/' + b.dataset.foto + '.jpg';
    vImg.alt = img.alt;
    $('[data-visor-pie]', visor).textContent = pie ? pie.textContent : '';
    $('[data-visor-cuenta]', visor).textContent = (actual + 1) + ' / ' + botonesFoto.length;
  }
  if (visor && visor.showModal) {
    var origen = null;
    botonesFoto.forEach(function (b, i) {
      b.addEventListener('click', function () { origen = b; mostrar(i); visor.showModal(); });
    });
    $('[data-visor-ant]', visor).addEventListener('click', function () { mostrar(actual - 1); });
    $('[data-visor-sig]', visor).addEventListener('click', function () { mostrar(actual + 1); });
    $('[data-visor-cerrar]', visor).addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') mostrar(actual - 1);
      if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
    visor.addEventListener('close', function () { if (origen) origen.focus(); });
    // deslizar con el dedo
    var x0 = null;
    visor.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    visor.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- cómo llegar: la ruta se dibuja hasta el paso que se está leyendo ---------- */
  var mapa = $('[data-mapa]');
  if (mapa) {
    var trazo = $('[data-trazo]', mapa);
    var pasos = $$('[data-ruta-pasos] [data-paso]');
    var largo = trazo.getTotalLength();
    // cuánto de la ruta se ha recorrido en cada punto (medido sobre la ruta real)
    var AVANCE = { monteria: 0.015, upb: 0.4546, garzones: 0.869, destapada: 0.9537, finca: 1 };
    var ORDEN = ['monteria', 'upb', 'garzones', 'destapada', 'finca'];
    trazo.style.strokeDasharray = largo + ' ' + largo;
    var irA = function (id) {
      var n = ORDEN.indexOf(id);
      trazo.style.strokeDashoffset = String(largo * (1 - AVANCE[id]));
      ORDEN.forEach(function (o, i) {
        var punto = $('[data-punto="' + o + '"]', mapa);
        if (punto) { punto.classList.toggle('alcanzado', i <= n); punto.classList.toggle('actual', i === n); }
      });
      pasos.forEach(function (li, i) { li.classList.toggle('alcanzado', i <= n); li.classList.toggle('actual', i === n); });
    };
    if (reducir || !('IntersectionObserver' in window)) {
      irA('finca');
    } else {
      trazo.style.strokeDashoffset = String(largo);
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) irA(e.target.dataset.paso); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      pasos.forEach(function (li) { observador.observe(li); });
      // al entrar a la sección, el primer punto ya se ve
      new IntersectionObserver(function (e, obs) {
        if (e[0].isIntersecting) { irA('monteria'); obs.disconnect(); }
      }, { threshold: 0.2 }).observe(mapa);
    }
  }

  /* ---------- mosaico de la portada: cada tesela alterna entre dos fotos ---------- */
  if (!reducir) {
    var teselas = $$('.mosaico-portada__tesela').filter(function (t) { return t.children.length > 1; });
    var turno = 0;
    setInterval(function () {
      if (document.hidden || !teselas.length) return;
      teselas[turno % teselas.length].classList.toggle('alterna');
      turno++;
    }, 3200);
  }

  var anio = $('[data-anio]');
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- movimiento ---------- */
  function animar() {
    var gsap = window.gsap;
    if (!gsap || reducir) { document.documentElement.classList.remove('anima'); return; }
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    // el tiempo de la animación sigue al reloj: si el navegador pinta pocos cuadros
    // (ahorro de batería, pestaña lenta), el contenido igual aparece a tiempo
    gsap.ticker.lagSmoothing(0);
    var ease = 'expo.out';

    // portada: las fotos se abren una a una y el título se pinta línea por línea
    var tl = gsap.timeline({ defaults: { ease: ease } });
    tl.from('.mosaico-portada__tesela', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: { each: 0.08, from: 'end' } }, 0)
      .from('.portada .linea > span', { yPercent: 105, duration: 0.9, stagger: 0.09 }, 0.3)
      .from('.portada__intro, .portada__gancho, .portada__acciones', { y: 16, opacity: 0, duration: 0.7, stagger: 0.07 }, 0.6)
      .from('.portada__bajar', { opacity: 0, y: -10, duration: 0.6 }, 1);

    if (!window.ScrollTrigger) { document.documentElement.classList.remove('anima'); return; }

    // entrar a la finca: al bajar, la pintura se acerca a la casa y el texto se va
    var mm = gsap.matchMedia();
    mm.add('(min-width: 701px)', function () {
      var t = gsap.timeline({
        scrollTrigger: { trigger: '[data-portada]', start: 'top top', end: '+=70%', scrub: 0.6, pin: true, anticipatePin: 1 }
      });
      // al bajar: el mosaico se abre en profundidad, la casa avanza y el texto se va
      t.to('.t-casa', { scale: 1.08, ease: 'none' }, 0)
        .to('.t-sombrillas, .t-hamaca', { yPercent: -10, ease: 'none' }, 0)
        .to('.t-piscina, .t-porton', { yPercent: 8, ease: 'none' }, 0)
        .to('[data-portada-texto]', { y: -70, opacity: 0, ease: 'none' }, 0)
        .to('.portada__bajar', { opacity: 0, ease: 'none', duration: 0.3 }, 0);
    });
    mm.add('(min-width: 901px)', function () {
      var dia = $('[data-dia]');
      var pista = $('[data-dia-pista]');
      if (!dia || !pista) return;
      dia.classList.add('dia--fijado');
      var distancia = function () { return Math.max(0, pista.scrollWidth - window.innerWidth); };
      var viaje = gsap.to(pista, {
        x: function () { return -distancia(); }, ease: 'none',
        scrollTrigger: {
          trigger: dia, start: 'top 68px', end: function () { return '+=' + distancia(); },
          scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (s) { gsap.set('[data-dia-barra]', { scaleX: s.progress }); }
        }
      });
      // cada foto se acerca un poco mientras cruza la pantalla
      $$('.momento__foto img', pista).forEach(function (img) {
        gsap.fromTo(img, { scale: 1.12 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: img, containerAnimation: viaje, start: 'left right', end: 'right left', scrub: true }
        });
      });
      return function () { dia.classList.remove('dia--fijado'); };
    });
    mm.add('(max-width: 700px)', function () {
      gsap.to('.t-casa img', {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '[data-portada]', start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    window.ScrollTrigger.batch('[data-revelar]', {
      start: 'top 88%',
      once: true,
      onEnter: function (els) {
        gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: ease, stagger: 0.07, overwrite: true });
      }
    });

    gsap.from('.cierre__pintura img', {
      scale: 1.15, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: '.cierre', start: 'top bottom', end: 'top 30%', scrub: true }
    });
  }

  if (!reducir) {
    document.documentElement.classList.add('anima');
    // por si GSAP no carga: nada se queda escondido
    setTimeout(function () {
      if (!window.ScrollTrigger) document.documentElement.classList.remove('anima');
    }, 2500);
  }
  if (document.readyState === 'complete') animar();
  else window.addEventListener('load', animar);
})();
