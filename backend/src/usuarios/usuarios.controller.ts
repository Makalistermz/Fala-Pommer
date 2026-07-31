import { Body, Controller, Post } from "@nestjs/common";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";

@Controller('usuarios')
export class UsuariosController {
    @Post()
    cadastrar(@Body() dados: CriarUsuarioDto) {
        console.log("Campos recebidos:", Object.keys(dados));

        return {
            mensagem: "Dados recebidos pelo backend com sucesso.",
        };
    }
}
