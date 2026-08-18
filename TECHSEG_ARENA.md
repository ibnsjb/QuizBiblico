# TechSeg Arena — Tecnologia na Segurança Pública

Aplicação de quiz competitivo em tempo real, publicada como uma rota independente do projeto existente.

## Rotas

- Participantes / administração: `/seguranca-tech/`
- Modelo CSV: `/seguranca-tech/modelo-perguntas.csv`

## Arquitetura

- Frontend: HTML5, CSS responsivo e JavaScript, servido pelo projeto Next.js/Vercel existente.
- Backend: Supabase Postgres + Realtime.
- Segurança: RLS habilitado; operações sensíveis são realizadas por RPCs `SECURITY DEFINER` com token administrativo temporário. Senhas são armazenadas somente como hash bcrypt.
- Realtime: atualizações de sessão, participantes, contagem de respostas e eliminação de alternativas.
- Auditoria: cada resposta registra timestamps de início, deadline, recebimento pelo servidor, timestamp informado pelo cliente, tempo de resposta em ms, acerto, pontos base, bônus de velocidade e pontos finais.

## Fluxo do administrador

1. Entrar no console administrativo com a senha definida no banco.
2. Criar uma sessão e definir o tempo padrão por pergunta.
3. Importar o CSV de perguntas.
4. Aguardar os participantes entrarem pelo código de seis caracteres.
5. Iniciar cada pergunta e acompanhar a contagem regressiva e o número de respostas recebidas.
6. Opcionalmente remover/restaurar uma alternativa incorreta durante a pergunta ativa.
7. Encerrar a pergunta ou avançar para a próxima.
8. Finalizar a sessão para liberar o placar geral.
9. Exportar o relatório CSV de auditoria.

## Formato CSV

Cabeçalho obrigatório:

```csv
pergunta,opcao_a,opcao_b,opcao_c,opcao_d,correta,tempo
```

- `pergunta`: enunciado exibido somente ao administrador.
- `opcao_a` a `opcao_d`: textos completos exibidos somente ao administrador.
- `correta`: uma letra `A`, `B`, `C` ou `D`.
- `tempo`: opcional por pergunta; quando vazio, usa o tempo padrão da sessão. Faixa suportada: 5 a 180 segundos.

Para o participante, a tela mostra somente `Pergunta N` e quatro botões grandes A/B/C/D.

## Pontuação

- Resposta incorreta: 0 pontos.
- Resposta correta: 1000 pontos base.
- Bônus de velocidade: até 500 pontos, reduzido linearmente ao longo do tempo disponível.
- O tempo oficial é calculado no PostgreSQL usando o timestamp de recebimento no servidor, evitando dependência do relógio local do navegador.
- O banco aceita no máximo uma resposta por participante/pergunta.

## Banco de dados

Objetos principais usam prefixo `ts_` para isolamento dentro do projeto Supabase existente:

- `ts_sessions`
- `ts_questions`
- `ts_participants`
- `ts_answers`
- `ts_eliminated_options`
- `ts_events`
- `ts_admin_settings`
- `ts_admin_tokens`

## Observações operacionais

- O participante pode alterar o nome somente enquanto a sessão está no lobby.
- Não é permitida entrada após o início da sessão.
- Respostas enviadas após o deadline do servidor são rejeitadas.
- Alternativas eliminadas pelo administrador são rejeitadas também no backend, não apenas escondidas na interface.
- A sessão do administrador expira automaticamente; a senha pode ser trocada pelo RPC administrativo de alteração de senha.
