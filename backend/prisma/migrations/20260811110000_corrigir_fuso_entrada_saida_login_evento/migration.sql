UPDATE `login_evento`
SET `criado_em` = DATE_SUB(`criado_em`, INTERVAL 3 HOUR)
WHERE `criado_em` >= (
    SELECT `finished_at`
    FROM `_prisma_migrations`
    WHERE `migration_name` = '20260810130000_corrigir_fuso_historico_login'
);

UPDATE `login_evento`
SET `saiu_em` = DATE_SUB(`saiu_em`, INTERVAL 3 HOUR)
WHERE `saiu_em` IS NOT NULL;
