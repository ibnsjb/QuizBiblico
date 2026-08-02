# 🔧 Fix: Checkboxes não visíveis na v6

## 📋 Análise do Problema

### Sintoma
Na aba "Culto", os checkboxes da "Ordem do Culto" não aparecem visualmente.

### Causa Raiz
Encontrado no código da v6.html:

**Linha 1198** - Função `renderCultoOrderItems()`:
```javascript
listC.innerHTML = ord.map((o,i)=>`<div class="ordem-item">
  <div class="ordem-num">${i+1}</div>
  <div class="check-btn" style="visibility:hidden"></div>
  ...
`).join('');
```

Os checkboxes têm `style="visibility:hidden"` o que esconde o elemento mas mantém o espaço.

**Linha 1128-1132** - Função `renderCulto()`:
```javascript
<div class="order-item">
  <div class="ordem-num">${i+1}</div>
  <div class="check-btn ${ch[i]?'checked':''}" onclick="toggleCheck('${chKey}',${i})"></div>
  ...
```

Esta função renderiza os checkboxes CORRETAMENTE (sem visibility:hidden).

### Problema
Há dois cenários:
1. **Renderização normal (renderCulto)**: Checkboxes aparecem ✅
2. **Modo reordenação (renderCultoOrderItems)**: Checkboxes escondidos ❌

Parece que o modo reordenação está sendo ativado por padrão.

---

## 🔍 Investigação Necessária

1. **Variável `cultoReorderMode`**: Em qual momento é true por padrão?
2. **Função ativada**: Qual é chamada na inicialização da aba Culto?
3. **Estado persistido**: O modo reordenação é persistido em localStorage?

---

## ✅ Solução Proposta

### Opção A: Garantir renderCulto() é chamada
Na função que mostra a aba Culto, chamar `renderCulto()` em vez de `renderCultoOrderItems()`.

### Opção B: Remover visibility:hidden
Na linha 1198, trocar:
```javascript
style="visibility:hidden"
```
por:
```javascript
style="display:none"  // ou remover completamente
```

### Opção C: Adicionar flag para modo reordenação
Verificar se `cultoReorderMode` está true quando não deveria estar.

---

## 📋 Implementação

### Passo 1: Identificar qual função é chamada
Adicionar console.log nas duas funções para ver qual é executada.

### Passo 2: Remover visibility:hidden ou desabilitar renderCultoOrderItems
Se renderCultoOrderItems está sendo chamada por padrão, trocar para renderCulto().

### Passo 3: Testar
Abrir Culto tab e verificar se checkboxes aparecem.

---

## 🎯 Teste de Validação

Após fix:
1. [x] Abrir aba Culto
2. [x] Verificar checkboxes visíveis
3. [x] Clicar checkbox → deve marcar ✓
4. [x] Recarregar página → estado deve persistir
5. [x] Trocar evento → checklist diferente por evento
6. [x] Verificar modo reordenação (botão ✎) ainda funciona

---

## 📊 Status

- [ ] Fix implementado
- [ ] Testes passando
- [ ] Merge em produção

