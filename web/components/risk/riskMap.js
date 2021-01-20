/*
 * File   : index.js
 * Created: 2018/11/9 1:17:27 pm
 * Author : quym
 * License: MIT License
 *
 * Copyright (c) 2018 quym
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * -----
 * Last Modified: 2018/11/15 10:36:22 am
 * Modified By  : quym at <quym@gmail.com>
 * -----
 * Description: 按月查询功能、导出图表功能、圆环图点击弹出供应商列表清单功能、地图下钻与返回功能、地图与其他图表联动功能
 * 定时动态刷新功能暂无，若需要可增加
 * -----
 * HISTORY:
 * 2018/11/9	quym	完成基本功能
 * 2018/11/14	quym	日期框缩小，地图放大，圆环图点击可弹出供应商清单
 * -----
 * mark: 页面图表均使用百度echarts绘图工具绘制  参考链接：http://echarts.baidu.com
 */

//layui初始化
layui.use(['element', 'table', 'jquery', 'layer', 'laydate', 'adc', 'config'], function() {
    var layer = layui.layer;
    var laydate = layui.laydate;
    var admin = layui.adc;
    var table = layui.table;
    var $ = layui.jquery;
    var config = layui.config;
    var curDate1 = getPreMonth(new Date(), 1);

    /*窗口大小改变事件 图表自适应窗口大小*/
    window.onresize = function() {
        leftBar.resize();
        rightBar.resize();
        leftPie.resize();
        rightPie.resize();
        myChart.resize();
    };

    var account = config.getAccount();
    // if (!account) return;
    // 上侧 header 用户信息
    $('.header').vm(account);

    function getBtn() {
        var curUser = config.getAccount();
        if (curUser.roleIds.indexOf("1") > -1) {
            $("#export").show();
        } else {
            $("#export").hide();
        }
    }

    getBtn();

    /*初始化图表*/
    function initPageData() {
        setBarLeft("../../api/rms/risk-map/three-month/bar-pie");
        setBarRight("../../api/rms/risk-map/twelve-month/bar-pie");
    }

    /*初始化图表*/
    initPageData();

    /*初始化柱状图图表*/
    var leftBar = echarts.init(document.getElementById("bar-left-chart"));
    var rightBar = echarts.init(document.getElementById("bar-right-chart"));
    var riskReasonPie = echarts.init(document.getElementById("riskReasonPie"));
    /*动态请求图表数据时间间隔标志*/
    var t1 = null;

    /**
     * 功能描述: 绘制左侧柱状图
     *
     * @param: 请求数据后台url
     * @return: null
     * @auther: quym
     * @date: 2018/11/11 22:27
     */
    function setBarLeft(url) {
        clearTimeout(t1); //清除定时任务
        admin.req(url, {}, function(res) {
            if (res.ok) {
                var json = res;
                setValues_1(json);
            } else {
                layer.msg(res.message);
            }
        });
    }

    /*初始化饼图图表*/
    var leftPie = echarts.init(document.getElementById("pie-left-chart"));
    var rightPie = echarts.init(document.getElementById("pie-right-chart"));
    /*动态请求图表数据时间间隔标志*/
    var t2 = null;

    /**
     * 功能描述: 绘制左侧饼图
     *
     * @param: 请求数据后台url
     * @return: null
     * @auther: quym
     * @date: 2018/11/11 22:31
     */
    function setBarRight(url) {
        clearTimeout(t2); //清除定时任务
        /*请求数据*/
        admin.req(url, {}, function(data) {
            var json = data;
            setValues_2(json);
        });
    }

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
            if (month2 < 10) {
                month2 = '0' + month2;
            }
        }
        var t2 = type == 1 ? year2 + "" + month2 : year2 + "-" + month2;
        return t2;
    }

    /**
     * 功能描述: 供应商清单列表表格
     *
     * @param:
     * @return:
     * @auther: quym
     * @date: 2018/11/14 11:15
     */
    var renderTable = function(data, content, cols, elem) {
        if (!data) {
            data = [];
        }
        table.render({
            // table参数
            id: 'gys',
            elem: '#' + content,
            data: data,
            even: true,
            // height: 511,
            cols: cols,
            page: {
                layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
            },
            done: function() {

                adjustTbaleHeight(elem);

            }

        });
    };

    function adjustTbaleHeight(elem) {
        var mainHeight = $('#' + elem).height();
        var maxHeight = $('#' + elem).parent().height();
        var tableHeight = $('#' + elem + ' .layui-table-body').height();
        $('#' + elem + ' .layui-table-body').css('height', (tableHeight + maxHeight - mainHeight - 20) + 'px')

    }

    var renderTable2 = function(data, cols) {


        if (!data) {
            data = [];
        }
        table.render({
            // table参数
            id: 'gys1',
            elem: '#tableContent1',
            data: data,
            even: true,
            cols: cols,

        });
    };

    /**
     * 功能描述: 风险主要产品表格
     *
     * @param:
     * @return:
     * @auther: quym
     * @date: 2018/11/14 11:15
     */
    var renderTable1 = function(params, type) {
        table.render({
            // table参数
            id: 'zycp',
            elem: '#tableContent2',
            url: admin.formatUrl("/api/rms/risk-map/" + type + "-month/" + params.supplierCode + "/risk-part?riskYearMonth=" + params.riskYearMonth),
            initSort: {
                field: 'date', //排序字段，对应 cols 设定的各字段名
                type: 'desc' //排序方式  asc: 升序、desc: 降序、null: 默认排序
            },
            even: true,
            parseData: function(res) { //res 即为原始返回的数据
                return {
                    "code": res.respCode, //解析接口状态
                    "msg": res.message, //解析提示文本
                    // "count": total, //解析数据长度
                    "data": res.data //解析数据列表
                };
            },
            cols: [
                [{
                    type: 'numbers',
                    title: '序号'
                }, {
                    field: 'date',
                    title: '日期',
                    width: 110,
                    align: 'center'
                }, {
                    field: 'partsId',
                    title: '零件号',
                    width: 100,
                    align: 'center'
                }, {
                    field: 'partsName',
                    title: '零件名称',
                    width: 150,
                    align: 'center'
                }, {
                    field: 'type',
                    title: '质量事件',
                    align: 'center',
                    width: 120
                }, {
                    field: 'problemDsc',
                    title: '问题描述',
                    align: 'center',
                }]
            ],
            done: function() {


            }
        });
    };

    // 获得表格列
    function getCols(type, msg) {
        var cols = [
            [{
                type: 'numbers',
                title: '序号',
                rowspan: 2
            }, {
                field: 'supplierCode',
                title: '供应商代码',
                align: 'center',
                rowspan: 2
            }, {
                field: 'supplierName',
                title: '供应商名称',
                align: 'center',
                rowspan: 2
            }, {
                field: 'functionName',
                title: '业务模块',
                width: 150,
                align: 'center',
                rowspan: 2
            }, {
                field: 'partsName',
                title: '主要供货产品',
                align: 'center',
                width: 120,
                rowspan: 2
            }, {
                field: 'message',
                title: msg,
                align: 'center',
                colspan: 4
            }, {
                title: '操作',
                align: 'center',
                rowspan: 2,
                templet: '#control'
            }],
            [{
                field: 'riskExpect',
                title: '风险暴露值',
                align: 'center',
                templet: function(d) {
                    return d.riskExpect != null ? (d.riskExpect * 100).toFixed(2) + "%" : ""
                }
            }, {
                field: 'riskRank',
                title: '排名',
                align: 'center'
            }, {
                // field: 'change',
                title: '排名变化',
                align: 'center',
                templet: '#change'
            }, {
                field: 'riskLevel',
                title: '风险程度',
                align: 'center'
            }]
        ];
        var cols1 = [
            [{
                type: 'numbers',
                title: '序号',
                rowspan: 2
            }, {
                field: 'riskDate',
                title: '时间',
                align: 'center',
                minWidth: 80,
                rowspan: 2
            }, {
                field: 'supplierCode',
                title: '供应商代码',
                align: 'center',
                minWidth: 100,
                rowspan: 2
            }, {
                field: 'supplierName',
                title: '供应商名称',
                align: 'center',
                minWidth: 100,
                rowspan: 2
            }, {
                field: 'functionName',
                title: '业务模块',
                minWidth: 100,
                align: 'center',
                rowspan: 2
            }, {
                field: 'partsName',
                title: '主要供货产品',
                align: 'center',
                width: 120,
                rowspan: 2
            }, {
                field: 'message',
                title: msg,
                align: 'center',
                colspan: 4
            }, {
                title: '质量绩效表现',
                align: 'center',
                colspan: 7
            }],
            [{
                field: 'riskExpect',
                title: '风险暴露值',
                minWidth: 100,
                align: 'center',
                templet: function(d) {
                    return d.riskExpect != null ? (d.riskExpect * 100).toFixed(2) + "%" : ""
                }
            }, {
                field: 'riskRank',
                title: '总体排名',
                minWidth: 100,
                align: 'center'
            }, {
                // field: 'change',
                title: '排名变化',
                align: 'center',
                minWidth: 100,
                templet: '#change'
            }, {
                field: 'riskLevel',
                title: '风险程度',
                minWidth: 100,
                align: 'center'
            }, {
                field: 'fieldProblemTimes',
                title: '现场问题数',
                minWidth: 120,
                align: 'center'
            }, {
                field: 'prrTimes',
                title: '质量PRR数',
                minWidth: 100,
                align: 'center'
            }, {
                field: 'prrProTimes',
                title: '程序PRR数',
                minWidth: 100,
                align: 'center',
            }, {
                field: 'dtTimes',
                title: 'DT',
                align: 'center'
            }, {
                field: 'csTimes',
                title: 'CS',
                align: 'center'
            }, {
                field: 'spillTimes',
                title: 'SPILL',
                minWidth: 80,
                align: 'center'
            }, {
                field: 'fpeTimes',
                title: 'FPE',
                align: 'center'
            }]
        ];
        if (type == 1) {
            return cols;
        } else {
            return cols1;
        }
    }
    // 表格操作列
    table.on('tool(tableContent)', function(obj) {
        // 获取点击列的数据
        var data = obj.data;
        var layEvent = obj.event;
        // 判断操作类型
        if (layEvent === 'view') {
            layer.open({
                type: 1,
                content: $('#gysListView'),
                skin: 'whiteStyle',
                area: ['100%', '100%'],
                success: function(layero, index) {
                    //请求供应商清单信息,请求参数可从data中获取
                    admin.req("/api/rms/risk-map/three-month/" + data.supplierCode + "/detail?riskYearMonth=" + curDate1, {}, function(res) {
                        //渲染表格
                        renderTable2(res.data, getCols(0, "3个月滚动风险预警"));
                        var params = {};
                        params.supplierCode = data.supplierCode;
                        params.riskYearMonth = curDate1;
                        renderTable1(params, "three");
                    });
                    admin.req("/api/rms/risk-map/three-month/" + data.supplierCode + "/risk-reason?riskYearMonth=" + curDate1, {}, function(res) {

                        setValues_3(res.data);
                        //setHighchart()
                    });
                }
            })
        }
    });
    // 表格操作列
    table.on('tool(tableContent3)', function(obj) {
        // 获取点击列的数据
        var data = obj.data;
        var layEvent = obj.event;
        // 判断操作类型
        if (layEvent === 'view') {
            layer.open({
                type: 1,
                content: $('#gysListView'),
                skin: 'whiteStyle',
                area: ['100%', '100%'],
                success: function(layero, index) {
                    //请求供应商清单信息,请求参数可从data中获取
                    admin.req("/api/rms/risk-map/twelve-month/" + data.supplierCode + "/detail?riskYearMonth=" + curDate1, {}, function(res) {
                        //渲染表格
                        renderTable2(res.data, getCols(0, "12个月滚动风险预警"));
                        var params = {};
                        params.supplierCode = data.supplierCode;
                        params.riskYearMonth = curDate1;
                        renderTable1(params, "twelve");
                    });
                    admin.req("/api/rms/risk-map/twelve-month/" + data.supplierCode + "/risk-reason?riskYearMonth=" + curDate1, {}, function(res) {
                        setValues_3(res.data);
                    });
                }
            })
        }
    });

    /*初始化地图*/
    var myChart = echarts.init(document.getElementById('main'));

    /*左侧柱状图点击事件*/
    leftBar.on('click', function(params) {

        //弹出窗口
        layer.open({
            type: 1,
            title: '供应商清单信息',
            content: $("#gysListView"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            area: ['100%', '100%'],
            skin: 'whiteStyle',
            // shade: 0.3,
            success: function(layero, index) {
                var supplierCode = params.name.split("-")[1];
                admin.req("/api/rms/risk-map/three-month/" + supplierCode + "/detail?riskYearMonth=" + curDate1, {}, function(res) {
                    //渲染表格
                    renderTable2(res.data, getCols(0, "3个月滚动风险预警"));
                    var params = {};
                    params.supplierCode = supplierCode;
                    params.riskYearMonth = curDate1;
                    renderTable1(params, "three");
                });
                admin.req("/api/rms/risk-map/three-month/" + supplierCode + "/risk-reason?riskYearMonth=" + curDate1, {}, function(res) {
                    setValues_3(res.data);
                });
            }
        });
    });

    /*右侧柱状图点击事件*/
    rightBar.on('click', function(params) {
        //弹出窗口
        layer.open({
            type: 1,
            title: '供应商清单信息',
            content: $("#gysListView"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            area: ['100%', '100%'],
            skin: 'whiteStyle',
            // shade: 0.3,
            success: function(layero, index) {
                var supplierCode = params.name.split("-")[1];
                admin.req("/api/rms/risk-map/twelve-month/" + supplierCode + "/detail?riskYearMonth=" + curDate1, {}, function(res) {
                    //渲染表格
                    renderTable2(res.data, getCols(0, "12个月滚动风险预警"));
                    var params = {};
                    params.supplierCode = supplierCode;
                    params.riskYearMonth = curDate1;
                    renderTable1(params, "twelve");
                });
                admin.req("/api/rms/risk-map/twelve-month/" + supplierCode + "/risk-reason?riskYearMonth=" + curDate1, {}, function(res) {
                    setValues_3(res.data);
                });
            }
        });
    });

    /*左侧饼图点击事件*/
    leftPie.on('click', function(params) {
        //弹出窗口
        layer.open({
            type: 1,
            title: '供应商清单信息',
            skin: 'whiteStyle',
            content: $("#gysList"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            area: ['100%', '100%'],
            // shade: 0.3,
            success: function(layero, index) {
                var date = curDate1;
                var value = $("#area").val();
                //请求供应商清单信息, 请求参数可从params中取得，params.name和params.data
                admin.req("/api/rms/risk-map/three-month/detail?yearMonth=" + date + "&areaName=" + value + "&riskLevel=" + params.name, {}, function(res) {
                    //渲染表格
                    renderTable(res.data, 'tableContent', getCols(1, "3个月滚动风险预警"), 'gysList');
                });
            }
        });
    });

    /*右侧饼图点击事件*/
    rightPie.on('click', function(params) {
        layer.open({
            type: 1,
            title: '供应商清单信息',
            skin: 'whiteStyle',
            content: $("#gysList1"), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            area: ['100%', '100%'],
            // shade: 0.3,
            success: function(layero, index) {
                var date = curDate1;
                var value = $("#area").val();
                //请求供应商清单信息,请求参数可从params中取得，params.name和params.data
                admin.req("/api/rms/risk-map/twelve-month/detail?yearMonth=" + date + "&areaName=" + value + "&riskLevel=" + params.name, {}, function(res) {
                    //渲染表格
                    renderTable(res.data, 'tableContent3', getCols(1, "12个月滚动风险预警"), 'gysList1');
                });
            }
        });
    });

    /*********************************** 绘制图表方法 *******************************************************************/
    // 柱状图颜色对应对象
    var colorObj = { "高风险": "#ce3434", "中风险": "#FDCD01", "低风险": "#1C9FE7", "其他": "#25d982" };
    /**
     * 功能描述: 组装echarts柱状图所需参数，并画出柱状图
     *
     * @param: 从后台请求的json数据
     * @return: null
     * @auther: quym
     * @date: 2018/11/11 22:38
     */
    function setValues_1(json) {
        /*柱状图参数数据*/
        var paramsLeftBar = {};
        var paramsLeftPie = {};
        var bar = json.data.bar;
        var pie = json.data.pie;
        // 判断左侧柱状图数据是否为空
        if (bar.length != 0) {
            $("#bar-left-chart").removeClass("nodatastyle");
            /*y轴数据*/
            var namesBar = [];
            /*x轴数据*/
            var valuesBar = [];
            /*循环json数据 赋值x轴、y轴数组数据*/
            for (var item in bar) {
                var supplierName = bar[item].supplierName + "-" + bar[item].supplierCode;
                var riskExpect = bar[item].riskExpect;
                valuesBar.push(riskExpect);
                namesBar.push(supplierName);
            }
            //组装参数
            paramsLeftBar.dataY = namesBar;
            paramsLeftBar.dataX = valuesBar;
            //清空图表区域
            leftBar.clear();
            //绘制柱状图
            leftBar.setOption(getBarLeftOption(paramsLeftBar), true);
        } else {
            leftBar.clear();
            $("#bar-left-chart").addClass("nodatastyle");
        }
        // 判断左侧饼状图数据是否为空
        if (pie.length != 0) {
            $("#pie-left-chart").removeClass("nodatastyle");
            var namesPie = [];
            for (var item in pie) {
                var name = pie[item].name;
                namesPie.push(name);
                pie[item].itemStyle = {};
                pie[item].itemStyle.color = colorObj[pie[item].name];
            }
            paramsLeftPie.legend = namesPie;
            paramsLeftPie.data = pie;
            leftPie.clear();
            leftPie.setOption(getPieLeftOption(paramsLeftPie), true);
        } else {
            leftPie.clear();
            $("#pie-left-chart").addClass("nodatastyle");
        }
    }

    /**
     * 功能描述: 组装echarts饼图所需参数，并画出饼图
     *
     * @param: 从后台请求的json数据
     * @return: null
     * @auther: quym
     * @date: 2018/11/11 22:58
     */
    function setValues_2(json) {
        /*柱状图参数数据*/
        var paramsRightBar = {};
        var paramsRightPie = {};
        var bar = json.data.bar;
        var pie = json.data.pie;
        // 判断右侧柱状图数据是否为空
        if (bar.length != 0) {
            $("#bar-right-chart").removeClass("nodatastyle");
            /*y轴数据*/
            var namesBar = [];
            /*x轴数据*/
            var valuesBar = [];
            /*循环json数据 赋值x轴、y轴数组数据*/
            for (var item in bar) {
                var supplierName = bar[item].supplierName + "-" + bar[item].supplierCode;
                var riskExpect = bar[item].riskExpect;
                valuesBar.push(riskExpect);
                namesBar.push(supplierName);
            }
            //组装参数
            paramsRightBar.dataY = namesBar;
            paramsRightBar.dataX = valuesBar;
            //清空图表区域
            rightBar.clear();
            //绘制柱状图
            rightBar.setOption(getBarLeftOption(paramsRightBar), true);
        } else {
            rightBar.clear();
            $("#bar-right-chart").addClass("nodatastyle");
        }
        // 判断右侧饼状图数据是否为空
        if (pie.length != 0) {
            $("#pie-right-chart").removeClass("nodatastyle");
            var namesPie = [];
            for (var item in pie) {
                var name = pie[item].name;
                namesPie.push(name);
                pie[item].itemStyle = {};
                pie[item].itemStyle.color = colorObj[pie[item].name];
            }
            paramsRightPie.legend = namesPie;
            paramsRightPie.data = pie;
            rightPie.clear();
            rightPie.setOption(getPieLeftOption(paramsRightPie), true);
        } else {
            rightPie.clear();
            $("#pie-right-chart").addClass("nodatastyle");
        }

    }
    // 风险原因饼状图  （2019-03-38修改为立体饼图 引入highCHart）
    function setValues_3(json) {
        //json.data=[{name:'111',count:1},{name:'111',count:2},{name:'111',count:3}]
        if (json.length > 0) {
            $("#async-img4").hide();
            $("#riskReasonPie").show();

        } else {
            $("#async-img4").show();
            $("#riskReasonPie").hide();
        }
        var pieData = [];
        for (var index in json) {
            var one = { name: json[index].name, y: json[index].count };
            pieData.push(one);

        }
        setHighchart('riskReasonPie', '风险主要原因类别', pieData);
        // /*柱状图参数数据*/
        // var paramsPie = {};
        // /*y轴数据*/
        // var namesPie = [];
        // /*x轴数据*/
        // var valuesPie = [];
        // /*循环json数据 赋值x轴、y轴数组数据*/
        // for (var item in json) {
        //     var obj = {};
        //     var value = json[item].count;
        //     var name = json[item].name;
        //     obj.name = name;
        //     obj.value = value;
        //     valuesPie.push(obj);
        //     namesPie.push(name);
        // }
        // //组装参数
        // paramsPie.legend = namesPie;
        // paramsPie.data = valuesPie;
        // //清空图表区域
        // riskReasonPie.clear();
        // //绘制柱状图
        // if (paramsPie.data.length != 0) {
        //     $("#async-img4").hide();
        //     $("#riskReasonPie").show();
        //     //$("#chart-pie-row div").append("<div id=\"chart-pie\" style=\"width: 96%;height: 260px;margin: 0 auto;\">");
        //     riskReasonPie.setOption(getRiskReasonPieOption(paramsPie), true);
        // } else {
        //     $("#async-img4").show();
        //
        //     $("#riskReasonPie").hide();
        // }
        // //riskReasonPie.setOption(getRiskReasonPieOption(paramsPie), true);
        // riskReasonPie.resize();


    }

    function setHighchart(elem, name, data) {
        var chart = Highcharts.chart(elem, {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: name
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '风险主要原因',
                data: data
            }]
        });




    }

    /********************************************* 获得echarts图表所需option参数 *****************************************************/

    /**
     * 功能描述: 获取柱状图参数option
     *
     * @param: 组装的带有option所需数据的兑对象
     * @return: option
     * @auther: quym
     * @date: 2018/11/11 23:04
     */
    function getBarLeftOption(params) {
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                //自定义tooltip显示内容
                formatter: function(params) {
                    //显示内容
                    var result = "供应商名称：" + params[0].name.split("-")[0];
                    result += '<br>排名：' + (params[0].dataIndex + 1);
                    //小圆点
                    result += '<br>占比：' + (params[0].data * 100).toFixed(2) + '%';
                    return result;
                }
            },
            //柱状图柱条颜色
            color: ['#71B7EE'],
            //图表距容器距离
            grid: {
                top: '8%',
                left: '0%',
                right: '23.5%',
                bottom: '7%',
                containLabel: true
            },
            //x轴数据
            xAxis: {
                type: 'value',
                name: '  风险暴露值',
                // min: 0,
                // max: 100,36666
                boundaryGap: [0, 0.01],
                axisLine: {
                    lineStyle: {
                        color: '#71B7EE'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: 'rgba(255,255,255,0.2)'
                    }
                },
                axisLabel: {
                    interval: 0,
                    color: '#FFFFFF',
                    formatter: function(value, index) {
                        return Math.formatFloat(value * 100, 2) + '%';
                    },
                    showMinLabel: false
                }
            },
            //y轴数据
            yAxis: [{
                type: 'category',
                data: params.dataY,
                inverse: true,
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#71B7EE'
                    }
                },
                axisLabel: {
                    color: '#FFFFFF',
                    interval: 0,
                    formatter: function(value, index) {
                        return value.split("-")[0].substring(0, 6)
                    }
                }
            }],
            //系列
            series: [{
                name: '2011年',
                type: 'bar',
                // barWidth: 10,
                barCategoryGap: '50%',
                stack: '总量',
                label: {
                    normal: {
                        show: false,
                        position: 'right',
                        color: '#FFFFFF'
                    }
                },
                data: params.dataX
            }],
            itemStyle: {
                color: '#71B7EE'
                    /*new echarts.graphic.LinearGradient(
                                        0, 0, 1, 0,
                                        [
                                            {offset: 0, color: 'transparent'},
                                            {offset: 0.7, color: '#71B7EE'},
                                            {offset: 1, color: '#71B7EE'}
                                        ]
                                    )*/
            }
        };
        return option;
    }

    /**
     * 功能描述: 获取饼状图参数option
     *
     * @param: 组装的带有option所需数据的对象
     * @return: option
     * @auther: quym
     * @date: 2018/11/11 23:10
     */
    function getPieLeftOption(params) {
        var total = 0;

        for (var index in params.data) {
            var item = params.data[index];
            total += (item.value) - 0;
        }

        for (var index in params.data) {
            var item = params.data[index];
            item.percent = ((item.value / total) * 100).toFixed(2) + '%';
            item.total = total;

        }
        var option = {
            tooltip: {
                trigger: 'item',
                //自定义tooltip 无论 是否点击图例 显示的百分比都要一致
                formatter: function(params, ticket, callback) {
                    var content = params.marker + params.name + ':' + params.data.percent;
                    return content;
                }
            },
            //饼图扇形颜色
            // color: ['#ce3434', '#FDCD01', '#1C9FE7', '#25d982'],
            //图例设置
            legend: {
                orient: 'vertical',
                right: '14%',
                top: 'center',
                itemGap: 20,
                itemWidth: 8,
                itemHeight: 8,
                icon: 'circle',
                textStyle: {
                    color: '#FFFFFF'
                },
                selected: { '其他': false },
                data: params.legend,
                //自定义图例内容
                formatter: function(name) {
                    console.log(name);

                    //饼图总数值
                    var total = 0;
                    //单个扇形数值
                    var target;
                    //循环数据得到上述数值
                    for (var i = 0, l = params.data.length; i < l; i++) {
                        total += parseInt(params.data[i].value);
                        if (params.data[i].name == name) {
                            target = params.data[i].percent;
                        }
                    }
                    //返回扇形百分比
                    return name + ' ' + target;
                }
            },
            //系列
            series: [{
                name: '',
                type: 'pie',
                //圆环图
                radius: ['50%', '70%'],
                center: ['30%', '50%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        //show: true,
                        position: 'center',
                        fontSize: 12,
                        color: '#4cd0ff',
                        formatter: function() {
                            return "风险\n\n状态分布"
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                    borderWidth: 2, //设置border的宽度有多大
                    borderColor: '#0f4175'
                },
                data: params.data
            }]
        };
        return option;
    }

    // 获取风险原因饼状图参数
    function getRiskReasonPieOption(params) {
        var option = {
            tooltip: {
                trigger: 'item'
            },
            color: ['#3ba0ff', '#36cbcb', '#4ecb74', '#fad337', '#ff867f', '#54e6e8', '#d554eb', '#56c0dd', '#fd9e5c', '#153fc4'],
            // legend: {
            //     orient: 'vertical',
            //     right: 10,
            //     top: 20,
            //     bottom: 20,
            //     data: data.legendData,

            //     selected: data.selected
            // },
            series: [{
                name: '风险主要原因',
                type: 'pie',
                radius: '40%',
                center: ['50%', '50%'],
                label: {
                    formatter: function(value) {
                        var newStr = "";
                        var start, end;
                        var name_len = value.name.length;　　　　　　　　　　　　 //每个内容名称的长度
                        var max_name = 9;　　　　　　　　　　　　　　　　　　 //每行最多显示的字数
                        var new_row = Math.ceil(name_len / max_name);　　　　 // 最多能显示几行，向上取整比如2.1就是3行
                        if (name_len > max_name) {　　　　　　　　　　　　　　 //如果长度大于每行最多显示的字数
                            for (var i = 0; i < new_row; i++) {　　　　　　　　　　　 //循环次数就是行数
                                var old = '';　　　　　　　　　　　　　　　　 //每次截取的字符
                                start = i * max_name;　　　　　　　　　　 //截取的起点
                                end = start + max_name;　　　　　　　　　 //截取的终点
                                if (i == new_row - 1) {　　　　　　　　　　　　 //最后一行就不换行了
                                    old = value.name.substring(start) + "\n" + value.value + "," + value.percent + "%";　　　　　
                                } else {　　　　　　　　　　
                                    old = value.name.substring(start, end) + "\n";　　　　　　　　
                                }　　　　　　　　　　
                                newStr += old; //拼接字符串
                            }　　　
                        } else { //如果小于每行最多显示的字数就返回原来的字符串
                            newStr = value.name + "\n" + value.value + "," + value.percent + "%";　　　
                        }　　　
                        return newStr;
                    }
                },
                data: params.data,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        return option;
    }

    /*************************************** 页面上查询、导出按钮功能 ************************************************************/
    function setTitle() {
        var curDate = new Date();
        var date = getPreMonth(curDate, 1);
        //获得年份
        var year = date.substring(0, 4);
        //获得月份
        var month = date.substring(4);
        //动态改变图表标题文字，右侧标题比左侧标题月份+1
        $(".bar-title").eq(0).text(year + "年" + month + "月" + "3个月滚动风险预警");
        $(".bar-title").eq(1).text(year + "年" + month + "月" + "12个月滚动风险预警");
        $(".pie-title").eq(0).text("3个月风险状态分布-" + month + "月");
        $(".pie-title").eq(1).text("12个月风险状态分布-" + month + "月");
    }
    setTitle();
    /*查询按钮点击功能*/
    $(".search-button").click(function() {
        var curDate = new Date();
        //获得日期框数据
        var date = $(".search-input").val() ? $(".search-input").val() : getPreMonth(curDate);
        $("#area").val("");
        $(".province").hide();
        $(".city").hide();

        //分离日期数据为数组
        var dateArr = date.split("-");
        //获得年份
        var year = dateArr[0];
        //获得月份
        var month = dateArr[1].indexOf("0") == 0 ? dateArr[1].substring(1) : dateArr[1];
        //动态改变图表标题文字，右侧标题比左侧标题月份+1
        $(".bar-title").eq(0).text(year + "年" + month + "月" + "3个月滚动风险预警");
        $(".bar-title").eq(1).text(year + "年" + month + "月" + "12个月滚动风险预警");
        $(".pie-title").eq(0).text("3个月风险状态分布-" + month + "月");
        $(".pie-title").eq(1).text("12个月风险状态分布-" + month + "月");
        //绘制图表
        var value = $("#area").val();
        var url1 = $("#search-input").val() ? "../../api/rms/risk-map/three-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + value : "../../api/rms/risk-map/three-month/bar-pie?areaName=" + value;
        var url2 = $("#search-input").val() ? "../../api/rms/risk-map/twelve-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + value : "../../api/rms/risk-map/twelve-month/bar-pie?areaName=" + value;
        setBarLeft(url1);
        setBarRight(url2);
        if ($(".search-input").val()) {
            curDate1 = $("#search-input").val().replace("-", "");
        } else {
            curDate1 = getPreMonth(new Date(), 1);
        }
        loadMap('100000', 'china', $("#area").val());
    });
    // 导出
    $("#export").click(function() {
        $("body").append('<div class="admin-loading"><i class="layui-icon layui-anim layui-anim-loop" style="font-size:14px">请稍后，拼命加载中</i></div>');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', admin.formatUrl("/api/rms/risk-map/export?ym=" + curDate1), true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = this.response;
                var filename = '风险一览' + curDate1 + '.xls';
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
                $('body>.admin-loading').remove();
            }
        };
        xhr.send();
    })

    /**************************************** 地图相关 ********************************************************/
    /*初始化地图*/
    loadMap('100000', 'china', "");
    //存储切换的每一级地图信息
    var mapStack = [];
    var timeFn = null;
    var curMap = {};
    var flag = true;
    /**
     绑定用户切换地图区域事件
     cityMap对象存储着地图区域名称和区域的信息(name-code)
     当mapCode有值,说明可以切换到下级地图
     同时保存上级地图的编号和名称
     */
    myChart.on('mapselectchanged', function(params) {
        //判断省份div与城市div是否存在来动态改变地图标题
        if ($(".province").is(":hidden") || $(".province").text() == "") {
            $(".province").text('-' + params.batch[0].name);
            $(".province").show();
        } else if ($(".province").is(":visible") && ($(".city").is(":hidden") || $(".city").text() == "")) {
            $(".city").text('-' + params.batch[0].name);
            $(".province").show();
            $(".city").show();
        }
        $("#area").val(params.batch[0].name);
        //绘制图表，若需要传递省市参数，可在setBarLeft、setPieLeft方法中加一个data参数，具体参数值可从params中获取，发送请求时带上参数传到后台
        var url1 = $("#search-input").val() ? "../../api/rms/risk-map/three-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + params.batch[0].name : "../../api/rms/risk-map/three-month/bar-pie?areaName=" + params.batch[0].name;
        var url2 = $("#search-input").val() ? "../../api/rms/risk-map/twelve-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + params.batch[0].name : "../../api/rms/risk-map/twelve-month/bar-pie?areaName=" + params.batch[0].name;
        setBarLeft(url1);
        setBarRight(url2);
        clearTimeout(timeFn);
        //由于单击事件和双击事件冲突，故单击的响应事件延迟250毫秒执行
        timeFn = setTimeout(function() {
            var name = params.batch[0].name;
            var mapCode = cityMap[name];
            if (!mapCode) {
                layer.msg('无此区域地图显示');
                return;
            }
            loadMap(mapCode, name);
            //将上一级地图信息压入mapStack
            mapStack.push({
                mapCode: curMap.mapCode,
                mapName: curMap.mapName
            });
        }, 250);
    });

    /**
     加载地图：根据地图所在省市的行政编号，
     获取对应的json地图数据，然后向echarts注册该区域的地图
     最后加载地图信息
     @params {String} mapCode:地图行政编号,for example['中国':'100000', '湖南': '430000']
     @params {String} mapName: 地图名称
     */
    function loadMap(mapCode, mapName, areaName) {
        //请求省市地图数据
        $.ajax({
            url: '../../assets/libs/china-main-city/' + mapCode + '.json',
            dataType: "json",
            success: function(data) {
                var mapData = [];
                if (data) {
                    //注册地图
                    echarts.registerMap(mapName, data);
                    //请求省市json数据
                    $.ajax({
                        url: admin.formatUrl("/api/rms/risk-map/area-top?riskYearMonth=" + curDate1 + "&province=" + $("#area").val()),
                        dataType: "json",
                        success: function(res) {
                            var arr = [];
                            if (res) {
                                mapData = res;
                                if ("" == areaName) {
                                    for (var item in mapData.data) {
                                        var obj = {};
                                        obj.name = mapData.data[item].province;
                                        obj.value = parseFloat(mapData.data[item].riskExpect);
                                        obj.supplierCode = mapData.data[item].supplierCode;
                                        obj.supplierName = mapData.data[item].supplierName;
                                        arr.push(obj);
                                    }
                                } else {
                                    for (var item in mapData.data) {
                                        var obj = {};
                                        obj.name = mapData.data[item].city;
                                        obj.value = parseFloat(mapData.data[item].riskExpect);
                                        obj.supplierCode = mapData.data[item].supplierCode;
                                        obj.supplierName = mapData.data[item].supplierName;
                                        arr.push(obj);
                                    }
                                }
                            }
                            //地图option
                            var option = {
                                visualMap: {
                                    min: 0,
                                    max: 6000,
                                    left: '15%',
                                    top: '90%',
                                    itemWidth: 10,
                                    calculable: false,
                                    orient: 'horizontal',
                                    inRange: {
                                        color: ['#cff7fd', '#0061dc']
                                    },
                                    textStyle: {
                                        color: "#FFFFFF"
                                    },
                                    calculable: true
                                },
                                tooltip: {
                                    show: true,
                                    padding: 10,
                                    enterable: true,
                                    transitionDuration: 1,
                                    textStyle: {
                                        color: '#FFFFFF',
                                        decoration: 'none',
                                    },
                                    formatter: function(params) {
                                        if (params.data) {
                                            return params.data.name + "：" + "<br>" + params.data.supplierCode + " " + params.data.supplierName + " " + (params.data.value * 100).toFixed(2) + "%";
                                        } else {
                                            return "无数据"
                                        }
                                    }
                                },
                                //主要为了地图整体外发光效果
                                geo: {
                                    map: mapName,
                                    show: true,
                                    zoom: 1.1,
                                    itemStyle: {
                                        normal: {
                                            borderWidth: 5,
                                            borderColor: '#49c5fd',
                                            shadowColor: '#3588ff',
                                            shadowBlur: 30
                                        }
                                    }
                                },
                                series: [{
                                    name: '',
                                    type: 'map',
                                    mapType: mapName,
                                    selectedMode: 'single',
                                    zoom: 1.1,
                                    top: 'center',
                                    itemStyle: {
                                        normal: {
                                            borderColor: 'grey',
                                            areaColor: '#2678b2'
                                        },
                                        emphasis: {
                                            show: true,
                                            areaColor: '#275f9f',
                                            shadowBlur: 15,
                                            shadowColor: '#3588ff',
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true,
                                            color: '#0d3f6e'
                                        },
                                        emphasis: {
                                            show: true,
                                            color: '#4f1725'
                                        }
                                    },
                                    data: arr
                                }]
                            };
                            //绘制地图
                            myChart.setOption(option, true);
                            curMap = {
                                mapCode: mapCode,
                                mapName: mapName
                            };
                        },
                        error: function() {
                            layer.msg(mapName + "暂无数据！");
                            var option = {
                                visualMap: {
                                    min: 0,
                                    max: 6000,
                                    left: 'center',
                                    top: '90%',
                                    calculable: false,
                                    orient: 'horizontal',
                                    inRange: {
                                        color: ['#cff7fd', '#0061d1']
                                    },
                                    textStyle: {
                                        color: "#FFFFFF"
                                    },
                                    calculable: true
                                },
                                tooltip: {
                                    padding: 10,
                                    enterable: true,
                                    transitionDuration: 1,
                                    textStyle: {
                                        color: '#FFFFFF',
                                        decoration: 'none',
                                    },
                                    formatter: function(params) {
                                        return params.name + '<br />' + params.data['value']
                                    },
                                },
                                series: [{
                                    name: '',
                                    type: 'map',
                                    mapType: mapName,
                                    selectedMode: 'single',
                                    roam: true,
                                    zoom: 1,
                                    itemStyle: {
                                        normal: {
                                            borderColor: 'grey',
                                            areaColor: '#2678b2',
                                        },
                                        emphasis: {
                                            areaColor: 'lightsteelblue',
                                        }
                                    },
                                    label: {
                                        normal: {
                                            show: true,
                                            color: '#FFC600'
                                        },
                                        emphasis: {
                                            show: true
                                        }
                                    },
                                    data: mapData
                                }]
                            };
                            myChart.setOption(option, true);
                            curMap = {
                                mapCode: mapCode,
                                mapName: mapName
                            };
                        }
                    });
                } else {
                    layer.msg('无法加载该地图');
                }
            },
            error: function() {
                layer.msg('无法加载该地图');
            }
        });
    }
    /*********************************** 地图返回功能 **********************************************************/

    /*点击地图标题全国模块事件*/
    $(".contruy").on("click", function() {
        if (mapStack.length == 0) {
            layer.msg('已经到达全国地图了');
            return;
        } else if (mapStack.length == 1) {
            var map = mapStack.pop();
            loadMap(map.mapCode, map.mapName, '');
            $(".province").hide();
        } else {
            mapStack.pop();
            var map1 = mapStack.pop();
            loadMap(map1.mapCode, map1.mapName, '');
            $(".province").hide();
            $(".city").hide();
        }
        $("#area").val("");
        var url1 = $("#search-input").val() ? "../../api/rms/risk-map/three-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") : "../../api/rms/risk-map/three-month/bar-pie";
        var url2 = $("#search-input").val() ? "../../api/rms/risk-map/twelve-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") : "../../api/rms/risk-map/twelve-month/bar-pie";
        setBarLeft(url1);
        setBarRight(url2);
    });
    /*点击地图标题省份模块事件*/
    $(".province").on("click", function() {
        if (mapStack.length == 1) {
            layer.msg('已经到达' + $(this).text().substring(1) + '地图了');
            return;
        } else if (mapStack.length == 2) {
            var map = mapStack.pop();
            loadMap(map.mapCode, map.mapName);
            $(".city").hide();
            var value = $(this).text().substring(1);
            var url1 = $("#search-input").val() ? "../../api/rms/risk-map/three-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + value : "../../api/rms/risk-map/three-month/bar-pie?areaName=" + value;
            var url2 = $("#search-input").val() ? "../../api/rms/risk-map/twelve-month/bar-pie?yearMonth=" + $("#search-input").val().replace("-", "") + "&areaName=" + value : "../../api/rms/risk-map/twelve-month/bar-pie?areaName=" + value;
            setBarLeft(url1);
            setBarRight(url2);
            $("#area").val(value);
        }
    });
    /*点击地图标题城市模块事件*/
    $(".city").on("click", function() {
            if (mapStack.length == 2) {
                layer.msg('已经到达' + $(this).text().substring(1) + '地图了');
                return;
            }
        })
        /***************************** 日期框 *****************************************/
        //日期框初始化
    laydate.render({
        elem: '#search-input', //或 elem: document.getElementById('test')、elem: lay('#test') 等
        type: 'month'
    });
    // 地图导航
    $(".content-header-tab").on("click", "li", function(e) {
        var riskMenuCaptions = config.getAccount().riskMenuCaptions;
        if (riskMenuCaptions.indexOf(e.currentTarget.innerText) == -1) {
            return layer.msg("您没有此权限", { icon: 5 });
        }
        switch (this.id) {
            case 'analysis':
                window.location.href = "/index.html#!riskAnalysis";
                break;
            case 'monitor':
                window.location.href = "/index.html#!riskMonitor";
                break;
            case 'warning':
                window.location.href = "/index.html#!riskWarning";
                break;
            case 'forecast':
                window.location.href = "/index.html#!riskForecast";
                break;
            case 'manage':
                window.location.href = "/index.html#!riskManager";
                break;
        }
    });
    // 退出
    // $(".loginOut").on('click', function() {
    //     layer.confirm('确定退出登录？', function() {
    //         // admin.req('/api/logout', {}, function() {
    //         config.removeAccount();
    //         // replace() 方法不会在 History 对象中生成一个新的记录。当使用该方法时，新的 URL 将覆盖 History 对象中的当前记录。
    //         // location.replace('./login.html?redirect_to=' + window.location.hash);
    //         window.location.href = "/logout";
    //         // });
    //     });
    // })
    Math.formatFloat = function(f, digit) {
        var m = Math.pow(10, digit);
        return Math.round(f * m, 10) / m;
    }

    // 退出登录
    $('#btn-logout').click(function() {
        layer.confirm('确定退出登录？', function() {
            // admin.req('/api/logout', {}, function() {
            config.removeAccount();
            // replace() 方法不会在 History 对象中生成一个新的记录。当使用该方法时，新的 URL 将覆盖 History 对象中的当前记录。
            // location.replace('./login.html?redirect_to=' + window.location.hash);
            window.location.href = "/logout";
            // });
        });
    });
    // 修改密码
    $('#btn-setpw').click(function() {
        admin.popupRight('../tpl/password1.html');
    });
    // 个人信息
    $('#btn-setinf').click(function() {
        var w = window.innerWidth < 700 ? '90%' : '700px';
        var h = window.innerHeight < 500 ? '80%' : '500px';
        admin.popupCenter({
            title: '个人信息',
            path: '../tpl/user_info_map_tpl.html',
            area: [w, h],
            resize: false,
            btn: ['保存', '取消'],
            yes: function() {
                $('[lay-filter="userInfoSubmit"]').click();
            },
            finish: function() {},
            success: function() {}
        });
    });
});