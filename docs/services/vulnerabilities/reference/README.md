---
tags: [ vulnerabilities, reference ]
---

# Vulnerability reference

## Project exists in Dependency-Track, but I can't see the SBOM or vulnerabilities

This issue likely arises from using the GitHub dependency graph resolution output JSON as an input for byosbom. 
This JSON format is incompatible with Dependency-track. 
Please use the SBOM generated by the nais/docker-build-push action instead.

To fix this, remove the similar input from your workflow:

```yaml
    byosbom: dependency-graph-reports/your-file.json
```

## Known limitations and alternatives

Due to [Trivy](https://github.com/aquasecurity/trivy-action), you'll receive a simplified dependency graph, as Trivy
doesn't support Gradle or Maven's dependency resolution.

Dependency-track integrates with Trivy at runtime, ensuring that vulnerabilities from the Docker container are still detected.

Trivy directly parses the .jar files without access to full dependency resolution details.

Gradle and Maven plugins provide a deeper graph of nested transitive dependencies.

### Gradle Plugin

??? Gradle Plugin

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

### Maven Plugin

??? Maven Plugin

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

