# Kubernetes deployment

## Install

Install Google Cloud SDK and kubectl:

```sh
brew install --cask google-cloud-sdk
gcloud components install kubectl
```

## Authenticate

Login to GCP and select the project:

```sh
gcloud auth login
gcloud config set project exploration-dev-417917
```

Set zone and fetch credentials for the target cluster:

```sh
gcloud config set compute/zone us-central1
gcloud container clusters get-credentials $CLUSTER_NAME
```

## Convert from Compose file

```sh
kompose -f ../docker-compose.yaml convert
```

See https://kompose.io/installation/

## Environment variables

```sh
# Delete if necessary
kubectl delete secret dipdup-env
kubectl create secret generic dipdup-env --from-env-file=.env
```

Update deployment files to use the secret:

```yaml
containers:
    - env:
      envFrom:
      - secretRef:
          name: dipdup-env
```

## Deploy

```sh
kubectl apply -f .
```

Check status:

```sh
kubectl get pods
kubectl get services
```

Inspect logs:

```sh
kubectl logs [POD_NAME]
```

## Remove deployment

```sh
kubectl delete -f .
```

## Upload Docker images

```sh
gcloud auth configure-docker us-central-docker.pkg.dev
docker tag ghcr.io/cultofthepump/indexer:latest us-central1-docker.pkg.dev/exploration-dev-417917/cotp/indexer:latest
docker push us-central1-docker.pkg.dev/exploration-dev-417917/cotp/indexer:latest
```

## Configure load balancer

Once you have applied Hasura ingress there are some extra steps to make things work:
1. Find `*-default-hasura-ingress-*` load balancer in resources
2. Edit frontends: add HTTPS with permanent (static) IP and Google managed certificate for `<static-ip-address>.nip.io`
3. Find the `*-default-hasura-8080-*` backend
4. Update health check - it should be `/healthz` at port 8080
