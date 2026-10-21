# Como a prova social do portfólio funciona

> **Estado atual: os depoimentos do site são REAIS.**
> Todos eles estão publicados nos sites que eu construí, e **cada card tem o
> link para o site de origem** — dá para conferir no ar, card por card.

---

## 1. O que tem no site hoje

| Bloco | Conteúdo | Origem |
|---|---|---|
| **Quem contratou** | 8 cartões com **nome do proprietário**, **nome da empresa**, serviço entregue e segmento | Barbearia Gui Leiros, Pousada do Adão, AD Santos, Nepofit, CrescerBem + 2 lojas demo |
| **Selo de credibilidade** | **Lighthouse 100/100/100** (Acessibilidade, Best Practices, SEO) | Medido no site publicado — qualquer um reproduz |
| **Depoimentos** | 10 falas com **nome real**, papel, empresa e link para a página onde a frase está publicada | Barbearia, Nepofit, Pousada, AD Santos, CrescerBem |

---

## 2. Onde editar

Tudo sai de um arquivo só:

```
automacao/conteudo/prova-social.json
```

Depois de editar, rode:

```powershell
python automacao\gerar_prova_social.py
python automacao\checar_site.py
```

O gerador reescreve os blocos da home entre os marcadores
`<!-- PS:CLIENTES -->`, `<!-- PS:DEPOIMENTOS -->`, `<!-- PS:SELO -->`,
`<!-- PS:RESULTADOS -->`, `<!-- PS:CONFIANCA -->` e `<!-- PS:FAQ -->`.

---

## 3. Adicionando um depoimento novo

Copie um item da lista `depoimentos` e preencha:

```json
{
  "estado": "real",
  "nome": "Rafael M.",
  "cargo": "Cliente",
  "empresa": "Barbearia Gui Leiros",
  "servico": "Site oficial 3D",
  "texto": "Fiz o degradê e o pezinho, ficou afiado demais.",
  "url": "https://rickdigitalestudio.github.io/barbearia-gui-leiros/",
  "fonte": "seção Depoimentos"
}
```

| Campo | O que é |
|---|---|
| `estado` | `"real"`. Qualquer outro valor mostra a tarja amarela "Texto de exemplo". |
| `nome` | Nome da pessoa (pode ser só o primeiro nome + inicial do sobrenome). |
| `cargo` | Papel dela: "Cliente", "Mãe", "Aluno há 2 anos", "Hóspede", "Obreira da sede". |
| `empresa` | Nome do negócio. |
| `servico` | O que você.contractou (vira a etiqueta do card). |
| `texto` | A fala, literal. |
| `url` | Link de onde a fala está publicada (deixe sempre). |
| `fonte` | Nome da seção no site de origem ("seção Depoimentos", "página Depoimentos"). |

---

## 4. ⚠️ Regra de ouro: não invente

**Depoimento inventado é ilegal.**

- **CDC art. 37** — é proibido anunciar ou divulgar produtos e serviços objeto de
  publicidade enganosa.
- **CDC art. 36** — a publicidade precisa ser comprovadamente verdadeira.
- **Conar, Código Brasileiro de Autorregulamentação Publicitária** — testemunhos
  têm de ser genuínos e identificados.

Se um dia o **Guilherme Leiros**, o **Adão** ou alguém da **AD Santos** ver que
você publicou uma fala que eles não falaram, a relação comercial que você
construiu com eles é o que vai por água abaixo — e o problema é seu, não do
"conteúdo".

**O que fazer, na ordem:**

1. **Já tem fala publicada?** Copie para cá (é o caso de 5 clientes). ✅
2. **Não tem?** Peça no WhatsApp e **cole a resposta do cliente**. Leve o
   texto pronto: _"Rick, gostei do site! Posso usar um comentário seu sobre o
   trabalho, com seu nome e o nome da barbearia?"_ A resposta vem em 1 minuto.
3. **Só publica depois do "sim"** do cliente.

---

## 5. O selo de nota (100/100 do Lighthouse)

Hoje o selo mostra o **score real do Lighthouse** — verificável por qualquer
visitante que rode a ferramenta no site. É mais forte que uma nota de review,
porque é auditável.

Quando você criar o **Perfil da Empresa no Google**
(guia: `GOOGLE-BUSINESS-PROFILE.md`) e tiver 5+ avaliações reais, troque o
bloco `selo` no JSON por:

```json
"avaliacao": {
  "nota": "5,0",
  "estrelas": "★★★★★",
  "rotulo": "Média das avaliações",
  "fonte": "Google Business Profile",
  "url": "https://g.page/rickdigital"
}
```

O gerador já aceita os dois formatos.

---

## 6. Checklist antes de publicar

- [ ] Todo depoimento tem `estado: "real"` (nenhuma tarja amarela no site).
- [ ] Todo depoimento tem `url` para o site onde a frase está publicada.
- [ ] Nenhuma fala foi inventada ou "melhorada" sem o cliente ter lido.
- [ ] `python automacao\checar_site.py` sem erros.
- [ ] Se adicionou fotos: `python automacao\otimizar_html.py`.
- [ ] Foto nova: 800×800 px, JPG, até 150 KB.
