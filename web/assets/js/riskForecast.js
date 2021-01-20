layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        table = layui.table,
        admin = layui.adc,
        formSelects = layui.formSelects;
    var saveArr5 = {
        functionCodeList: "",
        supplierCode: "",
        supplierName: "",
        riskTime: getPreMonth(new Date(), 1)
    };
    // 得到上个月
    function getPreMonth(date, type) {
        var year = date.getFullYear(); //获取当前日期的年份
        var month = date.getMonth() + 1; //获取当前日期的月份s'm's
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

    function getBtn() {
        var curUser = config.getAccount();
        if (curUser.roleIds.indexOf("1") > -1) {
            $("#exportForecast").show();
            $("#executeForecastTask").show();
            $("#executeAlgorithmTask").show();
        } else {
            $("#exportForecast").hide();
            $("#executeForecastTask").hide();
            $("#executeAlgorithmTask").hide();
        }
    }

    getBtn();
    /**
     * 初始化数据分析下拉菜单
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
            $("#gysdm4").html(queGpSelect);
            $("#gysmc4").html(queGpSelect1);
            form.render('select');
        }
    });
    // 风险预测供应商代码选择回调
    form.on('select(gysdm4)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("api/risk/analysis/supplier/" + loreGpId, {}, function(res) {
                data = res.data;
                $("#gysmc4").val(data.suppliername);
                form.render('select', 'form3');
            });
        } else {
            $("#gysmc4").val("");
            form.render('select', 'form3');
        }
    });
    // 风险监控供应商名称选择回调
    form.on('select(gysmc4)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api/risk/analysis/supplier-fuzzy?supplierName=" + loreGpId, {}, function(res) {
                data = res.data[0];
                $("#gysdm4").val(data.supplierCode);
                form.render('select', 'form3');
            });
        } else {
            $("#gysdm4").val("");
            form.render('select', 'form3');
        }
    });
    /*初始化日期框*/
    laydate.render({
        type: 'month',
        elem: '#date-4',
        value: getPreMonth(new Date(), 0)
    });
    // 执行风险预测任务
    laydate.render({
        elem: '#executeForecastTask',
        format: '执行风险预测任务',
        type: 'month',
        done: function(value, date, endDate) {
            var selectDate = date.year + "" + (date.month < 10 ? '0' + date.month : date.month) + "" + '01';
            admin.req("/smsh/task-remote-control/yc/" + selectDate, {}, function(res) {
                if (!res.ok) {
                    return layer.msg(res.message);
                }
            });
            admin.removeLoading('body');
            layer.msg('风险预测任务正在执行中，大约需要1小时，请稍候再查阅数据');
        }
    });
    // 执行风险实际算法任务
    laydate.render({
        elem: '#executeAlgorithmTask',
        format: '执行风险实际算法任务',
        type: 'month',
        done: function(value, date, endDate) {
            var selectDate = date.year + "" + (date.month < 10 ? '0' + date.month : date.month) + "" + '01';
            admin.req("/smsh/task-remote-control/fx/" + selectDate, {}, function(res) {
                if (!res.ok) {
                    return layer.msg(res.message);
                }
            });
            admin.removeLoading('body');
            layer.msg('风险实际算法任务正在执行中，大约需要1小时，请稍候再查阅数据');
        }
    });
    $("#reset3").click(function() {
        form.val("form3", {
            "supplierCode": "",
            "supplierName": ""
        });
        formSelects.value('functionSelect', []);
        $("#date-4").val(getPreMonth(new Date(), 0));
        $("#searchAll").trigger("click");
    });

    function setForecast(data) {
        $("#yxgysqd").text("风险供应商清单-" + data.riskTime.substring(0, 4) + "年" + data.riskTime.substring(4) + "月");
        admin.req("/api/risk/riskPrediction", data, function(res) {
            if (res.ok) {
                renderForecastTable(res.data.list);
                setTopThreeChart(res.data);
            }
        })
    }
    // 预测页面饼状图
    var forecastPie1 = echarts.init(document.getElementById('chart-pie7'));
    var forecastPie2 = echarts.init(document.getElementById('chart-pie8'));
    var forecastPie3 = echarts.init(document.getElementById('chart-pie9'));
    var forecastPie4 = echarts.init(document.getElementById('chart-pie10'));
    var forecastPie5 = echarts.init(document.getElementById('chart-pie11'));
    var forecastPie6 = echarts.init(document.getElementById('chart-pie12'));
    // 风险预测右侧图上三
    function setTopThreeChart(data) {
        forecastPie1.setOption(getTopThreeChartOption(data.coverageRateTop10, '前10名风险供应商重叠率'));
        forecastPie1.resize();
        forecastPie2.setOption(getTopThreeChartOption(data.coverageRateTop30, '前30名风险供应商重叠率'));
        forecastPie2.resize();
        forecastPie3.setOption(getTopThreeChartOption(data.coverageRateTop50, '前50名风险供应商重叠率'));
        forecastPie3.resize();
        forecastPie4.setOption(getBottomThreeChartOption(data.prrList, 'PRR预测准确率分析'));
        forecastPie4.resize();
        forecastPie5.setOption(getBottomThreeChartOption(data.dtList, 'DT预测准确率分析'));
        forecastPie5.resize();
        forecastPie6.setOption(getBottomThreeChartOption(data.failList, '不合格数预测准确率分析'));
        forecastPie6.resize();
    }
    // 获取风险预测右侧图上三参数
    function getTopThreeChartOption(params, title) {
        var option = {
            title: {
                text: title,
                left: 'center',
                top: 'bottom',
                textStyle: {
                    fontWeight: 'normal',
                    color: '#000',
                    fontSize: '12'
                }
            },
            color: ['rgba(176, 212, 251, 1)'],
            series: [{
                name: 'Line 1',
                type: 'pie',
                clockWise: true,
                radius: ['50%', '66%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    }
                },
                hoverAnimation: false,
                data: [{
                    value: params,
                    name: '01',
                    label: {
                        show: true,
                        position: 'center',
                        formatter: function(data) {
                            return (data.value * 100).toFixed(2) + '%'
                        }
                    },
                    itemStyle: {
                        color: { // 完成的圆环的颜色
                            colorStops: [{
                                offset: 0,
                                color: '#00cefc' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: '#367bec' // 100% 处的颜色
                            }]
                        },
                    }
                }, {
                    name: '02',
                    value: 1 - params
                }]
            }]
        }
        return option;
    }
    // 获取风险预测右侧图下三参数
    function getBottomThreeChartOption(params, title) {
        var dataStyle = {
            normal: {
                label: { show: false },
                labelLine: { show: false },
            }
        };
        var placeHolderStyle = {
            normal: {
                label: {
                    show: false,
                    position: "center"
                },
                labelLine: {
                    show: false
                },
                color: "#dedede",
                borderColor: "#dedede",
                borderWidth: 0
            },
            emphasis: {
                color: "#dedede",
                borderColor: "#dedede",
                borderWidth: 0
            }
        };
        var option = {
            title: {
                text: title,
                left: 'center',
                bottom: 20,
                textStyle: {
                    fontWeight: 'normal',
                    color: '#000',
                    fontSize: '12'
                }
            },
            tooltip: {
                show: true,
                formatter: function(data) {
                    return data.seriesName + "<br>" + data.marker + data.data.name + ": " + data.percent + "%";
                }
            },
            color: ['#0F347B', '#1E9BD1', '#1E9BD1', '#1E9BD1', "#31C5C0"],
            label: {
                formatter: function(data) {
                    return (data.value * 100).toFixed(2) + "%";
                }
            },
            series: [{
                    name: title,
                    type: 'pie',
                    clockWise: false,
                    radius: [49, 50],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    data: [{
                            value: params[1].value,
                            name: 'Top30',
                            label: {
                                show: false,
                                position: 'outside',
                            },
                            labelLine: {
                                show: false,
                                length: 5,
                                length2: 5,
                                smooth: 0.5
                            },
                            itemStyle: {
                                borderWidth: 5,
                                shadowBlur: 40,
                                borderColor: "#0F347B",
                                shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                            }
                        },
                        {
                            value: 1 - params[1].value,
                            name: 'Top30',
                            tooltip: {
                                formatter: function(data) {
                                    return params[1].name + '：' + ((1 - data.value) * 100).toFixed(2) + '%'
                                }
                            },
                            itemStyle: placeHolderStyle
                        }

                    ]
                },
                {
                    name: title,
                    type: 'pie',
                    clockWise: false,
                    radius: [34, 35],
                    itemStyle: dataStyle,
                    hoverAnimation: false,

                    data: [{
                            value: params[2].value,
                            name: 'Top50',
                            label: {
                                show: false,
                                position: 'outside',
                            },
                            labelLine: {
                                show: false,
                                length: 5,
                                length2: 15,
                                smooth: 0.5
                            },
                            itemStyle: {
                                borderWidth: 5,
                                shadowBlur: 40,
                                borderColor: "#1E9BD1",
                                shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                            }
                        },
                        {
                            value: 1 - params[2].value,
                            name: 'Top50',
                            tooltip: {
                                formatter: function(data) {
                                    return params[2].name + '：' + ((1 - data.value) * 100).toFixed(2) + '%'
                                }
                            },
                            itemStyle: placeHolderStyle
                        }
                    ]
                },
                {
                    name: title,
                    type: 'pie',
                    clockWise: false,
                    hoverAnimation: false,
                    radius: [19, 20],
                    itemStyle: dataStyle,

                    data: [{
                            value: params[3].value,
                            name: 'Top100',
                            label: {
                                show: false,
                                position: 'outside',
                            },
                            labelLine: {
                                show: false,
                                length: 5,
                                length2: 20,
                                smooth: 0.5
                            },
                            itemStyle: {
                                borderWidth: 5,
                                shadowBlur: 40,
                                borderColor: "#31C5C0",
                                shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                            }
                        },
                        {
                            value: 1 - params[3].value,
                            name: 'Top100',
                            tooltip: {
                                formatter: function(data) {
                                    return params[3].name + '：' + ((1 - data.value) * 100).toFixed(2) + '%'
                                }
                            },
                            itemStyle: placeHolderStyle
                        }
                    ]
                },
                {
                    name: title,
                    type: 'pie',
                    clockWise: false,
                    hoverAnimation: false,
                    radius: [0, 0],
                    itemStyle: dataStyle,

                    data: [{
                            value: params[0].value,
                            name: '整体',
                            label: {
                                show: true,
                                position: 'center',
                                color: '#666',
                                padding: [0, 0, 0, 0],
                                formatter: function(data) {
                                    return data.name + "\n" + (data.value * 100).toFixed(2) + "%";
                                }
                            }
                        },
                        {
                            value: 1 - params[0].value,
                            name: '整体',
                            tooltip: {
                                formatter: function(data) {
                                    return params[0].name + '：' + ((1 - data.value) * 100).toFixed(2) + '%'
                                }
                            },
                            itemStyle: placeHolderStyle
                        }
                    ]
                }
            ]
        };
        return option;
    }
    // 渲染风险预测列表
    function renderForecastTable(data) {
        table.render({
            id: 'demo-table3',
            elem: '#demo-table3',
            data: data,
            even: true,
            cols: [
                [{
                    title: '序号',
                    type: 'numbers'
                }, {
                    title: '供应商代码',
                    field: 'suppliercode',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '供应商名称',
                    field: 'suppliername',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '业务模块',
                    field: 'functionName',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '风险实际排名',
                    field: 'realRiskRank',
                    minWidth: 130,
                    align: 'center'
                }, {
                    title: '风险预测排名',
                    field: 'forecastRiskRank',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '排名差别',
                    templet: '#control-2',
                    minWidth: 90,
                    align: 'center'
                }]
            ],
            page: {
                layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
            },
            done: function(res, curr, count) { // 表格渲染完成之后的回调
            }
        });
    }

    /*查询按钮功能*/
    form.on('submit(search3)', function(data) {
        if (data.field.riskTime) {
            data.field.riskTime = data.field.riskTime.replace("-", "");
        } else {
            data.field.riskTime = getPreMonth(new Date(), 1);
        }
        saveArr5 = data.field;
        setForecast(data.field);
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

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

    // 导出
    $("#exportForecast").click(function() {
        admin.showLoading("body");
        var canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 550;
        var context = canvas.getContext("2d");

        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#fff";
        context.fill();
        var basePie1 = forecastPie1.getDataURL();
        var basePie2 = forecastPie2.getDataURL();
        var basePie3 = forecastPie3.getDataURL();
        var basePie4 = forecastPie4.getDataURL();
        var basePie5 = forecastPie5.getDataURL();
        var basePie6 = forecastPie6.getDataURL();
        var imagePie1 = new Image();
        var imagePie2 = new Image();
        var imagePie3 = new Image();
        var imagePie4 = new Image();
        var imagePie5 = new Image();
        var imagePie6 = new Image();
        imagePie1.src = basePie1;
        imagePie2.src = basePie2;
        imagePie3.src = basePie3;
        imagePie4.src = basePie4;
        imagePie5.src = basePie5;
        imagePie6.src = basePie6;
        setTimeout(function() {
            context.drawImage(imagePie1, 0, 0, 250, 260);
            context.drawImage(imagePie2, 250, 0, 250, 260);
            context.drawImage(imagePie3, 500, 0, 250, 260);
            context.drawImage(imagePie4, 0, 260, 250, 260);
            context.drawImage(imagePie5, 250, 260, 250, 260);
            context.drawImage(imagePie6, 500, 260, 250, 260);
            var base64Up = canvas.toDataURL("image/png"); //"image/png" 这里注意一下
            var up = dataURLtoFile(base64Up);
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            formData.append("multipartFiles", up, 'Up');
            formData.append("riskTime", saveArr5.riskTime);
            formData.append("supplierCode", saveArr5.supplierCode);
            formData.append("supplierName", saveArr5.supplierName);
            formData.append("functionCode", saveArr5.functionCodeList);
            xhr.open('POST', admin.formatUrl("/api/risk/riskPrediction/excel"), true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                if (this.status == 200) {
                    var blob = this.response;
                    var filename = '风险预测.xls';
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
        }, 1000);

    });
    // 执行风险预测任务
    $("#executeForecast").click(function() {

    });
    // 执行初始化
    setForecast(saveArr5);
})