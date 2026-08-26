# Criptografia ponta a ponta no Fala-Pommer

## 1. Decisao tecnica

A melhor opcao para o Fala-Pommer e usar o `matrix-js-sdk` com o mecanismo
criptografico Rust/WASM do Matrix no frontend e manter o NestJS/Prisma como
camada de negocio.

Essa escolha atende conversas privadas, atendimentos de setor e futuros grupos
sem criar um protocolo criptografico proprio. O SDK ja trata dispositivos,
mensagens assincronas, rotacao de sessoes, verificacao, cross-signing e backup
criptografado de chaves.

O AES continua fazendo parte da protecao em camadas, mas nao deve ser aplicado
manualmente a cada mensagem no backend. Um algoritmo simetrico isolado nao
resolve distribuicao e rotacao de chaves, dispositivos novos, revogacao,
mensagens fora de ordem ou recuperacao.

### Alternativas descartadas

| Alternativa | Motivo |
| --- | --- |
| 3DES | Algoritmo legado, retirado pelo NIST para novas operacoes de protecao desde 2024. |
| AES com uma chave global | O vazamento de uma chave comprometeria todos os usuarios e o servidor conseguiria ler tudo. |
| AES por conversa, implementado manualmente | Ainda exigiria construir distribuicao, verificacao, rotacao e recuperacao de chaves. |
| MLS/OpenMLS diretamente no navegador | O protocolo e excelente, mas o alvo WASM do OpenMLS ainda aparece como compilado, porem nao oficialmente testado/suportado. |
| libsignal no React | O binding TypeScript oficial do libsignal e voltado a Node nativo, nao ao navegador Vite. |
| Apenas criptografia no banco | Protege contra uma copia isolada do banco, mas nao e ponta a ponta. |

## 2. Objetivo de seguranca

Depois da migracao, o navegador do remetente deve cifrar o conteudo antes do
envio. O servidor Matrix, o NestJS, o Prisma, administradores de infraestrutura
e uma copia do banco nao devem possuir as chaves privadas necessarias para ler
as mensagens.

O sistema deve proteger:

- texto, nome original e tipo de anexos;
- integridade e autenticidade das mensagens;
- mensagens antigas contra comprometimento posterior de chaves, dentro das
  garantias oferecidas pelo protocolo;
- mensagens futuras depois da remocao e rotacao de um dispositivo;
- historico sincronizado entre dispositivos autorizados.

E2EE nao protege contra:

- malware ou extensao maliciosa no dispositivo;
- XSS executado na mesma origem do chat;
- capturas de tela ou copia feita pelo destinatario;
- metadados inevitaveis, como horario, tamanho aproximado e frequencia;
- um participante autorizado que decida divulgar a mensagem.

## 3. Decisao obrigatoria sobre fiscalizacao

O comportamento atual permite que um `superAdmin` fiscalize certas conversas
sem ser participante. Isso e incompatível com E2EE privada.

Antes da implementacao, deve ser adotada uma destas politicas:

1. **Privacidade real:** somente dispositivos dos participantes recebem chaves.
2. **Auditor explicito:** um dispositivo institucional aparece visivelmente
   como membro da conversa e recebe as chaves.
3. **Custodia institucional:** a organizacao mantem uma chave de recuperacao.
   Nesse caso, a funcionalidade deve ser apresentada como criptografia com
   custodia, e nao como E2EE contra o operador.

A recomendacao e a primeira politica. Para atendimentos que legalmente exigem
auditoria, usar a segunda e mostrar isso de forma clara na interface.

## 4. Arquitetura de destino

```text
React/Vite
├── matrix-js-sdk
├── Rust Crypto em WebAssembly
├── estado criptografico local em IndexedDB
├── verificacao de dispositivos
└── criptografia e descriptografia de mensagens/anexos
             │
             │ eventos cifrados sobre HTTPS
             ▼
Homeserver Matrix privado
├── entrega e sincronizacao
├── armazenamento de eventos cifrados
├── armazenamento de midia cifrada
└── nunca recebe as chaves privadas dos clientes

NestJS + Prisma/MariaDB
├── usuarios, perfis e 2FA
├── setores e autorizacao de negocio
├── associacao conversa <-> sala Matrix
├── provisionamento controlado de salas e membros
└── auditoria de metadados, sem conteudo das mensagens
```

O homeserver deve ser privado, sem federacao, salvo se existir um requisito
explicito de comunicacao com outros servidores Matrix.

## 5. Pre-requisitos de infraestrutura

### Desenvolvimento

- Homeserver Synapse isolado.
- PostgreSQL para o Synapse; SQLite apenas em teste local.
- HTTPS no frontend, NestJS e Synapse.
- Reverse proxy separando as rotas publicas das APIs administrativas.
- CORS restrito ao dominio real do frontend.
- Backups criptografados e politica de retencao.

### Producao

- Fixar uma versao suportada da imagem oficial do Synapse.
- Atualizacoes de seguranca programadas.
- API administrativa do Synapse inacessivel pela internet publica.
- Segredos administrativos em um secret manager, nunca no bundle Vite.
- PostgreSQL dedicado ao Synapse.
- Monitoramento sem registrar corpos de mensagens ou chaves.

O nome do servidor Matrix deve ser decidido antes da implantacao, pois compoe
identificadores como `@usuario:chat.exemplo.gov.br` e nao e simples altera-lo
depois.

## 6. Autenticacao

### Solucao recomendada

Usar um provedor OIDC central para que Fala-Pommer e Synapse reconhecam a mesma
identidade. O fluxo fica:

```text
Usuario -> provedor OIDC -> Fala-Pommer
                       └-> Synapse/Matrix
```

O identificador interno imutavel do cadastro deve ser usado para formar ou
mapear o Matrix User ID. Nao usar nome ou e-mail como chave primaria, pois eles
podem mudar.

### O que nao fazer

- Nao entregar token administrativo do Synapse ao navegador.
- Nao usar o endpoint administrativo "login as user" como login normal; ele e
  uma funcao de impersonacao administrativa e nao cria um dispositivo visivel.
- Nao armazenar token Matrix ou JWT em `localStorage`.
- Nao reutilizar a senha do Fala-Pommer como chave de criptografia.

O token de sessao da aplicacao deve migrar para cookie
`HttpOnly; Secure; SameSite=Strict`. O material criptografico do Matrix fica no
armazenamento criptografico do SDK, normalmente IndexedDB.

## 7. Dependencias do frontend

Instalacao planejada, depois que o homeserver de desenvolvimento existir:

```powershell
npm install matrix-js-sdk
```

Nao instalar bibliotecas nao oficiais que prometem "AES simples para chat" ou
forks abandonados do Signal Protocol.

## 8. Estrutura sugerida no frontend

```text
src/
├── matrix/
│   ├── client.ts
│   ├── MatrixProvider.tsx
│   ├── autenticacao.ts
│   ├── conversas.ts
│   ├── mensagens.ts
│   ├── anexos.ts
│   └── verificacao.ts
├── pages/home.tsx
└── components/
    ├── EstadoCriptografia.tsx
    ├── VerificarDispositivo.tsx
    └── ConfigurarRecuperacao.tsx
```

Deve existir exatamente uma instancia ativa de `MatrixClient` por armazenamento
IndexedDB. A pilha Rust Crypto nao e thread-safe para duas instancias usando o
mesmo banco local.

### Inicializacao conceitual

```ts
import * as sdk from "matrix-js-sdk";

export async function criarClienteMatrix(sessao: {
    baseUrl: string;
    accessToken: string;
    userId: string;
    deviceId: string;
}) {
    const cliente = sdk.createClient({
        baseUrl: sessao.baseUrl,
        accessToken: sessao.accessToken,
        userId: sessao.userId,
        deviceId: sessao.deviceId
    });

    await cliente.initRustCrypto();
    await cliente.startClient({ initialSyncLimit: 20 });

    return cliente;
}
```

Esse trecho e um esqueleto. O fluxo definitivo deve aguardar o estado de sync,
tratar logout e evitar duas abas criando clientes concorrentes para o mesmo
IndexedDB.

## 9. Alteracoes no Prisma

### Cadastro

Adicionar a associacao imutavel com a conta Matrix:

```prisma
model cadastro {
  // campos existentes
  matrix_user_id String? @unique @db.VarChar(255)
}
```

### Conversa

Adicionar a sala criptografada correspondente:

```prisma
model conversa {
  // campos existentes
  matrix_room_id String? @unique @db.VarChar(255)
  e2ee_ativa     Boolean @default(false)
  e2ee_ativada_em DateTime?
}
```

Durante a migracao, `e2ee_ativa` diferencia conversas legadas das novas. Depois
da remocao completa do transporte antigo, o campo pode deixar de ser necessario.

### Mensagem

No desenho recomendado, o Synapse passa a armazenar os eventos; a tabela
`mensagem` nao deve duplicar ciphertext sem uma justificativa de negocio.
Leitura, IDs de eventos e paginacao passam a vir do Matrix.

Se for necessario correlacionar um evento com auditoria operacional, armazenar
somente:

```prisma
model mensagem_referencia {
  matrix_event_id String   @id @db.VarChar(255)
  conversa_id    Int
  criada_em       DateTime @default(now())
}
```

Nao copiar corpo, nome do arquivo ou chave para essa tabela.

## 10. Alteracoes no NestJS

Criar um modulo de integracao:

```text
backend/src/matrix/
├── matrix.module.ts
├── matrix-provisioning.service.ts
├── matrix-conversations.service.ts
└── matrix.controller.ts
```

Responsabilidades:

- provisionar/desativar a identidade Matrix ligada ao cadastro;
- criar uma sala privada e criptografada para cada conversa;
- convidar ou remover membros de acordo com as regras do Fala-Pommer;
- salvar `matrix_room_id` e `matrix_user_id`;
- nunca receber ou registrar chaves privadas;
- nunca descriptografar eventos.

As rotas administrativas do Synapse devem ser chamadas apenas pelo backend em
rede privada. O token administrativo deve ficar em secret manager e possuir o
menor privilegio possivel.

### Codigo existente afetado

- `backend/src/conversas/conversas.service.ts`: deixa de criar e listar o corpo
  de mensagens; passa a criar salas e aplicar membros.
- `backend/src/conversas/conversas.controller.ts`: as rotas antigas de mensagem
  ficam atras de feature flag durante a migracao e depois sao removidas.
- `backend/prisma/schema.prisma`: recebe os identificadores Matrix e o estado de
  migracao.
- `src/pages/home.tsx`: troca o polling das mensagens por eventos/timeline do
  Matrix, preservando a interface visual.
- `backend/src/main.ts`: deixa de publicar anexos de chat diretamente em
  `/uploads`.

Cadastro, perfis, 2FA, setores e autorizacao administrativa nao precisam ser
reescritos integralmente.

## 11. Criacao de conversas

### Conversa privada

1. NestJS valida que o usuario pode iniciar a conversa.
2. NestJS garante que os dois cadastros possuem identidades Matrix.
3. O servico cria uma sala privada, sem federacao e sem acesso de convidados.
4. Habilita criptografia antes da primeira mensagem.
5. Convida os usuarios autorizados.
6. Grava o `matrix_room_id` na conversa.
7. O frontend sincroniza a sala e envia eventos pelo SDK.

### Atendimento de setor

Ha duas politicas possiveis:

- adicionar todos os funcionarios autorizados como membros; ou
- adicionar somente o funcionario que assumir o atendimento.

A segunda reduz a exposicao e e recomendada. Trocar o responsavel exige remover
o anterior e adicionar o novo. O protocolo rotaciona a sessao para mensagens
futuras, mas nao pode fazer um antigo destinatario esquecer conteudo que ja
recebeu.

## 12. Envio e leitura

O `home.tsx` nao deve mais enviar `{ conteudo }` para o NestJS. Ele solicita o
`matrix_room_id`, encontra a sala no `MatrixClient` e envia um evento. Em sala
configurada corretamente, o SDK cifra antes da transmissao.

Fluxo:

```text
Formulario -> evento Matrix -> Rust Crypto -> ciphertext -> Synapse
Synapse -> ciphertext -> Rust Crypto -> evento legivel -> React
```

Antes do envio, bloquear a acao se:

- a sala ainda nao confirmou a configuracao de criptografia;
- houve mudanca de identidade nao reconhecida;
- a politica exigir dispositivos verificados e existir destinatario nao
  verificado;
- o SDK estiver sem armazenamento persistente.

Previa da ultima mensagem, busca e leitura por voz acontecem no cliente depois
da descriptografia. O backend deixa de montar `ultimaMensagem.conteudo`.

## 13. Anexos

O arquivo deve ser cifrado no cliente antes de ser enviado ao armazenamento de
midia. Nome original, MIME e dimensoes sensiveis ficam no evento criptografado.

Requisitos:

- limite de tamanho antes e depois da cifra;
- nome opaco no servidor;
- download autenticado;
- verificacao criptografica antes de renderizar;
- `Content-Disposition: attachment` para formatos perigosos;
- URLs temporarias de objeto revogadas depois do uso;
- nunca inserir HTML/SVG recebido diretamente no DOM.

Como o servidor nao ve o arquivo original, antivirus central deixa de ser
possivel sem enfraquecer a E2EE. Isso precisa constar no modelo de ameacas e na
politica de upload.

## 14. Dispositivos, verificacao e recuperacao

Cada perfil de navegador e um dispositivo criptografico.

### Primeiro dispositivo

1. Inicializar Rust Crypto.
2. Configurar cross-signing.
3. Criar armazenamento secreto e backup de chaves.
4. Mostrar a recovery key uma unica vez.
5. Exigir confirmacao de que ela foi guardada.

### Novo dispositivo

- verificar com um dispositivo existente por QR/SAS; ou
- usar a recovery key para recuperar o material autorizado.

### Dispositivo perdido

- revogar a sessao;
- remover o dispositivo das conversas conforme a politica;
- rotacionar sessoes;
- avisar os participantes sobre mudanca de identidade quando aplicavel.

Redefinir a senha da conta nao deve restaurar silenciosamente as chaves. Sem um
dispositivo verificado ou recovery key, o historico pode se tornar
irrecuperavel. Essa e uma propriedade esperada de E2EE real.

## 15. Endurecimento obrigatorio do frontend

E2EE no navegador depende fortemente da seguranca do JavaScript entregue.
Antes de ativar a funcionalidade em producao:

- migrar JWT de `localStorage` para cookie HttpOnly;
- aplicar CSP estrita, inicialmente em modo report-only;
- impedir `eval`, scripts inline e origens de terceiros desnecessarias;
- avaliar Trusted Types;
- revisar usos de `innerHTML` e renderizacao de anexos;
- fixar dependencias e revisar atualizacoes do SDK criptografico;
- servir tudo exclusivamente por HTTPS;
- impedir cache de respostas sensiveis;
- nao carregar analytics de terceiros na origem do chat.

Uma chave `CryptoKey` nao extraivel reduz exposicao acidental, mas um XSS na
mesma origem ainda pode pedir ao navegador que use a chave. Por isso CSP e
prevencao de XSS sao parte do sistema criptografico.

## 16. Migracao

### Fase 0 - politica e ameacas

- decidir fiscalizacao e custodia;
- aprovar modelo de ameacas;
- definir retencao e recuperacao;
- escolher dominio Matrix definitivo.

### Fase 1 - laboratorio

- subir Synapse privado com PostgreSQL;
- criar dois usuarios e dois dispositivos;
- testar texto, arquivo, dispositivo offline e troca de navegador;
- comprovar no banco/rede que o servidor recebe apenas eventos cifrados.

### Fase 2 - integracao

- criar modulo Matrix no NestJS;
- adicionar `matrix_user_id` e `matrix_room_id`;
- criar provider Matrix no React;
- integrar conversas privadas atras de feature flag.

### Fase 3 - setores e anexos

- aplicar politica de responsavel por atendimento;
- implementar troca/revogacao de funcionarios;
- substituir `/uploads/chat` por midia cifrada e autenticada;
- implementar verificacao de dispositivos e recovery key.

### Fase 4 - historico legado

- mostrar mensagens existentes como "legadas, sem E2EE";
- nao afirmar que recifrar apaga o fato de o servidor ja ter visto o original;
- definir prazo para remocao de plaintext e backups antigos;
- bloquear criacao de novas mensagens no formato antigo.

### Fase 5 - auditoria e ativacao

- testes de seguranca e revisao independente;
- piloto com usuarios internos;
- monitorar falhas de descriptografia sem registrar conteudo;
- tornar E2EE padrao somente depois dos criterios de aceite.

## 17. Testes obrigatorios

### Funcionais

- conversa privada em dois navegadores;
- usuario offline recebendo depois;
- duas abas sem corromper o armazenamento;
- mensagens fora de ordem e duplicadas;
- anexos em todos os formatos permitidos;
- paginacao e marcacao de leitura;
- texto para voz depois da descriptografia.

### Ciclo de chaves

- primeiro dispositivo;
- novo dispositivo verificado;
- novo dispositivo nao verificado;
- recovery key correta e incorreta;
- dispositivo perdido e revogado;
- entrada e saida de funcionario do setor;
- troca de identidade e reinstalacao.

### Seguranca

- banco do Synapse sem plaintext;
- MariaDB sem plaintext e sem chaves;
- logs, erros e telemetria sem plaintext;
- adulteracao de ciphertext rejeitada;
- usuario fora da conversa sem acesso a midia;
- `superAdmin` sem acesso oculto;
- CSP bloqueando script nao autorizado;
- logout removendo tokens e encerrando a instancia do cliente.

## 18. Criterios de aceite

A funcionalidade somente pode ser chamada de E2EE quando:

- uma captura do trafego mostra apenas eventos cifrados;
- uma copia dos bancos nao permite ler mensagens;
- o NestJS nao possui chave mestra de mensagens;
- administradores nao leem conteudo sem serem membros explicitos;
- anexos tambem estao cifrados;
- novos dispositivos exigem verificacao ou recovery key;
- remover um membro impede acesso a mensagens futuras;
- mensagens adulteradas sao rejeitadas;
- a interface comunica dispositivos e estado de verificacao;
- uma revisao independente nao encontrou falha critica pendente.

## 19. Referencias primarias

- [Matrix JavaScript SDK e inicializacao do Rust Crypto](https://github.com/matrix-org/matrix-js-sdk/blob/develop/README.md)
- [Matrix Rust Crypto para WebAssembly](https://github.com/matrix-org/matrix-sdk-crypto-wasm)
- [Guia de implementacao E2EE do Matrix](https://matrix.org/docs/matrix-concepts/end-to-end-encryption/)
- [Instalacao atual do Synapse](https://element-hq.github.io/synapse/latest/setup/installation.html)
- [Configuracao OIDC do Synapse](https://matrix-org.github.io/synapse/latest/usage/configuration/config_documentation.html#oidc_providers)
- [RFC 9420 - Messaging Layer Security](https://datatracker.ietf.org/doc/html/rfc9420)
- [RFC 9750 - Arquitetura MLS](https://datatracker.ietf.org/doc/html/rfc9750)
- [Signal Double Ratchet](https://signal.org/docs/specifications/doubleratchet/)
- [OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [NIST: retirada do 3DES](https://csrc.nist.gov/pubs/sp/800/67/r2/final)

## 20. Proxima entrega recomendada

Antes de alterar a tela de chat, criar uma prova de conceito isolada contendo:

1. Synapse privado local;
2. dois usuarios de teste;
3. `matrix-js-sdk` inicializado com Rust Crypto;
4. uma sala privada criptografada;
5. envio e leitura de texto em navegadores diferentes;
6. evidencia de que o banco do servidor contem somente ciphertext;
7. teste de perda e recuperacao do dispositivo.

Depois dessa validacao, a integracao deve ser feita atras de feature flag para
nao interromper as conversas existentes.
