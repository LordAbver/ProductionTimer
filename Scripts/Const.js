Const = function () {
    //UNIFED CONSTANTS!
    //Separators
    var sep = [];
    sep.channelId = '*';
    sep.listIndex = ':';
    //Slider env.
    //Main view blocks
    var content = [];
    //Page continers
    content.maincontainerId = "main_container";
    content.nameTabId = "name_tab";
    content.listStateIndicatorID = "list_state_indicator";
    content.eventsGridId = "dg_scroll";
    content.eventDivPrefix = "ev_";
    content.timerContainerId = "timer_container";
    content.pageInfoBoxId = "page_info";
    content.pageDataId = "data-page";
    content.pageCountDataId = "data-page-count";

    content.playingClass = "playing";
    content.upcountingClass = "upcounting";
    content.freezeClass = "freeze";
    content.holded = "hold";
    content.stopped = "stopped";
    content.threaded = "threading";
    content.baseTimerClass = "pt_timer_cd_block";
    content.greenTimerClass = "pt_timer_green";
    content.redTimerClass = "pt_timer_red";
    content.grayTimerClass = "pt_timer_gray";
    content.blueTimerClass = "pt_timer_blue";
    content.redBgTimerClass = "pt_timer_red_bg";
    content.yellowTimerClass = "pt_timer_yellow";
    content.rtIconClass = "remaning_time_icon_id";
    content.ttnbIconClass = "pt_icon_ttne";
    content.upcountIconClass = "pt_icon_upcount";
    content.iconContainerClass = "pt_icon_container";
    content.dataGridClass = "production_timer_data_grid";

    content.bdTimerId = "break_duration_timer_id";
    content.ttrTimerId = "time_to_return_timer_id";
    content.pDurTimerId = "program_duration_timer_id";
    content.pEndTimerId = "program_end_timer_id";
    content.bdAdditionalTimerId = "break_duration_grid_timer_id";
    content.bdAdditionalTimerContainerId = "break_duration_grid_timer_container";
    content.homeButtonId = "home_break";
    content.bdAdditionalTimerHeaderId = "break_duration_grid_timer_header";
    content.ttrbIconId = "time_to_return_icon_id";
    //Loading warning bars
    var wlbars = [];
    wlbars.loadingbarId = "loadingBar";
    wlbars.warningbarId = "warningBarContent";
    //Intervals
    var intervals = [];
    //Intervals (ms)
    intervals.timersUpdateInterval = 100;
    intervals.eventsUpdateInterval = 1000;
    intervals.ajaxTimeoutMs = 25000;
    intervals.loadingBarInterval = 8000;
    intervals.warningBarInterval = 8000;
    intervals.loadingBar = 200;
    //hash values
    var hash = [];
    hash.options = "#Options";
    hash.home = "#Home";
    //CONSTANTS FOR THE PRODUCTION TIMER PROJECT ONLY
    content.productiontimerBlockPosition = "production_timer_block_position";
    var integer = [];
    integer.maxDataGridElementsPerPage = 10;
    //OPTIONS CONST
    var options = [];
    options.listsBoxId = "listsBox";
    //COOKIES
    var cookies = [];
    //cookies.timersUpdateInterval = "PTTUI";
    cookies.server = "PTS";
    cookies.list = "PTL";
    return {
        content: content,
        sep: sep,
        wlbars: wlbars,
        intervals: intervals,
        integer: integer,
        hash: hash,
        options: options,
        cookies: cookies
    };
} ();