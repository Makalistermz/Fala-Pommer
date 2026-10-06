import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ComunidadesService } from './comunidades.service';

describe('ComunidadesService', () => {
    let service: ComunidadesService;
    let findMany: jest.Mock;
    let create: jest.Mock;

    beforeEach(async () => {
        findMany = jest.fn().mockResolvedValue([]);
        create = jest.fn().mockResolvedValue({});

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ComunidadesService,
                {
                    provide: PrismaService,
                    useValue: {
                        comunidade: {
                            findMany,
                            create
                        }
                    }
                }
            ]
        }).compile();

        service = module.get<ComunidadesService>(ComunidadesService);
    });

    it('persiste a restrição ao criar a comunidade', async () => {
        await service.criarComunidade({
            nome_comunidade: 'Comunidade interna',
            descricao_comunidade: 'Visível apenas para a equipe.',
            ocultar_municipes: true
        });

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    ocultar_municipes: true
                })
            })
        );
    });

    it('oculta comunidades restritas do munícipe', async () => {
        await service.listarComunidade('user');

        expect(findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    ocultar_municipes: false
                }
            })
        );
    });

    it.each(['funcionario', 'admin', 'superAdmin'] as const)(
        'lista todas as comunidades para %s',
        async (tipoUsuario) => {
            await service.listarComunidade(tipoUsuario);

            expect(findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: undefined
                })
            );
        }
    );
});
