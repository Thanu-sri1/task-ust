# TaskFlow Helm Chart

This chart was created from the existing `k8s-manifests/dev` resources and supports both environments using values files.

## Install or upgrade in dev

```bash
helm upgrade --install taskflow ./helm -f ./helm/values.yaml --namespace dev --create-namespace
```

## Install or upgrade in prod

```bash
helm upgrade --install taskflow ./helm -f ./helm/values-prod.yaml --namespace prod --create-namespace
```

## Notes

- Existing files under `k8s-manifests/` are unchanged.
- `values.yaml` mirrors the dev manifest settings.
- `values-prod.yaml` contains production-style overrides (namespace, replicas, resources, secret format, and image placeholders).
