#!/bin/bash
# GitHub Actions の secrets/variables を .env から一括設定するスクリプト
# 使い方: ./scripts/setup-secrets.sh
#
# 前提: gh CLI がインストール済みで認証済みであること

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env ファイルが見つかりません: $ENV_FILE"
  exit 1
fi

# .env から値を読み取る関数（ダブルクォートを除去）
get_env() {
  grep "^$1=" "$ENV_FILE" | cut -d= -f2- | sed 's/^"//;s/"$//'
}

echo "=== Variables を設定 ==="
gh variable set ENABLE_GA4 --body "true"
echo "✅ ENABLE_GA4"

gh variable set ENABLE_GSC --body "true"
echo "✅ ENABLE_GSC"

echo ""
echo "=== Secrets を設定 ==="

# Google Cloud - サービスアカウント
gh secret set GCP_CLIENT_EMAIL --body "$(get_env GCP_CLIENT_EMAIL)"
echo "✅ GCP_CLIENT_EMAIL"

gh secret set GCP_PRIVATE_KEY --body "$(get_env GCP_PRIVATE_KEY)"
echo "✅ GCP_PRIVATE_KEY"

# Google Analytics 4
gh secret set GA4_PROPERTY_ID --body "$(get_env GA4_PROPERTY_ID)"
echo "✅ GA4_PROPERTY_ID"

# Google Search Console
gh secret set GSC_SITE_URL --body "$(get_env GSC_SITE_URL)"
echo "✅ GSC_SITE_URL"

# Google Ads
gh secret set GOOGLE_ADS_DEVELOPER_TOKEN --body "$(get_env GOOGLE_ADS_DEVELOPER_TOKEN)"
echo "✅ GOOGLE_ADS_DEVELOPER_TOKEN"

gh secret set GOOGLE_ADS_CLIENT_ID --body "$(get_env GOOGLE_ADS_CLIENT_ID)"
echo "✅ GOOGLE_ADS_CLIENT_ID"

gh secret set GOOGLE_ADS_CLIENT_SECRET --body "$(get_env GOOGLE_ADS_CLIENT_SECRET)"
echo "✅ GOOGLE_ADS_CLIENT_SECRET"

gh secret set GOOGLE_ADS_REFRESH_TOKEN --body "$(get_env GOOGLE_ADS_REFRESH_TOKEN)"
echo "✅ GOOGLE_ADS_REFRESH_TOKEN"

gh secret set GOOGLE_ADS_CUSTOMER_ID --body "$(get_env GOOGLE_ADS_CUSTOMER_ID)"
echo "✅ GOOGLE_ADS_CUSTOMER_ID"

echo ""
echo "✅ すべての secrets と variables を設定しました。"
