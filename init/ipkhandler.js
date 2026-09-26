/*
 * ipkhandler.js -- hand a package to whichever app installs .ipk files.
 *
 * Apps can't open an .ipk by target ("Unauthorized call to open an ipk"), so the Museum asks
 * which apps handle application/vnd.webos.ipk (listAllHandlersForMime) and launches the active
 * one, then the alternates, then the original Preware by id, each with {type: "install", file,
 * target}, until one opens. A handler removed since it registered fails to launch and the
 * next is tried. On LuneOS, LunaAppManager passes launches on to SAM and then answers
 * '"<id>" was not found' even for an app it launched, so SAM is asked directly there.
 * From a Preware 2 developer's patch for the tablet App Catalog.
 *
 *   IpkHandler.open(ipkUrl, onSuccess(appId), onFailure(lastResponse))
 *   IpkHandler.isLegacyWebOS  -- webOS 1-3 (and Lunacy, which answers as a TouchPad)
 */
var IpkHandler = (function () {
    var IPK_MIME = "application/vnd.webos.ipk";
    var FALLBACK_IPK_HANDLER = "org.webosinternals.preware";
    var IS_LEGACY_WEBOS = /hpwOS\/|webOS\/[1-3]\./.test(navigator.userAgent);
    // An unreferenced PalmServiceBridge can be collected before it answers.
    var pending = [];

    function lunaCall(url, params, callback) {
        var bridge = new PalmServiceBridge();
        pending.push(bridge);
        bridge.onservicecallback = function (msg) {
            var i = pending.indexOf(bridge);
            if (i >= 0) { pending.splice(i, 1); }
            var response;
            try { response = JSON.parse(msg); } catch (e) { response = {returnValue: false, errorText: String(msg)}; }
            callback(response);
        };
        bridge.call(url, JSON.stringify(params || {}));
    }

    function launchApp(id, params, callback) {
        if (IS_LEGACY_WEBOS) {
            lunaCall("palm://com.palm.applicationManager/open", {id: id, params: params}, callback);
        } else {
            lunaCall("luna://com.webos.service.applicationmanager/launch", {id: id, params: params}, callback);
        }
    }

    function candidates(callback) {
        lunaCall("palm://com.palm.applicationManager/listAllHandlersForMime", {mime: IPK_MIME}, function (r) {
            var ids = [], h = r && r.returnValue && r.resourceHandlers, i;
            function add(id) { if (id && ids.indexOf(id) < 0) { ids.push(id); } }
            if (h) {
                add(h.activeHandler && h.activeHandler.appId);
                for (i = 0; h.alternates && i < h.alternates.length; i++) { add(h.alternates[i].appId); }
            }
            add(FALLBACK_IPK_HANDLER);
            callback(ids);
        });
    }

    function open(ipkUrl, onSuccess, onFailure) {
        candidates(function (ids) {
            var n = 0;
            function next(last) {
                if (n >= ids.length) { if (onFailure) { onFailure(last); } return; }
                var id = ids[n++];
                launchApp(id, {type: "install", file: ipkUrl, target: ipkUrl}, function (r) {
                    if (r && r.returnValue) {
                        enyo.log("IpkHandler: package handed to " + id);
                        if (onSuccess) { onSuccess(id); }
                    } else {
                        enyo.log("IpkHandler: " + id + " not available: " + JSON.stringify(r));
                        next(r);
                    }
                });
            }
            next({returnValue: false, errorText: "No application for .ipk files"});
        });
    }

    return { open: open, isLegacyWebOS: IS_LEGACY_WEBOS };
}());
