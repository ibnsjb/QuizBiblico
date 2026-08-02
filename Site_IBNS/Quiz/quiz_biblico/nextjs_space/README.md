# Quiz Bíblico IBNS 🏆

Painel de Pontuação em Tempo Real para Quiz Bíblico da Igreja Batista Nova Sião.

## 🚀 Como Configurar

### 1. Criar Projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Dê um nome ao projeto (ex: `quiz-biblico-ibns`)
4. Desative o Google Analytics (não é necessário) ou ative se preferir
5. Clique em **"Criar projeto"**

### 2. Ativar Realtime Database

1. No painel do Firebase, clique em **"Build" → "Realtime Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione a região mais próxima (ex: `us-central1`)
4. Escolha **"Iniciar no modo de teste"** (para desenvolvimento)
5. Clique em **"Ativar"**

⚠️ **IMPORTANTE:** Para produção, configure as regras de segurança:
```json
{
  "rules": {
    "sessions": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 3. Obter as Credenciais do Firebase

1. No painel do Firebase, clique no ícone de **engrenagem** → **"Configurações do projeto"**
2. Role até **"Seus apps"** e clique em **"Web"** (ícone `</>`)
3. Registre o app com um apelido (ex: `Quiz Bíblico`)
4. Copie as credenciais exibidas (apiKey, authDomain, etc.)

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quiz-biblico-ibns.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://quiz-biblico-ibns-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quiz-biblico-ibns
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quiz-biblico-ibns.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 5. Deploy na Vercel

1. Faça upload do projeto para o GitHub:
   - Crie um repositório em [github.com/new](https://github.com/new)
   - Envie o código: `git init && git add . && git commit -m "first commit" && git remote add origin URL && git push -u origin main`

2. Conecte à Vercel:
   - Acesse [vercel.com](https://vercel.com) e faça login com o GitHub
   - Clique em **"Add New" → "Project"**
   - Importe o repositório do GitHub
   - Em **"Environment Variables"**, adicione todas as variáveis do `.env.local`
   - Clique em **"Deploy"**

### 6. Configurar Domínio Personalizado (ibnovasiao.com.br)

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione `ibnovasiao.com.br` (e/ou `quiz.ibnovasiao.com.br`)
3. A Vercel mostrará os registros DNS que você precisa configurar:
   - **Tipo A:** `76.76.21.21`
   - **Tipo CNAME:** `cname.vercel-dns.com`
4. Acesse o painel do seu provedor de domínio e configure os registros DNS
5. Aguarde a propagação (pode levar até 48h)

## 🎮 Como Usar

### Modo Público
- Abre automaticamente
- Mostra placar em tempo real
- Ideal para projetar no telão da igreja

### Modo Apresentador
- Clique no ícone ⚙️ no canto superior direito
- Confirme a troca de modo (dupla confirmação)
- Crie sessões, gerencie grupos, marque respostas

### Funcionalidades
- **Sessões:** Crie múltiplas sessões com nome e data
- **Grupos:** Adicione quantos quiser, nomes editáveis
- **Sorteio:** Ordem aleatória dos grupos com animação
- **Rodadas:** Marque acerto ✅ ou erro ❌ para cada grupo
- **Ajudas:** Eliminar Resposta, Ajuda da Igreja, Consultar Bíblia, Dobrar Acerto
- **Desempate:** Mata-mata automático quando há empate
- **Sons:** Efeitos sonoros (ativar/desativar com 🔇)
- **Pontuação progressiva:** Configure faixas de pontos por rodada

## 📱 Compatibilidade

- Desktop (telão da igreja)
- Tablet e celular (apresentador)
- Qualquer navegador moderno
