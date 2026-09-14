// Registra os recursos usados no módulo de conversas.
import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { NotificacoesModule } from "../notificacoes/notificacoes.module";
import { ConversasController } from "./conversas.controller";
import { ConversasService } from "./conversas.service";

@Module({
    imports: [
        PrismaModule,
        NotificacoesModule
    ],

    controllers: [
        ConversasController
    ],

    providers: [
        ConversasService
    ]
})
export class ConversasModule {}
