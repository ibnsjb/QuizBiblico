import { NextResponse } from 'next/server';

const csv = `pergunta,opcao_a,opcao_b,opcao_c,opcao_d,correta,tempo
Qual tecnologia permite identificar padrões em grandes volumes de dados?,Blockchain,Inteligência Artificial,Cabo coaxial,Impressora térmica,B,20
Em uma central de operações qual recurso auxilia na visualização geográfica de ocorrências?,GIS/SIG,Editor de texto,Compilador,Planilha offline,A,20
Qual princípio é essencial no tratamento de dados pessoais em sistemas de segurança pública?,Coleta ilimitada,Ausência de logs,Finalidade e necessidade,Compartilhamento irrestrito,C,25
Em videomonitoramento inteligente o reconhecimento automático deve ser usado com atenção especial a quê?,Somente resolução do monitor,Vieses privacidade e governança,Cor do gabinete,Marca do teclado,B,25
Qual recurso ajuda a manter evidências digitais verificáveis durante uma investigação?,Cadeia de custódia e logs,Renomear arquivos manualmente,Excluir metadados,Usar contas compartilhadas,A,20`;

export async function GET() {
  return new NextResponse(`\ufeff${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="modelo-perguntas-techseg.csv"',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
