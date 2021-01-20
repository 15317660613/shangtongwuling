/*
 * File   : index.js
 * Created: Thursday August 30th 2018 1:17:27 pm
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
 * Last Modified: Friday November 2nd 2018 2:40:24 pm
 * Modified By  : yuchunyu97
 * Modified By  : caifei   20190130
 *
 * -----
 * Description: 框架基本功能模块，主要是菜单、顶部栏渲染以及路由注册
 * -----
 * HISTORY:
 * 2018-08-30	yuchunyu97	增加面包屑功能
 * 2018-08-30	yuchunyu97	完成基本功能
 */

layui.define(['config', 'admin', 'layer', 'laytpl', 'element', 'form', 'table', 'laydate'], function(exports) {
    var $ = layui.$;
    var config = layui.config;
    var admin = layui.admin;
    var layer = layui.layer;
    var laytpl = layui.laytpl;
    var element = layui.element;
    var form = layui.form;


    var indexChart = {


        /**
         * 获取菜单数据后，将父子关系的数据转换成树形结构的数据
         *
         * @param {*} value
         * @returns
         */
        toTree: function(value) {
            // 先对传入的数组进行处理，留下有用的信息
            var menus = [],
                childrenKey = 'subMenus',
                rootValue = '0';
            for (var i = 0; i < value.length; i++) {
                var valueNow = value[i];
                // 将增删改查权限的菜单过滤出去
                /*if (valueNow['permission'] !== null) {
                    continue;
                }*/
                // 构造 URL 上通五系统采用url字段更新
                var path = valueNow['url'],
                    url = 'javascript:;';
                if (path && path.indexOf('.') >= 0) {

                    /**
                     * Q.js 关键字模式，路由中不能用斜线（/）
                     *  创建默认你
                     */
                    if (path.indexOf('?') >= 0) {
                        var obj = { "analysis": "#!riskAnalysis", "monitor": "#!riskMonitor", "warning": "#!riskWarning", "forecast": "#!riskForecast", "manager": "#!riskManager" }
                        url = obj[path.split('?')[1]];
                    } else {
                        url = '#!' + path.split('.')[0].split('/').join('_');
                    }
                } else {
                    url = '/edu' + url;
                }
                var icon = valueNow['icon'] === null ? 'icon-default' : valueNow['icon'];
                // 写入数据
                menus.push({
                    id: valueNow['id'],
                    pid: valueNow['pid'],
                    name: valueNow['caption'],
                    url: url,
                    path: path,
                    icon: icon,
                    sort: valueNow['sort']
                });
            }
            // 设置更目录结点
            if (menus) {
                menus.unshift({
                    id: '0',
                    pid: 'p',
                    name: 'ddd',
                    url: '',
                    path: '',
                    icon: '',
                    sort: ''
                });
            }

            // 循环
            var NOW;
            for (var i = 0; i < menus.length; i++) {
                var itemI = menus[i];
                if (itemI.pid === rootValue) {
                    NOW = i;
                    continue;
                }

                for (var j = 0; j < menus.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    var itemJ = menus[j];
                    if (itemI.pid === itemJ.id) {
                        if (!itemJ[childrenKey] || Object.prototype.toString.call(itemJ[childrenKey]) !==
                            '[object Array]') {
                            itemJ[childrenKey] = [];
                        }
                        itemJ[childrenKey].push(itemI);
                        break;
                    }
                }
            }
            var newMenu = menus[NOW];
            return newMenu;
        },

        /**
         * 渲染左侧导航栏和上侧 header
         *
         * @returns
         */
        initNav: function() {
            // 获取菜单
            var account = config.getAccount();
            // if (!account) return;
            // 上侧 header 用户信息
            $('.layui-layout-admin .layui-header').vm(account);
            var currentMenu = [];
            // 获取菜单数据
            $.ajax({
                // 5329 系统管理员；
                //url: admin.formatUrl('/api/sys/hpm05user/' + account.userId+'/menu'),
                // url: admin.formatUrl('/api/sys/hpm05user/5329/menu'),
                url: '../../json/login-detail.json',
                type: 'GET',
                dataType: 'JSON',
                async: false, // 同步进行，防止访问不到 config.menus 数据
                success: function(data) {
                    console.log(data.data[0].menus);
                    var menusTree = indexChart.toTree(data.data[0].menus);
                    currentMenu = menusTree ? menusTree.subMenus : [];
                    // 加入首页菜单
                    currentMenu.unshift({
                        id: 'AAAAAAAA',
                        name: '工厂运行总览',
                        path: 'factoryPandect.html',
                        url: '#!factoryPandect',
                        icon: '',
                        sort: '0'
                    }, {
                        id: 'BBBBBBBBB',
                        name: '生产运行状态',
                        path: 'productStatus.html',
                        url: '#!productStatus',
                        icon: '',
                        sort: '0'
                    }, {
                        id: 'CCCCCCCCCC',
                        name: '质量运行状态',
                        path: 'qualityStatus.html',
                        url: '#!qualityStatus',
                        icon: '',
                        sort: '0'
                    }, {
                        id: 'DDDDDDDDDDD',
                        name: '交付完成状态',
                        path: 'deliveryStatus.html',
                        url: '#!deliveryStatus',
                        icon: '',
                        sort: '0'
                    });

                    config.menus = currentMenu;


                },
                error: function(xhr) {
                    // if (xhr.status === 404 || xhr.status === 401) {
                    //     // 可能是登录信息失效，跳转到登录页
                    //     config.removeAccount();
                    //     location.replace('./logout' );
                    // } else if (xhr.status === 502 || xhr.status === 504) {
                    //     layer.msg('后台服务不可用，请稍后再试');
                    // }
                }
            });

        },

        /**
         * 路由注册
         *
         */
        initRouter: function() {
            // 如果菜单为空，则需要重新登录
            /* if (config.menus.length === 0) {
                 config.removeAccount();
                 // 注册路由的是时候，跳转到登录页信息。
                 location.replace('./login.html?redirect_to=' + window.location.hash);
                 return;
             }*/
            indexChart.regRouter(config.menus);
            // 默认加载的信息页面
            Q.init({
                index: 'factoryPandect'
                    // index: '#!ADC_system_user'
            });
        },

        /**
         * 使用递归循环注册
         *
         * @param {*} menus
         */
        regRouter: function(menus) {
            $.each(menus, function(i, data) {
                if (data.url && data.url.indexOf('#!') == 0) {
                    Q.reg(data.url.substring(2), function() {
                        var menuId = data.url.substring(2);
                        var menuPath = '' + data.path;
                        indexChart.loadView(menuId, menuPath, data.name, data.id);
                    });
                }
                // Q.reg('qualityStatus', function() {
                //     debugger
                //     var menuId = 'BBBBBBBBBBB';
                //     var menuPath = 'qualityStatus.html';
                //     indexChart.loadView(menuId, menuPath, '生产运行状态', '00000000');
                // });
                // 递归注册路由
                if (data.subMenus) {
                    indexChart.regRouter(data.subMenus);
                }
            });


            function newWin(url, id) {
                var a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('target', '_blank');
                a.setAttribute('id', id);
                // 防止反复添加
                if (!document.getElementById(id)) {
                    document.body.appendChild(a);
                }
                a.click();
            }
        },

        /**
         * 路由加载组件页面
         *
         * @param {*} menuId
         * @param {*} menuPath
         * @param {*} menuName
         */
        loadView: function(menuId, menuPath, menuName, id) {
            var contentDom = '.layui-layout-admin .layui-body';
            admin.showLoading();

            // 增加生命周期钩子，在当前页面被卸载之前执行的处理
            if (admin.beforeDestroy) {
                admin.beforeDestroy();
                admin.beforeDestroy = undefined;
            }
            // 加载页面
            if (menuPath.indexOf("?") != -1) {
                sessionStorage.setItem("riskFlag", menuPath.split("?")[1]);
                $(contentDom).load(menuPath.split("?")[0], function() {
                    //admin.removeLoading();
                    // 渲染 layui form
                    // 解决页面渲染完 form 元素未渲染的 bug
                    form.render();
                });
            } else {
                $(contentDom).load(menuPath, function() {
                    // admin.removeLoading();
                    // 渲染 layui form
                    // 解决页面渲染完 form 元素未渲染的 bug
                    form.render();
                });
            }

            // 更新面包屑
            indexChart.updateBreadcrumb(indexChart.getPathNameFromMenus(id, {
                id: '00000000',
                name: '首页',
                subMenus: config.menus
            }));
            // 设置导航栏选中
            admin.activeNav(Q.lash);
            // 移动设备切换页面隐藏侧导航
            if (document.body.clientWidth <= 750) {
                admin.flexible(true); // 设置侧栏折叠
            }
        },

        /**
         * 更新面包屑信息
         *
         * @param {*} value
         */
        updateBreadcrumb: function(value) {
            var elem = $('.admin-breadcrumb'),
                icon = '<i class="layui-icon layui-icon-location"></i>';

            elem.empty();

            elem.append(icon);
            for (var i = 0; i < value.length; i++) {
                var path = value[i].path;
                if (value[i].name == '首页') {
                    path = '/';
                }
                elem.append('<a href="' + path + '">' + value[i].name + '</a>');
            }

            element.render('breadcrumb');

            // 顺便更新一下浏览器title 哈哈哈哈哈
            if (value.length > 0) {
                var title = value[value.length - 1].name + ' | '
            }
            window.document.title = title + 'STW';
        },
        /**
         * 通过 id 获取面包屑路径名称
         * 深度优先遍历
         *
         */
        getPathNameFromMenus: function(id, menus) {
            if (menus.subMenus) {
                for (var i = 0; i < menus.subMenus.length; i++) {
                    var tmp = indexChart.getPathNameFromMenus(id, menus.subMenus[i]);
                    if (tmp) {
                        tmp.unshift({
                            name: menus.name,
                            path: 'javascript:;'
                        });
                        return tmp;
                    }
                }
            }
            if (id === menus.id) {
                return [{
                    name: menus.name,
                    path: 'javascript:;'
                }];
            } else {
                return false;
            }
        },

        /**
         * 页面元素绑定事件监听
         *
         */
        bindEvent: function() {
            element.render('nav');
            // 退出登录
            $('#btn-logout').click(function() {
                layer.confirm('确定退出登录？', function() {
                    // admin.req('/api/logout', {}, function() {
                    config.removeAccount();
                    // replace() 方法不会在 History 对象中生成一个新的记录。当使用该方法时，新的 URL 将覆盖 History 对象中的当前记录。
                    // location.replace('./login.html?redirect_to=' + window.location.hash);
                    window.location.href = "/api-edu/logout";
                    // });
                });
            });
            // 修改密码
            $('#btn-setpw').click(function() {
                // admin.popupRight('components/tpl/password.html');
                window.open("/edu/EDUM05/changepass?module=Fx");
            });
            // 个人信息
            $('#btn-setinf').click(function() {
                var w = window.innerWidth < 700 ? '90%' : '700px';
                var h = window.innerHeight < 500 ? '80%' : '500px';
                admin.popupCenter({
                    title: '个人信息',
                    path: 'components/tpl/user_info_tpl.html',
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
            // 消息
            $('#btn-getmsg').click(function() {
                admin.popupRight('components/tpl/message.html');
            });
        },

        /**
         * 初始化
         *
         */
        init: function() {
            // $.ajax({
            //     url: 'api-edu/interaction/disqualificationanalysis/calendar',
            //     async: false,
            //     success: function(res) {
            //         if (res.ok) {
            //             window.$calendar = {};
            //             for (var i = 0; i < res.data.length; i++) {
            //                 var item = res.data[i];
            //                 window.$calendar[item.date] = item.year + '-' + item.month + '-' + item.monthWeeknum;
            //             }

            //         } else {
            //             config.removeAccount();
            //             location.replace('./login.html');
            //         }


            //     }
            // });


            if (console && console.warn) console.warn('\t\n\tTechnical Support @Curtis\n\n\tContact me Curtis.Amo.69@gmail.com\n\t');
            $.ajax({
                url: admin.formatUrl('/api-edu/login-detail'),
                // url: 'json/login-detail.json',
                async: false,
                success: function(res) {
                    config.putAccount(res.data)
                }
            });

            indexChart.initNav();
            indexChart.initRouter();
            indexChart.bindEvent();

            // 使用Pandyle.config来设置comPath
            // 定义组件路径
            Pandyle.config({
                comPath: {
                    tpl: 'components/{name}.html'
                }
            });

            // Ovo
            if (config.getAccount().online) config.ADCScrollNotice = true;


        }

        // TODO: Encapsulation Table Module

    };

    exports('indexChart', indexChart);
});