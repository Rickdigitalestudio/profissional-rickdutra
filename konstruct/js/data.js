/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — catálogo de produtos (preços em Real)
   model → construtor 3D | color → cor primária | alt → cor 2
   pop  → popularidade (vendas) | sold → unidades vendidas
   ═══════════════════════════════════════════════════════════ */
var KONSTRUCT = (function () {
  'use strict';

  /* gerador de imagem: render 3D do próprio modelo */
  var IMG = function (id) { return 'assets/p-' + id + '.jpg'; };

  var P = [
    /* ── FURADEIRAS E MARTELETES ───────────────────────── */
    { id: 1, n: 'Martelete SDS-plus 800W', p: 289, old: 359, sale: 1, c: 'Drills', r: 5, model: 'drill', variant: 'rotary', brand: 'DEWALT', color: 0xf5b301, alt: 0x1b1e25, pop: 96, sold: 1840,
      desc: 'Martelete de 800W com funções de perfuração, perfuração e cinzelagem. Ideal para concreto, alvenaria e instalação de ancoragens.',
      specs: ['Motor de 800W com 3 modos de operação', 'Encaixe SDS-plus para brocas de 6 a 26mm', 'Empunhadura auxiliar 360° para uso em altura', 'Velocidade variável em 2 posições'] },
    { id: 2, n: 'Parafusadeira Compacta 12V', p: 349, old: 0, sale: 0, c: 'Drills', r: 5, model: 'drill', variant: 'compact', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b, pop: 88, sold: 1520,
      desc: 'Parafusadeira compacta sem fio de 12V, ideal para marcenaria, instalações elétricas e montagem em geral.',
      specs: ['Motor sem fio 12V compacto', 'Mandril de 10mm com trava rápida', 'LED de trabalho integrado', 'Apenas 1,1kg — cansa menos o braço'] },
    { id: 3, n: 'Driver de Impacto 20V', p: 549, old: 0, sale: 0, c: 'Drills', r: 5, model: 'drill', variant: 'impact', brand: 'MILWAUKEE', color: 0xc4262e, alt: 0x101216, pop: 92, sold: 1685,
      desc: 'Driver de impacto 20V com torque ajustável em 3 posições e modo de autobroca para fixações estruturais.',
      specs: ['Torque de 180Nm em 3 posições', 'Modo autobroca para parafusos de fixação', 'Bit holder de troca rápida 1/4"', 'Estrutura em alumínio reforçado'] },
    { id: 4, n: 'Parafusadeira Sem Fio 12V', p: 429, old: 519, sale: 1, c: 'Drills', r: 5, model: 'drill', variant: 'cordless', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216, pop: 78, sold: 1290,
      desc: 'Parafusadeira sem fio 12V com bateria de lítio e torque de 30Nm — leve, precisa e cabe em qualquer toolbox.',
      specs: ['Bateria de lítio 12V 2.0Ah', 'Torque máximo de 30Nm', 'Mandril metálico de 10mm', 'Carregador rápido incluso'] },
    { id: 5, n: 'Martelete de Demolição 1500W', p: 1190, old: 1490, sale: 1, c: 'Drills', r: 5, model: 'drill', variant: 'demolition', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216, pop: 70, sold: 760,
      desc: 'Martelete de demolição com 1500W e 20J de energia de impacto para concretaria pesada e escavação.',
      specs: ['1500W e 20J de energia de impacto', 'Encaixe SDS-max', 'Empunhadura com amortecimento de vibração', 'Ideal para demolição e breaking estrutural'] },
    { id: 6, n: 'Furadeira de Impacto 20V Brushless', p: 899, old: 0, sale: 0, c: 'Drills', r: 5, model: 'drill', variant: 'impact', brand: 'DEWALT', color: 0xf5b301, alt: 0x1b1e25, pop: 81, sold: 1105,
      desc: 'Furadeira de impacto com motor brushless: 30% mais durabilidade e menos aquecimento por carga.',
      specs: ['Motor brushless de alto rendimento', '2 baterias de 4Ah inclusas', '15+1 posições de torque', 'LED de luz de trabalho no punho'] },
    { id: 7, n: 'Parafusadeira 18V Profissional', p: 679, old: 0, sale: 0, c: 'Drills', r: 4, model: 'drill', variant: 'cordless', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 74, sold: 980,
      desc: 'Parafusadeira 18V para uso intensive na obra, com punho emborrachado e engrenagem metálica.',
      specs: ['Motor de 18V com engrenagem metálica', 'Punho emborrachado antivibrante', '2 baterias e carregador rápido', 'Lanterna LED de 3W'] },
    { id: 8, n: 'Furadeira de Bancada 350W', p: 749, old: 0, sale: 0, c: 'Drills', r: 4, model: 'drill', variant: 'bench', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 55, sold: 430,
      desc: 'Furadeira de bancada com motor de 350W, mesa regulável e mandril de 13mm com chave.',
      specs: ['Motor de 350W com rotação de 0 a 2800rpm', 'Mandril de 13mm com chave', 'Mesa de ferro fundido regulável', 'Base com furos de fixação'] },

    /* ── SERRAS ─────────────────────────────────────────── */
    { id: 9, n: 'Serra Circular 1400W', p: 549, old: 0, sale: 0, c: 'Saws', r: 4, model: 'circularSaw', brand: 'DEWALT', color: 0xf5b301, alt: 0x191c22, pop: 85, sold: 1320,
      desc: 'Serra circular de 1400W com disco de 185mm, corte preciso em madeira, MDF e laminados.',
      specs: ['Potência de 1400W e disco de 185mm', 'Corte até 56mm a 90°', 'Guia de corte regulável', 'Base de alumínio reforçado'] },
    { id: 10, n: 'Serra de Fita Vertical 700W', p: 429, old: 519, sale: 1, c: 'Saws', r: 4, model: 'jigSaw', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x181b21, pop: 72, sold: 890,
      desc: 'Serra de fita vertical com base inclinável e empunhadura superior emborrachada.',
      specs: ['Potência de 700W', 'Corte até 45mm em madeira', 'Base inclinável até 45°', 'Troca da lâmina sem ferramenta'] },
    { id: 11, n: 'Serra de Reciprocação 18V', p: 749, old: 0, sale: 0, c: 'Saws', r: 4, model: 'recipSaw', brand: 'MILWAUKEE', color: 0xc4262e, alt: 0x101216, pop: 79, sold: 1040,
      desc: 'Serra de reciprocação sem fio para corte de madeira, metal e tubos em espaços apertados.',
      specs: ['Batida de 25mm e 3.300 ipm', 'Corte até 300mm em madeira', 'Motor sem fio 18V', 'Empunhadura emborrachada antivibrante'] },
    { id: 12, n: 'Serra Circular de Bancada 1800W', p: 1690, old: 1990, sale: 1, c: 'Saws', r: 5, model: 'benchSaw', brand: 'DEWALT', color: 0xf5b301, alt: 0x191c22, pop: 68, sold: 520,
      desc: 'Serra de bancada profissional com mesa de ferro fundido, guia paralela e disco de 250mm.',
      specs: ['Motor de 1800W com disco de 250mm', 'Corte de até 85mm a 90°', 'Mesa em ferro fundido', 'Guia paralela e guiador de esquadria'] },
    { id: 13, n: 'Serra de Fita de Bancada 9”', p: 2190, old: 0, sale: 0, c: 'Saws', r: 4, model: 'benchSaw', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 47, sold: 210,
      desc: 'Serra de fita de bancada para madeiras de grande formato, com guia de precisão.',
      specs: ['Lâmina de 9 polegadas', 'Altura de corte de 120mm', 'Guia de precisão com escala', 'Motor com transmissão em correia'] },
    { id: 14, n: 'Serra Calibrador 600mm', p: 899, old: 1090, sale: 1, c: 'Saws', r: 4, model: 'tileCutter', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b, pop: 58, sold: 390,
      desc: 'Cortador de cerâmica de 600mm com base de alumínio e guia dupla regulável.',
      specs: ['Corte de até 600mm', 'Base em alumínio fundido', 'Guia dupla com escala métrica', 'Troca rápida do disco de diamante'] },
    { id: 15, n: 'Mini Serra Circular 45mm', p: 379, old: 0, sale: 0, c: 'Saws', r: 3, model: 'circularSaw', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 61, sold: 640,
      desc: 'Mini serra circular para cortes de precisão em ripas, laminados e rodapés.',
      specs: ['Disco de 89mm para corte de 45mm', 'Ideal para espaços apertados', 'Trilha de corte paralela inclusa', 'Peso de apenas 1,6kg'] },

    /* ── ESMERILHadeiras ────────────────────────────────── */
    { id: 16, n: 'Esmerilhadeira Angular 125mm', p: 459, old: 0, sale: 0, c: 'Grinders', r: 4, model: 'grinder', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 83, sold: 1210,
      desc: 'Esmerilhadeira angular de 125mm com sistema de Giro acidental e disco de corte.',
      specs: ['Disco de 125mm com proteção', 'Giro sem carga para segurança', 'Empunhadura lateral em 3 pontos', 'Potência de 850W'] },
    { id: 17, n: 'Esmerilhadeira 180mm 2200W', p: 589, old: 679, sale: 1, c: 'Grinders', r: 4, model: 'grinder', brand: 'DEWALT', color: 0xf5b301, alt: 0x191c22, pop: 76, sold: 940,
      desc: 'Esmerilhadeira industrial de 2200W para corte e desbaste de chapas e barras.',
      specs: ['2200W e disco de 180mm', 'Trava de segurança rápida', 'Escovas com troca facilitada', 'Ideal para corte de aço'] },
    { id: 18, n: 'Rebaixador Elétrico 1000W', p: 849, old: 0, sale: 0, c: 'Grinders', r: 4, model: 'grinder', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f, pop: 44, sold: 260,
      desc: 'Rebaixador para acabamentos em portas, moulduras e rodapés com precisão de corte.',
      specs: ['Potência de 1000W', 'Corte até 32mm de profundidade', 'Ajuste de profundidade milimétrico', 'Ideal para colunas e rodapés'] },
    { id: 19, n: 'Mini Esmerilhadeira 75mm', p: 349, old: 0, sale: 0, c: 'Grinders', r: 3, model: 'grinder', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f, pop: 52, sold: 480,
      desc: 'Mini esmerilhadeira para cantoneiras, soldas e ajustes finos em espaço reduzido.',
      specs: ['Disco de 75mm', 'Corpo compacto com chave de 2 posições', 'Ideal para cantoneira e solda', 'Trava rápida de disco'] },

    /* ── LIXADEIRAS ─────────────────────────────────────── */
    { id: 20, n: 'Lixadeira Orbital 300W', p: 389, old: 0, sale: 0, c: 'Sanders', r: 4, model: 'orbitalSander', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 74, sold: 950,
      desc: 'Lixadeira orbital de 300W com sistema de coleta de pó e base de 125mm com troca rápida.',
      specs: ['Base de 125mm com troca rápida', 'Órbita de 2,5mm', 'Sistema de coleta de poeira', 'Velocidade variável de 7.000 a 12.000rpm'] },
    { id: 21, n: 'Lixadeira de Cinta Pro', p: 469, old: 549, sale: 1, c: 'Sanders', r: 4, model: 'beltSander', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f, pop: 66, sold: 720,
      desc: 'Lixadeira de cinta profissional com controle de velocidade e saco coletor de pó.',
      specs: ['Cinta de 75 x 533mm', 'Velocidade variável', 'Saco coletor de pó removível', 'Base metálica com grafite'] },
    { id: 22, n: 'Lixadeira de Rolo 900W', p: 1099, old: 0, sale: 0, c: 'Sanders', r: 4, model: 'beltSander', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 41, sold: 195,
      desc: 'Lixadeira de rolo para lixamento de grandes superfícies, portas e painéis.',
      specs: ['Potência de 900W', 'Cilindro de 100 x 610mm', 'Quadro de lixamento em alumínio', 'Extração de pó com mangueira'] },
    { id: 23, n: 'Lixadeira Delta 150W', p: 299, old: 0, sale: 0, c: 'Sanders', r: 4, model: 'orbitalSander', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f, pop: 58, sold: 540,
      desc: 'Lixadeira delta compacta para cantos, curvas e áreas de difícil acesso.',
      specs: ['Motor de 150W', 'Base delta de 100 x 100mm', 'Ideal para cantos internos', 'Saco coletor incluso'] },

    /* ── FERRAMENTAS MANUAIS ────────────────────────────── */
    { id: 24, n: 'Jogo de Chaves Combinadas 6 peças', p: 349, old: 0, sale: 0, c: 'Hand Tools', r: 5, model: 'wrenchSet', brand: 'BOSCH', color: 0xd4322b, alt: 0x2a2e36, pop: 87, sold: 1420,
      desc: 'Jogo de chaves combinadas em aço cromo-vanádio com acabamento polido e identificação a laser.',
      specs: ['6 chaves combinadas de 8 a 19mm', 'Aço cromo-vanádio temperado', 'Acabamento polido anticorrosão', 'Identificação laser permanente'] },
    { id: 25, n: 'Jogo de Soquetes 108 peças', p: 689, old: 799, sale: 1, c: 'Hand Tools', r: 5, model: 'socketSet', brand: 'BOSCH', color: 0xd4322b, alt: 0x171a20, pop: 81, sold: 980,
      desc: 'Jogo de 108 soquetes em aço cromo-vanádio com trilho organizável e gavetas.',
      specs: ['108 peças métricas', 'Aço cromo-vanádio polido', 'Trilho de organização incluso', 'Soquetes de 1/4", 3/8" e 1/2"'] },
    { id: 26, n: 'Jogo de Chaves Allen 9 peças', p: 129, old: 0, sale: 0, c: 'Hand Tools', r: 4, model: 'socketSet', brand: 'STANLEY', color: 0xf2c200, alt: 0x171a20, pop: 63, sold: 870,
      desc: 'Jogo de chaves allen com terminal em aço S2 e acabamento cromado.',
      specs: ['9 peças de 1,5 a 10mm', 'Aço S2 temperado', 'Terminal em nylon para firmeza', 'Suporte plástico incluso'] },
    { id: 27, n: 'Alicate Universal 8”', p: 89, old: 0, sale: 0, c: 'Hand Tools', r: 4, model: 'wrenchSet', brand: 'TRAMONTINA', color: 0xd4322b, alt: 0x2a2e36, pop: 70, sold: 1105,
      desc: 'Alicate universal forjado em aço cromo-vanádio com cabo emborrachado antiderrapante.',
      specs: ['8 polegadas — 200mm', 'Aço cromo-vanádio forjado', 'Cabo emborrachado antiderrapante', 'Acabamento polido'] },
    { id: 28, n: 'Martelo Unha 27mm', p: 109, old: 139, sale: 1, c: 'Hand Tools', r: 4, model: 'wrenchSet', brand: 'TRAMONTINA', color: 0xe03a2f, alt: 0x2a2e36, pop: 69, sold: 1060,
      desc: 'Martelo unha com cabeça forjada em aço e cabo de fibra de vidro com revestimento emborrachado.',
      specs: ['Cabeça de 27mm em aço forjado', 'Cabo de fibra de vidro', 'Revestimento emborrachado', 'Unha extraída para pregos'] },
    { id: 29, n: 'Kit Trena + Nível + Bolso', p: 179, old: 0, sale: 0, c: 'Hand Tools', r: 4, model: 'tape', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 59, sold: 720,
      desc: 'Kit com trena de 5m, nível de bolha e marcadores para o bolso de obra.',
      specs: ['Trena de 5m com fita dupla face', 'Nível de bolha com visor de 180°', 'Marcadores de giz e grafite', 'Bolsão resistente incluso'] },

    /* ── KITS E MALETAS ─────────────────────────────────── */
    { id: 30, n: 'Combo Kit 5 peças', p: 629, old: 0, sale: 0, c: 'Kits', r: 4, model: 'toolcase', variant: 'combo', brand: 'BOSCH', color: 0xd4322b, alt: 0x1a1d23, pop: 90, sold: 1500,
      desc: 'Kit completo com furadeira, bateria, carregador e maleta rígida — tudo que a obra pede, na caixa.',
      specs: ['Furadeira, bateria e carregador', 'Maleta rígida com trava', 'Conjunto de brocas e pontas', 'Garantia de 12 meses'] },
    { id: 31, n: 'Drill Set + Maleta', p: 379, old: 459, sale: 1, c: 'Kits', r: 4, model: 'toolcase', variant: 'drill', brand: 'STANLEY', color: 0xf2c200, alt: 0x1a1d23, pop: 78, sold: 1120,
      desc: 'Conjunto de parafusadeira com bateria e maleta organizadora com espuma recortada.',
      specs: ['Parafusadora sem fio 18V', 'Duas baterias inclusas', 'Espuma recortada sob medida', 'Design robusto para canteiro'] },
    { id: 32, n: 'Kit Ship Your Idea', p: 349, old: 0, sale: 0, c: 'Kits', r: 5, model: 'toolcase', variant: 'ship', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f, pop: 84, sold: 1310,
      desc: 'Kit BOX com as ferramentas essenciais para transformar qualquer ideia em projeto.',
      specs: ['Maleta organizadora com alça', 'Ferramentas essenciais selecionadas', 'Compartimentos em EVA', 'Ideal para presente corporativo'] },
    { id: 33, n: 'Kit Eletricista 12 peças', p: 459, old: 549, sale: 1, c: 'Kits', r: 4, model: 'voltTester', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216, pop: 71, sold: 860,
      desc: 'Kit completo do eletricista: multímetro, alicate de corte, fita isolante e chaves de teste.',
      specs: ['Multímetro digital com display', 'Alicate de corte isolado 1000V', 'Fita isolante e marcadores', 'Sonda de teste com cabo reforçado'] },
    { id: 34, n: 'Kit Mecânico 15 peças', p: 599, old: 0, sale: 0, c: 'Kits', r: 5, model: 'socketSet', brand: 'NEX', color: 0x2f7dd1, alt: 0x171a20, pop: 76, sold: 1020,
      desc: 'Kit de 15 peças para mecânica com soquetes, chaves e alicates em maleta rígida.',
      specs: ['15 peças métricas em aço S2', 'Maleta rígida com trava', 'Chaves combinadas e soquetes', 'Terminais e correntes'] },
    { id: 35, n: 'Kit Pneumático 20 peças', p: 749, old: 0, sale: 0, c: 'Kits', r: 4, model: 'socketSet', brand: 'METABO', color: 0x3f8fd0, alt: 0x171a20, pop: 49, sold: 280,
      desc: 'Kit pneumático para oficina com chave de impacto, soquetes e mangueira.',
      specs: ['Chave de impacto pneumática', 'Soquetes de 1/2" e 3/4"', 'Mangueira e conexões', 'Maleta organizadora'] },

    /* ── ARMAZENAMENTO ─────────────────────────────────── */
    { id: 36, n: 'Carrinho de Oficina 5 Gavetas', p: 899, old: 1090, sale: 1, c: 'Storage', r: 5, model: 'cabinet', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 82, sold: 1180,
      desc: 'Carrinho de oficina com 5 gavetas, travas de segurança e rodízios para manuseio fácil.',
      specs: ['5 gavetas com travas de segurança', 'Estrutura em aço de 1mm', 'Rodízios com freio', 'Capacidade de 120kg'] },
    { id: 37, n: 'Estante Industrial 4 Prateleiras', p: 1290, old: 0, sale: 0, c: 'Storage', r: 4, model: 'shelfRack', brand: 'STANLEY', color: 0xf2c200, alt: 0x1a1d23, pop: 60, sold: 520,
      desc: 'Estante industrial de 4 prateleiras com pintura eletrostática e 400kg de carga por nível.',
      specs: ['4 prateleiras em aço', '400kg de carga por nível', 'Pintura eletrostática antiferrugem', 'Montagem sem ferramentas'] },
    { id: 38, n: 'Bancada Dobrável 120cm', p: 999, old: 1190, sale: 1, c: 'Storage', r: 4, model: 'workbench', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 67, sold: 610,
      desc: 'Bancada de trabalho dobrável com tampo reforçado e suporte de 250kg em aço.',
      specs: ['Tampo de 120 x 60cm reforçado', 'Capacidade de 250kg', 'Estrutura dobrável em aço', 'Altura ajustável em 3 posições'] },
    { id: 39, n: 'Caixa de Ferramentas Plástica 20”', p: 139, old: 0, sale: 0, c: 'Storage', r: 4, model: 'toolcase', variant: 'box', brand: 'NEX', color: 0xd4322b, alt: 0x1a1d23, pop: 72, sold: 1080,
      desc: 'Caixa organizadora em polipropileno com tampa, trava e divisórias internas.',
      specs: ['Capacidade de 20 litros', 'PP de alta resistência', 'Trava metálica com furo para cadeado', 'Alça lateral emborrachada'] },
    { id: 40, n: 'Painel Organizador Modular', p: 259, old: 0, sale: 0, c: 'Storage', r: 4, model: 'cabinet', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 45, sold: 240,
      desc: 'Painel de parede modular para guardar chaves, brocas e accessories em ordem.',
      specs: ['Painel em aço perfurado', 'Ganchos e suportes inclusos', 'Fixação por furação ou imã', 'Expansível com módulos'] },

    /* ── MEDIÇÃO ────────────────────────────────────────── */
    { id: 41, n: 'Medidor de Distância a Laser 40m', p: 549, old: 0, sale: 0, c: 'Measuring', r: 5, model: 'laser', brand: 'STANLEY', color: 0xf2c200, alt: 0x171a20, pop: 79, sold: 1050,
      desc: 'Medidor de distância a laser com 40 metros de alcance e display retroiluminado.',
      specs: ['Alcance de 40m sem refletor', 'Precisão de ±1,5mm', 'Display retroiluminado', 'Função de área e volume'] },
    { id: 42, n: 'Nível a Laser 360°', p: 1390, old: 1690, sale: 1, c: 'Measuring', r: 5, model: 'laserLevel', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 64, sold: 480,
      desc: 'Nível a laser rotativo 360° para nivelar pisos, paredes e grandes áreas com precisão.',
      specs: ['Rotação 360° horizontal e vertical', 'Precisão de ±1,5mm', 'Função de trave para áreas inclinadas', 'Base com rosca 5/8" para tripé'] },
    { id: 43, n: 'Trena 8m Profissional', p: 69, old: 0, sale: 0, c: 'Measuring', r: 4, model: 'tape', brand: 'TRAMONTINA', color: 0xd4322b, alt: 0x2a2e36, pop: 76, sold: 1380,
      desc: 'Trena de 8m com fita fibra de vidro, carretel reforçado e gancho magneticamente fixo.',
      specs: ['8 metros de fita em fibra de vidro', 'Carretel reforçado com trava', 'Gancho magnético na ponta', 'Clipe de cinto e ponta de aço'] },
    { id: 44, n: 'Nível de Bolso 40cm', p: 49, old: 0, sale: 0, c: 'Measuring', r: 4, model: 'tape', brand: 'TRAMONTINA', color: 0x63b13a, alt: 0x2a2e36, pop: 70, sold: 1250,
      desc: 'Nível de bolha 40cm com ampola vertical e horizontal e corpo em alumínio.',
      specs: ['Comprimento de 40cm', 'Ampolas de alta visibilidade', 'Corpo em alumínio anodizado', 'Cantos emborrachados'] },
    { id: 45, n: 'Multímetro Digital com Teste', p: 239, old: 289, sale: 1, c: 'Measuring', r: 4, model: 'voltTester', brand: 'HILTI', color: 0xe03a2f, alt: 0x101216, pop: 73, sold: 890,
      desc: 'Multímetro digital com display LCD, testes de continuidade e diodo e detector sem contato.',
      specs: ['Multímetro digital com display LCD', 'Detector de tensão sem contato', 'Sondas com cabo reforçado', 'Medição de continuidade e resistência'] },

    /* ── SOLDA ──────────────────────────────────────────── */
    { id: 46, n: 'Inversor de Solda 160A', p: 1490, old: 1790, sale: 1, c: 'Welding', r: 5, model: 'welder', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f, pop: 81, sold: 940,
      desc: 'Inversor de solda de 160A com partida por contato e display digital de amperagem.',
      specs: ['160A de potência real', 'Solda MMA com partida por contato', 'Display digital de amperagem', 'Proteção térmica e de sobrecarga'] },
    { id: 47, n: 'Inversor de Solda MIG 250A', p: 2890, old: 0, sale: 0, c: 'Welding', r: 5, model: 'welder', brand: 'METABO', color: 0x3f8fd0, alt: 0x16191f, pop: 38, sold: 145,
      desc: 'Inversor MIG/MMA de 250A para solda contínua em chapa média e estrutural.',
      specs: ['250A com curva MIG/MMA', 'Alimentador de ar-ácido incluso', 'Rolo de arame de 0,8 e 1,0mm', 'Ajuste de tensão e velocidadee'] },
    { id: 48, n: 'Solda de Ponto 110V', p: 899, old: 0, sale: 0, c: 'Welding', r: 4, model: 'welder', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f, pop: 33, sold: 120,
      desc: 'Solda de ponto elétrica para carrocerias e chapas finas, com timer de acionamento.',
      specs: ['Potência de 2500W', 'Timer de 0,3 a 3 segundos', 'Pontas de solda intercambiáveis', 'Proteção contra sobrecarga'] },
    { id: 49, n: 'Máscara de Solda Automática', p: 289, old: 349, sale: 1, c: 'Welding', r: 4, model: 'cap', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 57, sold: 560,
      desc: 'Máscara de solda com visor escurecido automaticamente e ajuste de(headgear) por catraca.',
      specs: ['Visor com escurecimento automático', 'Ajuste da cabeça por catraca', 'Proteção UV e IR contra os raios', 'Design leve e confortável'] },

    /* ── PNEUMÁTICOS ────────────────────────────────────── */
    { id: 50, n: 'Compressor de Ar 24L', p: 1690, old: 1990, sale: 1, c: 'Air Tools', r: 4, model: 'compressor', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 77, sold: 780,
      desc: 'Compressor de ar de 24L com motor de 2CV, pressão de 8bar e saída quick-connect.',
      specs: ['Tanque de 24L em aço', 'Motor de 2CV direto', 'Pressão máxima de 8bar', 'Saídas quick-connect de 1/4"'] },
    { id: 51, n: 'Pistola de Pregos Sem Fio', p: 1290, old: 0, sale: 0, c: 'Air Tools', r: 5, model: 'nailGun', brand: 'RYOBI', color: 0x63b13a, alt: 0x16191f, pop: 69, sold: 640,
      desc: 'Pistola de pregos sem fio 18V com carregador rápido e disparo por contato de segurança.',
      specs: ['Bateria de lítio 18V', 'Carregador de 50 pregos', 'Disparo por contato de segurança', 'Modo sequencial ou rápido'] },
    { id: 52, n: 'Compressor Portátil 6L', p: 449, old: 0, sale: 0, c: 'Air Tools', r: 4, model: 'compressor', brand: 'NEX', color: 0xd4322b, alt: 0x1a1d23, pop: 48, sold: 250,
      desc: 'Compressor portátil de 6L para acabamento, pintura e inflagem rápida na obra.',
      specs: ['Tanque de 6L em aço', 'Motor de 1/3 CV', 'Pressão de 8bar', 'Tampa com válvula de segurança'] },
    { id: 53, n: 'Pistola de Pintura 1.3mm', p: 379, old: 429, sale: 1, c: 'Air Tools', r: 4, model: 'sprayer', brand: 'DEWALT', color: 0xf5b301, alt: 0x191c22, pop: 62, sold: 690,
      desc: 'Pistola de pintura a ar com bocal de 1,3mm, ideal para paredes e mobiliário.',
      specs: ['Bocal de 1,3mm', 'Copo de 600ml com tampa', 'Regulador de vazão de tinta', 'Filtro de ar removível'] },

    /* ── PINTURA E ACABAMENTO ───────────────────────────── */
    { id: 54, n: 'Sprayer de Tinta HVLP', p: 1390, old: 1690, sale: 1, c: 'Painting', r: 5, model: 'sprayer', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b, pop: 74, sold: 820,
      desc: 'Sprayer de tinta HVLP com copinho removível e ajuste de fluxo para paredes e móveis.',
      specs: ['Tecnologia HVLP com baixo desperdício', 'Copo de 600ml removível', 'Regulador de fluxo e padrão de leque', 'Ideal para paredes e móveis'] },
    { id: 55, n: 'Soprador de Calor 2000W', p: 399, old: 0, sale: 0, c: 'Painting', r: 4, model: 'heatGun', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f, pop: 66, sold: 940,
      desc: 'Soprador de calor de 2000W com controle de temperatura e bocal estreito.',
      specs: ['2000W de potência', 'Duas posições de temperatura', 'Bocal estreito incluso', 'Suporte para uso em bancada'] },
    { id: 56, n: 'Rolo de Pintura Profissional 23cm', p: 79, old: 0, sale: 0, c: 'Painting', r: 4, model: 'paintRoller', brand: 'TRAMONTINA', color: 0xd4322b, alt: 0xf5b301, pop: 71, sold: 1290,
      desc: 'Rolo profissional de 23cm com pelúcia de alta densidade e cabo em aço galvanizado.',
      specs: ['Largura de 23cm', 'Pelúcia de alta absorção', 'Cabo de aço galvanizado', 'Suporte inclinado incluso'] },
    { id: 57, n: 'Lixa Massa Corrida 5 unidades', p: 59, old: 79, sale: 1, c: 'Painting', r: 4, model: 'paintRoller', brand: 'NEX', color: 0x3f8fd0, alt: 0xf5b301, pop: 59, sold: 1340,
      desc: 'Pacote com 5 lixas de massa corrida para lixamento fino de paredes e Drywall.',
      specs: ['5 unidades de 150 x 220mm', 'Grão 150 para acabamento', 'Não empelota', 'Resistente à umidade'] },
    { id: 58, n: 'Pistola de Pintura Elétrica 600W', p: 899, old: 0, sale: 0, c: 'Painting', r: 4, model: 'sprayer', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 46, sold: 275,
      desc: 'Pistola elétrica com reservatório de 1L, ideal para grandes áreas e pintura sem respingos.',
      specs: ['Motor de 600W', 'Reservatório de 1L removível', 'Bocal ajustável de 1,5 a 3mm', 'Limpeza rápida sem desmontar'] },

    /* ── SEGURANÇA ──────────────────────────────────────── */
    { id: 59, n: 'Capacete de Segurança Branco', p: 69, old: 89, sale: 1, c: 'Safety', r: 5, model: 'cap', brand: 'DEWALT', color: 0xf2f4f7, alt: 0x2a2e36, pop: 88, sold: 2100,
      desc: 'Capacete de segurança com aba frontal e ajuste de nuca por catraca em 6 posições.',
      specs: ['Aba frontal para proteção solar', 'Ajuste de nuca em 6 posições', 'Suspensão interna confortável', 'Certificado NR-6'] },
    { id: 60, n: 'Óculos de Proteção Incolor', p: 29, old: 0, sale: 0, c: 'Safety', r: 4, model: 'glasses', brand: 'BLACK+DECKER', color: 0x22262d, alt: 0x8a9099, pop: 80, sold: 1850,
      desc: 'Óculos de proteção incolor com armação flexível e lentes com tratamento antirrisco.',
      specs: ['Lentes incolores antirrisco', 'Armação flexível em nylon', 'Proteção contra impacto lateral', 'Uso com óculos de grau'] },
    { id: 61, n: 'Luva de Raspa em Couro', p: 45, old: 59, sale: 1, c: 'Safety', r: 4, model: 'glove', brand: 'TRAMONTINA', color: 0xd9b26a, alt: 0x2a2e36, pop: 78, sold: 1620,
      desc: 'Luva de raspa em couro com palma reforçada e punho curto para manuseio de materiais.',
      specs: ['Couro com raspa natural', 'Palma reforçada', 'Punho curto de 5cm', 'Tamanho único ajustável'] },
    { id: 62, n: 'Cinto de Ferramentas 18 Bolsos', p: 159, old: 0, sale: 0, c: 'Safety', r: 5, model: 'belt', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 76, sold: 1240,
      desc: 'Cinto de ferramenta com 18 bolsos em polyester reforçado, fivela metálica e alça para martelo.',
      specs: ['18 bolsos de vários tamanhos', 'Fivela metálica com regulagem', 'Alça de martelo integrada', 'Costura reforçada nos pontos de carga'] },
    { id: 63, n: 'Protetor Auricular Plug', p: 19, old: 0, sale: 0, c: 'Safety', r: 4, model: 'cap', brand: 'STANLEY', color: 0x2f7dd1, alt: 0x14161b, pop: 64, sold: 1980,
      desc: 'Protetor auricular plug com material espuma de expansão lenta para conforto o dia todo.',
      specs: ['Redução de ruído de 33dB', 'Espuma de expansão lenta', 'Reutilizável com higienização', 'Embalagem com 200 pares'] },

    /* ── MARCENARIA ─────────────────────────────────────── */
    { id: 64, n: 'Plaina Elétrica 82mm', p: 899, old: 1090, sale: 1, c: 'Wood Tools', r: 4, model: 'planer', brand: 'MAKITA', color: 0x2f7dd1, alt: 0x14161b, pop: 51, sold: 310,
      desc: 'Plaina elétrica de 82mm com regulagem de profundidade em 0,5mm e base de alumínio.',
      specs: ['Largura de corte de 82mm', 'Regulagem de profundidade em 0,5mm', 'Base em alumínio fundido', 'Sacador de cavacos lateral'] },
    { id: 65, n: 'Torno de Bancada 1000W', p: 1590, old: 0, sale: 0, c: 'Wood Tools', r: 4, model: 'benchSaw', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 36, sold: 145,
      desc: 'Torno de bancada com diâmetro máximo de 250mm e construção em aço para peças próprias.',
      specs: ['Diâmetro máximo de 250mm', 'Estrutura em aço pesada', 'Guia transversal com escala', 'Velocidades de rotação variáveis'] },
    { id: 66, n: 'Lixadeira de Bancada com Disco 300mm', p: 1790, old: 1990, sale: 1, c: 'Wood Tools', r: 4, model: 'beltSander', brand: 'DEWALT', color: 0xf5b301, alt: 0x1a1d23, pop: 42, sold: 190,
      desc: 'Lixadeira de disco de 300mm para facedamento de tábuas e canteiros.',
      specs: ['Disco de 300mm', 'Motor de 750W', 'Mesa inclinável', 'Extração de poeira'] },
    { id: 67, n: 'Sapatilha de Marble 6cm', p: 1390, old: 0, sale: 0, c: 'Wood Tools', r: 4, model: 'planer', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 29, sold: 95,
      desc: 'Sapatilha de marble para acabamento fino em bordas de portas eplementos.',
      specs: ['Largura de 6cm', 'Lâmina reversível', 'Ajuste fino de altura', 'Ideal para cantoneiras'] },

    /* ── JARDIM E AGRO ──────────────────────────────────── */
    { id: 68, n: 'Roçadeira a Gasolina 52cc', p: 1890, old: 2190, sale: 1, c: 'Garden', r: 4, model: 'brushCutter', brand: 'STANLEY', color: 0xf2c200, alt: 0x15181e, pop: 57, sold: 430,
      desc: 'Roçadeira a gasolina de 52cc com lâmina de 2 corte e cinto de sustentação.',
      specs: ['Motor a gasolina de 52cc', 'Lâmina de 2 cortes de 23cm', 'Cinto de sustentação e carenagem', 'Partida fácil e sem puxão'] },
    { id: 69, n: 'Motosserra Elétrica 2000W', p: 1190, old: 0, sale: 0, c: 'Garden', r: 4, model: 'brushCutter', brand: 'BLACK+DECKER', color: 0xf07c1e, alt: 0x16191f, pop: 44, sold: 280,
      desc: 'Motosserra elétrica de 2000W com sabre de 40cm e tensionamento sem ferramentas.',
      specs: ['Motor de 2000W', 'Sabre de 40cm', 'Tensionamento rápido da corrente', 'Óleo automático de corrente'] },
    { id: 70, n: 'Enxada de Jardim com Cabo', p: 89, old: 0, sale: 0, c: 'Garden', r: 4, model: 'tape', brand: 'TRAMONTINA', color: 0x63b13a, alt: 0x2a2e36, pop: 55, sold: 720,
      desc: 'Enxada de jardim com lâmina em aço e cabo de madeira com acabamento fosco.',
      specs: ['Lâmina em aço-carbono', 'Cabo de madeira de 1,2m', 'Bordas retificadas', 'Ideal para canteiros e jardins'] },

    /* ── ENERGIA E ELÉTRICA ─────────────────────────────── */
    { id: 71, n: 'Gerador 3500W Bivolt', p: 2490, old: 2890, sale: 1, c: 'Power', r: 5, model: 'generator', brand: 'METABO', color: 0x3f8fd0, alt: 0x1a1d23, pop: 62, sold: 390,
      desc: 'Gerador a gasolina de 3500W bivolt com partida elétrica, painel digital e proteção de sobrecarga.',
      specs: ['3500W de potência máxima', 'Bivolt automático 110/220V', 'Partida elétrica com chave', 'Duas tomadas e USB'] },
    { id: 72, n: 'Estabilizador 3000VA Bivolt', p: 649, old: 0, sale: 0, c: 'Power', r: 4, model: 'generator', brand: 'NEX', color: 0xd4322b, alt: 0x1a1d23, pop: 54, sold: 610,
      desc: 'Estabilizador de 3000VA com proteção contra surto, curto e sobrecarga.',
      specs: ['3000VA de potência', 'Bivolt automático', 'LEDs de status e alarme sonoro', 'Autonomia de até 2 horas'] },
    { id: 73, n: 'Extintor de Incêndio 10L B', p: 189, old: 0, sale: 0, c: 'Power', r: 4, model: 'extinguisher', brand: 'NEX', color: 0xd4322b, alt: 0x1a1d23, pop: 47, sold: 520,
      desc: 'Extintor de incêndio de 10L tipo B, com válvula de alta performance e certificado INMETRO.',
      specs: ['Carga de 10L de pó químico', 'Classificação de incêndio B', 'Válvula de alta performance', 'Certificado INMETRO'] }
  ];

  /* ── categorias (rótulos em português) ─────────────────── */
  var CAT_LABEL = {
    'Drills': 'Furadeiras e marteletes',
    'Saws': 'Serras',
    'Grinders': 'Esmerilhadeiras',
    'Sanders': 'Lixadeiras',
    'Hand Tools': 'Ferramentas manuais',
    'Kits': 'Kits e maletas',
    'Storage': 'Armazenamento',
    'Measuring': 'Medição',
    'Welding': 'Solda',
    'Air Tools': 'Pneumáticos',
    'Painting': 'Pintura e acabamento',
    'Safety': 'Segurança',
    'Wood Tools': 'Marcenaria',
    'Garden': 'Jardim e agro',
    'Power': 'Energia e elétrica'
  };

  var CATS = [];
  P.forEach(function (p) { if (CATS.indexOf(p.c) === -1) CATS.push(p.c); });

  /* imagem gerada a partir do próprio modelo 3D + nº de avaliações */
  P.forEach(function (p) {
    p.img = IMG(p.id);
    p.rc = Math.max(3, Math.round(p.sold * 0.13));
    p.stock = 3 + (p.id * 7) % 14;
  });

  /* marcas ordenadas por volume de catálogo */
  var BRANDS = [];
  P.forEach(function (p) { if (BRANDS.indexOf(p.brand) === -1) BRANDS.push(p.brand); });
  BRANDS.sort(function (a, b) {
    var ca = P.filter(function (p) { return p.brand === a; }).length;
    var cb = P.filter(function (p) { return p.brand === b; }).length;
    return cb - ca || a.localeCompare(b);
  });

  /* peças destacadas na vitrine 3D (ids) */
  var SPOT = [1, 9, 16, 31, 46, 54];

  /* destaques da barra lateral (ids) */
  var FEAT = [1, 3, 36];

  /* buscas populares */
  var POPULAR = ['Serra', 'Furadeira', 'Maleta', 'Capacete', 'Laser', 'Solda'];

  return {
    P: P, CATS: CATS, CAT_LABEL: CAT_LABEL, BRANDS: BRANDS,
    SPOT: SPOT, FEAT: FEAT, POPULAR: POPULAR,
    byId: function (id) {
      for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
      return null;
    },
    byIndex: function (i) { return P[i]; }
  };
})();
