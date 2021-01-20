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
 * Modified By  : yuchunyu97 at <yuchunyu97@gmail.com>
 * -----
 * Description: 框架基本功能模块，主要是菜单、顶部栏渲染以及路由注册
 * -----
 * HISTORY:
 * 2018-08-30	yuchunyu97	增加面包屑功能
 * 2018-08-30	yuchunyu97	完成基本功能
 */

layui.define(['config', 'adc', 'layer', 'laytpl', 'element', 'form', 'table', 'laydate'], function(exports) {
    var $ = layui.$;
    var config = layui.config;
    var admin = layui.adc;
    var layer = layui.layer;
    var laytpl = layui.laytpl;
    var element = layui.element;
    var form = layui.form;

    var index = {

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
                rootValue = 'p';
            var search = "";
            for (var i = 0; i < value.length; i++) {
                var valueNow = value[i];
                // 将增删改查权限的菜单过滤出去
                if (valueNow['permission'] !== null) {
                    continue;
                }
                // 构造 URL 上通五系统采用url字段更新
                var path = valueNow['url'],
                    url = 'javascript:;';
                if (path && path.indexOf('.') >= 0) {

                    /**
                     * Q.js 关键字模式，路由中不能用斜线（/）
                     *  创建默认你
                     */
                    url = '#!' + path.split('.')[0].split('/').join('_');
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
            menus.unshift({
                id: '0',
                pid: 'p',
                name: 'ddd',
                url: '',
                path: '',
                icon: '',
                sort: ''
            })

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

            // 排序
            /*function newMenuSort(obj) {
                // 菜单排序
                obj.sort(function(a, b) {
                    if (!a.sort) a.sort = '';
                    if (!b.sort) b.sort = '';
                    // a = a.sort.split('-');
                    // b = b.sort.split('-');
                    if (a.length === b.length) {
                        if (a.length === 0) {
                            return 0;
                        } else if (a.length === 1) {
                            return a[0] - b[0];
                        } else {
                            if (a[0] === b[0]) {
                                return a[1] - b[1];
                            } else {
                                return a[1] - b[1];
                            }
                        }
                    } else {
                        return a.length - b.length;
                    }
                });
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i].subMenus) {
                        newMenuSort(obj[i].subMenus);
                    }
                }
            };*/
            // newMenuSort(newMenu.subMenus);
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
            // if (window.location.hash.indexOf('#!suppliersubmission') != -1 || window.location.hash.indexOf('#!supplier_submission_done') != -1 || window.location.hash.indexOf('#!ppap_supplier') != -1 || window.location.hash.indexOf('#!task-second-ppap-supplier') != -1 || window.location.hash.indexOf('#!task-view-ppap-supplier') != -1 || window.location.hash.indexOf('#!parts-managment') != -1
            //     || window.location.hash.indexOf('#!opap3') != -1){ /**马 2019-3-13 13:50 bug修复 零件信息管理[含两个子模块]-供应商登录-任务单编号没有超链接 【15711】**/
                // $('.layui-header').find('ul').remove();
                currentMenu.unshift({
                    id: 'qt0112',
                    name: '零件信息管理',
                    url: 'javascript:;',
                    icon: 'icon-home',
                    sort: '1',
                    subMenus: [{
                        id: 'qt01121',
                        name: '零件信息维护',
                        url: '#!parts-managment',
                        path: 'parts/part_info_maintain.html',
                        sort: '1-1'
                    },{
                        id: 'qt01122',
                        name: '零件信息查询',
                        url: '#!parts-query',
                        path: 'parts/part_info_query.html',
                        sort: '1-2'
                    }]
                },{
                    id: 'qt1223',
                    name: '任务单管理',
                    url: 'javascript:;',
                    icon: 'icon-home',
                    sort: '2',
                    subMenus: [
                        {
                            id: 'qt12231',
                            name: '任务单待办',
                            url: '#!suppliersubmission',
                            path: 'parts/ppap_task_sheet_agent.html',
                            sort: '2-1'
                        },
                        {
                            id: 'qt12232',
                            name: '任务单已办',
                            url: '#!supplier_submission_done',
                            path: 'parts/task_sheet_agent1.html',
                            sort: '2-2'
                        },
                        {
                            id: 'qt12237',
                            name: '供货质量保证承诺',
                            url: '#!supplier_promise_file_download',
                            path: 'promiseFileDetail/promise_file_info.html',
                            sort: '2-3'
                        },
                        {
                            id: 'qt12233',
                            name: '供应商文件提交',
                            url: '#!ppap_supplier',
                            hidden: 1,
                            path: 'parts/ppap_gystjwj.html',
                            sort: '2-3'
                        },
                        {
                            id: 'qt12234',
                            name: '供应商文件提交',
                            url: '#!task-second-ppap-supplier',
                            hidden: 1,
                            path: 'task/taskSecondApproval.html',
                            sort: '2-4'
                        },
                        {
                            id: 'qt12235',
                            name: '任务单详情',
                            url: '#!task-view-ppap-supplier',
                            hidden: 1,
                            path: 'task/ppapDetails.html',
                            sort: '2-5'
                        },
                      /**马 2019-3-13 13:50 bug修复 零件信息管理[含两个子模块]-供应商登录-任务单编号没有超链接 【15711】**/
                      {
                        id: 'qt12236',
                        name: 'OPAP任务单详情',
                        url: '#!opap3',
                        hidden: 1,
                        path: 'parts/opap_approval_list2.html',
                          sort: '2-6'
                      }
                      /**马 2019-3-13 13:50 bug修复 结束**/
                    ]
                });
                config.menus = currentMenu;
                // 渲染
                $('.layui-layout-admin .layui-side').load('components/side.html', function() {
                    laytpl(sideNav.innerHTML).render(config.menus, function(html) {
                        $('#sideNav').after(html);
                    });
                    element.render('nav'); // 并不知道干什么用的渲染
                    admin.activeNav(Q.lash); // 设置导航栏选中
                    // 侧边栏 用户信息
                    $('.layui-layout-admin .layui-side .admin-user').vm(account);

                    $("a[href='#!project2']").css('height','0');
                    $("a[href='#!project1']").css('height','0');
                    $("a[href='#!OPAP']").css('height','0');
                    $("a[href='#!OPAP1']").css('height','0');
                    $("a[href='#!OPAP2']").css('height','0');
                    $("a[href='#!project9']").css('height','0');
                    $("a[href='#!project10']").css('height','0');
                    $("a[href='#!project11']").css('height','0');
                    $("a[href='#!task-second-ppap']").css('height','0');
                    $("a[href='#!task-view-ppap']").css('height','0');



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
            index.regRouter(config.menus);
            // 默认加载的信息页面
            Q.init({
                index: 'dashboard'
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

                        if (data.path === 'risk/riskMap.html') {
                            window.open("components/risk/riskMap.html");
                            // window.location.open('./components/risk/riskMap.html', '_self');
                            // newWin("./components/risk/riskMap.html",'mylayer');
                        }else {
                            var menuId = data.url.substring(2);
                            var menuPath = 'components/' + data.path;
                            index.loadView(menuId, menuPath, data.name, data.id);
                        }

                    });
                }
                // 递归注册路由
                if (data.subMenus) {
                    index.regRouter(data.subMenus);
                }
            });


            function newWin(url, id) {
                var a = document.createElement('a');
                a.setAttribute('href',url  );
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
            $(contentDom).load(menuPath, function() {
                admin.removeLoading();
                // 渲染 layui form
                // 解决页面渲染完 form 元素未渲染的 bug
                form.render();
            });
            // 更新面包屑
            index.updateBreadcrumb(index.getPathNameFromMenus(id, {
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
                    var tmp = index.getPathNameFromMenus(id, menus.subMenus[i]);
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
            // 退出登录
            $('#btn-logout').click(function() {
                layer.confirm('确定退出登录？', function() {
                    // admin.req('/api-edu/logout', {}, function() {
                    config.removeAccount();
                    // replace() 方法不会在 History 对象中生成一个新的记录。当使用该方法时，新的 URL 将覆盖 History 对象中的当前记录。
                    // location.replace('./login.html?redirect_to=' + window.location.hash);
                    window.open('/edu/Login/UserLogout', '_self');
                    // });
                });
            });
            // 修改密码
            $('#btn-setpw').click(function() {
                admin.popupRight('components/tpl/password.html');
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
            if (window.location.hash.indexOf('#!suppliersubmission') != -1){
                    var supplierId = window.location.hash;
                    if (supplierId.indexOf('?') === -1) {
                        sessionStorage.removeItem('supplierId');
                    } else {
                        supplierId = supplierId.split('?')[1];
                        sessionStorage.setItem('supplierId', supplierId);
                        $.ajax({
                            type: 'get',
                            url: admin.formatUrl('/api-edu/ppap/edum05user/getSupplierInfo'),
                            async: false,
                            dataType: 'json',
                            data: {
                                userid: supplierId
                            },
                            success: function (res) {
                                if (res.respCode == 200) {
                                    config.putAccount(res.data)
                                }
                            }
                        });
                    }
            } else if (window.location.hash.indexOf('#!supplier_submission_done') != -1 || window.location.hash.indexOf('#!ppap_supplier') != -1 || window.location.hash.indexOf('#!task-second-ppap-supplier') != -1 || window.location.hash.indexOf('#!task-view-ppap-supplier') != -1 || window.location.hash.indexOf('#!parts-managment') != -1||window.location.hash.indexOf('#!parts-query') != -1) {
                //页面清空缓存后供应商信息丢失-bug修复
                var supplierId = sessionStorage.getItem('supplierId');
                if (supplierId) {
                    $.ajax({
                        type: 'get',
                        url: admin.formatUrl('/api-edu/ppap/edum05user/getSupplierInfo'),
                        async: false,
                        dataType: 'json',
                        data: {
                            userid: supplierId
                        },
                        success: function (res) {
                            if (res.respCode == 200) {
                                config.putAccount(res.data)
                            }
                        }
                    });
                }
            } else {
                if (console && console.warn) console.warn('\t\n\tTechnical Support @Curtis\n\n\tContact me Curtis.Amo.69@gmail.com\n\t');
                $.ajax({
                    url: config.base_server + '/api-edu/login-detail',
                    async: false,
                    success: function(res) {
                        config.putAccount(res.data)
                    }
                });
            }

            index.initNav();
            index.initRouter();
            index.bindEvent();

            // 使用Pandyle.config来设置comPath
            // 定义组件路径
            Pandyle.config({
                comPath: {
                    tpl: 'components/tpl/{name}.html'
                }
            });

            // Ovo
            if (config.getAccount().online) config.ADCScrollNotice = true;

            // 顶部信息滚动条
            if (config.ADCScrollNotice) {
                (function() {
                    $('.scroll-notice div span').text(config.ADCScrollNoticeString);
                    var innerWidth = $('.scroll-notice div span').width(),
                        outerWidth = $('.scroll-notice').width(),
                        offset = 20;
                    $('.scroll-notice div span').css('padding', outerWidth + offset);
                    $('.scroll-notice div').scrollLeft(outerWidth - offset);
                    window.ADCScrollNotice = setInterval(function() {
                        var po = $('.scroll-notice div').scrollLeft(),
                            innerWidth = $('.scroll-notice div span').width(),
                            outerWidth = $('.scroll-notice').width();
                        if (po === innerWidth + outerWidth + offset * 2) {
                            $('.scroll-notice div').scrollLeft(0);
                            // 重新赋值
                            $('.scroll-notice div span').text(config.ADCScrollNoticeString);
                        } else {
                            $('.scroll-notice div').scrollLeft($('.scroll-notice div').scrollLeft() + config.ADCScrollNoticeSpeed);
                        }
                    }, 100);
                })();
            }

            // 在线用户数量
            /*window.ADCOnlineUser = setInterval(function () {
                  getOnlineUser();
            }, config.ADCPullTime);

            function getOnlineUser() {
                admin.req('/api-edu/onlineUser', {}, function (res) {
                    if (res.ok) {
                        $('#online-user').text(res.data.total);
                        $('#online-user').attr('title', res.data.onlineUsers.join(' '));
                        layer.msg('当前在线人数：' + res.data.total, {
                            offset: 'rb',
                            time: 2400
                        });
                    }
                }, {
                    beforeSend: function () {},
                    complete: function () {}
                });
            }
            getOnlineUser();*/
        }

        // TODO: Encapsulation Table Module

    };

    exports('index', index);
});