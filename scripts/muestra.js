// Arma la versión de muestra en la carpeta muestra/ para subirla a un hosting (Netlify, Vercel...).
// - Copia solo lo que la página necesita (sin pruebas, originales ni archivos de trabajo).
// - Le pide a los buscadores que no la indexen y le pone una franja de "página de muestra".
// uso: npm run muestra
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const salida = path.join(raiz, 'muestra');
const INCLUIR = ['index.html', 'css', 'js', 'assets'];

fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida);
for (const item of INCLUIR) fs.cpSync(path.join(raiz, item), path.join(salida, item), { recursive: true });

let html = fs.readFileSync(path.join(salida, 'index.html'), 'utf8');
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex, nofollow">');
html = html.replace('<a class="saltar"', `<div class="franja-muestra" role="note">Página de muestra preparada para el propietario de la Casafinca El Tesoro del Sinú · No es la página oficial</div>
  <a class="saltar"`);
html = html.replace('</head>', `  <style>
    .franja-muestra { background: #f4c531; color: #1c1813; font: 700 0.8rem/1.3 "Hanken Grotesk", system-ui, sans-serif; text-align: center; padding: 7px 16px; }
  </style>
</head>`);
fs.writeFileSync(path.join(salida, 'index.html'), html);
fs.writeFileSync(path.join(salida, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
// Netlify: que tampoco se indexe por cabecera
fs.writeFileSync(path.join(salida, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');

let total = 0;
const contar = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) contar(p); else total += fs.statSync(p).size;
});
contar(salida);
console.log('Muestra lista en', salida, '-', (total / 1048576).toFixed(1), 'MB');
