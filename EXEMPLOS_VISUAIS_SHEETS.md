# 📸 Exemplos Visuais - Opções de Simplificação

## 🎯 Cenário: 1 evento com 3 pessoas na escala e 5 etapas

**Evento:** 2026-06-22 | Culto Noite | 19:00 | "Jesus é o caminho"

### Escala Esperada:
```
- Pregador: Pr. Carlos
- Louvor: Ana Paula
- Leitura: Maria Silva
```

### Ordem Esperada:
```
1. Oração Inicial (5 min) - Pr. Carlos
2. Louvores (20 min) - Ana Paula
3. Leitura Bíblica (5 min) - Maria Silva
4. Ensino (50 min) - Pr. Carlos
5. Encerramento (5 min) - —
```

---

## OPÇÃO 0: 3 Abas Separadas

### Google Sheets

**Aba 1: `eventos`**
```
┌──────────┬─────────────┬───────┬──────────────────────────┐
│ data     │ tipo        │ hora  │ tema                     │
├──────────┼─────────────┼───────┼──────────────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ Jesus é o caminho      │
└──────────┴─────────────┴───────┴──────────────────────────┘
```

**Aba 2: `escala`**
```
┌──────────┬─────────────┬───────┬──────────────────┬───────────────┐
│ data     │ tipo        │ hora  │ funcao           │ nome          │
├──────────┼─────────────┼───────┼──────────────────┼───────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ Pregador / Ministro │ Pr. Carlos    │
│ 2026-06-22 │ Culto Noite │ 19:00 │ Louvor / Música │ Ana Paula     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ Leitura Bíblica │ Maria Silva   │
└──────────┴─────────────┴───────┴──────────────────┴───────────────┘
```

**Aba 3: `ordem`**
```
┌──────────┬─────────────┬───────┬────────┬─────────────────┬────────┬─────────────────┐
│ data     │ tipo        │ hora  │ posica │ etapa           │ minutos│ responsavel     │
├──────────┼─────────────┼───────┼────────┼─────────────────┼────────┼─────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ 1     │ Oração Inicial  │ 5      │ Pr. Carlos      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 2     │ Louvores        │ 20     │ Ana Paula       │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 3     │ Leitura Bíblica │ 5      │ Maria Silva     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 4     │ Ensino          │ 50     │ Pr. Carlos      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 5     │ Encerramento    │ 5      │ —               │
└──────────┴─────────────┴───────┴────────┴─────────────────┴────────┴─────────────────┘
```

**Análise:**
- ✅ Muito claro, cada coisa em seu lugar
- ✅ Fácil de editar
- ❌ Data, tipo, hora repetidos em 3 abas (5 colunas de dados duplicados)
- ❌ 3 abas = mais naveg para o usuário

**Linhas totais no Sheets:** 1 + 3 + 5 = 9

---

## OPÇÃO 1: 2 Abas (items unificado)

### Google Sheets

**Aba 1: `eventos`**
```
┌──────────┬─────────────┬───────┬──────────────────────────┐
│ data     │ tipo        │ hora  │ tema                     │
├──────────┼─────────────┼───────┼──────────────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ Jesus é o caminho      │
└──────────┴─────────────┴───────┴──────────────────────────┘
```

**Aba 2: `items`**
```
┌──────────┬─────────────┬───────┬────────────┬───────────────┬────────────────────┬────────────────┐
│ data     │ tipo        │ hora  │ tipo_item  │ posicao       │ descricao          │ responsavel    │
├──────────┼─────────────┼───────┼────────────┼───────────────┼────────────────────┼────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ escala     │ 1             │ Pregador / Ministro│ Pr. Carlos     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ escala     │ 2             │ Louvor / Música    │ Ana Paula      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ escala     │ 3             │ Leitura Bíblica    │ Maria Silva    │
│ 2026-06-22 │ Culto Noite │ 19:00 │ ordem      │ 1             │ Oração Inicial - 5 │ Pr. Carlos     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ ordem      │ 2             │ Louvores - 20      │ Ana Paula      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ ordem      │ 3             │ Leitura Bíblica - 5│ Maria Silva    │
│ 2026-06-22 │ Culto Noite │ 19:00 │ ordem      │ 4             │ Ensino - 50        │ Pr. Carlos     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ ordem      │ 5             │ Encerramento - 5   │ —              │
└──────────┴─────────────┴───────┴────────────┴───────────────┴────────────────────┴────────────────┘
```

**Análise:**
- ✅ 2 abas (mais simples)
- ✅ Tudo junto (um lugar para editar)
- ⚠️ Coluna `tipo_item` = confunde (precisa saber escala vs ordem)
- ⚠️ Coluna `posicao` = ambígua (índice da escala? da ordem?)
- ⚠️ Coluna `descricao` = mistura funcao com etapa + minutos (estranho)
- ❌ Não fica claro qual é escala e qual é ordem

**Linhas totais no Sheets:** 1 + 8 = 9

---

## ⭐ OPÇÃO 4: 2 Abas (equipe_culto - RECOMENDADO)

### Google Sheets

**Aba 1: `eventos`**
```
┌──────────┬─────────────┬───────┬──────────────────────────┐
│ data     │ tipo        │ hora  │ tema                     │
├──────────┼─────────────┼───────┼──────────────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ Jesus é o caminho      │
└──────────┴─────────────┴───────┴──────────────────────────┘
```

**Aba 2: `equipe_culto`**
```
┌──────────┬─────────────┬───────┬────────┬─────────────────────┬─────────────────┬────────┐
│ data     │ tipo        │ hora  │ ordem  │ item_tipo           │ item            │ tempo  │
├──────────┼─────────────┼───────┼────────┼─────────────────────┼─────────────────┼────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ 1     │ escala              │ Pregador        │ —      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 2     │ escala              │ Louvor          │ —      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 3     │ escala              │ Leitura Bíblica │ —      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 1     │ ordem               │ Oração Inicial  │ 5      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 2     │ ordem               │ Louvores        │ 20     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 3     │ ordem               │ Leitura Bíblica │ 5      │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 4     │ ordem               │ Ensino          │ 50     │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 5     │ ordem               │ Encerramento    │ 5      │
└──────────┴─────────────┴───────┴────────┴─────────────────────┴─────────────────┴────────┘
```

❌ **Ainda ficou confuso** com a coluna `responsavel` faltando...

---

### ✅ OPÇÃO 4 MELHORADA: 2 Abas (Mais Prático)

**Aba 1: `eventos`**
```
┌──────────┬──────────────┬───────┬────────────────────────┐
│ data     │ tipo_evento  │ hora  │ tema                   │
├──────────┼──────────────┼───────┼────────────────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ Jesus é o caminho    │
└──────────┴──────────────┴───────┴────────────────────────┘
```

**Aba 2: `cronograma`** (ou `programacao`)
```
┌──────────┬──────────────┬───────┬────────┬──────────┬──────────────────────┬────────────┐
│ data     │ tipo_evento  │ hora  │ ordem  │ tipo     │ descricao            │ responsavel│
├──────────┼──────────────┼───────┼────────┼──────────┼──────────────────────┼────────────┤
│ 2026-06-22 │ Culto Noite │ 19:00 │ 1     │ ESCALA   │ Pregador             │ Pr. Carlos │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 2     │ ESCALA   │ Louvor               │ Ana Paula  │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 3     │ ESCALA   │ Leitura Bíblica      │ Maria Silva│
│ 2026-06-22 │ Culto Noite │ 19:00 │ 1     │ ORDEM    │ Oração Inicial (5)   │ Pr. Carlos │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 2     │ ORDEM    │ Louvores (20)        │ Ana Paula  │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 3     │ ORDEM    │ Leitura Bíblica (5)  │ Maria Silva│
│ 2026-06-22 │ Culto Noite │ 19:00 │ 4     │ ORDEM    │ Ensino (50)          │ Pr. Carlos │
│ 2026-06-22 │ Culto Noite │ 19:00 │ 5     │ ORDEM    │ Encerramento (5)     │ —          │
└──────────┴──────────────┴───────┴────────┴──────────┴──────────────────────┴────────────┘
```

✅ **Agora ficou claro!**
- Coluna `tipo` diz se é ESCALA ou ORDEM
- Coluna `ordem` numerada separadamente para cada tipo
- Coluna `descricao` tem nome + tempo quando aplicável
- Coluna `responsavel` sempre presente

**Análise:**
- ✅ 2 abas = simples
- ✅ Tudo em 1 aba para editar o culto (programacao)
- ✅ Coluna `tipo` deixa cristalino ESCALA vs ORDEM
- ✅ Fácil visual
- ✅ Fácil de parsear no código
- ✅ Nomes descritivos (programacao = calendário do culto)

**Linhas totais:** 1 + 8 = 9

---

## 📊 Comparação Final - JSON Resultante

Todas as opções geram o **MESMO JSON final**:

```json
{
  "evento_id": "2026-06-22_culto_noite_1900",
  "data": "2026-06-22",
  "tipo": "Culto Noite",
  "hora": "19:00",
  "tema": "Jesus é o caminho",
  "escala": [
    { "funcao": "Pregador", "nome": "Pr. Carlos" },
    { "funcao": "Louvor", "nome": "Ana Paula" },
    { "funcao": "Leitura Bíblica", "nome": "Maria Silva" }
  ],
  "ordem": [
    { "etapa": "Oração Inicial", "min": 5, "responsavel": "Pr. Carlos", "posicao": 1 },
    { "etapa": "Louvores", "min": 20, "responsavel": "Ana Paula", "posicao": 2 },
    { "etapa": "Leitura Bíblica", "min": 5, "responsavel": "Maria Silva", "posicao": 3 },
    { "etapa": "Ensino", "min": 50, "responsavel": "Pr. Carlos", "posicao": 4 },
    { "etapa": "Encerramento", "min": 5, "responsavel": "", "posicao": 5 }
  ]
}
```

A diferença é **apenas como os dados entram no Sheets**:
- Opção 0: 3 abas claras
- Opção 1: 2 abas confusas
- Opção 4: 2 abas claras (MELHOR!)

---

## 🎯 Recomendação Final

### ✅ Use OPÇÃO 4 Melhorada

**Google Sheets estrutura:**
```
Aba 1: eventos
  data | tipo_evento | hora | tema

Aba 2: programacao
  data | tipo_evento | hora | ordem | tipo | descricao | responsavel
```

**Vantagens:**
1. ✅ Apenas 2 abas (vs 3)
2. ✅ Uma aba para gerenciar tudo do culto (programacao)
3. ✅ Claro quando é ESCALA ou ORDEM
4. ✅ Fácil de editar
5. ✅ Fácil de parsear no código
6. ✅ Nomes intuitivos

**Código de parsing é simples:**
```javascript
const escala = rows.filter(r => r.tipo === "ESCALA" && r.tipo_evento === X)
const ordem = rows.filter(r => r.tipo === "ORDEM" && r.tipo_evento === X)
```

---

## 📝 Próximo Passo

Quer que eu:
1. **Confirme OPÇÃO 4?** → Segue para implementação v6
2. **Prefira OPÇÃO 0?** → Mantém 3 abas (mais claro ainda)
3. **Outra variação?** → Ajustamos antes de codificar

