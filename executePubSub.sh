#!/bin/sh
set -e

case $1 in
  "fitbit" )
    data='Zml0Yml0'
    ;;
  "withings" )
    data='d2l0aGluZ3M='
    ;;
  "myfitnesspal" )
    data='bXlmaXRuZXNzcGFs'
    ;;
  * )
    echo 'Arugument not set'
    exit
    ;;
esac

curl localhost:8080 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "context": {
          "eventId":"1144231683168617",
          "timestamp":"2020-05-06T07:33:34.556Z",
          "eventType":"google.pubsub.topic.publish",
          "resource":{
            "service":"pubsub.googleapis.com",
            "name":"projects/sample-project/topics/gcf-test",
            "type":"type.googleapis.com/google.pubsub.v1.PubsubMessage"
          }
        },
        "data": {
          "@type": "type.googleapis.com/google.pubsub.v1.PubsubMessage",
          "attributes": {
             "attr1":"attr1-value"
          },
          "data": "'"$data"'"
        }
      }'
