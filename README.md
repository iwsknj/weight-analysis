## ツール概要

体重の減量・増量のために
- 体重
- 摂取カロリー・PFC
- 消費カロリー
- 1日の歩数

を自動的にスプレッドシートへ記録して集約し、データポータルで分析するためのツール

## デプロイ方法

```sh
$ gcloud functions deploy recordHealthCareData --runtime nodejs16 \
   --region=asia-northeast1 \
   --trigger-resource [TOPIC_NAME] \
   --trigger-event google.pubsub.topic.publish \
   --project [PROJECT_ID]
```
