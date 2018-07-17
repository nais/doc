NAIS manifest
=============

This file contains the configuration of your NAIS application. It must reside within the git repository together with your source code.

The main documentation for the content of this file is found here: https://github.com/nais/naisd/blob/master/nais_example.yaml

## Documented manifest values

Below you will find documentation on some of the values you can set in the manifest.

* [Alerts](/contracts/alert) - Alerts sent to Slack based on Prometheus scraping

* [Fasit resources](/contracts/fasit_resources) - Resources retrieved from Fasit

* [Leader Election](/contracts/leader_election) - Leader election between pods in a replicat set

* [Prometheus](/contracts/metrics) - Metrics scraping from end point

* [Redis](/contracts/redis) - Non-persistant in-memory data structure store
