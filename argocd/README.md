# Argo CD App of Apps for TaskFlow (Helm-Based)

This setup uses the App-of-Apps pattern:

- Parent app: `taskflow-app-of-apps`
- Child apps:
  - `taskflow-dev` (uses `helm/values.yaml`)
  - `taskflow-prod` (uses `helm/values-prod.yaml`)

## Files

- `project.yaml`: Argo CD `AppProject` named `taskflow`
- `app-of-apps.yaml`: parent `Application` that points to `argocd/apps`
- `apps/taskflow-dev.yaml`: child app for dev
- `apps/taskflow-prod.yaml`: child app for prod

## Apply

Apply project first, then parent app:

```bash
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/app-of-apps.yaml
```

Argo CD will automatically create/sync child applications from `argocd/apps/`.

## Notes

- Repo URL: `https://github.com/Thanu-sri1/task-ust.git`
- Branch: `main`
- `CreateNamespace=true` is enabled for parent and child apps.
