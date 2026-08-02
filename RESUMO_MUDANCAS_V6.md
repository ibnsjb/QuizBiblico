# 📝 Resumo de Mudanças - v4 → v6

## 🆕 Novas Funcionalidades

### 1. evento_id (Identificador Único)
```javascript
// v4: eventos identificados apenas por data + tipo
// v6: cada evento tem evento_id único baseado em data + tipo + hora

evento_id = "2026-06-22_culto_noite_1900"
```

**Benefício:** Suporta múltiplos eventos no mesmo dia sem ambiguidade.

### 2. Suporte a Múltiplos Eventos por Dia
```
v4: Máximo 1 evento por dia (data + tipo era chave única)
v6: Ilimitados eventos por dia (data + tipo + hora é chave única)

Exemplo:
2026-06-22 09:00 - Culto Manhã (Evento A)
2026-06-22 19:00 - Culto Noite (Evento B)
2026-06-22 20:30 - Célula (Evento C)
```

**Benefício:** Flexibilidade para calendários complexos.

### 3. Selector de Eventos na Aba "Culto"
```
v4: Se houvesse 2 eventos no mesmo dia, pegava só o primeiro
v6: Mostra dropdown para escolher qual evento ver
```

**Benefício:** Acesso fácil a todos eventos do dia.

### 4. Parser Google Sheets Aprimorado
```javascript
// v4: Usava data + tipo como chave para agrupar
// v6: Usa data + tipo + hora como chave para agrupamento

Aba escala: data | tipo | hora | funcao | nome
Aba ordem:  data | tipo | hora | posicao | etapa | minutos | responsavel
```

**Benefício:** Escala e ordem vinculadas corretamente a cada evento específico.

### 5. Migração Automática de v4
```javascript
// Ao carregar v6, se tiver dados v4:
migrateFromV4()
// → Adiciona evento_id a cada evento v4
// → Dados preservados completamente
```

**Benefício:** Sem perda de dados ao atualizar.

---

## 🔧 Mudanças Internas

### Funções Novas

```javascript
// Gera ID único a partir de data, tipo e hora
generateEventoId(data, tipo, hora)

// Normaliza strings para evento_id (remove acentos, espaços, etc)
normalizeString(str)

// Retorna array de eventos em uma data específica
findEventsByDate(data)

// Retorna um evento específico pelo seu evento_id
findEventById(evento_id)

// Migra dados v4 (adiciona evento_id se não tiver)
migrateFromV4()
```

### Variáveis Alteradas

```javascript
// v4:
let selectedEventoIndex = null  // index do evento no array

// v6:
let selectedEventoId = null     // evento_id único
```

### Checklist Storage

```javascript
// v4:
checklist = { "2026-06-22_Culto": {0: true, 1: false, ...} }

// v6:
checklist = { "2026-06-22_culto_0900": {0: true, 1: false, ...} }
```

**Razão:** Usar evento_id em vez de data+tipo garante que cada evento tem seu checklist separado.

---

## 📊 Estrutura de Dados

### Evento (Estrutura)

**v4:**
```json
{
  "data": "2026-06-22",
  "tipo": "Culto",
  "hora": "09:00",
  "tema": "...",
  "ordem": [...],
  "escala": [...]
}
```

**v6:**
```json
{
  "evento_id": "2026-06-22_culto_0900",    // ← NOVO
  "data": "2026-06-22",
  "tipo": "Culto",
  "hora": "09:00",
  "tema": "...",
  "ordem": [...],
  "escala": [...]
}
```

---

## 🔄 Lógica de Renderização

### Aba "Culto" - Seleção de Evento

**v4:**
```javascript
// Busca primeira ocorrência com data === dataSelecionada
const event = eventos.find(e => e.data === dataSelecionada)
// ❌ Se houver 2, pega só o primeiro
```

**v6:**
```javascript
// Busca todos eventos da data
const eventsDay = findEventsByDate(dataSelecionada)

if (eventsDay.length > 1) {
  // Mostra selector
  showEventSelector(eventsDay)
} else if (eventsDay.length === 1) {
  // Auto-select único evento
  selectedEventoId = eventsDay[0].evento_id
}

// Busca evento específico por ID
const event = findEventById(selectedEventoId)
// ✅ Preciso e sem ambiguidade
```

---

## 💾 Google Sheets - Formato

### Antes (v4)

**Aba escala:**
```
data | tipo | funcao | nome
(Sem hora! Como saber qual escala é de qual evento se tiver 2 no mesmo dia?)
```

**Aba ordem:**
```
data | posicao | etapa | minutos | responsavel
(Sem tipo e hora! Ambíguo!)
```

### Depois (v6)

**Aba escala:**
```
data | tipo | hora | funcao | nome
(Agora data+tipo+hora identifica unicamente qual evento!)
```

**Aba ordem:**
```
data | tipo | hora | posicao | etapa | minutos | responsavel
(Mesma coisa - data+tipo+hora como chave)
```

---

## 🎯 Benefícios Práticos

| Aspecto | v4 | v6 |
|---------|----|----|
| Máx eventos/dia | 1 | Ilimitados |
| Ambiguidade | ❌ Sim | ✅ Não |
| evento_id | ❌ Não | ✅ Sim |
| Selector eventos | ❌ Não | ✅ Sim |
| Parser Sheets | 🟡 Simples | 🟢 Robusto |
| Compatibilidade | — | ✅ 100% v4 |

---

## ⚠️ Breaking Changes

### NÃO há breaking changes!

```
✅ v4 → v6 é totalmente compatível
✅ Dados v4 migram automaticamente
✅ Sem perda de dados
✅ Sem ação necessária do usuário
```

---

## 🧪 Validação

### O que Muda no Uso?

**Para usuário com 1 evento/dia:**
- Praticamente nada
- Continua igual

**Para usuário com múltiplos eventos/dia:**
- ✨ Novo selector aparece (se houver >1 evento)
- Cada evento tem escala e ordem correta
- Checklist separado por evento

---

## 📚 Documentação Relacionada

- [Guia de Uso v6](GUIA_USO_V6.md)
- [Testes v6](TESTES_V6.md)
- [Análise de Simplificação](ANALISE_SIMPLIFICACAO.md)
- [Estrutura Nova](ESTRUTURA_NOVA.md)

