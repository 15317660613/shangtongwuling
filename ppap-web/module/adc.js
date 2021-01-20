/*
 * File   : admin.js
 * Created: Monday September 3rd 2018 3:36:39 pm
 * Author : yuchunyu97
 * License: MIT License
 * 
 * Copyright (c) 2018 yuchunyu97
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
 * Last Modified: Monday October 29th 2018 10:09:06 am
 * Modified By  : yuchunyu97 at <yuchunyu97@gmail.com>
 * -----
 * Description: 
 * -----
 * HISTORY:
 */

layui.define(['config', 'layer'], function (exports) {
    var config = layui.config;
    var layer = layui.layer;
    var popupRightIndex, popupCenterIndex, popupCenterParam;

    var tableCache = [];
    var loading = false;

    var admin = {
        /**
         * 将侧边栏设置成为折叠状态
         *
         * @param {*} expand Boolean
         * @returns
         */
        flexible: function (expand) {
            var isExapnd = $('.layui-layout-admin').hasClass('admin-nav-mini');
            if (isExapnd == !expand) {
                return;
            }
            if (expand) {
                $('.layui-layout-admin').removeClass('admin-nav-mini');
            } else {
                $('.layui-layout-admin').addClass('admin-nav-mini');
            }
            admin.onResize();

            // PC 侧边栏变化后，重新渲染表格
            for (var i = 0; i < tableCache.length; i++) {
                (function (value) {
                    setTimeout(function () {
                        layui.table.reload(value);
                    }, 300);
                })(tableCache[i]);
            }
        },

        /**
         * 添加数据表格 ID
         *
         * @param {*} value ID
         */
        addTableCache: function (value) {
            tableCache.push(value);
        },


        /**
         * 定义ppap非菜单路由url   马 3-11
         */
        menuNoRoute:function () {
           var arr = ['task-view-ppap-supplier','OPAP','OPAP1','OPAP2','project9','project10','project11','task-second-ppap-supplier','task-view-ppap','project2','project1']
           return arr
        },

        /**
         * 设置导航栏选中
         *
         * @param {*} url #! 后面的东西
         */
        activeNav: function (url) {
            //debugger;
            //by ma 2019/03/10
            var arr = admin.menuNoRoute();
            if (!arr.includes(url)) {
                sessionStorage.setItem('menuUrl', url);
                $('.layui-layout-admin .layui-side .layui-nav .layui-nav-item .layui-nav-child dd').removeClass('layui-this');
                $('.layui-layout-admin .layui-side .layui-nav .layui-nav-item').removeClass('layui-this');
                if (url && url != '') {
                    $('.layui-layout-admin .layui-side .layui-nav .layui-nav-item').removeClass('layui-nav-itemed');
                    var $a = $('.layui-layout-admin .layui-side .layui-nav>.layui-nav-item>.layui-nav-child>dd>a[href="#!' + url + '"]');
                    $a.parent('dd').addClass('layui-this');
                    $a.parent('li').addClass('layui-this');
                    $a.parent('dd').parent('.layui-nav-child').parent('.layui-nav-item').addClass('layui-nav-itemed');
                    var $b = $('.layui-layout-admin .layui-side .layui-nav>.layui-nav-item>.layui-nav-child>dd>dl>dd>a[href="#!' + url + '"]');
                    $b.parent('dd').addClass('layui-this');
                    $b.parent('dd').parent('.layui-nav-child').parent('li').addClass('layui-this');
                    $b.parent('dd').parent('.layui-nav-child').parent('dd').parent('.layui-nav-child').parent('.layui-nav-item').addClass('layui-nav-itemed');
                    var $c = $('.layui-layout-admin .layui-side .layui-nav>.layui-nav-item>.layui-nav-child>dd>dl>dd>dl>dd>a[href="#!' + url + '"]');
                    $c.parent('dd').addClass('layui-this');
                    //$c.parent('dd').parent('.layui-nav-child').parent('dd').parent('.layui-nav-child').parent('li').addClass('layui-this');
                    $c.parent('dd').parent('.layui-nav-child').parent('dd').addClass('layui-nav-itemed');
                    $c.parent('dd').parent('.layui-nav-child').parent('dd').parent('.layui-nav-child').parent('dd').addClass('layui-nav-itemed');
                    $c.parent('dd').parent('.layui-nav-child').parent('dd').parent('.layui-nav-child').parent('dd').parent('.layui-nav-child').parent('.layui-nav-item').addClass('layui-nav-itemed');
                }
            }
        },

        /**
         * 右侧弹出框
         *
         * @param {*} path
         * @returns
         */
        popupRight: function (path) {
            var param = new Object();
            param.path = path;
            param.id = 'adminPopupR';
            param.title = false;
            param.anim = 2;
            param.isOutAnim = false;
            param.closeBtn = false;
            param.offset = 'r';
            param.shadeClose = true;
            param.area = '336px';
            param.skin = 'layui-layer-adminRight';
            param.end = function () {
                layer.closeAll('tips');
            };
            popupRightIndex = admin.open(param);
            return popupRightIndex;
        },
        /**
         * 关闭右侧弹出框
         *
         */
        closePopupRight: function () {
            layer.close(popupRightIndex);
        },

        /**
         * 封装 layer.open
         *
         * admin.open({
         *  title: 'xxx',
         *  path: 'system/user_form.html',
         *  success: function(){
         *  
         *  }
         * });
         *
         * path是新增的参数，其他参数均为layer.open的参数，
         * 但是type和content参数无效，type固定是1（页面层）， content会被path的内容覆盖，
         * open没有finish方法，popupCenter才有。
         *
         * @param {*} param
         * @returns
         */
        open: function (param) {
            var sCallBack = param.success;
            param.type = 1;
            if (window.innerWidth < 450) {
                var defaultWidth = '80%';
            } else {
                var defaultWidth = '450px';
            }
            param.area = param.area ? param.area : defaultWidth;
            param.offset = param.offset ? param.offset : 'auto';
            param.resize ? param.resize : false;
            param.shade ? param.shade : .2;
            param.success = function (layero, index) {
                $(layero).children('.layui-layer-content').load(param.path, function () {
                    sCallBack ? sCallBack(layero, index) : '';

                    var elem = $('#adminPopupC');
                    if (elem.length) {
                        var h = $(elem[0]).height() + 43,
                            winH = window.innerHeight;
                        elem.parent().css('top', (winH - h) / 2 + 'px');
                    }
                });
            };
            return layer.open(param);
        },

        /**
         * 中间弹出框
         *
         * admin封装的popupCenter虽然没有什么特别的样式，但是带有回调的功能。
         *
         * admin.popupCenter({
         *  title: '添加用户',
         *  path: 'components/system/user_form.html',
         *  finish: function () {
         *      // 这个方法就是回调的功能，用户添加成功之后让表格reload
         *      table.reload('user-table', {});  
         *  },
         *      success: function() {
         *      // user_form.html成功渲染到弹窗中
         *  },
         *  end: function() {
         *      // 弹窗关闭
         *  }
         * });
         *
         * @param {*} param
         * @returns
         */
        popupCenter: function (param) {
            param.id = 'adminPopupC';
            popupCenterParam = param;
            popupCenterIndex = admin.open(param);
            return popupCenterIndex;
        },
        /**
         * 关闭中间弹出并且触发finish回调
         *
         */
        finishPopupCenter: function () {
            layer.close(popupCenterIndex);
            popupCenterParam.finish ? popupCenterParam.finish() : '';
        },
        /**
         * 关闭中间弹出
         *
         */
        closePopupCenter: function () {
            layer.close(popupCenterIndex);
        },

        /**
         * 封装ajax请求，返回数据类型为json
         *
         * admin.req('user', {
         *  userId: 'xxx',
         *  userName: '张三'
         *  }, function (data) {
         *      console.log(JSON.stringify(data));
         *  }, {method: 'POST'});
         *
         * @param {*} url
         * @param {*} data
         * @param {*} success
         * @param {*} param 其他 ajax 参数，对象
         */
        req: function (url, data, success, param) {
            if (param && param.method && param.method.toLowerCase() !== 'get') {
                data = JSON.stringify(data);
            }

            admin.ajax($.extend({
                url: admin.formatUrl(url),
                data: data,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                success: success
            }, param));
        },
        /**
         * 封装ajax请求
         *
         * @param {*} param
         */
        ajax: function (param) {
            // 处理一些错误
            if (!param.error) {
                param.error = function (xhr) {
                    if (xhr.status === 404) {
                        // 可能是登录信息失效，跳转到登录页
                        layer.msg('Error 404');
                    } else if (xhr.status === 401) {
                        layer.msg('无相关权限：' + xhr.responseJSON.message);
                    } else if (xhr.status === 502 || xhr.status === 504) {
                        layer.msg('后台服务不可用，请稍后再试');
                        config.removeAccount();
                        // location.replace('./login.html?redirect_to=' + window.location.hash);
                    }
                };
            }
            $.ajax(param);
        },

        /**
         * 窗口大小改变监听
         * 处理表格重新渲染
         * 暂时禁用该方法
         * 有待优化
         *
         */
        onResize: function () {
            if (config.autoRender) {
                if ($('.layui-table-view').length > 0) {
                    setTimeout(function () {
                        admin.events.refresh();
                    }, 800);
                }
            }
        },

        resize: function () {
            // 触发 window 的 resize 事件，适应表格尺寸
            $(window).trigger("resize");
        },

        /**
         * 显示加载动画
         *
         * @param {*} element
         */
        showLoading: function (element) {
            if (loading) return;
            loading = true;
            element = admin._loadingElem(element);
            $(element).append('<div class="admin-loading" style=""><i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i></div>');
        },
        /**
         * 移除加载动画
         *
         * @param {*} element
         */
        removeLoading: function (element) {
            element = admin._loadingElem(element);
            setTimeout(function () {
                $(element + '>.admin-loading').remove();
                loading = false;
            }, 300);
        },

        _loadingElem: function (element) {
            if (typeof element === 'number' || !element) {
                switch (element) {
                    case 1:
                        element = '#adminPopupC';
                        break;
                    case 2:
                        element = '.layui-body';
                        break;

                    default:
                        element = 'body';
                        break;
                }
            }
            return element;
        },

        /**
         * 格式化 URL，在后面加时间戳，兼容 IE
         *
         * @param {*} url
         * @returns
         */
        formatUrl: function (url) {
            url = config.base_server + url;
            var d = new Date();
            if (url.indexOf('?') < 0) {
                url = url + '?_ts=' + d.getTime();
            } else {
                url = url + '&_ts=' + d.getTime();
            }
            return encodeURI(url);
        },

        /**
         * 将 id pid 类型的数据转换为 树形数据
         *
         * @param {*} data
         * @param {*} param
         * @returns
         */
        toTree: function (data, param) {
            if (!param) param = {};
            param.id = param.id ? param.id : 'id';
            param.pid = param.pid ? param.pid : 'parentId';
            param.root = param.root ? param.root : '0';
            param.children = param.children ? param.children : 'children';
            // 循环
            var NOW;
            for (var i = 0; i < data.length; i++) {
                var itemI = data[i];
                if (itemI[param.pid] === param.root) {
                    NOW = i;
                    continue;
                }
                for (var j = 0; j < data.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    var itemJ = data[j];
                    if (itemI[param.pid] === itemJ[param.id]) {
                        if (!itemJ[param.children] || Object.prototype.toString.call(itemJ[param.children]) !==
                            '[object Array]') {
                            itemJ[param.children] = [];
                        }
                        itemJ[param.children].push(itemI);
                        break;
                    }
                }
            }
            return [data[NOW]];
        },

        /**
         * 刷新
         *
         */
        refresh: function () {
            Q.refresh();
        },

        /**
         * 注册非菜单的路由信息
         *
         * @param {*} hash 浏览器地址内的 hash 值，即路由路径
         * @param {*} path 文件地址，通常组件放在 components/ 目录下，也可自定义
         * @param {*} name 页面名称
         */
        regRouter: function (hash, path, name) {
            Q.reg(hash, function () {
                // 通常组件放在 components/ 目录下，也可自定义
                layui.index.loadView(hash, path, name, '00000000');
            });
        },

        /**
         * @Desc 为对象或数组去空去undefined
         * @Param data: 需要去空去undefined对象
         * @Date 2018-12-18 11:26:48
         * @Author qitian
         */
        redefinedForObject: function (obj) {
            if (obj) {
                if (obj instanceof Array) {
                    if (obj.length > 0) {
                        for (var i =0,len = obj.length;i < len;i++) {
                            var item = obj[i];
                            if (item instanceof String || item instanceof Number || !item) {
                                if (!item || item == 'null') {
                                    item = '';
                                }
                            } else {
                                //递归调用
                                item = admin.redefinedForObject(item);
                            }
                        }
                    }
                } else if (obj instanceof Object) {
                    //var keys = Object.getOwnPropertyNames(obj);
                    for (var key in obj) {
                        if (obj[key] instanceof String || obj[key] instanceof Number || !obj[key]) {
                            if (!obj[key] || obj[key] == 'null') {
                                obj[key] = '';
                            }
                        } else {
                            //递归调用
                            obj[key] = admin.redefinedForObject(obj[key]);
                        }
                    }
                }
                return obj;
                console.log(obj)
            }
        },

        /**
         * @Desc 多选框监听事件【注意在渲染函数（initMultipleSelect）之前需调用listenMultipleSelect监听事件，一个页面监听一次即可】
         * @Param callback: 回调事件，如果没有，不传即可
         * @Date 2018-12-23 14:44:25
         * @Author qitian
         */
        listenMultipleSelect: function (callback) {
            $(".downpanel").on("click",".self-select-title",function(e){
                var $select=$(this).parents(".layui-form-select");
                if ($select.hasClass('layui-form-selected')) {
                    $select.removeClass("layui-form-selected");
                } else {
                    !$(".layui-form-select").not(this).removeClass('layui-form-selected');
                    $select.addClass("layui-form-selected");
                }
                e.stopPropagation();
            }).on("click",".layui-anim-upbit .layui-form-checkbox",function(e){
                var itemName = $(e.currentTarget).parent().parent().attr('id');
                //监听checkbox选择事件
                //防止冒泡
                e.stopPropagation();
                var checkeds = $(e.currentTarget).parent().parent().prev().children().val()//获取历史选中的所有值
                    ,checkList = [];//现选中的值
                if (checkeds) {
                    checkList = checkeds.split(',');
                }
                //判断是否选中
                if ($(e.currentTarget).hasClass('layui-form-checked')) {
                    checkList.push(e.currentTarget.textContent);
                } else {
                    //console.log(admin111)
                    checkList.forEach(function (item, index) {
                        if (item === e.currentTarget.textContent) {
                            checkList.splice(index, 1);
                        }
                    })
                }
                //文本框赋值
                var str = '';
                checkList.forEach(function (item, index) {
                    if (index < checkList.length - 1) {
                        str += item + ',';
                    } else {
                        str += item;
                    }

                });
                $(e.currentTarget).parent().parent().prev().children().val(str);
                //防止文本框内内容过长遮挡问题
                $(e.currentTarget).parent().parent().prev().children().attr('title',str);
                if (callback && itemName == 'projectmodel') {
                    callback();
                }
            });
        },

        /**
         * @Desc 多选框重置,parentDom:所有搜索项的最外层选择器
         * @Date 2018-12-23 14:44:25
         * @Author qitian
         */
        resetMultipleSelect: function (parentDom) {
            $(parentDom+' .layui-form-checkbox').each(function (index, item) {
                $(item).removeClass('layui-form-checked');
                $(item).prev().removeAttr('checked');
                $(item).parent().parent().prev().children().val('');
            });
        },

        /**
         * @Desc 多选框渲染 ，【注意在渲染之前需调用listenMultipleSelect监听事件，一个页面监听一次即可】
         * 此多选下拉框依赖页面样式，如果想使用此多选下拉框，多选下拉框使用：
         * * * <div class="layui-select-title self-select-title ">
         * * *        <input type="text" placeholder="请选择" value=""  name="alert"  class="layui-input layui-unselect params-item" id="search-input-alert">
         ** *  </div>
         ** *  <dl class="layui-anim layui-anim-upbit" style="" id="alert"></dl>
         * @Param selName: 渲染元素id,data:渲染数据;checkedItem:默认选中的数据，形式为‘1，2，3’
         * @Date 2018-12-23 14:44:25
         * @Author qitian
         */
        initMultipleSelect: function (selName, data, checkedItem) {
            var form = layui.form;
            $('#'+selName).empty();
            if (data.length > 0) {
                var checkList = [];
                // $('#'+selName).append('<dd><input type="checkbox" name="'+selName+'" class="check-all" title="全部" lay-filter="chooseAllPeroson" value="" lay-skin="primary" ></dd>');
                /*for (var item of data) {*/
                for (var i = 0,len = data.length; i < len;i++) {
                    var item = data[i];
                    if (item) {
                        var list = checkedItem ? checkedItem.split(',') : [];
                        if (checkedItem && list.includes(item)) {
                            $('#'+selName).append('<dd><input type="checkbox" name="'+selName+'" title="' + item + '" checked value="' + item + '" lay-skin="primary" ></dd>');
                            checkList.push(item);
                        } else {
                            $('#'+selName).append('<dd><input type="checkbox" name="'+selName+'" title="' + item + '" value="' + item + '" lay-skin="primary" ></dd>');
                        }
                    }
                }
                //文本框赋值
                var str = '';
                checkList.forEach(function (item, index) {
                    if (index < checkList.length - 1) {
                        str += item + ',';
                    } else {
                        str += item;
                    }
                });
                $('#'+selName).prev().children().val(str);
                //防止文本框内内容过长遮挡问题
                $('#'+selName).prev().children().attr('title',str);
                form.render('checkbox');
            } else {
                $('#'+selName).append('<dd>没有选项</dd>');
            }
        }
    };

    // ewAdmin提供的事件
    admin.events = {
        flexible: function (e) { // 折叠侧导航
            var expand = $('.layui-layout-admin').hasClass('admin-nav-mini');
            admin.flexible(expand);
        },
        refresh: function () { // 刷新主体部分
            admin.refresh();
        },
        back: function () { //后退
            history.back();
        },
        theme: function () { // 设置主题
            admin.popupRight('components/tpl/theme.html');
        },
        fullScreen: function (e) { // 全屏
            var ac = 'layui-icon-screen-full',
                ic = 'layui-icon-screen-restore';
            var ti = $(this).find('i');

            var isFullscreen = document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || false;
            if (isFullscreen) {
                var efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (efs) {
                    efs.call(document);
                } else if (window.ActiveXObject) {
                    var ws = new ActiveXObject('WScript.Shell');
                    ws && ws.SendKeys('{F11}');
                }
                ti.addClass(ac).removeClass(ic);
            } else {
                var el = document.documentElement;
                var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (rfs) {
                    rfs.call(el);
                } else if (window.ActiveXObject) {
                    var ws = new ActiveXObject('WScript.Shell');
                    ws && ws.SendKeys('{F11}');
                }
                ti.addClass(ic).removeClass(ac);
            }
        },
        // 关闭所有弹窗
        closeDialog: function () {
            layer.closeAll('page');
        }
    };

    // 所有ew-event
    $('body').on('click', '*[ew-event]', function () {
        var event = $(this).attr('ew-event');
        var te = admin.events[event];
        te && te.call(this, $(this));
    });

    // 移动设备遮罩层点击事件
    $('.site-mobile-shade').click(function () {
        admin.flexible(true);
    });

    // 侧导航折叠状态下鼠标经过显示提示
    $('body').on('mouseenter', '.layui-layout-admin.admin-nav-mini .layui-side .layui-nav .layui-nav-item>a', function () {
        var tipText = $(this).find('cite').text();
        if (document.body.clientWidth > 750) {
            layer.tips(tipText, this);
        }
    }).on('mouseleave', '.layui-layout-admin.admin-nav-mini .layui-side .layui-nav .layui-nav-item>a', function () {
        layer.closeAll('tips');
    });

    // 侧导航折叠状态下点击展开
    $('body').on('click', '.layui-layout-admin.admin-nav-mini .layui-side .layui-nav .layui-nav-item>a', function () {
        if (document.body.clientWidth > 750) {
            layer.closeAll('tips');
            admin.flexible(true);
        }
    });

    // 所有lay-tips处理
    $('body').on('mouseenter', '*[lay-tips]', function () {
        var tipText = $(this).attr('lay-tips');
        var dt = $(this).attr('lay-direction');
        layer.tips(tipText, this, {
            tips: dt || 1,
            time: -1
        });
    }).on('mouseleave', '*[lay-tips]', function () {
        layer.closeAll('tips');
    });

    // 注册路由
    admin.regRouter('theme', 'docs/generater_theme.html', '主题生成器');

    exports('adc', admin);
});

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
// Array.prototype.includes = function () {
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {

            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1.
                // NOTE: === provides the correct "SameValueZero" comparison needed here.
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
// };
