// Inicializa e configura a API do sistema.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Disponibiliza os arquivos enviados pela rota /uploads.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Permite requisições do frontend local e da rede interna.
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? "http://localhost:5173",
      "http://192.168.103.81:5173",
    ],
    credentials: true
  });

  // Valida e transforma os dados recebidos pela API.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true,
    }),
  );

  // Aceita conexões de outros dispositivos da rede.
  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
