/* Lógica del cotizador: sin DOM, para poder probarla con node --test. */
(function (root) {
  var TARIFAS = typeof require === 'function' ? require('./tarifas.js') : root.TARIFAS;

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function pesos(valor) {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // 'AAAA-MM-DD' → Date local a mediodía (evita saltos por zona horaria)
  function leerFecha(texto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto || '');
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], 12);
  }

  function fechaLarga(texto) {
    var f = leerFecha(texto);
    if (!f) return '';
    return DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()] + ' de ' + f.getFullYear();
  }

  function precioPorGrupo(grupos, personas) {
    for (var i = 0; i < grupos.length; i++) {
      if (personas <= grupos[i][0]) return { hasta: grupos[i][0], precio: grupos[i][1] };
    }
    return null;
  }

  function no(motivo, base) {
    base.ok = false;
    base.motivo = motivo;
    return base;
  }

  function cotizar(opciones) {
    var plan = opciones.plan;
    var personas = Number(opciones.personas);
    var horasExtra = Math.max(0, Math.min(3, Number(opciones.horasExtra) || 0));
    var fecha = opciones.fecha || '';
    var tarifa = TARIFAS[plan];
    var r = { plan: plan, personas: personas, horasExtra: 0, fecha: fecha, desglose: [], avisos: [] };

    if (!tarifa || !tarifa.nombre) return no('Elige un plan.', r);
    r.nombre = tarifa.nombre;
    if (!Number.isInteger(personas) || personas < 1) return no('Indica cuántas personas van.', r);

    if (plan === 'pasadia') {
      var g = precioPorGrupo(tarifa.grupos, personas);
      if (!g) return no('Para grupos de más de 80 personas escríbenos y armamos el plan.', r);
      r.desglose.push(['Pasadía para grupo de hasta ' + g.hasta, g.precio]);
      if (horasExtra) {
        r.horasExtra = horasExtra;
        r.desglose.push([horasExtra === 1 ? '1 hora extra' : horasExtra + ' horas extra', tarifa.horasExtra[horasExtra]]);
        r.avisos.push('Las horas extra están sujetas a disponibilidad.');
      }
    } else if (plan === 'estadia') {
      if (personas > tarifa.maxPersonas) {
        return no('La casa recibe hasta ' + tarifa.maxPersonas + ' personas para dormir. Para más, mira el pasadía.', r);
      }
      var mayor = tarifa.grupos[tarifa.grupos.length - 1];
      var ge = precioPorGrupo(tarifa.grupos, personas) || { hasta: mayor[0], precio: mayor[1] };
      r.desglose.push(['24 horas para grupo de hasta ' + ge.hasta, ge.precio]);
      if (personas > mayor[0]) {
        var extra = personas - mayor[0];
        r.desglose.push([extra + (extra === 1 ? ' persona adicional' : ' personas adicionales') + ' en hamaca o colchoneta', extra * tarifa.personaAdicional]);
      }
    } else if (plan === 'noche') {
      if (personas > tarifa.maxPersonas) {
        return no('Por noche caben ' + tarifa.maxPersonas + ' personas en cama. Para más, mira la estadía de 24 horas.', r);
      }
      var f = leerFecha(fecha);
      var finDeSemana = f && (f.getDay() === 0 || f.getDay() === 6);
      if (finDeSemana && personas < tarifa.minimoFinDeSemana) {
        return no('Los fines de semana la noche por persona es desde ' + tarifa.minimoFinDeSemana + ' personas. De lunes a viernes sí puedes venir con 1 o 2.', r);
      }
      r.desglose.push([personas + (personas === 1 ? ' persona' : ' personas') + ' × ' + pesos(tarifa.porPersona), personas * tarifa.porPersona]);
      r.avisos.push('Incluye desayuno.');
    } else {
      return no('Elige un plan.', r);
    }

    r.ok = true;
    r.total = r.desglose.reduce(function (s, d) { return s + d[1]; }, 0);
    r.abono = Math.round(r.total * TARIFAS.abono);
    r.saldo = r.total - r.abono;
    r.porPersona = Math.round(r.total / personas);
    r.frase = frase(r);
    return r;
  }

  function frase(r) {
    var quien = r.personas + (r.personas === 1 ? ' persona' : ' personas');
    var que = r.plan === 'pasadia'
      ? 'un pasadía de ' + (8 + r.horasExtra) + ' horas'
      : r.plan === 'estadia' ? '24 horas en la finca' : 'una noche con desayuno';
    var cuando = r.fecha ? ' el ' + fechaLarga(r.fecha) : '';
    return quien + ', ' + que + cuando + ': ' + pesos(r.total) + '.';
  }

  function mensajeWhatsApp(r, nombre) {
    var lineas = ['Hola, quiero reservar en la Casafinca El Tesoro del Sinú.'];
    if (nombre) lineas.push('Soy ' + nombre + '.');
    lineas.push('');
    lineas.push('Plan: ' + r.nombre + (r.horasExtra ? ' + ' + r.horasExtra + (r.horasExtra === 1 ? ' hora extra' : ' horas extra') : ''));
    lineas.push('Grupo: ' + r.personas + (r.personas === 1 ? ' persona' : ' personas'));
    lineas.push('Fecha: ' + (r.fecha ? fechaLarga(r.fecha) : 'por definir'));
    if (r.ok) {
      lineas.push('Total según la página: ' + pesos(r.total) + ' (' + pesos(r.porPersona) + ' por persona)');
      lineas.push('Abono para reservar (50%): ' + pesos(r.abono));
    }
    lineas.push('');
    lineas.push('¿Tienen disponibilidad?');
    return lineas.join('\n');
  }

  function urlWhatsApp(texto) {
    return 'https://wa.me/' + TARIFAS.whatsapp + '?text=' + encodeURIComponent(texto);
  }

  var api = { cotizar: cotizar, mensajeWhatsApp: mensajeWhatsApp, urlWhatsApp: urlWhatsApp, pesos: pesos, fechaLarga: fechaLarga };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Cotizador = api;
})(this);
