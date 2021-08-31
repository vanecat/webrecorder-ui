<html>
<head>
    <script src='/integration/static/wb_frame.js'> </script>
    <link type="text/css" rel="stylesheet" href="/dist/main.css" />
      <script src="/dist/main.js"></script>
      <script src="/pywb-replay-query.js"></script>
      <script src="/pywb-replay-app.js"></script>
</head>
<body>
<?php require_once('../dist/main.html'); ?>
<div id="wb_iframe_div" style="width: 100vw; height 50vh;">
  <iframe id="replay_iframe" frameborder="0" seamless="seamless" scrolling="yes" class="wb_iframe" allow="autoplay; fullscreen" style="width: 100%; height: 100%;"></iframe>
</div>
<script>
  const rootUrl = 'http://webarchive:8888';
  const pathsAndLocalesConfig = {
      prefix: `${rootUrl}/integration/en/archive/`,
      staticPrefix: `${rootUrl}/integration/static/`,
      locale: "en",
      curr_locale: "en",
      locales: ['en', 'cy'],
      locale_prefixes: {"en":`${rootUrl}/integration/en/archive/`,"cy":`${rootUrl}/integration/cy/archive/`},
  };
  const localizedText = {
      liveMsg: decodeURIComponent("Live On"),
      calendarAlt: decodeURIComponent("Calendar icon"),
      calendarLabel: decodeURIComponent("Back to Calendar"),
      choiceLabel: decodeURIComponent("Language:"),
      loadingLabel: decodeURIComponent("Loading..."),
      logoAlt: decodeURIComponent("UK Web Archive Logo"),
      months: {
        '01': "January",
        '02': "February",
        '03': "March",
        '04': "April",
        '05': "May",
        '06': "June",
        '07': "July",
        '08': "August",
        '09': "September",
        '10': "October",
        '11': "November",
        '12': "December",
      },
      version: "capture",
      versions: "captures",
      result: "result",
      results: "results",
      viewAllCaptures: "View All Captures",
      searchResultsTitle: 'Search Results',
      dateTime: "Date Time: ",
  };
  const config = {
      initialView: { url: '', timestamp: null},
      isGmt: false,
      logoImg: `${rootUrl}/integration/static/ukwa-2018-w-sml.png`,
      localizedText: localizedText,
      pathsAndLocales: pathsAndLocalesConfig
  }
</script>

<script>


    function getInitialUrl() {
        const urlString = String(window.location).replace(config.pathsAndLocales.prefix, '');
        let urlMatch = urlString.match(/^([*0-9]+)\/(.+)$/);
        if (urlMatch) {
            return {timestamp: urlMatch[1].replace('*', ''), url: urlMatch[2]};
        }
        return false;
    }
    config.initialView = getInitialUrl();
    console.log(config.initialView);
    if (!config.initialView) {
        throw Error('no url to load');
    }

    new PywbReplayQuery(Object.assign({text: localizedText}, pathsAndLocalesConfig))
        .onDataDone(data => PywbVue.init(config, data))
        .init();

    PywbVue.onShowSnapshot(snapshotOrUrl => {
        if (snapshotOrUrl) {
            if (!window.PywbReplayFrame) {
                window.PywbReplayFrame = new ContentFrame({"iframe": "#replay_iframe", url: config.initialView.url, request_ts: config.initialView.timestamp});
            }
            if (snapshotOrUrl instanceof PywbSnapshot) {
                window.PywbReplayFrame.load_url(snapshotOrUrl.url, snapshotOrUrl.id);
            }
        }
        window.PywbReplayFrame.iframe.style.display = snapshotOrUrl ? '' : 'none';
    });
</script>
</body>
</html>