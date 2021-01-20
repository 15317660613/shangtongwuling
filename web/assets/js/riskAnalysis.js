layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        table = layui.table,
        admin = layui.adc,
        formSelects = layui.formSelects;
    var saveArr = {
        ywmk: "",
        gysdm: [],
        fxcd: "",
        date: getPreMonth(new Date(), 1),
        sex: 0
    };
    var pieBtnFxcd = "";
    var type = 1;
    var barDate = getPreMonth(new Date(), 1);

    function getBtn() {
        var curUser = config.getAccount();
        var btn = "";
        if (curUser.roleIds.indexOf("1") > -1) {
            btn += "<button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"exportSingle\">单一页面导出</button>\n" +
                "                                    <button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"exportList\">总清单导出</button>\n" +
                "                                    <button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"push\">风险信息推送</button>\n" +
                "                                    <button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"pushList\">推送清单</button>"
        } else {
            btn += "<button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"exportSingle\">单一页面导出</button>\n" +
                "                                    <button class=\"layui-btn layui-btn-normal layui-btn-radius blue\" id=\"exportList\">总清单导出</button>"
        }
        $("#analysisBtn").empty().append(btn);
    }

    getBtn();

    // 重写时间戳转换方法
    Date.prototype.toLocaleString = function() {
        return this.getFullYear() + "-" + (this.getMonth() + 1 < 10 ? '0' + (this.getMonth() + 1) : this.getMonth() + 1) + "-" + (this.getDate() < 10 ? '0' + (this.getDate()) : this.getDate()) + " " + (this.getHours() < 10 ? '0' + (this.getHours()) : this.getHours()) + ":" + (this.getMinutes() < 10 ? '0' + (this.getMinutes()) : this.getMinutes()) + ":" + (this.getSeconds() < 10 ? '0' + (this.getSeconds()) : this.getSeconds());
    };

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
        var t2 = type == 1 ? year2 + "" + (month2 < 10 ? '0' + month2 : month2) : year2 + "-" + (month2 < 10 ? '0' + month2 : month2);
        return t2;
    }
    form.render();
    // 三个月柱状图分布
    function setDistributionBar(data) {
        admin.req("/api/risk/analysis/supplier-distribution?functionCodeList=" + data.ywmk + "&supplierCodeList=&levelList=" + data.fxcd + "&riskYear=" + data.date + "&scope=" + data.sex, {}, function(res) {
            setValues_1(res.data);
            setDistributionPie(data);
            $("#bar-title").text(data.date.substring(0, 4) + "年" + data.date.substring(4) + "月供应商风险状态分布-" + (data.sex == 0 ? "3个月滚动风险" : "12个月滚动风险"));
            $("#pie-title").text(data.date.substring(0, 4) + "年" + data.date.substring(4) + "月风险供应商按功能模块分布-" + (data.sex == 0 ? "3个月滚动风险" : "12个月滚动风险"));
        });
    }

    // 高风险饼状图
    function setDistributionPie(data) {
        admin.req("/api/risk/analysis/supplier-pie?functionCodeList=" + data.ywmk + "&supplierCodeList=&levelList=" + data.fxcd + "&riskYear=" + data.date + "&scope=" + data.sex, {}, function(res) {
            // 判断业务模块是否为空
            if (!data.ywmk) {
                var btn = "";
                $("#chart-pie").parent().parent().before("<div id='chart-pie-btn' class='layui-row pull-right'></div>");
                btn += "<button class='layui-btn layui-btn-sm layui-btn-primary green' value='" + saveArr.fxcd + "' id='all'>整体</button>" +
                    "<button class='layui-btn layui-btn-sm layui-btn-primary' value='1' id='high-btn'>高风险</button>" +
                    "<button class='layui-btn layui-btn-sm layui-btn-primary' value='2' id='mid-btn'>中风险</button>" +
                    "<button class='layui-btn layui-btn-sm layui-btn-primary' value='3' id='low-btn'>低风险</button>"
                $("#chart-pie-btn").empty().append(btn);
            } else {
                $("#chart-pie-btn").remove();
            }
            setValues_2(res.data);
            $(window).trigger("resize");
        });
    }

    // 首页分布图柱状图图表
    var myChartBar = echarts.init(document.getElementById('chart-bar'));

    // 绘制柱状图
    function setValues_1(json) {
        /*柱状图参数数据*/
        var paramsLeftBar = {};
        /*x轴数据*/
        var namesBar = [];
        /*y轴数据*/
        var valuesBar1 = [];
        var valuesBar2 = [];
        var valuesBar3 = [];
        /*循环json数据 赋值x轴、y轴数组数据*/
        for (var key in json) {
            var name = json[key].riskYear;
            var value1 = json[key].highCount;
            var value2 = json[key].lowCount;
            var value3 = json[key].middleCount;
            valuesBar1.push(value1);
            valuesBar2.push(value2);
            valuesBar3.push(value3);
            namesBar.push(name);
        }
        //组装参数
        paramsLeftBar.dataY1 = valuesBar1;
        paramsLeftBar.dataY2 = valuesBar2;
        paramsLeftBar.dataY3 = valuesBar3;
        paramsLeftBar.dataX = namesBar;
        //清空图表区域
        myChartBar.clear();
        //绘制柱状图
        myChartBar.setOption(getDistributionBarOption(paramsLeftBar), true);
    }

    // 首页分布图饼状图图表
    var myChartPie = echarts.init(document.getElementById('chart-pie'));

    // 绘制饼状图
    function setValues_2(json) {
        if (null == json) {
            json = {};
        }
        /*柱状图参数数据*/
        var paramsLeftPie = {};
        /*图例数据*/
        var legend = Object.keys(json);
        /*y轴数据*/
        var dataPie = [];
        /*循环json数据 赋值x轴、y轴数组数据*/
        for (var i in json) {
            var obj = {};
            obj.code = i;
            for (var j in json[i]) {
                obj.name = j;
                obj.value = json[i][j];
            }
            dataPie.push(obj);
        }
        //组装参数
        paramsLeftPie.data = dataPie;
        paramsLeftPie.legend = legend;
        //清空图表区域
        myChartPie.clear();
        //绘制柱状图
        if (paramsLeftPie.data.length) {
            $("#async-img").hide();
            $("#chart-pie").show();
            //$("#chart-pie-row div").append("<div id=\"chart-pie\" style=\"width: 96%;height: 260px;margin: 0 auto;\">");
            myChartPie.setOption(getDistributionPieOption(paramsLeftPie), true);
        } else if (paramsLeftPie.data.length == 0) {
            console.log(paramsLeftPie.data);
            $("#async-img").show();
            $("#chart-pie").hide();
        }

    }

    /**
     * 初始化下拉菜单
     */
    $.ajax({
        url: admin.formatUrl('/api/risk/analysis/functionname'),
        success: function(res) {
            var data = res.data;
            var selectData = [];
            for (var j = 0, length = data.length; j < length; j++) {
                var selectObj = {};
                selectObj.name = data[j].functionname;
                selectObj.value = data[j].functioncode;
                selectData.push(selectObj);
            }
            //formSelect-v4下拉树插件渲染
            formSelects.data('functionSelect', 'local', {
                arr: selectData
            });
            formSelects.btns('functionSelect', []);
        }
    });
    //formSelect-v4下拉树插件渲染
    formSelects.data('level', 'local', {
        arr: [{
            "name": "高风险",
            "value": 1
        }, {
            "name": "中风险",
            "value": 2
        }, {
            "name": "低风险",
            "value": 3
        }]
    });
    formSelects.btns('level', []);
    // 请求供应商代码
    $.ajax({
        url: admin.formatUrl('api/risk/analysis/supplierCode'),
        success: function(res) {
            var data = res.data;
            var queGpSelect = "<option value=''></option>";
            var queGpSelect1 = "<option value=''></option>";
            $.each(data, function(i, n) {
                queGpSelect += "<option value='" + n.suppliercode + "'>" + n.suppliercode + "</option>";
                queGpSelect1 += "<option value='" + n.suppliername + "'>" + n.suppliername + "</option>";
            });
            $("#gysdm1").html(queGpSelect);
            $("#gysmc1").html(queGpSelect1);
            form.render('select');
        }
    });
    // 风险分析供应商代码选择回调
    form.on('select(gysdm1)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("api/risk/analysis/supplier/" + loreGpId, {}, function(res) {
                data = res.data;
                $("#gysmc1").val(data.suppliername);
                form.render('select', 'form');
            });
        } else {
            $("#gysmc1").val("");
            form.render('select', 'form');
        }
    });
    // 风险分析供应商名称选择回调
    form.on('select(gysmc1)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api/risk/analysis/supplier-fuzzy?supplierName=" + loreGpId, {}, function(res) {
                data = res.data[0];
                $("#gysdm1").val(data.supplierCode);
                form.render('select', 'form');
            });
        } else {
            $("#gysdm1").val("");
            form.render('select', 'form');
        }
    });

    /*初始化日期框*/
    laydate.render({
        type: 'month',
        elem: '#date-1',
        value: getPreMonth(new Date(), 0)
    });

    /*查询按钮功能*/
    form.on('submit(search)', function(data) {
        /*点击查询 下拉框不消失，点击document*/
        $(document).trigger("click");
        if (data.field.date) {
            data.field.date = data.field.date.replace("-", "");
        } else {
            data.field.date = getPreMonth(new Date(), 1);
        }
        renderTable(type, data.field, "demo-table");
        setDistributionBar(data.field);
        saveArr = data.field;
        barDate = data.field.date;
        $("#bar-title").text(data.field.date.substring(0, 4) + "年" + data.field.date.substring(4) + "月供应商风险状态分布-" + (data.field.sex == 0 ? "3个月滚动风险" : "12个月滚动风险"));
        $("#pie-title").text(data.field.date.substring(0, 4) + "年" + data.field.date.substring(4) + "月风险供应商按功能模块分布-" + (data.field.sex == 0 ? "3个月滚动风险" : "12个月滚动风险"));
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
    /*清空按钮功能*/
    $("#reset").click(function() {
        form.val("form", {
            "sex": "0",
            "gysdm": "",
            "gysmc": "",
        });
        formSelects.value('functionSelect', []);
        formSelects.value('level', []);
        $("#date-1").val(getPreMonth(new Date(), 0));
        $("#searchAll").trigger("click");
    });
    /*防止侧边栏收缩出现错位*/
    $(".admin-user").click(function() {
        setTimeout(function() {
            myChartBar.resize();
        }, 200)
    });
    // 获得柱状图参数
    function getDistributionBarOption(params) {
        /*图标参数*/
        var optionBar = {
            title: {
                text: params.dataX[0].substring(0, 4) + "年" + params.dataX[0].substring(4) + "月~" + params.dataX[11].substring(0, 4) + "年" + params.dataX[11].substring(4) + "月",
                x: 'center',
                textStyle: {
                    color: '#A5A5A5',
                    fontSize: 14,
                    fontWeight: 600
                }
            },
            legend: {
                left: 'right',
                top: 15
            },
            color: ['rgba(24, 144, 255, 0.8)'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(216, 216, 216, 0.33)'
                    }
                },
                extraCssText: 'background-color:#fff;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
                formatter: function(params, ticket, callback) {
                    var total = 0;
                    for (var i = 0; i < params.length; i++) {
                        var item = params[i];
                        total += item.data - 0;
                    }
                    var title = params[0].axisValue.substring(0, 4) + "年" + params[0].axisValue.substring(4) + '月' + '风险供应商数量：'
                    var html =
                        '<div style="position: relative;">' +

                        '<h5 style="text-align:center;font-size:14px;font-family:PingFangSC-Regular;font-weight:400;color:rgba(0,0,0,0.65);line-height:18px;">' +
                        title + '<br></br>' + total + "家"
                    '</h5>' +
                    '<div style="position: absolute;bottom:-10px;left: 50%;transform: translateX(-10px);width:0;height:0;border-top: 14px solid #fff;border-left:10px solid transparent;border-right:10px solid transparent;"></div>' +
                    '</div>';
                    return html;
                },
                position: function(pos, params, dom, rect, size) {
                    var obj = {};
                    obj.left = pos[0] - size.contentSize[0] / 2;
                    obj.top = pos[1] - size.contentSize[1] - 10;
                    return obj;
                }
            },
            grid: {
                left: '2%',
                right: '5%',
                top: '16%',
                bottom: '2%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                data: params.dataX,
                axisLine: {
                    lineStyle: {
                        color: '#d9d9d9'
                    }
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    formatter: function(value, index) {
                        return value.substring(4)
                    },
                    textStyle: {
                        color: 'rgba(0, 0, 0, 0.65)'
                    }
                }
            }],
            yAxis: [{
                type: 'value',
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: 'rgba(0, 0, 0, 0.65)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#e8e8e8',
                        type: 'dashed'
                    }
                }
            }],
            series: [{
                name: '低风险',
                type: 'bar',
                barWidth: '50%',
                stack: '总量',
                data: params.dataY2,
                itemStyle: {
                    color: '#3BA0FF'
                }
            }, {
                name: '中风险',
                type: 'bar',
                barWidth: '50%',
                stack: '总量',
                data: params.dataY3,
                itemStyle: {
                    color: '#FAD337'
                }
            }, {
                name: '高风险',
                type: 'bar',
                barWidth: '50%',
                stack: '总量',
                data: params.dataY1,
                itemStyle: {
                    color: '#FF867F'
                }
            }]
        };
        return optionBar;
    }

    // 获取饼状图参数
    function getDistributionPieOption(params) {
        var optionPie = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"

            },
            legend: {
                show: false,
                orient: 'vertical',
                x: 'left',
                data: params.legend
            },
            series: [{
                name: '',
                type: 'pie',
                radius: ['50%', '70%'],
                center: ['55%', '50%'], //图的位置，距离左跟上的位置
                avoidLabelOverlap: false,
                //hoverAnimation:false,	//关闭 hover 在扇区上的放大动画效果。
                label: {
                    normal: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}{d}%', //模板变量有 {a}、{b}、{c}、{d}，分别表示系列名，数据名，数据值，百分比。{d}数据会根据value值计算百分比

                        textStyle: {
                            fontSize: 12,
                            color: '#000'
                        }
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: 12,
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: true,
                        length: 10,
                        length2: 10
                    }
                },
                itemStyle: {
                    borderColor: "#fff",
                    borderWidth: 5
                },
                data: params.data
            }],
            color: ['#1369A4', '#34BFD3', '#4DCB73', '#DBC754', '#D5668F']
        };
        return optionPie;
    }

    // 渲染列表
    var renderTable = function(num, data, content) {

        var rank;
        if (data.ywmk.length) {
            rank = "业务模块排名";
        } else {
            rank = "总体排名";
        }
        table.render({
            elem: '#' + content,
            url: admin.formatUrl('api/risk/analysis/supplier-detail?type=' + num + "&functionCodeList=" + data.ywmk + "&supplierCodeList=" + data.gysdm + "&levelList=" + data.fxcd + "&riskYear=" + data.date + "&scope=" + data.sex),
            parseData: function(res) { //res 即为原始返回的数据
                if (res.ok) {
                    return {
                        "code": res.respCode, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data ? res.data.count : 0, //解析数据长度
                        "data": res.data ? res.data.list : [] //解析数据列表
                    };
                } else {
                    layer.msg(res.message);
                }
            },
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            even: true,
            cols: [
                [{
                    title: '序号',
                    type: 'numbers',
                    rowspan: 2
                }, {
                    title: '供应商代码',
                    field: 'supplierCode',
                    align: 'center',
                    width: 100,
                    rowspan: 2
                }, {
                    title: '供应商名称',
                    field: 'supplierName',
                    align: 'center',
                    width: 100,
                    rowspan: 2
                }, {
                    title: '业务模块',
                    field: 'functionName',
                    minWidth: 130,
                    align: 'center',
                    rowspan: 2
                }, {
                    title: '主要供货产品',
                    field: 'partsName',
                    align: 'center',
                    minWidth: 120,
                    rowspan: 2
                }, {
                    title: '3个月滚动风险预警',
                    field: 'threeMonthRiskExpect',
                    align: 'center',
                    colspan: 4
                }, {
                    title: '12个月滚动风险预警',
                    field: 'threeMonthRiskRank',
                    align: 'center',
                    minWidth: 120,
                    colspan: 4
                }],
                [{
                    title: '风险暴露值',
                    field: 'threeMonthRiskExpect',
                    align: 'center',
                    width: 100,
                    templet: function(d) {
                        return d.threeMonthRiskExpect != null ? (d.threeMonthRiskExpect * 100).toFixed(2) + "%" : ""
                    }
                }, {
                    title: rank,
                    field: 'threeMonthRiskRank',
                    align: 'center',
                    width: 120
                }, {
                    title: '排名变化',
                    field: 'threeMonthRankChange',
                    align: 'center',
                    width: 90,
                    templet: '#threeMonthRankChange'
                }, {
                    title: '风险程度',
                    field: 'threeMonthRiskLevel',
                    align: 'center',
                    width: 90,
                    templet: function(d) {
                        switch (d.threeMonthRiskLevel) {
                            case 0:
                                return "其他";
                            case 1:
                                return "高风险";
                            case 2:
                                return "中风险";
                            case 3:
                                return "低风险";
                            case 4:
                                return "其他";
                            default:
                                return "";
                        }
                    }
                }, {
                    title: '风险暴露值',
                    field: 'twelveMonthRiskExpect',
                    align: 'center',
                    width: 100,
                    templet: function(d) {
                        return d.twelveMonthRiskExpect != null ? (d.twelveMonthRiskExpect * 100).toFixed(2) + "%" : ""
                    }
                }, {
                    title: rank,
                    field: 'twelveMonthRiskRank',
                    align: 'center',
                    width: 120
                }, {
                    title: '排名变化',
                    field: 'twelveMonthRankChange',
                    align: 'center',
                    width: 90,
                    templet: '#twelveMonthRankChange'
                }, {
                    title: '风险程度',
                    field: 'twelveMonthRiskLevel',
                    align: 'center',
                    width: 93,
                    templet: function(d) {
                        switch (d.twelveMonthRiskLevel) {
                            case "0":
                                return "其他";
                            case "1":
                                return "高风险";
                            case "2":
                                return "中风险";
                            case "3":
                                return "低风险";
                            case "4":
                                return "其他";
                            default:
                                return "";
                        }
                    }
                }]
            ],
            // height: 511,
            page: true,
            done: function(res, curr, count) {
                setTimeout(function() {
                    $(window).trigger("resize");
                }, 200);
                if (num == 0 && res.data.length == 0) {
                    layer.msg("尚无相关权限！");
                }

                var dev_obj; //layui table 父div
                var layuitable = null; //当前的layui table
                dev_obj = document.getElementById('table_and_page_div_id'); //table的父div,名字替换成相对应的
                if (dev_obj != null) {
                    layuitable = dev_obj.getElementsByClassName("layui-table-main");
                }
                console.log(dev_obj, layuitable, sessionStorage["scrollleft" + 'table_and_page_div_id']);
                //更改滚动条位置
                layuitable[0].scrollLeft = sessionStorage["scrollleft" + 'table_and_page_div_id'];
            }
        });
    }
    renderTable(1, {
        ywmk: [],
        gysdm: [],
        fxcd: "",
        date: getPreMonth(new Date(), 1),
        sex: 0
    }, "demo-table");

    // 表格操作列监听事件
    table.on('tool(tableContent1)', function(obj) {
        // 获取点击列的数据
        var data = obj.data;
        var layEvent = obj.event;
        var params;
        // 判断操作类型/编辑用户
        if (layEvent === 'link') {
            //弹出窗口
            layer.open({
                type: 1,
                title: '风险信息一览',
                content: $("#linkTpl"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
                area: '70%',
                // shade: 0.3,
                success: function(layero, index) {
                    var mask = $(".layui-layer-shade").eq(1);
                    mask.before(layero);
                    renderTable(type, {
                        ywmk: saveArr.ywmk,
                        gysdm: saveArr.gysdm,
                        fxcd: saveArr.fxcd,
                        date: saveArr.date,
                        sex: saveArr.sex
                    }, "tableContent2");
                }
            });
        }
    });
    // 渲染推送列表
    var renderTable1 = function() {
        table.render({
            // id: 'demo-table',
            elem: '#tableContent1'
                // , method: "get"
                ,
            // data: res.data,
            url: admin.formatUrl('/api/risk/analysis/email/history')
                // ,toolbar: '#toolbarDemo'
                // , contentType: 'application/json'
                // , title: '风险评估表'
                ,
            parseData: function(res) { //res 即为原始返回的数据
                return {
                    "code": res.respCode, //解析接口状态
                    "msg": res.message, //解析提示文本
                    // "count": total, //解析数据长度
                    "data": res.data //解析数据列表
                };
            },
            even: true,
            cols: [
                [{
                    title: '序号',
                    type: 'numbers',
                    rowspan: 2
                }, {
                    title: '推送时间',
                    field: 'sendDate',
                    align: 'center',
                    minWidth: 100,
                    templet: function(row) {
                        return row.sendDate ? new Date(parseInt(row.sendDate)).toLocaleString() : "";
                    },
                    rowspan: 2
                }, {
                    title: '推送方式',
                    field: 'emailType',
                    minWidth: 130,
                    align: 'center',
                    rowspan: 2,
                    templet: function(d) {
                        return d.emailType == 1 ? "手动推送" : "自动推送"
                    }
                }, {
                    title: '接收人员',
                    field: 'receiverName',
                    align: 'center',
                    minWidth: 120,
                    rowspan: 2
                }, {
                    title: '推送清单',
                    field: '',
                    align: 'center',
                    rowspan: 2,
                    templet: '#pushListBtn'
                }, {
                    title: '风险查询条件',
                    field: 'supplierName',
                    align: 'center',
                    minWidth: 100,
                    colspan: 6
                }],
                [{
                    title: '风险范围',
                    field: 'scope',
                    align: 'center',
                    width: 100,
                    templet: '#scope'
                }, {
                    title: '风险日期',
                    field: 'createDate',
                    align: 'center',
                    width: 100,
                    templet: function(row) {
                        return row.createDate ? new Date(parseInt(row.createDate)).toLocaleString() : "";
                    },
                }, {
                    title: '供应商代码',
                    field: 'supplierCode',
                    align: 'center',
                    width: 100
                }, {
                    title: '供应商名称',
                    field: 'supplierName',
                    align: 'center',
                    width: 100
                }, {
                    title: '业务模块',
                    field: 'functionName',
                    align: 'center',
                    width: 100
                }, {
                    title: '风险程度',
                    field: 'riskLevel',
                    align: 'center',
                    width: 100,
                    templet: function(d) {
                    	debugger;
                        switch (d.riskLevel) {
                            case 0:
                                return "其他";
                            case 1:
                                return "高风险";
                            case 2:
                                return "中风险";
                            case 3:
                                return "低风险";
                            case 4:
                                return "其他";
                            default:
                                return "";
                        }
                    }
                }]
            ],
            // height: 511,
            page: false,
            done: function(res, curr, count) {
                setTimeout(function() {
                    $(window).resize();
                }, 200);
            }
        });
    };

    /*左侧饼图点击事件*/
    myChartPie.on('click', function(params) {
        //弹出窗口
        if (!saveArr.ywmk) {
            layer.open({
                type: 1,
                title: '供应商清单信息',
                content: $("#gysList"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
                area: ['100%', '100%'],
                // shade: 0.3,
                success: function(layero, index) {
                    var mask = $(".layui-layer-shade");
                    mask.before(layero);
                    renderTable(0, {
                        ywmk: params.data.code,
                        gysdm: saveArr.gysdm,
                        fxcd: pieBtnFxcd==="" ? saveArr.fxcd:pieBtnFxcd,
                        date: barDate,
                        sex: saveArr.sex
                    }, "tableContent");
                }
            });
        }
    });
    // 柱状图点击事件
    myChartBar.on('click', function(params) {
        setDistributionPie({
            ywmk: saveArr.ywmk,
            gysdm: saveArr.gysdm,
            fxcd: saveArr.fxcd,
            date: params.name,
            sex: saveArr.sex
        });
        barDate = params.name;
        $("#pie-title").text(params.name.substring(0, 4) + "年" + params.name.substring(4) + "月风险供应商按功能模块分布-" + (saveArr.sex == 0 ? "3个月滚动风险" : "12个月滚动风险"));
    });
    // 风险信息推送
    $("#push").click(function() {
        admin.req("/api/risk/analysis/email?functionCodeList=" + saveArr.ywmk + "&supplierCodeList=" + saveArr.gysdm + "&levelList=" + saveArr.fxcd + "&riskYear=" + saveArr.date + "&scope=" + saveArr.sex, {}, function(res) {
            if (res.ok) {
                layer.msg(res.message);
            } else {
                layer.msg(res.message);
            }
        });
    });
    // 单一页面导出
    $("#exportSingle").click(function() {
        window.location.href = "/api/risk/analysis/excel/single?type=" + type + "&functionCodeList=" + saveArr.ywmk + "&supplierCodeList=" + saveArr.gysdm + "&levelList=" + saveArr.fxcd + "&riskYear=" + saveArr.date + "&scope=" + saveArr.sex
    });
    // 总清单导出
    $("#exportList").click(function() {
        window.location.href = "/api/risk/analysis/excel/all?type=0&functionCodeList=" + saveArr.ywmk + "&supplierCodeList=" + saveArr.gysdm + "&levelList=" + saveArr.fxcd + "&riskYear=" + saveArr.date + "&scope=" + saveArr.sex
            // admin.req("/api/risk/analysis/excel/all?type=0&functionCodeList=" + saveArr.ywmk + "&supplierCodeList=" + saveArr.gysdm + "&levelList=" + saveArr.fxcd + "&riskYear=" + saveArr.date + "&scope=" + saveArr.sex, {}, function(res) {

        // });
    });
    // 推送清单
    $("#pushList").click(function() {
        //弹出窗口
        layer.open({
            type: 1,
            title: '推送清单信息',
            content: $("#pushListTpl"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            area: ['100%', '100%'],
            // shade: 0.3,
            success: function(layero, index) {
                var mask = $(".layui-layer-shade");
                mask.before(layero);
                renderTable1();
            }
        });
    });
    // 高风险按钮点击事件
    $("#pieBody").on('click', 'button', function() {
        $(this).addClass("green").siblings().removeClass("green");
        if (!saveArr.fxcd) {
            pieBtnFxcd = $(this).val();
            admin.req("/api/risk/analysis/supplier-pie?type=0&functionCodeList=" + saveArr.ywmk + "&supplierCodeList=&levelList=" + $(this).val() + "&riskYear=" + barDate + "&scope=" + saveArr.sex, {}, function(res) {
                if (res.ok) {
                    setValues_2(res.data);
                }
            });
        } else {
            if (saveArr.fxcd.indexOf($(this).val()) != -1) {
                pieBtnFxcd = $(this).val();
                admin.req("/api/risk/analysis/supplier-pie?type=0&functionCodeList=" + saveArr.ywmk + "&supplierCodeList=&levelList=" + $(this).val() + "&riskYear=" + barDate + "&scope=" + saveArr.sex, {}, function(res) {
                    if (res.ok) {
                        setValues_2(res.data);
                    }
                });
            } else {
                layer.msg("该风险等级无法查询，请重新确认筛选条件");
            }
        }
    });

    // top10点击事件
    $("#top10").click(function() {
        renderTable(1, saveArr, "demo-table");
        $(this).addClass("green").siblings().removeClass("green");
        type = 1;
    });
    // top20点击事件
    $("#top20").click(function() {
        renderTable(2, saveArr, "demo-table");
        $(this).addClass("green").siblings().removeClass("green");
        type = 2;
    });
    // top30点击事件
    $("#top30").click(function() {
        renderTable(3, saveArr, "demo-table");
        $(this).addClass("green").siblings().removeClass("green");
        type = 3;
    });
    // top50点击事件
    $("#top50").click(function() {
        renderTable(5, saveArr, "demo-table");
        $(this).addClass("green").siblings().removeClass("green");
        type = 5;
    });

    setDistributionBar({
        ywmk: "",
        gysdm: [],
        fxcd: "",
        date: getPreMonth(new Date(), 1),
        sex: 0
    });
    renderTable(1, {
        ywmk: [],
        gysdm: [],
        fxcd: "",
        date: getPreMonth(new Date(), 1),
        sex: 0
    }, "demo-table");
    /*图表自适应窗口大小*/
    setTimeout(function() {
        window.onresize = function() {
            myChartBar.resize();
            myChartPie.resize();
        }
    }, 1000);
})