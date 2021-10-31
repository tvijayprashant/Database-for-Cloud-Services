\c cloud_management;
DROP FUNCTION DELETE_VM;
CREATE OR REPLACE FUNCTION DELETE_VM (
    VM_ID_ CHAR(10),
    USER_ID_ CHAR(10)
)
RETURNS INT
LANGUAGE plpgsql
AS
$$
DECLARE
    ACCESS_ INT;
    d_DISK DISK_FAMILY;
    d_GPU GPU_FAMILY;
    d_MACHINE VARCHAR(30);
    d_RAM INT;
    d_rack_id CHAR(10);
    d_PREEMPT BOOLEAN;
    d_blk char(4);
    d_zone varchar(30);
    d_success int;
    -- d_user_project int;
    -- d_vmid char(10);
BEGIN
    d_success := 0;
    SElECT COUNT(*) INTO ACCESS_ FROM ACCESS WHERE VM_ID = VM_ID_ AND USER_ID = USER_ID_;
    IF(ACCESS_ = 1) THEN 
        SELECT RACK_ID INTO d_rack_id FROM VM WHERE VM_ID = VM_ID_;
        SELECT PREEMPTIBILITY INTO d_PREEMPT FROM VM WHERE VM_ID = VM_ID_;
        SELECT ZONE_NAME INTO d_zone FROM VM WHERE VM_ID = VM_ID_;
        SELECT RAM INTO d_RAM FROM VM WHERE VM_ID = VM_ID_;
        SELECT MACHINE INTO d_MACHINE FROM VM WHERE VM_ID = VM_ID_; 

        select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 FROM VM WHERE VM_ID = VM_ID_;
        select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 FROM VM WHERE VM_ID = VM_ID_;
        select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 FROM VM WHERE VM_ID = VM_ID_;
        select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 FROM VM WHERE VM_ID = VM_ID_;
        select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 FROM VM WHERE VM_ID = VM_ID_; 
        

        select (DISK).HDD into d_DISK.HDD FROM VM WHERE VM_ID = VM_ID_;
        select (DISK).SSD into d_DISK.ssd FROM VM WHERE VM_ID = VM_ID_;
        select (DISK).balanced into d_DISK.balanced FROM VM WHERE VM_ID = VM_ID_;
        SELECT substring(d_rack_id,0,5) INTO d_blk;

        DELETE FROM MONITORS WHERE VM_ID = VM_ID_;
        DELETE FROM RUNTIME WHERE VM_ID = VM_ID_;
        DELETE FROM ACCESS WHERE VM_ID = VM_ID_;
        DELETE FROM VM WHERE VM_ID = VM_ID_;

        UPDATE HARDWARE set RAM = d_RAM + RAM;

        UPDATE HARDWARE SET 
            DISK.HDD = (DISK).HDD + (d_DISK).HDD,
            DISK.SSD = (DISK).SSD + (d_DISK).SSD,
            DISK.BALANCED = (DISK).BALANCED + (d_DISK).BALANCED;
        

        if (d_MACHINE='N1') THEN
            UPDATE HARDWARE set MACHINE_FAMILY.N1 = (MACHINE_FAMILY).N1 + 1;
        elseif (d_MACHINE='N2') THEN
            UPDATE HARDWARE set MACHINE_FAMILY.N2 = (MACHINE_FAMILY).N2 + 1;
        elseif (d_MACHINE='EC2') THEN
            UPDATE HARDWARE set MACHINE_FAMILY.EC2 = (MACHINE_FAMILY).EC2 + 1;
        elseif (d_MACHINE='C2') THEN
            UPDATE HARDWARE set MACHINE_FAMILY.C2 = (MACHINE_FAMILY).C2 + 1;
        elseif (d_MACHINE='A2') THEN
            UPDATE HARDWARE set MACHINE_FAMILY.A2 = (MACHINE_FAMILY).A2 + 1;
        END IF;

        UPDATE HARDWARE set 
            GPU.NVIDIA_TESLA_A100=(GPU).NVIDIA_TESLA_A100 + (d_GPU).NVIDIA_TESLA_A100,
            GPU.NVIDIA_TESLA_V100=(GPU).NVIDIA_TESLA_V100 + (d_GPU).NVIDIA_TESLA_V100,
            GPU.NVIDIA_TESLA_K80=(GPU).NVIDIA_TESLA_K80 + (d_GPU).NVIDIA_TESLA_K80,
            GPU.NVIDIA_TESLA_P4=(GPU).NVIDIA_TESLA_P4  + (d_GPU).NVIDIA_TESLA_P4,
            GPU.NVIDIA_TESLA_T4=(GPU).NVIDIA_TESLA_T4 + (d_GPU).NVIDIA_TESLA_T4;

        UPDATE ZONE set 
            GPU_AVAILABLE.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100 + (GPU_AVAILABLE).NVIDIA_TESLA_A100,
            GPU_AVAILABLE.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100 + (GPU_AVAILABLE).NVIDIA_TESLA_V100,
            GPU_AVAILABLE.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80 + (GPU_AVAILABLE).NVIDIA_TESLA_K80,
            GPU_AVAILABLE.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4 + (GPU_AVAILABLE).NVIDIA_TESLA_P4,
            GPU_AVAILABLE.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4 + (GPU_AVAILABLE).NVIDIA_TESLA_T4;
        -- raise notice 'updating disk zone quota';

        UPDATE ZONE set 
            DISK_AVAILABLE.HDD=(d_DISK).HDD + (DISK_AVAILABLE).HDD,
            DISK_AVAILABLE.SSD=(d_DISK).SSD + (DISK_AVAILABLE).SSD,
            DISK_AVAILABLE.BALANCED=(d_DISK).BALANCED + (DISK_AVAILABLE).BALANCED;
        -- raise notice 'updating machine zone quota';
        
        if (d_MACHINE='N1') THEN
            UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N1 = (MACHINE_TYPE_AVAILABLE).N1 + 1;
        elseif (d_MACHINE='N2') THEN
            UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N2 = (MACHINE_TYPE_AVAILABLE).N2 + 1;
        elseif (d_MACHINE='EC2') THEN
            UPDATE ZONE set MACHINE_TYPE_AVAILABLE.EC2 = (MACHINE_TYPE_AVAILABLE).EC2 + 1;
        elseif (d_MACHINE='C2') THEN
            UPDATE ZONE set MACHINE_TYPE_AVAILABLE.C2 = (MACHINE_TYPE_AVAILABLE).C2 + 1;
        elseif (d_MACHINE='A2') THEN
            UPDATE ZONE set MACHINE_TYPE_AVAILABLE.A2 = (MACHINE_TYPE_AVAILABLE).A2 + 1;
        END IF;

        -- raise notice 'updating ram zone quota';

        if (d_blk LIKE 'blk1') THEN
            UPDATE ZONE set RAM_AVAILABLE.BLK1 = d_RAM + (RAM_AVAILABLE).BLK1;
        elseif (d_blk LIKE 'blk2') THEN
            UPDATE ZONE set RAM_AVAILABLE.BLK2 = d_RAM + (RAM_AVAILABLE).BLK2;
        elseif (d_blk LIKE 'blk3') THEN
            UPDATE ZONE set RAM_AVAILABLE.BLK3 = d_RAM + (RAM_AVAILABLE).BLK3;
        elseif (d_blk LIKE 'blk4') THEN
            UPDATE ZONE set RAM_AVAILABLE.BLK4 = d_RAM + (RAM_AVAILABLE).BLK3;
        END IF;

        if (d_zone ='us-central-a') THEN
            UPDATE PROJECT set 
                quotas.Z1.DISK.HDD = (d_DISK).HDD - (((quotas).Z1).DISK).HDD,
                quotas.Z1.DISK.SSD = (d_DISK).SSD - (((quotas).Z1).DISK).SSD,
                quotas.Z1.DISK.BALANCED = (d_DISK).BALANCED - (((quotas).Z1).DISK).BALANCED;


            if (d_PREEMPT = TRUE) THEN
                UPDATE PROJECT set 
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100 + (((quotas).Z1).GPU_PREMPT).NVIDIA_TESLA_A100,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100 + (((quotas).Z1).GPU_PREMPT).NVIDIA_TESLA_V100,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80 + (((quotas).Z1).GPU_PREMPT).NVIDIA_TESLA_K80,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4 + (((quotas).Z1).GPU_PREMPT).NVIDIA_TESLA_P4,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4 + (((quotas).Z1).GPU_PREMPT).NVIDIA_TESLA_T4;

                if (d_MACHINE='N1') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N1 = (((quotas).Z1).MACHINE_FAMILY_PREMPT).N1 + 1;
                elseif (d_MACHINE='N2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N2 = (((quotas).Z1).MACHINE_FAMILY_PREMPT).N2 + 1;
                elseif (d_MACHINE='EC2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.EC2 = (((quotas).Z1).MACHINE_FAMILY_PREMPT).EC2 + 1;
                elseif (d_MACHINE='C2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.C2 = (((quotas).Z1).MACHINE_FAMILY_PREMPT).C2 + 1;
                elseif (d_MACHINE='A2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.A2 = (((quotas).Z1).MACHINE_FAMILY_PREMPT).A2 + 1;
                END IF;
                
            ELSE
                UPDATE PROJECT set 
                    quotas.Z1.GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100 + (((quotas).Z1).GPU).NVIDIA_TESLA_A100,
                    quotas.Z1.GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100 + (((quotas).Z1).GPU).NVIDIA_TESLA_V100,
                    quotas.Z1.GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80 + (((quotas).Z1).GPU).NVIDIA_TESLA_K80,
                    quotas.Z1.GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4 + (((quotas).Z1).GPU).NVIDIA_TESLA_P4,
                    quotas.Z1.GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4 + (((quotas).Z1).GPU).NVIDIA_TESLA_T4;

                if (MACHINE='N1') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N1 = (((quotas).Z1).MACHINE_FAMILY).N1 + 1;
                elseif (MACHINE='N2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N2 = (((quotas).Z1).MACHINE_FAMILY).N2 + 1;
                elseif (MACHINE='EC2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.EC2 = (((quotas).Z1).MACHINE_FAMILY).EC2 + 1;
                elseif (MACHINE='C2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.C2 = (((quotas).Z1).MACHINE_FAMILY).C2 + 1;
                elseif (MACHINE='A2') THEN
                    UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.A2 = (((quotas).Z1).MACHINE_FAMILY).A2 + 1;
                END IF;
            END IF;
        END IF;
        d_success :=1;
    END IF; 

RETURN d_success;
END;
$$;