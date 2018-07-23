const { events, Job } = require("brigadier")

function makeImg(p) {
  return "gcr.io/" + p.secrets.projectId + "/brigade-crypto:latest"
}

function mailgunCmd(e, p) {
  var key = p.secrets.mailgunAPIKey

  if (e.cause.trigger == 'success'){
    var msg = "Build " + e.cause.event.buildID + " ran successfully"
  } else {
    var msg = e.cause.reason
  }
  
  return `
    curl -s --user "api:${key}" https://api.mailgun.net/v3/mg.donaldrauscher.com/messages \
    -F from="mg@donaldrauscher.com" \
    -F to="donald.rauscher@gmail.com" \
    -F subject="Brigade Notification" \
    -F text="${msg}"
  `
}

events.on("exec", (e, p) => {
  var j1 = new Job("j1", makeImg(p))

  j1.storage.enabled = false

  j1.env = {
    "COIN_API_KEY": p.secrets.coinAPIKey,
    "TIMESTAMP": e.payload.trim()
  }

  j1.tasks = [
    "export TIMESTAMP=${TIMESTAMP:-$(date '+%Y-%m-%dT%H:%M')}",
    "curl https://rest.coinapi.io/v1/quotes/current?filter_symbol_id=_SPOT_ --request GET --header \"X-CoinAPI-Key: $COIN_API_KEY\" --fail -o quotes.json",
    "jq --compact-output '.[]' quotes.json > quotes.ndjson",
    "gsutil cp quotes.ndjson gs://djr-data/crypto/$TIMESTAMP/quotes.ndjson",
    "bq load --replace --source_format=NEWLINE_DELIMITED_JSON crypto.quotes gs://djr-data/crypto/$TIMESTAMP/quotes.ndjson"
  ]

  j1.run()
})

events.on("after", (e, p) => {
  var a1 = new Job("a1", makeImg(p))
  var cmd = mailgunCmd(e, p)
  a1.storage.enabled = false
  a1.tasks = [cmd]
  a1.run()
})

events.on("error", (e, p) => {
  var e1 = new Job("e1", makeImg(p))
  var cmd = mailgunCmd(e, p)
  e1.storage.enabled = false
  e1.tasks = [cmd]
  e1.run()
})