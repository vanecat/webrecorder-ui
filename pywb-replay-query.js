var colon = ':';
var usingWorkerStrat =
    typeof window.Worker === 'function' &&
    typeof window.fetch === 'function' &&
    typeof window.TextDecoder === 'function' &&
    typeof window.ReadableStream === 'function';

var first = 1;

/**
 * Class responsible for rendering the results of the query. If the query is considered regular
 * (no filter or match type query modifiers) the calender view is rendered otherwise the advanced search is rendered
 * @param {Object} init - Initialization info for rendering the results of the query
 */
function PywbReplayQuery(init) {
    if (!(this instanceof PywbReplayQuery)) return new PywbReplayQuery(init);
    this.prefix = init.prefix;
    this.cdxURL = this.prefix + 'cdx';
    this.staticPrefix = init.staticPrefix;
    this.queryInfo = {
        calView: true,
        complete: false,
        cdxQueryURL: null,
        url: null,
        hasFilter: false,
        searchParams: {
            present: false,
            includeInURL: false
        }
    };
    // references to the DOM structure elements that contain the to be rendered markup
    this.containers = {
        numCaptures: null,
        updatesSpinner: null,
        yearsListDiv: null,
        monthsListDiv: null,
        daysListDiv: null,
        advancedResultsList: null,
        countTextNode: null,
        versionsTextNode: null
    };
    // ids of the to be created dom elements that are important to rendering the query results
    this.domStructureIds = {
        queryInfoId: 'display-query-type-info',
        capturesMount: 'captures',
        numCaptures: 'num-captures',
        updatesSpinner: 'still-updating-spinner'
    };
    // memoized last active year month day tab information
    this.lastActiveYMD = {};
    this.lastActiveDaysTab = null;
    // regular expressing for checking the URL when no query params are present
    this.starQueries = {
        regularStr: '/*/',
        dtFromTo: /\/([^-]+)-([^/]+)\/(.+)/i,
        dtFrom: /\/([^/]+)\/(.+)/i
    };
    // regex for extracting the filter constraints and filter mods to human explanation
    this.filterRE = /filter([^a-z]+)([a-z]+):(.+)/i;
    this.filterMods = {
        '=': 'Contains',
        '==': 'Matches Exactly',
        '=~': 'Matches Regex',
        '=!': 'Does Not Contains',
        '=!=': 'Is Not',
        '=!~': 'Does Not Begins With'
    };
    this.text = init.text;
    this.versionString = null;
}

/**
 * Initializes the rendering process and checks the our locations URL to determine which
 * result view to render (calendar or advanced)
 * @return {void}
 */
PywbReplayQuery.prototype.init = function() {
    // strip the prefix from our locations URL leaving us with /dt-info/url or /*?...
    var queryPart = location.href.substring(this.prefix.length - 1);

    // check for from the search interface
    if (queryPart.indexOf('/*?url=') === 0) {
        // the query info came from the collections query interface and since we are
        // mimicking the cdx api here we need to parse our locations URL using the
        // WHATWG URL Standard since location.search is un-helpful here
        var searchURL = new URL(location.href);
        this.queryInfo.url = searchURL.searchParams.get('url');
        var haveMatchType = searchURL.searchParams.has('matchType');
        var haveFilter = searchURL.searchParams.has('filter');
        if (!haveMatchType) {
            // be extra sure the user did not input a URL that includes the match type
            this.determineViewFromQInfoURL();
        } else {
            this.queryInfo.searchParams.matchType = searchURL.searchParams.get(
                'matchType'
            );
        }
        if (this.queryInfo.calView) {
            this.queryInfo.calView = !(haveMatchType || haveFilter);
        }
        this.queryInfo.searchParams.from = searchURL.searchParams.get('from');
        this.queryInfo.searchParams.to = searchURL.searchParams.get('to');
        this.queryInfo.searchParams.present = true;
        this.queryInfo.rawSearch = location.search;
        this.queryInfo.hasFilter = haveFilter;
        return this.makeCDXRequest();
    }

    // check for /*/URL
    if (queryPart.indexOf(this.starQueries.regularStr) === 0) {
        this.queryInfo.url = queryPart.substring(
            queryPart.indexOf(this.starQueries.regularStr) +
            this.starQueries.regularStr.length
        );
        this.determineViewFromQInfoURL();
        return this.makeCDXRequest();
    }

    // check for /fromDT*-toDT*/url*
    var maybeDTStarQ = this.maybeExtractDTStarQuery(queryPart);
    if (maybeDTStarQ) {
        this.queryInfo.searchParams.present = true;
        this.queryInfo.searchParams.includeInURL = true;
        this.queryInfo.searchParams.from = maybeDTStarQ.from;
        this.queryInfo.searchParams.to = maybeDTStarQ.to;
        this.queryInfo.url = maybeDTStarQ.url;
        this.determineViewFromQInfoURL();
        return this.makeCDXRequest();
    }
};

/**
 * Determines the match type from the query URL if it includes the shortcuts
 * @return {void}
 */
PywbReplayQuery.prototype.determineViewFromQInfoURL = function() {
    var purl;
    var domainMatch =
        this.queryInfo.url.charAt(this.queryInfo.url.length - 1) === '*';

    try {
        // if parsing the query url via the WHATWG URL class fails (no scheme)
        // we are probably not rendering the date calendar
        purl = new URL(this.queryInfo.url);
    } catch (e) {}

    if (!purl) {
        // since purl is null we know we do not hav a valid URL and need to check
        // for the match type cases and if one is present update queryInfo
        var prefixMatch = this.queryInfo.url.substring(0, 2) === '*.';
        return this.updateMatchType(prefixMatch, domainMatch);
    }

    if (purl.search) {
        // the URL we are querying with has some search params
        // in this case we know we can not check for match type domain because
        // http://example.com?it=* is valid and the * here is for the search param
        return;
    }

    // there are no search params and may have http://example.com[*|/*]
    // indicating we are operating under match type domain
    return this.updateMatchType(null, domainMatch);
};

/**
 * Updates the queryInfo's searchParams property to reflect if CDX query is
 * using a match type depending on the supplied T/falsy mPrefix and mDomain values
 * @param {?boolean} prefixMatch - T/falsy indicating if the match type prefix condition is satisfied
 * @param {?boolean} domainMatch - T/falsy indicating if the match type domain condition is satisfied
 * @return {void}
 */
PywbReplayQuery.prototype.updateMatchType = function(prefixMatch, domainMatch) {
    // if mPrefix && mDomain something weird is up and we got *.xyz.com[*|/*]
    // default to prefix just to be safe since we know we got that for sure
    if ((prefixMatch && domainMatch) || prefixMatch) {
        this.queryInfo.searchParams.present = true;
        this.queryInfo.searchParams.matchType = 'prefix';
        this.queryInfo.calView = false;
        return;
    }
    if (domainMatch) {
        this.queryInfo.searchParams.present = true;
        this.queryInfo.searchParams.matchType = 'domain';
        this.queryInfo.calView = false;
    }
};

/**
 * Extracts the datetime information and url from the query part of our
 * locations URL if it exists otherwise returns null
 * @param {string} queryPart
 * @return {?{from: string, to?: string, url: string}}
 */
PywbReplayQuery.prototype.maybeExtractDTStarQuery = function(queryPart) {
    // check /from-to/url first
    var match = this.starQueries.dtFromTo.exec(queryPart);
    if (match) return { from: match[1], to: match[2], url: match[3] };
    // lastly check /from/url first
    match = this.starQueries.dtFrom.exec(queryPart);
    if (match) return { from: match[1], url: match[2] };
    return null;
};

/**
 * Constructs and returns the URL for the CDX query. Also updates the
 * queryInfo's cdxQueryURL property with the constructed URL.
 * @return {string}
 */
PywbReplayQuery.prototype.makeCDXQueryURL = function() {
    var queryURL;
    if (this.queryInfo.rawSearch) {
        queryURL = this.cdxURL + this.queryInfo.rawSearch + '&output=json';
    } else {
        queryURL =
            this.cdxURL +
            '?output=json&url=' +
            // ensure that any query params in the search URL are not considered
            // apart of the full query URL
            encodeURIComponent(this.queryInfo.url);
    }
    var querySearchParams = this.queryInfo.searchParams;
    if (querySearchParams.present && querySearchParams.includeInURL) {
        if (querySearchParams.from) {
            queryURL += '&from=' + querySearchParams.from.trim();
        }
        if (querySearchParams.to) {
            queryURL += '&to=' + querySearchParams.to.trim();
        }
    }
    this.queryInfo.cdxQueryURL = queryURL;
    return queryURL;
};

/**
 * Performs the query by requesting the CDX information from the cdx server.
 * How the results are received from the CDX API is done by of two strategies: using a web worker or in the main thread.
 * This is due to the fact that the query results can be LARGE and extracting the results in the main thread is not
 * preformat and will lock up the browser. The determination for if we can use the web worker strategy is
 * by checking if the browser has the symbols Worker, fetch, TextDecoder, and ReadableStream defined and are functions.
 * If we can use the web worker strategy a worker is created and updates the result view as it sends us the queries
 * cdx info. Otherwise the query is executed in the main thread and the results are both parsed and rendered in the
 * main thread.
 * @return {void}
 */
PywbReplayQuery.prototype.makeCDXRequest = function() {
    // if we are rendering the calendar view (regular result view) we need memoizedYMDT to be an object otherwise nothing
    var memoizedYMDT = this.queryInfo.calView ? {} : null;
    var renderCal = this;
    // initialized the dom structure
    this.createContainers();
    if (usingWorkerStrat) {
        // execute the query and render the results using the query worker
        var queryWorker = new window.Worker(this.staticPrefix + '/queryWorker.js');
        var cdxRecordMsg = 'cdxRecord';
        var done = 'finished';
        var months = this.text.months;

        queryWorker.onmessage = function(msg) {
            var data = msg.data;
            var terminate = false;
            if (data.type === cdxRecordMsg) {
                data.timeInfo.month = months[data.timeInfo.month];

                // render the results sent to us from the worker
                renderCal.displayedCountStr(
                    data.recordCount,
                    data.recordCountFormatted
                );
                if (renderCal.queryInfo.calView) {
                    renderCal.renderDateCalPart(
                        memoizedYMDT,
                        data.record,
                        data.timeInfo,
                        data.recordCount === first
                    );
                } else {
                    renderCal.renderAdvancedSearchPart(data.record);
                }
            } else if (data.type === done) {
                // the worker has consumed the entirety of the response body
                terminate = true;
                // if there were no results we need to inform the user
                renderCal.displayedCountStr(
                    data.recordCount,
                    data.recordCountFormatted
                );
            }
            if (terminate) {
                queryWorker.terminate();
                var spinner = document.getElementById(
                    renderCal.domStructureIds.updatesSpinner
                );
                if (spinner && spinner.parentNode) {
                    spinner.parentNode.removeChild(spinner);
                }
            }
        };
        queryWorker.postMessage({
            type: 'query',
            queryURL: this.makeCDXQueryURL()
        });
        return;
    }
    // main thread processing
    $.ajax(this.makeCDXQueryURL(), {
        dataType: 'text',
        success: function(data) {
            var cdxLines = data ? data.trim().split('\n') : [];
            if (cdxLines.length === 0) {
                renderCal.displayedCountStr(0, '0');
                return;
            }
            var numCdxEntries = cdxLines.length;
            renderCal.displayedCountStr(
                numCdxEntries,
                numCdxEntries.toLocaleString()
            );
            for (var i = 0; i < numCdxEntries; ++i) {
                var cdxObj = JSON.parse(cdxLines[i]);
                if (renderCal.queryInfo.calView) {
                    renderCal.renderDateCalPart(
                        memoizedYMDT,
                        cdxObj,
                        renderCal.makeTimeInfo(cdxObj),
                        i === 0
                    );
                } else {
                    renderCal.renderAdvancedSearchPart(cdxObj);
                }
            }
            var spinner = document.getElementById(
                renderCal.domStructureIds.updatesSpinner
            );
            if (spinner && spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
        }
    });
};