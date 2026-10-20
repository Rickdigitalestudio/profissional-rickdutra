#!/usr/bin/env python3
"""Aplica acentuacao correta do portugues nos textos das paginas de servico.

Uso unico (idempotente): python automacao/accentuar_servicos.py

Regra: nao altera slugs (nomes de arquivo), nomes proprios em ingles
(Open Graph, Times New Roman, fa-*) e tecnicas de SEO.
"""
from __future__ import annotations

import json
import pathlib
import re

CONT = pathlib.Path(__file__).resolve().parent / "conteudo"

# palavras corrompidas por falha de encoding na escrita do arquivo
CORROMPIDAS = {
    "est�dio": "estudio",
    "regi�o": "regiao",
    "gen�rico": "generico",
    "ap�ndices": "apendices",
    "Ap�ndices": "Apendices",
}

ACENTOS = {
    "academico": "acadêmico", "academicos": "acadêmicos",
    "alem": "além", "alguem": "alguém", "adaptacoes": "adaptações",
    "angulo": "ângulo", "apendices": "apêndices", "apresentacao": "apresentação",
    "aprovacao": "aprovação", "aplicacao": "aplicação", "aplicacoes": "aplicações",
    "area": "área", "atualizacoes": "atualizações", "atualizaveis": "atualizáveis",
    "automatico": "automático", "automaticos": "automáticos",
    "avaliacao": "avaliação", "avaliacoes": "avaliações", "basico": "básico",
    "beneficios": "benefícios", "bilinque": "bilíngue", "botao": "botão",
    "capitulos": "capítulos", "captacao": "captação", "cartao": "cartão",
    "cartoes": "cartões", "catalogo": "catálogo", "citacao": "citação",
    "citacoes": "citações", "codificacao": "codificação", "codigo": "código",
    "coerencia": "coerência", "comeca": "começa", "comecar": "começar",
    "competencias": "competências", "composicao": "composição",
    "concorrencia": "concorrência", "condicoes": "condições", "conexao": "conexão",
    "conferencia": "conferência", "confianca": "confiança", "configuracao": "configuração",
    "conteudo": "conteúdo", "conversao": "conversão", "cracha": "crachá",
    "criacao": "criação", "criterio": "critério", "decisao": "decisão",
    "descricao": "descrição", "descricoes": "descrições", "diagnostico": "diagnóstico",
    "diferenca": "diferença", "dimensoes": "dimensões", "direcoes": "direções",
    "disponivel": "disponível", "dissertacao": "dissertação",
    "distribuidas": "distribuídas", "divulgacao": "divulgação", "dominio": "domínio",
    "duvida": "dúvida", "duvidas": "dúvidas", "edicao": "edição",
    "endereco": "endereço", "espaco": "espaço", "especifica": "específica",
    "especificacao": "especificação", "estudio": "estúdio",
    "experiencia": "experiência", "experiencias": "experiências",
    "facil": "fácil", "faco": "faço", "formatacao": "formatação",
    "formulario": "formulário", "generico": "genérico", "gestao": "gestão",
    "horario": "horário", "horarios": "horários", "hierarquicos": "hierárquicos",
    "icone": "ícone", "icones": "ícones", "identificacao": "identificação",
    "indexacao": "indexação", "indicacao": "indicação", "indice": "índice",
    "informacao": "informação", "informacoes": "informações",
    "instalacao": "instalação", "instituicao": "instituição",
    "instrucoes": "instruções", "integracao": "integração",
    "integracoes": "integrações", "licenca": "licença", "logica": "lógica",
    "manutencao": "manutenção", "metricas": "métricas", "minimo": "mínimo",
    "necessario": "necessário", "necessarias": "necessárias",
    "nivel": "nível", "niveis": "níveis", "numeracao": "numeração",
    "numero": "número", "numeros": "números", "obrigatorio": "obrigatório",
    "opcao": "opção", "orcamento": "orçamento", "orientacao": "orientação",
    "otimas": "ótimas", "otimizacao": "otimização", "padrao": "padrão",
    "padronizacao": "padronização", "pagina": "página", "paginas": "páginas",
    "papeis": "papéis", "paragrafo": "parágrafo", "paragrafos": "parágrafos",
    "pecas": "peças", "portfolio": "portfólio", "possivel": "possível",
    "preco": "preço", "precos": "preços", "producao": "produção",
    "proprio": "próprio", "proprios": "próprios", "publicacao": "publicação",
    "publico": "público", "recomendacao": "recomendação",
    "recomendacoes": "recomendações", "referencia": "referência",
    "referencias": "referências", "regiao": "região", "relatorio": "relatório",
    "replicavel": "replicável", "revisao": "revisão", "secao": "seção",
    "secoes": "seções", "simbolo": "símbolo", "solucao": "solução",
    "sumario": "sumário", "tambem": "também", "tipografica": "tipográfica",
    "titulacao": "titulação", "titulo": "título", "titulos": "títulos",
    "util": "útil", "uteis": "úteis", "varios": "vários", "varias": "várias",
    "veiculo": "veículo", "versao": "versão", "versoes": "versões",
    "video": "vídeo", "visualizacoes": "visualizações",
    # verbos e particulas
    "nao": "não", "sao": "são", "voce": "você", "ja": "já",
    "apos": "após", "ate": "até", "so": "só", "esta": "está",
    "servico": "serviço", "servicos": "serviços", "negocio": "negócio",
    "negocios": "negócios", "pratica": "prática", "rapido": "rápido",
    "rapidos": "rápidos", "trafego": "tráfego", "mes": "mês",
    "as": "as", "e": "e",
}

# frases especificas que o mapa por palavra nao resolve
FRASES = [
    ("as 220 primeiras", "às 220 primeiras"),
    ("e embroidery", "e bordado"),
    ("parecer.forward spam", "parecer propaganda"),
    ("strategically", "estrategicamente"),
    ("Trabalho de TCC", "Trabalho de TCC"),
    ("attending", "attending"),
]

# nao mexe em: slugs, nomes de arquivo, classes de icone, termos em ingles
PROTEGIDO = re.compile(r"^(fa-[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*(\.html)?)$", re.I)
# palavra isolada, sem encostar em "fa-" nem em partes de slug
PADRAO = re.compile(
    r"(?<![a-zA-Z0-9_-])(?P<w>[a-zA-ZÀ-ÿ]+)(?![a-zA-Z0-9_-])"
)


def acentua_texto(t: str) -> str:
    if PROTEGIDO.match(t.strip()):
        return t
    t = t.replace("�", "")
    for a, b in CORROMPIDAS.items():
        t = t.replace(a, b)
    for a, b in FRASES:
        t = t.replace(a, b)

    def sub(m: re.Match) -> str:
        w = m.group("w")
        low = w.lower()
        if low not in ACENTOS:
            return w
        novo = ACENTOS[low]
        if w[0].isupper():
            novo = novo[0].upper() + novo[1:]
        return novo

    return PADRAO.sub(sub, t)


def acentua_obj(o):
    if isinstance(o, str):
        return acentua_texto(o)
    if isinstance(o, list):
        return [acentua_obj(i) for i in o]
    if isinstance(o, dict):
        return {k: (v if k == "slug" else acentua_obj(v)) for k, v in o.items()}
    return o


def main() -> int:
    total = 0
    for p in sorted(CONT.glob("*.json")):
        orig = p.read_text(encoding="utf-8")
        data = json.loads(orig)
        novo = json.dumps(acentua_obj(data), ensure_ascii=False, indent=2) + "\n"
        if novo != orig:
            p.write_text(novo, encoding="utf-8")
            total += 1
            print(f"acentuado: {p.name}")
    print(f"{total} arquivo(s) atualizado(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
