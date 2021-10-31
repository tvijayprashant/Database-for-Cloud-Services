\c cloud_management;

DROP OWNED BY user1;
DROP USER user1;

DROP OWNED BY cloud_admin;
DROP USER cloud_admin;

drop OWNED by zone_admin;
drop user zone_admin;

drop OWNED BY zone_hardware_admin;
drop user zone_hardware_admin;

drop OWNED by quota_admin;
drop user quota_admin;

-- for creating new users.
CREATE USER user1 with password 'user' createdb;
grant select,insert,UPDATE,delete on USER_ to user1;
grant select,insert,update(QUOTAS),delete on PROJECT to user1;
grant select,insert,update(NAME,RAM,GPU,DISK,MACHINE),delete on VM to user1;

-- user who has access to all the tables
CREATE USER cloud_admin with password 'cloud_admin' createdb;
grant ALL PRIVILEGES on ALL TABLES in schema PUBLIC to cloud_admin;

-- zone_administrator
CREATE USER zone_admin with password 'zone_admin' createdb;
grant ALL PRIVILEGES on ZONE to zone_admin;
grant select,insert,update,delete on HARDWARE,VM to zone_admin;

--
CREATE USER zone_hardware_admin with password 'hardware_admin' createdb;
grant ALL PRIVILEGES on ZONE,HARDWARE to zone_hardware_admin;

CREATE USER quota_admin with password 'quota_admin' createdb;
grant select (PROJECT_ID,QUOTAS),update (PROJECT_ID,QUOTAS) on PROJECT to quota_admin;