# Argo CD Setup for TaskFlow (Helm-Based)

These manifests deploy your existing `helm/` chart through Argo CD for both namespaces:

- `dev` via `values.yaml`
- `prod` via `values-prod.yaml`

## Files

- `project.yaml`: Argo CD `AppProject` named `taskflow`
- `taskflow-dev.yaml`: Argo CD `Application` for dev
- `taskflow-prod.yaml`: Argo CD `Application` for prod

## Apply

```bash
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/taskflow-dev.yaml
kubectl apply -f argocd/taskflow-prod.yaml
```

Or apply all at once:

```bash
kubectl apply -f argocd/
```

## Notes

- The applications use repo `https://github.com/Thanu-sri1/task-ust.git` and branch `main`.
- `CreateNamespace=true` is enabled, so Argo CD creates `dev` and `prod` namespaces if missing.
- No existing project files were modified; only this new `argocd/` folder was added.
