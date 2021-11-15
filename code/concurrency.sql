\c cloud_management;

BEGIN;

insert into WORKED_ON values ('labra213-123','USR000005'),('msft-2028341','USR000001'),('pluck-rarity','USR000002'),('google-20000','USR000002'),('conda-menors','USR000004'),('tesla-201922','USR000003');

select create_VM(('USR000005','imagan2', 'Ubuntu-20.04', 'Stopped', TRUE, '10.1.1.20', '34.122.7.189', 'dlink-victor', NULL, NULL,'us-central-b', 'labra213-123', 85,(1,0,0,0,0),(1,0,0),'A2'));
select create_VM(('USR000001','Autopilot', 'Ubuntu-20.04', 'Stopped', FALSE, '10.1.1.20', '34.122.7.189', 'dlink-ether', NULL, NULL,'eu-west-b', 'msft-2028341', 85,(1,0,0,0,0),(1,0,0),'A2'));
select create_VM(('USR000002','GAN', 'Ubuntu-20.04', 'Stopped', TRUE, '10.1.1.20', '34.122.7.189', 'dlink-magma', NULL, NULL,'eu-west-b', 'pluck-rarity', 85,(1,0,0,0,0),(1,0,0),'A2'));
select create_VM(('USR000002','ObjectRecognition', 'Ubuntu-20.04', 'Stopped', FALSE, '10.1.1.20', '34.122.7.189', 'google', NULL, NULL,'eu-east-a', 'google-20000', 85,(1,0,0,0,0),(1,0,0),'A2'));
select create_VM(('USR000004','HDFCCreditCARD', 'Ubuntu-20.04', 'Stopped', FALSE, '10.1.1.20', '34.122.7.189', 'tplink-archer', NULL, NULL,'eu-east-a', 'conda-menors', 85,(1,0,0,0,0),(1,0,0),'A2'));
select create_VM(('USR000003','BigData', 'Ubuntu-20.04', 'Stopped', TRUE, '10.1.1.20', '34.122.7.189', 'Tsnl', NULL, NULL,'us-central-b', 'tesla-201922', 85,(1,0,0,0,0),(1,0,0),'A2'));
END;

