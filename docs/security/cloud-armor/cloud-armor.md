# Cloud Armor

In Google Cloud we have enabled Google Cloud Armor (GCA) to protect our loadbalancer and the services behind it.
The GCA is an WAF (Web Application Firewall) to help mitigate the [OWASP Top 10](https://owasp.org/www-project-top-ten/)
risks add to add support for
the [Zero-trust architecture](https://csrc.nist.gov/publications/detail/sp/800-207/final), the WAF protects web
applications from a variety of
application layer attacks, such
as [cross-site scripting (XSS)](https://cloud.google.com/armor/docs/rule-tuning#cross-site_scripting_xss)
, [SQL injection](https://cloud.google.com/armor/docs/rule-tuning#sql_injection_sqli) and cookie poisoning, among
others. GCA is
used for layers 3 and 4 (network and transport) and protocol based attacks and DDoS.
GCA can help detect and absorb attacks and filter traffic
through [configurable security rules](#configured-security-rules).

Cloud Armor is also configured
with [costume expressions](https://cloud.google.com/armor/docs/configure-security-policies#sample-expressions), witch
can be an expression that matches against requests from a certain IP address or IP range, requests from a certain region
or headers that contains a specific value.

## Configured Security Rules

In NAIS the GCA uses a set of [preconfigured](https://cloud.google.com/armor/docs/rule-tuning) complex WAF rules with
dozens of signatures that are compiled from open source industry standard
source [MOD Security Core Rules](https://github.com/coreruleset/coreruleset/tree/v3.0/master).

## Paranoia Level

[ModSecurity](https://cloud.google.com/armor/docs/rule-tuning#preconfigured_modsecurity_rules) paranoia level setting
allows you to choose the desired level of rule checks.

Each NAIS load-balancer is configured with `level 1` for each set of `ModSecurity rule`.

A lower sensitivity level indicates a higher confidence signature, which is less likely to generate a false positive.
