# 📋 Guia de Uso - IBNS v6

## ✨ Novidades da v6

### 🎯 Suporte Completo a Múltiplos Eventos por Dia

Agora você pode ter vários eventos no mesmo dia com escalas e ordens completamente diferentes:

```
2026-06-22 09:00 - Culto Dominical (Manhã) → Escala A, Ordem A
2026-06-22 19:00 - Culto Noite → Escala B, Ordem B
2026-06-22 20:30 - Célula de Oração → Escala C, Ordem C
```

Cada evento tem sua própria **escala**, **ordem** e **identificação única** (evento_id).

---

## 🚀 Começando

### Opção 1: Usar Dados Locais

1. Clique na aba **Culto** e selecione uma data
2. Se houver múltiplos eventos no dia, escolha o desejado no selector
3. Veja a ordem e a escala específica daquele evento

### Opção 2: Importar do Google Sheets

1. Vá até a aba **Painel** (senha: 0573)
2. Na seção "Google Sheets", vá em **Conectar**
3. Cole as URLs das 3 abas do seu Sheets:
   - `eventos` (data | tipo | hora | tema)
   - `escala` (data | tipo | hora | funcao | nome)
   - `ordem` (data | tipo | hora | posicao | etapa | minutos | responsavel)
4. Clique em **Salvar & Importar**

---

## 🆔 Como Funciona o evento_id

O `evento_id` é gerado automaticamente com base em:

```
evento_id = data_tipo_normalizado_hora

Exemplo:
data: 2026-06-22
tipo: Culto Noite
hora: 19:00

evento_id: 2026-06-22_culto_noite_1900
```

**Por que?** Para garantir que cada evento seja **inequivocamente identificado**, mesmo se houver múltiplos no mesmo dia.

---

## 📝 Estrutura Google Sheets

### ✅ Formato Correto (3 Abas)

#### Aba 1: `eventos`
```
data        | tipo                  | hora  | tema
2026-06-22  | Celebração da Família | 09:00 | A graça de Deus
2026-06-22  | Culto Noite           | 19:00 | Jesus é o caminho
2026-06-23  | Escola Discipuladora  | 20:00 | Crescimento
```

#### Aba 2: `escala`
```
data        | tipo                  | hora  | funcao              | nome
2026-06-22  | Celebração da Família | 09:00 | Pregador / Ministro | Pr. João
2026-06-22  | Celebração da Família | 09:00 | Louvor / Música     | Maria
2026-06-22  | Culto Noite           | 19:00 | Pregador / Ministro | Pr. Carlos
2026-06-22  | Culto Noite           | 19:00 | Louvor / Música     | Ana Paula
```

#### Aba 3: `ordem`
```
data        | tipo                  | hora  | posicao | etapa               | minutos | responsavel
2026-06-22  | Celebração da Família | 09:00 | 1       | Abertura em oração  | 3       | —
2026-06-22  | Celebração da Família | 09:00 | 2       | Louvor de entrada   | 15      | Maria
2026-06-22  | Culto Noite           | 19:00 | 1       | Oração Inicial      | 5       | Pr. Carlos
2026-06-22  | Culto Noite           | 19:00 | 2       | Louvores            | 20      | Ana Paula
```

---

## 🔑 Pontos Importantes

### 1. **Chave de Agrupamento: data + tipo + hora**

As linhas das abas `escala` e `ordem` são agrupadas por estes 3 campos:

```javascript
const chave = `${data}|${tipo}|${hora}`
// Exemplo: "2026-06-22|Culto Noite|19:00"
```

Se os dados não combinarem em todas as 3 abas, eles não serão vinculados.

### 2. **evento_id é Gerado Automaticamente**

Você **NÃO precisa** colocar evento_id no JSON. É criado automaticamente a partir de:

```
data + tipo normalizado + hora
```

### 3. **Compatibilidade com v4**

Se você tinha v4 com dados antigos, eles serão migrados automaticamente ao carregar a v6. Não perde nada! ✅

---

## 📊 Exemplo Prático: Criar 2 Eventos no Mesmo Dia

### No Google Sheets

**Aba: eventos**
```
data        | tipo        | hora  | tema
2026-06-22  | Culto Manhã  | 09:00 | Graça
2026-06-22  | Culto Noite  | 19:00 | Fé
```

**Aba: escala**
```
data        | tipo       | hora  | funcao   | nome
2026-06-22  | Culto Manhã | 09:00 | Pregador | Pr. João
2026-06-22  | Culto Manhã | 09:00 | Louvor   | Maria
2026-06-22  | Culto Noite | 19:00 | Pregador | Pr. Carlos
2026-06-22  | Culto Noite | 19:00 | Louvor   | Ana
```

**Aba: ordem**
```
data        | tipo       | hora  | posicao | etapa         | minutos | responsavel
2026-06-22  | Culto Manhã | 09:00 | 1       | Abertura      | 3       | —
2026-06-22  | Culto Manhã | 09:00 | 2       | Louvor        | 15      | Maria
2026-06-22  | Culto Noite | 19:00 | 1       | Oração        | 5       | Pr. Carlos
2026-06-22  | Culto Noite | 19:00 | 2       | Ensino        | 50      | Pr. Carlos
```

### Na Aplicação

1. Seleciona data: **22 de junho**
2. Aparece selector: **Culto Manhã (09:00)** ou **Culto Noite (19:00)**
3. Escolhe **Culto Noite**
4. Vê:
   - ✅ Escalados: Pr. Carlos, Ana
   - ✅ Ordem: Oração (5 min), Ensino (50 min)

---

## 🐛 Troubleshooting

### Problema: Dados não aparecem do Sheets

**Solução:**
1. Verifique se a chave `data|tipo|hora` é **exatamente igual** em todas as 3 abas
2. Procure por espaços extras ou diferenças de capitalização
3. Clique em "🔄 Recarregar do Sheets" para forçar atualização

### Problema: Múltiplos eventos não aparecem no selector

**Solução:**
1. Verifique se há realmente 2+ eventos no mesmo dia
2. Recarregue a página (F5)
3. Verifique no localStorage (abra DevTools > Console)

### Problema: Dados v4 desapareceram

**Solução:**
Não desapareceram! Foram apenas migrados. Verifique o evento_id gerado:

```javascript
// No console do navegador, digite:
JSON.parse(localStorage.getItem('ibns_eventos'))
```

Procure pelos eventos com o novo `evento_id`.

---

## 💾 Exportar Dados

Para fazer backup ou transferir dados:

1. Abra DevTools (F12)
2. Console
3. Digite:
```javascript
copy(JSON.stringify(JSON.parse(localStorage.getItem('ibns_eventos')), null, 2))
```
4. Cole em um arquivo `.json`

---

## 🔐 Segurança

- Senha padrão: **0573**
- Dados salvos no navegador (localStorage)
- Google Sheets é apenas **leitura**
- Edições locais **não sincronizam** com Sheets automaticamente

---

## 📞 Suporte

Se houver dúvidas sobre:
- **Estrutura Google Sheets**: Verifique `ESTRUTURA_NOVA.md`
- **Exemplos práticos**: Veja `EXEMPLOS_PRATICOS.md`
- **Análise de simplificação**: Consulte `ANALISE_SIMPLIFICACAO.md`

