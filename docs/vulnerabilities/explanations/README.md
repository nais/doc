---
tags: [ slsa, salsa, vulnerabilities, explanation ]
---

# Concepts surrounding vulnerability insights

This page offers an overview of the concepts related to vulnerability insights and explains how NAIS helps secure your software supply chain.
Much of the documentation revolves around these concepts, so having a basic understanding of them is helpful for navigating it effectively.


## SLSA

_Why is there so much focus on `Secure Supply Chain Levels for Software Artifacts`?_

[Supply Chain Levels for Software Artifacts](https://slsa.dev/) is a framework that sets security standards for software development
to protect against supply chain attacks. It defines different levels of security practices, from basic checks (like
verifying code sources) to advanced measures (like cryptographically signing builds), helping ensure that software is
built and delivered securely. The higher the level, the more secure the process, reducing risks like code tampering or
dependency vulnerabilities

### Supply Chain Attacks

A supply chain attack is a type of cyberattack where hackers target vulnerabilities in an organization's supply chain rather than attacking the organization directly. In the context of software, this typically involves compromising third-party software, libraries, or services that a company relies on to build, deploy, or operate its own software.

Attackers may inject malicious code into a software component, alter a tool in the development process, or compromise a service that handles software updates. Once the tampered component is distributed and integrated into other systems, it can lead to widespread damage, allowing attackers to breach multiple organizations at once.

Examples of software supply chain attacks include:

* Code tampering 🖥️: Inserting malware into open-source libraries or dependencies.
* Compromising build tools 🔧: Targeting CI/CD pipelines or build systems to alter software during development.
* Exploiting updates 🚨: Hijacking update mechanisms to distribute malicious updates.

These attacks are especially dangerous because they can often go unnoticed 🔍, as organizations typically trust third-party components and automatically integrate them without thorough verification.

### Attestation

In the context of Supply Chain Levels for Software Artifacts,
an attestation is a signed and verifiable statement that provides details about the software's build process and its integrity.
It acts as a proof or certification that the software was built in a secure environment following specific security practices.
Attestations typically include information such as:

* 🧑‍💻 The source code used for the build
* 🛠️ The build process, tools, and environment
* 🔐 Verification that the software hasn’t been tampered with
* 📦 Details about dependencies and their origins

In SLSA, attestations are crucial because they allow organizations to trust the software they are using or distributing.
These attestations can be checked to ensure that the software supply chain follows the necessary security standards and to reduce
the risk of supply chain attacks.

## Software Bill of Materials

[A Software Bill of Materials](https://en.wikipedia.org/wiki/Software_supply_chain) (SBOM) is a detailed list of all the components, 
libraries, and dependencies that make up a software application. It includes information about the versions, origins, and licenses of 
these components. An SBOM is essential for understanding what's inside your software, helping to identify vulnerabilities, track updates, 
and ensure compliance with licensing and security standards. It's like an ingredient list for software, providing transparency and control 
over what is used in the development process.

