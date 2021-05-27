# What is production ready?
This is the NAIS team's attempt to define what _production ready_ means to us.
Production implies quality and durability. Running a system means serving
requests, and requests are ultimately serving users. We care about our users,
thus we must care about our systems.

At NAIS, we strive to:

* provide fully self serviced products with minimal downtime,
* be confident that code changes will not break existing functionality,
* respond quickly when systems fail,
* spend minimal time fixing errors,
* and most importantly: spend as much time possible implementing useful services for our users. (you!)

We believe that if our systems conform to the principles in this document, we have a greater chance of achieving these goals.

## 12 factor app
Write your application according to the principles of [12 factor apps](https://12factor.net/).

Twelve factor apps:

* have declarative system requirements,
* are suitable for deployment in Docker containers,
* do not have differences between development and production, and
* can scale up without significant changes to tooling, architecture, or development practices.

## Observability
Expose a Prometheus metric endpoint to allow scraping of key application metrics.

## Measuring success
Figure out _service level indicators_ (SLI) and _service level objectives_ (SLO).

Service level indicators are quantifying metrics such as _error rate_, _request
latency_, _availability_, and _system throughput_.

Service level objectives are targets values for your metrics. You might say
that you want an uptime of 99.9%. How do you define uptime? Is it a
sufficiently low error rate? Is it being able to serve requests within a
reasonable amount of time?

Implement SLIs in the application code. Create views in a
[Grafana](https://grafana.nais.io) dashboard to check up on SLOs.

Recommended read: [Service Level
Objectives](https://sre.google/sre-book/service-level-objectives/) in the
Google Site Reliability Engineering handbook.

## Alerts
[Alerts](https://doc.nais.io/observability/alerts/) should be tied to SLOs.
Consider if alerting is at all needed. An alert should only fire if human intervention is required.
Too many alerts going off will result in [alarm fatigue](https://en.wikipedia.org/wiki/Alarm_fatigue).

## Relevant logs
Ensure traceability of errors by logging sufficient amount of debug information.
Do not include sensitive data in logs. Sensitive data include credentials and
personally identifyable information.

## Tests
Ensure sufficient test coverage so that the next developer is not afraid of
breaking things when updating your code.

## Documentation
* Development/building
* End-user documentation
* Sysadmin/maintenance
* Document code where it is complex, hard to read, or otherwise obscure

## Continuous Integration
Ensure that changes to the codebase are built automatically, and pushed to
development and production environments. No manual steps other than `git push`
should be neccessary.

## Publish and announce
Your system is not in production until it has users.
Make sure all potential end users are aware of your system and can use it.
Using a system means making requests and having access to support and documentation.

## Update skill matrix
If a system is not in the [skill matrix](https://www.valamis.com/hub/skills-matrix#what-is-skill-matrix), add it.
If you worked recently on a system, add yourself to the skill matrix.

## Decrease bus factor
Ensure that at least two people on your team have sufficient knowledge to debug
and work on the system, to avoid [bus factor](https://en.wikipedia.org/wiki/Bus_factor).

## Data Protection Impact Assessment
Perform, if applicable, a _Data Protection Impact Assessment_ (or in Norwegian, _personvernskonsekvensvurdering_ (PVK)).

## Security Audit
Perform a [security audit (ROS)](https://doc.nais.io/clusters/migrating-to-gcp/#ros) before releasing to production.
