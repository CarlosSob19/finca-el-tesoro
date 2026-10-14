const test = require('node:test');
const assert = require('node:assert/strict');
const TARIFAS = require('../js/tarifas.js');
const { cotizar, mensajeWhatsApp, urlWhatsApp, pesos } = require('../js/cotizador.js');

test('pesos formatea en estilo colombiano', () => {
  assert.equal(pesos(400000), '$400.000');
  assert.equal(pesos(1430000), '$1.430.000');
});

test('pasadía cobra el grupo más pequeño que alcanza', () => {
  assert.equal(cotizar({ plan: 'pasadia', personas: 10 }).total, 400000);
  assert.equal(cotizar({ plan: 'pasadia', personas: 4 }).total, 400000);
  assert.equal(cotizar({ plan: 'pasadia', personas: 11 }).total, 550000);
  assert.equal(cotizar({ plan: 'pasadia', personas: 25 }).total, 880000);
  assert.equal(cotizar({ plan: 'pasadia', personas: 80 }).total, 1430000);
});

test('pasadía suma horas extra según la tabla', () => {
  assert.equal(cotizar({ plan: 'pasadia', personas: 10, horasExtra: 1 }).total, 500000);
  assert.equal(cotizar({ plan: 'pasadia', personas: 10, horasExtra: 3 }).total, 600000);
});

test('pasadía de más de 80 personas no se cotiza en línea', () => {
  const r = cotizar({ plan: 'pasadia', personas: 81 });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /80/);
});

test('estadía 24 h cobra por grupo y suma personas adicionales después de 20', () => {
  assert.equal(cotizar({ plan: 'estadia', personas: 10 }).total, 728000);
  assert.equal(cotizar({ plan: 'estadia', personas: 15 }).total, 840000);
  assert.equal(cotizar({ plan: 'estadia', personas: 20 }).total, 952000);
  assert.equal(cotizar({ plan: 'estadia', personas: 22 }).total, 952000 + 2 * 25000);
});

test('estadía no pasa de la capacidad para dormir', () => {
  assert.equal(cotizar({ plan: 'estadia', personas: TARIFAS.estadia.maxPersonas }).ok, true);
  assert.equal(cotizar({ plan: 'estadia', personas: TARIFAS.estadia.maxPersonas + 1 }).ok, false);
});

test('estadía ignora horas extra', () => {
  assert.equal(cotizar({ plan: 'estadia', personas: 10, horasExtra: 2 }).total, 728000);
});

test('noche cobra por persona con desayuno', () => {
  assert.equal(cotizar({ plan: 'noche', personas: 3 }).total, 336000);
});

test('noche de fin de semana exige mínimo 3 personas', () => {
  // 2026-10-17 es sábado; 2026-10-14 es miércoles
  assert.equal(cotizar({ plan: 'noche', personas: 2, fecha: '2026-10-17' }).ok, false);
  assert.equal(cotizar({ plan: 'noche', personas: 2, fecha: '2026-10-14' }).ok, true);
});

test('el abono es la mitad y el saldo el resto', () => {
  const r = cotizar({ plan: 'pasadia', personas: 15, horasExtra: 1 });
  assert.equal(r.abono, 325000);
  assert.equal(r.saldo, 325000);
});

test('calcula cuánto sale por persona, redondeado al peso', () => {
  assert.equal(cotizar({ plan: 'pasadia', personas: 30 }).porPersona, 29333);
  assert.equal(cotizar({ plan: 'pasadia', personas: 10 }).porPersona, 40000);
  assert.equal(cotizar({ plan: 'noche', personas: 3 }).porPersona, 112000);
});

test('el mensaje de WhatsApp dice cuánto sale por persona', () => {
  const m = mensajeWhatsApp(cotizar({ plan: 'pasadia', personas: 30 }));
  assert.match(m, /\$29\.333 por persona/);
});

test('personas inválidas no cotizan', () => {
  assert.equal(cotizar({ plan: 'pasadia', personas: 0 }).ok, false);
  assert.equal(cotizar({ plan: 'pasadia', personas: 'diez' }).ok, false);
  assert.equal(cotizar({ plan: 'nada', personas: 10 }).ok, false);
});

test('la frase describe la cotización', () => {
  const r = cotizar({ plan: 'pasadia', personas: 25, horasExtra: 2 });
  assert.match(r.frase, /25 personas/);
  assert.match(r.frase, /\$1\.030\.000/);
});

test('el mensaje de WhatsApp lleva plan, personas, fecha y total', () => {
  const r = cotizar({ plan: 'pasadia', personas: 25, horasExtra: 0, fecha: '2026-10-17' });
  const m = mensajeWhatsApp(r);
  assert.match(m, /Pasadía/);
  assert.match(m, /25 personas/);
  assert.match(m, /17 de octubre de 2026/);
  assert.match(m, /\$880\.000/);
});

test('la URL de WhatsApp apunta al número de la finca con el texto codificado', () => {
  const u = urlWhatsApp('Hola & chao');
  assert.equal(u, `https://wa.me/${TARIFAS.whatsapp}?text=Hola%20%26%20chao`);
});
