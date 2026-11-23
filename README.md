<p align="center">
  <img src="assets/logo.png" alt="Logo do Fala Pommer" width="140" />
</p>

<h1 align="center">Fala Pommer</h1>

<p align="center">
  <strong>Plataforma de comunicação.</strong><br />
  Conversas privadas, grupos, comunidades, para Web e Android.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-em%20desenvolvimento-1351B4" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white" />
  <img alt="Capacitor" src="https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white" />
  <img alt="Licença MIT" src="https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg" />
</p>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Perfis de acesso](#perfis-de-acesso)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Começando](#começando)
- [Aplicativo Android](#aplicativo-android)
- [Scripts](#scripts)
- [Segurança](#segurança)
- [Status do projeto](#status-do-projeto)
- [Autor](#autor)
- [Licença](#licença)

## Sobre o projeto

O **Fala Pommer** é uma plataforma de comunicação pensada para o ambiente público municipal. Ela reúne, em um só lugar, **conversas privadas, grupos e comunidades**, além do **atendimento por setor**, no qual o cidadão fala diretamente com a área responsável, acompanha a resposta, envia documentos e avalia o atendimento ao final.

Os funcionários vinculados a cada setor respondem às conversas de atendimento, e os administradores acompanham indicadores, usuários e histórico de ações, de acordo com o seu nível de permissão.

A interface segue o modelo dos aplicativos de mensagens, que as pessoas já conhecem, e está disponível no navegador (desktop, tablet e celular) e como aplicativo Android.

## Funcionalidades

### Conversas, grupos e comunidades

- Conversas privadas entre usuários e grupos com nome;
- comunidades com chat próprio, categorias, foto e controle de visibilidade;
- mensagens de texto, áudios e anexos (documentos, planilhas, imagens, vídeos e PDFs);
- resposta a mensagens específicas, indicador de não lidas e estado de digitação;
- pesquisa e filtro de conversas;
- notificações push para novas mensagens.

### Atendimento por setor

- O cidadão inicia um atendimento com o setor responsável;
- os funcionários do setor respondem e podem transferir a conversa para outro setor;
- encerramento do atendimento e **avaliação pelo cidadão**, com acompanhamento das médias.

### Conta e autenticação

- Cadastro e login com e-mail e senha ou com a conta Google;
- recuperação de senha por e-mail;
- verificação em duas etapas por e-mail, com códigos de recuperação;
- sessões persistentes, com encerramento e revogação imediata;
- login por biometria no aplicativo Android;
- foto de perfil.

### Administração

- Dashboard com indicadores e gráficos;
- gestão de usuários ativos e desativados, com registro do motivo;
- histórico de ações administrativas (auditoria);
- relatórios de login e de erros de autenticação;
- gerenciamento de secretarias e setores;
- acompanhamento das avaliações e das médias de atendimento.

### Experiência e acessibilidade

- Interface responsiva, com temas claro e escuro;
- alto contraste e texto ampliado;
- navegação com apoio de áudio;
- personalização do plano de fundo das conversas;
- animações com GSAP e rolagem suave com Lenis.

## Perfis de acesso

| Perfil                 | Responsabilidade                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Cidadão** (`user`)   | Inicia atendimentos, troca mensagens com os setores e avalia as conversas finalizadas. |
| **Funcionário**        | Atende às conversas do setor ao qual está vinculado.                                   |
| **Administrador**      | Gerencia e acompanha os recursos da sua secretaria.                                    |
| **Superadministrador** | Acessa a área administrativa geral, os relatórios e a auditoria do sistema.            |

## Tecnologias

| Camada         | Stack                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Frontend**   | React 19, TypeScript, Vite, React Router, Chart.js, GSAP, Lenis, Google OAuth, LiveKit             |
| **Mobile**     | Capacitor (Android), Firebase Cloud Messaging, autenticação biométrica                             |
| **Backend**    | Node.js, NestJS 11, TypeScript, Prisma ORM 7, JWT, bcrypt, Nodemailer, Firebase Admin              |
| **Banco**      | MySQL / MariaDB                                                                                    |
| **Qualidade**  | Oxlint, testes unitários e e2e (Jest)                                                              |

## Estrutura do repositório

```
Fala-Pommer/
├── android/                 # Projeto Android gerado pelo Capacitor
├── assets/                  # Recursos gerais e identidade visual
├── backend/
│   ├── prisma/
│   │   ├── migrations/      # Histórico de migrações do banco
│   │   └── schema.prisma    # Modelagem dos dados
│   └── src/
│       ├── auth/            # Login, sessões, permissões e 2FA
│       ├── comunidades/     # Chats de comunidade
│       ├── conversas/       # Conversas, mensagens e avaliações
│       ├── criptografia/    # Criptografia do conteúdo das mensagens
│       ├── notificacoes/    # Registro e envio de notificações push
│       ├── recuperacao-senha/
│       ├── secretaria/
│       ├── setores/
│       └── usuarios/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── library/             # Recursos de interface e acessibilidade
│   ├── pages/               # Telas da aplicação
│   └── services/            # API, sessão, biometria e notificações
├── capacitor.config.ts
├── package.json
└── vite.config.ts
```

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior e npm;
- [MySQL](https://www.mysql.com/) ou MariaDB;
- Git.

Para gerar ou executar o aplicativo Android, também são necessários o JDK 21 e o Android Studio com o Android SDK.

### 1. Clone e instale as dependências

```bash
git clone https://github.com/Makalistermz/Fala-Pommer.git
cd Fala-Pommer

# frontend
npm install

# backend
cd backend
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo **`.env`** na raiz do projeto (frontend):

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=seu_client_id_google
```

Crie o arquivo **`backend/.env`**:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/fala_pommer"
JWT_SECRET="substitua_por_uma_chave_longa_e_aleatoria"
MESSAGE_ENCRYPTION_KEY="chave_base64_de_32_bytes"

FRONTEND_URL=http://localhost:5173
PORT=3000
GOOGLE_CLIENT_ID=seu_client_id_google

SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=usuario_smtp
SMTP_PASSWORD=senha_smtp
```

Gere a `MESSAGE_ENCRYPTION_KEY` **uma única vez**. Ela deve ser uma chave aleatória de 32 bytes em Base64:

```bash
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64'))"
```

> **Importante:** guarde essa chave em um gerenciador de segredos em produção e use o mesmo valor em todas as instâncias do backend. Se ela for perdida ou alterada, as mensagens já criptografadas não poderão ser recuperadas.

As **notificações push são opcionais**. Para ativá-las, configure uma credencial padrão do Google ou informe:

```env
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_CLIENT_EMAIL=conta_de_servico
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Prepare o banco de dados

Com o banco criado e o `backend/.env` configurado, dentro da pasta `backend`:

```bash
npx prisma generate
npx prisma migrate deploy
```

Para criar novas migrações durante o desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_migracao
```

### 4. Execute

Abra dois terminais.

```bash
# Terminal 1: API em http://localhost:3000
cd backend
npm run start:dev
```

```bash
# Terminal 2: frontend em http://localhost:5173 (na raiz do repositório)
npm run dev
```

## Aplicativo Android

Gere a versão Web e sincronize o projeto Android:

```bash
npm run android
npx cap open android
```

Para gerar um APK de teste pelo Gradle (Windows):

```bash
cd android
.\gradlew.bat assembleDebug
```

O arquivo será criado em `android/app/build/outputs/apk/debug/app-debug.apk`. Sempre que alterar o frontend, execute `npm run android` novamente antes de gerar um novo APK.

## Scripts

**Frontend** (raiz)

| Comando             | Descrição                                         |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Inicia o servidor Vite.                           |
| `npm run build`     | Valida o TypeScript e gera a versão de produção.  |
| `npm run lint`      | Executa o Oxlint.                                 |
| `npm run preview`   | Visualiza localmente o build de produção.         |
| `npm run android`   | Gera o frontend e sincroniza o Capacitor Android. |

**Backend** (`backend/`)

| Comando                | Descrição                                   |
| ---------------------- | ------------------------------------------- |
| `npm run start:dev`    | Inicia a API com recarregamento automático. |
| `npm run build`        | Compila o projeto NestJS.                   |
| `npm run start:prod`   | Executa a versão compilada.                 |
| `npm run test`         | Executa os testes unitários.                |
| `npm run test:e2e`     | Executa os testes de ponta a ponta.         |
| `npm run test:cov`     | Gera o relatório de cobertura.              |

## Segurança

O projeto lida com dados de cidadãos, então a segurança é tratada como requisito. Hoje o sistema conta com:

- senhas armazenadas com hash (bcrypt);
- access token de curta duração, com renovação por refresh token em cookie `HttpOnly` na Web e armazenamento seguro no Android;
- verificação em duas etapas por e-mail e revogação imediata de sessões;
- controle de acesso por perfis em todas as rotas autenticadas;
- validação e filtragem dos dados recebidos pela API;
- conteúdo das mensagens criptografado no banco de dados;
- registros de auditoria e relatórios de erros de autenticação.

**Boas práticas ao contribuir ou implantar**

- Nunca versione arquivos `.env`, chaves privadas ou credenciais de serviço. Eles já estão no `.gitignore`.
- Use valores longos e aleatórios para `JWT_SECRET` e `MESSAGE_ENCRYPTION_KEY`, e guarde-os em um gerenciador de segredos.
- Se algum segredo for publicado por engano, **gere um novo e revogue o antigo**. Apagar o arquivo do repositório não é suficiente, porque o valor continua no histórico do Git.
- Em produção, restrinja as origens do CORS e as chaves de API do Firebase e do Google ao seu domínio e ao seu aplicativo.

**Encontrou uma vulnerabilidade?** Não abra uma issue pública. Entre em contato diretamente com o autor pelo [perfil no GitHub](https://github.com/Makalistermz) para que o problema possa ser corrigido antes de ser divulgado.

## Status do projeto

O Fala Pommer está **em desenvolvimento**. Funcionalidades, regras de acesso e instruções de implantação podem mudar conforme o sistema evolui.

## Autor

Desenvolvido por [Makalister Mutz Zager](https://github.com/Makalistermz).

## Licença

Distribuído sob a licença [MIT](LICENSE).
