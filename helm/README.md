# TaskFlow Helm Charts (Split Per Microservice)

The `helm/` folder now contains separate Helm charts for each microservice plus shared resources.

Argo CD compatibility is provided through an umbrella chart at:

- `helm/Chart.yaml`
- `helm/values.yaml`
- `helm/values-prod.yaml`

## Charts

- `shared`
- `mongo`
- `auth-service`
- `user-service`
- `task-service`
- `notification-service`
- `analytics-service`
- `api-gateway`
- `frontend`

## Umbrella chart (for Argo CD `path: helm`)

```bash
helm upgrade --install taskflow ./helm -f ./helm/values.yaml --namespace dev --create-namespace
helm upgrade --install taskflow ./helm -f ./helm/values-prod.yaml --namespace prod --create-namespace
```

## Install order

Apply shared resources first, then mongo, then the app services.

## Dev install

```bash
helm upgrade --install taskflow-shared ./helm/shared -f ./helm/shared/values.yaml --namespace dev --create-namespace
helm upgrade --install taskflow-mongo ./helm/mongo -f ./helm/mongo/values.yaml --namespace dev
helm upgrade --install taskflow-auth ./helm/auth-service -f ./helm/auth-service/values.yaml --namespace dev
helm upgrade --install taskflow-user ./helm/user-service -f ./helm/user-service/values.yaml --namespace dev
helm upgrade --install taskflow-task ./helm/task-service -f ./helm/task-service/values.yaml --namespace dev
helm upgrade --install taskflow-notification ./helm/notification-service -f ./helm/notification-service/values.yaml --namespace dev
helm upgrade --install taskflow-analytics ./helm/analytics-service -f ./helm/analytics-service/values.yaml --namespace dev
helm upgrade --install taskflow-api-gateway ./helm/api-gateway -f ./helm/api-gateway/values.yaml --namespace dev
helm upgrade --install taskflow-frontend ./helm/frontend -f ./helm/frontend/values.yaml --namespace dev
```

## Prod install

```bash
helm upgrade --install taskflow-shared ./helm/shared -f ./helm/shared/values.yaml -f ./helm/shared/values-prod.yaml --namespace prod --create-namespace
helm upgrade --install taskflow-mongo ./helm/mongo -f ./helm/mongo/values.yaml -f ./helm/mongo/values-prod.yaml --namespace prod
helm upgrade --install taskflow-auth ./helm/auth-service -f ./helm/auth-service/values.yaml -f ./helm/auth-service/values-prod.yaml --namespace prod
helm upgrade --install taskflow-user ./helm/user-service -f ./helm/user-service/values.yaml -f ./helm/user-service/values-prod.yaml --namespace prod
helm upgrade --install taskflow-task ./helm/task-service -f ./helm/task-service/values.yaml -f ./helm/task-service/values-prod.yaml --namespace prod
helm upgrade --install taskflow-notification ./helm/notification-service -f ./helm/notification-service/values.yaml -f ./helm/notification-service/values-prod.yaml --namespace prod
helm upgrade --install taskflow-analytics ./helm/analytics-service -f ./helm/analytics-service/values.yaml -f ./helm/analytics-service/values-prod.yaml --namespace prod
helm upgrade --install taskflow-api-gateway ./helm/api-gateway -f ./helm/api-gateway/values.yaml -f ./helm/api-gateway/values-prod.yaml --namespace prod
helm upgrade --install taskflow-frontend ./helm/frontend -f ./helm/frontend/values.yaml -f ./helm/frontend/values-prod.yaml --namespace prod
```
