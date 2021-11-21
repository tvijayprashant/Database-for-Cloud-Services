\c cloud_management;
DROP FUNCTION CHECK_RACK_QUOTA;
CREATE OR REPLACE FUNCTION CHECK_RACK_QUOTA (
    PROJECT_ID_ CHAR(12),
    ZONE_NAME_ VARCHAR(30),
    RAM_ INT,
    GPU_ GPU_FAMILY,
    DISK_ DISK_FAMILY,
    MACHINE VARCHAR(30)
)
RETURNS CHAR(10) 
language plpgsql
AS
$$
DECLARE 
    d_DISK DISK_FAMILY;
    d_GPU GPU_FAMILY;
    d_MACHINE MACHINE_FAMILY;
    d_RAM int;
    d_ram_blk CHAR(4);
    d_rack_id CHAR(10);
    d_offset int;
    flag1 int;
    flag2 int;
    d_spatial CHAR(10);
    d_sub_rack_id CHAR(10);
    d_partial_blk char(4);
BEGIN 
    d_rack_id:='0000000000';
    flag1 := 1;
    d_offset:=0;
    select CHECK_ZONE_QUOTA(ZONE_NAME_,RAM_,GPU_,DISK_,MACHINE) into d_ram_blk;
    if (d_ram_blk not LIKE '0000') THEN
        raise notice 'executed zone function';
        WHILE (flag1=1) LOOP 
            select HARDWARE.RACK_ID into d_spatial from VM,HARDWARE where VM.PROJECT_ID=PROJECT_ID_ and HARDWARE.ZONE_NAME=ZONE_NAME_ and HARDWARE.RACK_ID LIKE '%' || d_ram_blk || '%' ORDER BY RACK_ID DESC LIMIT 1 OFFSET d_offset;
            if (d_spatial is NULL) THEN
                select concat('blk',(substring(d_ram_blk,4)::int)+1) into d_ram_blk;
                select RACK_ID into d_spatial from HARDWARE where HARDWARE.ZONE_NAME = ZONE_NAME_ and HARDWARE.RACK_ID LIKE '%' || d_ram_blk || '%' ORDER BY RACK_ID LIMIT 1 OFFSET d_offset ;
                raise notice 'd_ram_blk %', d_ram_blk;
                d_offset:=0;
                if (substring(d_ram_blk,4)::int > 4) THEN
                    flag1:=0;
                END IF;
                select concat(d_ram_blk,'-',lpad(((select substring(d_spatial,6)::int))::char(5),5,'0')) into d_spatial;
            END IF;
            raise notice 'd_spatial %', d_spatial;
            select (DISK).HDD into d_DISK.HDD from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (DISK).SSD into d_DISK.SSD from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (DISK).BALANCED into d_DISK.BALANCED from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;

            select RAM into d_RAM from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;

            select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;

            select (MACHINE_FAMILY).A2 into d_MACHINE.A2 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (MACHINE_FAMILY).N2 into d_MACHINE.N2 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (MACHINE_FAMILY).N1 into d_MACHINE.N1 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (MACHINE_FAMILY).C2 into d_MACHINE.C2 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;
            select (MACHINE_FAMILY).EC2 into d_MACHINE.EC2 from HARDWARE where HARDWARE.RACK_ID = d_spatial and HARDWARE.ZONE_NAME = ZONE_NAME_;

            
            if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
                (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
                (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
                (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
                (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                    if ((MACHINE LIKE 'N1' and (d_MACHINE).N1 > 0) or 
                        (MACHINE LIKE 'N2' and (d_MACHINE).N2 > 0) or 
                        (MACHINE LIKE 'EC2' and (d_MACHINE).EC2 > 0) or 
                        (MACHINE LIKE 'C2' and (d_MACHINE).C2 > 0) or 
                        (MACHINE LIKE 'A2' and (d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0)) THEN 
                            if (((DISK_).HDD <= (d_DISK).HDD) and 
                                ((DISK_).SSD <= (d_DISK).SSD) and 
                                ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                    if (d_RAM >= RAM_) THEN
                                        -- raise notice 'in if';
                                        d_rack_id := d_spatial;
                                        flag1:=0;
                                    ELSE
                                        -- raise notice 'in not if';
                                        d_offset:=d_offset+1;
                                    END IF;
                            ELSE
                                d_offset:=d_offset+1;
                            END IF;

                    ELSE
                        -- raise notice 'in else';
                        d_offset:=d_offset+1;
                    END IF;
            ELSE
                d_offset:=d_offset+1;
            END IF;
        END LOOP;
    END IF;
    RETURN d_rack_id;
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