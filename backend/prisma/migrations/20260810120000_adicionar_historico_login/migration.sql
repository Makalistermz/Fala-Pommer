CREATE TABLE `login_evento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_login_evento_usuario`(`usuario_id`),
    INDEX `idx_login_evento_criado_em`(`criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `login_evento`
    ADD CONSTRAINT `fk_login_evento_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `cadastro`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT;
