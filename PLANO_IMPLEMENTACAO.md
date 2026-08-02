# 🛠️ Plano de Implementação - v4 → v6

## 📋 Checklist de Mudanças Necessárias

### Frontend (ibns_v4.html → ibns_v6.html)

#### 1️⃣ Estrutura de Dados
- [ ] Adicionar `evento_id` ao modelo de evento
- [ ] Adicionar `generateEventoId()` function
- [ ] Adicionar `selectedEventoId` state variable
- [ ] Adicionar função de migração de dados v4

#### 2️⃣ Parser Google Sheets
- [ ] Atualizar `loadSheets()` para usar `data + tipo + hora` como chave
- [ ] Adicionar validação: se faltam dados, skip linha
- [ ] Associar escala com base em `data|tipo|hora`
- [ ] Associar ordem com base em `data|tipo|hora`

#### 3️⃣ Aba "Culto" - UI
- [ ] Manter selector de data (igual)
- [ ] **NOVO**: Adicionar selector de eventos (se múltiplos no dia)
- [ ] Atualizar `renderCulto()` para usar `selectedEventoId`
- [ ] Lógica: mostrar lista se >1 evento, auto-select se =1

#### 4️⃣ Aba "Escala" - Renderização
- [ ] Atualizar `renderEscala()` para filtrar por `selectedEventoId`
- [ ] Se houver múltiplos eventos, adicionar filter/selector

#### 5️⃣ Aba "Admin" - Criar/Editar
- [ ] Ao salvar evento, gerar automaticamente `evento_id`
- [ ] Ao editar evento, manter `evento_id` existente
- [ ] Validação: não permitir duplicar mesma `data+tipo+hora`

#### 6️⃣ Importação JSON
- [ ] Ao importar JSON, adicionar `evento_id` a cada evento
- [ ] Validação: detectar duplicatas de `data+tipo+hora`

#### 7️⃣ Gerenciamento de Eventos
- [ ] `findEventById(evento_id)` - nova função
- [ ] `findEventsByDate(data)` - nova função  
- [ ] `deleteEventById(evento_id)` - atualizar para usar ID
- [ ] `editEventById(evento_id, newData)` - atualizar para usar ID

---

## 📝 Estrutura de Funções Novas

### `generateEventoId(data, tipo, hora)`
```javascript
/**
 * Gera ID único para evento: YYYY-MM-DD_tipo_normalizado_HHMM
 * @param {string} data - "2026-06-22"
 * @param {string} tipo - "Celebração da Família"
 * @param {string} hora - "09:00"
 * @returns {string} "2026-06-22_celebracao_da_familia_0900"
 */
```

### `normalizeString(str)`
```javascript
/**
 * Normaliza string para usar em evento_id
 * Remove acentos, transforma em minúsculas, substitui espaços por _
 */
```

### `findEventsByDate(data)`
```javascript
/**
 * Retorna array de eventos em uma data específica
 * Útil para preencher selector na aba Culto
 */
```

### `findEventById(evento_id)`
```javascript
/**
 * Retorna um evento específico pelo seu ID
 */
```

### `migrateFromV4()`
```javascript
/**
 * Migra dados antigos (v4) para novo formato (v6)
 * Adiciona evento_id a cada evento que não tem
 */
```

---

## 🔄 Fluxos de Dados Atualizados

### Carregar do Google Sheets

```
sheets_eventos.csv
    ↓
[{data, tipo, hora, tema}, ...]
    ↓
Criar chave: data|tipo|hora
    ↓
sheets_escala.csv
    ↓
[{data, tipo, hora, funcao, nome}, ...]
    ↓
Agrupar por chave
    ↓
sheets_ordem.csv
    ↓
[{data, tipo, hora, posicao, etapa, minutos, responsavel}, ...]
    ↓
Agrupar por chave
    ↓
Gerar evento_id
    ↓
Array de eventos completos
    ↓
localStorage.setItem('ibns_eventos', JSON.stringify(eventos))
```

### Selecionar Data na Aba "Culto"

```
Usuário clica em data
    ↓
dataSelecionada = "2026-06-22"
    ↓
eventsDay = findEventsByDate(dataSelecionada)
    ↓
if (eventsDay.length === 1) {
  selectedEventoId = eventsDay[0].evento_id
  renderCulto()
} else if (eventsDay.length > 1) {
  showEventSelector(eventsDay)
  // Usuário escolhe um
  selectedEventoId = escolhido.evento_id
  renderCulto()
} else {
  showMessage("Nenhum evento neste dia")
}
```

### Renderizar Evento na Aba "Culto"

```
selectedEventoId = "2026-06-22_culto_noite_1900"
    ↓
currentEvent = findEventById(selectedEventoId)
    ↓
if (!currentEvent) return
    ↓
Renderizar:
  - event-banner com: tipo, hora, tema
  - ordem: currentEvent.ordem[]
  - escala: currentEvent.escala[]
```

---

## 📊 Comparativo de Funções

### Aba Admin - Salvar Evento

**ANTES (v4):**
```javascript
const ev = {
  data, tipo, hora, tema,
  ordem: [...],
  escala: [...]
}
const idx = eventos.findIndex(e => e.data === data && e.tipo === tipo)
if (idx >= 0) eventos[idx] = ev
else eventos.push(ev)
```

**DEPOIS (v6):**
```javascript
const evento_id = generateEventoId(data, tipo, hora)
const ev = {
  evento_id,  // ← NOVO
  data, tipo, hora, tema,
  ordem: [...],
  escala: [...]
}
const idx = eventos.findIndex(e => e.evento_id === evento_id)
if (idx >= 0) eventos[idx] = ev
else eventos.push(ev)
```

---

### Aba Culto - Renderizar

**ANTES (v4):**
```javascript
function renderCulto() {
  const event = eventos.find(e => e.data === dataSelecionada)
  // ❌ Se houver múltiplos, pega só o primeiro
  if (!event) return
  // ... renderizar
}
```

**DEPOIS (v6):**
```javascript
function renderCulto() {
  if (!selectedEventoId) return
  const event = findEventById(selectedEventoId)
  // ✅ Preciso
  if (!event) return
  // ... renderizar
}
```

---

## 🧪 Testes Necessários

### Testes Unitários
- [ ] `generateEventoId()` gera IDs válidos
- [ ] `findEventById()` encontra evento correto
- [ ] `findEventsByDate()` filtra por data
- [ ] `migrateFromV4()` adiciona evento_id sem perder dados

### Testes de Integração
- [ ] Carregar dados do Sheets com múltiplos eventos/dia
- [ ] Selecionar data com múltiplos eventos
- [ ] Selector de eventos funciona
- [ ] Renderização correta de escala/ordem após seleção
- [ ] Editar evento mantém evento_id
- [ ] Deletar evento remove correto

### Testes de Dados
- [ ] Dados v4 migram corretamente
- [ ] JSON import funciona com novo formato
- [ ] Não há duplicatas de evento_id
- [ ] Múltiplos eventos/dia: cada um tem escala/ordem distintas

### Testes de UI
- [ ] Selector de data funciona
- [ ] Selector de eventos visível quando >1
- [ ] Selector de eventos oculto quando =1
- [ ] Trocar evento alterna escala/ordem
- [ ] Responsive em mobile

---

## 📚 Documentação para Atualizar

### ESTRUTURA_JSON.md
- [ ] Adicionar campo `evento_id` aos exemplos
- [ ] Atualizar descrição de múltiplos eventos
- [ ] Adicionar exemplo de múltiplos eventos/dia

### ESTRUTURA_NOVA.md
- [x] ✅ Já criado

### EXEMPLOS_PRATICOS.md
- [x] ✅ Já criado

### Modelo Google Sheets (no HTML)
- [ ] Atualizar abas esperadas:
  - `eventos`: data | tipo | hora | tema
  - `escala`: **data | tipo | hora** | funcao | nome
  - `ordem`: **data | tipo | hora** | posicao | etapa | minutos | responsavel

---

## 🔍 Validações Importantes

### Ao Carregar do Sheets
```
✅ Cada linha da escala tem: data, tipo, hora preenchidos
✅ Cada linha da ordem tem: data, tipo, hora preenchidos
✅ Não há linhas vazias
✅ Formato de data é YYYY-MM-DD
✅ Formato de hora é HH:MM
```

### Ao Criar/Editar Evento
```
✅ data é obrigatória (YYYY-MM-DD)
✅ tipo é obrigatória
✅ hora é obrigatória (HH:MM)
✅ tema é obrigatória se tipo === "Outro"
✅ Não há duplicata de data+tipo+hora
```

### Ao Importar JSON
```
✅ Cada evento tem: data, tipo, hora, tema
✅ evento_id é gerado automaticamente se não tiver
✅ ordem está ordenada por posicao
✅ escala contém nome e funcao
```

---

## ⚡ Performance

**Índices a Considerar:**
- Eventos pode ter centenas de registros
- `findEventById()` faz busca linear → OK para <1000 eventos
- Se crescer muito: considerar Map com evento_id como chave

```javascript
// Otimização futura (se necessário)
const eventMap = new Map()
eventos.forEach(ev => eventMap.set(ev.evento_id, ev))
const event = eventMap.get(selectedEventoId)
```

---

## 🎯 Versão Final

**Arquivo novo:** `ibns_v6.html`

**Principais mudanças:**
1. ✅ Suporta múltiplos eventos por dia
2. ✅ Escala/ordem são inequivocamente vinculadas ao evento
3. ✅ Google Sheets usa chave composta (data|tipo|hora)
4. ✅ Compatibilidade com dados v4
5. ✅ UI melhorada com selector de eventos

---

## 📅 Timeline Sugerida

1. **Fase 1** (hoje): ✅ Estrutura definida (este documento)
2. **Fase 2**: Implementar v6.html com novo engine de dados
3. **Fase 3**: Testar com exemplos práticos
4. **Fase 4**: Documentação final
5. **Fase 5**: Deploy

