\c cloud_management;

DROP OWNED by admin_user;
DROP OWNED by login_user;
DROP USER admin_user;
DROP USER login_user;

CREATE USER admin_user with password '123' CREATEDB;
ALTER USER admin_user WITH SUPERUSER;
ALTER USER admin_user CREATEROLE LOGIN;
GRANT select,insert,delete on USER_ to admin_user;

CREATE USER login_user with password '123';
GRANT select on user_emails to login_user;