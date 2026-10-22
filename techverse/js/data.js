/* ============================================================
   TechVerse — dados da loja (fotos originais em ./assets)
   ============================================================ */
window.TV = {
  phone: '5511989426415',
  products: [
    {id:1,  n:'Smart Watch Series 9',  p:299.99, old:349.99, l:'2.1k', c:'Wearables',    img:'assets/prod-watch.jpg',          r:4.8, s:24, badge:'Oferta',  d:'Relógio com tela Always-On, GPS duplo, monitoramento de oxigênio e bateria de 3 dias.'},
    {id:2,  n:'Wireless Earbuds Pro',  p:129.99, old:0,      l:'1.6k', c:'Audio',        img:'assets/prod-earbuds.jpg',        r:4.7, s:58, badge:'Novo',    d:'Cancelamento ativo de ruído, áudio espacial e estojo com 32h de autonomia total.'},
    {id:3,  n:'Portable Bluetooth Speaker', p:59.99, old:79.99, l:'1.2k', c:'Audio',      img:'assets/prod-speaker.jpg',        r:4.6, s:73, badge:'Oferta',  d:'Som 360° à prova d’água (IPX7) com graves profundos e 20h de reprodução.'},
    {id:4,  n:'3-in-1 Wireless Charger', p:49.99, old:0,     l:'980',  c:'Accessories',  img:'assets/prod-charger.jpg',        r:4.5, s:96, badge:'',        d:'Carrega celular, relógio e fones ao mesmo tempo com 15W rápidos e led de ambiente.'},
    {id:5,  n:'4K Camera Drone',       p:499.99, old:579.99, l:'1.6k', c:'Gadgets',      img:'assets/prod-drone.jpg',          r:4.9, s:12, badge:'Oferta',  d:'Câmera 4K com estabilização de 3 eixos, obstáculo avoidance e 34 min de voo.'},
    {id:6,  n:'Smartphone Gimbal Pro', p:89.99,  old:0,      l:'760',  c:'Accessories',  img:'assets/prod-gimbal.jpg',         r:4.4, s:41, badge:'',        d:'Estabilizador 3 eixos com follow automático, time-lapse e alavanca de zoom.'},
    {id:7,  n:'Headphone Pro Max',     p:349.99, old:399.99, l:'3.2k', c:'Audio',        img:'assets/prod-headphone-pro.jpg',  r:4.9, s:18, badge:'Top',     d:'Referência em estúdio: drivers de 40mm, ANC adaptativo e 60h de bateria.'},
    {id:8,  n:'Soundbar Dolby 5.1',    p:199.99, old:0,      l:'890',  c:'Audio',        img:'assets/prod-soundbar.jpg',       r:4.6, s:29, badge:'',        d:'Cinema em casa com sub sem fio, eARC e modos de voz otimizados para séries.'},
    {id:9,  n:'Studio Mic USB',        p:119.99, old:0,      l:'640',  c:'Audio',        img:'assets/prod-mic.jpg',            r:4.5, s:47, badge:'Novo',    d:'Condensador cardioid com ganho direto no corpo, ideal para podcast e streaming.'},
    {id:10, n:'Fit Band Active 2',     p:79.99,  old:99.99,  l:'1.1k', c:'Wearables',    img:'assets/prod-fitband.jpg',        r:4.4, s:64, badge:'Oferta',  d:'Pulseira leve com 120 modos esportivos, sleep coach e 14 dias de bateria.'},
    {id:11, n:'Watch Ultra Titanium',  p:399.99, old:0,      l:'2.8k', c:'Wearables',    img:'assets/prod-watch-ultra.jpg',    r:4.9, s:9,  badge:'Top',     d:'Caixa em titânio, botão de ação programável e resistência extrema para trilhas.'},
    {id:12, n:'VR Headset Vision',     p:549.99, old:0,      l:'1.9k', c:'Wearables',    img:'assets/prod-vr.jpg',             r:4.7, s:7,  badge:'Novo',    d:'Realidade mista em 4K por olho, controladores hand-tracking e biblioteca AAA.'},
    {id:13, n:'Action Cam 4K',         p:249.99, old:0,      l:'1.3k', c:'Gadgets',      img:'assets/prod-actioncam.jpg',      r:4.6, s:33, badge:'',        d:'Câmera de aventura com hiperestabilização, modo noturno e captura underwater.'},
    {id:14, n:'Power Bank 20K mAh',    p:39.99,  old:54.99,  l:'2.4k', c:'Gadgets',      img:'assets/prod-powerbank.jpg',      r:4.8, s:120,badge:'Oferta',  d:'20.000mAh com carregamento 65W, tela digital e 3 saídas simultâneas.'},
    {id:15, n:'Mechanical Keyboard RGB', p:99.99, old:0,     l:'1.5k', c:'Accessories',  img:'assets/prod-keyboard.jpg',       r:4.7, s:52, badge:'',        d:'Switches hot-swap lineares, abutment por tecla e comandos por áudio via software.'},
    {id:16, n:'Wireless Mouse Ergo',   p:49.99,  old:0,      l:'1.0k', c:'Accessories',  img:'assets/prod-mouse.jpg',          r:4.5, s:88, badge:'',        d:'Formato ergonômico com apoio para polegar, sensor 8K e silêncio total.'},
    {id:17, n:'Smart Speaker Echo',    p:89.99,  old:0,      l:'2.2k', c:'Smart Devices',img:'assets/prod-echo.jpg',           r:4.7, s:61, badge:'',        d:'Assistente com som 360°, central da casa inteligente e chamadas em grupo.'},
    {id:18, n:'Smart Lamp LED',        p:59.99,  old:74.99,  l:'870',  c:'Smart Devices',img:'assets/prod-lamp.jpg',           r:4.4, s:77, badge:'Oferta',  d:'16 milhões de cores, integração com assistentes e rotinas de despertar suaves.'}
  ],
  cats: [
    {n:'Audio',         s:'Premium Sound',    img:'assets/cat-audio.jpg'},
    {n:'Smart Devices', s:'Smarter Living',   img:'assets/cat-smart.jpg'},
    {n:'Wearables',     s:'Track. Achieve.',  img:'assets/cat-wear.jpg'},
    {n:'Accessories',   s:'Designed for You', img:'assets/cat-acc.jpg'},
    {n:'Deals',         s:'Top Deals Today',  img:'assets/cat-deals.jpg'}
  ],
  ideas: [
    ['Tech Setup Ideas',        128, 'assets/idea-setup.jpg',   'keyboard'],
    ['Travel Tech Essentials',  96,  'assets/idea-travel.jpg',   'power bank'],
    ['Smart Home Inspiration',  74,  'assets/idea-home.jpg',     'Smart Devices'],
    ['Gaming Gear',             155, 'assets/idea-gaming.jpg',   'Mouse'],
    ['Minimal Desk Setup',      87,  'assets/idea-desk.jpg',     'Charger'],
    ['Audio Room',              64,  'assets/idea-audio.jpg',    'Audio'],
    ['Home Office',             92,  'assets/idea-office.jpg',   'Mic'],
    ['Gaming Pro',              143, 'assets/idea-gaming2.jpg',  'Gadgets']
  ]
};
