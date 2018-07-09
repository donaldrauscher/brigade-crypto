const { events, Job } = require("brigadier")

events.on("exec", (e, p) => {
  var img = "gcr.io/" + p.secrets.projectId + "/brigade-crypto:latest"

  var j1 = new Job("j1", img)

  j1.storage.enabled = false

  j1.env = {
    "COIN_API_KEY": p.secrets.coinAPIKey
  }

  j1.tasks = [
    "set -o xtrace",
    "curl https://rest.coinapi.io/v1/quotes/current?filter_symbol_id=_SPOT_ --request GET --header \"X-CoinAPI-Key: $COIN_API_KEY\" -o quotes.json",
    "jq --compact-output '.[]' quotes.json > quotes.ndjson",
    "gsutil cp quotes.ndjson gs://djr-data/crypto/",
    "bq load --replace --source_format=NEWLINE_DELIMITED_JSON crypto.quotes gs://djr-data/crypto/quotes.ndjson"
  ]

  j1.run()
})
