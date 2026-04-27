# Argo CD App of Apps for TaskFlow (Helm-Based)

This setup uses the App-of-Apps pattern with environment-specific parent apps:

- `taskflow-parent-dev` -> manages child apps from `argocd/apps/dev`
- `taskflow-parent-prod` -> manages child apps from `argocd/apps/prod`

## Files

- `parent-dev.yaml`: parent `Application` for `dev`
- `parent-prod.yaml`: parent `Application` for `prod`
- `parent-app.yaml`: combined parent `Application` resources for both envs
- `app-of-apps.yaml`: same combined parent definitions (kept for compatibility)
- `apps/dev/*.yaml`: per-microservice child apps for `dev`
- `apps/prod/*.yaml`: per-microservice child apps for `prod`

## Apply

Apply only the parent you want:

```bash
kubectl apply -f argocd/parent-dev.yaml
# or
kubectl apply -f argocd/parent-prod.yaml
```

Argo CD will automatically create/sync child applications from the selected environment path:

- `argocd/apps/dev`
- `argocd/apps/prod`

## Notes

- Repo URL: `https://github.com/Thanu-sri1/task-ust.git`
- Branch: `main`
- All parent and child `Application` manifests use `project: default` (no custom `AppProject` required).
- `CreateNamespace=true` is enabled for parent and child apps.
- Child apps reference split Helm charts under `helm/<microservice>`.
