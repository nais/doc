---
description: >-
  Alerting is a crucial part of observability, and it's the first step in knowing when something is wrong with your application.
---
# Alerting

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CGldVD5wR-g?si=luayvJTiZBsWK24u" title="Video about Actionable Alerting" frameborder="0" allowfullscreen></iframe>

You can't fix what you can't see. Alerting is a crucial part of observability, and it's the first step in knowing when something is wrong with your application.

However, alerting is only as good as the data you have available and the conditions you set. It's important to have a good understanding of what you want to monitor and how you want to be notified. We call this the _alerting strategy_.

While many metrics can be useful to gain insights into different aspects of a system, not all of them are useful for alerting. When setting up alerts, it's important to choose metrics that are relevant to the user experience and that can be used to detect problems early.

## Critical user journeys

A good place to start when choosing what to monitor is to consider the most critical user journeys in your application. This is a set of interactions a user has with a service to achieve a concert end result. It is important that these journeys are modeled from the user's perspective and not a technical perspective. This is because not all technical issues are equally important, or even visible to the user.

Imagine your team is responsible for a hypothetical case management system. Let’s look at a few of the actions your users will be taking when they use the system:

* List open cases
* Search for cases
* View case details
* Case resolution

Not all of these actions are equally important. For example, the "List open cases" journey might be less critical than the "Case resolution" journey. This is why it's important to prioritize the journeys and set up alerts accordingly.

## Alerting indicators

Service level indicators (or SLIs) are metrics that correlate with the user experience for a given user journey. With correlation, we mean that if the indicator is trending downwards, it's likely that the user experience is also trending in the same direction.

While many metrics can function as indicators of user experience, we recommend choosing an indicator that is a ratio of two numbers: the number of good events divided by the total number of events. Typical service level indicators include:

* Number of successful HTTP requests divided by the total number of HTTP requests (success rate)
* Number of cache hits divided by the total number of cache lookups (cache hit rate)
* Number of successful database queries divided by the total number of database queries (database success rate)

We recommend a rate because they more stable than raw counts, and they are less likely to be affected by a sudden change in traffic. Indicators of this type have some desirable properties. They range from 0% to 100%, where 100% means that all is well and 0% means that nothing is working. They are also easy to understand and easy to calculate.

Other types of indicators can also be useful, such as latency, throughput, and saturation. However, these are often more difficult to calculate, understand, and they are often less stable than rates.

Continuing with the case management system example, let's say you want to monitor the "Case resolution" user journey. You could monitor the following indicators:

* The rate of successful submissions of case resolution
* The rate of validation errors (e.g. missing fields, invalid data)
* The latency until the data is persisted to the database

## Alerting objectives

Service level objectives (SLOs) sets a target level of reliability for the service's users. Above this threshold, almost all users should be happy with your service (assuming they are otherwise happy with the utility of the service). Below this threshold, users are likely to start complaining.

Service level objectives are defined based on indicators, as described above, which are the quantitative measures of some aspect of the application performance, a target value or range of values for the indicator, and a time period over which the indicator is measured.

User happiness is a rather diffuse concept and it is very hard to measure precisely. Often we have little insight into it at all, so how do we begin? What do we use for our first objective?

What we do know is that 100% reliability is not the right target for many reasons:

* Even the most reliable systems have outages, and none of the components or underlying infrastructure in NAIS offer a 100% reliability guarantee.
* Even if you could achieve 100% reliability, users would in practice not experience it as such. They would still experience outages due to network issues, client-side issues, and so on.
* If you had complete control over the entire value chain, a 100% reliability would in practice mean that you could never make any changes to the system, as any change has the potential to introduce new bugs or outages.
* A 100% reliability target would mean that you can only be reactive to problems, as you would never have any headroom to handle unexpected issues. This does not align with the engineering culture we want to promote.

## Alerting conditions

When setting up alerts, you need to define the conditions that should trigger the alert. This could be anything from the number of requests exceeding a certain threshold, to the latency of your application exceeding a certain threshold, to the number of errors exceeding a certain threshold.

Consider the following attributes when setting up alerts:

* _Precision_. The proportion of events detected that are significant. In other words, it's the ratio of true positive alerts (alerts that correctly indicate a problem) to the total number of alerts (both true and false positives). High precision means that most of the alerts you receive are meaningful and require action.

* _Recall_. The proportion of significant events that are detected. It's the ratio of true positive alerts to the total number of actual problems (both detected and undetected). High recall means that you are catching most of the problems that occur.

* _Detection Time_. The amount of time it takes for the alerting system to trigger an alert after a problem has occurred. Short detection times are desirable as they allow for quicker response to problems.

* _Reset Time_. The amount of time it takes for the alerting system to resolve an alert after the problem has been fixed. Short reset times are desirable as they reduce the amount of time spent dealing with alerts for problems that have already been resolved.

## Reference

* https://cloud.google.com/blog/products/management-tools/practical-guide-to-setting-slos
* https://cloud.google.com/blog/products/management-tools/good-relevance-and-outcomes-for-alerting-and-monitoring
* https://sre.google/workbook/implementing-slos/