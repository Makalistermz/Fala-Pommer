ALTER TABLE `comunidade_usuarios`
    MODIFY `tipo_funcao` ENUM('seguidor', 'membro', 'admin') NOT NULL DEFAULT 'membro';
