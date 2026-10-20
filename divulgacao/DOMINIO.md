# Domínio próprio — resultado da busca e passo a passo

> Um domínio vale mais do que 100 backlinks. `rickdigital.com.br` diz o nome da
> sua marca na barra do navegador, funciona offline no cartão de visita e
> ajuda o Google a entender que o site é o seu.

---

## 1. O que está disponível (consultado no registro.br / RDAP)

| Domínio | Status | Observação |
|---|---|---|
| **rickdigital.com.br** | ✅ **LIVRE** | **Recomendado** — nome da marca + `.com.br`, o TLD mais forte do Brasil |
| estudiorickdigital.com.br | ✅ LIVRE | Mais fiel ao nome completo, porém mais longo |
| estudiorickdigital.com | ✅ LIVRE | Alternativa `.com` |
| rickdutradigital.com.br | ✅ LIVRE | Usa seu nome completo |
| rickdutra.com.br | ✅ LIVRE | Curto, mas não é a marca |
| henriqueluizdutra.com.br | ✅ LIVRE | Longo demais para digitar |

**Já são ocupados** (não dá para pegar): `rickdigital.com` (em uso por uma
empresa de Sydney, domínio diferente do seu), `rickdigital.net`, `ricklima.com`,
`ricklima.com.br`.

---

## 2. Recomendação

**Compre `rickdigital.com.br`.**

Alternativas se não conseguir registrar:
1. `estudiorickdigital.com.br`
2. `rickdutradigital.com.br`

Evite `rickdigital.com` — está ocupado por terceiros e pode ser um squats
esperando para revenda.

---

## 3. Quanto custa

O `.com.br` tem faixa de preço fixa no registro.br e costuma sair mais barato
que `.com` no primeiro ano.

| Item | Custo aproximado |
|---|---|
| Registro `.com.br` (1º ano) | ~R$ 40 (promoção do registro.br) |
| Renovação anual | ~R$ 40–60 |
| Hospedagem (GitHub Pages) | **R$ 0** — o site já está hospedado lá |
| HTTPS (certificado) | **R$ 0** — o GitHub Pages já emite automaticamente |

**Total real: ~R$ 40 no primeiro ano, e R$ 0 de hospedagem.**

Alternativas de registrador: `registro.br` (o oficial, sem markup), `Cloudflare
Registrar` (preço de custo, sem markup, mas você paga direto no servidor
estrangeiro), `Hostinger`/`Locaweb`/`Namecheap` (interface mais fácil, um
pouco mais caro).

---

## 4. Onde comprar (2 minutos)

1. Acesse `https://www.registro.br`
2. **Domain search** → digite `rickdigital.com.br`
3. Se aparecer "disponível", clique no carrinho
4. Crie a conta (CPF/CNPJ + e-mail) e pague
5. Em **Painel → domínios**, o domínio fica listando

> **Cadastro no registro.br exige CPF/CNPJ.** Se você tem MEI ou CNPJ, use o
> CNPJ — fica mais profissional e permite emitir nota. Se a compra na
> recuperação de domínio ficar cara, um CNPJ simples (MEI) resolve.

---

## 5. O que eu configuro depois que você comprar

Me avise com o domínio registrado que eu cuido de **tudo** abaixo:

### 5.1 Registros DNS (no painel do registrador)

```
tipo   host   valor                    TTL
A      @      185.199.108.153          3600
CNAME  www    rickdigitalestudio.github.io  3600
```

### 5.2 No repositório (`profissional-rickdutra`)

Criar o arquivo `CNAME` na raiz com uma linha:

```
rickdigital.com.br
```

E em **Settings → Pages → Custom domain**, informar `rickdigital.com.br` e
marcar **"Enforce HTTPS"**.

### 5.3 Redirecionar o endereço antigo (importante)

Quem já tem o link `rickdigitalestudio.github.io/profissional-rickdutra`
precisa ser levado para o novo endereço, senão perde posição:

No repositório `rickdigitalestudio.github.io`, criar `profissional-rickdutra/index.html`
com redirect 301:

```html
<meta http-equiv="refresh" content="0; url=https://rickdigital.com.br/">
<script>location.replace("https://rickdigital.com.br/" + location.pathname.replace(/^\/profissional-rickdutra/, "") + location.search);</script>
```

### 5.4 Atualizar o código (eu faço)

Todos os arquivos passam de `rickdigitalestudio.github.io/profissional-rickdutra`
para `rickdigital.com.br` em: `canonical`, `og:url`, JSON-LD (`url`,
`provider.url`, `image`), `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
e nos links internos do site.

### 5.5 Google

1. No Search Console, adicionar a propriedade do tipo **Domínio** (verifica por
   DNS — eu te passo o registro TXT para colar)
2. Reenviar o `sitemap.xml` com a nova URL
3. No Google Business Profile, trocar a URL do site
4. No Bing Webmaster, adicionar o novo domínio

---

## 6. E-mail no seu domínio (opcional, ~R$ 0 com免费的 serviço)

Com o domínio registrado você pode criar `rick@rickdigital.com.br`:
- **Zoho Mail gratuito** — até 5 usuários, domínio próprio, 100% grátis
- **Google Workspace** — pago, ~R$ 20/usuário/mês, mais completo
- **Forwarding do registro.br** — encaminha `rick@` para o seu Gmail, grátis e
  imediato (não tem caixa de entrada própria, mas resolve)

**Comece com o forwarding**: é grátis e leva 5 minutos.

---

## 7. E-mail profissional tem efeito comercial comprovado

Pesquisas de mercado (incluindo o brasileiro) mostram que e-mail de
domínio próprio aumenta a taxa de resposta em campanhas B2B, porque
`rickdigital@gmail.com` passa impressão de amador e `contato@rickdigital.com.br`
passa impressão de empresa.

Para um prestador de serviço local vendendo site e fanpage, isso vale direto:
o lead chega no WhatsApp, vê `estudiorickdigital@gmail.com` no e-mail e já
percebe que é alguém "de verdade" ou amador.

---

## 8. Checklist

- [ ] Comprar `rickdigital.com.br` no registro.br
- [ ] Me avisar que comprou (eu configuro DNS, CNAME, redirects e código)
- [ ] Verificar o domínio no Search Console (tipo Domínio)
- [ ] Reenviar o sitemap com a nova URL
- [ ] Atualizar a URL no Google Business Profile
- [ ] Criar `rick@rickdigital.com.br` (forwarding do registro.br = grátis)
- [ ] Trocar o e-mail em todas as redes e no site
- [ ] Atualizar o cartão de visita e o Status do WhatsApp
