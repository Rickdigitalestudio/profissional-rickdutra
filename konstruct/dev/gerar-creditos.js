/* ═══════════════════════════════════════════════════════════
   Gera konstruct/js/fotos.js (mapa de fotos + creditos) e
   konstruct/assets/CREDITOS.md
   ═══════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'fotos-manifest.json'), 'utf8'));

/* mapa: id -> { src, creditos } */
const mapa = {};
const linhas = [];

Object.keys(manifest).sort((a, b) => a - b).forEach(id => {
  const m = manifest[id];
  const c = m.creditos;
  mapa[id] = {
    src: 'assets/f-' + id + '.jpg',
    creditos: {
      titulo: c.titulo, autor: c.autor, licenca: c.licenca, fonte: c.fonte, origem: c.origem
    }
  };
  linhas.push('| ' + id + ' | ' + (c.titulo || '').replace(/\|/g, '/') + ' | ' + (c.autor || '') +
    ' | ' + (c.licenca || '') + ' | ' + (c.origem || '') + ' |');
});

const js = '/* Gerado automaticamente por dev/gerar-creditos.js — ' +
  Object.keys(mapa).length + ' fotos de produto com licença livre. */\n' +
  'var KOTOS_FOTOS = ' + JSON.stringify(mapa, null, 1) + ';\n';
fs.writeFileSync(path.join(RAIZ, 'js', 'fotos.js'), js, 'utf8');

const md = `# Créditos das fotos de produto — KONSTRUCT

As imagens de produto desta loja são **fotografias reais** obtidas via
[Openverse](https://openverse.org) (Fontes: Flickr e Wikimedia Commons),
publicadas sob licenças livres (CC0, Public Domain, CC BY ou CC BY-SA).

Cada produto que usa foto traz o crédito do autor na própria ficha.

| Produto | Título da foto | Autor | Licença | Origem |
|---|---|---|---|---|
${linhas.join('\n')}

## Licenças

- **CC0 / Public Domain** — uso livre, sem exigência de crédito.
- **CC BY** — uso livre com atribuição ao autor.
- **CC BY-SA** — uso livre com atribuição e compartilhamento pela mesma licença.

Os créditos individuais ficam em \`konstruct/js/fotos.js\`.
`;
fs.writeFileSync(path.join(RAIZ, 'assets', 'CREDITOS.md'), md, 'utf8');

console.log('js/fotos.js com ' + Object.keys(mapa).length + ' fotos');
console.log('assets/CREDITOS.md gerado');
