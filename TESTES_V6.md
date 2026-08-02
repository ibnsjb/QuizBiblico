# ✅ Checklist de Testes - v6

## 🧪 Testes Funcionais

### 1. Inicialização
- [ ] Página carrega sem erros
- [ ] Header mostra "IBNS v6"
- [ ] Três abas visíveis: Culto, Escala, Painel
- [ ] Calendário renderiza corretamente

### 2. Migração de Dados
- [ ] Se tiver dados v4, migração acontece automaticamente
- [ ] Cada evento recebe um `evento_id` único
- [ ] Dados antigos não se perdem

### 3. Aba "Culto" - Data Simples (1 evento por dia)

#### Teste 3.1: Selecionar Data com 1 Evento
- [ ] Clica em data no calendário
- [ ] Evento aparece
- [ ] Selector de eventos **NÃO FICA VISÍVEL** (só 1 evento)
- [ ] Banner mostra: tipo, hora, tema
- [ ] Ordem aparece com etapas e minutos

#### Teste 3.2: Checklist Funciona
- [ ] Clica em checkbox de uma etapa
- [ ] Etapa fica marcada com ✓ verde
- [ ] Progresso atualiza (%)
- [ ] Recarrega página → marcação persiste

### 4. Aba "Culto" - Múltiplos Eventos por Dia ⭐

#### Teste 4.1: Selector de Eventos Aparece
- [ ] Criar 2 eventos no mesmo dia (ex: 09:00 e 19:00)
- [ ] Seleciona data no calendário
- [ ] **Selector de eventos aparece**
- [ ] Lista ambos eventos: "09:00 - Tipo" e "19:00 - Tipo"

#### Teste 4.2: Trocar Evento
- [ ] Escolhe evento 1 no selector
- [ ] Renderiza escala e ordem do evento 1
- [ ] Muda selector para evento 2
- [ ] Renderiza escala e ordem do evento 2 (diferentes!)

#### Teste 4.3: Checklist Separado
- [ ] Marca etapa do evento 1 com ✓
- [ ] Troca para evento 2
- [ ] Etapas do evento 2 **estão desmarcadas**
- [ ] Troca de volta para evento 1
- [ ] Etapa marcada anteriormente **continua marcada**

### 5. Aba "Escala"

#### Teste 5.1: Exibição de Escala
- [ ] Seleciona data
- [ ] Aba Escala mostra pessoas escaladas
- [ ] Nomes aparecem com avatar (iniciais)
- [ ] Função aparece para cada pessoa

#### Teste 5.2: Múltiplos Eventos - Escala Correta
- [ ] 2 eventos no mesmo dia com escalas diferentes
- [ ] Evento 1: Escala A
- [ ] Evento 2: Escala B
- [ ] Muda evento no selector
- [ ] Escala muda corretamente ✅

### 6. Painel Admin

#### Teste 6.1: Acesso com Senha
- [ ] Clica em "Painel"
- [ ] Pede senha
- [ ] Digita senha incorreta → erro
- [ ] Digita "0573" → acesso

#### Teste 6.2: Criar Novo Evento
- [ ] Data: hoje
- [ ] Tipo: "Celebração da Família"
- [ ] Hora: 10:00
- [ ] Tema: "Teste v6"
- [ ] Adiciona 3 etapas
- [ ] Adiciona 2 pessoas na escala
- [ ] Clica "Salvar Evento"
- [ ] Toast de sucesso aparece
- [ ] Evento aparece na lista de eventos

#### Teste 6.3: Editar Evento
- [ ] Clica "Editar" em um evento
- [ ] Formulário popula com dados
- [ ] Muda tema
- [ ] Clica "Atualizar Evento"
- [ ] Tema atualiza na lista

#### Teste 6.4: Deletar Evento
- [ ] Clica "Excluir"
- [ ] Pede confirmação
- [ ] Confirma
- [ ] Evento desaparece

### 7. Google Sheets Integration

#### Teste 7.1: Modelo Visualização
- [ ] Painel → Google Sheets → "Como configurar"
- [ ] Mostra 3 passos
- [ ] Clica em "Modelo"
- [ ] Mostra formato de cada aba

#### Teste 7.2: Carregar do Sheets (se tiver URLs)
- [ ] Cola URLs das 3 abas
- [ ] Clica "Salvar & Importar"
- [ ] Mostra status "Buscando dados..."
- [ ] Se sucesso: "X evento(s) carregado(s)"
- [ ] Eventos aparecem nas abas Culto e Escala

#### Teste 7.3: Baixar Modelo JSON
- [ ] Clica "⬇️ Baixar modelo JSON"
- [ ] Arquivo `ibns_modelo_evento.json` baixa
- [ ] Abre arquivo em editor de texto
- [ ] Contém estrutura correta com `evento_id`

### 8. Reordenação de Etapas (Culto)

#### Teste 8.1: Modo Reordenação
- [ ] Está na aba Culto
- [ ] Clica botão "✎" (Reordenar)
- [ ] Etapas ficam com handle "☰"
- [ ] Botão muda para "✖"
- [ ] Aparece botão "Salvar Ordem"

#### Teste 8.2: Drag & Drop
- [ ] Arrasta etapa 2 para posição 1
- [ ] Etapa muda de posição
- [ ] Clica "Salvar Ordem"
- [ ] Nova ordem persiste ao recarregar

### 9. Importação JSON

#### Teste 9.1: Import de Arquivo
- [ ] Cria arquivo JSON com estrutura correta
- [ ] Aba Painel → "Importar via JSON"
- [ ] Clica na área de upload
- [ ] Seleciona arquivo JSON
- [ ] Toast: "JSON importado! X evento(s)"
- [ ] Eventos aparecem na lista

### 10. Responsividade

- [ ] Abrir em mobile (redimensionar janela)
- [ ] Layout reajusta corretamente
- [ ] Botões clicáveis
- [ ] Texto legível
- [ ] Selector de eventos visível em mobile

---

## 🔍 Testes de Regressão

### Verificar que v4 Funcionalidades Continuam OK

- [ ] Calendário com navegação mês anterior/próximo
- [ ] Destaque de datas com eventos
- [ ] Highlight de data de hoje
- [ ] Toast notifications funcionam
- [ ] Auto-sync a cada 5 minutos (se URLs configuradas)
- [ ] LocalStorage persist dados corretamente
- [ ] Modal de "Recuperar senha" funciona

---

## 🆔 Testes Específicos - evento_id

### Teste evento_id.1: Geração Automática
```javascript
// No Console:
const ev = JSON.parse(localStorage.getItem('ibns_eventos'))[0]
console.log(ev.evento_id)
// Esperado: "2026-06-22_celebracao_da_familia_0900"
```
- [ ] evento_id gerado corretamente
- [ ] Formato: data_tipo_hora

### Teste evento_id.2: Uniqueness
```javascript
const eventos = JSON.parse(localStorage.getItem('ibns_eventos'))
const ids = eventos.map(e => e.evento_id)
const unique = new Set(ids)
console.log(ids.length === unique.size) // true
```
- [ ] Não há evento_id duplicado

### Teste evento_id.3: Persistência
- [ ] Cria evento
- [ ] Recarrega página
- [ ] evento_id continua igual

---

## 📊 Testes de Dados

### Cenário A: 1 Evento por Dia (Backward Compatible)
1. Cria evento: 2026-06-25 | Culto | 09:00
2. Selector NÃO aparece (só 1 evento)
3. Tudo funciona normal
4. ✅ **OK**

### Cenário B: 2 Eventos Mesmo Horário, Tipos Diferentes
1. Evento 1: 2026-06-25 | Culto Manhã | 09:00
2. Evento 2: 2026-06-25 | Culto Noite | 09:00 (mesmo horário!)
3. Selector aparece com ambos
4. evento_ids são diferentes? ✅
5. Escalas são diferentes? ✅

### Cenário C: 3+ Eventos no Mesmo Dia
1. Cria 3 eventos:
   - 09:00 - Culto
   - 15:00 - Célula
   - 20:00 - Oração
2. Selector mostra todas as 3
3. Muda entre elas sem problema
4. Cada uma tem sua escala/ordem
5. ✅ **OK**

### Cenário D: Mesmo Tipo, Diferentes Horários
1. Evento 1: 2026-06-25 | Célula | 09:00
2. Evento 2: 2026-06-25 | Célula | 20:00
3. evento_ids diferentes?
4. Escalas diferentes?
5. ✅ **OK**

---

## 📋 Performance

- [ ] Página carrega em <2s
- [ ] Selector de eventos responde rapidamente
- [ ] Recarregar do Sheets responde em <5s
- [ ] Sem lag ao trocar eventos

---

## 🎯 Antes de Deploy

- [ ] Todos os testes acima passam ✅
- [ ] Nenhum erro no Console (F12)
- [ ] Documentação atualizada
- [ ] Nenhuma regressão de v4

