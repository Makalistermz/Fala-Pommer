// Define quais perfis podem acessar uma rota.
import { SetMetadata } from "@nestjs/common";

export type TipoUsuario =
    | "user"
    | "admin"
    | "funcionario";

export const PERFIS_KEY = "perfis";

export const Perfis = (...perfis: TipoUsuario[]) =>
    SetMetadata(PERFIS_KEY, perfis);
