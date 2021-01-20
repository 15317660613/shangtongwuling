layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        table = layui.table,
        admin = layui.adc,
        formSelects = layui.formSelects;
    var saveArr2 = {
        ywmk2: "",
        gysdm2: "",
        date: getPreMonth(new Date(), 1)
    };
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
        var t2 = type == 1 ? year2 + "" + (month2 < 10 ? '0' + month2 : month2) : year2 + "-" + (month2 < 10 ? '0' + month2 : month2);
        return t2;
    }

    // 风险监控供应商代码选择回调
    form.on('select(gysdm2)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api-edu/risk/analysis/supplier/" + loreGpId, {}, function(res) {
                data = res.data;
                $("#gysmc2").val(data.suppliername);
                form.render('select', 'form1');
            });
        } else {
            $("#gysmc2").val("");
            form.render('select', 'form1');
        }
    });
    // layui.formSelects.on('supplierCode', function(id, vals, val, isAdd, isDisabled) {
    //     //id:           点击select的id
    //     //vals:         当前select已选中的值
    //     //val:          当前select点击的值
    //     //isAdd:        当前操作选中or取消
    //     //isDisabled:   当前选项是否是disabled
    //     //如果return false, 那么将取消本次操作
    //     admin.req("/api-edu/risk/analysis/supplier/" + val.value, {}, function(res) {
    //         data = res.data;
    //         // $("#gysmc2").val(data.suppliername);
    //         if (isAdd) {
    //             layui.formSelects.value('supplierName', [data.suppliername], true);
    //         } else {
    //             layui.formSelects.value('supplierName', [data.suppliername], false);
    //         }
    //         // form.render('select', 'form1');
    //     });
    // });
    // 风险监控供应商名称选择回调
    form.on('select(gysmc2)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api-edu/risk/analysis/supplier-fuzzy?supplierName=" + loreGpId, {}, function(res) {
                data = res.data[0];
                $("#gysdm2").val(data.supplierCode);
                form.render('select', 'form1');
            });
        } else {
            $("#gysdm2").val("");
            form.render('select', 'form1');
        }
    });

    // 风险监控供应商代码选择回调
    form.on('select(supplierCodeDetail)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api-edu/risk/analysis/supplier/" + loreGpId, {}, function(res) {
                data = res.data;
                $("#supplierNameDetail").val(data.suppliername);
                form.render('select', 'supplierManage');
            });
        } else {
            $("#supplierNameDetail").val("");
            form.render('select', 'supplierManage');
        }
    });

    // 风险监控供应商名称选择回调
    form.on('select(supplierNameDetail)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api-edu/risk/analysis/supplier-fuzzy?supplierName=" + loreGpId, {}, function(res) {
                data = res.data[0];
                $("#supplierCodeDetail").val(data.supplierCode);
                form.render('select', 'supplierManage');
            });
        } else {
            $("#supplierCodeDetail").val("");
            form.render('select', 'supplierManage');
        }
    });

    var date2 = getPreMonth(new Date(), 0);
    /*初始化日期框*/
    laydate.render({
        type: 'month',
        elem: '#date-2',
        value: getPreMonth(new Date(), 0),
        done: function(value, date, endDate) {
            var value1 = value.replace('-', '')
            console.log(value1);
            date2 = value1;
        }
    });
    laydate.render({
        type: 'month',
        elem: '#dateDetail'
    });
    $("#reset1").click(function() {
        form.val("form1", {
            "gysdm2": "",
            "gysmc2": ""
        });
        formSelects.value('functionSelect', []);
    });
    $("#reset").click(function() {
        form.val("supplierManage", {
            "riskTime": "",
            "supplierCode": "",
            "supplierName": "",
            "scope": "0"
        });
    });
    // 全局查询结果变量
    var response;
    var curDate2 = getPreMonth(new Date(), 1);
    // 渲染表格
    var renderTable2 = function(data) {
        table.render({
            elem: '#demo-table1',
            id: 'demo-table1',
            data: data,
            even: true,
            cols: [
                [{
                    title: 'NO.',
                    type: 'numbers',
                    rowspan: 2
                }, {
                    title: '日期',
                    field: 'riskDate',
                    align: 'center',
                    minWidth: 80,
                    rowspan: 2
                }, {
                    title: '供应商代码',
                    field: 'supplierCode',
                    align: 'center',
                    minWidth: 100,
                    rowspan: 2
                }, {
                    title: '供应商名称',
                    field: 'supplierName',
                    align: 'center',
                    minWidth: 120,
                    rowspan: 2
                }, {
                    title: '3个月风险',
                    field: 'riskExpect',
                    align: 'center',
                    colspan: 3
                }, {
                    title: '业务模块',
                    field: 'functionName',
                    align: 'center',
                    minWidth: 100,
                    rowspan: 2
                }],
                [{
                    title: '风险暴露值',
                    field: 'riskLevel',
                    align: 'center',
                    width: 100
                }, {
                    title: '风险排名',
                    field: 'riskRank',
                    align: 'center',
                    width: 100
                }, {
                    title: '排名变化',
                    field: 'rankChange',
                    align: 'center',
                    width: 100,
                    templet: '#rankChange'
                }]
            ],
            page: true
        });
    };

    var renderSupplierManageTable = function(tableR, data) {
        if (!data) {
            data = [];
        }
        table.render({
            elem: '#supplierTable',
            id: 'supplierTable',
            where: data,
            url: admin.formatUrl('/api-edu/risk/monitior/risk-supplier/page'),
            parseData: function(res) { //res 即为原始返回的数据
                var data = res.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].isMonitorLast == '0') {
                        data[i].isMonitorLast = '否';
                    } else if (data[i].isMonitorLast == '1') {
                        data[i].isMonitorLast = '是';
                    }
                }
                return {
                    "code": res.respCode, //解析接口状态
                    "msg": res.message, //解析提示文本
                    "count": res.data.count, //解析数据长度
                    "data": res.data.list, //解析数据列表
                };
            },
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            even: true,
            cols: tableR,
            // height: 600,
            page: true
        });
    }
    var supplierStatusChart = echarts.init(document.getElementById('chart-barFist'));
    // 设置风险供应商状态图
    function setSupplierStatus(data) {
        // getSelect();
        var urlList = ['prr', 'field', 'dt', 'spill', 'ppm', 'fpe'];
        admin.req("/api-edu/risk/monitior/supplier-status?functionNameList=" + data.ywmk2 + "&supplierCode=" + data.gysdm2 + "&riskYear=" + data.date, {}, function(res) {
            if (res.ok) {
                response = res.data;
                var json = eval(res.data);
                setValues_3(json);
                renderTable2(res.data[0].increase.concat(res.data[0].keep));
            } else {
                layer.msg(res.message);
            }
        });
        for (var i = 1; i <= 6; i++) {
            $("#chart-pie" + i + "Text").text(saveArr2.date.substring(4) + "月份环比");
            initEcharts(urlList[i - 1], "chart-bar" + i, "chart-pie" + i, i, data.date, data.ywmk2, "", data.gysdm2);
        }
    }
    // 绘制柱状图
    function setValues_3(data) {
        /*柱状图参数数据*/
        var paramsLeftBar = {};
        /*循环json数据 赋值x轴、y轴数组数据*/
        var category = [];
        var decrease = [];
        var keep = [];
        var increase = [];
        var support = [];
        var support2 = [];
        for (var i = 0; i < 12; i++) {
            category.push(data[i].riskYear.slice(0, 4) + "/" + data[i].riskYear.slice(4));
            decrease.push(-data[i].decrease.length);
            keep.push(data[i].keep.length);
            increase.push(data[i].increase.length);
            support.push("0.5");
            support2.push("-0.5");
        }
        //组装参数

        paramsLeftBar.dataY1 = decrease;
        paramsLeftBar.dataY2 = keep;
        paramsLeftBar.dataY3 = increase;
        paramsLeftBar.dataY4 = support;
        paramsLeftBar.dataY5 = support2;
        paramsLeftBar.dataX = category;
        //清空图表区域
        supplierStatusChart.clear();
        //绘制柱状图
        supplierStatusChart.setOption(getSupplierStatusOption(paramsLeftBar), true);
        supplierStatusChart.resize();
    }
    // 风险监控页供应商风险状态图参数获取
    function getSupplierStatusOption(params) {
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: '{b0}: <br />{a0}: {c0}<br />{a1}: {c1}<br />{a2}: {c2}'
            },
            grid: {
                left: 55,
                top: 30,
                bottom: 10
            },
            legend: {
                data: ['退出数', '维持数', '新进数'],
                left: '0',
                width: '240'
            },
            calculable: true,
            xAxis: [{
                show: false,
                type: 'value'
            }],
            yAxis: [{
                type: 'category',
                data: params.dataX,
                inverse: true
            }],
            series: [
                /*{
                                    name: '辅助二号',
                                    type: 'bar',
                                    stack: '总量',
                                    itemStyle: {
                                        normal: {
                                            barBorderColor: 'rgba(0,0,0,0)',
                                            color: 'rgba(0,0,0,0)',
                                            label: {
                                                show: false,
                                                position: 'insideRight'
                                            }
                                        },
                                        emphasis: {
                                            barBorderColor: 'rgba(0,0,0,0)',
                                            color: 'rgba(0,0,0,0)'
                                        }
                                    },
                                    data: params.dataY4
                                },*/
                {
                    name: '维持数',
                    type: 'bar',
                    color: '#3BA0FF',
                    stack: '总量',
                    barWidth: 15,
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                                position: 'insideRight'
                            },
                            barBorderRadius: 15
                        }
                    },
                    data: params.dataY2
                },
                /*{
                    name: '辅助',
                    type: 'bar',
                    stack: '总量',
                    itemStyle: {
                        normal: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)',
                            label: {
                                show: false,
                                position: 'insideRight'
                            }
                        },
                        emphasis: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)'
                        }
                    },
                    data: params.dataY4
                },*/
                {
                    name: '新进数',
                    type: 'bar',
                    color: '#FAD337',
                    stack: '总量',
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                                position: 'insideRight'
                            },
                            barBorderRadius: 15
                        }
                    },
                    data: params.dataY3
                },
                /*{
                    name: '辅助三号',
                    type: 'bar',
                    stack: '总量',

                    itemStyle: {
                        normal: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)',
                            label: {
                                show: false,
                                position: 'insideLeft'
                            }
                        },
                        emphasis: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)'
                        }
                    },
                    data: params.dataY5
                },*/
                {
                    name: '退出数',
                    type: 'bar',
                    color: '#FF867F',
                    stack: '总量',
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                                position: 'insideLeft'
                            },
                            barBorderRadius: 15
                        }
                    },
                    data: params.dataY1
                }
            ]
        };
        return option;
    }
    // 风险监控页上部柱状图点击事件
    supplierStatusChart.on('click', function(params) {
        var data;
        for (var i = 0; i < response.length; i++) {
            if (response[i].riskYear == params.name.replace("/", "")) {
                if (params.componentIndex == 1) {
                    data = response[i].increase;
                } else if (params.componentIndex == 0) {
                    data = response[i].keep;
                } else {
                    data = response[i].decrease;
                }

            }
        }
        renderTable2(data);
    });

    function getSelect() {
        $.ajax({
            url: admin.formatUrl('/api-edu/risk/analysis/supplierCode'),
            success: function(res) {
                var data = res.data;
                var queGpSelect = "<option value=''></option>";
                var queGpSelect1 = "<option value=''></option>";
                $.each(data, function(i, n) {
                    queGpSelect += "<option value='" + n.suppliercode + "'>" + n.suppliercode + "</option>";
                    queGpSelect1 += "<option value='" + n.suppliername + "'>" + n.suppliername + "</option>";
                });
                $("#gysdm2").html(queGpSelect);
                $("#gysmc2").html(queGpSelect1);
                $("#supplierCodeDetail").html(queGpSelect);
                $("#supplierNameDetail").html(queGpSelect1);
                form.render('select');
                // var data = res.data;
                // var selectData = [];
                // var selectData1 = [];
                // for (var j = 0, length = data.length; j < length; j++) {
                //     var selectObj = {};
                //     selectObj.name = data[j].suppliercode;
                //     selectObj.value = data[j].suppliercode;
                //     selectData.push(selectObj);

                //     var selectObj1 = {};
                //     selectObj1.name = data[j].suppliername;
                //     selectObj1.value = data[j].suppliername;
                //     selectData1.push(selectObj1);
                // }
                // //formSelect-v4下拉树插件渲染
                // formSelects.data('supplierCode', 'local', {
                //     arr: selectData
                // });
                // formSelects.btns('supplierCode', []);
                // formSelects.data('supplierName', 'local', {
                //     arr: selectData1
                // });
                // formSelects.btns('supplierName', []);
            }
        });

        /**
         * 初始化数据分析下拉菜单
         */
        $.ajax({
            url: admin.formatUrl('/api-edu/risk/analysis/functionname'),
            success: function(res) {
                var data = res.data;
                var selectData = [];
                for (var j = 0, length = data.length; j < length; j++) {
                    var selectObj = {};
                    selectObj.name = data[j].functionname;
                    selectObj.value = data[j].functionname;
                    selectData.push(selectObj);
                }
                //formSelect-v4下拉树插件渲染
                formSelects.data('functionSelect', 'local', {
                    arr: selectData
                });
                formSelects.btns('functionSelect', []);
            }
        });
    }
    // 获取供应商管理弹出页列表
    function getSupplierManageCols(riskYearLast, riskYearNow) {
        var tableR = [
            [{
                title: 'NO.',
                type: 'numbers',
                rowspan: 2
            }, {
                title: '供应商代码',
                field: 'supplierCode',
                align: 'center',
                minWidth: 100,
                rowspan: 2
            }, {
                title: '供应商名称',
                field: 'supplierName',
                align: 'center',
                minWidth: 100,
                rowspan: 2
            }, {
                title: riskYearLast + '是否在监控中',
                field: 'isMonitorLast',
                align: 'center',
                minWidth: 170,
                rowspan: 2,
                templet: function(d) {
                    switch (d.isMonitorLast) {
                        case "0":
                            return '否';
                            break;
                        case "1":
                            return '是';
                            break;
                    }
                }
            }, {
                title: '是否纳入' + riskYearNow + '月监控',
                field: 'isMonitorNow',
                align: 'center',
                templet: '#checkboxTpl',
                minWidth: 180,
                rowspan: 2,
                templet: function(d) {
                    if (d.isMonitorNow == 1) {
                        return '<input id="' + d.riskYearNow + '" value="' + d.supplierCode + '" type="checkbox" name="' + d + '"  lay-skin="switch" lay-filter="bjDemo" lay-text="加入|不加入" checked>'
                    } else {
                        return '<input id="' + d.riskYearNow + '" type="checkbox" value="' + d.supplierCode + '" lay-skin="switch" lay-filter="bjDemo" lay-text="加入|不加入">'
                    }
                }
            }, {
                title: '业务模块',
                field: 'functionName',
                align: 'center',
                minWidth: 100,
                rowspan: 2
            }, {
                title: '主要影响产品',
                field: 'partsName',
                align: 'center',
                minWidth: 120,
                rowspan: 2
            }, {
                title: '3个月风险',
                field: '',
                align: 'center',
                colspan: 4
            }, {
                title: '12个月风险',
                field: '',
                align: 'center',
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
                title: '总体排名',
                field: 'threeMonthRiskRank',
                align: 'center',
                width: 100
            }, {
                title: '排名变化',
                field: 'threeMonthRankChange',
                align: 'center',
                templet: '#threeMonthRankChange',
                width: 100
            }, {
                title: '风险程度',
                field: 'threeMonthRiskLevel',
                align: 'center',
                width: 100,
                templet: function(d) {
                    switch (d.threeMonthRiskLevel) {
                        case 1:
                            return '高风险';
                            break;
                        case 2:
                            return '中风险';
                            break;
                        case 3:
                            return '低风险';
                            break;
                        default:
                            return '其他';
                            break;
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
                title: '总体排名',
                field: 'twelveMonthRiskRank',
                align: 'center',
                width: 100
            }, {
                title: '排名变化',
                field: 'twelveMonthRankChange',
                align: 'center',
                templet: '#twelveMonthRankChange',
                width: 100
            }, {
                title: '风险程度',
                field: 'twelveMonthRiskLevel',
                align: 'center',
                width: 100,
                templet: function(d) {
                    switch (d.twelveMonthRiskLevel) {
                        case 1:
                            return '高风险';
                            break;
                        case 2:
                            return '中风险';
                            break;
                        case 3:
                            return '低风险';
                            break;
                        default:
                            return '其他';
                            break;
                    }
                }
            }]
        ];
        return tableR;
    }
    // 风险监控tab页查询
    form.on('submit(search1)', function(data) {
        if (data.field.date) {
            data.field.date = data.field.date.replace("-", "");
        } else {
            data.field.date = getPreMonth(new Date(), 1);
        }
        setSupplierStatus(data.field);
        saveArr2 = data.field;
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
    // 风险供应商管理页查询
    form.on('submit(supplierManage)', function(data) {
        //debugger
        var lastMonth = getPreMonth(new Date(data.field.riskTime.replace(/-/g, "/")), 1);
        if (data.field.riskTime) {
            data.field.riskTime = data.field.riskTime.replace("-", "");
        }
        var tableR = getSupplierManageCols(lastMonth, data.field.riskTime);
        renderSupplierManageTable(tableR, data.field);
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

    function getMonth(index) {
        if (index == '1') {
            return currentYear - 1 + '12'
        } else {
            return currentYear + index.toString()
        }
    }
    // 初始化图表
    var prrChartBar1 = echarts.init(document.getElementById("chart-bar1"));
    var prrChartBar2 = echarts.init(document.getElementById("chart-bar2"));
    var prrChartBar3 = echarts.init(document.getElementById("chart-bar3"));
    var prrChartBar4 = echarts.init(document.getElementById("chart-bar4"));
    var prrChartBar5 = echarts.init(document.getElementById("chart-bar5"));
    var prrChartBar6 = echarts.init(document.getElementById("chart-bar6"));
    // 计数器
    // 循环绘制柱状图和饼状图
    function initEcharts(url, id, idPie, index, riskYear, functionName, supplierName, supplierCode) {
        admin.req("/api-edu/risk/monitior/" + url + "-status?riskYear=" + riskYear + "&functionNameList=" + functionName + "&supplierCode=" + supplierCode, {}, function(res) {
            if (res.ok) {
                var data = res.data;
                var prrCategory = [];
                var prrDecrease = [];
                var prrKeep = [];
                var prrIncrease = [];
                var all = 100;
                var upNums = 0;
                var colors;

                var preMonthData = data[1].keepNum + data[1].increaseNum;
                var currentMonthData = data[0].keepNum;
                var change = preMonthData == 0 ? 100 : parseInt(((currentMonthData - preMonthData) / preMonthData) * 100);

                if (change >= 0) {
                    upNums = change;
                    all = 100 - upNums;
                    colors = '#FF867F';
                } else {
                    upNums = -change;
                    all = 100 - upNums;
                    colors = '#4DCB73';
                }
                for (var i = 0; i < 12; i++) {
                    prrCategory.push(res.data[i].riskYear.substring(4));
                    prrDecrease.push(res.data[i].decreaseNum);
                    prrKeep.push(res.data[i].keepNum);
                    prrIncrease.push(res.data[i].increaseNum);
                }
                var params = {};
                params.legend = res.data[0].legend;
                params.prrCategory = prrCategory;
                params.prrDecrease = prrDecrease;
                params.prrKeep = prrKeep;
                params.prrIncrease = prrIncrease;
                var curChart;
                switch (index) {
                    case 1:
                        prrChartBar1.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar1;
                        break;
                    case 2:
                        prrChartBar2.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar2;
                        break;
                    case 3:
                        prrChartBar3.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar3;
                        break;
                    case 4:
                        prrChartBar4.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar4;
                        break;
                    case 5:
                        prrChartBar5.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar5;
                        break;
                    case 6:
                        prrChartBar6.setOption(getMonitorBarOption(params));
                        curChart = prrChartBar6;
                        break;
                }
                var myChartpie = echarts.init(document.getElementById(idPie));
                var optionpie1 = {
                    // calculable: true,
                    graphic: {
                        type: 'text',
                        left: 'center',
                        top: 'center',
                        style: {
                            text: change >= 0 ? '增幅' + change + '%' : '降幅' + -change + '%'
                        }
                    },
                    grid: {
                        bottom: -100
                    },
                    series: [{
                        name: '环比数据',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: false,
                                    position: 'center',
                                    textStyle: {
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                }
                            }
                        },
                        data: [{
                            value: all,
                            name: '总量',
                            itemStyle: {
                                color: '#ccc'
                            }
                        }, {
                            value: upNums,
                            name: '增幅',
                            itemStyle: {
                                color: colors
                            }
                        }]
                    }]
                };
                // myChartpie.clear();
                myChartpie.setOption(optionpie1, true);
                curChart.off("click");
                curChart.on('click', function(params) {
                    $(idPie + "Text").text(params.name + '月份环比')
                    if (params.dataIndex == 11) {
                        var preMonthData = data[12].keepNum + data[12].increaseNum;
                        var currentMonthData = data[params.dataIndex].keepNum;
                        var clickChange = preMonthData == 0 ? 100 : parseInt(((currentMonthData - preMonthData) / preMonthData) * 100);
                    } else {
                        var preMonthData = data[params.dataIndex + 1].keepNum + data[params.dataIndex + 1].increaseNum;
                        var currentMonthData = data[params.dataIndex].keepNum;
                        var clickChange = preMonthData == 0 ? 100 : parseInt(((currentMonthData - preMonthData) / preMonthData) * 100);
                    }

                    if (clickChange >= 0) {
                        upNums = clickChange;
                        all = 100 - upNums;
                        colors = '#FF867F';
                        // downNums = 0
                    } else {
                        upNums = -clickChange;
                        all = 100 - upNums;
                        colors = '#4DCB73';
                        // upNums = 0
                    }
                    var optionpie = {
                        calculable: true,
                        graphic: {
                            type: 'text',
                            left: 'center',
                            top: 'center',
                            style: {
                                text: clickChange >= 0 ? '增幅' + clickChange + '%' : '降幅' + -clickChange + '%'
                            }
                        },
                        /*grid: {
                            bottom: 0
                        },*/
                        series: [{
                            name: '环比数据',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: false,
                                        position: 'center',
                                        textStyle: {
                                            fontSize: '30',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: [{
                                value: all,
                                name: '总量',
                                itemStyle: {
                                    color: '#ccc'
                                }
                            }, {
                                value: upNums,
                                name: '增幅',
                                itemStyle: {
                                    color: colors
                                }
                            }]
                        }]
                    };
                    myChartpie.clear();
                    myChartpie.setOption(optionpie, true);
                });
            } else {
                layer.msg(res.message);
            }
        });
    }
    // 获取下部柱状图参数
    function getMonitorBarOption(params) {
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: params.legend
            },
            grid: {
                bottom: 30
            },
            color: ['#3BA0FF', '#FF867F'],
            toolbox: {
                show: false,
                feature: {
                    mark: {
                        show: true
                    },
                    dataView: {
                        show: true,
                        readOnly: false
                    },
                    magicType: {
                        show: true,
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                    restore: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    }
                }
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                data: params.prrCategory,
                inverse: true

            }],
            yAxis: [{
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                }
            }],
            series: [{
                name: params.legend[1],
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    normal: {
                        label: {
                            show: false,
                            position: 'insideRight'
                        }
                    }
                },
                data: params.prrKeep
            }, {
                name: params.legend[0],
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    normal: {
                        label: {
                            show: false,
                            position: 'insideRight'
                        }
                    }
                },
                data: params.prrIncrease
            }]
        };
        return option;
    }
    // 导出
    $("#exportAnalysis").click(function() {
        admin.showLoading("body");
        convertToOne();
    });
    // 开关控制
    form.on('switch(bjDemo)', function(obj) {
        var RiskSupplierMonitorAnalysisVO = {};
        RiskSupplierMonitorAnalysisVO.isMonitorNow = obj.elem.checked == true ? '1' : '0';
        RiskSupplierMonitorAnalysisVO.riskYearNow = obj.elem.id;
        RiskSupplierMonitorAnalysisVO.supplierCode = obj.value;
        updateState(RiskSupplierMonitorAnalysisVO);
    });
    // 更新是否纳入监控
    function updateState(RiskSupplierMonitorAnalysisVO) {
        var RiskSupplierMonitorAnalysisVOList = [];
        RiskSupplierMonitorAnalysisVOList.push(RiskSupplierMonitorAnalysisVO);
        admin.req("/api-edu/risk/monitior/risk-supplier/update", RiskSupplierMonitorAnalysisVOList, function(res) {
            if (res.ok) {
                if (RiskSupplierMonitorAnalysisVO.isMonitorNow == "0") {
                    layer.msg("成功移除下月风险监控！");
                } else {
                    layer.msg("成功纳入下月风险监控！");
                }
            } else {
                layer.msg(res.message);
            }
        }, {
            method: "put"
        });
    }
    // 风险供应商管理
    $("#supplierManage").click(function() {
        supplierManage();
    });
    // 风险供应商管理列表
    function supplierManage() {
        layer.open({
            type: 1,
            area: ['100%', '100%'],
            title: '风险供应商管理',
            shadeClose: true, //点击遮罩关闭
            content: $('#supplierManage_dialog'),
            success: function(layero) {
                var mask = $(".layui-layer-shade");
                mask.before(layero);
                form.val("supplierManage", {
                    "riskTime": "",
                    "supplierCode": "",
                    "supplierName": "",
                    "scope": "0"
                });
                //debugger
                var tableR = getSupplierManageCols(saveArr2.date, new Date().Format('yyyyMM'));
                renderSupplierManageTable(tableR);
            }
        });
    }
    // 风险监控导出
    function exportExcel(file) {
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        formData.append("multipartFiles", file, 'Up');
        formData.append("riskYear", saveArr2.date);
        formData.append("functionNameList", saveArr2.ywmk2);
        xhr.open('POST', admin.formatUrl("/api-edu/risk/monitior/risk-supplier/excel"), true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = this.response;
                var filename = '风险应对与监控-风险供应商监控状态.xls';
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, filename);
                } else {
                    var a = document.createElement('a');
                    blob.type = "application/excel";
                    var url = URL.createObjectURL(blob);
                    a.href = url;
                    a.download = filename;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
                admin.removeLoading("body");
            }
        };
        xhr.send(formData);
    }

    //将base64转换为文件
    function dataURLtoFile(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    // 转换页面上图片为一张
    function convertToOne() {
        var myChartBar = echarts.init(document.getElementById('chart-barFist'));
        var myChartPie1 = echarts.init(document.getElementById('chart-pie1'));
        var myChartPie2 = echarts.init(document.getElementById('chart-pie2'));
        var myChartPie3 = echarts.init(document.getElementById('chart-pie3'));
        var myChartPie4 = echarts.init(document.getElementById('chart-pie4'));
        var myChartPie5 = echarts.init(document.getElementById('chart-pie5'));
        var myChartPie6 = echarts.init(document.getElementById('chart-pie6'));
        var myChart1 = echarts.init(document.getElementById('chart-bar1'));
        var myChart2 = echarts.init(document.getElementById('chart-bar2'));
        var myChart3 = echarts.init(document.getElementById('chart-bar3'));
        var myChart4 = echarts.init(document.getElementById('chart-bar4'));
        var myChart5 = echarts.init(document.getElementById('chart-bar5'));
        var myChart6 = echarts.init(document.getElementById('chart-bar6'));

        var canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1380;
        var context = canvas.getContext("2d");

        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#fff";
        context.fill();

        var baseBar = myChartBar.getDataURL();
        var basePie1 = myChartPie1.getDataURL()
        var basePie2 = myChartPie2.getDataURL()
        var basePie3 = myChartPie3.getDataURL()
        var basePie4 = myChartPie4.getDataURL()
        var basePie5 = myChartPie5.getDataURL()
        var basePie6 = myChartPie6.getDataURL()
        var baseChart1 = myChart1.getDataURL()
        var baseChart2 = myChart2.getDataURL()
        var baseChart3 = myChart3.getDataURL()
        var baseChart4 = myChart4.getDataURL()
        var baseChart5 = myChart5.getDataURL()
        var baseChart6 = myChart6.getDataURL()

        var imageBar = new Image();
        var imageChart1 = new Image();
        var imageChart2 = new Image();
        var imageChart3 = new Image();
        var imageChart4 = new Image();
        var imageChart5 = new Image();
        var imageChart6 = new Image();

        imageBar.src = baseBar
        imageChart1.src = baseChart1
        imageChart2.src = baseChart2
        imageChart3.src = baseChart3
        imageChart4.src = baseChart4
        imageChart5.src = baseChart5
        imageChart6.src = baseChart6

        var imagePie1 = new Image();
        var imagePie2 = new Image();
        var imagePie3 = new Image();
        var imagePie4 = new Image();
        var imagePie5 = new Image();
        var imagePie6 = new Image();

        imagePie1.crossOrigin = 'Anonymous';

        imagePie1.src = basePie1
        imagePie2.src = basePie2
        imagePie3.src = basePie3
        imagePie4.src = basePie4
        imagePie5.src = basePie5
        imagePie6.src = basePie6
        setTimeout(function() {
            context.drawImage(imageChart1, 0, 600, 400, 260);
            context.drawImage(imagePie1, 400, 600, 168, 260);
            context.drawImage(imageChart2, 568, 600, 400, 260);
            context.drawImage(imagePie2, 968, 600, 168, 260);

            context.drawImage(imageChart3, 0, 860, 400, 260);
            context.drawImage(imagePie3, 400, 860, 168, 260);
            context.drawImage(imageChart4, 568, 860, 400, 260);
            context.drawImage(imagePie4, 968, 860, 168, 260);

            context.drawImage(imageChart5, 0, 1120, 400, 260);
            context.drawImage(imagePie5, 400, 1120, 168, 260);
            context.drawImage(imageChart6, 568, 1120, 400, 260);
            context.drawImage(imagePie6, 968, 1120, 168, 260);

            context.drawImage(imageBar, 0, 0, 600, 600);
            context.clearRect(600, 0, 600, 600)
            var base64Up = canvas.toDataURL("image/png"); //"image/png" 这里注意一下
            var up = dataURLtoFile(base64Up)
            exportExcel(up)
        }, 1000)
    };
    getSelect();
    setSupplierStatus(saveArr2);
    /*图表自适应窗口大小*/
    setTimeout(function() {
        window.onresize = function() {
            supplierStatusChart.resize();
        }
    }, 1000);
})