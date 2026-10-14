/*
 * Tarifas de la Casafinca El Tesoro del Sinú.
 * Fuente: anuncio en Posadas Rurales (consultado el 7 de octubre de 2026).
 * Confirmar con el propietario antes de publicar: el anuncio original
 * trae cifras distintas para el mismo plan.
 * Para cambiar un precio, edita solo este archivo.
 */
(function (root) {
  var TARIFAS = {
    whatsapp: '573118401381',
    abono: 0.5,

    pasadia: {
      nombre: 'Pasadía',
      detalle: 'Hasta 8 horas de día',
      // [máximo de personas del grupo, precio del grupo]
      grupos: [
        [10, 400000],
        [15, 550000],
        [20, 660000],
        [30, 880000],
        [40, 990000],
        [50, 1100000],
        [60, 1210000],
        [70, 1310000],
        [80, 1430000]
      ],
      // horas extra: índice = número de horas
      horasExtra: [0, 100000, 150000, 200000]
    },

    estadia: {
      nombre: 'Estadía 24 horas',
      detalle: 'Un día y una noche en la casa',
      grupos: [
        [10, 728000],
        [15, 840000],
        [20, 952000]
      ],
      // después del grupo más grande, cada persona duerme en hamaca o colchoneta
      personaAdicional: 25000,
      // 24 en camas, 8 en colchonetas, 8 en hamacas
      maxPersonas: 40
    },

    noche: {
      nombre: 'Noche por persona',
      detalle: 'Hospedaje con desayuno',
      porPersona: 112000,
      maxPersonas: 24,
      // de lunes a viernes se aceptan una o dos personas
      minimoFinDeSemana: 3
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = TARIFAS;
  else root.TARIFAS = TARIFAS;
})(this);
