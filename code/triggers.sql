\c cloud_management;
CREATE OR REPLACE FUNCTION insert_delete_project()
RETURNS TRIGGER
language plpgsql
AS
$$
BEGIN 

    IF  (TG_OP = 'INSERT') THEN
        INSERT INTO WORKED_ON VALUES (NEW.PROJECT_ID, NEW.USER_ID);
    ELSEIF (TG_OP = 'DELETE') THEN
        DELETE FROM WORKED_ON WHERE PROJECT_ID = OLD.PROJECT_ID;
    END IF;
END;
$$;

CREATE TRIGGER on_project_update AFTER INSERT OR DELETE ON PROJECT FOR EACH ROW EXECUTE PROCEDURE insert_delete_project();