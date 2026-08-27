# Continuidade do Placar do Quiz Bíblico

## Estado
Implementacao concluida e publicada no repositorio.

## Requisitos atendidos
- Rodadas exibidas como `Rodada 1`, `Rodada 2` etc.
- Ajudas configuraveis de zero ate o total habilitado.
- Faixas de pontuacao encadeadas automaticamente.
- Pontuacao padrao configuravel, padrao de 10 pontos.
- Pontuacao vigente exibida no painel administrativo.
- Grupo atual centralizado automaticamente.
- Rodadas extras para empatados com ajudas zeradas.
- Consulta a Biblia com contador configuravel, padrao de 30 segundos.
- Placar geral final grande na visao publica.
- Logo azul IBNS aplicado.
- Limpar remove grupos, placar, ajudas, ordem e desempates.
- Novo grupo criado por modal.

## Validacao
- Diagnosticos dos arquivos alterados sem erros.
- Build de producao executado com sucesso.
- Push realizado para `origin/main`.

## Proxima retomada
Validar manualmente no navegador os fluxos com Firebase real.

## Ajuste de layout em andamento
- [x] Planejar modal operacional centralizado para o grupo da vez.
- [x] Criar modal com rodada, nome, pontuacao, valor da rodada, acerto, erro, ajudas e timer.
- [x] Abrir automaticamente o modal ao iniciar e ao avancar para o proximo grupo.
- [x] Adicionar retorno `Visao geral` para fechar o modal e consultar todos os grupos.
- [x] Compactar o modal para caber em desktop e mobile sem rolagem interna.
- [ ] Validar visualmente em viewport desktop e mobile com Firebase real.

## Nova etapa: visao publica e temas
- [x] Exibir pontos e ajudas por rodada na visao publica.
- [x] Destacar pontuacao dobrada na visao publica.
- [x] Persistir o contador de Consultar Biblia para administrador e publico.
- [x] Aplicar tema individual por sessao.
- [x] Garantir logo apontando para `/placar`.
- [x] Validar compilacao e tipagem da implementacao.

## Registro da etapa de visao publica
- Tema armazenado dentro da configuracao de cada sessao, com fallback `ocean`.
- Temas disponiveis: Oceano, Floresta e Amanhecer.
- Logo do topo aponta para `/placar` usando caminho relativo.
- Expiracao de Consultar Biblia persistida no grupo para sincronizar administrador e publico.
- Visao publica mostra contador destacado, pontos por rodada, valor base, ajudas usadas e indicacao de pontuacao dobrada.
- Build de producao executado com sucesso apos a implementacao.
- Pendente: teste manual com duas sessoes Firebase usando temas diferentes e contador ativo.
