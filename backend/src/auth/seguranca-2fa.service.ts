import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITMO = 'aes-256-gcm';
const VERSAO_FORMATO = 'v1';
const CONTEXTO_AUTENTICADO = Buffer.from('fala-pommer:totp-secret:v1', 'utf8');
const TAMANHO_CHAVE_BYTES = 32;
const TAMANHO_IV_BYTES = 12;
const TAMANHO_TAG_BYTES = 16;
const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class Seguranca2faService {
  private readonly chaveCriptografia: Buffer;

  constructor(private readonly configService: ConfigService) {
    const chaveConfigurada = this.configService.getOrThrow<string>(
      'TOTP_ENCRYPTION_KEY',
    );
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (jwtSecret && chaveConfigurada === jwtSecret) {
      throw new Error('TOTP_ENCRYPTION_KEY deve ser diferente de JWT_SECRET.');
    }

    this.chaveCriptografia = this.decodificarChave(chaveConfigurada);
  }

  criptografarSegredoTotp(segredo: string): string {
    if (!segredo) {
      throw new Error('O segredo TOTP não pode ser vazio.');
    }

    const iv = randomBytes(TAMANHO_IV_BYTES);
    const cipher = createCipheriv(ALGORITMO, this.chaveCriptografia, iv, {
      authTagLength: TAMANHO_TAG_BYTES,
    });

    cipher.setAAD(CONTEXTO_AUTENTICADO);

    const textoCifrado = Buffer.concat([
      cipher.update(segredo, 'utf8'),
      cipher.final(),
    ]);
    const tagAutenticacao = cipher.getAuthTag();

    return [
      VERSAO_FORMATO,
      iv.toString('base64url'),
      textoCifrado.toString('base64url'),
      tagAutenticacao.toString('base64url'),
    ].join(':');
  }

  descriptografarSegredoTotp(valorCriptografado: string): string {
    try {
      const [versao, ivCodificado, textoCodificado, tagCodificada, extra] =
        valorCriptografado.split(':');

      if (
        versao !== VERSAO_FORMATO ||
        !ivCodificado ||
        !textoCodificado ||
        !tagCodificada ||
        extra !== undefined
      ) {
        throw new Error();
      }

      const iv = Buffer.from(ivCodificado, 'base64url');
      const textoCifrado = Buffer.from(textoCodificado, 'base64url');
      const tagAutenticacao = Buffer.from(tagCodificada, 'base64url');

      if (
        iv.length !== TAMANHO_IV_BYTES ||
        textoCifrado.length === 0 ||
        tagAutenticacao.length !== TAMANHO_TAG_BYTES
      ) {
        throw new Error();
      }

      const decipher = createDecipheriv(ALGORITMO, this.chaveCriptografia, iv, {
        authTagLength: TAMANHO_TAG_BYTES,
      });

      decipher.setAAD(CONTEXTO_AUTENTICADO);
      decipher.setAuthTag(tagAutenticacao);

      return Buffer.concat([
        decipher.update(textoCifrado),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new Error(
        'O segredo TOTP criptografado é inválido ou foi adulterado.',
      );
    }
  }

  async gerarHashCodigoRecuperacao(codigo: string): Promise<string> {
    if (!codigo) {
      throw new Error('O código de recuperação não pode ser vazio.');
    }

    return bcrypt.hash(codigo, BCRYPT_SALT_ROUNDS);
  }

  async verificarCodigoRecuperacao(
    codigo: string,
    codigoHash: string,
  ): Promise<boolean> {
    if (!codigo || !codigoHash) {
      return false;
    }

    return bcrypt.compare(codigo, codigoHash);
  }

  private decodificarChave(chaveCodificada: string): Buffer {
    const valor = chaveCodificada.trim();
    const chave = Buffer.from(valor, 'base64');
    const base64Canonico = chave.toString('base64').replace(/=+$/, '');

    if (
      chave.length !== TAMANHO_CHAVE_BYTES ||
      base64Canonico !== valor.replace(/=+$/, '')
    ) {
      throw new Error(
        'TOTP_ENCRYPTION_KEY deve conter exatamente 32 bytes codificados em Base64.',
      );
    }

    return chave;
  }
}
