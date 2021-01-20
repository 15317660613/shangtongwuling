/*
* Created: 2020-09-15
* Author : zhangqi
* Description: 封装公用方法或组件的js文件
* */

//定义表单dom元素的全局变量
var layuiEvent = {}

// 定义中间组件(中转实例)
var transfer = new Vue();

// 定义一个全局的对象变量，用于根据点击主表格的某一行，和下方tabs标签项中的某一项去查询副表格的的数据
var objParam = {
    "parentCode": '', //主表格某一行数据的id
    "childType": "0" //tabs标签项中的位置
}

// 提示语类型的方法(layer提示信息)
function layerInfo(text, type) {
    if (type == 0) { //提示图标为黄色感叹号，一般用于警告的提示语
        layer.msg(text, {
            icon: 0,
            time: 2000,
            shade: 0.5
        });
    }
    if (type == 1) { //提示图标为绿色对勾，一般用于方法执行成功，或接口执行成功的提示语
        layer.msg(text, {
            icon: 1,
            time: 2000,
            shade: 0.5
        });
    }
    if (type == 2) { //提示图标为红色红叉，一般用于方法执行失败，或接口执行失败的提示语
        layer.msg(text, {
            icon: 2,
            shade: 0.5,
            time: 2000,
        });
    }
    if (type == 3) { //提示图标为黄色问号
        layer.msg(text, {
            icon: 3,
            shade: 0.5,
            time: 2000,
        });
    }
    if (type == 4) { //提示图标为灰色锁
        layer.msg(text, {
            icon: 4,
            shade: 0.5,
            time: 0,
        });
    }
    if (type == 5) { //提示图标为红色哭脸
        layer.msg(text, {
            icon: 5,
            shade: 0.5,
            time: 2000,
        });
    }
    if (type == 6) { //提示图标为绿色笑脸
        layer.msg(text, {
            icon: 6,
            shade: 0.5,
            time: 2000,
        });
    }
}

//定义加载layUi表单，接口等方法
//自执行函数
(function () {
    layui.use(['form', 'adc', 'formSelects', 'element', 'laypage'], function () {
        layuiEvent.form = layui.form;
        layuiEvent.admin = layui.adc;
        layuiEvent.formSelects = layui.formSelects;
        layuiEvent.element = layui.element //元素操作
        layuiEvent.laypage = layui.laypage //分页
    });
})()

// 公用的表格和公用的方法
var mainPublicTableAndMethod = Vue.component('main-public-table-and-method', {
    /*
     * description: props参数说明
     * searchParam: 选择的查询条件的对象
     * selectInterfaceArr: 页面顶部查询条件中下拉菜单类型的查询条件的所对应的接口
     * mainFormSelectInterfaceArr: 新增或编辑的表单中下拉菜单类型的查询条件的所对应的接口
     * headData: 表头内容
     * fieldData: 对应字段
     * fixedColumn: 是否固定列
     * isCheckBox: 是否开启多选列
     * isNumber: 是否开启序号列
     * align: 表格内容的对齐方式  left左对齐，center居中对齐，right右对齐
     * operationText: 带有其他操作按钮的列的列名称
     * operationBtnList: 带有其他操作按钮的列中的内容
     * getMainTableAllDataUrl: 获取主表格所有数据的接口地址
     * addMainTableDataUrl: 新增一条主表格数据的接口地址
     * deleteMainTableDataUrl: 删除一条或多条主表格数据的接口地址
     */
    props: ['searchParam', 'selectInterfaceArr', 'mainFormSelectInterfaceArr', 'headData', 'fieldData', 'fixedColumn', 'isCheckBox', 'isNumber', 'align', 'operationText', 'operationFixed', 'operationBtnList',
        'getTableDataUrl', 'addOrEditTableDataUrl', 'publishTableDataUrl', 'deleteTableDataUrl'],
    data: function () {
        return {
            table: {},
            submitFormType: "", //执行表单中提交方法的类型, 判断是新增方法,还是编辑方法, 1-新增 2-编辑
            checkedTableDataId: '', //此变量用于编辑功能时，存储被勾选的数据的ID
            tableData: [],
            columnObj: {},
            columnObjArr: [],
            tableColumn: [],
            size:['700px','450px'],
            layerBox: '' //定义一个弹出框的标识变量名称，这个的作用是用于在接口调用并且方法执行成功之后（例如新增或编辑方法），单独关闭所对应的提示框
        }
    },
    template:
        '<div>' +
        '<table id="main_table" lay-filter="main_test"></table>' +
        '</div>',

    mounted: function () {
        var _this = this;
        //重置全局变量
        objParam = {
            "parentCode": '', //主表格中所选中的数据code码
            "childType": 0
        }
        _this.getSearchDataFunc()
        _this.getFormSelectDataFunc()
        _this.getTableDataFunc()
    },

    methods: {

        /*
        * author: zhangqi
        * description: 获取页面顶部查询条件中，下拉菜单类型的查询条件中的所有数据，这个方法在此js中封装，
        *              可以简化前端页面的代码重复性，当选择好下拉菜单中的数据后，点击查询可以直接根据查询条件获取表格数据
        * time: 2020/09/22
        */
        getSearchDataFunc: function () {
            var _this = this;
            if (_this.selectInterfaceArr != undefined) {
                _this.selectInterfaceArr.forEach(function (ss) {
                    $.each(ss, function (key, val) {
                        layuiEvent.admin.req(val, {}, function (res) {
                                if (res.ok) {
                                    res.data.forEach(function (item) {
                                        $('#' + key).append("<option value='" + item + "'>" + item + "</option>");
                                        layuiEvent.form.render("select");
                                    })
                                    layuiEvent.form.on('select(' + key + ')', function (data) {//对应lay-filter
                                        _this.searchParam[key] = data.value;
                                    })
                                } else {
                                    layerInfo(res.message, 2);
                                }
                            }, {method: 'GET'}
                        );
                    })
                })
            }
        },

        /*
        * author: zhangqi
        * description: 获取新增或编辑的表单中，下拉菜单类型的查询条件中的所有数据，这个方法在此js中封装，
        *              可以简化前端页面的代码重复性，当选择好下拉菜单中的数据后，这样操作还可以直接获取选择的数据，传入接口中
        * time: 2020/09/22
        */
        getFormSelectDataFunc: function () {
            var _this = this;
            if (_this.mainFormSelectInterfaceArr != undefined) {
                _this.mainFormSelectInterfaceArr.forEach(function (ss) {
                    $.each(ss, function (key, val) {
                        layuiEvent.admin.req(val, {}, function (res) {
                                if (res.ok) {
                                    res.data.forEach(function (item) {
                                        $('#' + key).append("<option value='" + item + "'>" + item + "</option>");
                                        layuiEvent.form.render("select");
                                    })
                                } else {
                                    layerInfo(res.message, 2);
                                }
                            }, {method: 'GET'}
                        );
                    })
                })
            }
        },

        /*
        * author: zhangqi
        * description: 根据查询条件，获取表格数据
        * time: 2020/09/21
        */
        getTableDataFunc: function () {
            var _this = this;
            _this.tableData = {};
            //调用新增接口，新增数据
            layuiEvent.admin.req(_this.getTableDataUrl, _this.searchParam, function (res) {
                    if (res.ok) {
                        _this.tableData = res.data.records;
                        //执行拼接绘制渲染表格的方法
                        _this.drawTableFunc();
                    } else {
                        layerInfo(res.message, 2);
                    }
                }, {method: 'GET'}
            )
        },
        /*
         * author: zhangqi
         * description: 重置查询条件
         * time: 2020/09/22
         */
        resetSearchParamFunc: function () {
            var _this = this;
            Object.keys(_this.searchParam).forEach(function (item) {
                _this.searchParam[item] = '';
            })
            _this.getTableDataFunc()
        },

        /*
        * author: zhangqi
        * description: 拼接绘制渲染表格
        * time: 2020/09/16
        */
        drawTableFunc: function () {
            var _this = this;
            _this.tableColumn = [];
            _this.columnObjArr = [];
            //判断表格是否开启多选列，如果开启在表格中添加多选列
            if (_this.isCheckBox) {
                _this.tableColumn.push({type: 'checkbox', fixed: 'left'})
            }
            //判断表格是否开启序号列，如果开启在表格中添加序号列
            if (_this.isNumber) {
                _this.tableColumn.push({type: 'numbers', title: '序号', fixed: 'left', event: 'setSign'})
            }

            //判断表格是否开启操作列，如果开启在表格中添加操作列
            // if (_this.operationBtnList.length != 0) {
            //     var text = '';
            //     _this.operationBtnList.forEach(function (item) {
            //         return text += "<button  type='' class='" + item.classed + "' lay-event= " + item.trigger + " > " + item.name + " </button>"
            //     })
            //     _this.tableColumn.push(
            //         {
            //             title: _this.operationText,
            //             align: _this.align,
            //             fixed: _this.operationFixed,
            //             templet: function (res) {
            //                 return text
            //             }
            //         }
            //     )
            // }

            // 循环表头数据，整合绘制表格所需要的数据格式
            _this.headData.forEach(function (item) {
                _this.columnObj = {title: item, align: _this.align, event: 'setSign'}
                _this.columnObjArr.push(_this.columnObj);
                _this.columnObj = {};
            });

            // 循环数据字段的数组，赋值给中间变量数组中的字段，整合绘制表格所需要的数据格式
            _this.fieldData.forEach(function (item, index) {
                _this.columnObjArr[index].field = item;
            });

            // 循环是否固定列的数组，赋值给中间变量数组中的字段，整合绘制表格所需要的数据格式
            if (_this.fixedColumn != undefined) {
                _this.fixedColumn.forEach(function (item, index) {
                    _this.columnObjArr[index].fixed = item;
                });
            }

            // 循环中间变量数组，将数组中的每一条数据添加进新的数组中，然后新的数组是表格所需要的并且已经整理好格式的数据
            _this.columnObjArr.forEach(function (item) {
                _this.tableColumn.push(item)
            });

            layui.use('table', function () {
                _this.table = layui.table
                //展示已知数据
                _this.table.render({
                    elem: '#main_table',
                    data: _this.tableData,
                    page: true,
                    cols: [_this.tableColumn],
                    cellMinWidth: 120,
                    request: {
                        pageName: 'page', //页码的参数名称，默认：page
                        limitName: 'limit' //每页数据量的参数名，默认：limit
                    },
                });

                // layuiEvent.laypage.render({
                //     elem: '#pageDemo',
                //     count: 100,//总页数
                //     skin: '#1E9FFF', //自定义选中色值
                //     skip: true, //开启跳页
                //     jump: function (obj, first) {
                //         console.log(obj);
                //     },
                // });

                //主表格顶部操作，包括获取新增表格数据，批量或单条删除表格数据与
                //主表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
                _this.rowInLineOperationFunc();
            });
        },

        /*
        * author: zhangqi
        * description: 主表格顶部操作，包括获取新增表格数据，批量或单条删除表格数据与
        *              主表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
        * time: 2020/09/17
        */
        rowInLineOperationFunc: function () {
            var _this = this;
            //表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
            _this.table.on('tool(main_test)', function (obj) {
                var data = obj.data;
                if (obj.event === 'setSign') {
                    objParam.parentCode = data.partCode;
                    transfer.$emit('transferParam', objParam);
                    // layer.alert(JSON.stringify(data), {
                    //     title: '当前行数据：'
                    // });
                }
            });
        },

        /**
         * description:点击表格上方‘新增’按钮执行的方法
         * author:zhangqi
         * time: 2020-09-16
         */
        addDataFunc: function (size) {
            var _this = this;
            size = size||_this.size;
            //给表单中提交方法的类型的变量赋值, 判断是新增方法,还是编辑方法, 1-新增 2-编辑
            _this.submitFormType = 1;
            //清空表单中所有内容，
            document.getElementById("layui-form").reset();
            _this.layerBox = layer.open({
                type: 1,
                title: '新增',
                closeBtn: 1,
                area: [size.width+'px', size.height+'px'],
                shade: false,
                shadeClose: false,
                content: $("#layui-form")
            });
        },
        /**
         * description:点击表格上方‘返回当前表格选中行数据集合’按钮执行的方法
         * author:linzijian
         * time: 2020-09-16
         */
        seeDataFunc: function (size,domId,callBack) {
            var _this = this;
            size = size||_this.size;
            var checkStatus = _this.table.checkStatus('main_table');
            if (checkStatus.data.length == 0) {
                layer.alert('请先勾选一条数据', {
                    title: '提示',
                    icon: 5,
                    btn: ['关闭']
                });
                return false
            } else if (checkStatus.data.length > 1) {
                layer.alert('只能选择一条数据进行编辑', {
                    title: '提示',
                    icon: 5,
                    btn: ['关闭']
                });
                return false
            } else {
                layuiEvent.admin.req(_this.getTableDataUrl, {}, function (res) {
                        if (res.ok) {
                            callBack &&callBack(res.data)
                        } else {
                            layerInfo(res.message, 2);
                        }
                    }, {method: 'GET'}
                )
                _this.layerBox = layer.open({
                    type: 1,
                    title: '新增',
                    closeBtn: 1,
                    area: [size.width+'px', size.height+'px'],
                    shade: false,
                    shadeClose: false,
                    content: $("#"+domId)
                });
            }
        },
        /*
        * author: zhangqi
        * description: 主表格顶部编辑按钮执行的方法
        * time: 2020/09/21
        */
       editDataFunc: function (size) {
        var _this = this;
        size = size||_this.size;
        //给表单中提交方法的类型的变量赋值, 判断是新增方法,还是编辑方法, 1-新增 2-编辑
        _this.submitFormType = 2;
        //获取表格中被勾选的数据的集合
        var checkStatus = _this.table.checkStatus('main_table')
        //data是一个数组，数组中的元素是表格中被勾选所有数据
        var data = checkStatus.data;
        if (data.length == 0) {
            layer.alert('请先勾选一条数据', {
                title: '提示',
                icon: 5,
                btn: ['关闭']
            });
            return false
        } else if (data.length > 1) {
            layer.alert('只能选择一条数据进行编辑', {
                title: '提示',
                icon: 5,
                btn: ['关闭']
            });
            return false
        } else {
            _this.layerBox = layer.open({
                type: 1,
                title: '编辑',
                closeBtn: 1,
                area: [size.width+'px', size.height+'px'],
                shade: false,
                shadeClose: false,
                content: $("#layui-form")
            });
            //表单赋值
            layuiEvent.form.val('example', data[0]);
            _this.checkedTableDataId = data[0].id;
        }
    },

        /**
         * description:提交表单数据
         * author:zhangqi
         * time: 2020-09-16
         */
        submitFormFunc: function () {
            var _this = this;
            layuiEvent.form.on('submit(main_form)', function (data) {
                // layer.alert(JSON.stringify(data.field), {
                //     title: '最终的提交信息'
                // })
                if (_this.submitFormType == 1) {
                    //调用新增接口，新增数据
                    layuiEvent.admin.req(_this.addOrEditTableDataUrl, data.field, function (res) {
                            if (res.ok) {
                                layerInfo("数据新增成功", 1);
                                layer.close(_this.layerBox);
                                _this.getTableDataFunc();
                            } else {
                                layerInfo(res.message, 2);
                            }
                        }, {method: 'POST'}
                    )
                } else if (_this.submitFormType == 2) {
                    var obj = JSON.parse(JSON.stringify(data.field))
                    obj.id = _this.checkedTableDataId;
                    layuiEvent.admin.req(_this.addOrEditTableDataUrl, obj, function (res) {
                            if (res.ok) {
                                layerInfo("数据编辑成功", 1);
                                layer.close(_this.layerBox);
                                _this.getTableDataFunc();
                            } else {
                                layerInfo(res.message, 2);
                            }
                        }, {method: 'POST'}
                    )
                }
                return false
            });
        },

        /**
         * author: zhangqi
         * description: 主表格顶部发布按钮执行的方法
         * time: 2020/09/17
         */
        publishDataFunc: function () {
            var _this = this;
            //获取表格中被勾选的数据的集合
            var checkStatus = _this.table.checkStatus('main_table')
            var data = checkStatus.data;
            //判断当前是否有选中数据
            if (data.length == 0) {
                layer.alert('请先勾选一条数据', {
                    title: '提示',
                    icon: 5,
                    btn: ['关闭']
                });
            } else {
                layer.alert('确认要发布已勾选的数据吗？', {
                    title: '删除',
                    icon: 3,
                    btn: ['确定', '关闭'],
                    area: ['400px', '200px'], //宽高
                }, function () {
                    //获取每条数据的id，并添加进新的数组中
                    var ids = []
                    data.forEach(function (item) {
                        ids.push(item.id)
                    });
                    //调用删除接口，删除数据
                    layuiEvent.admin.req(_this.publishTableDataUrl, ids, function (res) {
                            if (res.ok) {
                                layerInfo("数据发布成功", 1);
                                _this.getTableDataFunc();
                            } else {
                                layerInfo(res.message, 2);
                            }
                        }, {method: 'POST'}
                    );
                });
            }
        },

        /**
         * author: zhangqi
         * description: 主表格顶部删除按钮执行的方法
         * time: 2020/09/17
         */
        deleteDataFunc: function () {
            var _this = this;
            //获取表格中被勾选的数据的集合
            var checkStatus = _this.table.checkStatus('main_table')
            var data = checkStatus.data;
            // layer.alert(JSON.stringify(data));
            //当点击删除按钮时，判断当前是否有选中数据
            if (data.length == 0) {
                layer.alert('请先勾选一条数据', {
                    title: '提示',
                    icon: 5,
                    btn: ['关闭']
                });
            } else {
                layer.alert('确认要删除已勾选的数据吗？', {
                    title: '删除',
                    icon: 3,
                    btn: ['确定', '关闭'],
                    area: ['400px', '200px'], //宽高
                }, function () {
                    //获取每条数据的id，并添加进新的数组中
                    var ids = []
                    data.forEach(function (item) {
                        ids.push(item.id)
                    });
                    //调用删除接口，删除数据
                    layuiEvent.admin.req(_this.deleteTableDataUrl, {"ids": ids}, function (res) {
                            if (res.ok) {
                                layerInfo("数据删除成功", 1);
                                _this.getTableDataFunc();
                                //重置全局变量
                                objParam = {
                                    "parentCode": '', //主表格中所选中的数据code码
                                    "childType": 0
                                }
                                transfer.$emit('transferParam', objParam);
                            } else {
                                layerInfo(res.message, 2);
                            }
                        }, {method: 'DELETE'}
                    );
                });
            }
        }
    },
});


var tabsIndex = 0 //全局变量，当前选中的tabs的下标

// tabs标签切换的组件
var tabsAssembly = Vue.component('tabs-assembly', {
    props: ['tabsList'],
    data: function () {
        return {}
    },
    template: '<div class="layui-tab layui-tab-brief" lay-filter="tabs_demo">' +
        '<ul class="layui-tab-title g-tabs-div">' +
        '<li v-for="i in tabsList">{{i}}</li>' +
        '</ul>' +
        '</div>',

    mounted: function () {
        var _this = this;

        //初始化副表格的tabs页签，加载tabs模块时，默认定位下标数是0的第一个tabs标签
        tabsIndex = 0;

        $('.layui-tab-title li').eq(0).addClass('layui-this').siblings().removeClass('layui-this')
        //执行点击切换tabs标签，获得当前选中的tabs的数据的方法
        _this.getChangeTabsDataFunc();

    },
    methods: {
        /**
         * author: zhangqi
         * description: 点击切换tabs标签，获得当前选中的tabs的数据
         * time: 2020/09/23
         */
        getChangeTabsDataFunc: function () {
            var _this = this;
            layuiEvent.element.on('tab(tabs_demo)', function (data) {
                tabsIndex = data.index;
                objParam.childType = tabsIndex
                transfer.$emit('transferParam', objParam);
                // layer.tips('切换了 ' + tabsIndex + '：' + this.innerHTML, this, {
                //     tips: 1
                // });
            });
        },
    }
});


// 副表格部分和公用的方法
var vicePublicTableAndMethod = Vue.component('vice-public-table-and-method', {
    props: ['viceTableHeadObj', 'viceTableInterfaceUrl', 'isCheckBox', 'isNumber', 'align'],
    data: function () {
        return {
            searchViceObj: {}, //用户存放查询副表格数据的对象的变量
            table: {},
            submitFormType: "", //执行表单中提交方法的类型, 判断是新增方法,还是编辑方法, 1-新增 2-编辑
            checkedTableDataId: '', //此变量用于编辑功能时，存储被勾选的数据的ID
            tableData: [],
            columnObj: {},
            columnObjArr: [],
            tableColumn: [],
            layerBox: '' //定义一个弹出框的标识变量名称，这个的作用是用于在接口调用并且方法执行成功之后（例如新增或编辑方法），单独关闭所对应的提示框
        }
    },
    template:
        '<div>' +
        '<table id="vice_table" lay-filter="vice_test"></table>' +
        '</div>',

    created: function () {
        var _this = this;
        transfer.$off('transferParam');
        transfer.$on("transferParam", function (msg) {
            _this.searchViceObj = {};
            _this.searchViceObj = msg;
            _this.getViceTableDataFunc();
        });
    },
    beforeDestroy() {
        transfer.$off('transferParam');
    },
    methods: {

        getViceTableDataFunc: function () {
            var _this = this;
            _this.tableData = {};
            //调用新增接口，新增数据
            layuiEvent.admin.req(_this.viceTableInterfaceUrl, _this.searchViceObj, function (res) {
                    if (res.ok) {
                        _this.tableData = res.data;
                        //执行拼接绘制渲染表格的方法
                        _this.drawTableFunc();
                    } else {
                        layerInfo(res.message, 2);
                    }
                }, {method: 'GET'}
            )
        },

        /*
        * author: zhangqi
        * description: 拼接绘制渲染表格
        * time: 2020/09/16
        */
        drawTableFunc: function () {
            var _this = this;
            _this.tableColumn = [];
            _this.columnObjArr = [];
            //判断表格是否开启多选列，如果开启在表格中添加多选列
            if (_this.isCheckBox) {
                _this.tableColumn.push({type: 'checkbox', fixed: 'left'})
            }
            //判断表格是否开启序号列，如果开启在表格中添加序号列
            if (_this.isNumber) {
                _this.tableColumn.push({type: 'numbers', title: '序号', fixed: 'left'})
            }

            // 循环对象中的数组获取表头数据，整合绘制表格所需要的数据格式
            _this.viceTableHeadObj[tabsIndex][0].forEach(function (item) {
                _this.columnObj = {title: item, align: _this.align, event: 'setSign'}
                _this.columnObjArr.push(_this.columnObj);
                _this.columnObj = {}
            })

            // 循环数据字段的数组，赋值给中间变量数组中的字段，整合绘制表格所需要的数据格式
            _this.viceTableHeadObj[tabsIndex][1].forEach(function (item, index) {
                _this.columnObjArr[index].field = item;
            })

            // 循环是否固定列的数组，赋值给中间变量数组中的字段，整合绘制表格所需要的数据格式
            if (_this.fixedColumn != undefined) {
                _this.fixedColumn.forEach(function (item, index) {
                    _this.columnObjArr[index].fixed = item;
                });
            }

            // 循环中间变量数组，将数组中的每一条数据添加进新的数组中，然后新的数组是表格所需要的并且已经整理好格式的数据
            _this.columnObjArr.forEach(function (item) {
                _this.tableColumn.push(item)
            });
            //_this.tableColumn.concat(_this.columnObjArr)

            layui.use('table', function () {
                _this.table = layui.table
                //展示已知数据
                _this.table.render({
                    elem: '#vice_table',
                    // url: _this.getTableDataUrl,
                    data: _this.tableData,
                    cols: [_this.tableColumn],
                    cellMinWidth: 120,
                    request: {
                        pageName: 'count', //页码的参数名称，默认：page
                        limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    },
                    page: true, //开启分页
                });
            });
        },
    }
});
