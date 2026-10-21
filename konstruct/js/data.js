/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — catálogo de produtos + metadados 3D
   ═══════════════════════════════════════════════════════════ */
var KONSTRUCT = (function () {
  'use strict';

  var L = function (n) { return 'assets/' + n; };

  /* model  → construtor 3D usado no visor
     color  → cor primária da peça
     alt    → cor secundária (detalhes, botões, cabos)
     specs  → ficha técnica exibida na vitrine */
  var P = [
    {
      id: 0, n: 'Rotary Hammer Pro', p: 12, old: 15, sale: 1, c: 'Drills', r: 5,
      img: L('tool-1.jpg'), model: 'drill', variant: 'rotary', brand: 'DEWALT', color: 0xf5b301, alt: 0x1b1e25,
      desc: 'Martelete SDS-plus de 800W com funções de perfuração, perfuração e cinzelagem. Ideal para concreto, alvenaria e instalação de ancoragens.',
      specs: ['Motor de 800W com 3 modos de operação', 'Encaixe SDS-plus para brocas de 6 a 26mm', 'Empunhadura auxiliar 360° para uso em altura', 'Velocidade variável com selector de 2 posições']
    },
    {
      id: 1, n: 'Happy Ninja Drill', p: 18, old: 0, sale: 0, c: 'Drills', r: 5,
      img: L('tool-2.jpg'), model: 'drill', variant: 'compact', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b,
      desc: 'Parafusadeira compacta comostat sem fio 12V, ideal para serviços de marcenaria, elétrica e montagem em geral.',
      specs: ['Motor sem fio 12V compacto', 'Mandril de 10mm com trava rápida', 'LED de trabalho integrado', 'Peso reduzido de apenas 1,1kg']
    },
    {
      id: 2, n: 'Combo Kit 5pc', p: 35, old: 0, sale: 0, c: 'Kits', r: 4,
      img: L('tool-3.jpg'), model: 'toolcase', variant: 'combo', brand: 'BOSCH', color: 0xd4322b, alt: 0x1a1d23,
      desc: 'Kit completo com furadeira, bateria, carregador e maleta rígida — tudo que a obra pede, na caixa.',
      specs: ['Furadeira + bateria + carregador', 'Maleta rígida com trava', 'Conjunto de brocas e pontas', 'Garantia de 12 meses']
    },
    {
      id: 3, n: 'Drill Set + Case', p: 22, old: 0, sale: 0, c: 'Kits', r: 0,
      img: L('tool-4.jpg'), model: 'toolcase', variant: 'drill', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e,
      desc: 'Conjunto de parafusadeira com bateria e maleta organizadora com espuma recortada.',
      specs: ['Parafusadora sem fio 18V', 'Duas baterias incluídas', 'Espuma recortada sob medida', 'Design robusto para canteiro']
    },
    {
      id: 4, n: 'Circular Saw 1400W', p: 35, old: 0, sale: 0, c: 'Saws', r: 4,
      img: L('tool-5.jpg'), model: 'circularSaw', brand: 'DEWALT', color: 0xf5b301, alt: 0x191c22,
      desc: 'Serra circular de 1400W com disco de 185mm, corte preciso em madeira, MDF e laminados.',
      specs: ['Potência de 1400W e disco 185mm', 'Corte até 56mm a 90°', 'Guia de corteAdjustável', 'Base de alumínio reforçado']
    },
    {
      id: 5, n: 'Impact Driver 20V', p: 35, old: 0, sale: 0, c: 'Drills', r: 5,
      img: L('tool-6.jpg'), model: 'drill', variant: 'impact', brand: 'MILWAUKEE', color: 0xc4262e, alt: 0x101216,
      desc: 'Driver de impacto 20V com torque ajustável em 3 posições e modo de autobroca.',
      specs: ['Torque de 180Nm em 3 posições', 'Modo autobroca para parafusos de fixação', 'Bit holder de troca rápida 1/4"', 'Estrutura em alumínio reforçado']
    },
    {
      id: 6, n: 'Premium Wrench Set', p: 20, old: 0, sale: 0, c: 'Hand Tools', r: 5,
      img: L('tool-7.jpg'), model: 'wrenchSet', brand: 'BOSCH', color: 0xd4322b, alt: 0x2a2e36,
      desc: 'Jogo de chaves combinadas em aço cromo-vanádio com acabamento polido eidentification laser.',
      specs: ['6 chaves combinadas 8 a 19mm', 'Aço cromo-vanádio temperado', 'Acabamento polido anticorrosão', 'Identificação laser permanente']
    },
    {
      id: 7, n: 'Jig Saw Pro', p: 12, old: 15, sale: 1, c: 'Saws', r: 3,
      img: L('tool-8.jpg'), model: 'jigSaw', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x181b21,
      desc: 'Serra de fita vertical com base inclinável e empunhadura superiorSoft-grip.',
      specs: ['Potência de 700W', 'Corte até 45mm em madeira', 'Base inclinável até 45°', 'Troca rápida da lâmina sem chave']
    },
    {
      id: 8, n: 'Ship Your Idea Kit', p: 20, old: 0, sale: 0, c: 'Kits', r: 5,
      img: L('tool-9.jpg'), model: 'toolcase', variant: 'ship', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f,
      desc: 'Kit de BOX com as ferramentas essenciais para transformar qualquer ideia em projeto.',
      specs: ['Maleta organizadora com alça', 'Ferramentas-essential selecionadas', 'Compartimentos em EVA', 'Ideal para presente corporativo']
    },
    {
      id: 9, n: 'Angle Grinder 125mm', p: 28, old: 0, sale: 0, c: 'Grinders', r: 4,
      img: L('tool-10.jpg'), model: 'grinder', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23,
      desc: 'Esmerilhadeira angular 125mm com proteção contra Giro acidental e disco de corte.',
      specs: ['Disco de 125mm com proteção', 'Giro sem carga para segurança', 'Empunhadura lateral 3 pontos', 'Potência de 850W']
    },
    {
      id: 10, n: 'Orbital Sander 300W', p: 24, old: 0, sale: 0, c: 'Sanders', r: 4,
      img: L('tool-13.jpg'), model: 'orbitalSander', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e,
      desc: 'Lixadeira orbital 300W com sistema de收集 de pó e base de 125mm com sistema de troca rápida.',
      specs: ['Base de 125mm com troca rápida', 'Órbita de 2,5mm', 'Sistema de coleta de poeira', 'Velocidade variável 7.000–12.000rpm']
    },
    {
      id: 11, n: 'Cordless Drill 12V', p: 29, old: 34, sale: 1, c: 'Drills', r: 5,
      img: L('tool-14.jpg'), model: 'drill', variant: 'cordless', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216,
      desc: 'Parafusadeira sem fio 12V com bateria de lítio e torque de 30Nm — leve e precisa.',
      specs: ['Bateria de lítio 12V 2.0Ah', 'Torque máximo de 30Nm', 'Mandril 10mm de metal', 'Carregador rápido incluso']
    },
    {
      id: 12, n: 'Tool Cabinet 5-Drawer', p: 45, old: 0, sale: 0, c: 'Storage', r: 5,
      img: L('tool-15.jpg'), model: 'cabinet', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23,
      desc: 'Carrinho de oficina com 5 gavetas, travaserviço pesado e rodízios para manuseio fácil.',
      specs: ['5 gavetas com travaserviço', 'Estrutura em aço de 1mm', 'Rodízios com freio', 'Capacidade de 120kg']
    },
    {
      id: 13, n: 'Reciprocating Saw', p: 38, old: 0, sale: 0, c: 'Saws', r: 4,
      img: L('tool-16.jpg'), model: 'recipSaw', brand: 'MILWAUKEE', color: 0xc4262e, alt: 0x101216,
      desc: 'Serra de reciprocação sem fio para corte de madeira, metal e tubos em espaços apertados.',
      specs: ['Course de 25mm', 'Corte até 300mm em madeira', 'Motor sem fio 18V', 'Empunhadura emborrachada antivibrante']
    },
    {
      id: 14, n: 'Laser Measure 40m', p: 32, old: 0, sale: 0, c: 'Measuring', r: 5,
      img: L('tool-17.jpg'), model: 'laser', brand: 'STANLEY', color: 0xf2c200, alt: 0x171a20,
      desc: 'Medidor de distância a laser com 40 metros de alcance e display retroiluminado.',
      specs: ['Alcance de 40m sem refletor', 'Precisão de ±1,5mm', 'Display retroiluminado', 'Função de área e volume']
    },
    {
      id: 15, n: 'Belt Sander Pro', p: 27, old: 31, sale: 1, c: 'Sanders', r: 4,
      img: L('tool-18.jpg'), model: 'beltSander', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f,
      desc: 'Lixadeira de cinta profissional com controle de velocidade e saco coletor de pó.',
      specs: ['Cinta de 75 x 533mm', 'Velocidade variável', 'Saco coletor de pó removível', 'Base metálica com grafite']
    },
    {
      id: 16, n: 'Welding Inverter 160A', p: 89, old: 0, sale: 0, c: 'Welding', r: 5,
      img: L('tool-19.jpg'), model: 'welder', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f,
      desc: 'Inversor de solda MIG/MMA 160A com partida por contato e display digital de amperagem.',
      specs: ['160A de potência real', 'Soldas MIG, MMA e ferro de soldar', 'Partida por contato (hot start)', 'Proteção térmica e de sobrecarga']
    },
    {
      id: 17, n: 'Air Compressor 24L', p: 95, old: 0, sale: 0, c: 'Air Tools', r: 4,
      img: L('tool-20.jpg'), model: 'compressor', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23,
      desc: 'Compressor de ar 24L com motor de 2CV, pressão de 8bar e saída quick-connect.',
      specs: ['Tanque de 24L em aço', 'Motor de 2CV direto', 'Pressão máxima de 8bar', 'Saídas quick-connect de 1/4"']
    },
    {
      id: 18, n: 'Demolition Hammer 1500W', p: 59, old: 72, sale: 1, c: 'Drills', r: 5,
      img: L('tool-21.jpg'), model: 'drill', variant: 'demolition', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216,
      desc: 'Martelete de demolição 1500W com energia de impacto de 20J para concretaria pesada.',
      specs: ['1500W e 20J de energia de impacto', 'Encaixe SDS-max', 'Empunhadura com amortecimento', 'Ideal para demolição e escavação']
    },
    {
      id: 19, n: 'Socket Set 108pc', p: 42, old: 0, sale: 0, c: 'Hand Tools', r: 5,
      img: L('tool-22.jpg'), model: 'socketSet', brand: 'BOSCH', color: 0xd4322b, alt: 0x171a20,
      desc: 'Jogo de 108 soquetes em aço cromo-vanádio com trilho organizável e gavetas.',
      specs: ['108 peças Metric', 'Aço cromo-vanádio polido', 'Trilho de organização incluso', 'Soquetes de 1/4", 3/8" e 1/2"']
    },
    {
      id: 20, n: 'Warehouse Shelf Rack', p: 75, old: 0, sale: 0, c: 'Storage', r: 4,
      img: L('tool-23.jpg'), model: 'shelfRack', brand: 'STANLEY', color: 0xf2c200, alt: 0x1a1d23,
      desc: 'Estante industrial de 4 prateleiras com pintura eletrostática e capacidade de 400kg por nivel.',
      specs: ['4 prateleiras em aço', '400kg de carga por nível', 'Pintura eletrostática antiferrugem', 'Montagem sem ferramentas']
    },
    {
      id: 21, n: 'Voltage Tester Kit', p: 19, old: 0, sale: 0, c: 'Measuring', r: 4,
      img: L('tool-24.jpg'), model: 'voltTester', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216,
      desc: 'Kit de teste de tensão com multímetro digital, sondas e detector sem contato.',
      specs: ['Multímetro digital com display LCD', 'Detector de tensão sem contato', 'Sondas com cabo reforçado', 'Medição de continuidade e resistência']
    },
    {
      id: 22, n: 'Tile Cutter 600mm', p: 49, old: 59, sale: 1, c: 'Saws', r: 4,
      img: L('tool-25.jpg'), model: 'tileCutter', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b,
      desc: 'Cortador de piso cerâmico de 600mm com base de alumínio e guia dupla regulável.',
      specs: ['Corte de até 600mm', 'Base em alumínio fundido', 'Guia dupla com escala métrica', 'Troca rápida do disco de diamante']
    },
    {
      id: 23, n: 'Nail Gun Cordless', p: 69, old: 0, sale: 0, c: 'Air Tools', r: 5,
      img: L('tool-26.jpg'), model: 'nailGun', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f,
      desc: 'Pistola de pregos sem fio 18V com magazine rápido e disparo por contato de segurança.',
      specs: ['Bateria 18V li-ion', 'Carregador de 50 pregos', 'Disparo por contato', 'Modo de disparo sequencial']
    },
    {
      id: 24, n: 'Workbench Foldable', p: 55, old: 0, sale: 0, c: 'Storage', r: 4,
      img: L('tool-27.jpg'), model: 'workbench', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23,
      desc: 'Bancada de trabalho dobrável com tampo reforçado e morsura de 250kg em aço.',
      specs: ['Tampo de 120 x 60cm reforçado', 'Capacidade de 250kg', 'Estrutura dobrável em aço', 'Altura ajustável em 3 posições']
    },
    {
      id: 25, n: 'Heat Gun 2000W', p: 25, old: 0, sale: 0, c: 'Painting', r: 4,
      img: L('tool-28.jpg'), model: 'heatGun', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f,
      desc: 'Soprador de calor 2000W com controle de temperatura e nozzle de bocal estreito.',
      specs: ['2000W de potência', 'Duas posições de temperatura', 'Bocal estreito incluso', 'Suporte para uso em bancada']
    },
    {
      id: 26, n: 'Paint Sprayer HVLP', p: 79, old: 99, sale: 1, c: 'Painting', r: 5,
      img: L('tool-29.jpg'), model: 'sprayer', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b,
      desc: 'Sprayer de tinta HVLP com copinho removível e ajuste de fluxo para paredes e móveis.',
      specs: ['Tecnologia HVLP de baixa Overspray', 'Copo de 600ml removível', 'Regulador de fluxo e padrão de leque', 'Ideal para paredes e móveis']
    }
  ];

  var CATS = ['All'];
  P.forEach(function (p) { if (CATS.indexOf(p.c) === -1) CATS.push(p.c); });

  var CAT_LABEL = {
    'All': 'Todos os produtos',
    'Drills': 'Furadeiras e marteletes',
    'Kits': 'Kits e maletas',
    'Saws': 'Serras',
    'Hand Tools': 'Ferramentas manuais',
    'Grinders': 'Esmerilhadeiras',
    'Sanders': 'Lixadeiras',
    'Storage': 'Armazenamento',
    'Measuring': 'Medição',
    'Welding': 'Solda',
    'Air Tools': 'Ferramentas pneumáticas',
    'Painting': 'Pintura e acabamento'
  };

  /* peças destacadas na vitrine 3D */
  var SPOT = [0, 4, 9, 12, 16, 26];

  /* destaques da barra lateral */
  var FEAT = [0, 5, 12];

  var BRANDS = ['DEWALT', 'MAKITA', 'BOSCH', 'STANLEY', 'BLACK+DECKER', 'MILWAUKEE', 'RYOBI', 'HILTI', 'METABO', 'NEX', 'TRAMONTINA', 'VONDER'];

  return {
    P: P, CATS: CATS, CAT_LABEL: CAT_LABEL,
    SPOT: SPOT, FEAT: FEAT, BRANDS: BRANDS,
    byId: function (id) { return P[id]; }
  };
})();
