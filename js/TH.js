var TH = {
    INFO: {
        name: "TH",
        version: "0.1",
        description: "TH Library"
    },
    DEBUG_MODE: true,
    mConfig: {},
    mData: {},
    appData: {
        data: [],
        total_page: 0,
        curr_page: 0
    },
    config: function(conf) {
        if (typeof conf === "object") {
            TH.mConfig = TH.Parser.clone(conf);
        } else {
            TH.mConfig = TH.Parser.toJSON(conf);
        }
    },
    toString: function() {
        console.log(this);
    }
};

TH.Debug = {
    MODE: {
        LOG: 0,
        WARN: 1,
        ERROR: 2
    },
    debug: function(tag, message) {
        if (TH.DEBUG_MODE) {
            switch (tag) {
              case this.MODE.LOG:
                console.log(message);
                break;

              case this.MODE.WARN:
                console.warn(message);
                break;

              case this.MODE.ERROR:
                console.error(message);
                break;

              default:
                console.log(message);
            }
        }
    }
};

TH.Utils = {
    hasTouchSupport: function is_touch_device() {
        return "ontouchstart" in window || navigator.maxTouchPoints;
    },
    trimAll: function(what) {
        return what.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
    },
    spaceToUnderline: function(string) {
        return string.replace(/ /g, "_");
    },
    fillZero: function(val, len) {
        return ("0" + val).slice(-len);
    },
    date2String: function(time, opts) {
        var dateTime, timeStamp, key;
        var year, month, date, hour, minute, second, dayOfWeek;
        var DATE_OPTIONS = {
            isFillZero: true,
            format: "YYYY/MM/DD WD hh:mm:ss",
            dayOfWeek: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
            isUTC: false
        };
        var isUTC = false;
        var resultStr = "";
        if (opts === undefined) {
            opts = DATE_OPTIONS;
        } else {
            for (key in DATE_OPTIONS) {
                if (opts[key] === undefined) {
                    opts[key] = DATE_OPTIONS[key];
                }
            }
        }
        resultStr = opts.format;
        if (time === undefined || time == null) {
            dateTime = new Date();
        } else if (time instanceof Date) {
            dateTime = time;
        } else if (time === parseInt(time, 10)) {
            timeStamp = parseInt(time, 10);
            if (timeStamp.toString().length <= 10) {
                timeStamp = timeStamp * 1e3;
            } else if (timeStamp.toString().length != 13) {
                timeStamp = new Date().getTime();
            }
            dateTime = new Date(timeStamp);
        }
        year = opts.isUTC ? dateTime.getUTCFullYear() : dateTime.getFullYear();
        month = opts.isUTC ? dateTime.getUTCMonth() + 1 : dateTime.getMonth() + 1;
        date = opts.isUTC ? dateTime.getUTCDate() : dateTime.getDate();
        hour = opts.isUTC ? dateTime.getUTCHours() : dateTime.getHours();
        minute = opts.isUTC ? dateTime.getUTCMinutes() : dateTime.getMinutes();
        second = opts.isUTC ? dateTime.getUTCSeconds() : dateTime.getSeconds();
        dayOfWeek = opts.dayOfWeek[opts.isUTC ? dateTime.getUTCDay() : dateTime.getDay()];
        if (opts.isFillZero) {
            year = TH.Utils.fillZero(year, 4);
            month = TH.Utils.fillZero(month, 2);
            date = TH.Utils.fillZero(date, 2);
            hour = TH.Utils.fillZero(hour, 2);
            minute = TH.Utils.fillZero(minute, 2);
            second = TH.Utils.fillZero(second, 2);
        }
        return resultStr.replace("YYYY", year).replace("YY", TH.Utils.fillZero(year, 2)).replace("MM", month).replace("DD", date).replace("WD", dayOfWeek).replace("hh", hour).replace("mm", minute).replace("ss", second);
    }
};

TH.Router = {
    root: "/",
    MODE: {},
    routes: [],
    ATTR_ROUTER: "ui-route",
    config: function(opt) {
        TH.Router.root = opt.root;
        TH.Router.MODE = opt.MODE;
        return TH.Router;
    },
    add: function(re, handler) {
        if (typeof re == "function") {
            handler = re;
            re = "";
        }
        TH.Router.routes.push({
            re: re,
            handler: handler
        });
        return TH.Router;
    },
    remove: function(param) {
        for (var i = 0, r; i < TH.Router.routes.length, r = TH.Router.routes[i]; i++) {
            if (r.handler === param || r.re.toString() === param.toString()) {
                TH.Router.routes.splice(i, 1);
                return TH.Router;
            }
        }
        return TH.Router;
    },
    navigate: function(path) {
        path = path ? path : "";
        window.location.hash = path;
        return TH.Router;
    },
    flush: function() {
        TH.Router.root = "/";
        TH.Router.routes = [];
        return TH.Router;
    },
    addUIRoute: function(elem, path) {
        elem.setAttribute(TH.Router.ATTR_ROUTER, path);
        return elem;
    },
    _fire: function() {
        var hash = window.location.hash.substring(1);
        for (var i = 0; i < TH.Router.routes.length; i++) {
            var match = hash.match(TH.Router.routes[i].re);
            if (match) {
                match.shift();
                TH.Router.routes[i].handler.apply({}, match);
                return TH.Router;
            }
        }
    },
    registEvent: function() {
        document.addEventListener("click", function(evt) {
            if (evt.target.hasAttribute(TH.Router.ATTR_ROUTER)) {
                window.location.hash = evt.target.hasAttribute(TH.Router.ATTR_ROUTER);
            }
            if (evt.target.parentElement && evt.target.parentElement.hasAttribute(TH.Router.ATTR_ROUTER)) {
                window.location.hash = evt.target.parentElement.getAttribute(TH.Router.ATTR_ROUTER);
            }
        }), window.addEventListener("hashchange", TH.Router._fire, false);
        TH.Router._fire();
    },
    genUIRoute: function(mode, what) {
        if (mode == "") {
            return "";
        }
        var hash = "/" + mode;
        if (what) {
            hash += "/" + what;
        }
        return hash;
    }
};

TH.Network = {
    get: function(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open("GET", url);
            req.onload = function() {
                if (req.status == 200) {
                    resolve(req.responseText);
                } else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = function() {
                reject(Error("Network Error"));
            };
            req.send();
        });
    }
};

TH.Parser = {
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    toJSON: function(jsonStr) {
        return JSON.parse(jsonStr);
    },
    fromJSON: function(jsonObj) {
        return JSON.stringify(jsonObj);
    }
};

TH.Lang = {
    apply: function(data) {
        data = TH.Parser.toJSON(data);
        var allElements = document.querySelectorAll("[data-lang]");
        var i;
        for (i = 0; i < allElements.length; i++) {
            allElements[i].innerText = data[allElements[i].getAttribute("data-lang")] || "";
        }
    },
    load: function(lang) {
        lang = lang || TH.mConfig.config.lang;
        TH.Network.get(TH.mConfig.config.lang_dir + "/" + lang + ".json").then(function(responseStr) {
            TH.Debug.debug(TH.Debug.MODE.LOG, responseStr);
            TH.Lang.apply(responseStr);
        }, function(error) {
            TH.Debug.debug(TH.Debug.MODE.ERROR, error);
        });
    }
};

TH.UI = {
    MODE: {
        LIST: "list",
        DETAIL: "detail",
        SERACH: "search"
    },
    CLASS_NAME: {
        LIST: "layout-list",
        DETAIL: "layout-detail",
        SEARCH: "layout-search",
        TOUCH: "touch-support"
    },
    waterfall: undefined,
    wfContainer: undefined,
    _checkSlide: function(elem) {
        if (elem) {
            var screenHeight = TH.UI.wfContainer.scrollTop + TH.UI.wfContainer.clientHeight;
            var elemHeight = elem.offsetTop + elem.offsetHeight / 2;
            return elemHeight < screenHeight;
        }
    },
    updateWaterfallheight: function() {
        var eleHeader = document.querySelector("header");
        var height = window.innerHeight - eleHeader.offsetHeight;
        TH.UI.wfContainer.style.height = height + "px";
    },
    setWaterfall: function(eleQuery, waterfall) {
        TH.UI.waterfall = waterfall;
        TH.UI.wfContainer = document.querySelector(eleQuery);
        TH.UI.updateWaterfallheight();
        TH.UI.wfContainer.addEventListener("scroll", function() {
            var i = TH.UI.waterfall.getHighestIndex();
            if (i > -1) {
                var lastBox = Array.prototype.slice.call(TH.UI.waterfall.columns[i].children, -1)[0];
                if (TH.UI._checkSlide(lastBox) && TH.appData.curr_page < TH.appData.total_page) {
                    TH.Data.loadMore(TH.appData.curr_page);
                }
            }
        });
    },
    _addNode: function(item) {
        var boxClick = document.createElement("i");
        var box = document.createElement("div");
        box.className = "wf-box";
        box = TH.Router.addUIRoute(box, TH.Router.genUIRoute(TH.Router.MODE.DETAIL, TH.Utils.spaceToUnderline(item.title)));
        var image = document.createElement("img");
        image.src = item.figure.src;
        box.appendChild(image);
        var content = document.createElement("div");
        content.className = "content";
        var title = document.createElement("h3");
        title.appendChild(document.createTextNode(item.title));
        content.appendChild(title);
        box.appendChild(content);
        boxClick.appendChild(box);
        return boxClick;
    },
    showMore: function(items) {
        for (var i = 0; i < items.length; i++) {
            TH.UI.waterfall.addBox(TH.UI._addNode(items[i]));
        }
    },
    clearList: function() {
        while (TH.UI.wfContainer.firstChild) {
            TH.UI.wfContainer.removeChild(TH.UI.wfContainer.firstChild);
        }
        TH.UI.waterfall.removeAllBoxes();
        TH.UI.updateWaterfallheight();
    },
    genDetail: function(data, config) {
        var container = document.createElement("div");
        var elemTitle = document.createElement("h2");
        elemTitle.innerText = data.title;
        container.appendChild(elemTitle);
        var elemSnippet = document.createElement("p");
        elemSnippet.innerText = data.snippet;
        container.appendChild(elemSnippet);
        for (var i = 0; i < data.content.length; i++) {
            var dataContent = data.content[i];
            var elemSection = document.createElement("section");
            var elemSubtitle = document.createElement("h3");
            elemSubtitle.innerText = dataContent.subtitle;
            var elemSubcontent = document.createElement("p");
            elemSubcontent.innerText = dataContent.subcontent;
            var elemFigure = document.createElement("figure");
            var elemFigureChild;
            if (dataContent.figure.src.indexOf("youtube.com") != -1) {
                elemFigure.className = "video-container";
                elemFigureChild = document.createElement("iframe");
                elemFigureChild.setAttribute("frameborder", "0");
                elemFigureChild.setAttribute("allowfullscreen", "");
            } else {
                elemFigureChild = document.createElement("img");
            }
            elemFigureChild.setAttribute("src", dataContent.figure.src);
            elemFigure.appendChild(elemFigureChild);
            elemSection.appendChild(elemSubtitle);
            elemSection.appendChild(elemFigure);
            elemSection.appendChild(elemSubcontent);
            container.appendChild(elemSection);
        }
        return container.innerHTML;
    }
};

TH.Data = {
    getLatest: function(opt, callback) {
        var url = TH.mConfig.data.dir + "/" + TH.mConfig.data.latest;
        TH.Network.get(url).then(function(responseStr) {
            TH.mData = TH.Parser.toJSON(responseStr);
            TH.appData.data = TH.Parser.toJSON(responseStr).articles;
            TH.appData.total_page = Math.ceil(TH.appData.data.length / TH.mConfig.config.load_more);
            if (callback) {
                callback(responseStr);
            }
        }, function(error) {
            TH.Debug.debug(TH.Debug.MODE.ERROR, error);
            if (callback) {
                callback();
            }
        });
    },
    loadMore: function(page) {
        var nextPage = page || TH.appData.curr_page;
        if (nextPage > TH.appData.total_page) {
            return;
        }
        var start = nextPage * TH.mConfig.config.load_more;
        var end = start + TH.mConfig.config.load_more;
        if (end > TH.appData.data.length) {
            end = TH.appData.data.length;
        }
        var arrData = TH.appData.data.slice(start, end);
        TH.UI.showMore(arrData);
        TH.appData.curr_page++;
    },
    clearList: function() {
        TH.appData = {
            data: [],
            total_page: 0,
            curr_page: 0
        };
        TH.UI.clearList();
    },
    search: function(what) {
        TH.Data.clearList();
        for (var i = 0; i < TH.mData.articles.length; i++) {
            var item = TH.mData.articles[i];
            what = what.toLowerCase();
            var title = item.title.toLowerCase();
            if (title.indexOf(what) != -1) {
                TH.appData.data.push(item);
            }
        }
        if (TH.appData.data.length > 0) {
            TH.appData.total_page = Math.ceil(TH.appData.data.length / TH.mConfig.config.load_more);
        }
        TH.Data.loadMore(0);
    },
    getDetail: function(what, callback) {
        var url = TH.mConfig.data.dir + "/" + what + ".json";
        TH.Network.get(url).then(function(responseStr) {
            if (callback) {
                callback(TH.Parser.toJSON(responseStr));
            }
        }, function(error) {
            TH.Debug.debug(TH.Debug.MODE.ERROR, error);
            if (callback) {
                callback();
            }
        });
    }
};