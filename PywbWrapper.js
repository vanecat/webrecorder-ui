function PywbWrapper() {

}
/**
 * @desc Initialize (display) the banner
 */
PywbWrapper.prototype.init = function() {
    this.createBanner('_wb_frame_top_banner');

    if (window.wbinfo) {
        this.set_banner(
            window.wbinfo.url,
            window.wbinfo.timestamp,
            window.wbinfo.is_live,
            window.wbinfo.is_framed ? '' : document.title
        );
    }
};
/**
 * @desc Updates the contents displayed by the banner
 * @param {?string} url - The URL of the replayed page to be displayed in the banner
 * @param {?string} ts - A timestamp to be displayed in the banner
 * @param {boolean} is_live - Are we in live mode
 * @param {?string} title - The title of the replayed page to be displayed in the banner
 */
PywbWrapper.prototype.set_banner = function(url, ts, is_live, title) {
    var capture_str;
    var title_str;

    if (!url) {
        this.captureInfo.innerHTML = window.banner_info.loadingLabel;
        this.bannerUrlSet = false;
        return;
    }

    if (!ts) {
        return;
    }

    if (title) {
        capture_str = title;
    } else {
        capture_str = url;
    }

    title_str = capture_str;

    capture_str = "<b id='title_or_url' title='" + capture_str + "'>" + capture_str + "</b>";

    capture_str += "<span class='_wb_capture_date'>";

    if (is_live) {
        title_str = window.banner_info.liveMsg + " " + title_str;
        capture_str += "<b>" + window.banner_info.liveMsg + "&nbsp;</b>";
    }

    capture_str += this.ts_to_date(ts, window.banner_info.is_gmt);
    capture_str += "</span>";

    this.calendarLink.setAttribute("href", window.banner_info.prefix + "*/" + url);
    this.calendarLink.style.display = is_live ? "none" : "";

    this.captureInfo.innerHTML = capture_str;

    window.document.title = title_str;

    this.bannerUrlSet = true;
};
/**
 * @desc Called by ContentFrame to detect if the banner is still showing
 * that the page is loading
 * @returns {boolean}
 */
PywbWrapper.prototype.stillIndicatesLoading = function() {
    return !this.bannerUrlSet;
};

/**
 * @param {string} url - The URL of the replayed page
 * @param {?string} ts - The timestamp of the replayed page.
 * If we are in live mode this is undefined/empty string
 * @param {boolean} is_live - A bool indicating if we are operating in live mode
 */
PywbWrapper.prototype.updateCaptureInfo = function(url, ts, is_live) {
    if (is_live && !ts) {
        ts = new Date().toISOString().replace(/[-T:.Z]/g, '');
    }
    this.set_banner(url, ts, is_live, null);
};

/**
 * @desc Called by ContentFrame when a message is received from the replay iframe
 * @param {MessageEvent} event - The message event containing the message received
 * from the replayed page
 */
PywbWrapper.prototype.onMessage = function(event) {
    var type = event.data.wb_type;

    if (type === 'load' || type === 'replace-url') {
        this.state = event.data;
        this.last_state = this.state;
        this.title = event.data.title || this.title;
    } else if (type === 'title') {
        this.state = this.last_state;
        this.title = event.data.title;
    } else {
        return;
    }
}