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
<div id="wb_iframe_div">
  <iframe id="replay_iframe" frameborder="0" seamless="seamless" scrolling="yes" class="wb_iframe" allow="autoplay; fullscreen"></iframe>
</div>
<script>
  const pathsAndLocalesConfig = {
      prefix: "/integration/en/archive/",
      staticPrefix: "/integration/static/",
      locale: "en",
      curr_locale: "en",
      locales: ['en', 'cy'],
      locale_prefixes: {"en":"/integration/en/archive/","cy":"/integration/cy/archive/"},
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
    }
  }
  const config = {
      initialView: 'calendar',
      isGmt: false,
      logoImg: "/integration/static/ukwa-2018-w-sml.png",
      localizedText: localizedText,
      pathsAndLocales: pathsAndLocalesConfig
  }
</script>

<script>
    var replayIframe = new ContentFrame({"url": "https://www.gov.uk/" + window.location.hash,
        "prefix": "/en/archive/",
        "request_ts": "20140218231242",
        "iframe": "#replay_iframe"});

    new PywbReplayQuery(pathsAndLocalesConfig)
        .onDataDone(data => PywbVue.init(config, data))
        .init();

    PywbVue.onShowSnapshot(url => {
        if (url) {
            replayIframe.set_url(url);
        }
        replayIframe.style.display = url ? '' : 'none';
    });
</script>
</body>
</html>