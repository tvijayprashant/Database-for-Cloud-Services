\c cloud_management
DROP FUNCTION CHECK_PROJECT_QUOTA;

CREATE OR REPLACE FUNCTION CHECK_PROJECT_QUOTA (
    PREEMPTIBILITY BOOLEAN,
    ZONE_NAME_ VARCHAR(30),
    PROJECT_ID_ CHAR(12),
    GPU_ GPU_FAMILY,
    DISK_ DISK_FAMILY,
    MACHINE VARCHAR(30)
)
RETURNS INT 
language plpgsql
AS
$$
DECLARE 
    d_DISK DISK_FAMILY;
    d_GPU GPU_FAMILY;
    d_MACHINE MACHINE_FAMILY;
    d_VM_number int;
    d_zone_vms int;
    quota_flag int;
BEGIN  
    quota_flag:=0;
    select count(VM_ID) into d_VM_number from VM where VM.PROJECT_ID = PROJECT_ID_ and VM.ZONE_NAME = ZONE_NAME_;
    if (ZONE_NAME_='us-central-a') THEN
        select ((quotas).Z1).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 
        select ((quotas).Z1).DISK.HDD into d_DISK.HDD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z1).DISK.SSD into d_DISK.SSD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z1).DISK.BALANCED into d_DISK.BALANCED from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

        if (PREEMPTIBILITY = TRUE) THEN
            select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            select ((quotas).Z1).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) and
                                    ((DISK_).SSD <= (d_DISK).SSD) and
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;

        ELSE
            select ((quotas).Z1).GPU.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).GPU.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;


            select ((quotas).Z1).MACHINE_FAMILY.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z1).MACHINE_FAMILY.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or 
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or 
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or 
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or 
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) or 
                                    ((DISK_).SSD <= (d_DISK).SSD) or 
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;
        END IF;
    elseif (ZONE_NAME_='us-central-b') THEN
        select ((quotas).Z2).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 
        select ((quotas).Z2).DISK.HDD into d_DISK.HDD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z2).DISK.SSD into d_DISK.SSD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z2).DISK.BALANCED into d_DISK.BALANCED from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

        if (PREEMPTIBILITY = TRUE) THEN
            select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            select ((quotas).Z2).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) and
                                    ((DISK_).SSD <= (d_DISK).SSD) and
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;

        ELSE
            select ((quotas).Z2).GPU.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).GPU.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;


            select ((quotas).Z2).MACHINE_FAMILY.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z2).MACHINE_FAMILY.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or 
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or 
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or 
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or 
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) or 
                                    ((DISK_).SSD <= (d_DISK).SSD) or 
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;
        END IF;
    elseif (ZONE_NAME_='eu-east-a') THEN
        select ((quotas).Z3).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 
        select ((quotas).Z3).DISK.HDD into d_DISK.HDD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z3).DISK.SSD into d_DISK.SSD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z3).DISK.BALANCED into d_DISK.BALANCED from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

        if (PREEMPTIBILITY = TRUE) THEN
            raise notice 'hi';
            select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            select ((quotas).Z3).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) and
                                    ((DISK_).SSD <= (d_DISK).SSD) and
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;

        ELSE
            raise notice 'Non-prempt';
            select ((quotas).Z3).GPU.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).GPU.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;


            select ((quotas).Z3).MACHINE_FAMILY.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z3).MACHINE_FAMILY.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            if ( d_VM_number < d_zone_vms) THEN
                raise notice 'no of vms passed';
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        raise notice 'GPU passed';
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or 
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or 
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or 
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or 
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN
                                raise notice 'CPU passed';
                                if (((DISK_).HDD <= (d_DISK).HDD) or 
                                    ((DISK_).SSD <= (d_DISK).SSD) or 
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        raise notice 'Quota passed';
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;
        END IF;
    elseif (ZONE_NAME_='eu-west-b') THEN
        select ((quotas).Z4).NO_VMS into d_zone_vms from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_; 
        select ((quotas).Z4).DISK.HDD into d_DISK.HDD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z4).DISK.SSD into d_DISK.SSD from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
        select ((quotas).Z4).DISK.BALANCED into d_DISK.BALANCED from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

        if (PREEMPTIBILITY = TRUE) THEN
            select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU_PREMPT.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            select ((quotas).Z4).MACHINE_FAMILY_PREMPT.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY_PREMPT.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY_PREMPT.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY_PREMPT.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY_PREMPT.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;

            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) and
                                    ((DISK_).SSD <= (d_DISK).SSD) and
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;

        ELSE
            select ((quotas).Z4).GPU.NVIDIA_TESLA_A100 into d_GPU.NVIDIA_TESLA_A100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU.NVIDIA_TESLA_V100 into d_GPU.NVIDIA_TESLA_V100 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU.NVIDIA_TESLA_K80 into d_GPU.NVIDIA_TESLA_K80 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU.NVIDIA_TESLA_T4 into d_GPU.NVIDIA_TESLA_T4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).GPU.NVIDIA_TESLA_P4 into d_GPU.NVIDIA_TESLA_P4 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;


            select ((quotas).Z4).MACHINE_FAMILY.A2 into d_MACHINE.A2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY.N2 into d_MACHINE.N2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY.N1 into d_MACHINE.N1 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY.C2 into d_MACHINE.C2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            select ((quotas).Z4).MACHINE_FAMILY.EC2 into d_MACHINE.EC2 from PROJECT where PROJECT.PROJECT_ID = PROJECT_ID_;
            if ( d_VM_number < d_zone_vms) THEN
                if ((GPU_).NVIDIA_TESLA_A100 <= (d_GPU).NVIDIA_TESLA_A100 and 
                    (GPU_).NVIDIA_TESLA_V100 <= (d_GPU).NVIDIA_TESLA_V100 and 
                    (GPU_).NVIDIA_TESLA_K80 <= (d_GPU).NVIDIA_TESLA_K80 and 
                    (GPU_).NVIDIA_TESLA_T4 <= (d_GPU).NVIDIA_TESLA_T4 and 
                    (GPU_).NVIDIA_TESLA_P4 <= (d_GPU).NVIDIA_TESLA_P4) THEN
                        if ((MACHINE = 'N1' and (d_MACHINE).N1 > 0) or 
                            (MACHINE = 'N2' and (d_MACHINE).N2 > 0) or 
                            (MACHINE = 'EC2' and (d_MACHINE).EC2 > 0) or 
                            (MACHINE = 'C2' and (d_MACHINE).C2 > 0) or 
                            (MACHINE = 'A2' and ((d_MACHINE).A2 > 0 and (GPU_).NVIDIA_TESLA_A100 <> 0))) THEN 
                                if (((DISK_).HDD <= (d_DISK).HDD) or 
                                    ((DISK_).SSD <= (d_DISK).SSD) or 
                                    ((DISK_).BALANCED <= (d_DISK).BALANCED)) THEN
                                        quota_flag:=1;
                                END IF;
                        END IF;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN quota_flag;
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