import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { ConversasController } from "./conversas.controller";
import { ConversasService } from "./conversas.service";

@Module({
    imports: [
        PrismaModule
    ],

    controllers: [
        ConversasController
    ],

    providers: [
        ConversasService
    ]
})
export class ConversasModule {}