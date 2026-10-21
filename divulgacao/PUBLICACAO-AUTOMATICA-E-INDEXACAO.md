# Publicação automática e indexação gratuita

> Como o seu site aparece nos buscadores e como os posts saem sozinhos,
> sem depender de plugin pago e sem gastar.

---

## 1. O que já está automatizado (ligou e funciona)

| O quê | Como | Quando |
|---|---|---|
| **IndexNow** — Bing, Yandex, Naver, Qwant indexam em minutos | `automacao/indexar.py` via GitHub Actions | a cada push + 2x/dia (05h e 17h BRT) |
| **Publicação social** — WhatsApp Status + Facebook + Instagram | `automacao/publicar_social.py` via GitHub Actions | 08h00 e 19h30 (BRT), todo dia |
| **Fila de conteúdo** — 14 slots semanais prontos | `automacao/conteudo/social/post.json` | você edita o JSON |
| **Feeds RSS/Atom** — para newsletters e automações | `feed.xml` e `social-feed.xml` | a cada mudança |
| **Sitemap** — sempre atualizado | `automacao/gerar_sitemap.py` | a cada mudança |

---

## 2. IndexNow — indexação instantânea e 100% grátis

**O que é:** um protocolo aberto (Microsoft/Bing) que avisa os buscadores
"essa página mudou, pode reindexar". Sem ele, o robô do Google passa de
2 em 2 semanas. Com ele, é questão de minutos.

**Já está no ar.** A chave é `14d081f6b42c4be395d649e1292ade6b` e o arquivo
de validação está na raiz do site. O workflow `.github/workflows/indexar.yml`
dispara sozinho a cada push.

**Rodar na mão:**
```bash
python automacao/indexar.py
python automacao/indexar.py --urls "https://.../index.html,https://.../orcamento.html"
```

> ⚠️ **O Google não participa do IndexNow.** Para o Google, o caminho é o
> Search Console (passo 1 do `COMO-ATIVAR-GOOGLE.md`). O IndexNow cuida do
> Bing/Yandex/Naver/Qwant/Seznam — que, no Brasil, ainda trazem bastante
> tráfego e são onda de 검색 que o Google não monopoliza.

---

## 3. Publicação automática nas redes

### O que é possível automatizar de verdade, de graça

| Rede | Automatiza? | Como |
|---|---|---|
| **WhatsApp Status** | ✅ **Sim** | Evolution API (a que você já tem rodando) |
| **Facebook (Fanpage)** | ✅ **Sim** | Graph API — 1 token, sem aprovação |
| **Instagram (Business)** | ✅ **Sim** | Graph API — mesma conta, precisa ser conta Business |
| **YouTube** | ⚠️ Parcial | Data API precisa de OAuth com sua conta Google (você já tem login) |
| **LinkedIn** | ❌ | API exige registro de app (demora 1-2 dias de revisão) |
| **TikTok** | ❌ | Content Posting API exige aprovação manual do app (dias) |

**Por que TikTok e LinkedIn ficam de fora:** as duas APIs exigem aprovação
humana do app. Não é Impossible — é burocracia. Como o TikTok já tem o
alcance orgânico mais alto, publicar lá manualmente em 5 minutos por dia
(render 15s) **rende mais do que brigar com a API**.

### Configurar (10 minutos, uma vez só)

#### 3.1 Token do Facebook + Instagram (Graph API)

1. Abra `https://developers.facebook.com` → **Meus aplicativos** → **Criar aplicativo**
2. Tipo **Outros** → **Empresa** (o Business é o que permite postar em Fanpage)
3. No painel do app: **Configurações → Básico** → em "Domínios do app" adicione
   `rickdigitalestudio.github.io`
4. Em **Facebook Login → Configurações**, ative:
   - `client_oauth_token` (sim)
   - `pages_manage_posts` (sim)
   - `pages_read_engagement` (sim)
   - `instagram_basic` (sim)
   - `instagram_content_publish` (sim)
5. Em **Configurações do app → Básico**, clique em **Gerar token de acesso**
   (o botão só aparece depois de adicionar o produto "Facebook Login")
6. Copie o token e guarde

**Para o Instagram:** a conta precisa ser **Business** ou **Creator**
(Configurações → Conta → Alternar para conta profissional) e estar **vinculada
a uma Fanpage**. Sem isso a API não publica.

#### 3.2 Descobrir os IDs

```bash
# Fanpage (troque pelo token)
curl -s "https://graph.facebook.com/v21.0/me/accounts?access_token=SEU_TOKEN"

# Instagram Business (id da conta IG)
curl -s "https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=SEU_TOKEN"
```

#### 3.3 Gravar os segredos no GitHub

`Settings → Secrets and variables → Actions → New repository secret`:

| Nome do segredo | Valor |
|---|---|
| `FB_ACCESS_TOKEN` | o token do passo 3.1 |
| `FB_PAGE_ID` | o id da Fanpage |
| `IG_USER_ID` | o id do Instagram Business |
| `EVOLUTION_APIKEY` | a chave da sua Evolution API (a mesma do `whatsapp-atendente`) |
| `EVOLUTION_URL` | `http://localhost:8080` (só funciona se a Evolution estiver no mesmo runner) |

> ⚠️ **Limite do WhatsApp:** a Evolution API roda na **sua máquina** (Docker).
> O GitHub Actions roda em servidor e não alcança `localhost`. Duas saídas:
> - **(a) Manter no PC:** rode o agendador do Windows (`schtasks`) chamando
>   `python automacao/publicar_social.py` — o script já roda local e usa a
>   Evolution da sua máquina.
> - **(b) Subir a Evolution para a nuvem** (Railway/Fly.io têm plano grátis)
>   e apontar `EVOLUTION_URL` para o endereço público. Aí o GitHub Actions
>   publica sem depender do seu PC ligado.

#### 3.4 Testar

```bash
# ver o que seria publicado
python automacao/publicar_social.py --listar
python automacao/publicar_social.py --slot "terca|19:30" --dry-run

# publicar de verdade (local, com a Evolution rodando)
python automacao/publicar_social.py --slot "terca|19:30" --forcar
```

No GitHub: `Actions → Publicar nas redes → Run workflow`.

---

## 4. A fila de conteúdo

Tudo em **`automacao/conteudo/social/post.json`**. Um slot = um horário.

```json
"terca|19:30": {
  "plataformas": ["whatsapp", "facebook", "instagram", "tiktok"],
  "tipo": "prova",
  "midia": "",
  "texto": "Antes e depois 🔄\n\nO site estava bonito, mas não gerava contato...",
  "hashtags": "#antesedepois #site #design",
  "link": "https://rickdigitalestudio.github.io/profissional-rickdutra/projetos.html"
}
```

**Campos:**
- `plataformas` — de onde o post vai sair (`whatsapp`, `facebook`, `instagram`)
- `tipo` — `prova` / `educa` / `oferta` / `pessoal` / `cta`
- `midia` — nome do arquivo em `automacao/conteudo/social/midia/` (vazio = só texto)
- `texto` — a legenda (sem o link; o script acrescenta)
- `hashtags` — linha separada, vai no final
- `link` — **a página de destino**. Use a landing page do serviço, não a home

**Adicionar um slot novo:** copie um bloco, troque o horário e o conteúdo.
O script nunca publica atrasado (passa 25 min do horário, o pico se perde) —
use `--forcar` se quiser publicar mesmo assim.

---

## 5. Feeds para newsletters e automações

- `feed.xml` — RSS 2.0, 10 itens
- `social-feed.xml` — Atom, 10 itens
- Todas as 24 páginas já têm autodiscovery (`<link rel="alternate">`)

**Para cruzar com o TikTok/Instagram automaticamente, de graça:**
IFTTT (plano grátis) ou Make → "New RSS item" → "Create a post" na rede social.
É a forma de postar no TikTok/LinkedIn sem API oficial.

**Para newsletter:** Buttondown, MailerLite (grátis até 1.000 assinantes) ou
Brevo leem o RSS e enviam o conteúdo novo para a sua lista.

---

## 6. O que NÃO dá para fazer de graça (honestidade)

| Pedido | Realidade |
|---|---|
| "Anunciar no Google de graça" | **Não existe.** Google Ads cobra por clique. O que existe é SEO orgânico (as 8 páginas de serviço), Google Maps (Perfil da Empresa) e Google AdSense (o Google **paga você** pelo tráfego). |
| "Anunciar no TikTok de graça" | O TikTok Ads é pago. O alcance orgânico é que é grátis — e é maior que o pago. |
| "Anunciar no Facebook/Instagram de graça" | O Meta Ads é pago. A Fanpage e o Instagram Business orgânicos são grátis (e é o que os scripts acima automatizam). |
| "Robô postando no LinkedIn" | Precisa de aprovação de app (dias). Não compensa para 14 posts por semana. |

**O que realmente vende, de graça:** Google Maps + SEO orgânico + TikTok
orgânico + WhatsApp Status diário + WhatsApp Business com catálogo. Os scripts
deste diretório automatizam 3 dos 5.

---

## 7. Checklist de ativação

- [ ] Token do Graph API criado (`FB_ACCESS_TOKEN`)
- [ ] `FB_PAGE_ID` e `IG_USER_ID` anotados
- [ ] Instagram convertido em conta **Business** e vinculado à Fanpage
- [ ] Segredos gravados no GitHub (Settings → Secrets → Actions)
- [ ] Evolution API acessível (local **ou** na nuvem)
- [ ] Teste: `python automacao/publicar_social.py --slot "terca|19:30" --dry-run`
- [ ] Teste real: `--forcar` e conferir no WhatsApp/Facebook
- [ ] Workflow `Publicar nas redes` disparando às 08h e 19h
- [ ] Conta do Search Console verificada (para o Google indexar)
- [ ] `python automacao/indexar.py` rodando (já está no workflow)
