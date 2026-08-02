# Guia de Upload de Eventos - IBNS

## 📋 Estrutura JSON

Use este guia para criar eventos em lote via arquivo JSON. O arquivo pode conter um único evento ou múltiplos.

## 🏗️ Estrutura Completa de um Evento

```json
{
  "data": "YYYY-MM-DD",
  "tipo": "Celebração da Família | Escola Discipuladora | Mini Vigília | Outro",
  "hora": "HH:MM",
  "tema": "Tema ou descrição do evento",
  "ordem": [
    {
      "etapa": "Nome da etapa",
      "min": 5,
      "responsavelIndex": 0
    }
  ],
  "escala": [
    {
      "funcao": "Nome da função",
      "nome": "Nome da pessoa"
    }
  ]
}
```

## 📝 Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `data` | String | Data do evento (YYYY-MM-DD) | `"2026-06-22"` |
| `tipo` | String | Tipo de evento | `"Celebração da Família"` |
| `hora` | String | Horário (HH:MM formato 24h) | `"09:00"` |
| `tema` | String | Tema ou descrição | `"A fé que move montanhas"` |

## 📋 Array: `ordem` (Ordem do Culto)

Descreve as etapas do culto/evento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `etapa` | String | Nome da etapa (ex: "Abertura em oração") |
| `min` | Number | Duração em minutos |
| `responsavelIndex` | Number \| null | Índice do escala responsável (começa em 0) ou `null` |

### Exemplo de `ordem`:
```json
"ordem": [
  {
    "etapa": "Abertura em oração",
    "min": 3,
    "responsavelIndex": null
  },
  {
    "etapa": "Louvor de entrada",
    "min": 15,
    "responsavelIndex": 1
  }
]
```

## 👥 Array: `escala` (Equipe/Pessoal)

Lista de pessoas escaladas para o evento (até 8 funções).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcao` | String | Função/Cargo (ex: "Pregador", "Louvor") |
| `nome` | String | Nome da pessoa |

### Funções Padrão:
1. Pregador / Ministro
2. Louvor / Música
3. Leitura Bíblica
4. Oração Inicial
5. Oração Final
6. Dízimos e Ofertas
7. Mídias / Projeção
8. Recepção / Portaria

### Exemplo de `escala`:
```json
"escala": [
  {
    "funcao": "Pregador / Ministro",
    "nome": "Pr. João Silva"
  },
  {
    "funcao": "Louvor / Música",
    "nome": "Maria Souza"
  }
]
```

## 🔗 Como Funciona `responsavelIndex`

O `responsavelIndex` conecta uma etapa da ordem com uma pessoa da escala:
- Começa em **0** (primeiro item)
- `null` = sem responsável

Exemplo:
```json
"escala": [
  { "funcao": "Pregador / Ministro", "nome": "Pr. João" },      // índice 0
  { "funcao": "Louvor / Música", "nome": "Maria" },             // índice 1
  { "funcao": "Leitura Bíblica", "nome": "Carlos" }             // índice 2
]

"ordem": [
  {
    "etapa": "Louvor de entrada",
    "min": 15,
    "responsavelIndex": 1  // → Maria (Louvor / Música)
  },
  {
    "etapa": "Leitura Bíblica",
    "min": 5,
    "responsavelIndex": 2  // → Carlos (Leitura Bíblica)
  }
]
```

## 💾 Como Usar

### Opção 1: Arquivo Único
Salve seu arquivo JSON como `eventos.json` e faça upload no painel.

### Opção 2: Array de Múltiplos Eventos
Para inserir vários eventos de uma vez:

```json
[
  {
    "data": "2026-06-22",
    "tipo": "Celebração da Família",
    ...
  },
  {
    "data": "2026-06-23",
    "tipo": "Escola Discipuladora",
    ...
  }
]
```

## ✅ Validações Automáticas

- **Data duplicada**: Se já existe evento com mesmo `data` + `tipo`, será **atualizado**
- **Tipo inválido**: Use um dos 4 tipos: "Celebração da Família", "Escola Discipuladora", "Mini Vigília", "Outro"
- **Responsável fora do range**: Se `responsavelIndex` > quantidade de pessoas, será ignorado
- **Erro de sintaxe**: JSON inválido será rejeitado

## 🎯 Exemplo Completo

```json
[
  {
    "data": "2026-07-05",
    "tipo": "Celebração da Família",
    "hora": "09:00",
    "tema": "Celebrando a Graça",
    "ordem": [
      { "etapa": "Abertura em oração", "min": 3, "responsavelIndex": null },
      { "etapa": "Louvor de entrada", "min": 15, "responsavelIndex": 1 },
      { "etapa": "Avisos", "min": 5, "responsavelIndex": null },
      { "etapa": "Leitura Bíblica", "min": 5, "responsavelIndex": 2 },
      { "etapa": "Mensagem", "min": 40, "responsavelIndex": 0 },
      { "etapa": "Dízimos e Ofertas", "min": 7, "responsavelIndex": 5 },
      { "etapa": "Encerramento", "min": 5, "responsavelIndex": null }
    ],
    "escala": [
      { "funcao": "Pregador / Ministro", "nome": "Pr. João Silva" },
      { "funcao": "Louvor / Música", "nome": "Maria Souza" },
      { "funcao": "Leitura Bíblica", "nome": "Carlos Lima" },
      { "funcao": "Oração Inicial", "nome": "Ana Paula" },
      { "funcao": "Oração Final", "nome": "José Ferreira" },
      { "funcao": "Dízimos e Ofertas", "nome": "Pedro Costa" },
      { "funcao": "Mídias / Projeção", "nome": "Lucas Mendes" },
      { "funcao": "Recepção / Portaria", "nome": "Fernanda Rocha" }
    ]
  }
]
```

## 📞 Suporte

Dúvidas sobre a estrutura? Verifique o arquivo `eventos-template.json` para um exemplo pronto para usar.
