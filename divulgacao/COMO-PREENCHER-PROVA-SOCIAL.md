# Como preencher a prova social (depoimentos e nota)

> **Leia isto antes de publicar.** Depoimento inventado é ilegal: o Código de
> Defesa do Consumidor (art. 37) proíbe anunciar qualities que o prestador não
> pode comprovar, e o CDC (art. 36) exige que a publicidade seja
> comprovadamente verdadeira. No site, cada card que ainda não foi trocado
> aparece com a tarja amarela **“TEXTO DE EXEMPLO”** — é um aviso visual, não
> decoração. **Só publique quando a tarja sumir.**

---

## 1. Onde editar

Tudo sai de um arquivo só:

```
automacao/conteudo/prova-social.json
```

Depois de editar, rode:

```powershell
python automacao\gerar_prova_social.py
```

O script reescreve os blocos da home (`index.html`) entre os marcadores
`<!-- PS:DEPOIMENTOS -->` … `<!-- /PS:DEPOIMENTOS -->`.

Para conferir que ficou tudo certo:

```powershell
python automacao\checar_site.py
```

Enquanto existir depoimento de exemplo, ele acusa:
`[prova social] ainda ha depoimento de exemplo publicado na home`.

---

## 2. Preenchendo um depoimento

```json
{
  "estado": "real",
  "nome": "Maria Souza",
  "cargo": "Proprietária",
  "empresa": "Barbearia Gui Leiros",
  "servico": "Site institucional 3D",
  "texto": "Antes eu dependia só de indicação. Hoje o site traz gente nova pelo Google toda semana...",
  "foto": "img/depoimento-maria.jpg"
}
```

| Campo | O que é | Obrigatório |
|---|---|---|
| `estado` | `"real"` quando for real. Qualquer outro valor mantém a tarja amarela. | sim |
| `nome` | Nome da pessoa. Pode ser só o primeiro nome + sobrenome. | sim |
| `cargo` | Cargo ou relação com o projeto ("Proprietária", "Gerente"). | sim |
| `empresa` | Nome do negócio. | sim |
| `servico` | O que você contracted ("Site institucional", "Loja virtual"…). Aparece como etiqueta. | sim |
| `texto` | A fala do cliente. 2 a 4 frases, no tom dele. | sim |
| `foto` | Caminho da foto (ex.: `img/depoimento-maria.jpg`). Sem foto, aparece o avatar com as iniciais. | não |

### Como conseguir o depoimento (5 minutos por cliente)

1. Abra o WhatsApp do cliente e peça: _"Rick, adorei o site! Me manda um
   comentário curto sobre como foi o processo? Se quiser, com seu nome e da
   empresa."_
2. **Cole o texto e mande para ele aprovar** antes de publicar.
3. Peça a foto do perfil (ou use a foto da empresa) e salve em `img/`.
4. Preencha o JSON, troque `"estado"` para `"real"` e rode o gerador.

> Falar com o cliente **por escrito** (WhatsApp) e guardar a print é a melhor
> prova. A tela do cliente satisfeito vale mais que um texto decorado.

---

## 3. Nota e selo de avaliação (Google Business Profile)

O selo no topo da seção de clientes usa o `avaliacao` do mesmo JSON:

```json
"avaliacao": {
  "nota": "5,0",
  "estrelas": "★★★★★",
  "rotulo": "Média das avaliações",
  "fonte": "Google Business Profile",
  "url": "https://g.page/rickdigital"
}
```

**Sem perfil no Google, não invente a nota.** Sem o GBP, comente o bloco
inteiro no JSON ou apague a chave `avaliacao` — o selo some do site.

Como criar o perfil (guia completo em `GOOGLE-BUSINESS-PROFILE.md`):

1. <https://www.google.com/business/> → “Criar perfil”.
2. Nome: **Estúdio Rick Digital**. Categoria: **Desenvolvedor de sites** /
   **Agência de marketing digital**. Localização: São Paulo - SP.
3. Site: o endereço do seu portfólio. Telefone: (11) 98942-6415.
4. Pede avaliações aos clientes com este link:
   <https://g.page/rickdigital>
5. Quando tiver 5+ avaliações reais, volte ao JSON e preencha a nota média.

---

## 4. Logos de clientes

A tira de clientes (`clientes.lista` no JSON) usa **wordmarks em texto** com
o nome real de cada negócio — é honesto e não exige arquivo de logo.

Se você conseguir o logo em PNG/SVG com permissão, o bloco do card aceita:

```json
{ "nome": "Pousada do Adão", "tipo": "Hotelaria", "url": "...", "logo": "img/logo-pousada.png" }
```

(Neste momento o gerador usa só o wordmark; o campo `logo` fica reservado
para a próxima versão do bloco.)

---

## 5. Checklist antes de publicar

- [ ] Pelo menos **3 depoimentos reais**, com nome e empresa.
- [ ] Todos com `"estado": "real"` (nenhuma tarja amarela na página).
- [ ] O texto foi **aprovado pelo cliente**.
- [ ] `python automacao\checar_site.py` sem erros.
- [ ] `python automacao\otimizar_html.py` (se adicionou fotos).
- [ ] Foto nova no tamanho certo: 800×800 px, JPG, até 150 KB.
