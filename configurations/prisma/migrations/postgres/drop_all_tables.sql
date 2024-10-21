DO $$ DECLARE
    r RECORD;
BEGIN
    -- Disable foreign key checks
    EXECUTE 'SET CONSTRAINTS ALL DEFERRED';

    -- Drop all tables in the current schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Re-enable foreign key checks
    EXECUTE 'SET CONSTRAINTS ALL IMMEDIATE';
END $$;

