const { events, Job } = require("brigadier")

events.on("exec", (e, p) => {
  var j1 = new Job("download", "gcr.io/cloud-builders/gcloud:latest")

  j1.storage.enabled = false

  j1.env = {
    "COIN_API_KEY": p.secrets.coinAPIKey
  }

  j1.tasks = [
    "set -o xtrace",
    "curl https://rest.coinapi.io/v1/quotes/current?filter_symbol_id=_SPOT_ --request GET --header \"X-CoinAPI-Key: $COIN_API_KEY\" -o quotes.json",
    "gsutil cp quotes.json gs://djr-data/crypto/"
  ]

  j1.run()
})
