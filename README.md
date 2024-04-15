- ❗❗❗ Use yarn i instead of yarn install
- Deployed_url: https://api.alhkq.live


<!--
GC Storage cors:
view:
gcloud storage buckets describe gs://alhkq-public --format="default(cors_config)"
gcloud storage buckets describe gs://alhkq-private --format="default(cors_config)"

set:
gcloud storage buckets update gs://alhkq-public --cors-file=gc_cors_config.json
gcloud storage buckets update gs://alhkq-private --cors-file=gc_cors_config.json
-->
