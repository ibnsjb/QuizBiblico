# 📐 Nova Estrutura IBNS - Design Document

## 1️⃣ Problema Atual

```
❌ 3 abas desconectadas no Google Sheets
  ├─ eventos (data | tipo | hora | tema)
  ├─ escala (data | funcao | nome)  ← SEM identificação do evento
  └─ ordem (data | posicao | etapa | minutos | responsavel) ← SEM identificação do evento

❌ Resultado: Múltiplos eventos no mesmo dia → Escala/ordem ambígua
```

**Cenário Problemático:**
```
2026-06-22 09:00 - Culto Manhã
2026-06-22 19:00 - Culto Noite

Aba escala tem:
  2026-06-22 | Pregador | Pr. João
  2026-06-22 | Pregador | Pr. Carlos

Pergunta: Qual é qual? 🤔
```

---

## 2️⃣ Nova Estrutura Proposta

### A. Modelo de Dados JSON (Local Storage)

```json
{
  "evento_id": "2026-06-22_celebracao_0900",
  "data": "2026-06-22",
  "tipo": "Celebração da Família",
  "hora": "09:00",
  "tema": "A fé que move montanhas",
  "escala": [
    {
      "funcao": "Pregador / Ministro",
      "nome": "Pr. João Silva"
    },
    {
      "funcao": "Louvor / Música",
      "nome": "Maria Souza"
    }
  ],
  "ordem": [
    {
      "etapa": "Abertura em oração",
      "min": 3,
      "responsavel": "Pr. João Silva",
      "posicao": 1
    },
    {
      "etapa": "Louvor de entrada",
      "min": 15,
      "responsavel": "Maria Souza",
      "posicao": 2
    }
  ]
}
```

**Componentes:**
- `evento_id`: ID único gerado como `data_tipo_hora` (formato normalizado)
- `data`, `tipo`, `hora`, `tema`: Metadados do evento
- `escala[]`: Pessoas escaladas (vinculadas ao evento)
- `ordem[]`: Etapas do culto (vinculadas ao evento)

---

### B. Novo Formato Google Sheets

#### Aba 1: `eventos`

| data | tipo | hora | tema |
|------|------|------|------|
| 2026-06-22 | Celebração da Família | 09:00 | A fé que move montanhas |
| 2026-06-22 | Culto Noite | 19:00 | Jesus é o caminho |
| 2026-06-23 | Escola Discipuladora | 20:00 | Crescimento espiritual |

**Cabeçalho esperado:** `data | tipo | hora | tema`

---

#### Aba 2: `escala`

| data | tipo | hora | funcao | nome |
|------|------|------|--------|------|
| 2026-06-22 | Celebração da Família | 09:00 | Pregador / Ministro | Pr. João Silva |
| 2026-06-22 | Celebração da Família | 09:00 | Louvor / Música | Maria Souza |
| 2026-06-22 | Culto Noite | 19:00 | Pregador / Ministro | Pr. Carlos |
| 2026-06-22 | Culto Noite | 19:00 | Louvor / Música | Ana Paula |
| 2026-06-23 | Escola Discipuladora | 20:00 | Pregador / Ministro | Pr. João Silva |

**Cabeçalho esperado:** `data | tipo | hora | funcao | nome`

**Vantagem:** Agora cada linha está inequivocamente ligada a um evento específico!

---

#### Aba 3: `ordem`

| data | tipo | hora | posicao | etapa | minutos | responsavel |
|------|------|------|---------|-------|---------|-------------|
| 2026-06-22 | Celebração da Família | 09:00 | 1 | Abertura em oração | 3 | Pr. João Silva |
| 2026-06-22 | Celebração da Família | 09:00 | 2 | Louvor de entrada | 15 | Maria Souza |
| 2026-06-22 | Celebração da Família | 09:00 | 3 | Avisos | 5 | |
| 2026-06-22 | Celebração da Família | 09:00 | 4 | Leitura Bíblica | 5 | Carlos Lima |
| 2026-06-22 | Culto Noite | 19:00 | 1 | Oração Inicial | 5 | Pr. Carlos |
| 2026-06-22 | Culto Noite | 19:00 | 2 | Louvores | 20 | Ana Paula |

**Cabeçalho esperado:** `data | tipo | hora | posicao | etapa | minutos | responsavel`

---

## 3️⃣ Lógica de Carregamento (Google Sheets → Local)

### Pseudocódigo

```javascript
// 1. Buscar todas as linhas das 3 abas
const eventos_rows = parseCSV(await fetchCSV(url_eventos))
const escala_rows = parseCSV(await fetchCSV(url_escala))
const ordem_rows = parseCSV(await fetchCSV(url_ordem))

// 2. Criar índice de eventos por chave (data|tipo|hora)
const eventsMap = {}
eventos_rows.forEach(row => {
  const key = `${row.data}|${row.tipo}|${row.hora}`
  eventsMap[key] = {
    evento_id: generateId(row.data, row.tipo, row.hora),
    data: row.data,
    tipo: row.tipo,
    hora: row.hora,
    tema: row.tema,
    escala: [],
    ordem: []
  }
})

// 3. Adicionar escala aos eventos correspondentes
escala_rows.forEach(row => {
  const key = `${row.data}|${row.tipo}|${row.hora}`
  if (eventsMap[key]) {
    eventsMap[key].escala.push({
      funcao: row.funcao,
      nome: row.nome
    })
  }
})

// 4. Adicionar ordem aos eventos correspondentes
ordem_rows.forEach(row => {
  const key = `${row.data}|${row.tipo}|${row.hora}`
  if (eventsMap[key]) {
    eventsMap[key].ordem.push({
      etapa: row.etapa,
      min: parseInt(row.minutos || row.min || 0),
      responsavel: row.responsavel || '',
      posicao: parseInt(row.posicao || 99)
    })
  }
})

// 5. Ordenar eventos por data
const eventos = Object.values(eventsMap).sort((a,b) => a.data.localeCompare(b.data))

// 6. Salvar no localStorage
localStorage.setItem('ibns_eventos', JSON.stringify(eventos))
```

---

## 4️⃣ Geração de `evento_id`

### Formato: `YYYY-MM-DD_tipo_normalizado_HHMM`

```javascript
function generateEventoId(data, tipo, hora) {
  // data: "2026-06-22"
  // tipo: "Celebração da Família"
  // hora: "09:00"
  
  const normalizedTipo = tipo
    .toLowerCase()
    .replace(/[áàâã]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '_')
    .substring(0, 20)
  
  const horaFormat = hora.replace(':', '')
  
  return `${data}_${normalizedTipo}_${horaFormat}`
  // Exemplo: "2026-06-22_celebracao_da_familia_0900"
}
```

---

## 5️⃣ Interface de Usuário (Frontend)

### Fluxo na Aba "Culto"

```
┌─────────────────────────────────┐
│  Selecionar data               │
│  [📅 15 de junho de 2026]       │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Eventos disponíveis            │
│  ☐ 09:00 - Culto Manhã         │
│  ☑ 19:00 - Culto Noite         │ ← Selecionado
│  ☐ 20:30 - Célula              │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Detalhes do Evento Selecionado │
│  Tipo: Culto Noite              │
│  Hora: 19:00                    │
│  Tema: Jesus é o caminho        │
│                                 │
│  📋 Ordem do Culto:             │
│   1. Abertura em oração - Pr... │
│   2. Louvor - Ana Paula         │
│                                 │
│  👥 Escala:                     │
│   • Pregador: Pr. Carlos        │
│   • Louvor: Ana Paula           │
└─────────────────────────────────┘
```

### Mudanças de Componentes

1. **Selector de Data** → Mantém igual
2. **Novo: Selector de Eventos** → Lista de eventos do dia (se houver múltiplos)
3. **Display de Evento** → Mostra escala/ordem apenas do evento selecionado

---

## 6️⃣ Renderização de Eventos no Culto

### Estado Anterior
```javascript
dataSelecionada = "2026-06-22"
currentEvent = findByDate(dataSelecionada)  // ❌ Ambíguo se houver múltiplos
```

### Estado Novo
```javascript
dataSelecionada = "2026-06-22"
selectedEventoId = "2026-06-22_culto_noite_1900"  // ✅ Preciso
currentEvent = findById(selectedEventoId)
```

---

## 7️⃣ Aba Admin - Criar/Editar Evento

### Formulário Mantém Estrutura
```
Data: [2026-06-22]
Tipo: [Celebração da Família ▼]
Hora: [09:00]
Tema: [A fé que move montanhas]

📋 Ordem do Culto
├─ Abertura em oração | 3 min | Responsável: [...]
├─ Louvor de entrada | 15 min | Responsável: [...]
└─ ...

👥 Escala
├─ Pregador / Ministro | Pr. João Silva
├─ Louvor / Música | Maria Souza
└─ ...
```

**Mudança:** Ao salvar, gera automaticamente `evento_id` usando `generateEventoId()`

---

## 8️⃣ Tratamento de Duplicatas

### Cenário: Usuário cria 2 eventos na mesma data/tipo/hora

```javascript
// Evento 1: 2026-06-22 | Celebração | 09:00
// Evento 2: 2026-06-22 | Celebração | 09:00 (MESMA CHAVE!)

// Solução: Adicionar sufixo _v2, _v3, etc.
function generateEventoId(data, tipo, hora, index = 0) {
  const baseId = `${data}_${normalized_tipo}_${hora_format}`
  if (index > 0) return `${baseId}_v${index}`
  return baseId
}
```

---

## 9️⃣ Compatibilidade com Dados Antigos

### Migração
```javascript
function migrateOldData() {
  const oldEventos = JSON.parse(localStorage.getItem('ibns_eventos') || '[]')
  
  return oldEventos.map((ev, idx) => ({
    ...ev,
    evento_id: generateEventoId(ev.data, ev.tipo, ev.hora, 0)
  }))
}
```

---

## 🔟 Resumo de Mudanças

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Abas Sheets** | 3 desconectadas | 3 conectadas por data+tipo+hora |
| **JSON Local** | evento: {data, tipo, hora, ...} | evento: {evento_id, data, tipo, hora, ...} |
| **Chave Única** | data + tipo | data + tipo + hora |
| **Múltiplos eventos/dia** | ❌ Não suportado | ✅ Totalmente suportado |
| **Escala ambígua** | ❌ Sim | ✅ Não |
| **Ordem ambígua** | ❌ Sim | ✅ Não |
| **UI - Selector** | 1 data | 1 data + múltiplos eventos |

---

## 📝 Próximos Passos

1. ✅ **Estrutura definida** (este documento)
2. ⏳ **Criar versão 6** do HTML com nova lógica
3. ⏳ **Atualizar ESTRUTURA_JSON.md** com novo formato
4. ⏳ **Atualizar documento de modelo Google Sheets**
5. ⏳ **Testar com exemplos reais**

