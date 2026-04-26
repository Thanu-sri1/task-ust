# TaskFlow Helm Chart

This chart uses a standard single-chart layout:

- `helm/Chart.yaml`
- `helm/values.yaml`
- `helm/values-prod.yaml`
- `helm/templates/*.yaml`

The templates directory contains manifests for all microservices and shared resources.

## Install in dev

```bash
helm upgrade --install taskflow ./helm -f ./helm/values.yaml --namespace dev --create-namespace
```

## Install in prod

```bash
helm upgrade --install taskflow ./helm -f ./helm/values.yaml -f ./helm/values-prod.yaml --namespace prod --create-namespace
```
