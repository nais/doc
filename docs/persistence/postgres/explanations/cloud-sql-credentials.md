---
title: Cloud SQL credentials
tags: [postgres, credentials, explenation]
---

Cloud SQL uses ConfigConnector/CNRM to create and manage all relevant resources (sqldatabase, sqlinstance, sqluser, credentials) for postgreSQL.
When creating an application via your nais.yaml the database in your google project, along with other necessary resources, are created.
The creation of the database takes about ten minutes, and the credential settings will be updated after the database is ready for use.

!!! warning
    If you delete and recreate your app, new credentials will be created and a synchronization is needed.
    This process can take up to ten minutes. Using the workaround described below you can avoid this synchronization period.
