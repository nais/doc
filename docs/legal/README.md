---
description: >-
  Laws and regulations, how nais handles them, and links to relevant risk and privacy documentation.
tags: [legal, ros, pvk, risk, privacy]
conditional: [tenant, nav]
---

# Legal

## Overview

This section contains comprehensive documentation on regulatory compliance, data protection, and risk management for the Nais platform.
These documents cover privacy impact assessments (PVK), risk assessments (ROS), archival requirements, vendor agreements, and organizational responsibilities.

## Key Principles

1. **Data Protection**: All cloud services and data storage must comply with EU/EEA regulations (Schrems II verdict)
2. **Shared Responsibility**: Clear separation between Nais team, platform teams, and cloud vendors
3. **Technology Agnostic Assessments**: PVK assessments should focus on data handling principles, not specific tech stacks
4. **Regular Updates**: PVK and ROS documents should be kept up-to-date throughout application lifecycle
5. **Norwegian Compliance**: Archival and regulatory requirements must account for Norwegian law (Arkivloven)


## Document Structure

### Core Compliance Documents

#### [Application Privacy Impact Assessments (PVK)](app-pvk.md)
Guidance for teams deploying applications on Nais on writing Privacy Impact Assessments (PVK).

#### [Application Risk Assessments (ROS)](app-ros.md)
Guidance for teams deploying applications on Nais on writing Risk Assessments (ROS).

#### [Platform Privacy Impact Assessments (PVK)](nais-pvk.md)
Overview of the Nais platform's privacy posture.

#### [Platform Risk Assessments (ROS)](nais-ros.md)
Compilation of risk assessments conducted by the Nais team for platform components.

#### [Responsibilities - Nais and Teams](roles-responsibilities.md)
Clarifies ownership boundaries across the Nais ecosystem.

### Regulatory & Archival Documents

#### [Arkivloven (The Archival Act)](arkivloven.md)
Guide to Norwegian archival requirements for public bodies.

### Vendor Data Processor Agreements (DPA)

The [DPA folder](dpa/README.md) contains Data Processor Agreements with cloud vendors used by Nais:

- [Google Cloud Platform DPA](dpa/gcp-dpa.md)
- [Microsoft Azure DPA](dpa/azure-dpa.md)
- [Aiven DPA](dpa/aiven-dpa.md)

## For teams using Nais 

- **Before deploying**: Conduct both [PVK](app-pvk.md) and [ROS](app-ros.md) assessments
- **Design principle**: Use technology-agnostic language in PVK, technology-specific details in ROS
- **Cloud migration**: Review [Arkivloven](arkivloven.md) and [DPA](dpa/README.md) guidance
- **References**: Use [Platform ROS](nais-ros.md) to understand underlying component risks
- **Responsibility clarity**: See [Roles and Responsibilities](roles-responsibilities.md) for ownership boundaries
