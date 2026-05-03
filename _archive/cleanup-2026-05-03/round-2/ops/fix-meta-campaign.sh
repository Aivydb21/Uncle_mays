#!/bin/bash

TOKEN="EAAhalZAHvAcYBRDcZBtAAZC87pOee19zbgZCdmEUyEQoWkHHPClerbvpHTh1bVtm5zTYQuPWCHxb5cFodX6OZBTwr7IhU9FIlVCTwIwqT7qAjxsZCeAC6DtKyGit5yfUOo1CpLt9aF5CteYc02KgKnxwksN3bf7FdUv8fcFEg2XLOe8iGqjdnAwv5cB8T7mUt45gZDZD"

# New ad set IDs
FB_FEED_ADSET="120243236041950762"
IG_STORIES_ADSET="120243236049950762"
IG_FEED_ADSET="120243236057640762"

# FB Feed creatives
FB_CREATIVES=(
  "1941801663878940:FB Feed Static 5"
  "2495177864245274:FB Feed Static 4"
  "1248625637387418:FB Feed Static 3"
  "1883322942413909:FB Feed Static 2"
  "2081699299060396:FB Feed Static 1"
  "2163339634491052:FB Feed Video 1"
  "3163598740478370:FB Feed Video 2"
)

# IG Stories creatives
IG_STORIES_CREATIVES=(
  "2972653666409834:IG Stories Static 3"
  "2215262499008461:IG Stories Static 1"
  "1410099744467879:IG Stories Static 2"
  "4422140048043457:IG Stories Static 5"
  "1274428311519330:IG Stories Static 4"
  "1639283954059682:IG Stories Video 1"
  "3966684956796146:IG Stories Video 2"
)

# IG Feed creatives
IG_FEED_CREATIVES=(
  "2219142068894374:IG Feed Static 4"
  "1482830730056011:IG Feed Static 3"
  "963494776091825:IG Feed Static 1"
  "1672932547491772:IG Feed Static 2"
  "2556586018070180:IG Feed Static 5"
  "1926022881451438:IG Feed Video 1"
  "3250473441797930:IG Feed Video 2"
)

echo "Creating FB Feed ads..."
for creative in "${FB_CREATIVES[@]}"; do
  IFS=':' read -r creative_id name <<< "$creative"
  echo "Creating ad: $name"
  curl -sS -X POST "https://graph.facebook.com/v21.0/act_814877604473301/ads" \
    -d "name=$name (Checkout)" \
    -d "adset_id=$FB_FEED_ADSET" \
    -d "creative={\"creative_id\":\"$creative_id\"}" \
    -d "status=ACTIVE" \
    -d "access_token=$TOKEN" | grep -o '"id":"[^"]*"' || echo "Failed"
done

echo -e "\nCreating IG Stories ads..."
for creative in "${IG_STORIES_CREATIVES[@]}"; do
  IFS=':' read -r creative_id name <<< "$creative"
  echo "Creating ad: $name"
  curl -sS -X POST "https://graph.facebook.com/v21.0/act_814877604473301/ads" \
    -d "name=$name (Checkout)" \
    -d "adset_id=$IG_STORIES_ADSET" \
    -d "creative={\"creative_id\":\"$creative_id\"}" \
    -d "status=ACTIVE" \
    -d "access_token=$TOKEN" | grep -o '"id":"[^"]*"' || echo "Failed"
done

echo -e "\nCreating IG Feed ads..."
for creative in "${IG_FEED_CREATIVES[@]}"; do
  IFS=':' read -r creative_id name <<< "$creative"
  echo "Creating ad: $name"
  curl -sS -X POST "https://graph.facebook.com/v21.0/act_814877604473301/ads" \
    -d "name=$name (Checkout)" \
    -d "adset_id=$IG_FEED_ADSET" \
    -d "creative={\"creative_id\":\"$creative_id\"}" \
    -d "status=ACTIVE" \
    -d "access_token=$TOKEN" | grep -o '"id":"[^"]*"' || echo "Failed"
done

echo -e "\nDone! All ads created."
