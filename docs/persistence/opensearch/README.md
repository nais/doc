---
tags: [opensearch, explanation, persistence, services]
---

# OpenSearch

<<gcp_only("OpenSearch")>>

OpenSearch is a fork of Elasticsearch that is maintained by Amazon. It is a drop-in replacement for Elasticsearch, and is fully compatible with the Elasticsearch API. It is a community-driven project that is open source and free to use.

OpenSearch is a distributed, RESTful search and analytics engine capable of solving search related use cases. It is a good choice for implementing search over documents.

OpenSearch can index documents without storing them allowing you to save on storage space at the cost of not being able to retrieve the contents of the document.
This enables patterns where you use OpenSearch as a way of indexing into other forms of persistence.
Combining opensearch with a separate master data store such as PostgreSQL is a very common pattern.
Using PosgreSQL with OpenSearch in this way gives you the same data durability and backup policies as you have with PostgreSQL.

A very powerful pattern for OpenSearch is search and filter, also known as [faceted search](https://opensearch.org/docs/latest/aggregations/bucket/index/).

Nais offers OpenSearch via [Aiven](https://aiven.io/).
Aiven OpenSearch can be used by applications in all environments, but must be *defined* in a GCP cluster.
All OpenSearch instances on Aiven, regardless of plan, are backed up but there are no disaster backups outside of the provider.
