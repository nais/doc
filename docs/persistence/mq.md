# MQ

MQ is supported on the nais platform on-premises and on GCP. 



### Requirements


#### Basta

!!! info
    When ordering groups for existing service users the password will be reset. If you do not want the password to be reset, contact windows admin and ask them to add the existing user to the AD group and set the "extensionAttribute9" property on the user

MQ groups and users are ordered using [basta](https://basta.intern.nav.no). 
For legacy applications registered in [fasit](https://fasit.adeo.no) use "AD groups" on the "Create" tab, 
for all other applications use "Custom AD groups".

Access to basta (and fasit) can be obtained by requesting access from [identity management](mailto:nav.it.identhandtering@nav.no).

Access to development environments (including legacy u, t and q environments):

```
0000-GA-env-config-TestAdmin - Fasit T/Q
```

Access to production environments (including legacy p environment):

```
0000-GA-env-config-ProdAdmin - Fasit P
```

Order the group by using your applications name, the group name in AD will be 0000-GA-MQ- followed by the application name.
If no service account exists with the name srv + application name, it will be created and added to the group.
If the user already exists the user will be added to the group and the password will be updated 
and uploaded to [vault](https://vault.adeo.no) in the serviceuser directory.

From vault you can then mount this secret into your pod to authenticate with MQ.

### Environments

Nais-Dev (Legacy QA enviroment):

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
| MQLS01         | b27apvl219.preprod.local | 1413 |
| MQLS02         | b27apvl220.preprod.local | 1413 |
| MQLS03         | b27apvl221.preprod.local | 1413 |
| MQLS04         | b27apvl222.preprod.local | 1413 |

Production :

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
| MPLS01         | a01apvl247.adeo.no       | 1414 | 
| MPLS02         | a01apvl269.adeo.no       | 1414 |
| MPLS03         | a01apvl270.adeo.no       | 1414 |
| MPLS04         | a01apvl271.adeo.no       | 1414 |

Nais-Dev (Legacy Test envirorment)

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
| MTLS01         | d26apvl298.test.local    | 1412 |
| MTLS02         | d26apvl299.test.local    | 1412 |
| MTLS03         | d26apvl300.test.local    | 1412 |
| MTLS04         | d26apvl300.test.local    | 1412 |


These servers are available from on-premises and GCP alike.

### Application

The application needs to implement MQ authentication using the client libraries, as opposed to previously just sending username.

If you are using MQ client lower than 9.2.1.0 set this parameter when connecting: 

```
USER_AUTHENTICATION_MQCSP=true
```

Setting this in java: 

```
connectionFactory.setBooleanProperty(JmsConstants.USER_AUTHENTICATION_MQCSP, true);
```

#### Transport Layer Security (TLS)
Setting this is recommended, so that the information is not send in plain text

Setting this in java:

```
connectionFactory.setSslSocketFactory(SSLSocketFactory.getDefault());
connectionFactory.setSslCipherSuite = "*TLS13ORHIGHER"
```
 
> **Note for GCP**
> IN GCP you need to use and create the TLS certificates manually, and MQ-Admins need to turn on TLS for the spesific MQ channel
> Using the TLS certificates can be done by setting these environment variables:   
> ``` "javax.net.ssl.keyStore" = $YOUR_MQ_TLS_KEYSTORE_PATH  ```
> ``` "javax.net.ssl.keyStorePassword" = $YOUR_MQ_TLS_KEYSTORE_PASSWORD```
> ``` "javax.net.ssl.keyStoreType" = "jks" ```

### MQ HA in Production
replace existing hostname in production with those mentioned below to run against mq high availability cluster.

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
| MPLS01         | mpls01.adeo.no           | 1414 | 
| MPLS02         | mpls02.adeo.no           | 1414 |
| MPLS03         | mpls03.adeo.no           | 1414 |
| MPLS04         | mpls04.adeo.no           | 1414 |
