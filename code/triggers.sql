\c cloud_management;
CREATE OR REPLACE FUNCTION insert_runtime()
RETURNS TRIGGER
language plpgsql
AS
$$
BEGIN 

    ALter table moniters set cpu_runtime = cpu_runtime + NEW.cpu_runtime where vm_id = NEW.vm_id;
END;
$$;

CREATE TRIGGER on_project_update AFTER INSERT ON RUNTIME FOR EACH ROW EXECUTE PROCEDURE insert_runtime();