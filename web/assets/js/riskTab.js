/*分布图页表格数据数组*/
var currentMonth = new Date().getMonth() + 1;
var currentYear = new Date().getFullYear();
var currentYearMonth;
/*初始化表格*/
/*初始化layui*/
layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    var table = layui.table,
        admin = layui.adc,
        config = layui.config,
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
        var dayNows = date.getDate(); //获取当前日期中月的天数
        //即每月13日运算后台算法程序，并更新显示上个月的数据，在此之前均应显示上上个月的数据；
        var dd = 1;
        if(dayNows<13){
            dd=2;
        }
        var year2 = year;
        var month2 = month;
        if (month == 1) { //如果是1月份，则取上一年的12月份
            year2 = parseInt(year2) - 1;
            month2 = 12+1-dd;
        } else {
            month2 = month2 - dd;
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
        var riskMenuCaptions = config.getAccount().riskMenuCaptions;
        if (data.elem.context.nodeName == 'LI') {
            if (riskMenuCaptions.indexOf(data.elem.context.innerText) == -1) {
                $(".layui-layout-admin .layui-body .layui-body-content").load('../../components/tpl/error.html');
                $(".footer").remove();
                $(".layui-tab-content").append("<div class=\"footer\">" +
                    "<div class=\"footer_in\">" +
                    "<div class=\"ri\">" +
                    "<span class=\"index2hidden\">" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"BM\">我的部门</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"YWGL\">我的业务</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLKF\">质量开发</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLBZ\">质量保障</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJNLGL\">Q+能力管理</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJGLXY\">Q+管理学院</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"GXGL\">风险管理</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CNGL\">产能管理</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CLTP\">材料图谱</a>" +
                    "&nbsp; | &nbsp;" +
                    "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"XTGL\">系统管理</a>" +
                    "</span>" +
                    "<p>Copyright@2017 上汽通用五菱汽车股份有限公司 | 桂ICP备案号05006817号-1 | 桂公网安备45020402000009号</p>" +
                    "</div>" +
                    "</div>" +
                    "</div>");
                return;
                // return layer.msg("您没有此权限", { icon: 5 });
            }
        }

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
        return false;

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
