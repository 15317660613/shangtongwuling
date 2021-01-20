layui.define(['layer', 'form', 'table', 'jquery', 'adc'], function(exports) {
    var $ = layui.$;
    var layer = layui.layer;
    var form = layui.form;
    var table = layui.table;
    var admin = layui.adc;

    var commom = {

        /**
         * 功能描述: 绑定下拉框数据，监听下拉框事件等
         *
         * @param:
         * @return:
         * @auther: quym
         * @date: 2018/10/15 16:07
         */
        select: function(obj) {
            var url = obj.url, //请求数据源的url
                data = obj.requestdata, //请求参数
                type = obj.type ? obj.type : 'get', //请求方法
                parseData = obj.parseData;
            elemIds = obj.elemIds, //select元素集合（可以是单个字符串，或Array）
                dataText = obj.dataText, //select选项的文本字段名
                dataValue = obj.dataValue, //select选项的value字段名
                otherOption = obj.otherOption, //其他选项
                defaultValue = obj.defaultValue, //默认选项值
                func = obj.selectFunc, //下拉框选项监听事件
                isAll = obj.isAll, //是否所有select绑定相同监听事件
                done = obj.done, //渲染完成执行事件
                selectFilter = obj.selectFilter ? obj.selectFilter : obj.elemIds, //自定义的select filter,默认与elemIds同名 (可以是单个字符串，或Array)
                isLocalRender = obj.isLocalRender ? obj.isLocalRender : false, //是否开启局部刷新 默认不开启
                message = obj.errorMessage ? obj.message : "网络异常", //请求异常的message
                response = obj.response ? obj.response : {
                    statusName: 'respCode',
                    statusCode: '0',
                    dataName: 'data',
                    msgName: 'message'
                }; //返回参数名配置
            //发送ajax请求
            admin.req(url, data, function(res) {
                //后台返回数据
                var result;
                if (typeof(res) == 'string') {
                    result = JSON.parse(res);
                } else {
                    result = res;
                }

                //验证状态码
                if (result[response.statusName] != response.statusCode) {
                    layer.alert(result[response.msgName]);
                }

                //格式化返回数据
                var options;
                if (result[response.dataName]) {
                    options = parseData(result[response.dataName]);
                }
                var template = "";

                //加载select的option集合
                if (otherOption) {
                    template = otherOption;
                }

                //循环添加option选项
                for (var index in options) {
                    //默认值
                    if (defaultValue && (options[index][dataValue] == defaultValue || options[index][dataText] == defaultValue)) {
                        template += "<option selected value='" + options[index][dataValue] + "'>" + options[index][dataText] + "</option>";
                    } else {
                        template += "<option value='" + options[index][dataValue] + "'>" + options[index][dataText] + "</option>";
                    }
                }

                //加入option
                if (typeof(elemIds) == 'string') {
                    $("#" + elemIds).html(template);
                } else if (elemIds instanceof Array) {
                    for (var index in elemIds) {
                        $("#" + elemIds[index]).html(template);
                    }
                }

                //是否局部渲染
                if (isLocalRender) {
                    if (typeof(selectFilter) == 'string') {
                        form.render('select', selectFilter);
                    } else if (selectFilter instanceof Array) {
                        for (var index in selectFilter) {
                            form.render('select', selectFilter[index]);
                        }
                    }
                } else {
                    form.render('select');
                }

                //渲染完成事件
                if (done) {
                    done();
                }

                //监听select下拉选项事件
                if (func) {
                    //多绑定事件
                    if (func instanceof Array) {
                        for (var index in func) {
                            //select同一个监听事件(一个select，多个func，只绑定第一个func)
                            if (typeof(selectFilter) == 'string') {
                                form.on("select(" + selectFilter + ")", func[index]);
                                break;
                            } else if (selectFilter instanceof Array) { //select不同的监听 一一对应
                                form.on("select(" + selectFilter[index] + ")", func[index]);
                            }
                        }
                    } else { //单绑定事件
                        if (typeof(selectFilter) == 'string') {
                            form.on("select(" + selectFilter + ")", func);
                        } else if (selectFilter instanceof Array) {
                            for (var index in selectFilter) {
                                if (isAll) {
                                    form.on("select(" + selectFilter[index] + ")", func);
                                } else {
                                    form.on("select(" + selectFilter[index] + ")", func);
                                    break;
                                }
                            }
                        }
                    }

                    //有默认选项 触发select事件
                    if (defaultValue) {
                        //以默认值触发监听事件
                        if (typeof defaultValue != "string" || defaultValue.indexOf("index_", 0) == -1) {
                            if (func instanceof Array) {
                                for (var index in func) {
                                    func[index]({ value: defaultValue });
                                }
                            } else {
                                func({ value: defaultValue });
                            }
                        } else { //以选项的某个选项来触发监听事件
                            var valueIndex = defaultValue.substring(defaultValue.length - 1, defaultValue.length);
                            if (func instanceof Array) {
                                for (var index in func) {
                                    func[index]({ value: options[valueIndex][dataValue] });
                                }
                            } else {
                                func({ value: options[valueIndex][dataValue] });
                            }
                        }
                    }
                }
            }, { method: type });
        },

        /**
         * 功能描述: 渲染表格
         *
         * @param:
         * @return:
         * @auther: quym
         * @date: 2018/10/17 14:36
         */
        table: function(obj) {
            var url = obj.url, //数据源Url
                tableId = obj.tableId, //渲染完table的Id
                contentId = obj.contentId, //容器div的Id
                tableFilter = obj.tableFilter ? obj.tableFilter : contentId, //test是table原始容器的属性 lay-filter="对应的值",默认与Id相同
                limits = obj.limits ? obj.limits : [10, 20, 50, 100, 200], //分页参数 默认10, 20, 50, 100, 200
                cols = obj.cols, //表头及字段绑定
                func = obj.doneFun, //表格渲染完回调函数
                isPage = obj.isBackPage ? obj.isBackPage : false, //是否启用后台分页
                toolBarEvent = obj.toolBarEvent, //头部工具栏事件
                sortEvent = obj.sortEvent, //排序切换事件
                ckboxEvent = obj.ckboxEvent, //选框选择事件
                editEvent = obj.editEvent, //单元格编辑事件
                toolEvent = obj.toolEvent, // 绑定行工具条事件
                method = obj.method ? obj.method : 'post', //请求方式 默认post
                where = obj.where ? obj.where : null, //请求额外参数
                response = obj.response ? obj.response : {
                    statusName: 'respCode',
                    statusCode: '0',
                    dataName: 'data',
                    // countName: 'TotalPackageNum',
                    msgName: 'msg'
                }, //返回参数名配置
                request = obj.request ? obj.request : {
                    pageName: 'page',
                    limitName: 'size'
                }; //请求参数名配置，默认PageIndex,PageSize

            //渲染表格所需参数
            var option = {
                id: tableId,
                elem: '#' + contentId,
                page: true,
                limits: limits,
                cols: cols,
                done: func
            };

            //后台分页添加参数
            if (isPage) {
                option.method = method;
                option.url = url;
                option.where = where;
                option.request = request;
                option.response = response;
                option.contentType = 'application/json';
                option.loading = true;
            } else { //后台不分页添加参数
                admin.req(url, where, function(res) {
                    var data;
                    if (typeof(res) == 'string') {
                        data = JSON.parse(res);
                    } else {
                        data = res;
                    }
                    if (data[response.statusName] == response.statusCode) {
                        option.data = data[response.dataName];
                    }
                }, { method: method, async: false });
            }

            //渲染表格
            table.render(option);
            //监听头工具栏事件
            if (toolBarEvent) {
                table.on('toolbar(' + tableFilter + ')', toolBarEvent);
            }
            //监听排序切换
            if (sortEvent) {
                table.on('sort(' + tableFilter + ')', sortEvent);
            }
            //监听复选框选择
            if (ckboxEvent) {
                table.on('checkbox(' + tableFilter + ')', ckboxEvent);
            }
            //监听单元格编辑
            if (editEvent) {
                table.on('edit(' + tableFilter + ')', editEvent);
            }
            //监听行工具事件
            if (toolEvent) {
                table.on('tool(' + tableFilter + ')', toolEvent);
            }

        },

        /**
         * 功能描述: 获取url中的参数
         *
         * @param:
         * @return: 
         * @auther: quym
         * @date: 2018/10/17 15:27
         */
        getQueryString: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = decodeURI(window.location.search.substr(1)).match(reg);
            if (r != null) return unescape(r[0]);
            return null;
        },

        /**
         * 功能描述: Url参数封装成对象
         *
         * @param:
         * @return:
         * @auther: quym
         * @date: 2018/10/18 15:07
         */
        convertUrlObj: function(url) {
            var str;
            if (url) {
                str = url
            } else {
                str = decodeURI(window.location.search.substr(1));
            }
            var keyValues = str.split('&');
            var obj = {};
            for (var index in keyValues) {
                var keyValue = keyValues[index].split('=');
                obj[keyValue[0]] = keyValue[1];
            }
            return obj;
        },

        /**
         * 功能描述: 二次确认框
         *
         * @param:
         * @return:
         * @auther: quym
         * @date: 2018/10/18 15:30
         */
        confirm: function(message, func) {
            layer.confirm(message, { icon: 3, title: '提示' }, function(index) {
                func();
                layer.close(index);
            });
        },
    };

    exports('common', commom);
});