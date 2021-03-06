layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload'], function() {
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        table = layui.table,
        admin = layui.adc,
        formSelects = layui.formSelects;
    var saveArr3 = {
        functionCodeList: "",
        supplierCode: "",
        riskLevelCode: "",
        affectcarType: "",
        affectParts: "",
        sqName: "",
        state: "",
        riskTime: new Date().getFullYear() + "" + ((new Date().getMonth() + 1) < 10 ? ('0' + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1))
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
    // 请求供应商代码
    $.ajax({
        url: admin.formatUrl('api/risk/analysis/supplierCode'),
        success: function(res) {
            var data = res.data;
            $("#gysdm1").empty();
            var queGpSelect = "<option value=''></option>";
            var queGpSelect1 = "<option value=''></option>";
            $.each(data, function(i, n) {
                queGpSelect += "<option value='" + n.suppliercode + "'>" + n.suppliercode + "</option>";
                queGpSelect1 += "<option value='" + n.suppliername + "'>" + n.suppliername + "</option>";
            });
            $("#gysdm3").html(queGpSelect);
            $("#gysmc3").html(queGpSelect1);
            form.render('select');
        }
    });
    // 预警应对供应商代码选择回调
    form.on('select(gysdm3)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("api/risk/analysis/supplier/" + loreGpId, {}, function(res) {
                data = res.data;
                $("#gysmc3").val(data.suppliername);
                form.render('select', 'form2');
                admin.removeLoading("body");
            });
        } else {
            $("#gysmc3").val("");
            form.render('select', 'form2');
        }
    });
    // 预警应对供应商名称选择回调
    form.on('select(gysmc3)', function(data) {
        if (data.value) {
            var loreGpId = data.value;
            admin.req("/api/risk/analysis/supplier-fuzzy?supplierName=" + loreGpId, {}, function(res) {
                data = res.data[0];
                $("#gysdm3").val(data.supplierCode);
                form.render('select', 'form2');
                admin.removeLoading("body");
            });
        } else {
            $("#gysdm3").val("");
            form.render('select', 'form2');
        }
    });
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
    /*初始化日期框*/
    laydate.render({
        type: 'month',
        elem: '#date-3'
    });
    /*初始化风险预警表格*/
    var renderTable3 = function(data) {
        if (!data) {
            data = {}
        }
        table.render({
            id: 'demo-table2',
            elem: '#demo-table2',
            where: data,
            url: admin.formatUrl("/api/risk/warning/detail/list"),
            parseData: function(res) { //res 即为原始返回的数据
                return {
                    "code": res.respCode, //解析接口状态
                    "msg": res.message, //解析提示文本
                    "count": res.data.count, //解析数据长度
                    "data": res.data.list //解析数据列表
                };
            },
            even: true,
            page: true,
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            cols: [
                [{
                    type: "checkbox",
                    fixed: 'left'
                }, {
                    title: '序号',
                    type: 'numbers'
                }, {
                    title: '预警编号',
                    field: 'riskSn',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '预警时间',
                    field: 'riskDate',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '供应商代码',
                    field: 'supplierCode',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '供应商名称',
                    field: 'supplierName',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '业务模块',
                    field: 'functionName',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '风险类型',
                    field: 'riskType',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '预警描述',
                    field: 'warninRemark',
                    minWidth: 280,
                    align: 'center'
                }, {
                    title: '风险程度',
                    field: 'riskLevelName',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '影响车型/机型',
                    field: 'affectcarType',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '主要影响产品',
                    field: 'affectParts',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '原因分析',
                    field: 'reason',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '应对措施',
                    field: 'response',
                    minWidth: 90,
                    align: 'center'
                }, {
                    title: '计划关闭日期',
                    field: 'planTime',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '实际关闭日期',
                    field: 'overTime',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: 'SQ负责人',
                    field: 'sqName',
                    minWidth: 100,
                    align: 'center',
                }, {
                    title: '供应商负责人',
                    field: 'supName',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '状态',
                    field: 'state',
                    align: 'center',
                    fixed: 'right'
                }, {
                    title: '改进报告',
                    field: '',
                    minWidth: 90,
                    align: 'center',
                    templet: '#control',
                    fixed: 'right'
                }]
            ],
            done: function(res, curr, count) { // 表格渲染完成之后的回调
                // 对相关数据进行判断处理
                $("td[data-field = 'state']").children().each(function() {
                    if ($(this).text() == 'G') {
                        $(this).text("");
                        $(this).css("backgroundColor", "#28C935");
                    } else if ($(this).text() == 'R') {
                        $(this).css("backgroundColor", "#FF5252");
                        $(this).text("");
                    } else {
                        $(this).text("");
                    }
                })
            }
        });
    }
    $("#reset2").click(function() {
        form.val("form2", {
            "riskTime": "",
            "supplierCode": "",
            "gysmc3": "",
            "riskLevelCode": "",
            "affectcarType": "",
            "affectParts": "",
            "sqName": ""
        });
        formSelects.value('functionSelect', []);
        $("#status").val('R');
        form.render("select", "form2");
        $("#searchAll").trigger("click");
    });
    // 请求风险程度下拉框值
    admin.req("/api/risk/managementSystem/risklLeve", {}, function(res) {
        if (res.ok) {
            var option = "<option value=''></option>";
            for (var i = 1; i < res.data.length; i++) {
                option += "<option value='" + res.data[i].riskLevelCode + "'>" + res.data[i].riskLevelName + "风险</option>"
            }
            $("#fxcd3").empty().append(option);
            form.render("select", "form2");
        } else {
            layer.msg(res.message);
        }
    });
    // 设置影响机型下拉框数据
    admin.req("/api/risk/warning/affectcarType", {}, function(res) {
        if (res.ok) {
            var option = "<option value=''></option>";
            for (var i = 0; i < res.data.length; i++) {
                option += "<option value='" + res.data[i] + "'>" + res.data[i] + "</option>"
            }
            $("#vehicleType").empty().append(option);
            form.render("select", "form2");
        } else {
            layer.msg(res.message);
        }
    });
    // 设置主要影响产品下拉框数据
    admin.req("/api/risk/warning/affectparts", {}, function(res) {
        if (res.ok) {
            var option = "<option value=''></option>";
            for (var i = 0; i < res.data.length; i++) {
                option += "<option value='" + res.data[i] + "'>" + res.data[i] + "</option>"
            }
            $("#product").empty().append(option);
            form.render("select", "form2");
        } else {
            layer.msg(res.message);
        }
    });

    // 设置SQE下拉框数据
    admin.req("/api/risk/warning/sqname", {}, function(res) {
        if (res.ok) {
            var option = "<option value=''></option>";
            for (var i = 0; i < res.data.length; i++) {
                option += "<option value='" + res.data[i] + "'>" + res.data[i] + "</option>"
            }
            $("#sqe").empty().append(option);
            form.render("select", "form2");
        } else {
            layer.msg(res.message);
        }
    });

    // 设置风险预警状态下拉框数据
    admin.req("/api/risk/warning/state", {}, function(res) {
        if (res.ok) {
            var option = "<option value=''></option>";
            for (var i = 0; i < res.data.length; i++) {
                option += "<option value='" + res.data[i] + "'>" + (res.data[i] == 'G' ? '绿色--完成' : '红色--过期') + "</option>"
            }
            $("#status").empty().append(option);
            form.render("select", "form2");
        } else {
            layer.msg(res.message);
        }
    });
    // 风险预警页面查询
    form.on('submit(search2)', function(data) {
        if (data.field.riskTime) {
            data.field.riskTime = data.field.riskTime.replace("-", "");
            delete data.field.gysmc3;
            renderTable3(data.field);
        } else {
            delete data.field.gysmc3;
            renderTable3(data.field);
            data.field.riskTime = new Date().getFullYear() + "" + ((new Date().getMonth() + 1) < 10 ? ('0' + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1));
        }
        setRiskWarningBar(data.field);
        setRiskWarningPie(data.field);
        // setDistributionBar(data.field);
        saveArr3 = data.field;
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
    // 编辑
    $("#wanningEdit").click(function() {
        var checkStatus = table.checkStatus('demo-table2'); //test即为基础参数id对应的值
        if (checkStatus.data.length > 1) {
            layer.msg("请至多选择一项进行编辑！");
            return;
        } else if (checkStatus.data.length == 0) {
            layer.msg("请至少选择一项进行编辑！");
            return;
        };
        popMenu(checkStatus.data[0], 'components/tpl/risk_wanning_tpl_edit.html', '风险应对信息修改', 'demo-table2');
    });
    // 监听工具条事件
    table.on('tool(demo-table2)', function(obj) {
        // 获取点击列的数据
        var data = obj.data;
        var layEvent = obj.event;
        // 判断操作类型/详情
        if (layEvent === 'download') {
            if (data.fileId) {
                admin.showLoading("body");
                window.location.href = admin.formatUrl("/api/risk/warning/report/download?fileId=" + data.fileId);
                admin.removeLoading("body");
            } else {
                layer.msg("当前没有可下载的文件！");
            }
        }
        if (layEvent === 'view') {
            if (data.fileId) {
                if (data.fileType == "pic" || data.fileType == "pdf") {
                    admin.showLoading("body");
                    var url = admin.formatUrl("/api/risk/warning/report/preview?fileId=" + data.fileId);
                    name = "";
                    window.open(url, name);
                    admin.removeLoading("body");
                } else {
                    layer.msg("当前文件不支持查看！");
                }
            } else {
                layer.msg("当前没有可查看的文件！");
            }
        }
    });
    // 导出
    $("#wanningExport").click(function() {
        admin.showLoading("body");
        var warningBar = echarts.init(document.getElementById('warningBar'));
        var warningPie = echarts.init(document.getElementById('warningPie'));
        var canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 300;
        var context = canvas.getContext("2d");

        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#fff";
        context.fill();
        var baseBar = warningBar.getDataURL();
        var basePie = warningPie.getDataURL();
        var imageBar = new Image();
        var imagePie = new Image();
        imageBar.src = baseBar;
        imagePie.src = basePie;
        setTimeout(function() {
            context.drawImage(imageBar, 0, 0, 400, 260);
            context.drawImage(imagePie, 400, 0, 400, 260);
            var base64Up = canvas.toDataURL("image/png"); //"image/png" 这里注意一下
            var up = dataURLtoFile(base64Up);
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            formData.append("multipartFiles", up, 'Up');
            formData.append("riskTime", saveArr3.riskTime);
            formData.append("supplierCode", saveArr3.supplierCode);
            formData.append("functionCode", saveArr3.functionCodeList);
            formData.append("riskLevelCode", saveArr3.riskLevelCode);
            formData.append("affectcarType", saveArr3.affectcarType);
            formData.append("affectParts", saveArr3.affectParts);
            formData.append("sqName", saveArr3.sqName);
            formData.append("state", saveArr3.state);
            xhr.open('POST', admin.formatUrl("/api/risk/warning/excel"), true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                if (this.status == 200) {
                    var blob = this.response;
                    var filename = '风险应对与监控-风险预警应对.xls';
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
    })

    // 弹出框
    function popMenu(data, path, title, id) {
        admin.popupCenter({
            title: title,
            area: ['1230px', '581px'],
            path: path,
            finish: function() {
                table.reload(id, {
                    where: {
                        reload: new Date().getTime()
                    }
                });
            },
            success: function() {
                if (id == "demo-table2") {
                    setFormValue(data);
                } else if (id == "demo-table4") {
                    setFormValue1(data);
                }
                form.render();
            }
        });
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
    // 设置表单回显
    function setFormValue(data) {
        var inputs = $('.layui-tpl-container').find('input'),
            formNames = ['riskId', 'riskSn', 'riskDate', 'supplierCode', 'supplierName', 'riskType', 'affectcarType', 'affectParts', 'riskLevelName', 'planTime', 'overTime', 'supName', 'reason', 'response', 'warninRemark', 'sqName', 'fileId'];
        data.overTime ? data.overTime = data.overTime.split(" ")[0] : data.overTime = "";
        data.planTime ? data.planTime = data.planTime.split(" ")[0] : data.planTime = "";
        // 设置sq负责人
        admin.req("/api/risk/warning/sqname-fuzzy?username=", {}, function(res) {
            var option = "<option value=''>请选择</option>"
            for (var i = 0; i < res.data.length; i++) {
                option += "<option value='" + res.data[i] + "'>" + res.data[i] + "</option>"
            }
            $("#wanningSqEdit").empty().append(option);
            for (var i = 0; i < formNames.length; i++) {
                if (data[formNames[i]]) {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val(data[formNames[i]]);
                } else {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val('');
                }
                $('.layui-tpl-container [name="' + formNames[i] + '"]').attr("disabled", "").addClass("layui-disabled");
            }
            // 判断实际关闭日期是否填写，若存在，全部不可编辑
            if (data.overTime) {
                $("#wanningReason").attr("disabled", "").addClass("layui-disabled");
                $("#wanningResponse").attr("disabled", "").addClass("layui-disabled");
                $("#wanningSqEdit").attr("disabled", "").addClass("layui-disabled");
                $("#wanningSupNameEdit").attr("disabled", "").addClass("layui-disabled");
                $("#wanningPtEdit").attr("disabled", "").addClass("layui-disabled");
                $("#wanningOtEdit").attr("disabled", "").addClass("layui-disabled");
                $("#chooseFile").attr("disabled", "").addClass("layui-disabled");;
            } else {
                $("#wanningReason").removeAttr("disabled").removeClass("layui-disabled");
                $("#wanningResponse").removeAttr("disabled").removeClass("layui-disabled");
                $("#wanningSqEdit").removeAttr("disabled").removeClass("layui-disabled");
                $("#wanningSupNameEdit").removeAttr("disabled").removeClass("layui-disabled");
                $("#wanningPtEdit").removeAttr("disabled").removeClass("layui-disabled");
                $("#wanningOtEdit").removeAttr("disabled").removeClass("layui-disabled");
            }
            form.render('select', "riskWanning");
            if (data.overTime) {
                $("#wanningSqEdit").next().find("input").attr("disabled", "").addClass("layui-disabled");
            }
        });
        // 判断状态
        if (data.state) {
            if (data.state == "G") {
                $("#wanningStateEdit").css("backgroundColor", "#28C935");
            } else if (data.state == "R") {
                $("#wanningStateEdit").css("backgroundColor", "#FF5252");
            } else {

            }
        }
        // 判断文件是否存在
        if (data.fileId) {
            $("#uploadFile").before('<span class="layui-inline layui-upload-choose">' + data.filePrefix + data.fileName.substring(data.fileName.indexOf(".")) + '</span>');
        }
    }
    // 表单提交
    form.on('submit(warningSave)', function(data) {
        // 获取表单数据
        var d = data.field,
            elem = data.elem;
        $(elem).attr('disabled', true);
        d.planTime ? d.planTime += " 00:00:00:000" : "";
        d.overTime ? d.overTime += " 00:00:00:000" : "";
        // 发送请求
        admin.req('/api/risk/warning', d, function(data) {
            $(elem).attr('disabled', false);
            if (data.ok) {
                layer.msg('成功！', {
                    icon: 1
                });
                admin.finishPopupCenter();
            } else {
                return layer.msg('失败：' + data.message, {
                    icon: 5
                });
            }
        }, {
            method: 'put'
        });
    });
    // 设置分析预警柱状图
    function setRiskWarningBar(data) {
        admin.req("/api/risk/warning/detial/bar?riskTime=" + data.riskTime + "&supplierCode=" + data.supplierCode + "&functionCodeList=" + data.functionCodeList + "&riskLevelCode=" + data.riskLevelCode + "&affectcarType=" + data.affectcarType + "&affectParts=" + data.affectParts + "&sqName=" + data.sqName + "&state=" + data.state, {}, function(res) {
            var json = JSON.parse(res.data);
            setValues_4(json);
            $("#warningPieTitle").text(data.riskTime.substring(0, 4) + "年" + data.riskTime.substring(4) + "月风险类型分析");
        });
    }
    // 设置预警页面饼状图
    function setRiskWarningPie(data) {
        admin.req("/api/risk/warning/detial/pie?riskTime=" + data.riskTime + "&supplierCode=" + data.supplierCode + "&functionCodeList=" + data.functionCodeList + "&riskLevelCode=" + data.riskLevelCode + "&affectcarType=" + data.affectcarType + "&affectParts=" + data.affectParts + "&sqName=" + data.sqName + "&state=" + data.state, {}, function(res) {
            var json = JSON.parse(res.data);
            setValues_5(json);
        });
    }
    // 预警页面柱状图
    var warningBar = echarts.init(document.getElementById('warningBar'));
    // 拆分分析预警柱状图数据
    function setValues_4(json) {
        /*柱状图参数数据*/
        var paramsLeftBar = {};
        /*x轴数据*/
        var namesBar = [];
        /*y轴数据*/
        var valuesBar1 = [];
        var valuesBar2 = [];
        var valuesBar3 = [];
        /*循环json数据 赋值x轴、y轴数组数据*/
        for (var i = 0; i < 12; i++) {
            var name = json[i].riskTime;
            var value1 = json[i].riskNum;
            var value2 = json[i].closeNum;
            var value3 = json[i].closeRate;
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
        warningBar.clear();
        //绘制柱状图
        console.log(paramsLeftBar);
        if (paramsLeftBar.dataY1.length || paramsLeftBar.dataY2.length || paramsLeftBar.dataY3.length || paramsLeftBar.dataX.length) {
            $("#async-img1").hide();
            $("#warningBar").show();
            //$("#chart-pie-row div").append("<div id=\"chart-pie\" style=\"width: 96%;height: 260px;margin: 0 auto;\">");
            warningBar.setOption(getWarningBarOption(paramsLeftBar), true);
        } else {
            $("#async-img1").show();

            $("#warningBar").hide();
        }
        //warningBar.setOption(getWarningBarOption(paramsLeftBar), true);
        warningBar.resize();
    }
    // 获取预警页面柱状图参数
    function getWarningBarOption(params) {
        var option = {
            color: ['#3BA0FF', '#4DCB73', '#FAD337'],
            legend: {
                data: ['风险数', '关闭数', '到期关闭率']
            },
            tooltip: {
                show: true,
                formatter: function(params) {
                    if (params.seriesIndex == 2) {
                        return params.seriesName + '<br>' + params.name + '：' + params.data * 100 + '%'
                    } else {
                        return params.seriesName + '<br>' + params.name + '：' + params.data;
                    }
                }
            },
            xAxis: [{
                type: 'category',
                data: params.dataX,
                inverse: true,
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
            }, {
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
                    },
                    formatter: function(value, index) {
                        return value * 100 + '%'
                    }
                },
                splitLine: {
                    show: false
                }
            }],
            series: [{
                    name: '风险数',
                    type: 'bar',
                    data: params.dataY1
                },
                {
                    name: '关闭数',
                    type: 'bar',
                    data: params.dataY2
                },
                {
                    name: '到期关闭率',
                    type: 'line',
                    data: params.dataY3,
                    yAxisIndex: 1
                }
            ]
        }
        return option;
    }
    // 预警页面饼状图
    var warningPie = echarts.init(document.getElementById('warningPie'));
    // 拆分分析预警柱状图数据
    function setValues_5(json) {
        /*柱状图参数数据*/
        var paramsLeftPie = {};
        /*x轴数据*/
        var namesBar = [];
        /*y轴数据*/
        var values = [];
        /*循环json数据 赋值x轴、y轴数组数据*/
        for (var key in json) {
            namesBar.push(key);
            var obj = {};
            obj.name = key;
            obj.value = json[key];
            values.push(obj);
        }
        //组装参数
        paramsLeftPie.legend = namesBar;
        paramsLeftPie.data = values;
        //清空图表区域
        warningPie.clear();
        //绘制柱状图
        console.log(paramsLeftPie);
        if (paramsLeftPie.data.length) {
            $("#async-img2").hide();
            $("#warningPie").show();
            //$("#chart-pie-row div").append("<div id=\"chart-pie\" style=\"width: 96%;height: 260px;margin: 0 auto;\">");
            warningPie.setOption(getWarningPieOption(paramsLeftPie), true);
        } else {
            $("#async-img2").show();
            $("#warningPie").hide();
        }
        // warningPie.setOption(getWarningPieOption(paramsLeftPie), true);
        warningPie.resize();
    }
    // 获取预警页面饼状图参数
    function getWarningPieOption(params) {
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"

            },
            legend: {
                show: true,
                orient: 'vertical',
                x: 'center',
                data: params.legend
            },
            series: [{
                name: '',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                //hoverAnimation:false,	//关闭 hover 在扇区上的放大动画效果。
                label: {
                    normal: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}{d}%', //模板变量有 {a}、{b}、{c}、{d}，分别表示系列名，数据名，数据值，百分比。{d}数据会根据value值计算百分比

                        textStyle: {
                            fontSize: 12,
                            color: '#666'
                        }
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: 18,
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: true
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
        return option;
    }
    // 柱状图点击事件
    warningBar.on('click', function(params) {
        $("#warningPieTitle").text(params.name.substring(0, 4) + "年" + params.name.substring(4) + "月风险类型分析");
        setRiskWarningPie({
            functionCodeList: saveArr3.functionCodeList,
            supplierCode: saveArr3.supplierCode,
            riskLevelCode: saveArr3.riskLevelCode,
            affectcarType: saveArr3.affectcarType,
            affectParts: saveArr3.affectParts,
            sqName: saveArr3.sqName,
            state: saveArr3.state,
            riskTime: params.name
        });
    });
    /*图表自适应窗口大小*/
    setTimeout(function() {
        window.onresize = function() {
            warningBar.resize();
        }
    }, 1000);
    setRiskWarningBar(saveArr3);
    setRiskWarningPie(saveArr3);
    renderTable3({
        functionCodeList: "",
        supplierCode: "",
        riskLevelCode: "",
        affectcarType: "",
        affectParts: "",
        sqName: "",
        state: "NonG",
        riskTime: ""
    });
})