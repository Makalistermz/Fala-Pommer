import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RecuperacaoSenhaModule } from './recuperacao-senha/recuperacao-senha.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [PrismaModule, UsuariosModule, RecuperacaoSenhaModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
