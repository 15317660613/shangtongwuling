layui.use(['index', 'laydate', 'form', 'table', 'formSelects', 'upload', 'element'], function() {
    var config = layui.config,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element,
        table = layui.table,
        admin = layui.adc,
        formSelects = layui.formSelects;
    var saveArr4 = {
        riskcodeList: "",
        riskindexcodeList: "",
        risktypecode: "",
        indextypecode: "",
        risklevelcode: "",
        frequency: ""
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
    $("#reset4").click(function() {
        form.val("form4", {
            "risktypecode": "",
            "indextypecode": "",
            "risklevelcode": "",
            "frequency": ""
        });
        formSelects.value('riskcodeList', []);
        formSelects.value('riskindexcodeList', []);
        $("#searchAll").trigger("click");
    });

    function setSearchList() {
        // 请求风险类型下拉框值
        admin.req("/api/risk/managementSystem/risktype", {}, function(res) {
            if (res.ok) {
                var option = "<option value=''>请选择</option>";
                for (var i = 0; i < res.data.length; i++) {
                    option += "<option value='" + res.data[i].riskTypeCode + "'>" + res.data[i].riskTypeName + "</option>"
                }
                $("#riskTypeCode").empty().append(option);
                form.render("select", "form4");
            } else {
                layer.msg(res.message);
            }
        });
        // 请求风险项目下拉框值
        admin.req("/api/risk/managementSystem/risk", {}, function(res) {
            if (res.ok) {
                var data = res.data;
                var selectData = [];
                for (var i = 0, length = data.length; i < length; i++) {
                    var selectObj = {};
                    selectObj.name = data[i].riskName;
                    selectObj.value = data[i].riskCode;
                    selectData.push(selectObj);
                }
                //formSelect-v4下拉树插件渲染
                formSelects.data('riskcodeList', 'local', {
                    arr: selectData
                });
                formSelects.btns('riskcodeList', []);
            } else {
                layer.msg(res.message);
            }
        });
        // 请求风险指标下拉框值
        admin.req("/api/risk/managementSystem/riskIndex", {}, function(res) {
            if (res.ok) {
                var data = res.data;
                var selectData = [];
                for (var i = 0, length = data.length; i < length; i++) {
                    var selectObj = {};
                    selectObj.name = data[i].riskIndexName;
                    selectObj.value = data[i].riskIndexCode;
                    selectData.push(selectObj);
                }
                //formSelect-v4下拉树插件渲染
                formSelects.data('riskindexcodeList', 'local', {
                    arr: selectData
                });
                formSelects.btns('riskindexcodeList', []);
            } else {
                layer.msg(res.message);
            }
        });
        // 请求指标类型下拉框值
        admin.req("/api/risk/managementSystem/indexType", {}, function(res) {
            if (res.ok) {
                var option = "<option value=''>请选择</option>";
                for (var i = 0; i < res.data.length; i++) {
                    option += "<option value='" + res.data[i].indexTypeCode + "'>" + res.data[i].indexTypeName + "</option>"
                }
                $("#indextypecode").empty().append(option);
                form.render("select", "form4");
            } else {
                layer.msg(res.message);
            }
        });
        // 请求风险等级下拉框值
        admin.req("/api/risk/managementSystem/risklLeve", {}, function(res) {
            if (res.ok) {
                var option = "<option value=''>请选择</option>";
                for (var i = 1; i < res.data.length; i++) {
                    option += "<option value='" + res.data[i].riskLevelCode + "'>" + res.data[i].riskLevelName + "风险</option>"
                }
                $("#risklevelcode").empty().append(option);
                form.render("select", "form4");
            } else {
                layer.msg(res.message);
            }
        });
        // 请求统计频率下拉框值
        admin.req("/api/risk/managementSystem/frequency", {}, function(res) {
            if (res.ok) {
                var option = "<option value=''>请选择</option>";
                for (var i = 0; i < res.data.length; i++) {
                    option += "<option value='" + res.data[i].frequency + "'>" + res.data[i].frequency + "</option>"
                }
                $("#frequency").empty().append(option);
                form.render("select", "form4");
            } else {
                layer.msg(res.message);
            }
        });
    }
    // 风险管理页查询
    form.on('submit(search4)', function(data) {
        renderTable4(data.field);
        saveArr4 = data.field;
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

    // 风险管理表格列表
    function renderTable4(data) {
        if (!data) {
            data = null;
        }
        table.render({
            id: 'demo-table4',
            elem: '#demo-table4',
            where: data,
            url: admin.formatUrl("/api/risk/managementSystem"),
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
                    type: "checkbox",
                    fixed: 'left'
                }, {
                    title: '序号',
                    type: 'numbers'
                }, {
                    title: '风险类型',
                    field: 'risktypename',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '风险项目',
                    field: 'riskname',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '风险指标',
                    field: 'riskindexname',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '指标类型',
                    field: 'indextypename',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '预警类型',
                    field: 'warningtypename',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '预警法则',
                    field: 'warninrrule',
                    minWidth: 280,
                    align: 'center'
                }, {
                    title: '风险等级',
                    field: 'risklevelname',
                    minWidth: 100,
                    align: 'center'
                }, {
                    title: '预警描述',
                    field: 'warninremark',
                    minWidth: 120,
                    align: 'center'
                }, {
                    title: '统计频率',
                    field: 'frequency',
                    minWidth: 120,
                    align: 'center'
                }]
            ],
            even: false,
            page: false,
            done: function(res, curr, count) { // 表格渲染完成之后的回调
                TableRowspan.LayuiRowspan("demo-table4", ["risktypename", "riskname", 'riskindexname', 'indextypename', 'warningtypename', 'warninrrule', 'risklevelname', 'warninremark', 'frequency'], 1);
            }
        });
    }

    // 修改
    $("#manageEdit").click(function() {
        var checkStatus = table.checkStatus('demo-table4'); //test即为基础参数id对应的值
        if (checkStatus.data.length > 1) {
            layer.msg("请至多选择一项进行编辑！");
            return;
        } else if (checkStatus.data.length == 0) {
            layer.msg("请至少选择一项进行编辑！");
            return;
        };
        popMenu(checkStatus.data[0], 'components/tpl/risk_manage_tpl_edit.html', '风险预警指标修改', 'demo-table4');
    });
    // 修改
    $("#manageEdit2").click(function() {
        var checkStatus = table.checkStatus('demo-table4'); //test即为基础参数id对应的值
        if (checkStatus.data.length > 1) {
            layer.msg("请至多选择一项进行编辑！");
            return;
        } else if (checkStatus.data.length == 0) {
            layer.msg("请至少选择一项进行编辑！");
            return;
        };
        popMenu2(checkStatus.data[0], 'components/tpl/risk_manage_tpl_edit2.html', '风险预警指标修改', 'demo-table4');
    });
    // 设置表单回显值
    function setFormValue1(data) {
        var inputs = $('.layui-tpl-container').find('input'),
            formNames = ['riskid', 'risktypename', 'riskname', 'riskindexname', 'indextypename', 'warningtypename', 'frequency', 'warningvalue', 'risklevelcode', 'risklevelname', 'warninremark'];
        // 设置风险等级
        admin.req("/api/risk/managementSystem/risklLeve", {}, function(res) {
            var option = "<option value=''>请选择</option>"
            for (var i = 1; i < res.data.length; i++) {
                option += "<option value='" + res.data[i].riskLevelCode + "'>" + res.data[i].riskLevelName + "</option>"
            }
            $("#risklevelcode1").empty().append(option);
            for (var i = 0; i < formNames.length; i++) {
                if (data[formNames[i]]) {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val(data[formNames[i]]);
                } else {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val('');
                }
                $('.layui-tpl-container [name="' + formNames[i] + '"]').attr("disabled", "").addClass("layui-disabled");
            }
            switch (data.warningcode) {
                case '>':
                    $('.layui-tpl-container [name="warningcode"]').val("1");
                    break;
                case '>=':
                    $('.layui-tpl-container [name="warningcode"]').val("2");
                    break;
                case '=':
                    $('.layui-tpl-container [name="warningcode"]').val("3");
                    break;
                case '<':
                    $('.layui-tpl-container [name="warningcode"]').val("4");
                    break;
                case '<=':
                    $('.layui-tpl-container [name="warningcode"]').val("5");
                    break;
            }
            $('.layui-tpl-container [name="warningcode"]').removeAttr("disabled", "").removeClass("layui-disabled");
            $('.layui-tpl-container [name="warningvalue"]').removeAttr("disabled", "").removeClass("layui-disabled");
            $('.layui-tpl-container [name="risklevelcode"]').removeAttr("disabled", "").removeClass("layui-disabled");
            $('.layui-tpl-container [name="warninremark"]').removeAttr("disabled", "").removeClass("layui-disabled");
            // 判断实际关闭日期是否填写，若存在，全部不可编辑
            if (data.warningtypecode == "NBYJLX3") {
                $("#warningcodewrapper").hide();
                $("#warninremarkwrapper").hide();
            } else {
                $("#warningcodewrapper").show();
                $("#warninremarkwrapper").show();
            }
            form.render('select', "riskManager");
        });
    }
    // 设置表单回显值
    function setFormValue3(data) {
        var inputs = $('.layui-tpl-container2').find('input'),
            formNames = ['riskid', 'risktypename', , 'risktypecode', 'riskname', 'riskindexname', 'indextypename', 'warningtypename', 'frequency', 'warningvalue', 'risklevelcode', 'risklevelname', 'warninremark', 'warningvalue2', 'warninrrule'];
        // 设置风险等级
        admin.req("/api/risk/managementSystem/risklLeve", {}, function(res) {
			var option = "<option value=''>请选择</option>"
			for (var i = 1; i < res.data.length; i++) {
			    option += "<option value='" + res.data[i].riskLevelCode + "'>" + res.data[i].riskLevelName + "</option>"
			}
			$("#risklevelcode1").empty().append(option);
            for (var i = 0; i < formNames.length; i++) {
                if (formNames[i] == 'warningvalue2' && data['warningvalue2']) {
                    var warnarr = data['warningvalue2'].split('?');
                    var re = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字
                    var myli = "<label style='margin-left: 35px;'>预警法则：</label>";
                    for (var j = 0; j < warnarr.length; j++) {
                        if (re.test(warnarr[j])) {
                            myli = myli + " <input class='warningvalue-input' type='text' style='width: 30px;' value = " + warnarr[j] + ">";
                        } else {
                            myli = myli + "<label class = 'warningvalue-input2'>" + warnarr[j] + "</label>";
                        }
                    }
                    $('#warningrule').append(myli);
                } else {
                    if (data[formNames[i]]) {
                        $('.layui-tpl-container2 [name="' + formNames[i] + '"]').val(data[formNames[i]]);
                    } else {
                        $('.layui-tpl-container2 [name="' + formNames[i] + '"]').val('');
                    }
                }
                $('.layui-tpl-container2 [name="' + formNames[i] + '"]').attr("disabled", "").addClass("layui-disabled");
            }
            $('.layui-tpl-container2 [name="warningcode"]').removeAttr("disabled", "").removeClass("layui-disabled");
            $('.layui-tpl-container2 [name="warningvalue"]').removeAttr("disabled", "").removeClass("layui-disabled");
            $('.layui-tpl-container2 [name="risklevelcode"]').removeAttr("disabled", "").removeClass("layui-disabled");
            //$('.layui-tpl-container [name="warninremark"]').removeAttr("disabled", "").removeClass("layui-disabled");
            // 判断实际关闭日期是否填写，若存在，全部不可编辑
            if (data.warningtypecode == "NBYJLX3") {
                $("#warningcodewrapper").hide();
                $("#warninremarkwrapper").hide();
            } else {
                $("#warningcodewrapper").show();
                $("#warninremarkwrapper").show();
            }
            form.render('select', "riskManager");
        });
    }
    // 表单提交
    form.on('submit(manageSave)', function(data) {
        // 获取表单数据
        var d = data.field,
            elem = data.elem;
        delete d.indextypename
        delete d.riskindexname
        delete d.riskname
        delete d.risktypename
        delete d.warningtypename
        delete d.frequency
        $(elem).attr('disabled', true);
        // 发送请求
        admin.req('/api/risk/managementSystem', d, function(data) {
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
            method: 'post'
        });
    });
    // 表单提交
    form.on('submit(manageSave2)', function(data) {
        // 获取表单数据
        var d = data.field,
            elem = data.elem;
        var warningvalueArray = '';
        var warningvalueArray2 = '';
        $('.warningvalue-input').each(function() {
            warningvalueArray += $(this).val() + ",";
        });
        $('.warningvalue-input2').each(function() {
            warningvalueArray2 += $(this).text() + ",";
        });
        if (warningvalueArray.length > 0) {
            warningvalueArray = warningvalueArray.substr(0, warningvalueArray.length - 1);
        }
        if (warningvalueArray2.length > 0) {
            warningvalueArray2 = warningvalueArray2.substr(0, warningvalueArray2.length - 1);
        }
        delete d.indextypename
        delete d.riskindexname
        delete d.riskname
        delete d.risktypename
        delete d.warningtypename
        delete d.frequency
        d.warningvalueArray = warningvalueArray
        d.warningvalueArray2 = warningvalueArray2
        if (d.warningvalueArray == '' || d.warningvalueArray == '') {
            return layer.msg('成功！', {
                icon: 1
            });
        }
        $(elem).attr('disabled', true);
        // 发送请求
        admin.req('/api/risk/managementSystem', d, function(data) {
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
            method: 'post'
        });
    });
    // 导出
    $("#manageExport").click(function() {
        admin.showLoading("body");
        var xhr = new XMLHttpRequest();
        xhr.open('GET', admin.formatUrl("/api/risk/managementSystem/excel?riskcodeList=" + saveArr4.riskcodeList + "&riskindexcodeList=" + saveArr4.riskindexcodeList + "&risktypecode=" + saveArr4.risktypecode + "&indextypecode=" + saveArr4.indextypecode + "&risklevelcode=" + saveArr4.risklevelcode + "&frequency=" + saveArr4.frequency), true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = this.response;
                var filename = '风险管理体系.xls';
                var a = document.createElement('a');
                blob.type = "application/excel";
                var url = URL.createObjectURL(blob);
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
                admin.removeLoading("body");
            }
        };
        xhr.send();
    });
    $("#settings").click(function() {
        popMenu1();
    });
    // 弹出框
    function popMenu(data, path, title, id) {
        admin.popupCenter({
            title: title,
            area: '80%',
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
    // 弹出框
    function popMenu2(data, path, title, id) {
        admin.popupCenter({
            title: title,
            area: '80%',
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
                    setFormValue3(data);
                }
                form.render();
            }
        });
    }
    // 参数设置弹出框
    function popMenu1() {
        admin.popupCenter({
            title: "风险系统参数管理",
            area: ['100%', '100%'],
            path: "components/tpl/risk_manage_tpl_settings.html",
            finish: function() {

            },
            success: function() {
                setFormValue2();
                form.render();
            }
        });
    }

    // 设置风险系统参数表单回显
    function setFormValue2() {
        admin.req("/api/risk/managementSystem/riskSystemParameters", {}, function(res) {
            var data = res.data;
            var inputs = $('.layui-tpl-container').find('input'),
                formNames = ['externalDataUrl', 'internalDataUrl', 'algorithmParameterUrl', 'calculationUrl', 'externalIndexExportingModule', 'internalIndexExportingModule', 'internalIndexExportingByDayModule'];
            for (var i = 0; i < formNames.length; i++) {
                if (data[formNames[i]]) {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val(data[formNames[i]]);
                } else {
                    $('.layui-tpl-container [name="' + formNames[i] + '"]').val('');
                }
            }
        })
    }
    setSearchList();
    renderTable4();
})