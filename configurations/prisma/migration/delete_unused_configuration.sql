DELETE FROM `Owner`
WHERE NOT EXISTS (
    SELECT 1 FROM `Configuration`
    WHERE `Configuration`.id = `Owner`.configurationId
);
