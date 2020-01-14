/// <reference path="jquery-1.10.2.min.js" />
/// <reference path="Const.js" />


//Native JS easy select
function id(id) {
    return document.getElementById(id);
}
function tag(tag) {
    return document.getElementsByTagName(tag);
}
function gclass(className) {
    return document.getElementsByClassName(className);
}
function ch(id) {
    return id.split(Const.sep.channelId)[1];
}
function gsrv(id) {
    return ch(id).split(Const.sep.listIndex)[0];
}
function gindex(id) {
    return ch(id).split(Const.sep.listIndex)[1];
}
function checkAddClass(box, className) {
    if (!box.hasClass(className)) {
        box.addClass(className);
    }
}
function checkRemoveClass(box, className) {
    if (box.hasClass(className)) {
        box.removeClass(className);
    }
}
function switchClass(box, from, to) {
    checkRemoveClass(box, from);
    checkAddClass(box, to);
}
function setClassName(box, cname) {
    if (box.className != cname) {
        box.className = cname;
    }
}
function setHtmlTooltip(box, text) {
    box.attr("title", text).attr("alt", text);
}
String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

ProductionTimer = function () {

    //ChannelsDataUpdate region
    //#region

    var timerUpdateEnabled;
    var timerUpdateInterval;
    var timerUpdateIntervalId;

    var eventsUpdateEnabled;
    var eventsUpdateInterval;
    var eventsUpdateIntervalId;

    function enableDataUpdate() {
        timerUpdateEnabled = true;
        //        var updateInterval = Number(getCookie(Const.cookies.timersUpdateInterval));
        //        if (updateInterval < 30) {
        //            updateInterval = Const.intervals.timersUpdateInterval;
        //        }
        //        
        timerUpdateInterval = Const.intervals.timersUpdateInterval;
        sendTimerDataRequest();


        eventsUpdateEnabled = true;
        eventsUpdateInterval = Const.intervals.eventsUpdateInterval;
        sendEventsDataRequest();
    }

    function disableDataUpdate() {
        timerUpdateEnabled = false;
        clearInterval(timerUpdateIntervalId);
        timerUpdateIntervalId = null;

        eventsUpdateEnabled = false;
        clearInterval(eventsUpdateIntervalId);
        eventsUpdateIntervalId = null;
    }

    function sendTimerDataRequest() {
        if (timerUpdateEnabled) {
            $.ajax({
                type: "GET",
                cache: false,
                url: document.location.pathname + "Home/GetTimersInfo",
                // data: { "server": server, "list": list },
                dataType: "json",
                timeout: Const.intervals.ajaxTimeoutMs,
                beforeSend: function (jqXHR, settings) {
                    clearInterval(timerUpdateIntervalId);
                    timerUpdateIntervalId = null;
                },
                success: function (result, textStatus, jqXHR) {
                    if (timerUpdateEnabled) {
                        try {
                            updateTimers(result.Timer);
                            processWarnings(result.Warnings);
                        } catch (e) {
                            console.log("error " + e);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("sendChannelsRequest error: " + " " + textStatus + " " + errorThrown);
                    processingError(jqXHR, textStatus, errorThrown);
                },
                complete: function (jqXHR, textStatus) {
                    if (!timerUpdateIntervalId) {
                        timerUpdateIntervalId = setTimeout(function () {
                            sendTimerDataRequest();
                        }, timerUpdateInterval);
                    }
                }
            });
        }
    }

    function sendEventsDataRequest() {
        if (eventsUpdateEnabled) {
            $.ajax({
                type: "GET",
                cache: false,
                url: document.location.pathname + "Home/GetEventsInfo",
                data: { "page": $(id(Const.content.timerContainerId)).attr(Const.content.pageDataId) },
                dataType: "json",
                timeout: Const.intervals.ajaxTimeoutMs,
                beforeSend: function (jqXHR, settings) {
                    clearInterval(eventsUpdateIntervalId);
                    eventsUpdateIntervalId = null;
                },
                success: function (result, textStatus, jqXHR) {
                    if (eventsUpdateEnabled) {
                        try {
                            updateEvents(result);
                        } catch (e) {
                            console.log("error " + e);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("sendChannelsRequest error: " + " " + textStatus + " " + errorThrown);
                    processingError(jqXHR, textStatus, errorThrown);
                },
                complete: function (jqXHR, textStatus) {
                    if (!eventsUpdateIntervalId) {
                        eventsUpdateIntervalId = setTimeout(function () {
                            sendEventsDataRequest();
                        }, eventsUpdateInterval);
                    }
                }
            });
        }
    }

    function updateTimers(timersData) {
        if (!timersData) return;

        processFiveSecondWarnings(timersData.WarningSec);
        if (timersData.SysTime) {
            performTimerUpdate("system_time_timer", timersData.SysTime);
        }
        if (timersData.BreakDur) {
            performTimerUpdate("break_duration_timer_id", timersData.BreakDur);
        }
        if (timersData.TimeToReturn) {
            performTimerUpdate("time_to_return_timer_id", timersData.TimeToReturn);
        }
        if (timersData.ProgramDur) {
            performTimerUpdate("program_duration_timer_id", timersData.ProgramDur);
        }
        if (timersData.ProgramEnd) {
            performTimerUpdate("program_end_timer_id", timersData.ProgramEnd);
        }

        var listName = getCookie(Const.cookies.list);
        if (timersData.ListName) {
            listName = timersData.ListName;
        }
        var nameTab = $(id(Const.content.nameTabId));
        if (nameTab.text() != listName) nameTab.text(listName); nameTab.text(listName);
        setHtmlTooltip(nameTab, "Device server name: '" + getCookie(Const.cookies.server) + "'");

        var listState = "";
        if (timersData.ListState && timersData.ListState.length > 0) {
            var l = timersData.ListState;
            listState = "Playlist state: [";
            for (var i = 0; i < l.length - 1; i++) {
                var state = l[i];
                listState = listState + state + ", ";
            }
            listState += l[l.length - 1] + "]";
        }
        var stateIndicator = $(id(Const.content.listStateIndicatorID));
        setHtmlTooltip(stateIndicator, listState);

        processListState(timersData, stateIndicator);
    }

    function performTimerUpdate(timerId, tcValue) {
        var sysTcBody = $("#" + timerId);
        var sysTc = $(".pt_time_number", sysTcBody);
        $(sysTc[0]).html(tcValue[0] == "-" ? "&minus;" : tcValue[0]);
        $(sysTc[1]).html(tcValue[1] == "-" ? "&minus;" : tcValue[1]);
        $(sysTc[2]).html(tcValue[3] == "-" ? "&minus;" : tcValue[3]);
        $(sysTc[3]).html(tcValue[4] == "-" ? "&minus;" : tcValue[4]);
        $(sysTc[4]).html(tcValue[6] == "-" ? "&minus;" : tcValue[6]);
        $(sysTc[5]).html(tcValue[7] == "-" ? "&minus;" : tcValue[7]);

        //frames
        //        $(sysTc[6]).text(tcValue[9]);
        //        $(sysTc[7]).text(tcValue[10]);
    }

    function processFiveSecondWarnings(fswValue) {
        var fswBlock = $("#fswBlock");
        var lamps = $(".five_seconds_lamp", fswBlock);
        var index;
        if (fswValue >= 0) {
            //            index = lamps.length - fswValue;
            //            $(lamps[index]).addClass("active");
            for (var i = 0; i < lamps.length - fswValue; i++) {
                $(lamps[i]).addClass("active");
            }
        } else {
            index = 0;
            lamps.each(function () {
                $(lamps[index]).removeClass("active");
                index++;
            });
        }
    }

    function processWarnings(warnings) {
        if (warnings)
            if (warnings.length != 0) {
                WarningBar.setText(warnings);
                WarningBar.show();
            }
            else {
                WarningBar.hide();
            }
    }
    function processListState(timersData, tab) {
        var listState = timersData.ListState;
        var ttrt = id(Const.content.ttrTimerId);
        var bdt = id(Const.content.bdTimerId);
        var pDur = id(Const.content.pDurTimerId);
        var pEnd = id(Const.content.pEndTimerId);

        if (!listState || listState.length == 0) {
            if (tab.attr("class") != "pt_list_state_indicator stopped") {
                tab.attr("class", "pt_list_state_indicator stopped");
            }
            setClassName(ttrt, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
            setClassName(bdt, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
            setClassName(pDur, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
            setClassName(pEnd, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
            return;
        }

        if (timersData.ProgramDur.indexOf("--") == -1) {
            setClassName(pDur, Const.content.baseTimerClass + ' ' + Const.content.blueTimerClass);
        }
        else {
            setClassName(pDur, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
        }

        if (timersData.ProgramEnd.indexOf("--") == -1) {
            setClassName(pEnd, Const.content.baseTimerClass + ' ' + Const.content.blueTimerClass);
        }
        else {
            setClassName(pEnd, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
        }

        var isPlaying = false;
        var isUpcounting = false;
        var isFreeze = false;
        var isThreading = false;
        var isHolded = false;

        for (var i in listState) {
            var st = listState[i];

            isPlaying = isPlaying || st == Const.content.playingClass;
            isUpcounting = isUpcounting || st == Const.content.upcountingClass;
            isFreeze = isFreeze || st == Const.content.freezeClass;
            isThreading = isThreading || st == Const.content.threaded;
            isHolded = isHolded || st == Const.content.holded;
        }

        var targetClass = Const.content.stopped;
        if (isThreading) {
            targetClass = Const.content.threaded;
        }

        if (isPlaying) {
            targetClass = Const.content.playingClass;
        }

        if (isUpcounting) {
            targetClass = Const.content.upcountingClass;
        }

        if (isFreeze) {
            targetClass = Const.content.freezeClass;
        }

        if (isHolded) {
            targetClass = Const.content.holded;
        }

        if (!tab.hasClass(targetClass)) {
            tab.attr("class", "pt_list_state_indicator " + targetClass);
        }
        var colorSetCode = (isPlaying ? 1 : 0).toString() +
                           (isUpcounting ? 1 : 0).toString() +
                           (isFreeze ? 1 : 0).toString() +
                           (isThreading ? 1 : 0).toString() +
                           (timersData.InBreak ? 1 : 0).toString() +
                           (isHolded ? 1 : 0).toString();

        switch (colorSetCode) {
            case '110100': //Upcounting, not in break!
            case '111100': //Upcounting+Freezed, not in break!
            case '110101': //Upcounting+Holded, not in break!
            case '100100': //Playing,not in Break
                setClassName(ttrt, Const.content.baseTimerClass + ' ' + Const.content.grayTimerClass);
                setClassName(bdt, Const.content.baseTimerClass + ' ' + Const.content.blueTimerClass);
                break;
            case '100110': //Playing, in Break
                setClassName(ttrt, Const.content.baseTimerClass + ' ' + Const.content.yellowTimerClass);
                setClassName(bdt, Const.content.baseTimerClass + ' ' + Const.content.redTimerClass);
                break;
            case '110110': //In brake,Upcounting
            case '111110': //In brake,Upcounting+Freezed
            case '110111': //In brake,Upcounting+Holded    
                setClassName(bdt, Const.content.baseTimerClass + ' ' + Const.content.redBgTimerClass);
                setClassName(ttrt, Const.content.baseTimerClass + ' ' + Const.content.yellowTimerClass);
                break;
        }
    }

    function updateEvents(data) {
        if (!data) {

        }
        else {
            var box = id(Const.content.timerContainerId);
            if (data.Events) {
                var hash = parseInt(HashProcessorHelper.getHash(box));
                var newHash = HashProcessorHelper.calculateHash(data.Events);
                var ev;
                HashProcessorHelper.setHash(box, newHash);

                if (hash != newHash) {
                    var grid = $(id(Const.content.eventsGridId));
                    grid.empty();
                    var switchClass = false;
                    if (data.Events.length == 0) {
                        ev = getNoEventsWarn();
                        grid.append(ev);
                    }
                    for (var i = 0; i < data.Events.length; i++) {
                        ev = getEvent(data.Events[i], i, switchClass ? "odd" : "even");
                        grid.append(ev);
                        switchClass = !switchClass;
                    }
                }
            }
            else {
                $(id(Const.content.eventsGridId)).empty();
                HashProcessorHelper.setHash(box, 0);
            }

            var curPage = parseInt($(box).attr(Const.content.pageDataId));
            if (curPage == data.Page || curPage > data.PageCount)
                setPageInfo(data.Page, data.PageCount);
            if (curPage >= data.PageCount && data.PageCount > 0)
                setPageInfo(data.PageCount - 1, data.PageCount);



            if (curPage == 0) {
                $('#'+Const.content.bdAdditionalTimerContainerId).hide();
                $('#' + Const.content.homeButtonId).hide();
            }
            else {
                if (data.BreakDur) {
                    performTimerUpdate(Const.content.bdAdditionalTimerId, data.BreakDur);
                }

                var header = $(id(Const.content.bdAdditionalTimerHeaderId));
                header.text("BREAK #" + (curPage + 1).toString() + " : DURATION:");

                $('#' + Const.content.bdAdditionalTimerContainerId).show();
                $('#' + Const.content.homeButtonId).show();
            }
        }
    }

    function setPageInfo(page, pageCount) {
        $(id(Const.content.pageInfoBoxId)).text((page + 1).toString() + "/" + pageCount);
        $(id(Const.content.timerContainerId)).attr(Const.content.pageDataId, page).attr(Const.content.pageCountDataId, pageCount);
    }

    function prevPage() {
        var box = $(id(Const.content.timerContainerId));
        var page = parseInt(box.attr(Const.content.pageDataId));
        var pageCount = parseInt(box.attr(Const.content.pageCountDataId));
        if (page <= 0)
            return;
        page--;
        setPageInfo(page, pageCount);
    }

    function nextPage() {
        var box = $(id(Const.content.timerContainerId));
        var page = parseInt(box.attr(Const.content.pageDataId));
        var pageCount = parseInt(box.attr(Const.content.pageCountDataId));
        if (page >= pageCount - 1)
            return;
        page++;
        setPageInfo(page, pageCount);
    }

    function homePage() {
        var box = $(id(Const.content.timerContainerId));
        var pageCount = parseInt(box.attr(Const.content.pageCountDataId));
        setPageInfo(0, pageCount);
    }

    function getNoEventsWarn() {
        var res = $("<div></div>")
            .addClass("pt_no_events")
            .text("There are no breaks to show");
        return res;
    }

    function getEvent(evData, i, bgClass) {
        var res = $("<div></div>")
            .attr("id", Const.content.eventDivPrefix + i)
            .addClass("ta_left")
            .addClass(bgClass);

        var oat = $("<div></div>")
            .addClass("production_timer_grid_columns on_air")
            .append($("<span></span>")
                    .text(evData.Oat));

        var status = $("<div></div>")
            .addClass("production_timer_grid_columns status")
            .append($("<div></div>")
                    .addClass("status_cell")
                    .addClass(getEventStatusClass(evData.Status)));

        var id = $("<div></div>")
            .addClass("production_timer_grid_columns id")
            .append($("<span></span>")
                    .text(evData.Id));

        var title = $("<div></div>")
            .addClass("production_timer_grid_columns title_cell")
            .append($("<span></span>")
                    .text(evData.Title));

        var dur = $("<div></div>")
            .addClass("production_timer_grid_columns dur")
            .append($("<span></span>")
                    .text(evData.Dur));

        res.append(oat).append(status).append(id).append(title).append(dur);
        return res;
    }



    function getEventStatusClass(eventStatus) {
        var eventStatusClass;
        switch (eventStatus) {
            case "cued": eventStatusClass = "evst_cued";
                break;
            case "cueing": eventStatusClass = "evst_cueing";
                break;
            case "done": eventStatusClass = "evst_done";
                break;
            case "error": eventStatusClass = "evst_error";
                break;
            case "ffd": eventStatusClass = "evst_ffd";
                break;
            case "skipped":
            case "missed": eventStatusClass = "evst_missed";
                break;
            case "play": eventStatusClass = "evst_playing";
                break;
            case "postroll": eventStatusClass = "evst_postroll";
                break;
            case "preroll": eventStatusClass = "evst_preroll";
                break;
            case "ready": eventStatusClass = "evst_ready";
                break;
            case "record": eventStatusClass = "evst_recording";
                break;
            case "rewinding": eventStatusClass = "evst_rewinding";
                break;
            case "still": eventStatusClass = "evst_still";
                break;
            case "stop": eventStatusClass = "evst_stop";
                break;
            default: eventStatusClass = "evst_done";
                break;
        }
        return eventStatusClass;
    }
    function onResize(e) {
        //Data grid automatic resize
        var dgH = window.innerHeight - $(".bottom_status_bar").height() - parseInt(window.innerHeight / 3);
        $("." + Const.content.dataGridClass).height(dgH);
        $(".pt_no_events").css("line-height", dgH + 'px');
        var optionsContainerHeight = window.innerHeight - $(".bottom_status_bar").height();
        $(".options_container").height(optionsContainerHeight);
    }
    //#endregion

    //onHashChange handler
    //#region

    function onHashChange() {
        var pathName = window.location.pathname;
        if (pathName.length > 0) {
            if (pathName.charAt(pathName.length - 1) !== "/") {
                window.location.pathname = window.location.pathname + "/";
            }
        }

        var hash = window.location.hash;
        if (!hash) {
            hash = Const.hash.home;
        }

        var action = "", href = "", img = "", classContainer = "";

        var navBar = $(".bottom_nav_bar");
        if (hash.toLowerCase() === Const.hash.home.toLowerCase()) {
            action = document.location.pathname + "Options";
            href = Const.hash.options;
            img = document.location.pathname + "images/buttons/options_off.png";

        }
        if (hash.toLowerCase() === Const.hash.options.toLowerCase()) {
            action = document.location.pathname + "Home/Partial";
            href = Const.hash.home;
            img = document.location.pathname + "images/buttons/options_on.png";
            disableDataUpdate();

            //            if (navBar.attr("style") !== "display:none") {
            //                navBar.attr("style", "display:none");
            //            }
        }

        var actionMethod = $('a[href=' + hash + ']').attr("title");
        if (actionMethod) {
            LoadingBar.show();
            $.get(actionMethod, null, function (result, textStatus, jqXHR) {
                return false;
            })
                .success(function (result, textStatus, jqXHR) {
                    LoadingBar.show();
                    var container = $('#' + Const.content.maincontainerId);
                    container.html(result);

                    if (container.attr("style") !== "") {
                        container.attr("style", "");
                    }
                    if (container.attr("class") !== classContainer) {
                        container.attr("class", classContainer);
                    }

                    if (hash === Const.hash.home) {
                        homeViewLoaded();
                    } else if (hash === Const.hash.options) {
                        optionViewLoaded();
                    }
                    onResize();
                    LoadingBar.hide();
                })
                .error(function (jqXHR, textStatus, errorThrown) {
                    processingError(jqXHR, textStatus, errorThrown);
                })
                .complete(function (jqXHR, textStatus, errorThrown) {

                });
        }

        var aTag = $('a[href=' + hash + ']');
        var imgTag = $('img', aTag);

        if (imgTag.attr("src") !== img) {
            imgTag.attr("src", img);
        }

        if (aTag.attr("title") !== action) {
            aTag.attr("title", action);
        }
        if (aTag.attr("href") !== href) {
            aTag.attr("href", href);
        }
    }
    //#endregion

    //#endregion

    //Private methods
    //#region

    // optionViewLoaded 
    //#region
    function optionViewLoaded() {
        disableDataUpdate();
        LoadingBar.hide();
    }

    //#endregion

    // playListViewLoaded 
    //#region
    function homeViewLoaded() {
        var dgData = id("dg_scroll");
        if (dgData) {
            dgData.ontouchmove = function (e) {
                if (dgData.children.length * $(".Header").outerHeight() > $('.' + Const.content.dataGridClass).height()) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            };
        }
        LoadingBar.hide();
        //enableDataUpdate();
    }

    //#endregion

    // screenSize 
    //#region

    function screenSize() {
        var w, h;
        w = (window.innerWidth ? window.innerWidth
            : (document.documentElement.clientWidth ? document.documentElement.clientWidth
                : document.body.offsetWidth));
        h = (window.innerHeight ? window.innerHeight
            : (document.documentElement.clientHeight ? document.documentElement.clientHeight
                : document.body.offsetHeight));
        return { w: w, h: h };
    }

    //#endregion

    // getCookie 
    //#region

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    //#endregion

    //#endregion

    //Public methods
    //#region


    // startUp 
    //#region

    function startUp() {
        LoadingBar.init(id(Const.wlbars.loadingbarId), Const.intervals.loadingBar);
        WarningBar.init(id(Const.wlbars.warningbarId));

        homeViewLoaded();
        onHashChange();
        onResize();
    }

    //#endregion

    // hitEvent 
    //#region

    function hitEvent() {
        return 'ontouchstart' in document.documentElement ? 'touchend' : 'click';
    }

    //#endregion

    // resizeEvent 
    //#region

    function resizeEvent() {
        // var hitEvent = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
        return 'ontouchstart' in document.documentElement ? 'orientationchange' : 'resize';
    }

    //#endregion

    // processingError 
    //#region
    function processingError(jqXHR, textStatus, errorThrown) {
        var header = "Sorry, an error occurred while processing your request. (HTTP Error " + jqXHR.status + ": " + errorThrown + ") ";
        LoadingBar.setText(header + $("#error_message", jqXHR.responseText).text());
        LoadingBar.show();
    }
    //#endregion

    // startUp 
    //#region

    function getListNames(dropDownList) {
        $(id(Const.options.listsBoxId)).empty();
        $.ajax({
            type: "GET",
            cache: false,
            url: document.location.pathname + "Options/GetListNames",
            data: { "server": dropDownList.value },
            dataType: "json",
            timeout: Const.intervals.ajaxTimeoutMs,
            beforeSend: function (jqXHR, settings) {

            },
            success: function (result, textStatus, jqXHR) {
                var box = $(id(Const.options.listsBoxId));
                for (var i = 0; i < result.length; i++) {
                    box.append($("<option></option>").attr("value", result[i].Key).text(result[i].Value));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("sendChannelsRequest error: " + " " + textStatus + " " + errorThrown);
                processingError(jqXHR, textStatus, errorThrown);
            },
            complete: function (jqXHR, textStatus) {

            }
        });
    }

    //#endregion

    //#endregion

    return {
        //ChannelsDataUpdate
        enableDataUpdate: enableDataUpdate,
        disableDataUpdate: disableDataUpdate,

        //Events handlers
        onResize: onResize,
        onHashChange: onHashChange,

        //Public methods
        startUp: startUp,
        hitEvent: hitEvent,
        resizeEvent: resizeEvent,
        processingError: processingError,
        getListNames: getListNames,
        nextPage: nextPage,
        prevPage: prevPage,
        homePage: homePage
    };
} ();


LoadingBar = function () {
    var divElement;
    var speed;
    var countChildren;
    var loadingBarTimeoutId;

    function init(element, s) {
        divElement = element;
        countChildren = divElement.children.length - 1;
        speed = s;
    }

    function show() {
        divElement.parentNode.style.display = "block";
        $(divElement.parentNode).css("opacity", "0.5");

        if (!loadingBarTimeoutId) {
            loadingBarTimeoutId = setTimeout(function () {
                hide();
                loadingBarTimeoutId = null;
            }, Const.intervals.loadingBarInterval);
        }
    }

    function hide() {
        var val = divElement.parentNode.style.display;
        if (val != "none") {
            divElement.parentNode.style.display = "none";
        }
        resetText();
    }

    function setText(t) {
        $(divElement).text(t);
        divElement.style.width = '600px';
    }

    function resetText() {
        $(divElement).text('Loading...');
        divElement.style.width = '250px';
    }

    return {
        init: init,
        show: show,
        hide: hide,
        setText: setText
        //resetText: resetText
    };
} ();

WarningBar = function () {
    var divElement;
    var warningBarTimeoutId;

    function init(element) {
        divElement = element;
    }

    function show() {
        divElement.style.display = "block";
        if (!warningBarTimeoutId) {
            warningBarTimeoutId = setTimeout(function () {
                hide();
                warningBarTimeoutId = null;
            }, Const.intervals.warningBarInterval);
        }
    }

    function hide() {
        var val = divElement.parentNode.style.display;
        if (val != "none") {
            divElement.style.display = "none";
        }
        resetText();
    }

    function setText(warnings) {
        $(divElement).empty();
        if (typeof warnings === 'string') {
            $(divElement).append($("<div></div>").text(warnings));
            return;
        }

        for (var i = 0; i < warnings.length; i++) {
            $(divElement).append($("<div></div>").text(warnings[i]));
        }
    }
    /*warningBarText*/
    function resetText() {
        $(divElement).empty();
    }

    return {
        init: init,
        show: show,
        hide: hide,
        setText: setText
    };
} ();

HashProcessorHelper = function () {

    function getHash(chBox) {
        return $(chBox).attr("data-hash");
    }

    function setHash(chBox, hash) {
        $(chBox).attr("data-hash", hash);
    }


    function calculateHash(data) {
        return JSON.stringify(data).hashCode();
    }

    function resetHash(chBox) {
        setHash(chBox, "");
    }

    return {
        getHash: getHash,
        setHash: setHash,
        calculateHash: calculateHash,
        resetHash: resetHash
    };
} ();