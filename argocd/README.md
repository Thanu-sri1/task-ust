# Argo CD App of Apps for TaskFlow (Helm-Based)

This setup uses the App-of-Apps pattern:

- Parent app: `taskflow-app-of-apps`
- Child apps: one `Application` per microservice per environment

## Files

- `project.yaml`: Argo CD `AppProject` named `taskflow`
- `app-of-apps.yaml`: parent `Application` that points to `argocd/apps`
- `apps/dev/*.yaml`: per-microservice child apps for `dev`
- `apps/prod/*.yaml`: per-microservice child apps for `prod`

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
- Child apps reference split Helm charts under `helm/<microservice>`.
