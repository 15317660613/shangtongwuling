/*
* Created: 2020-09-15
* Author : zhangqi
* Description: 封装公用方法或组件的js文件
* */

// 基础档案模块通用表格组件
var tableCom = Vue.component('table-com', {
    props: {
        'tableData': {
            type: Array,
            default: []
          },
          'cols' :{
            type: Array,
            default: []
          },
          'tabHeight':{
            type:Number,
            default:480
          }
          
    },
    data: function () {
        return {
            table: {},
        }
    },
    template: '<div class="copmResult result">' +
        ' <div class="layui-btn-container">' +
        '</div>' +
        '<table id="demo" lay-filter="test" name="test"></table>' +
        '</div>',

    mounted: function () {
        var _this = this;
        console.log(_this.tabHeight);
        _this.getTableFunc();
    },
    watch: {
        tableData:function(val){
            console.log(this.tableData,'4545646');
            this.getTableFunc()
        }
    },
    methods: {
        /*
        * author: zhangqi
        * description: 获取表格所有数据，并绘制表格的方法
        * time: 2020/09/16
        */
        getTableFunc: function () {
            var _this = this;
            layui.use('table', function () {
                _this.table = layui.table
                //展示已知数据
                _this.table.render({
                    elem: '#demo',
                    // url: _this.getTableDataUrl,
                    data: _this.tableData,
                    cols: _this.cols,
                    height:_this.tabHeight,
                    cellMinWidth: 80,
                    request: {
                        pageName: 'page', //页码的参数名称，默认：page
                        limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    },
                    page: true, //开启分页
                });

                //执行表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
                
                var $ = layui.$, active = {
                    getCheckData: function(){ //获取选中数据
                        _this.getCheckData()
                    }
                };

                $('.demoTable .layui-btn').on('click', function(){
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });
                
            });
            _this.rowInLineOperationFunc(); 
        }
        ,

        /*
        * author: zhangqi
        * description: 表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
        * time: 2020/09/16
        */
        rowInLineOperationFunc: function () {
            var _this = this;
            //表格行内的操作，包括获取表格单行的数据，表格单行中‘编辑’或‘删除’的方法
            _this.table.on('tool(test)', function (obj) {
                _this.$emit('tableoperation',obj);
            });
        },

        deleteOneTableDataFunc: function () {

        },

        getCheckData: function(){ //获取选中数据
            var _this = this;
            return _this.table.checkStatus('demo');
        }

    },

});
