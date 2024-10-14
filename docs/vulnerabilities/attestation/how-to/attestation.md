---
tags: [attestation, docker-build-push, how-to]
---

# Docker Build Push

Simply add [nais/docker-build-push](https://github.com/nais/docker-build-push) to your workflow.

```yaml
 - uses: nais/docker-build-push@v0
   id: docker-push
   with:
     team: myteam # required
     salsa: true # optional, defaults to true
     project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # required, but is defined as an organization variable
     identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # required, but is defined as an organization secret
     # ... other options removed for readability
```

??? note Opt-out
    Opt-out from salsa

    If you want to opt-out from salsa you can set the salsa input to false

    ```yaml
    salsa: false
    ```

## Attest sign

The `nais/docker-build-push` action default push to Google Container Registry (GAR).
If you want to push to another registry, you can use the [nais/attest-sign](https://github.com/nais/attest-sign) to generate sbom and sign the attestation.

```yaml
 - uses: nais/attest-sign@v1
   id: attest-sign
   with:
     image_ref: my-image@sha256:12345 # required
     sbom: my-image.json # optional
     # ... other options removed for readability
```

## Known limitations and alternatives

Due to [Trivy](https://github.com/aquasecurity/trivy-action), you'll receive a simplified dependency graph, as Trivy 
doesn't support Gradle or Maven's dependency resolution. However, the benefit is that it identifies both the image dependencies 
and their associated vulnerabilities.

Trivy directly parses the .jar files without access to full dependency resolution details.

Gradle and Maven plugins provide a deeper graph of nested transitive dependencies, 
but when using these plugins directly, you won't get vulnerabilities specific to the Docker container. 
However, if you're using Distroless or Chainguard images, updates are managed and kept to a minimum.

??? note Gradle Plugin

    Add the following plugin to your `build.gradle*` file.

    ```groovy
        id("org.cyclonedx.bom") version "1.x.x"
    ```

    In your workflow you can generate a SBOM with the following gradle task command:

    ```yaml
        - name: Generate and output SBOM
          run: ./gradlew cyclonedxBom
    ```

    The SBOM will be default located at `build/reports/bom.json`. Pass the SBOM to the `nais/docker-build-push` action with the following input:

    ```yaml
        uses: nais/docker-build-push@v0
        with:
          byosbom: build/reports/bom.json
    ```

    For `nais/attest-sign` action:
    
        ```yaml
            uses: nais/attest-sign@v1
            with:
                sbom: build/reports/bom.json
        ```
  
    For more info about settings check out the [CycloneDx Gradle Plugin](https://github.com/CycloneDX/cyclonedx-gradle-plugin)

??? note Maven Plugin
    Add the following to your `pom.xml` file.

    ```xml
        <plugins>
            <plugin>
                <groupId>org.cyclonedx</groupId>
                <artifactId>cyclonedx-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>makeAggregateBom</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    ```

    In your workflow you can generate a SBOM with the following maven command:

    ```yaml
        - name: Generate and output SBOM
          run: ./mvnw package
    ```

    The SBOM will be default located at `target/bom.json`. Pass the SBOM to the `nais/docker-build-push` action with the following input:

    ```yaml
        uses: nais/docker-build-push@v0
        with:
          byosbom: target/bom.json
    ```

    For `nais/attest-sign` action:
    
        ```yaml
            uses: nais/attest-sign@v1
            with:
                sbom: target/bom.json
        ```
    For more info about settings check out the [CycloneDx Maven Plugin](https://github.com/CycloneDX/cyclonedx-maven-plugin)