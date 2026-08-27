import { Module } from '@nestjs/common';
import { SecretariaController } from './secretaria.controller';

@Module({
  controllers: [SecretariaController]
})
export class SecretariaModule {}
