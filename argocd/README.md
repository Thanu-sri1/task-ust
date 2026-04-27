# Argo CD App of Apps for TaskFlow (Helm-Based)

This setup uses the App-of-Apps pattern with environment-specific parent apps:

- `taskflow-parent-dev` -> manages child apps from `argocd/apps/dev`
- `taskflow-parent-prod` -> manages child apps from `argocd/apps/prod`

## Files

- `project.yaml`: Argo CD `AppProject` named `taskflow`
- `parent-app.yaml`: parent `Application` resources for both `dev` and `prod`
- `app-of-apps.yaml`: same parent definitions (kept for compatibility)
- `apps/dev/*.yaml`: per-microservice child apps for `dev`
- `apps/prod/*.yaml`: per-microservice child apps for `prod`

## Apply

Apply project first, then parent app manifests:

```bash
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/parent-app.yaml
```

Argo CD will automatically create/sync child applications from:

- `argocd/apps/dev`
- `argocd/apps/prod`

## Notes

- Repo URL: `https://github.com/Thanu-sri1/task-ust.git`
- Branch: `main`
- `CreateNamespace=true` is enabled for parent and child apps.
- Child apps reference split Helm charts under `helm/<microservice>`.
