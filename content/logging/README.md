Logging
=======

Configure your application to log to console (stdout/stderr), it will be scraped by [FluentD](https://www.fluentd.org/) running inside the cluster and sent to [Elasticsearch](https://www.elastic.co/products/elasticsearch) and made available via [Kibana](https://www.elastic.co/products/kibana). Visit our Kibana at [logs.adeo.no](https://logs.adeo.no/).

If you want more information than just the log message (loglevel, MDC, etc), you should log in JSON format; the fields you provide will then be indexed.

See some Java examples [here](examples.md)

## Overview

![overview](/media/logging_overview.png)
