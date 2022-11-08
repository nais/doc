# IBM MQ

[IBM MQ][ibm-mq] is a message broker that is used for storing and querying data. It is a good choice for storing data that is not relational in nature. MQ is considered legacy technology and we suggest using [Kafka](./kafka/README.md) for all new applications

[ibm-mq]: https://www.ibm.com/docs/en/ibm-mq/9.0

## Getting started

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

## Environments

We have three environments for MQ: `QA`, `TEST`, and `PROD`.

=== "TEST"

    | QueueManager   | Hostname                 | Port |
    | -------------- | ------------------------ | ---- |
    | MTLS01         | d26apvl298.test.local    | 1412 |
    | MTLS02         | d26apvl299.test.local    | 1412 |
    | MTLS03         | d26apvl300.test.local    | 1412 |
    | MTLS04         | d26apvl300.test.local    | 1412 |

=== "QA"

    | QueueManager   | Hostname                 | Port |
    | -------------- | ------------------------ | ---- |
    | MQLS01         | b27apvl219.preprod.local | 1413 |
    | MQLS02         | b27apvl220.preprod.local | 1413 |
    | MQLS03         | b27apvl221.preprod.local | 1413 |
    | MQLS04         | b27apvl222.preprod.local | 1413 |

=== "PROD"

    | QueueManager   | Hostname                 | Port |
    | -------------- | ------------------------ | ---- |
    | MPLS01         | a01apvl247.adeo.no       | 1414 |
    | MPLS02         | a01apvl269.adeo.no       | 1414 |
    | MPLS03         | a01apvl270.adeo.no       | 1414 |
    | MPLS04         | a01apvl271.adeo.no       | 1414 |


These servers are available from on-premises and GCP alike.

## Application Configuration

The application needs to implement MQ authentication using the client libraries, as opposed to previously just sending username.

If you are using MQ client lower than 9.2.1.0 set this parameter when connecting:

```
USER_AUTHENTICATION_MQCSP=true
```

Setting this in java:

```
connectionFactory.setBooleanProperty(JmsConstants.USER_AUTHENTICATION_MQCSP, true);
```

### Transport Layer Security (TLS)
Setting this is recommended, so that the information is not send in plain text

Setting this in java:

```
connectionFactory.setSslSocketFactory(SSLSocketFactory.getDefault());
connectionFactory.setSslCipherSuite = "*TLS13ORHIGHER"
```

#### TLS for applications running on GCP

For applications running in GCP you need to use and create the TLS certificates manually, and MQ-Admins need to turn on TLS for the spesific MQ channel
Using the TLS certificates can be done by setting these environment variables:

* ``` "javax.net.ssl.keyStore" = $YOUR_MQ_TLS_KEYSTORE_PATH  ```
* ``` "javax.net.ssl.keyStorePassword" = $YOUR_MQ_TLS_KEYSTORE_PASSWORD```
* ``` "javax.net.ssl.keyStoreType" = "jks" ```

## High availability

For production environment there is a high availability solution in place that
offers higher availability than the standard MQ solution. Replace the hostname
with the one from the table below.

| QueueManager   | Hostname                 | Port |
| -------------- | ------------------------ | ---- |
| MPLS01         | mpls01.adeo.no           | 1414 |
| MPLS02         | mpls02.adeo.no           | 1414 |
| MPLS03         | mpls03.adeo.no           | 1414 |
| MPLS04         | mpls04.adeo.no           | 1414 |
