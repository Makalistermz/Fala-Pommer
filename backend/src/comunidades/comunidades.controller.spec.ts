import { Test, TestingModule } from '@nestjs/testing';
import {
    AuthGuard,
    type RequisicaoAutenticada
} from '../auth/auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';

describe('ComunidadesController', () => {
    let controller: ComunidadesController;
    let listarComunidade: jest.Mock;

    beforeEach(async () => {
        listarComunidade = jest.fn().mockResolvedValue([]);

        const moduloTeste = Test.createTestingModule({
            controllers: [ComunidadesController],
            providers: [
                {
                    provide: ComunidadesService,
                    useValue: {
                        listarComunidade
                    }
                }
            ]
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(PerfisGuard)
            .useValue({ canActivate: () => true });

        const module: TestingModule = await moduloTeste.compile();

        controller = module.get<ComunidadesController>(ComunidadesController);
    });

    it('encaminha o perfil autenticado para a listagem', async () => {
        const requisicao = {
            usuario: {
                tipo: 'user'
            }
        } as RequisicaoAutenticada;

        await controller.listarComunidade(requisicao);

        expect(listarComunidade).toHaveBeenCalledWith('user');
    });
});
