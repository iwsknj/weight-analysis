## ツール概要

体重の減量・増量のために
- 体重
- 摂取カロリー・PFC
- 消費カロリー
- 1日の歩数

を自動的にスプレッドシートへ記録して集約し、データポータルで分析するためのツール

## デプロイ方法

```sh
$ gcloud functions deploy recordHealthCareData --runtime nodejs20 \
   --region=asia-northeast1 \
   --trigger-resource [TOPIC_NAME] \
   --trigger-event google.pubsub.topic.publish \
   --project [PROJECT_ID]
```

## ローカルでのCloud functionsの実行方法(pubsub)

functions-frameworkを動かす

```shell
$ yarn watch
```

```shell
$ sh executePubSub.sh [fitbit|withings|myfitnesspal]
```


## ローカルでの記録方法

※1日のみ記録したい場合は同じ日付を入れる

```shell
$ ts-node executeForPeriod/fitbit.ts 2022/04/16 2022/04/17
$ ts-node executeForPeriod/myfitnesspall.ts 2022/04/16 2022/04/17
$ ts-node executeForPeriod/withings.ts 2022/04/16 2022/04/17
```
