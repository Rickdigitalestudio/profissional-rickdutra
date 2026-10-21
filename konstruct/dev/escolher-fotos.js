/* ═══════════════════════════════════════════════════════════
   Escolhe a melhor foto de cada produto entre os candidatos
   e baixa os arquivos.
   Regras: o titulo PRECISA citar o produto; contexto irrelevant
   (guerra, brinquedo, evento, astronomia…) e descartado.
   ═══════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const RAIZ = path.join(DIR, '..');
const TMP = path.join(DIR, 'tmp-fotos');
const UA = 'KONSTRUCT-Catalog/1.0 (https://rickdigitalestudio.github.io/profissional-rickdutra/; contato@rickdigital.com.br)';

const cands = JSON.parse(fs.readFileSync(path.join(DIR, 'candidatos.json'), 'utf8'));

/* contexto que descaracteriza uma foto de produto */
const BLOCK = ['medal', 'award', 'soldier', 'military', 'wwii', 'world war', 'war ',
  'toy ', 'toys', 'halloween', 'nasa', 'space ', 'telescope', 'church', 'museum', 'costume',
  'sculpture', 'chess', 'meccano', 'cooking', 'kitchen', 'surgical', 'dental', 'candy', 'logo',
  'icon ', 'illustration', 'cartoon', 'drawing', 'portrait', 'beach', 'holiday',
  'christmas', 'parade', 'protest', 'rally', 'concert', 'football', 'game', 'battle',
  'army', 'navy', 'barracks', 'missing', 'looking for', 'candle', 'used ', 'old ',
  'repair', 'vintage', 'antique', 'anonymous', 'archive', 'librar', 'book',
  'statue', 'monument', 'sunset', 'sunrise', 'landscape', 'mountain',
  'owl', 'sticker', 'clipart', 'vector', 'tin ', '1930', 'vacuum tube', 'for_kids',
  'technology_toys', 'review', 'revue', 'unboxing', 'pdf ', 'logo ', 'poster',
  'magazine', 'advert', 'newsletter', 'brochure', 'catalog', 'catalogue', 'manual',
  'film', 'movie', 'scene', 'actor', 'actress', 'baby', 'child', 'kid', 'model railway',
  'miniature', 'mini ', 'scalematic', 'tattoo', 'artwork', 'painting of', 'drawing of',
  'fly dresser', 'mid 20th century', 'rail', 'kuka', 'truck', 'breathing', 'new orleans',
  'buan-gun', 'christus', 'rp-p-ob', 'commercial vehicle', 'carbon tetrachloride',
  'art in the', 'fresco', 'tapestry', 'engraving', 'lithograph', 'woodcut', 'etching',
  'map of', 'plan of', 'diagram of', 'poster', 'banner', 'sign ', 'street', 'store front',
  'shop front', 'supermarket', 'warehouse interior', 'excavator', 'forklift', 'crane',
  'jeep', 'offroad', 'rally car', 'engine bay', 'cutaway', 'x-ray', 'xray', 'diagram',
  'areola', 'nipple', 'breast', 'spilsbury', 'snipe', '1766', 'party', 'imperial type',
  'boat', 'ship ', 'hull', 'sail', 'clock', 'watchmaker', 'watch maker', 'boat building',
  'engraving of', 'print of', 'woodcut of', 'coat of arms', 'heraldry', 'tattoo of',
  'puzzle', 'jigsaw puzzle', 'crossword', 'sudoku', 'tile puzzle',
  'train', 'locomotive', 'railway', 'steam engine', 'dancing lights', 'light show',
  'festival', 'sound and light', 'wedding', 'concert', 'nightscape', 'nightclub',
  'chisel', 'carpenter plane', 'plane iron', 'plane blade'];

/* palavras obrigatorias por produto (basta uma) e desejaveis */
const REGRAS = {
  1: { must: ['rotary hammer', 'demolition hammer', 'hammer drill', 'martelete', 'bohrhammer', 'sds'], nice: ['dewalt', 'makita', 'bosch', 'milwaukee', 'hilti'] },
  2: { must: ['drill', 'schrauber', 'driver', 'parafusadeira', 'bohrschrauber'], nice: ['makita', 'cordless', 'battery', 'akku'] },
  3: { must: ['impact driver', 'impact wrench', 'schlag', 'treibwerkzeug'], nice: ['milwaukee', 'dewalt', 'makita'] },
  4: { must: ['cordless drill', 'drill', 'schrauber', 'akku', 'battery', 'parafusadeira', 'impact driver'], nice: ['makita', 'dewalt', 'bosch'] },
  5: { must: ['demolition hammer', 'jackhammer', 'breaker', 'abbruchhammer', 'hammer drill', 'martelete', 'pneumatic hammer'], nice: ['hilti', 'bosch', 'makita'] },
  6: { must: ['impact driver', 'hammer drill', 'comb hammer', 'schlagbohrer'], nice: ['dewalt', 'makita', 'milwaukee'] },
  7: { must: ['drill', 'schrauber', 'battery', 'akku', 'parafusadeira'], nice: ['stanley', 'dewalt', 'black+decker'] },
  8: { must: ['bench drill', 'pillar drill', 'radial drill', 'stationary drill', 'toupie', 'bohrmaschine', 'drill press', 'bench drill'], nice: ['bench'] },
  9: { must: ['circular saw', 'kreissäge', 'serra circular', 'circularsaw'], nice: ['dewalt', 'bosch', 'makita'] },
  10: { must: ['jigsaw', 'stichsäge', 'serra de fita', 'reciprocating', 'sägesäge'], nice: ['bosch', 'black+decker', 'makita'] },
  11: { must: ['reciprocating saw', 'recip', 'sawz', 'sägesäge', 'serra de reciprocacao'], nice: ['milwaukee', 'bosch', 'dewalt'] },
  12: { must: ['table saw', 'bench saw', 'tischkreissäge', 'workbench saw', 'serra de bancada'], nice: ['table saw'] },
  13: { must: ['band saw', 'bandsaw', 'bandsäge', 'serra de fita de bancada'], nice: ['band saw'] },
  14: { must: ['tile cutter', 'tile saw', 'fliesen', 'corte de', 'ceramic cutter'], nice: ['tile'] },
  16: { must: ['angle grinder', 'esmerilhadeira', 'schleif', 'grinder', 'disc grinder', 'schleifer'], nice: ['metabo', 'dewalt', 'bosch'] },
  17: { must: ['angle grinder', 'esmerilhadeira', 'schleif', 'grinder', 'disc grinder'], nice: ['180', '2200', 'dewalt'] },
  18: { must: ['planer', 'rebel', 'rabo', 'hobel', 'plaina'], nice: ['power planer', 'electric planer'] },
  19: { must: ['angle grinder', 'esmerilhadeira', 'schleif', 'grinder'], nice: ['mini', '75', 'ryobi'] },
  20: { must: ['orbital sander', 'sander', 'schleif', 'lixadeira'], nice: ['orbital'] },
  21: { must: ['belt sander', 'bandschleif', 'lixadeira de cinta'], nice: ['belt sander'] },
  22: { must: ['drum sander', 'cylinder sander', 'walzenschleif', 'lixadeira de rolo'], nice: ['drum'] },
  23: { must: ['delta sander', 'sander', 'schleif', 'lixadeira'], nice: ['delta'] },
  24: { must: ['wrench', 'spanner', 'schlüssel', 'chave', 'combo wrench', 'ratchet'], nice: ['set', 'spanner'] },
  25: { must: ['socket', 'soquete', 'stecknuss', 'socket set', 'ratchet set'], nice: ['socket set', '108'] },
  26: { must: ['hex key', 'hex ', 'allen', 'inbus', 'hexagonal', 'chave allen'], nice: ['set'] },
  27: { must: ['pliers', 'alicate', 'zange', 'combination pliers'], nice: ['pliers'] },
  28: { must: ['hammer', 'martelo', 'claw hammer', 'martelo unha'], nice: ['claw'] },
  29: { must: ['measuring tape', 'tape measure', 'trena', 'zollstock', 'measuring'], nice: ['tape'] },
  30: { must: ['toolbox', 'tool box', 'tool kit', 'tool set', 'maleta', 'werkzeugkoffer', 'koffer', 'toolbox set'], nice: ['kit', 'case'] },
  31: { must: ['toolbox', 'tool box', 'drill case', 'maleta', 'werkzeugkoffer', 'tool kit'], nice: ['case', 'drill'] },
  32: { must: ['toolbox', 'tool box', 'tool kit', 'tools set', 'maleta', 'werkzeugkoffer'], nice: ['set'] },
  33: { must: ['multimeter', 'multimetro', 'tester', 'voltmeter', 'ohm'], nice: ['electric'] },
  34: { must: ['tool set', 'tool kit', 'tools', 'werkzeug', 'mechanic'], nice: ['set', 'kit'] },
  35: { must: ['pneumatic', 'air tool', 'werkzeug', 'pneumatic tool', 'kompressor tool'], nice: ['pneumatic'] },
  36: { must: ['tool cabinet', 'tool cart', 'roll cabinet', 'werkzeugwagen', 'carrinho', 'tool trolley', 'tool chest', 'drawer'], nice: ['cabinet', 'cart'] },
  37: { must: ['shelf', 'shelves', 'rack', 'regal', 'estante', 'pallet rack', 'warehouse rack', 'storage'], nice: ['warehouse', 'industrial'] },
  38: { must: ['workbench', 'work bench', 'werkbank', 'bancada', 'work table'], nice: ['folding'] },
  39: { must: ['toolbox', 'tool box', 'storage box', 'caixa', 'plastic box', 'tool chest'], nice: ['plastic'] },
  40: { must: ['pegboard', 'peg board', 'tool board', 'wall organizer', 'werkzeugwand', 'organizador'], nice: ['panel'] },
  41: { must: ['laser distance', 'distance meter', 'laser measure', 'rangefinder', 'medidor'], nice: ['laser'] },
  42: { must: ['laser level', 'level laser', 'cross line', 'nivel a laser'], nice: ['laser'] },
  43: { must: ['measuring tape', 'tape measure', 'trena', 'zollstock'], nice: ['tape'] },
  44: { must: ['spirit level', 'bubble level', 'nivel de', 'water level', 'level tool'], nice: ['level'] },
  45: { must: ['multimeter', 'multimetro', 'voltmeter', 'tester', 'ohm'], nice: ['digital'] },
  46: { must: ['welding machine', 'welder', 'inverter', 'solder machine', 'welding', 'schweiß', 'soldadora'], nice: ['inverter', 'welder'] },
  47: { must: ['mig', 'welder', 'welding', 'inverter', 'soldadora'], nice: ['mig'] },
  48: { must: ['spot welder', 'spot welding'], nice: ['spot'] },
  49: { must: ['welding helmet', 'welding mask', 'welding hood', 'soldadura'], nice: ['welding'] },
  50: { must: ['compressor', 'kompressor', 'compresseur'], nice: ['air compressor', '24'] },
  51: { must: ['nail gun', 'nailer', 'brad nailer', 'pistola de pregos', 'tack gun', 'stapler', 'tacker', 'nagler'], nice: ['cordless', '18v'] },
  52: { must: ['compressor', 'kompressor', 'compresseur'], nice: ['small', 'portable', '6'] },
  53: { must: ['spray gun', 'sprayer', 'paint sprayer', 'spritzpistole', 'pistola de pintura', 'graco', 'spraygun'], nice: ['graco', '1.3'] },
  54: { must: ['spray gun', 'sprayer', 'paint sprayer', 'spritzpistole', 'pistola de pintura', 'graco', 'spraygun'], nice: ['hvlp', 'graco'] },
  55: { must: ['heat gun', 'hot air gun', 'heißluft', 'heat tool', 'soprador', 'hot air'], nice: ['heat gun'] },
  56: { must: ['paint roller', 'roller', 'rolo', 'pinsel', 'paint brush', 'rulle'], nice: ['roller'] },
  57: { must: ['sandpaper', 'sand paper', 'lixa', 'abrasive', 'schleifpapier'], nice: ['sandpaper'] },
  58: { must: ['spray gun', 'sprayer', 'paint sprayer', 'spritzpistole', 'pistola de pintura', 'graco'], nice: ['electric'] },
  59: { must: ['hard hat', 'hardhat', 'safety helmet', 'capacete', 'sturzhelm', 'bauhelm', 'helmet'], nice: ['construction', 'white'] },
  60: { must: ['goggles', 'safety glasses', 'protective glasses', 'óculos', 'brille', 'eye protection', 'goggle'], nice: ['safety'] },
  61: { must: ['gloves', 'glove', 'luva', 'handschuh', 'hand protection'], nice: ['leather', 'work'] },
  62: { must: ['tool belt', 'belt pouch', 'tool pouch', 'werkzeuggurrtel', 'tool bag', 'tool roll', 'apron'], nice: ['belt'] },
  63: { must: ['earplug', 'ear plug', 'ear protection', 'hearing protection', 'protetor', 'ohropax', 'ear defender', 'earmuff', 'earplug'], nice: ['earplug'] },
  64: { must: ['planer', 'hobel', 'plaina'], nice: ['electric planer', 'power planer', 'hand planer'] },
  65: { must: ['wood lathe', 'lathe', 'torno', 'drechselbank', 'woodturning', 'wood turning'], nice: ['lathe'] },
  66: { must: ['disc sander', 'disk sander', 'scheibenschleif', 'disc grinder', 'lixadeira'], nice: ['disc'] },
  67: { must: ['spokeshave', 'sapatilha', 'drawknife'], nice: ['spokeshave'] },
  68: { must: ['brush cutter', 'trimmer', 'weed trimmer', 'brushcutter', 'rocadeira', 'rasenmäher', 'lawn mower', 'mower', 'strimmer'], nice: ['brush cutter'] },
  69: { must: ['chainsaw', 'chain saw', 'motosserra', 'chainsäge', 'motorsäge'], nice: ['electric'] },
  70: { must: ['hoe', 'spade', 'shovel', 'enxada', 'hacke', 'spaten', 'garden tool'], nice: ['garden'] },
  71: { must: ['generator', 'gerador', 'stromerzeuger', 'genset', 'power generator'], nice: ['generator'] },
  72: { must: ['stabilizer', 'stabiliser', 'transformer', 'estabilizador', 'voltage regulator', 'ups', 'no-break'], nice: ['voltage'] },
  73: { must: ['fire extinguisher', 'extinguisher', 'extintor', 'feuerlöscher'], nice: ['red', 'extinguisher'] }
};

/* qual busca atende qual produto */
const BUSCAS = JSON.parse(fs.readFileSync(path.join(DIR, 'buscas.json'), 'utf8'));
const PRODUTO_BUSCA = {};
BUSCAS.forEach(b => b.ids.forEach(id => { if (!PRODUTO_BUSCA[id]) PRODUTO_BUSCA[id] = []; PRODUTO_BUSCA[id].push(b.q); }));

function avaliar(c, id) {
  const t = (c.t || '').toLowerCase();
  if (!c.w || !c.h || c.w < 400 || c.h < 300) return -1;
  if (/\.svg/i.test(c.u || '')) return -1;
  for (let i = 0; i < BLOCK.length; i++) if (t.indexOf(BLOCK[i]) !== -1) return -1;
  const r = REGRAS[id];
  if (!r) return -1;
  let achou = false;
  for (let i = 0; i < r.must.length; i++) if (t.indexOf(r.must[i]) !== -1) { achou = true; break; }
  if (!achou) return -1;
  let s = 10;
  (r.nice || []).forEach(n => { if (t.indexOf(n) !== -1) s += 6; });
  if (c.w >= 900) s += 5; else if (c.w >= 600) s += 3; else if (c.w >= 450) s += 1;
  if (c.h >= 600) s += 2;
  if (c.w && c.h) { const ar = c.w / c.h; if (ar >= 0.8 && ar <= 1.6) s += 4; }
  if (c.lic === 'cc0' || c.lic === 'pdm') s += 4; else if (c.lic === 'by') s += 2;
  if (/toolstop/i.test(c.cr || '')) s += 6;
  if (c.src === 'wikimedia') s += 7;           /* fotos de produto isoladas */
  return s;
}

(async function main() {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });
  const escolhidas = {};
  const semFoto = [];

  async function baixar(url, destino) {
    for (let t = 0; t < 2; t++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 45000);
        const resp = await fetch(url, {
          headers: { 'User-Agent': UA, 'Accept': 'image/*,*/*' },
          redirect: 'follow', signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!resp.ok) { await new Promise(r => setTimeout(r, 2500)); continue; }
        const tam = parseInt(resp.headers.get('content-length') || '0', 10);
        if (tam > 22000000) { await new Promise(r => setTimeout(r, 1200)); continue; }
        const buf = Buffer.from(await resp.arrayBuffer());
        if (buf.length < 5000) { await new Promise(r => setTimeout(r, 1200)); continue; }
        fs.writeFileSync(destino, buf);
        /* wikimedia limita por taxa: espera antes da proxima */
        if (url.includes('wikimedia')) await new Promise(r => setTimeout(r, 1500));
        return buf.length;
      } catch (e) { await new Promise(r => setTimeout(r, 1200)); }
    }
    return 0;
  }

  for (const id of Object.keys(REGRAS).map(Number).sort((a, b) => a - b)) {
    const buscas = PRODUTO_BUSCA[id] || [];
    /* todos os candidatos ordenados por nota */
    const lista = [];
    buscas.forEach(q => {
      (cands[q] || []).forEach(c => {
        const s = avaliar(c, id);
        if (s > 0) lista.push({ c: c, s: s, q: q });
      });
    });
    lista.sort((a, b) => b.s - a.s);
    if (!lista.length) { semFoto.push(id); continue; }

    /* tenta baixar do melhor para o pior, priorizando fotos ainda nao usadas */
    const usados = new Set(Object.values(escolhidas).map(e => e.creditos.fonte));
    lista.sort((a, b) => (usados.has(b.c.fl || b.c.u) ? -1 : 1) - (usados.has(a.c.fl || a.c.u) ? -1 : 1) || b.s - a.s);
    let escolhido = null, destino = '', bytes = 0, melhor = lista[0];
    for (const item of lista.slice(0, 6)) {
      const c = item.c;
      const ext = /\.png$/i.test(c.u) ? 'png' : 'jpg';
      const arq = path.join(TMP, 'f-' + id + '.' + ext);
      bytes = await baixar(c.u, arq);
      if (bytes) {
        escolhido = c; destino = 'assets/f-' + id + '.' + ext; melhor = item;
        break;
      }
    }
    if (!escolhido) { semFoto.push(id); continue; }

    escolhidas[id] = {
      src: destino,
      bytes: bytes,
      busca: melhor.q,
      creditos: {
        titulo: escolhido.t,
        autor: escolhido.cr || 'Desconhecido',
        licenca: String(escolhido.lic || '').toUpperCase(),
        fonte: escolhido.fl || escolhido.u,
        origem: escolhido.src === 'wikimedia' ? 'Wikimedia Commons' : (escolhido.u || '').includes('flickr') ? 'Flickr' : 'Openverse'
      }
    };
    console.log('id ' + String(id).padStart(2) + '  ' + String(melhor.s).padStart(3) + '  ' +
      (escolhido.t || '').slice(0, 52) + '  [' + escolhido.w + 'x' + escolhido.h + ']');
  }

  fs.writeFileSync(path.join(DIR, 'fotos-manifest.json'), JSON.stringify(escolhidas, null, 1), 'utf8');
  console.log('\n=== com foto: ' + Object.keys(escolhidas).length + ' | sem foto: ' + semFoto.length);
  console.log('sem foto (ids): ' + semFoto.join(', '));
})();
