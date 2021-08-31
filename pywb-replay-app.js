function PywbReplayApp(config) {

}
/**
 * @desc Initialize (display) the banner
 */
PywbReplayApp.prototype.init = function() {

};
/**
 * @desc Updates the contents displayed by the banner
 * @param {?string} url - The URL of the replayed page to be displayed in the banner
 * @param {?string} ts - A timestamp to be displayed in the banner
 * @param {boolean} is_live - Are we in live mode
 * @param {?string} title - The title of the replayed page to be displayed in the banner
 */
PywbReplayApp.prototype.set_banner = function(url, ts, is_live, title) {
    window.document.title = title;
    this.isLoading = false;
};
/**
 * @desc Called by ContentFrame to detect if the banner is still showing
 * that the page is loading
 * @returns {boolean}
 */
PywbReplayApp.prototype.stillIndicatesLoading = function() {
    return this.isLoading;
};

/**
 * @param {string} url - The URL of the replayed page
 * @param {?string} ts - The timestamp of the replayed page.
 * If we are in live mode this is undefined/empty string
 * @param {boolean} is_live - A bool indicating if we are operating in live mode
 */
PywbReplayApp.prototype.updateCaptureInfo = function(url, ts, is_live) {
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
PywbReplayApp.prototype.onMessage = function(event) {
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
