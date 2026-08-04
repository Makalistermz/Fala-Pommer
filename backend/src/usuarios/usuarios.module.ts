import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsuariosService],
  exports: [UsuariosService],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
