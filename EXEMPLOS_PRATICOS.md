# 📊 Exemplos Práticos - Nova Estrutura

## Cenário 1: Múltiplos Eventos no Mesmo Dia

**Data:** 2026-06-22 (Domingo)

### Eventos Planejados
```
09:00 - Culto Dominical (Manhã)
19:00 - Culto Noite  
20:30 - Célula de Oração
```

---

## Google Sheets - Como Ficaria

### Aba: `eventos`

```
data       | tipo                  | hora  | tema
-----------|----------------------|-------|----------------------------------
2026-06-22 | Celebração da Família | 09:00 | A graça de Deus em nossas vidas
2026-06-22 | Culto Noite           | 19:00 | Jesus é o caminho, a verdade...
2026-06-22 | Célula de Oração      | 20:30 | Intercessão pela nação
```

### Aba: `escala`

```
data       | tipo                  | hora  | funcao              | nome
-----------|----------------------|-------|---------------------|---------------------
2026-06-22 | Celebração da Família | 09:00 | Pregador / Ministro | Pr. João Silva
2026-06-22 | Celebração da Família | 09:00 | Louvor / Música     | Maria Souza
2026-06-22 | Celebração da Família | 09:00 | Leitura Bíblica     | Carlos Lima
2026-06-22 | Culto Noite           | 19:00 | Pregador / Ministro | Pr. Carlos Santos
2026-06-22 | Culto Noite           | 19:00 | Louvor / Música     | Ana Paula Gomes
2026-06-22 | Célula de Oração      | 20:30 | Líder da Célula     | Pastor Marcelo
2026-06-22 | Célula de Oração      | 20:30 | Intercessor         | Irmã Rita
```

### Aba: `ordem`

```
data       | tipo                  | hora  | posicao | etapa                 | minutos | responsavel
-----------|----------------------|-------|---------|----------------------|---------|------------------
2026-06-22 | Celebração da Família | 09:00 | 1       | Abertura em oração    | 3       | 
2026-06-22 | Celebração da Família | 09:00 | 2       | Louvor de entrada     | 15      | Maria Souza
2026-06-22 | Celebração da Família | 09:00 | 3       | Avisos                | 5       |
2026-06-22 | Celebração da Família | 09:00 | 4       | Leitura Bíblica       | 5       | Carlos Lima
2026-06-22 | Celebração da Família | 09:00 | 5       | Mensagem              | 40      | Pr. João Silva
2026-06-22 | Celebração da Família | 09:00 | 6       | Dízimos e Ofertas     | 7       |
2026-06-22 | Celebração da Família | 09:00 | 7       | Encerramento          | 5       |
2026-06-22 | Culto Noite           | 19:00 | 1       | Oração Inicial        | 5       | Pr. Carlos Santos
2026-06-22 | Culto Noite           | 19:00 | 2       | Louvores              | 20      | Ana Paula Gomes
2026-06-22 | Culto Noite           | 19:00 | 3       | Ensino                | 50      | Pr. Carlos Santos
2026-06-22 | Culto Noite           | 19:00 | 4       | Encerramento          | 5       |
2026-06-22 | Célula de Oração      | 20:30 | 1       | Boas-vindas           | 5       | Pastor Marcelo
2026-06-22 | Célula de Oração      | 20:30 | 2       | Intercessão           | 45      | Irmã Rita
2026-06-22 | Célula de Oração      | 20:30 | 3       | Encerramento          | 5       | Pastor Marcelo
```

---

## Resultado em Local Storage (JSON)

```json
[
  {
    "evento_id": "2026-06-22_celebracao_da_familia_0900",
    "data": "2026-06-22",
    "tipo": "Celebração da Família",
    "hora": "09:00",
    "tema": "A graça de Deus em nossas vidas",
    "escala": [
      {
        "funcao": "Pregador / Ministro",
        "nome": "Pr. João Silva"
      },
      {
        "funcao": "Louvor / Música",
        "nome": "Maria Souza"
      },
      {
        "funcao": "Leitura Bíblica",
        "nome": "Carlos Lima"
      }
    ],
    "ordem": [
      {
        "etapa": "Abertura em oração",
        "min": 3,
        "responsavel": "",
        "posicao": 1
      },
      {
        "etapa": "Louvor de entrada",
        "min": 15,
        "responsavel": "Maria Souza",
        "posicao": 2
      },
      {
        "etapa": "Avisos",
        "min": 5,
        "responsavel": "",
        "posicao": 3
      },
      {
        "etapa": "Leitura Bíblica",
        "min": 5,
        "responsavel": "Carlos Lima",
        "posicao": 4
      },
      {
        "etapa": "Mensagem",
        "min": 40,
        "responsavel": "Pr. João Silva",
        "posicao": 5
      },
      {
        "etapa": "Dízimos e Ofertas",
        "min": 7,
        "responsavel": "",
        "posicao": 6
      },
      {
        "etapa": "Encerramento",
        "min": 5,
        "responsavel": "",
        "posicao": 7
      }
    ]
  },
  {
    "evento_id": "2026-06-22_culto_noite_1900",
    "data": "2026-06-22",
    "tipo": "Culto Noite",
    "hora": "19:00",
    "tema": "Jesus é o caminho, a verdade...",
    "escala": [
      {
        "funcao": "Pregador / Ministro",
        "nome": "Pr. Carlos Santos"
      },
      {
        "funcao": "Louvor / Música",
        "nome": "Ana Paula Gomes"
      }
    ],
    "ordem": [
      {
        "etapa": "Oração Inicial",
        "min": 5,
        "responsavel": "Pr. Carlos Santos",
        "posicao": 1
      },
      {
        "etapa": "Louvores",
        "min": 20,
        "responsavel": "Ana Paula Gomes",
        "posicao": 2
      },
      {
        "etapa": "Ensino",
        "min": 50,
        "responsavel": "Pr. Carlos Santos",
        "posicao": 3
      },
      {
        "etapa": "Encerramento",
        "min": 5,
        "responsavel": "",
        "posicao": 4
      }
    ]
  },
  {
    "evento_id": "2026-06-22_celula_de_oracao_2030",
    "data": "2026-06-22",
    "tipo": "Célula de Oração",
    "hora": "20:30",
    "tema": "Intercessão pela nação",
    "escala": [
      {
        "funcao": "Líder da Célula",
        "nome": "Pastor Marcelo"
      },
      {
        "funcao": "Intercessor",
        "nome": "Irmã Rita"
      }
    ],
    "ordem": [
      {
        "etapa": "Boas-vindas",
        "min": 5,
        "responsavel": "Pastor Marcelo",
        "posicao": 1
      },
      {
        "etapa": "Intercessão",
        "min": 45,
        "responsavel": "Irmã Rita",
        "posicao": 2
      },
      {
        "etapa": "Encerramento",
        "min": 5,
        "responsavel": "Pastor Marcelo",
        "posicao": 3
      }
    ]
  }
]
```

---

## Interface do Usuário - Fluxo de Navegação

### Passo 1: Usuário abre o app e seleciona uma data

```
┌─────────────────────────────────────┐
│         IBNS - Ordem do Culto       │
├─────────────────────────────────────┤
│  📅 Selecionar data                 │
│  ┌─────────────────────────────────┐
│  │ 📅 22 de junho de 2026          │
│  └─────────────────────────────────┘
│                                     │
│  ✅ Eventos encontrados             │
│  [ ] 09:00 - Celebração da Família │
│  [ ] 19:00 - Culto Noite           │
│  [ ] 20:30 - Célula de Oração      │
└─────────────────────────────────────┘
```

### Passo 2: Usuário seleciona o evento

```
┌─────────────────────────────────────────────────────┐
│         IBNS - Ordem do Culto                       │
├─────────────────────────────────────────────────────┤
│  📅 22 de junho de 2026                             │
│  ✅ Eventos (escolha um):                           │
│  [ ] 09:00 - Celebração da Família                 │
│  [✓] 19:00 - Culto Noite           ← SELECIONADO   │
│  [ ] 20:30 - Célula de Oração                      │
│                                                     │
│  ─────────────────────────────────────────────     │
│  🎯 Detalhes do Evento Selecionado                 │
│                                                     │
│  📌 Tipo: Culto Noite                              │
│  🕐 Hora: 19:00                                     │
│  📝 Tema: Jesus é o caminho, a verdade...          │
│                                                     │
│  📋 Ordem do Culto:                                │
│   1. Oração Inicial (5 min)                        │
│      Responsável: Pr. Carlos Santos                │
│                                                     │
│   2. Louvores (20 min)                             │
│      Responsável: Ana Paula Gomes                  │
│                                                     │
│   3. Ensino (50 min)                               │
│      Responsável: Pr. Carlos Santos                │
│                                                     │
│   4. Encerramento (5 min)                          │
│      Responsável: —                                │
│                                                     │
│  👥 Escala:                                         │
│   🔷 Pr. Carlos Santos - Pregador / Ministro       │
│   🔷 Ana Paula Gomes - Louvor / Música             │
└─────────────────────────────────────────────────────┘
```

---

## Código - Renderização da Aba Culto

### Antes (v4)
```javascript
// ❌ Problemático
const event = eventos.find(e => e.data === dataSelecionada)
// Se houver múltiplos eventos, pega apenas o primeiro!
```

### Depois (v6)
```javascript
// ✅ Preciso
const event = eventos.find(e => e.evento_id === selectedEventoId)
// Ou com lista de eventos do dia:
const eventsDayList = eventos.filter(e => e.data === dataSelecionada)
// Mostrar lista para seleção, se houver mais de 1
```

---

## Casos de Uso

### ✅ Caso 1: Um evento por dia (mantém compatibilidade)
```
2026-06-22: Culto Dominical 09:00
→ Seleção automática se único evento
→ Renderiza escala/ordem normalmente
```

### ✅ Caso 2: Múltiplos eventos no mesmo dia
```
2026-06-22: Culto Manhã 09:00
2026-06-22: Culto Noite 19:00
→ Mostra lista de seleção
→ Usuário escolhe qual ver
→ Renderiza escala/ordem do selecionado
```

### ✅ Caso 3: Mesmo tipo, múltiplos horários
```
2026-06-22: Célula 09:00
2026-06-22: Célula 19:00
→ Chaves distintas: "2026-06-22_celula_0900" vs "2026-06-22_celula_1900"
→ Cada uma com sua própria escala/ordem
```

### ✅ Caso 4: Mesmo tipo, mesma hora, dias diferentes
```
2026-06-22: Célula 20:00 (domingo)
2026-06-23: Célula 20:00 (segunda)
→ Chaves distintas: "2026-06-22_celula_2000" vs "2026-06-23_celula_2000"
→ Dados separados e independentes
```

---

## Migração de Dados Antigos

Se o usuário tinha v4 com dados antigos:

```json
// OLD (v4)
[
  {
    "data": "2026-06-22",
    "tipo": "Celebração da Família",
    "hora": "09:00",
    "tema": "...",
    "ordem": [...],
    "escala": [...]
  }
]

// NEW (v6) - Após migração
[
  {
    "evento_id": "2026-06-22_celebracao_da_familia_0900",  // ← NOVO
    "data": "2026-06-22",
    "tipo": "Celebração da Família",
    "hora": "09:00",
    "tema": "...",
    "ordem": [...],
    "escala": [...]
  }
]
```

**Script de migração:**
```javascript
function migrateFromV4() {
  const old = JSON.parse(localStorage.getItem('ibns_eventos') || '[]')
  return old.map(ev => ({
    ...ev,
    evento_id: generateEventoId(ev.data, ev.tipo, ev.hora)
  }))
}
```

---

## Sumário de Mudanças

| Item | v4 | v6 |
|------|----|----|
| **Chave única** | data + tipo | data + tipo + hora |
| **evento_id** | Não tinha | `2026-06-22_tipo_0900` |
| **Múltiplos eventos/dia** | ❌ | ✅ |
| **Escala por evento** | ❌ Ambígua | ✅ Precisa |
| **Ordem por evento** | ❌ Ambígua | ✅ Precisa |
| **Google Sheets** | 3 abas desconectadas | 3 abas conectadas por data+tipo+hora |
| **Compatibilidade** | — | ✅ Migra dados v4 |

