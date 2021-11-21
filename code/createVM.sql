\c cloud_management;
DROP FUNCTION CREATE_VM;
CREATE OR REPLACE FUNCTION CREATE_VM (
    USER_ID_ char(10),
    NAME VARCHAR(30),
    BOOT_DISK VARCHAR(30),
    PREEMPTIBILITY BOOLEAN,
    INTERNAL_IP CIDR,
    EXTERNAL_IP CIDR,
    HOST_NAME VARCHAR(30),
    NETWORK_TAG VARCHAR(30),
    SUBNET VARCHAR(30),
    ZONE_NAME_ VARCHAR(30),
    PROJECT_ID_ CHAR(12),
    RAM_ INT,
    GPU_ GPU_FAMILY,
    DISK_ DISK_FAMILY,
    MACHINE VARCHAR(30),
    DATE_ TIMESTAMP
)
RETURNS CHAR(10) 
language plpgsql
AS
$$
DECLARE 
    d_DISK DISK_FAMILY;
    d_GPU GPU_FAMILY;
    d_MACHINE MACHINE_FAMILY;
    d_ram RAM_FAMILY;
    d_RAM_ INT;
    d_rack_id CHAR(10);
    d_quota_flag int;
    d_blk char(4);
    d_zone_vms int;
    d_success int;
    d_user_project int;
    d_vmid char(10);
    
BEGIN 
    d_success:=0;
    d_vmid:='0000000000';
    select CHECK_PROJECT_QUOTA(PREEMPTIBILITY,ZONE_NAME_,PROJECT_ID_,GPU_,DISK_,MACHINE) into d_quota_flag;
    select COUNT(*) into d_user_project from WORKED_ON where WORKED_ON.PROJECT_ID = PROJECT_ID_ and WORKED_ON.USER_ID = USER_ID_;
    if (d_quota_flag=1 and d_user_project>=1) THEN
        raise notice 'PASSED : Project QUOTAS are within limits.Proceeding to check if requested instance configurations are available in zone: % ...',ZONE_NAME_;
        select CHECK_RACK_QUOTA(PROJECT_ID_,ZONE_NAME_,RAM_,GPU_,DISK_,MACHINE) into d_rack_id;
        
        if (d_rack_id not LIKE '0000000000') THEN
            raise notice 'PASSED : Requested instance configurations are available in zone: %.',ZONE_NAME_;
            if(ZONE_NAME_ LIKE 'us-central-a') THEN
                select ((quotas).Z1).DISK.hdd into d_DISK.hdd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).DISK.ssd into d_DISK.ssd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).DISK.balanced into d_DISK.balanced from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z1).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z1).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

                select ((quotas).Z1).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 

                raise notice 'Please wait while we create a new VM Instance ...';
                UPDATE PROJECT set quotas.Z1.DISK.HDD = (d_DISK).HDD - (DISK_).HDD,
                quotas.Z1.DISK.SSD = (d_DISK).SSD - (DISK_).SSD,
                quotas.Z1.DISK.BALANCED = (d_DISK).BALANCED - (DISK_).BALANCED WHERE PROJECT_ID=PROJECT_ID_;
                if (PREEMPTIBILITY = TRUE) THEN
                    UPDATE PROJECT set 
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;
                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY_PREMPT.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;

                ELSE
                    UPDATE PROJECT set 
                    quotas.Z1.GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z1.GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z1.GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z1.GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z1.GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;

                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z1.MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                END IF;

                select (DISK_AVAILABLE).hdd into d_DISK.hdd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).ssd into d_DISK.ssd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).balanced into d_DISK.balanced from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

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
                select (MACHINE_TYPE_AVAILABLE).N2 into d_MACHINE.N2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).N1 into d_MACHINE.N1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).C2 into d_MACHINE.C2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).EC2 into d_MACHINE.EC2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

                UPDATE ZONE set 
                    GPU_AVAILABLE.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU_AVAILABLE.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU_AVAILABLE.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU_AVAILABLE.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU_AVAILABLE.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_;
                UPDATE ZONE set 
                    DISK_AVAILABLE.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK_AVAILABLE.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK_AVAILABLE.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_;

                if (MACHINE='N1') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;

                select substring(d_rack_id,0,5) into d_blk;
                if (d_blk LIKE 'blk1') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK1 = (d_RAM).BLK1 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk2') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK2 = (d_RAM).BLK2 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk3') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK3 = (d_RAM).BLK3 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk4') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK4 = (d_RAM).BLK4 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                select (DISK).HDD into d_DISK.HDD from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).SSD into d_DISK.ssd from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).balanced into d_DISK.balanced from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                select RAM into d_RAM_ from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (MACHINE_FAMILY).A2 into d_MACHINE.A2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N2 into d_MACHINE.N2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N1 into d_MACHINE.N1 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).C2 into d_MACHINE.C2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).EC2 into d_MACHINE.EC2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                UPDATE HARDWARE set 
                    DISK.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;

                UPDATE HARDWARE set RAM = d_RAM_ - RAM_ WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                
                if (MACHINE='N1') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;

                UPDATE HARDWARE set 
                    GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
            elseif(ZONE_NAME_ LIKE 'us-central-b') THEN
                select ((quotas).Z2).DISK.hdd into d_DISK.hdd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).DISK.ssd into d_DISK.ssd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).DISK.balanced into d_DISK.balanced from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z2).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z2).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

                select ((quotas).Z2).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 

                raise notice 'Please wait while we create a new VM Instance ...';
                UPDATE PROJECT set quotas.Z2.DISK.HDD = (d_DISK).HDD - (DISK_).HDD,
                quotas.Z2.DISK.SSD = (d_DISK).SSD - (DISK_).SSD,
                quotas.Z2.DISK.BALANCED = (d_DISK).BALANCED - (DISK_).BALANCED WHERE PROJECT_ID=PROJECT_ID_;
                if (PREEMPTIBILITY = TRUE) THEN
                    UPDATE PROJECT set 
                    quotas.Z2.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z2.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z2.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z2.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z2.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;
                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY_PREMPT.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY_PREMPT.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY_PREMPT.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY_PREMPT.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY_PREMPT.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;

                ELSE
                    UPDATE PROJECT set 
                    quotas.Z2.GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z2.GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z2.GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z2.GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z2.GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;

                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z2.MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                END IF;

                select (DISK_AVAILABLE).hdd into d_DISK.hdd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).ssd into d_DISK.ssd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).balanced into d_DISK.balanced from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

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
                select (MACHINE_TYPE_AVAILABLE).N2 into d_MACHINE.N2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).N1 into d_MACHINE.N1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).C2 into d_MACHINE.C2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).EC2 into d_MACHINE.EC2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

                UPDATE ZONE set 
                    GPU_AVAILABLE.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU_AVAILABLE.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU_AVAILABLE.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU_AVAILABLE.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU_AVAILABLE.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_;
                UPDATE ZONE set 
                    DISK_AVAILABLE.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK_AVAILABLE.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK_AVAILABLE.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_;

                if (MACHINE='N1') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;

                select substring(d_rack_id,0,5) into d_blk;
                if (d_blk LIKE 'blk1') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK1 = (d_RAM).BLK1 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk2') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK2 = (d_RAM).BLK2 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk3') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK3 = (d_RAM).BLK3 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk4') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK4 = (d_RAM).BLK4 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                select (DISK).HDD into d_DISK.HDD from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).SSD into d_DISK.ssd from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).balanced into d_DISK.balanced from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                select RAM into d_RAM_ from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (MACHINE_FAMILY).A2 into d_MACHINE.A2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N2 into d_MACHINE.N2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N1 into d_MACHINE.N1 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).C2 into d_MACHINE.C2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).EC2 into d_MACHINE.EC2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                UPDATE HARDWARE set 
                    DISK.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;

                UPDATE HARDWARE set RAM = d_RAM_ - RAM_ WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                
                if (MACHINE='N1') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;

                UPDATE HARDWARE set 
                    GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
            elseif(ZONE_NAME_ LIKE 'eu-east-a') THEN
                select ((quotas).Z3).DISK.hdd into d_DISK.hdd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).DISK.ssd into d_DISK.ssd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).DISK.balanced into d_DISK.balanced from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z3).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z3).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

                select ((quotas).Z3).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 

                raise notice 'Please wait while we create a new VM Instance ...';
                UPDATE PROJECT set quotas.Z3.DISK.HDD = (d_DISK).HDD - (DISK_).HDD,
                quotas.Z3.DISK.SSD = (d_DISK).SSD - (DISK_).SSD,
                quotas.Z3.DISK.BALANCED = (d_DISK).BALANCED - (DISK_).BALANCED WHERE PROJECT_ID=PROJECT_ID_;
                if (PREEMPTIBILITY = TRUE) THEN
                    UPDATE PROJECT set 
                    quotas.Z3.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z3.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z3.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z3.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z3.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;
                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY_PREMPT.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY_PREMPT.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY_PREMPT.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY_PREMPT.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY_PREMPT.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;

                ELSE
                    UPDATE PROJECT set 
                    quotas.Z3.GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z3.GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z3.GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z3.GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z3.GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;

                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z3.MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                END IF;

                select (DISK_AVAILABLE).hdd into d_DISK.hdd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).ssd into d_DISK.ssd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).balanced into d_DISK.balanced from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

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
                select (MACHINE_TYPE_AVAILABLE).N2 into d_MACHINE.N2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).N1 into d_MACHINE.N1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).C2 into d_MACHINE.C2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).EC2 into d_MACHINE.EC2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

                UPDATE ZONE set 
                    GPU_AVAILABLE.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU_AVAILABLE.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU_AVAILABLE.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU_AVAILABLE.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU_AVAILABLE.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_;
                UPDATE ZONE set 
                    DISK_AVAILABLE.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK_AVAILABLE.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK_AVAILABLE.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_;

                if (MACHINE='N1') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;

                select substring(d_rack_id,0,5) into d_blk;
                if (d_blk LIKE 'blk1') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK1 = (d_RAM).BLK1 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk2') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK2 = (d_RAM).BLK2 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk3') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK3 = (d_RAM).BLK3 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk4') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK4 = (d_RAM).BLK4 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                select (DISK).HDD into d_DISK.HDD from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).SSD into d_DISK.ssd from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).balanced into d_DISK.balanced from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                select RAM into d_RAM_ from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (MACHINE_FAMILY).A2 into d_MACHINE.A2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N2 into d_MACHINE.N2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N1 into d_MACHINE.N1 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).C2 into d_MACHINE.C2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).EC2 into d_MACHINE.EC2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                UPDATE HARDWARE set 
                    DISK.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;

                UPDATE HARDWARE set RAM = d_RAM_ - RAM_ WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                
                if (MACHINE='N1') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;

                UPDATE HARDWARE set 
                    GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
            elseif(ZONE_NAME_ LIKE 'eu-west-b') THEN
                select ((quotas).Z4).DISK.hdd into d_DISK.hdd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).DISK.ssd into d_DISK.ssd from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).DISK.balanced into d_DISK.balanced from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                
                select ((quotas).Z4).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
                select ((quotas).Z4).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

                select ((quotas).Z4).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 

                raise notice 'Please wait while we create a new VM Instance ...';
                UPDATE PROJECT set quotas.Z4.DISK.HDD = (d_DISK).HDD - (DISK_).HDD,
                quotas.Z4.DISK.SSD = (d_DISK).SSD - (DISK_).SSD,
                quotas.Z4.DISK.BALANCED = (d_DISK).BALANCED - (DISK_).BALANCED WHERE PROJECT_ID=PROJECT_ID_;
                if (PREEMPTIBILITY = TRUE) THEN
                    UPDATE PROJECT set 
                    quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;
                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY_PREMPT.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY_PREMPT.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY_PREMPT.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY_PREMPT.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY_PREMPT.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;

                ELSE
                    UPDATE PROJECT set 
                    quotas.Z4.GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    quotas.Z4.GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    quotas.Z4.GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    quotas.Z4.GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    quotas.Z4.GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE PROJECT_ID=PROJECT_ID_;

                    if (MACHINE='N1') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='N2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='EC2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='C2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                    if (MACHINE='A2') THEN
                        UPDATE PROJECT set quotas.Z4.MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE PROJECT_ID=PROJECT_ID_;
                    END IF;
                END IF;

                select (DISK_AVAILABLE).hdd into d_DISK.hdd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).ssd into d_DISK.ssd from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (DISK_AVAILABLE).balanced into d_DISK.balanced from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

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
                select (MACHINE_TYPE_AVAILABLE).N2 into d_MACHINE.N2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).N1 into d_MACHINE.N1 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).C2 into d_MACHINE.C2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_TYPE_AVAILABLE).EC2 into d_MACHINE.EC2 from ZONE where ZONE.ZONE_NAME = ZONE_NAME_;

                UPDATE ZONE set 
                    GPU_AVAILABLE.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU_AVAILABLE.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU_AVAILABLE.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU_AVAILABLE.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU_AVAILABLE.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_;
                UPDATE ZONE set 
                    DISK_AVAILABLE.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK_AVAILABLE.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK_AVAILABLE.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_;

                if (MACHINE='N1') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE ZONE set MACHINE_TYPE_AVAILABLE.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_;
                END IF;

                select substring(d_rack_id,0,5) into d_blk;
                if (d_blk LIKE 'blk1') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK1 = (d_RAM).BLK1 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk2') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK2 = (d_RAM).BLK2 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk3') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK3 = (d_RAM).BLK3 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                elseif (d_blk LIKE 'blk4') THEN
                    UPDATE ZONE set RAM_AVAILABLE.BLK4 = (d_RAM).BLK4 - RAM_ WHERE ZONE_NAME=ZONE_NAME_;
                END IF;
                select (DISK).HDD into d_DISK.HDD from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).SSD into d_DISK.ssd from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (DISK).balanced into d_DISK.balanced from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                select RAM into d_RAM_ from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (GPU).NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (GPU).NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;


                select (MACHINE_FAMILY).A2 into d_MACHINE.A2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N2 into d_MACHINE.N2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).N1 into d_MACHINE.N1 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).C2 into d_MACHINE.C2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;
                select (MACHINE_FAMILY).EC2 into d_MACHINE.EC2 from HARDWARE where HARDWARE.RACK_ID = d_rack_id and HARDWARE.ZONE_NAME = ZONE_NAME_;

                UPDATE HARDWARE set 
                    DISK.HDD=(d_DISK).HDD-(DISK_).HDD,
                    DISK.SSD=(d_DISK).SSD-(DISK_).SSD,
                    DISK.BALANCED=(d_DISK).BALANCED-(DISK_).BALANCED WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;

                UPDATE HARDWARE set RAM = d_RAM_ - RAM_ WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                
                if (MACHINE='N1') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N1 = (d_MACHINE).N1 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='N2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.N2 = (d_MACHINE).N2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='EC2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.EC2 = (d_MACHINE).EC2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='C2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.C2 = (d_MACHINE).C2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;
                if (MACHINE='A2') THEN
                    UPDATE HARDWARE set MACHINE_FAMILY.A2 = (d_MACHINE).A2 - 1 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
                END IF;

                UPDATE HARDWARE set 
                    GPU.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU_).NVIDIA_TESLA_A100,
                    GPU.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU_).NVIDIA_TESLA_V100,
                    GPU.NVIDIA_TESLA_K80=(d_GPU).NVIDIA_TESLA_K80-(GPU_).NVIDIA_TESLA_K80,
                    GPU.NVIDIA_TESLA_P4=(d_GPU).NVIDIA_TESLA_P4-(GPU_).NVIDIA_TESLA_P4,
                    GPU.NVIDIA_TESLA_T4=(d_GPU).NVIDIA_TESLA_T4-(GPU_).NVIDIA_TESLA_T4 WHERE ZONE_NAME=ZONE_NAME_ AND RACK_ID=d_rack_id;
            END IF;
            -- Zone ends
            select VM_ID into d_vmid from VM ORDER BY VM_ID DESC LIMIT 1;
            select concat('VM_',lpad(((select substring(d_vmid,4,10)::int)+1)::char(7),7,'0')) into d_vmid;
            BEGIN
                raise notice 'Creating VM Instance...';

                INSERT INTO VM values(d_vmid,NAME,BOOT_DISK,'Stopped',PREEMPTIBILITY,INTERNAL_IP,EXTERNAL_IP,HOST_NAME,NETWORK_TAG,SUBNET,NULL,d_rack_id,ZONE_NAME_,PROJECT_ID_,RAM_,GPU_,DISK_,MACHINE);
                INSERT INTO RUNTIME values(d_vmid,DATE_, 0.00, 0.00, 0.00, 0.00, '00:00:00', '00:00:00');
                INSERT INTO MONITORS values (DATE_, d_vmid, (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),(0.0,0.0,0.0,0.0,0.0));
                raise notice 'Initializing VM Monitoring and Runtime Statistics...';
                raise notice 'Assigning % to VM %',USER_ID_,NAME;
                INSERT INTO ACCESS values (d_vmid,USER_ID_);
                
            END;
            raise notice 'PASSED : Project: % VM: % has been created in zone: %.',PROJECT_ID_,NAME,ZONE_NAME_;
            d_success:=1;

        ELSE
            raise notice 'ERROR : Could not create VM due to insufficient resources available in zone: %.',ZONE_NAME_;
        END IF;
    ELSE
        raise notice 'ERROR : Quota Limit Exceeded for Project: % in zone: %. Please request for LIMIT increase and try again.',PROJECT_ID_,ZONE_NAME_;
    END IF;
    RETURN d_vmid;
END;
$$;

-- UPDATE PROJECT set 
-- quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_A100=(d_GPU).NVIDIA_TESLA_A100-(GPU).NVIDIA_TESLA_A100,
-- quotas.Z4.GPU_PREMPT.NVIDIA_TESLA_V100=(d_GPU).NVIDIA_TESLA_V100-(GPU).NVIDIA_TESLA_V100,
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