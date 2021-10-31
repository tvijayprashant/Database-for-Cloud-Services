\c cloud_management
DROP FUNCTION check_zone_quota;
CREATE OR REPLACE FUNCTION CHECK_ZONE_QUOTA (
    ZONE_NAME_ VARCHAR(30),
    RAM INT,
    GPU GPU_FAMILY,
    DISK DISK_FAMILY,
    MACHINE VARCHAR(30)
)
RETURNS CHAR(4) 
language plpgsql
AS
$$
DECLARE 
    d_DISK DISK_FAMILY;
    d_GPU GPU_FAMILY;
    d_MACHINE MACHINE_FAMILY;
    d_RAM RAM_FAMILY;
    d_ram_blk CHAR(4);
BEGIN     
    d_ram_blk:='0000';

    select (DISK_AVAILABLE).HDD into d_DISK.HDD from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (DISK_AVAILABLE).SSD into d_DISK.SSD from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (DISK_AVAILABLE).BALANCED into d_DISK.BALANCED from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

    select (RAM_AVAILABLE).blk1 into d_RAM.blk1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (RAM_AVAILABLE).blk2 into d_RAM.blk2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (RAM_AVAILABLE).blk3 into d_RAM.blk3 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (RAM_AVAILABLE).blk4 into d_RAM.blk4 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

    select (GPU_AVAILABLE).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (GPU_AVAILABLE).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (GPU_AVAILABLE).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (GPU_AVAILABLE).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (GPU_AVAILABLE).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

    select (MACHINE_TYPE_AVAILABLE).A2 into d_MACHINE.A2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (MACHINE_TYPE_AVAILABLE).N1 into d_MACHINE.N1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (MACHINE_TYPE_AVAILABLE).N2 into d_MACHINE.N2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (MACHINE_TYPE_AVAILABLE).C2 into d_MACHINE.C2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
    select (MACHINE_TYPE_AVAILABLE).EC2 into d_MACHINE.EC2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

    if ((GPU).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
        (GPU).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
        (GPU).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
        (GPU).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
        (GPU).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
            -- raise notice 'MACHINE : %',MACHINE;
            -- raise notice 'd_MACHINE : %',(d_MACHINE).N1;
            if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or 
                (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or 
                (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or 
                (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or 
                (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU).NVIDIA_TESLA_A100 <> 0))) THEN 
                    if (((DISK).HDD <= (d_DISK).HDD) and 
                        ((DISK).SSD <= (d_DISK).SSD) and 
                        ((DISK).BALANCED <= (d_DISK).BALANCED)) THEN
                            if (RAM <= (d_RAM).blk1) THEN
                                d_ram_blk:='blk1';
                            elseif (RAM <= (d_RAM).blk2) THEN
                                d_ram_blk:='blk2';
                            elseif (RAM <= (d_RAM).blk3) THEN
                                d_ram_blk:='blk3';
                            elseif (RAM <= (d_RAM).blk4) THEN
                                d_ram_blk:='blk4';
                            else
                                d_ram_blk:='0000';
                            END IF;
                    END IF;
            END IF;
    END IF;
    RETURN d_ram_blk;
END;
$$;

 -- UPDATE PROJECT set 
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU).NVIDIA_TESLA_A100,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU).NVIDIA_TESLA_V100,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU).NVIDIA_TESLA_K80,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU).NVIDIA_TESLA_P4,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU).NVIDIA_TESLA_T4;

-- if (MACHINE='N1') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N1 = (d_MACHINE).N1 - 1;
-- END IF;
-- if (MACHINE='N2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N2 = (d_MACHINE).N2 - 1;
-- END IF;
-- if (MACHINE='EC2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.EC2 = (d_MACHINE).EC2 - 1;
-- END IF;
-- if (MACHINE='C2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.C2 = (d_MACHINE).C2 - 1;
-- END IF;
-- if (MACHINE='A2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.A2 = (d_MACHINE).A2 - 1;
-- END IF;

-- UPDATE PROJECT set quotas.Z1.DISK.HDD = (d_DISK).HDD - (DISK).HDD,
-- quotas.Z1.DISK.SSD = (d_DISK).SSD - (DISK).SSD,
-- quotas.Z1.DISK.BALANCED = (d_DISK).BALANCED - (DISK).BALANCED;

--  BEGIN
        
--     INSERT INTO VM values(VM_ID,NAME,BOOT_DISK,"Stopped",PREEMPTIBILITY,d_internal_ip,d_external_ip,d_HOST_NAME,NETWORK_TAG,d_SUBNET,NULL,d_rack_id,ZONE_NAME,PROJECT_ID,RAM,GPU,DISK,MACHINE);
--     INSERT INTO RUNTIME values(VM_ID,DATE_, 0.00, 0.00, 0.00, 0.00, '00:00:00', '00:00:00');
--     INSERT INTO MONITORS values (DATE_, VM_ID, (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),(0.0,0.0,0.0,0.0,0.0));
--     INSERT INTO ACCESS values (VM_ID,USER_ID);

-- END;

-- UPDATE PROJECT set 
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU).NVIDIA_TESLA_A100,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU).NVIDIA_TESLA_V100,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU).NVIDIA_TESLA_K80,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU).NVIDIA_TESLA_P4,
-- quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU).NVIDIA_TESLA_T4;

-- if (MACHINE='N1') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1;
-- END IF;
-- if (MACHINE='N2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1;
-- END IF;
-- if (MACHINE='EC2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1;
-- END IF;
-- if (MACHINE='C2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1;
-- END IF;
-- if (MACHINE='A2') THEN
--     UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1;
-- END IF;

-- UPDATE PROJECT set quotas.Z1.DISK.HDD = (d_DISK).HDD - (DISK).HDD,
-- quotas.Z1.DISK.SSD = (d_DISK).SSD - (DISK).SSD,
-- quotas.Z1.DISK.BALANCED = (d_DISK).BALANCED - (DISK).BALANCED;

-- BEGIN

--     INSERT INTO VM values(VM_ID,NAME,BOOT_DISK,"Stopped",PREEMPTIBILITY,d_internal_ip,d_external_ip,d_HOST_NAME,NETWORK_TAG,d_SUBNET,NULL,d_rack_id,ZONE_NAME,PROJECT_ID,RAM,GPU,DISK,MACHINE);
--     INSERT INTO RUNTIME values(VM_ID,DATE_, 0.00, 0.00, 0.00, 0.00, '00:00:00', '00:00:00');
--     INSERT INTO MONITORS values (DATE_, VM_ID, (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),(0.0,0.0,0.0,0.0,0.0));
--     INSERT INTO ACCESS values (VM_ID,USER_ID);

-- END;