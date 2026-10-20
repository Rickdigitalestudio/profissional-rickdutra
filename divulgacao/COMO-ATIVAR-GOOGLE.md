# Como ativar o Google (tudo que precisa do seu login) — passo a passo

> Tempo total: **~30 minutos**, uma vez só. Tudo o resto do trabalho já está
> feito no código: as tags existem nos arquivos, o sitemap está pronto, as
> páginas por palavra-chave estão publicadas.
>
> O único passo que **exige você** é entrar na sua conta do Google. Eu não tenho
> e não vou pedir sua senha.

---

## Passo 1 · Google Search Console (faça PRIMEIRO — é o que faz aparecer no Google)

**Por que primeiro:** o Search Console é o que avisa o Google que seu site
existe e passa a indexar. Sem ele, nada do resto importa.

1. Abra `https://search.google.com/search-console/welcome`
2. Faça login com sua conta do Google (a mesma do Gmail do negócio).
3. Clique em **"Adicionar propriedade"** → escolha o tipo:
   - **Prefixo de URL** → cole `https://rickdigitalestudio.github.io/profissional-rickdutra/`
   - Ou **Domínio** → `rickdigital.com.br` (quando você comprar o domínio)
4. Na verificação, escolha o método **"Tag HTML"**:
   - O Google te dá um código tipo
     `<meta name="google-site-verification" content="ABCD1234...">`
   - **Cole esse código no lugar da tag `COLE_SEU_CODIGO_SEARCH_CONSOLE_AQUI`**
     que já existe no `index.html` (e nas páginas de serviço)
5. Me mande o código (é público, não é senha) — eu colo, commito e publico em
   2 minutos. Ou, se preferir fazer você mesmo, troque a string e rode:
   ```
   git add index.html && git commit -m "chore: tag de verificacao do Search Console" && git push
   ```
6. A propriedade aparece como **"Verificada"**.
7. Vá em **Sitemaps** → cole `sitemap.xml` → **Enviar**.
8. Vá em **Inspecionar URL** → cole a URL da home → **Solicitar indexação**.

**Prazo:** indexação começa em 1 a 3 dias. Aparecer no Google, de 3 a 15 dias.

> **Dica:** repita o passo 8 para as 6 páginas novas de serviço — é o que faz
> elas aparecerem antes. As páginas de serviço estão em `criacao-de-sites-profissionais.html`,
> `fanpage-que-vende.html`, `criacao-de-logo-profissional.html`,
> `site-para-pequenas-empresas.html`, `otimizacao-de-perfil-linkedin.html` e
> `trabalho-academico-abnt.html`.

---

## Passo 2 · Google Analytics 4 (saber o que está funcionando)

1. Abra `https://analytics.google.com/analytics/web/`
2. Login → **Começar** → em "Como você quer começar?", escolha **Web**.
3. Nome da conta: `Estúdio Rick Digital` · Nome da propriedade: `Portfolio`
4. URL do site: `https://rickdigitalestudio.github.io/profissional-rickdutra/`
5. Ele gera um **ID de medición** com cara de `G-XXXXXXXXXX`.
6. **Me mande esse ID** (é público) — eu troco o `G-SEU-ID` em todas as páginas
   e publico. Ou troque você mesmo com:
   ```
   # roda em automacao/ (ajuste a variavel e rode)
   python automacao/aplicar_ids_google.py G-XXXXXXXXXX
   ```
   (se o script não existir ainda, me chame que eu crio)
7. Depois de ativar, em **Administração → Coleta e personalização → Sinais de
   depuração**, abra a página e confirme que aparece "1 sessão ativa".

**O que você passa a ver:** de onde veio o visitante (TikTok, Google, direto),
qual página gera clique no WhatsApp, quantos pedidos de orçamento entraram.

---

## Passo 3 · Google Business Profile (o Maps — melhor retorno para serviço local)

Guia completo pronto em: **`GOOGLE-BUSINESS-PROFILE.md`**
(link, descrição, 8 serviços, 5 fotos, 5 posts, 6 perguntas, roteiro de avaliação)

Resumo: `https://business.google.com` → criar perfil sem endereço físico
(tipo "área de serviço") → categoria principal **Web designer** → colar o texto
de descrição e os serviços → subir as fotos → pedir o código de verificação.

---

## Passo 4 · Bing Webmaster (Bing + Yahoo + DuckDuckGo, de graça, 5 minutos)

1. Abra `https://www.bing.com/webmasters`
2. **Importar do Google Search Console** → clique no ícone do Search Console →
   selecione a propriedade → importar. Em 5 minutos seus sites aparecem no
   Bing, no Yahoo e no DuckDuckGo.
3. Se preferir verificação manual, cole a tag `COLE_SEU_CODIGO_BING_AQUI`
   (já existe no `index.html`).

---

## Passo 5 · Google AdSense (ganhar dinheiro com o tráfego orgânico)

Só depois que o site tiver visitas (mínimo ~100 visitas/mês).

1. `https://www.google.com/adsense` → cadastre a URL do site
2. Ele pede para colar um código `<script>` — **ele já está comentado** no
   `<head>` de todas as páginas do portfólio. Me mande o `ca-pub-XXXXXXXX`
   que eu descomento e ativo.
3. Regras do Google para aprovar: site com conteúdo original, navegação clara
   e sem banner enganoso. As 6 páginas de serviço já ajudam nisso.

---

## Passo 6 · Google Ads (anúncio pago — só quando você decidir gastar)

Estrutura completa, palavras-chave, anúncios e extensões prontos em:
**`GOOGLE-ADS-ESTRUTURA.md`**

Resumo do que falta: `ads.google.com` → criar conta → colocar o cartão →
colar a estrutura que já está pronta → publicar.

---

## Passo 7 · Domínio próprio (o passo que mais muda o jogo)

`rickdigital.com.br` está **livre** no registro.br. Custa pouco no primeiro ano.

**Por que vale tanto:**
- `rickdigitalestudio.github.io/profissional-rickdutra` é longo e diz "GitHub",
  não "Rick Digital" — o Google e o cliente confiam menos
- O nome no navegador (`rickdigital.com.br`) vale mais que 100 backlinks
- No cartão de visita e no Status do WhatsApp fica curto e memorável
- Permite o e-mail no seu domínio (`rick@rickdigital.com.br`)

**Configuração que eu faço depois que você comprar** (me avise):
1. Criar os registros DNS no painel do registrador:
   ```
   A     @        185.199.108.153
   A     www      185.199.108.153
   CNAME www      rickdigitalestudio.github.io
   ```
2. Publicar um arquivo `CNAME` na raiz do repositório com o domínio e ativar
   "Enforce HTTPS" nas configurações do GitHub Pages
3. Redirecionar o endereço antigo para o novo (301), para não perder posição
4. Atualizar `canonical`, `og:url`, `sitemap.xml` e o JSON-LD para o domínio novo
5. Verificar o domínio no Search Console (tipo "Domínio", via DNS)
6. Reenviar o sitemap no novo endereço

---

## Checklist final

- [ ] Search Console: propriedade verificada
- [ ] Search Console: `sitemap.xml` enviado
- [ ] Search Console: indexação solicitada nas 6 páginas de serviço
- [x] GA4: ID `G-H6CS8VRB52` aplicado no código — **ATIVADO**
- [ ] Google Business Profile criado e verificado
- [ ] Bing Webmaster importado do Search Console
- [ ] Domínio `rickdigital.com.br` comprado e apontado
- [ ] 5 avaliações no Google pedidas a clientes antigos
- [ ] AdSense aplicado (depois de 100 visitas/mês)
- [ ] Google Ads ativado (quando decidir investir)

---

## O que já está pronto e não depende de você

| Item | Onde |
|---|---|
| 6 páginas por palavra-chave | `criacao-de-sites-profissionais.html` e mais 5 |
| Imagem social 1200×630 | `img/og-estudio-rick-digital.png` |
| Sitemap com 23 URLs | `sitemap.xml` (gerado por `automacao/gerar_sitemap.py`) |
| Tags Open Graph + Twitter em todas as páginas | todas as páginas `.html` |
| Dados estruturados (Service + FAQPage + BreadcrumbList) | 6 páginas de serviço |
| Texto do perfil do Google Maps | `GOOGLE-BUSINESS-PROFILE.md` |
| Bios das 5 redes | `BIAS-E-CONTEUDO-REDE-SOCIAIS.md` |
| 30 dias de conteúdo + roteiros de vídeo | `CALENDARIO-30-DIAS.md` |
| Estrutura de Google Ads | `GOOGLE-ADS-ESTRUTURA.md` |
| Links internos (hub de serviços) | `index.html` e `servicos-adicionais.html` |
| Robô do site | `robots.txt` (aponta para o sitemap) |
