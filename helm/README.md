## Creating new versions of this chart
1. Update the `version` property in `helm/Chart.yaml` to the desired version number.
2. From the `helm/` directory, run the command `helm package ./` to create a `.tgz` package for the new version.
3. Move the new `.tgz` file to the `docs/` directory (`mv notify-bc-[version].tgz ../docs/helm`).
4. Update `docs/helm/index.yaml` to list the new package (`helm repo index ../docs/helm`).

## Deploying to OpenShift
1. In this example we will be deploying to `dev`, so a file named `values.dev.local.yaml` should exist and contain values specific to the `dev` instance.
1. Run `helm install dev -f platform-specific/openshift.yaml -f values.yaml -f values.dev.local.yaml ./`
    - If a deployment already exists, run `helm uninstall dev` to remove it, then repeat the command above.
1. To deploy to `test`, replace `dev` with `test` in the above example.

## Deploying BuildConfig and ImageStream for NotifyBC application
```bash
# Step 1 - Go to helm/ directory of repo
cd helm
# Step 2 - Login to OpenShift oc command line
oc login --token=secret-token --server=https://myopnshift.com
# Step 3 - Choose the tools folder
oc project 12345-tools
# step 4 - Apply deployment file
oc apply -f deployments/openshift/notify-build.yaml
```
