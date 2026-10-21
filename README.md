# 🚀 Estúdio Rick Digital — Portfólio Profissional

Portfólio de **Henrique Luiz Dutra**, web designer e desenvolvedor front-end.
Site estático (HTML + CSS + JavaScript puro), hospedado no GitHub Pages.

🔗 **Site no ar:** <https://rickdigitalestudio.github.io/profissional-rickdutra/>

---

## 📁 O que tem aqui

| Pasta/arquivo | Para que serve |
|---|---|
| `index.html` | Home: hero, prova social, resultados, cases, FAQ e CTA |
| `projetos.html` | Todos os 15 projetos, com filtro por tipo |
| `cases.html` + `case-*.html` | Case studies (problema → solução → resultado) |
| `sobre.html` | Perfil, formação e números |
| `servicos-adicionais.html` | Serviços complementares |
| `*-profissionais.html`, `fanpage-*.html`… | Páginas de serviço por palavra-chave (SEO) |
| `orcamento.html` | Montador de orçamento em 30s |
| `privacidade.html` | Política de Privacidade e Cookies (LGPD) |
| `termos.html` | Termos de Serviço |
| `midia.html` | Kit de mídia |
| `404.html` | Página de erro personalizada |
| `cv-henrique-dutra.pdf` | Currículo pronto para enviar a clientes |
| `css/`, `js/`, `img/` | Estilos, scripts e imagens |
| `automacao/` | Scripts Python que geram e checam o site |

---

## ⚙️ Comandos úteis

```powershell
# servidor local (porta 8899)
python automacao\servidor-local.py

# QA: links quebrados, numeros que nao batem, placeholders, imagens
python automacao\checar_site.py

# gera as paginas de case (a partir de automacao/conteudo/cases/*.json)
python automacao\gerar_cases.py

# injeta os blocos de prova social na home (a partir de prova-social.json)
python automacao\gerar_prova_social.py

# gera as paginas de servico (a partir de automacao/conteudo/*.json)
python automacao\gerar_paginas_servico.py

# gera o sitemap.xml
python automacao\gerar_sitemap.py

# otimiza as imagens para WebP (-90% de peso)
python automacao\otimizar_imagens.py

# aplica <picture> + width/height + lazy nas <img> das paginas
python automacao\otimizar_html.py

# gera o PDF do curriculo (usa o Chrome headless)
python automacao\gerar_cv_pdf.py

# migra tudo para o dominio proprio
python automacao\migrar_dominio.py https://rickdigital.com.br
```

> ⚠️ Depois de editar `automacao/conteudo/*.json`, rode o gerador
> correspondente — as páginas `.html` são geradas a partir deles.

---

## 📊 Estado atual (medição real)

| Métrica | Antes | Depois |
|---|---|---|
| Peso total da home | 1.114 KB | **372 KB** (−67%) |
| Peso só de imagens | 923 KB | **88 KB** (−90%) |
| First Contentful Paint | 1.944 ms | **932 ms** (−52%) |
| Lighthouse Acessibilidade | — | **100** |
| Lighthouse Best Practices | — | **100** |
| Lighthouse SEO | — | **100** |

---

## 🔐 O que ainda depende de você

1. **Depoimentos reais** — `automacao/conteudo/prova-social.json`
   (guia: `divulgacao/COMO-PREENCHER-PROVA-SOCIAL.md`).
2. **Códigos de verificação** — Google Search Console e Bing
   (ver `divulgacao/COMO-ATIVAR-GOOGLE.md`).
3. **ID do GA4** — trocar `G-H6CS8VRB52` pelo seu (ou confirmar que é seu).
4. **Domínio próprio** — `rickdigital.com.br` (guia: `divulgacao/DOMINIO.md`).
5. **Perfil do Google Business** — para gerar as avaliações.

---

© 2026 Estúdio Rick Digital — Henrique Luiz Dutra. Todos os direitos reservados.
