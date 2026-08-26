# Implementacao de AES-256-GCM no Fala-Pommer

## 1. Objetivo

Esta documentacao descreve como proteger mensagens e anexos armazenados pelo
Fala-Pommer usando AES-256-GCM no backend NestJS.

A solucao foi escolhida porque oferece boa seguranca para dados em repouso e
exige poucas mudancas na aplicacao atual:

- o React continua enviando e recebendo `conteudo` em texto;
- o NestJS criptografa antes de gravar no MySQL;
- o NestJS descriptografa somente depois de validar a autorizacao;
- paginacao, mensagens lidas, digitacao, previa e leitura por voz continuam;
- o hash bcrypt das senhas nao muda.

Esta arquitetura **nao e E2EE**. O backend possui acesso temporario ao texto e a
chave, portanto um comprometimento do processo NestJS pode expor mensagens. Ela
protege principalmente contra copia indevida do banco, backups, snapshots e
acesso direto aos arquivos armazenados.

## 2. Escolha criptografica

| Item | Escolha |
| --- | --- |
| Algoritmo | AES-256-GCM |
| Chave | 32 bytes gerados por CSPRNG |
| IV/nonce | 12 bytes novos para cada operacao |
| Tag | 16 bytes |
| Codificacao do texto | UTF-8 |
| AAD | Identidade imutavel da mensagem e campos de contexto |
| Armazenamento | Colunas binarias do MySQL |
| Chaves | Provedor de segredos/KMS, com versao |

GCM e um modo de criptografia autenticada. Alem de ocultar o conteudo, ele gera
uma tag que detecta alteracao do ciphertext, do IV e dos dados associados.

Regras que nunca podem ser violadas:

1. Nunca reutilizar o mesmo par chave + IV.
2. Nunca ignorar erro de autenticacao na descriptografia.
3. Nunca armazenar a chave junto dos dados cifrados.
4. Nunca registrar chave, plaintext, IV + chave ou buffers descriptografados em
   logs.
5. Nunca criar um algoritmo ou formato criptografico proprietario alem do
   envelope e versionamento descritos aqui.

## 3. Arquitetura

```text
React
  │ JSON { conteudo: "texto" }
  ▼
NestJS
  ├── valida JWT, perfil e acesso a conversa
  ├── obtem chave ativa do provedor seguro
  ├── gera IV aleatorio
  ├── cifra com AES-256-GCM
  └── elimina referencias ao plaintext ao terminar
  │
  ▼
MySQL
  ├── ciphertext
  ├── IV
  ├── tag de autenticacao
  ├── versao da chave
  └── identificador unico/AAD
```

Na leitura, a ordem obrigatoria e:

1. autenticar o usuario;
2. validar acesso a conversa;
3. buscar a mensagem;
4. reconstruir exatamente o mesmo AAD;
5. validar a tag e descriptografar;
6. retornar o texto.

O sistema nunca deve descriptografar uma mensagem antes de verificar a
autorizacao.

## 4. Arquivos que serao criados ou alterados

```text
backend/
├── prisma/schema.prisma
├── src/app.module.ts
├── src/conversas/conversas.module.ts
├── src/conversas/conversas.service.ts
├── src/conversas/conversas.controller.ts       # download autenticado
└── src/criptografia/
    ├── criptografia.module.ts
    ├── criptografia.service.ts
    ├── criptografia.service.spec.ts
    ├── provedor-chave.service.ts
    └── tipos.ts
```

O `src/pages/home.tsx` nao precisa mudar para o texto. Para anexos, a URL muda
para uma rota autenticada, mas a interface pode continuar usando o mesmo objeto
`arquivo`.

## 5. Alteracao no Prisma

### 5.1 Modelo de transicao

Manter `conteudo` temporariamente para dados legados e adicionar campos
binarios opcionais:

```prisma
model mensagem {
  id                       Int                @id @default(autoincrement())
  // Opcional apenas durante a migracao; torna-se obrigatorio apos o backfill.
  uid                      String?            @unique @db.Char(36)
  conversa_id              Int
  remetente_id             Int
  origem                   mensagem_origem

  // Temporario: mensagens anteriores a migracao.
  conteudo                 String?            @db.Text

  conteudo_cifrado         Bytes?             @db.LongBlob
  conteudo_iv              Bytes?             @db.Binary(12)
  conteudo_tag             Bytes?             @db.Binary(16)
  criptografia_algoritmo   String?            @db.VarChar(30)
  criptografia_chave_versao Int?

  enviada_em               DateTime           @default(now()) @db.DateTime(0)

  arquivo_nome             String?            @db.VarChar(255)
  arquivo_url              String?            @db.VarChar(500)
  arquivo_tipo             String?            @db.VarChar(20)
  arquivo_mime             String?            @db.VarChar(150)
  arquivo_tamanho          Int?
  arquivo_iv               Bytes?             @db.Binary(12)
  arquivo_tag              Bytes?             @db.Binary(16)
  arquivo_chave_versao     Int?

  // Relacoes e indices existentes permanecem.
}
```

O Prisma mapeia `Bytes` para `LONGBLOB` por padrao em MySQL. Os campos
de IV e tag possuem tamanho fixo, portanto `Binary(12)` e `Binary(16)` deixam o
contrato explicito.

O phpMyAdmin continua sendo apenas a interface administrativa. Ele nao participa
da criptografia: depois da implementacao, mostrara os campos binarios cifrados.
O `provider = "mysql"` do Prisma e o formato da `DATABASE_URL` permanecem. O
projeto atualmente usa `@prisma/adapter-mariadb`; esse driver e compativel com o
conector MySQL/MariaDB do Prisma, portanto nao precisa ser trocado somente por
causa desta implementacao.

`uid` e gerado pela aplicacao com `randomUUID()` antes da criptografia. Ele e
incluido no AAD e impede que um ciphertext seja transplantado silenciosamente
para outro registro.

### 5.2 Migracao aditiva

Gerar a migracao somente depois de revisar o SQL:

```powershell
cd backend
npx prisma migrate dev --name adicionar_criptografia_mensagens
npx prisma generate
```

Em producao, usar o fluxo de deploy de migracoes do projeto, e nao
`migrate dev`.

Nao tornar os novos campos obrigatorios na primeira migracao. A aplicacao
precisa conseguir ler mensagens legadas enquanto o backfill nao terminou.

## 6. Gestao das chaves

### 6.1 Formato

Uma chave AES-256 possui exatamente 32 bytes. Ela deve ser gerada por um gerador
criptograficamente seguro, nunca por uma senha, CPF, JWT secret ou texto
memorizavel.

Comando apenas para gerar uma chave de desenvolvimento:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

O resultado Base64 representa os 32 bytes; Base64 nao adiciona seguranca.

### 6.2 Desenvolvimento

Durante desenvolvimento local, a chave pode ser fornecida por uma variavel que
nao seja commitada:

```dotenv
MENSAGENS_AES_CHAVE_ATIVA=1
MENSAGENS_AES_CHAVE_V1=<base64-de-32-bytes>
```

O `.gitignore` atual ja ignora `.env`, mas isso nao substitui cuidado com logs,
backups locais, historico do terminal e compartilhamento de tela.

### 6.3 Producao

Usar um provedor como Azure Key Vault, AWS KMS/Secrets Manager, Google Cloud
KMS/Secret Manager, HashiCorp Vault ou HSM. A identidade do servico NestJS deve
ter somente permissao de leitura/uso das versoes necessarias.

O provedor deve expor uma abstracao semelhante a:

```ts
export abstract class ProvedorChaveService {
    abstract obterChave(versao: number): Promise<Buffer>;
    abstract obterVersaoAtiva(): Promise<number>;
}
```

Requisitos do provedor:

- rejeitar chaves que nao tenham 32 bytes;
- manter versoes antigas enquanto houver dados dependentes delas;
- nunca retornar a chave em erros ou logs;
- cache curto em memoria, se necessario;
- limpar buffers com `fill(0)` quando possivel;
- auditar acesso ao cofre;
- falhar fechado quando a chave estiver indisponivel.

Para isolamento maior, pode-se usar criptografia de envelope: uma chave de
dados cifra a conversa ou objeto e uma KEK do KMS protege essa chave. Isso
adiciona complexidade e pode ser uma segunda fase; nao e necessario para a
primeira implementacao segura em um sistema pequeno.

## 7. Formato dos dados associados (AAD)

O AAD nao fica secreto, mas fica autenticado. Alterar qualquer campo autenticado
faz a descriptografia falhar.

Usar uma representacao deterministica, sem JSON com ordem variavel:

```ts
type ContextoMensagem = {
    uid: string;
    conversaId: number;
    remetenteId: number;
    origem: "usuario" | "setor";
};

function criarAadMensagem(contexto: ContextoMensagem): Buffer {
    return Buffer.from(
        [
            "fala-pommer",
            "mensagem",
            "v1",
            contexto.uid,
            contexto.conversaId,
            contexto.remetenteId,
            contexto.origem
        ].join(":"),
        "utf8"
    );
}
```

Depois de cifrada a mensagem, `uid`, `conversa_id`, `remetente_id` e `origem`
passam a ser criptograficamente imutaveis. Se houver necessidade de altera-los,
descriptografar, criar novo AAD, gerar outro IV e criptografar novamente.

## 8. Servico AES-256-GCM

### 8.1 Tipos

```ts
export type EnvelopeCriptografado = {
    algoritmo: "aes-256-gcm";
    chaveVersao: number;
    ciphertext: Buffer;
    iv: Buffer;
    tag: Buffer;
};
```

### 8.2 Implementacao de referencia

```ts
import { Injectable } from "@nestjs/common";
import {
    createCipheriv,
    createDecipheriv,
    randomBytes
} from "node:crypto";

import { ProvedorChaveService } from "./provedor-chave.service";
import { EnvelopeCriptografado } from "./tipos";

const ALGORITMO = "aes-256-gcm";
const TAMANHO_CHAVE = 32;
const TAMANHO_IV = 12;
const TAMANHO_TAG = 16;

@Injectable()
export class CriptografiaService {
    constructor(
        private readonly provedorChave: ProvedorChaveService
    ) {}

    async criptografarTexto(
        texto: string,
        aad: Buffer
    ): Promise<EnvelopeCriptografado> {
        const chaveVersao =
            await this.provedorChave.obterVersaoAtiva();
        const chave =
            await this.provedorChave.obterChave(chaveVersao);

        this.validarChave(chave);

        const iv = randomBytes(TAMANHO_IV);
        const cipher = createCipheriv(ALGORITMO, chave, iv, {
            authTagLength: TAMANHO_TAG
        });

        cipher.setAAD(aad);

        const ciphertext = Buffer.concat([
            cipher.update(texto, "utf8"),
            cipher.final()
        ]);

        const tag = cipher.getAuthTag();

        return {
            algoritmo: ALGORITMO,
            chaveVersao,
            ciphertext,
            iv,
            tag
        };
    }

    async descriptografarTexto(
        envelope: EnvelopeCriptografado,
        aad: Buffer
    ): Promise<string> {
        if (envelope.algoritmo !== ALGORITMO) {
            throw new Error("Algoritmo de criptografia nao suportado.");
        }

        if (
            envelope.iv.length !== TAMANHO_IV ||
            envelope.tag.length !== TAMANHO_TAG
        ) {
            throw new Error("Envelope criptografico invalido.");
        }

        const chave = await this.provedorChave.obterChave(
            envelope.chaveVersao
        );

        this.validarChave(chave);

        const decipher = createDecipheriv(
            ALGORITMO,
            chave,
            envelope.iv,
            { authTagLength: TAMANHO_TAG }
        );

        decipher.setAAD(aad);
        decipher.setAuthTag(envelope.tag);

        const plaintext = Buffer.concat([
            decipher.update(envelope.ciphertext),
            decipher.final()
        ]);

        return plaintext.toString("utf8");
    }

    private validarChave(chave: Buffer) {
        if (chave.length !== TAMANHO_CHAVE) {
            throw new Error(
                "A chave AES-256 deve possuir exatamente 32 bytes."
            );
        }
    }
}
```

`decipher.final()` lanca erro quando ciphertext, AAD, IV, tag ou chave nao
correspondem. Converter isso em uma falha generica interna; nao informar ao
cliente qual parte estava incorreta.

## 9. Integracao no modulo NestJS

Exportar o servico pelo modulo:

```ts
@Module({
    providers: [
        CriptografiaService,
        {
            provide: ProvedorChaveService,
            useClass: ProvedorChaveConfiguracaoService
        }
    ],
    exports: [CriptografiaService]
})
export class CriptografiaModule {}
```

Importar em `ConversasModule`:

```ts
@Module({
    imports: [
        PrismaModule,
        CriptografiaModule
    ],
    controllers: [ConversasController],
    providers: [ConversasService]
})
export class ConversasModule {}
```

## 10. Escrita de mensagens

No metodo `enviarMensagem`, manter validacao, autorizacao e definicao de
`origem`. Antes do `prisma.mensagem.create`:

```ts
const uid = randomUUID();

const aad = criarAadMensagem({
    uid,
    conversaId,
    remetenteId: usuarioLogadoId,
    origem
});

const conteudoCriptografado = conteudoLimpo
    ? await this.criptografia.criptografarTexto(
        conteudoLimpo,
        aad
    )
    : null;
```

Persistencia:

```ts
const mensagem = await this.prisma.mensagem.create({
    data: {
        uid,
        conversa_id: conversaId,
        remetente_id: usuarioLogadoId,
        origem,
        conteudo: null,
        conteudo_cifrado:
            conteudoCriptografado?.ciphertext ?? null,
        conteudo_iv:
            conteudoCriptografado?.iv ?? null,
        conteudo_tag:
            conteudoCriptografado?.tag ?? null,
        criptografia_algoritmo:
            conteudoCriptografado?.algoritmo ?? null,
        criptografia_chave_versao:
            conteudoCriptografado?.chaveVersao ?? null,

        // Campos de arquivo tratados na secao de anexos.
    }
});
```

A resposta da requisicao pode usar `conteudoLimpo`, que ainda esta na memoria,
em vez de ler e descriptografar imediatamente o registro criado.

## 11. Leitura e compatibilidade legada

Centralizar a conversao em um unico metodo. Nao espalhar chamadas criptograficas
por todos os mapeamentos do servico:

```ts
private async obterConteudoMensagem(mensagem: {
    uid: string | null;
    conversa_id: number;
    remetente_id: number;
    origem: "usuario" | "setor";
    conteudo: string | null;
    conteudo_cifrado: Uint8Array | null;
    conteudo_iv: Uint8Array | null;
    conteudo_tag: Uint8Array | null;
    criptografia_algoritmo: string | null;
    criptografia_chave_versao: number | null;
}) {
    if (!mensagem.conteudo_cifrado) {
        return mensagem.conteudo ?? "";
    }

    if (
        !mensagem.uid ||
        !mensagem.conteudo_iv ||
        !mensagem.conteudo_tag ||
        mensagem.criptografia_chave_versao === null
    ) {
        throw new Error("Mensagem criptografada incompleta.");
    }

    const aad = criarAadMensagem({
        uid: mensagem.uid,
        conversaId: mensagem.conversa_id,
        remetenteId: mensagem.remetente_id,
        origem: mensagem.origem
    });

    return this.criptografia.descriptografarTexto(
        {
            algoritmo:
                mensagem.criptografia_algoritmo as "aes-256-gcm",
            chaveVersao:
                mensagem.criptografia_chave_versao,
            ciphertext: Buffer.from(mensagem.conteudo_cifrado),
            iv: Buffer.from(mensagem.conteudo_iv),
            tag: Buffer.from(mensagem.conteudo_tag)
        },
        aad
    );
}
```

Como a funcao e assincrona, os mapeamentos devem usar `Promise.all`:

```ts
return Promise.all(
    mensagensEmOrdemCronologica.map(async (mensagem) => ({
        id: mensagem.id,
        conversaId: mensagem.conversa_id,
        conteudo: await this.obterConteudoMensagem(mensagem),
        // demais campos existentes
    }))
);
```

Todos os `select` que hoje buscam apenas `conteudo` precisam incluir os novos
campos e o contexto do AAD. No servico atual, revisar pelo menos:

- listagem de conversas privadas e ultima mensagem;
- listagem de atendimentos e ultima mensagem;
- resposta de `enviarMensagem`;
- `listarMensagens`;
- testes que criam mocks de `mensagem`.

## 12. Anexos

O backend atual recebe anexos inteiros em memoria, com limite de 25 MB. Para
preservar a arquitetura, a primeira versao pode cifrar o `Buffer` inteiro com
AES-256-GCM antes de `writeFile`.

Adicionar ao `CriptografiaService` equivalentes `criptografarBytes` e
`descriptografarBytes`. Eles usam a mesma construcao GCM, mas recebem e devolvem
`Buffer`; nao converter arquivo binario para UTF-8 ou Base64 durante a cifra.

Usar AAD separado:

```text
fala-pommer:arquivo:v1:<uid>:<conversaId>:<remetenteId>
```

Gravar somente bytes cifrados com nome aleatorio e extensao `.bin`. Guardar IV,
tag e versao nos campos `arquivo_*` da mensagem.

### Download obrigatoriamente autenticado

O caminho `/uploads/chat` nao pode continuar publico, porque o navegador
receberia ciphertext e porque a autorizacao deve ocorrer antes da
descriptografia.

Criar uma rota semelhante a:

```text
GET /conversas/:conversaId/mensagens/:mensagemId/arquivo
```

Fluxo:

1. autenticar JWT;
2. verificar acesso a conversa;
3. confirmar que a mensagem pertence a conversa;
4. ler o `.bin` por caminho resolvido e validado;
5. autenticar/descriptografar com AES-GCM;
6. devolver o MIME original e `Content-Disposition` seguro;
7. nunca incluir o caminho fisico na resposta.

Remover somente a publicacao de `uploads/chat`; fotos de perfil podem manter uma
politica separada. Nao remover globalmente `/uploads` sem analisar os demais
consumidores.

O uso do buffer inteiro e compativel com o limite atual, mas multiplica o uso de
memoria em acessos concorrentes. Se o limite crescer, migrar anexos para
criptografia autenticada em blocos, com IV derivado de forma segura e indice de
bloco autenticado.

## 13. Rotacao de chaves

Rotacao nao significa apagar imediatamente a versao anterior.

Exemplo:

```dotenv
MENSAGENS_AES_CHAVE_ATIVA=2
MENSAGENS_AES_CHAVE_V1=<chave-antiga>
MENSAGENS_AES_CHAVE_V2=<chave-nova>
```

Depois da mudanca:

- novas mensagens usam a versao 2;
- mensagens existentes continuam sendo lidas com a versao registrada;
- um job controlado pode recifrar dados antigos;
- a versao 1 so pode ser removida quando nenhuma linha ou backup depender dela.

Recifrar exige novo IV e nova tag. Nunca reutilizar o IV anterior com a nova
chave por conveniencia.

## 14. Migracao das mensagens existentes

Executar em fases:

### Fase A - leitura dupla

1. adicionar campos opcionais;
2. implantar codigo que le ciphertext quando existe e plaintext como fallback;
3. passar a gravar toda mensagem nova somente cifrada.

### Fase B - backfill

Criar um comando administrativo separado que:

- busca lotes pequenos por `id`;
- ignora linhas ja cifradas;
- gera `uid` quando ausente;
- cifra com a versao ativa;
- grava envelope e define `conteudo = null` na mesma transacao;
- registra apenas IDs e contagens, nunca conteudo;
- pode ser retomado depois de uma falha.

### Fase C - verificacao

- comparar total de linhas legadas e cifradas;
- testar amostras autorizadas;
- confirmar que buscas, previa e paginacao funcionam;
- revisar banco, logs e backups.

### Fase D - limpeza

Depois do prazo de rollback e expiracao dos backups antigos:

- tornar `uid` obrigatorio;
- impedir definitivamente escrita em `conteudo`;
- considerar remover a coluna legada em uma migracao posterior;
- documentar quais backups ainda contem plaintext.

Remover plaintext e backups e uma operacao destrutiva e deve seguir a politica
de retencao da organizacao.

## 15. Tratamento de erros

Para o cliente, retornar uma mensagem generica:

```text
Nao foi possivel ler a mensagem protegida.
```

Internamente, registrar somente:

- ID da mensagem;
- ID da conversa;
- versao da chave solicitada;
- codigo de erro controlado;
- timestamp e correlation ID.

Nao registrar:

- plaintext;
- ciphertext completo;
- chave ou parte dela;
- tag e IV juntos como dump de objeto;
- stack contendo configuracao ou resposta do cofre.

Falha de autenticacao nao deve retornar conteudo parcial. O servico deve falhar
fechado.

## 16. Testes unitarios do servico

Casos obrigatorios:

```ts
it("cifra e recupera texto UTF-8");
it("produz IV diferente para o mesmo texto");
it("rejeita chave que nao possui 32 bytes");
it("rejeita ciphertext alterado");
it("rejeita tag alterada");
it("rejeita IV alterado");
it("rejeita AAD de outra conversa");
it("rejeita versao de chave inexistente");
it("nao retorna plaintext antes de validar a tag");
```

Exemplo de adulteracao:

```ts
const envelope = await servico.criptografarTexto(
    "mensagem",
    Buffer.from("aad")
);

envelope.ciphertext[0] ^= 1;

await expect(
    servico.descriptografarTexto(
        envelope,
        Buffer.from("aad")
    )
).rejects.toThrow();
```

## 17. Testes de integracao

- enviar texto e confirmar que a API devolve o mesmo texto;
- consultar o MySQL pelo phpMyAdmin e confirmar que o texto nao aparece;
- verificar a ultima mensagem nas listas privada e de setor;
- carregar 50 mensagens e paginas anteriores;
- reiniciar o backend e confirmar leitura com a mesma versao de chave;
- trocar a chave ativa e ler mensagens das duas versoes;
- testar mensagem somente com arquivo;
- adulterar um byte no banco e confirmar falha;
- tentar baixar anexo fora da conversa e receber `403`/`404`;
- garantir que `/uploads/chat/...` nao esteja publicamente acessivel;
- confirmar que logs e relatorios de erro nao possuem plaintext.

## 18. Checklist antes da producao

- [ ] Chave de 32 bytes gerada por CSPRNG.
- [ ] Chave fora do repositorio e do banco.
- [ ] IV aleatorio de 12 bytes por operacao.
- [ ] Tag de 16 bytes validada antes de usar plaintext.
- [ ] AAD deterministico e vinculado a mensagem/conversa/remetente.
- [ ] Versao da chave gravada em cada registro.
- [ ] Versoes anteriores preservadas durante rotacao.
- [ ] Escrita nova sem plaintext.
- [ ] Leitura legada temporaria testada.
- [ ] Anexos cifrados e download autenticado.
- [ ] Logs sem mensagens ou chaves.
- [ ] Backups antigos contemplados no plano de retencao.
- [ ] Teste de restauracao de backup e chaves realizado.
- [ ] Acesso ao provedor de chaves auditado.
- [ ] HTTPS obrigatorio.
- [ ] Revisao de seguranca concluida.

## 19. O que nao fazer

```ts
// Errado: chave legivel e tamanho inadequado.
const chave = Buffer.from("minha-senha");

// Errado: IV fixo/reutilizado.
const iv = Buffer.alloc(12);

// Errado: usar o JWT secret como chave AES.
const chave = Buffer.from(process.env.JWT_SECRET!);

// Errado: ignorar falha de autenticacao e devolver parte do texto.
```

Tambem nao usar AES-ECB, AES-CBC sem MAC, 3DES, MD5 ou SHA-1 para esta
finalidade.

## 20. Ordem recomendada de implementacao

1. Criar `CriptografiaModule` e testes unitarios.
2. Adicionar campos opcionais ao Prisma.
3. Integrar somente texto em `enviarMensagem` e `listarMensagens`.
4. Atualizar todas as previas de ultima mensagem.
5. Executar testes e inspecionar o banco.
6. Implantar leitura dupla/escrita cifrada atras de feature flag.
7. Cifrar anexos e criar download autenticado.
8. Executar backfill das mensagens legadas.
9. Rotacionar uma chave em ambiente de homologacao.
10. Auditar logs, backups e permissoes do cofre.
11. Ativar em producao gradualmente.
12. Remover plaintext legado somente depois do periodo de rollback.

## 21. Referencias

- [NIST SP 800-38D: GCM e GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final)
- [Node.js Crypto: Cipheriv, AAD e authentication tag](https://nodejs.org/api/crypto.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [Prisma: tipos nativos MySQL/MariaDB e Bytes](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference#bytes)
- [Google Cloud: envelope encryption, DEK e KEK](https://docs.cloud.google.com/kms/docs/envelope-encryption)

## 22. Resultado esperado

Depois da implementacao, uma consulta direta ao MySQL, inclusive pelo
phpMyAdmin, nao deve revelar o
texto das mensagens. O contrato HTTP para o frontend continua praticamente
igual, porque a criptografia fica encapsulada no backend. A indisponibilidade
ou remocao indevida de uma versao de chave torna as mensagens correspondentes
irrecuperaveis; por isso backup de dados, backup de configuracao do cofre e
teste de restauracao devem ser tratados como uma unica operacao.
