# Workload CRUD-operations

This guide shows you how to perform CRUD-operations on your workload.

## Prerequisites
- [Command-line access to the cluster](./command-line-access/setup.md)
- [Member of a NAIS team](../explanation/team.md)
- [Workload spec](../explanation/workloads/README.md)

=== "Application"

    ## Create/apply the application spec
    
    ```shell
    kubectl apply -f nais.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    Verify that the application was successfully created by running `describe` on the Application:

    ```shell
    kubectl describe app <MY-APP>
    ```

    The events will tell you if the application was successfully created or not.


    ## Read/list your applications

    ```shell
    kubectl get application --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## Update/edit your application
    
    ```shell
    kubectl edit application <MY-APP> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```
    
    ## Delete your application
    
    ```shell
    kubectl delete application <MY-APP> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

=== "Naisjob"

    ## Create/apply the naisjob spec
    
    ```shell
    kubectl apply -f nais.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    Verify that the naisjob was successfully created by running `describe` on the Naisjob:

    ```shell
    kubectl describe naisjob <MY-NAISJOB>
    ```

    The events will tell you if the naisjob was successfully created or not.

    ## Read/list your naisjobs

    ```shell
    kubectl get naisjob --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## Update/edit your naisjob
    
    ```shell
    kubectl edit naisjob <MY-NAISJOB> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

    ## Delete your naisjob
    
    ```shell
    kubectl delete naisjob <MY-NAISJOB> --namespace=<MY-TEAM> --context=<MY-ENV>
    ```
