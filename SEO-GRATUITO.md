# 📈 Estúdio Rick Digital no Google — 100% grátis

> **Atualizado em outubro de 2026.** O código já está 100% pronto. O que falta
> é **você fazer login na sua conta do Google** — são ~30 minutos, uma vez só.
>
> Guia completo e passo a passo: **`divulgacao/COMO-ATIVAR-GOOGLE.md`**

## O que já está feito no código (não precisa mexer em nada)

| Item | Onde |
|---|---|
| 6 páginas por palavra-chave (alvo de busca) | `criacao-de-sites-profissionais.html` e mais 5 |
| Title + description otimizados por página | todas as 22 páginas |
| Open Graph + Twitter Card com imagem 1200×630 | todas as páginas |
| Dados estruturados (Service, FAQPage, BreadcrumbList) | 6 páginas de serviço |
| `sitemap.xml` com 23 URLs | gerado por `automacao/gerar_sitemap.py` |
| `robots.txt` apontando para o sitemap | `robots.txt` |
| Links internos entre home, hub de serviços e páginas | `index.html`, `servicos-adicionais.html` |
| Imagem social profissional | `img/og-estudio-rick-digital.png` |
| Lighthouse | SEO 100 · Acessibilidade 100 · Best Practices 100 |
| Tags de verificação do Search Console e Bing | prontas para preencher em todas as páginas |
| GA4 | script pronto em todas as páginas (falta trocar `G-SEU-ID`) |

## Os 7 passos (na ordem)

| # | Passo | Custo | Link |
|---|---|---|---|
| 1 | **Google Search Console** — peça a indexação | R$ 0 | `divulgacao/COMO-ATIVAR-GOOGLE.md` passo 1 |
| 2 | **Google Analytics 4** — medir o que funciona | R$ 0 | idem, passo 2 |
| 3 | **Perfil da Empresa no Google (Maps)** — leads locais | R$ 0 | `divulgacao/GOOGLE-BUSINESS-PROFILE.md` |
| 4 | **Bing Webmaster** — Bing + Yahoo + DuckDuckGo | R$ 0 | idem, passo 4 |
| 5 | **Domínio `rickdigital.com.br`** — credibilidade | ~R$ 40/ano | `divulgacao/DOMINIO.md` |
| 6 | **Google AdSense** — render com o tráfego | R$ 0 | idem, passo 5 |
| 7 | **Google Ads** — anúncio pago | R$ 5+/dia | `divulgacao/GOOGLE-ADS-ESTRUTURA.md` |

> ⚠️ O passo 7 **não é de graça**. O Google Ads cobra por clique e não existe
> versão gratuita. A estrutura completa está pronta — só falta colocar o cartão.
> E só ative **depois** dos passos 1 a 6, senão você paga clique para uma
> página que ainda não converte.

## Para as redes sociais (também grátis)

| Canal | Ganho | Kit pronto |
|---|---|---|
| WhatsApp Business | onde o cliente fecha | `divulgacao/BIAS-E-CONTEUDO-REDE-SOCIAIS.md` seção 6 |
| TikTok | maior alcance orgânico | seção 2 + `divulgacao/CALENDARIO-30-DIAS.md` |
| Instagram | vitrine do trabalho | seção 1 |
| Facebook | público que o Maps puxa | seção 3 |
| LinkedIn | B2B, quem contrata | seção 4 |
| YouTube | prova de resultado | seção 5 |

O Status do WhatsApp já está automatizado no projeto `whatsapp-atendente`
(14 slots semanais). O calendário de 30 dias tem os textos prontos de cada um.

## Manutenção (0 custo)

- **Semana 1 de cada mês:** poste 1 página nova (estudo de caso de um projeto)
  e peça a indexação no Search Console
- **A cada entrega:** peça avaliação no Google (roteiro em
  `GOOGLE-BUSINESS-PROFILE.md` seção 7)
- **Toda semana:** poste 1 conteúdo do calendário (TikTok + Instagram + Facebook)
- **Todo dia:** responda os comentários — o algoritmo paga quem conversa
- **Todo mês:** revise as 3 páginas com menos cliques no Search Console e troque
  o title/description

## Como editar o conteúdo das páginas de serviço

```bash
python automacao/acentuar_servicos.py        # normaliza acentuação
python automacao/gerar_paginas_servico.py     # regera os .html
python automacao/gerar_sitemap.py             # atualiza o sitemap
git add -A && git commit -m "conteudo" && git push
```

Os textos ficam em `automacao/conteudo/*.json` — você edita o JSON, não o HTML.
