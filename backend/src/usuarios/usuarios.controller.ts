import { Body, Controller, Post } from "@nestjs/common";

@Controller('usuarios')
export class UsuariosController {
    @Post()
    cadastrar(@Body() dados: Record<string, unknown>) {
        console.log("Campos recebidos:", Object.keys(dados));

        return {
            mensagem: "Dados recebidos pelo backend com sucesso.",
        };
    }
}
