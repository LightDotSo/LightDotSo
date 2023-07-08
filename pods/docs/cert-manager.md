1.

gcloud iam service-accounts keys create key.json --iam-account dns01-solver@lightdotso.iam.gserviceaccount.com

2.

kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file=key.json

3. https://artifacthub.io/packages/helm/cert-manager/cert-manager

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.2/cert-manager.crds.yaml

4.

helm install cert-manager jetstack/cert-manager --version 1.12.2 \
 --namespace cert-manager --create-namespace \
 --set global.leaderElection.namespace=cert-manager,installCRDs=true,cainjector.enabled=true

5.

kubectl apply -f pods/cert-issuer.yml

6.

kubectl apply -f pods/cert-certificate.yml

7.

kubectl apply -f pods/serve-ingress.yml
