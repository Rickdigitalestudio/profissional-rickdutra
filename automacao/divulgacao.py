"""Divulgacao diaria: avisa buscadores (IndexNow) + gira a CTA criativa do site.

Uso: python automacao/divulgacao.py [--cta-only] [--indexnow-only]
Sem argumentos: faz os dois. Seguro para rodar 2x/dia via GitHub Actions.
"""
import datetime
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://rickdigitalestudio.github.io/profissional-rickdutra'
KEY = '01f55ca1c6a077a6163e877fef6543e9'
KEY_URL = BASE + '/' + KEY + '.txt'
WA = 'https://wa.me/5511989426415'

# 14 chamadas criativas (ciclo de 2 semanas). Profissional, sem exagero.
CTAS = [
    dict(tag='Oferta da semana', h='Seu negócio com cara de empresa grande — por preço de freelance.',
         p='Fanpage ou site completo no ar em dias, não meses. Orçamento grátis em 30 segundos.',
         b='Quero meu orçamento grátis', wa='Quero um site com cara de empresa grande.'),
    dict(tag='Para quem vende no WhatsApp', h='Cliente clicou, cliente chamou: fanpage que vira conversa.',
         p='Página direta e persuasiva para campanha, lançamento ou tráfego pago. Peça a sua hoje.',
         b='Quero uma fanpage que converte', wa='Quero uma fanpage que converte.'),
    dict(tag='Credibilidade imediata', h='Site feio espanta cliente. Site profissional atrai.',
         p='Sites institucionais que passam confiança e geram contato no automático.',
         b='Melhorar meu site agora', wa='Quero um site institucional profissional.'),
    dict(tag='Apareça no Google', h='Se o Google não te acha, o cliente acha o concorrente.',
         p='Sites otimizados com SEO e performance desde a primeira linha de código.',
         b='Quero ser encontrado', wa='Quero um site otimizado para o Google.'),
    dict(tag='Mobile em primeiro lugar', h='80% dos seus clientes estão no celular. Seu site está pronto?',
         p='Layouts 100% responsivos: perfeitos no celular, tablet e computador.',
         b='Quero um site mobile perfeito', wa='Quero um site perfeito no celular.'),
    dict(tag='Orçamento em 30 segundos', h='Sem reunião chata, sem enrolação: monte seu orçamento sozinho.',
         p='Página de orçamento interativa com preço fechado, prazo e escopo claro.',
         b='Montar meu orçamento', wa='Vim pelo site e quero um orçamento.'),
    dict(tag='Lançamento e eventos', h='Festa, curso ou promoção? Landing 3D que vende o evento sozinha.',
         p='Páginas de evento imersivas com confirmação e compartilhamento em 1 clique.',
         b='Quero uma landing de evento', wa='Quero uma landing para meu evento.'),
    dict(tag='Negócio local', h='Quem busca "perto de mim" precisa te achar — e se encantar.',
         p='Sites locais com Maps, WhatsApp e avaliações integrados para gerar visitas.',
         b='Atrair clientes da região', wa='Quero um site para meu negócio local.'),
    dict(tag='Portfólio que fecha negócio', h='Mostre seu trabalho como ele merece — em 3D interativo.',
         p='Portfólios e vitrines que impressionam recrutadores e clientes na primeira tela.',
         b='Quero um portfólio assim', wa='Quero um portfólio como esse.'),
    dict(tag='Manutenção e reforma', h='Site antigo derruba suas vendas todo dia. Modernize.',
         p='Atualizo sites ultrapassados e cuido da manutenção para você focar em vender.',
         b='Modernizar meu site', wa='Quero modernizar meu site antigo.'),
    dict(tag='Velocidade vende', h='Cada segundo de lentidão custa clientes. Site rápido converte mais.',
         p='Código limpo e otimizado: carregamento veloz e nota alta no PageSpeed.',
         b='Quero um site veloz', wa='Quero um site rápido e otimizado.'),
    dict(tag='Do layout ao ar', h='Uma pessoa só do design à entrega: sem ruído, sem atraso.',
         p='Processo em 5 etapas — descoberta, escopo, design, código e entrega publicada.',
         b='Começar meu projeto', wa='Quero começar meu projeto de site.'),
    dict(tag='Prova real', h='Não acredite em promessa: veja 15 projetos publicados e funcionando.',
         p='Cada projeto do portfólio está no ar, clicável e com o código no GitHub.',
         b='Ver os projetos', wa='Vi seu portfólio e quero um projeto.'),
    dict(tag='Vaga de freelance aberta', h='Agenda aberta para novos projetos este mês. Garanta a sua.',
         p='Poucas vagas por mês para manter a qualidade. Chame agora e receba proposta fechada.',
         b='Garantir minha vaga', wa='Quero garantir uma vaga de projeto este mês.'),
]

START = '<!-- CTA-DIARIA-START -->'
END = '<!-- CTA-DIARIA-END -->'


def cta_de_hoje(hoje=None):
    hoje = hoje or datetime.date.today()
    return CTAS[hoje.toordinal() % len(CTAS)], hoje


def bloco_html(cta):
    from urllib.parse import quote
    link = WA + '?text=' + quote('Olá! ' + cta['wa'])
    return (
        START + '\n'
        '        <section class="cta-diaria reveal in">\n'
        '            <div class="cta-diaria-inner">\n'
        f'                <span class="eyebrow">{cta["tag"]}</span>\n'
        f'                <h2>{cta["h"]}</h2>\n'
        f'                <p>{cta["p"]}</p>\n'
        f'                <a href="{link}" target="_blank" class="btn-light">{cta["b"]} <i class="fa-solid fa-arrow-right"></i></a>\n'
        '            </div>\n'
        '        </section>\n'
        '        ' + END
    )


def gira_cta():
    cta, hoje = cta_de_hoje()
    index = ROOT / 'index.html'
    html = index.read_text(encoding='utf-8')
    novo = re.sub(START + r'.*?' + END, lambda _: bloco_html(cta),
                  html, count=1, flags=re.DOTALL)
    if novo != html:
        index.write_text(novo, encoding='utf-8')
        print('CTA atualizada:', cta['tag'], '-', cta['h'][:50])
        mudou = True
    else:
        print('CTA ja atual (sem mudanca)')
        mudou = False
    md = ROOT / 'cta-do-dia.md'
    md.write_text(
        '# CTA do dia — %s\n\n**%s**\n\n## %s\n\n%s\n\n**Botão:** %s\n\nPoste no Status/Stories/TikTok:\n\n> %s\n> %s\n> Chame no WhatsApp: https://wa.me/5511989426415\n'
        % (hoje.isoformat(), cta['tag'], cta['h'], cta['p'], cta['b'], cta['h'], cta['p']),
        encoding='utf-8')
    print('cta-do-dia.md atualizado')
    return mudou


def avisa_buscadores():
    sm = urllib.request.urlopen(BASE + '/sitemap.xml', timeout=30).read().decode('utf-8')
    urls = re.findall(r'<loc>([^<]+)</loc>', sm)
    payload = json.dumps({
        'host': 'rickdigitalestudio.github.io',
        'key': KEY,
        'keyLocation': KEY_URL,
        'urlList': urls,
    }).encode('utf-8')
    req = urllib.request.Request('https://api.indexnow.org/IndexNow', data=payload,
                                 headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        r = urllib.request.urlopen(req, timeout=30)
        print('IndexNow (Bing/Yahoo/DuckDuckGo):', r.status, '-', len(urls), 'URLs')
    except urllib.error.HTTPError as e:
        print('IndexNow status:', e.code)
    print('Google: sem API gratuita — envie o sitemap no Search Console (guia em SEO-GRATUITO.md)')


if __name__ == '__main__':
    args = set(sys.argv[1:])
    if '--indexnow-only' in args:
        avisa_buscadores()
    elif '--cta-only' in args:
        gira_cta()
    else:
        avisa_buscadores()
        gira_cta()
