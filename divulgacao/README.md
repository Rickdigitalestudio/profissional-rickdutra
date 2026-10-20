# Kit de Divulgação — Estúdio Rick Digital

> Tudo o que precisa para o seu site aparecer no Google e nas redes sociais,
> **sem gastar nada**. Os textos estão prontos para copiar e colar.

## Comece por aqui (ordem que funciona)

| # | O quê | Onde | Custo | Tempo |
|---|---|---|---|---|
| 1 | **Verificar no Google Search Console** | `COMO-ATIVAR-GOOGLE.md` passo 1 | R$ 0 | 10 min |
| 2 | **Criar o perfil no Google Maps** | `GOOGLE-BUSINESS-PROFILE.md` | R$ 0 | 30 min |
| 3 | **Criar o perfil no Instagram + TikTok** | `BIAS-E-CONTEUDO-REDE-SOCIAIS.md` | R$ 0 | 20 min |
| 4 | **Montar o catálogo do WhatsApp Business** | `BIAS-E-CONTEUDO-REDE-SOCIAIS.md` seção 6 | R$ 0 | 15 min |
| 5 | **Publicar o calendário de 30 dias** | `CALENDARIO-30-DIAS.md` | R$ 0 | 10 min/dia |
| 6 | **Pegar o domínio `rickdigital.com.br`** | `DOMINIO.md` | ~R$ 40/ano | 10 min |
| 7 | **Ativar o Google Ads** | `GOOGLE-ADS-ESTRUTURA.md` | R$ 5+/dia | 15 min |

**Só faça o passo 7 (Google Ads) depois dos passos 1 a 6.** Anunciar antes de
ter o site indexado, o Maps ativo e o perfil social com prova social é jogar
dinheiro fora.

## Os arquivos

| Arquivo | O que tem |
|---|---|
| `COMO-ATIVAR-GOOGLE.md` | Passo a passo de Search Console, GA4, Bing, AdSense e domínio |
| `GOOGLE-BUSINESS-PROFILE.md` | Ficha do Maps completa: descrição, 8 serviços, 5 fotos, 5 posts, 6 perguntas, roteiro de avaliação |
| `BIAS-E-CONTEUDO-REDE-SOCIAIS.md` | Bio, destaques, posts fixados e catálogo de WhatsApp Business das 5 redes |
| `CALENDARIO-30-DIAS.md` | 30 posts prontos, 6 legendas prontas, 4 roteiros de vídeo e como gerar as artes |
| `GOOGLE-ADS-ESTRUTURA.md` | 4 campanhas, 25 palavras-chave, negativas, 51 títulos de anúncio, 16 descrições, extensões e plano de orçamento |
| `DOMINIO.md` | Resultado da busca de disponibilidade + passo a passo de configuração |

## Os números do seu site agora

```
22 páginas no ar          (6 delas são páginas de serviço por palavra-chave)
23 URLs no sitemap.xml    gerado por automacao/gerar_sitemap.py
6 páginas com JSON-LD     Service + FAQPage + BreadcrumbList
Lighthouse                SEO 100 · Acessibilidade 100 · Best Practices 100
Imagem social 1200x630    img/og-estudio-rick-digital.png
```

## As 6 páginas que vão aparecer no Google

| URL | Palavra-chave que ela ataca |
|---|---|
| `criacao-de-sites-profissionais.html` | criação de sites profissionais |
| `fanpage-que-vende.html` | fanpage que vende |
| `criacao-de-logo-profissional.html` | criação de logo profissional |
| `site-para-pequenas-empresas.html` | site para pequenas empresas |
| `otimizacao-de-perfil-linkedin.html` | otimização de perfil no LinkedIn |
| `trabalho-academico-abnt.html` | formatação de trabalho acadêmico ABNT |

**Importante:** para o Google indexar essas páginas, abra o Search Console →
**Inspecionar URL** → cole a URL → **Solicitar indexação**. Repita nas 6.

## Regra de ouro

> **Post sem link e sem CTA é post jogado fora.**
> Cada post precisa levar a uma de três coisas: o portfólio, o formulário de
> orçamento ou o WhatsApp. E toda entrega precisa virar avaliação no Google.

## Editar o conteúdo sem mexer no código

Os textos das 6 páginas de serviço ficam em `automacao/conteudo/*.json`.
Para mudar um texto:

```bash
python automacao/acentuar_servicos.py        # normaliza a acentuação
python automacao/gerar_paginas_servico.py     # regera os .html
python automacao/gerar_sitemap.py             # atualiza o sitemap
git add -A && git commit -m "conteudo" && git push
```

Para aplicar os IDs do Google (Search Console, Bing, GA4, AdSense) em todas
as páginas de uma vez:

```bash
python automacao/aplicar_ids_google.py --verificar
python automacao/aplicar_ids_google.py --gsc CODIGO --ga4 G-XXXXXXXXXX
```
