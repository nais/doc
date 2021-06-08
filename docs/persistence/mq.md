# MQ

Although we recommend using Kafka if possible, MQ is supported on the nais platform. 


### Requirements


#### Basta

!!! info
    When ordering groups for existing service users the password will be reset

MQ groups and users are ordered using [basta](https://basta.intern.nav.no). 
For legacy applications registered in [fasit](https://fasit.adeo.no) use "AD groups" on the "Create" tab, 
for all other applications use "Custom AD groups".

Access to basta (and fasit) can be obtained by requesting access from [identity management](mailto:nav.it.identhandtering@nav.no).

Access to development environments (including legacy u, t and q environments):


Access to production environments (including legacy p environment):

``` 0000-GA-env-config-ProdAdmin - Fasit P```

Order the group by using your applications name, the group name in AD will be 0000-GA-MQ- followed by the application name.
If no service account exists with the name srv + application name, it will be created and added to the group.
If the user already exists the user will be added to the group and the password will be updated 
and uploaded to [vault](https://vault.adeo.no) in the serviceuser directory.

From vault you can then mount this secret into your pod to authenticate with MQ.

### Environments

Dev:

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
|MQLS01|b27apvl219.preprod.local|1413
|MQLS02|b27apvl220.preprod.local|1413
|MQLS03|b27apvl221.preprod.local|1413
|MQLS04|b27apvl222.preprod.local|1413

Production:

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
|MPLS01|a01apvl247.adeo.no|1414
|MPLS02|a01apvl269.adeo.no|1414
|MPLS03|a01apvl270.adeo.no|1414
|MPLS04|a01apvl271.adeo.no|1414

These servers are available from on-premises and GCP alike.

### Application

The application needs to implement MQ authentication using the client libraries, as opposed to previously just sending username.

If you are using MQ client lower than 9.2 set this parameter when connecting: 
```USER_AUTHENTICATION_MQCSP=true```
