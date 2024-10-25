---
tags: [attestation, reference]
---

# Attestation reference

## Known limitations and alternatives

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