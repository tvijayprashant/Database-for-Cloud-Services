\c cloud_management;
-- Simple Queries
select VM_ID,NAME,TIME,DISK,DISK_USAGE,RAM,RAM_USAGE,GPU_USAGE,GPU_RUNTIME, MACHINE, CPU_USAGE,CPU_RUNTIME from RUNTIME NATURAL JOIN VM order by TIME;
select v.VM_ID as VM_ID,v.NAME as VM_NAME, v.INTERNAL_IP as IP, u.USER_ID as USER_ID,u.NAME as USERNAME from VM as v, USER_ as u, ACCESS as a where a.VM_ID = v.VM_ID and a.USER_ID = u.USER_ID; 

select p.PROJECT_ID as PROJECT_ID, p.QUOTAS as QUOTAS, u.USER_ID as USER_ID from USER_ as u, PROJECT as p, WORKED_ON as w where w.PROJECT_ID = p.PROJECT_ID and w.USER_ID = u.USER_ID; 
select v.VM_ID, h.ZONE_NAME as ZONE_NAME, v.RACK_ID as RACK_ID, h.DISK as DISK, h.GPU as GPU, h.MACHINE_FAMILY as MACHINE_FAMILY, h.RAM as RAM from HARDWARE as h, VM as v where v.RACK_ID = h.RACK_ID and v.ZONE_NAME=h.ZONE_NAME;

select p.PROJECT_ID as PROJECT_ID, ZONE_NAME from PROJECT as p, VM as v where v.PROJECT_ID = p.PROJECT_ID;


-- Complex Queries
-- insert into VM values ('VM_0000005',)
--  1. insert 
--  2. delete
-- 3. projects in blk1
select ZONE_NAME,COUNT(USER_ID) FROM VM NATURAL JOIN WORKED_ON GROUP BY ZONE_NAME;
select * from VM EXCEPT (select * from VM where ZONE_NAME='us-central-b');
select VM_ID,AVG(RAM_USAGE) as RAM_USAGE,AVG(CPU_USAGE) as CPU_USAGE,AVG(GPU_USAGE) as GPU_USAGE,MAX(GPU_RUNTIME) as GPU_RUNTIME,MAX(CPU_RUNTIME) as CPU_RUNTIME from RUNTIME GROUP BY VM_ID;
select USER_ID,MACHINE FROM VM NATURAL JOIN ACCESS;
select PROJECT_ID,COUNT(VM_ID) FROM VM WHERE PROJECT_ID in (SELECT PROJECT_ID FROM VM WHERE RACK_ID LIKE '%' || 'blk1' || '%' and VM.ZONE_NAME='us-central-a') GROUP BY PROJECT_ID;

-- Nested Queries
select sum(gpu_runtime) as gr, sum(cpu_runtime) as cr, sum(gpu_usage) as gu, sum(cpu_usage) as cu, sum(disk_usage) as du, sum(ram_usage) as ru from runtime natural join vm where zone_name='us-central-a' group by time order by time limit 24;
select cost,sum(cpu_runtime) as cr,sum(gpu_runtime) as gr from monitors natural join runtime where vm_id = (select vm_id from vm where project_id='cdsaml-32445');