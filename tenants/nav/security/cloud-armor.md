---
description: Cloud Armor and preconfigured ModSecurity rules.
---

# Cloud Armor

Applications running in our clusters on the [Google Cloud Platform](../clusters/gcp.md) are protected by Google's
enterprise edge network security solution, [Google Cloud Armor](https://cloud.google.com/armor). The solution provides
DDoS (Distributed Denial-of-Service) protection, WAF (Web Application Firewall) services, and more.

Cloud Armor builds upon preconfigured WAF rule sets to help mitigate
the [OWASP Top 10](https://owasp.org/www-project-top-ten/) web application security vulnerabilities. The rule sets are
based on the [OWASP ModSecurity Core Rule Set Version 3](https://github.com/coreruleset/coreruleset/tree/v3.0/master)
to protect against some of the most common web application security risks, such
as [cross-site scripting (XSS)](https://cloud.google.com/armor/docs/rule-tuning#cross-site_scripting_xss),
[SQL injection](https://cloud.google.com/armor/docs/rule-tuning#sql_injection_sqli), and more.

The security policies in Cloud Armor can also be configured with 
[custom expressions](https://cloud.google.com/armor/docs/configure-security-policies#sample-expressions), which allows 
matching against requests from a certain IP address or IP range, requests from a certain region, or 
headers that contains a specific value.

## Security Rules

The platform has enabled a number of [the available rule sets](https://cloud.google.com/armor/docs/rule-tuning). Most of
these rules are at sensitivity level 1, though we may adjust this as needed in the future.

### Sensitivity Level

Each [ModSecurity](https://cloud.google.com/armor/docs/rule-tuning#preconfigured_modsecurity_rules) rule has a 
[paranoia level](https://coreruleset.org/faq/#paranoialevel) (referred to as _sensitivity levels_ in Cloud Armor) setting 
which allows us to choose the desired level of rule checks. 

A lower sensitivity level indicates a higher confidence signature, which is less likely to generate a false positive. 
Conversely, a higher sensitivity level increases security, along with the probability of generating false 
positives.

### False Positives

Most rules with sensitivity level 1 should generally not trigger false positives, though they may still occur depending
on the request and applications that are involved.

!!! tip "Troubleshooting false positives"
    If you need additional information about what particular rules that are triggered, or you suspect that some requests
    are erroneously blocked by something outside your application, check out the
    [Cloud Armor Kibana dashboard](https://logs.adeo.no/goto/e6bb3e20cf35b7c3b224338240739fce) or
    [contact us on Slack](../support.md#contact-the-nais-team).
