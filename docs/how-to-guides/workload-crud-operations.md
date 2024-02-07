# Workload CRUD-operations

This guide shows you how to perform CRUD-operations on your workload.

## 0. Prerequisites
- [Command-line access to the cluster](./command-line-access.md)
- [Member of a NAIS team](../explanation/team.md)
- [Workload spec](../explanation/workloads/README.md)

=== "Application"

    ## 1. Create/apply the application spec
    
    ```shell
    kubectl apply -f nais.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    Verify that the application was successfully created by running `describe` on the Application:

    ```shell
    kubectl describe app <MY-APP>
    ```

    The events will tell you if the application was successfully created or not.


    ## 2. Read/list your applications

    ```shell
    kubectl get application --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## 3. Update/edit your application
    
    ```shell
    kubectl edit application <MY-APP> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```
    
    ## 4. Delete your application
    
    ```shell
    kubectl delete application <MY-APP> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

=== "Naisjob"

    ## 1. Create/apply the naisjob spec
    
    ```shell
    kubectl apply -f nais.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    Verify that the naisjob was successfully created by running `describe` on the Naisjob:

    ```shell
    kubectl describe naisjob <MY-NAISJOB>
    ```

    The events will tell you if the naisjob was successfully created or not.

    ## 2. Read/list your naisjobs

    ```shell
    kubectl get naisjob --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## 3. Update/edit your naisjob
    
    ```shell
    kubectl edit naisjob <MY-NAISJOB> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## 4. Delete your naisjob
    
    ```shell
    kubectl delete naisjob <MY-NAISJOB> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```
