Service Discovery
=================

There is one namespace per application, and one deployment per environment.

Example with the application `foreldepengesoknad-api`:

| env | url                                 |
| ----| ----------------------------------- |
| p   | `http://p.foreldepengesoknad-api`   |
| t1  | `http://t1.foreldepengesoknad-api`  |


## Making the same code work in multiple environments

As URLs now contain environment we suggest you include som logic in your code to avoid making code changes for every environment your application runs in. The current environment an application is running in is injected at deploy-time as the environment variable `APP_ENVIRONMENT` which can be used to construct URLls.


### Python example:

```python
def assemble_url(applicationName):
  env = os.environ['APP_ENVIRONMENT']

  return "{}.{}".format(env, applicationName)

# Running in t1 would yield:
>>> assemble_url('applicationName')
't1.applicationName'

# Running in p would yield:
>>> assemble_url('applicationName')
'p.applicationName'
```


## Overview

![HttpOtherEnvironmentExample](/_media/service_discovery_overview.png)
