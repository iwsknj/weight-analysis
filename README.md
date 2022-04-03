## デプロイ方法

```sh
$ gcloud functions deploy recordHealthCareData --runtime nodejs16 \
   --region=asia-northeast1 \
   --trigger-resource [TOPIC_NAME] \
   --trigger-event google.pubsub.topic.publish \
   --project [PROJECT_ID]
```
