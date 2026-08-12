ALTER TABLE `cadastro`
    ADD COLUMN `setor_id` INTEGER NULL,
    ADD INDEX `fk_cadastro_setor` (`setor_id`);

ALTER TABLE `cadastro`
    ADD CONSTRAINT `fk_cadastro_setor`
    FOREIGN KEY (`setor_id`) REFERENCES `setores` (`id`)
    ON DELETE SET NULL ON UPDATE RESTRICT;
