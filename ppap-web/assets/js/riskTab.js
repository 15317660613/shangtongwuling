/*分布图页表格数据数组*/
var currentMonth = new Date().getMonth() + 1;
var currentYear = new Date().getFullYear();
var currentYearMonth;
/*初始化表格*/
/*初始化layui*/
layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    table = layui.table;
    admin = layui.adc;
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        formSelects = layui.formSelects;
    var upload = layui.upload;

    currentYearMonth = getPreMonth(new Date(), 1);

    var riskFlag = sessionStorage.getItem("riskFlag");

    // 得到上个月
    function getPreMonth(date, type) {
        var year = date.getFullYear(); //获取当前日期的年份
        var month = date.getMonth() + 1; //获取当前日期的月份
        var days = new Date(year, month, 0);
        // days = days.getDate(); //获取当前日期中月的天数
        var year2 = year;
        var month2 = month;
        if (month == 1) { //如果是1月份，则取上一年的12月份
            year2 = parseInt(year2) - 1;
            month2 = 12;
        } else {
            month2 = month2 - 1;
        }
        var t2 = type == 1 ? year2 + "" + month2 : year2 + "-" + month2;
        return t2;
    }

    /*初始化日期框*/
    laydate.render({
        type: 'month',
        elem: '#date-1',
        value: getPreMonth(new Date(), 0)
    });

    // *****************************************************************判断当前页面是哪个tab页*****************************************
    //切换tab页
    element.tabChange('adc-tab', riskFlag);
    if (riskFlag == 'analysis') {
        $(".layui-tab .layui-show").load("../../components/tpl/risk_analysis.html");
    } else if (riskFlag == 'monitor') {
        $(".layui-tab .layui-show").load("../../components/tpl/risk_monitor.html");
    } else if (riskFlag == 'warning') {
        $(".layui-tab .layui-show").load("../../components/tpl/risk_warning.html");
    } else if (riskFlag == 'manager') {
        $(".layui-tab .layui-show").load("../../components/tpl/risk_manage.html");
    } else if (riskFlag == 'forecast') {
        $(".layui-tab .layui-show").load("../../components/tpl/risk_forecast.html");
        // setForecast(saveArr5);
    }
    /**
     * 功能描述: 监听tab切换，重载表格防止表格变形
     *
     * @param:
     * @return:
     * @auther: quym
     * @date: 2018/9/19 13:50
     */
    element.on('tab(adc-tab)', function(data) {
        if (data.index == 0) {
            window.open("components/risk/riskMap.html");
        } else if (data.index == 1) {
            window.location.href = "/index.html#!riskAnalysis"
        } else if (data.index == 2) {
            window.location.href = "/index.html#!riskMonitor"
            $(window).trigger("resize");
        } else if (data.index == 3) {
            window.location.href = "/index.html#!riskWarning"
        } else if (data.index == 5) {
            window.location.href = "/index.html#!riskManager"
        } else if (data.index == 4) {
            window.location.href = "/index.html#!riskForecast"
        }
        $(window).trigger("resize");
    });
    // ********************************************************************************************************************************

});

/**
 * 功能描述: 查询条件部分收缩和展开功能
 *
 * @param:
 * @return:
 * @auther: quym
 * @date: 2018/11/20 11:00
 */
function slideDiv(obj) {
    //如果查询条件隐藏 则展开查询条件 将展开文字变成收起
    if ($($(obj).parent().next()[0]).css("display") == 'none') {
        $($(obj).parent().next()[0]).slideDown();
        $(obj).find(".slide").text("收起 ");
        $(obj).find(".img").attr("src", "../../assets/images/icon-slidedown.png");
    } else { //否则收起查询条件 将收起变成展开
        $($(obj).parent().next()[0]).slideUp();
        $(obj).find(".slide").text("展开 ");
        $(obj).find(".img").attr("src", "../../assets/images/icon-slideup.png");
    }
}