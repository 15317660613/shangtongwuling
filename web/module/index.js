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

layui.define(['config', 'adc', 'layer', 'laytpl', 'element', 'form', 'table', 'laydate'], function (exports) {
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
        toTree: function (value) {
            // 先对传入的数组进行处理，留下有用的信息
            var menus = [],
                childrenKey = 'subMenus',
                rootValue = 'p';
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
                    if (path.indexOf('?') >= 0) {
                        var obj = {
                            "analysis": "#!riskAnalysis",
                            "monitor": "#!riskMonitor",
                            "warning": "#!riskWarning",
                            "forecast": "#!riskForecast",
                            "manager": "#!riskManager"
                        }
                        url = obj[path.split('?')[1]];
                    } else {
                        url = '#!ADC_' + path.split('.')[0].split('/').join('_');
                    }
                } else if (path && path.indexOf('smsh') > 0) {
                    //动态获取地址 IP地址+端口号
                    // window.location.href = 'http://'+address +'/'+ $this.attr('name')+'';
                    var protocol = 'http:';
                    if ('https:' === window.location.protocol) {
                        protocol = window.location.protocol;
                    }
                    url = protocol + '//' + window.location.host + path;
                }
                var icon = valueNow['icon'] === null ? 'icon-default' : valueNow['icon'];
                // 写入数据
                menus.push({
                    id: valueNow['id'],
                    pid: valueNow['pid'],
                    name: valueNow['caption'],
                    breadUrl: valueNow['belong'],
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
            });

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
        initNav: function () {
            // 获取菜单
            var account = config.getAccount();
            // if (!account) return;
            // 上侧 header 用户信息
            $('.layui-layout-admin .layui-header').vm(account);
            var currentMenu = [];
            if (window.location.hash.indexOf('#!suppliersubmission') != -1 || window.location.hash.indexOf('#!supplier_submission_done') != -1 || window.location.hash.indexOf('#!ppap_supplier') != -1 || window.location.hash.indexOf('#!task-second-ppap-supplier') != -1 || window.location.hash.indexOf('#!task-view-ppap-supplier') != -1 || window.location.hash.indexOf('#!parts-managment') != -1) {
                $('.layui-header').find('ul').remove();
                currentMenu.unshift({
                    id: 'qt1223',
                    name: '任务单管理',
                    url: 'javascript:;',
                    icon: 'icon-home',
                    sort: '1',
                    subMenus: [{
                        id: 'qt12231',
                        name: '任务单待办',
                        url: '#!suppliersubmission',
                        path: 'parts/ppap_task_sheet_agent.html',
                        sort: '1-1'
                    },
                        {
                            id: 'qt12232',
                            name: '任务单已办',
                            url: '#!supplier_submission_done',
                            path: 'parts/task_sheet_agent1.html',
                            sort: '1-2'
                        },
                        {
                            id: 'qt12233',
                            name: '供应商文件提交',
                            url: '#!ppap_supplier',
                            hidden: 1,
                            path: 'parts/ppap_gystjwj.html',
                            sort: '1-3'
                        },
                        {
                            id: 'qt12234',
                            name: '供应商文件提交',
                            url: '#!task-second-ppap-supplier',
                            hidden: 1,
                            path: 'task/taskSecondApproval.html',
                            sort: '1-4'
                        },
                        {
                            id: 'qt12235',
                            name: '任务单详情',
                            url: '#!task-view-ppap-supplier',
                            hidden: 1,
                            path: 'task/ppapDetails.html',
                            sort: '1-5'
                        }
                    ]
                }, {
                    id: 'qt0112',
                    name: '零件信息管理',
                    url: 'javascript:;',
                    icon: 'icon-home',
                    sort: '2',
                    subMenus: [{
                        id: 'qt01121',
                        name: '零件信息维护',
                        url: '#!parts-managment',
                        path: 'parts/part_info_maintain.html',
                        sort: '2-1'
                    }]
                });
                config.menus = currentMenu;
                // 渲染
                $('.layui-layout-admin .layui-side').load('components/side.html', function () {
                    laytpl(sideNav.innerHTML).render(config.menus, function (html) {
                        $('#sideNav').after(html);
                    });
                    element.render('nav'); // 并不知道干什么用的渲染
                    admin.activeNav(Q.lash); // 设置导航栏选中
                    // 侧边栏 用户信息
                    $('.layui-layout-admin .layui-side .admin-user').vm(account);

                    $("a[href='#!project2']").css('height', '0');
                    $("a[href='#!project1']").css('height', '0');
                    $("a[href='#!OPAP']").css('height', '0');
                    $("a[href='#!OPAP1']").css('height', '0');
                    $("a[href='#!OPAP2']").css('height', '0');
                    $("a[href='#!project9']").css('height', '0');
                    $("a[href='#!project10']").css('height', '0');
                    $("a[href='#!project11']").css('height', '0');
                    $("a[href='#!task-second-ppap']").css('height', '0');
                    $("a[href='#!task-view-ppap']").css('height', '0');
                });
            } else {
                // 获取菜单数据
                $.ajax({
                    // 5329 系统管理员；
                    url: admin.formatUrl('/api/sys/hpm05user/' + account.userId + '/menu'),
                    // url: admin.formatUrl('/api/sys/hpm05user/5329/menu'),
                    type: 'GET',
                    dataType: 'JSON',
                    async: false, // 同步进行，防止访问不到 config.menus 数据
                    success: function (data) {
                        var menusTree = index.toTree(data.data);
                        var currentMenu = menusTree ? menusTree.subMenus : [];
                        console.log(menusTree, 278);

                        /**
                         * @Description: 手动给左侧菜单添加一个新的菜单，此菜单为基础档案
                         * @params:null
                         * @return:null
                         * @author:zq
                         * @date:2020/09/14
                         */
                        currentMenu.unshift({
                            id: 'JCXX',
                            name: '基础信息',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '0',
                            subMenus: [
                                {
                                    id: 'JCXX1',
                                    name: '零件信息',
                                    url: '#!spare_parts_info',
                                    path: 'stwl_material_control/basicArchives/spare_parts_info.html',
                                    sort: '1-1'
                                },
                                {
                                    id: 'JCXX2',
                                    name: '车型信息',
                                    url: '#!car_model_info',
                                    path: 'stwl_material_control/basicArchives/car_model_info.html',
                                    sort: '1-2'
                                },
                                {
                                    id: 'JCXX3',
                                    name: '供应商',
                                    url: '#!supplier',
                                    path: 'stwl_material_control/basicArchives/supplier.html',
                                    sort: '1-3'
                                },
                                {
                                    id: 'JCXX4',
                                    name: '本地供应商清单',
                                    url: '#!local_supplier_detailed_list',
                                    path: 'stwl_material_control/basicArchives/local_supplier_detailed_list.html',
                                    sort: '1-4'
                                },
                                {
                                    id: 'JCXX5',
                                    name: '长周期物料清单',
                                    url: '#!long_term_materiel',
                                    path: 'stwl_material_control/basicArchives/long_term_materiel.html',
                                    sort: '1-5'
                                },
                                {
                                    id: 'JCXX6',
                                    name: '第三方物流公司',
                                    url: '#!third_party_logistics',
                                    path: 'stwl_material_control/basicArchives/third_party_logistics.html',
                                    sort: '1-6'
                                }
                            ]
                        })
                        currentMenu.unshift({
                            id: 'JCDA',
                            name: '通知公告',
                            url: '#!bulletinBoard',
                            path:'stwl_material_control/bulletinBoard/bulletinBoard.html',
                            icon: 'icon-home',
                            sort: '0',
                        },{
                            id: 'JCDA',
                            name: '交付索赔',
                            url: '#!claim_for_compensation',
                            path:'stwl_material_control/claim_for_compensation/claim_for_compensation.html',
                            icon: 'icon-home',
                            sort: '1',
                        })
                        // 加入首页菜单
                        /*currentMenu.unshift(
                            {
                            id: 'AAAAAAAA',
                            name: '仪表盘',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '0',
                            subMenus: [{
                                    id: 'AAAAAAAA1',
                                    name: '信息展示',
                                    url: '#!dashboard',
                                    path: 'mybusiness/businessIndex.html',
                                    // path: 'dashboard.html',
                                    sort: '0-1'
                                }

                                                            , {
                                                                id: 'qt122312',
                                                                name: '零件PTR申请',
                                                                url: '#!parts_ptr_application',
                                                                path: 'parts/parts_ptr_application.html',
                                                                sort: '4-11'
                                                            }, {
                                                                id: 'qt122313',
                                                                name: 'PTR申请',
                                                                url: '#!parts_ptr_createinfo',
                                                                path: 'parts/ptr_parts_createinfo.html',
                                                                sort: '4-13'
                                                            }, {
                                                                id: 'qt122316',
                                                                name: 'PTR申请',
                                                                url: '#!ptr_parts_queryinfo',
                                                                path: 'parts/ptr_parts_createinfo.html',
                                                                sort: '4-13'
                                                            // }
                                                            //     , {
                                                            //         id: 'qt122314',
                                                            //         name: '审批通知查询',
                                                            //         url: '#!approve_message_query',
                                                            //         path: 'parts/approve_message_query.html',
                                                            //         sort: '4-11'
                                                                }, {
                                                                    id: 'qt122315',
                                                                    name: 'PTR清单查询',
                                                                    url: '#!parts_ptr_list_query',
                                                                    path: 'parts/parts_ptr_list_query.html',
                                                                    sort: '4-11'
                                                                }

                            ]
                        },
                            { //updated by qitian 解决子页面中面包屑导航显示问题 bug编号14126
                                id: 'PTR',
                                name: 'PTR管理',
                                url: 'javascript:;',
                                hidden: 1,
                                icon: 'icon-home',
                                sort: '0',
                                subMenus: [{
                                        id: 'PTR1',
                                        name: 'PTR申请',
                                        url: '#!ptr_parts_createinfo',
                                        path: 'parts/ptr_parts_createinfo.html',
                                        sort: '4-4'
                                    },
                                    {
                                        id: 'PTR2',
                                        name: 'PTR申请单详情',
                                        url: '#!ptr_parts_queryinfo',
                                        path: 'parts/ptr_parts_queryinfo.html',
                                        sort: '4-4'
                                    }
                                ]
                            }, {
                                id: 'TASK',
                                name: '任务单管理',
                                url: 'javascript:;',
                                hidden: 1,
                                icon: 'icon-home',
                                sort: '0',
                                subMenus: [{
                                    id: 'TASK1',
                                    name: 'OPAP审批单创建',
                                    url: '#!OPAP',
                                    path: 'parts/opap_approval_list.html',
                                    sort: '4-4'
                                }, {
                                    id: 'TASK2',
                                    name: 'OPAP审批单审批',
                                    url: '#!OPAP1',
                                    path: 'parts/opap_approval_list1.html',
                                    sort: '4-5'
                                }, {
                                    id: 'TASK3',
                                    name: 'OPAP审批单详情',
                                    url: '#!OPAP2',
                                    path: 'parts/opap_approval_list2.html',
                                    sort: '4-6'
                                }, {
                                    id: 'TASK4',
                                    name: 'PPAP审批',
                                    url: '#!project9',
                                    path: 'parts/ppap_sqe.html',
                                    sort: '4-7'
                                }, {
                                    id: 'TASK5',
                                    name: 'PPAP供应商',
                                    url: '#!project10',
                                    path: 'parts/ppap_gystjwj.html',
                                    sort: '4-8'
                                }, {
                                    id: 'TASK6',
                                    name: 'PPAP创建',
                                    url: '#!project11',
                                    path: 'parts/ppap_create.html',
                                    sort: '4-9'
                                }, {
                                    id: 'TASK7',
                                    name: 'PPAP任务再次提交',
                                    url: '#!task-second-ppap',
                                    path: 'task/taskSecondApproval.html',
                                    sort: '4-10'
                                }, {
                                    id: 'TASK8',
                                    name: 'PPAP详情',
                                    url: '#!task-view-ppap',
                                    path: 'task/ppapDetails.html',
                                    sort: '4-11'
                                }]
                            }, {
                                id: 'PROJECT',
                                name: '项目维护管理',
                                url: 'javascript:;',
                                hidden: 1,
                                icon: 'icon-home',
                                sort: '0',
                                subMenus: [{ //udated by qitian 2019-01-22 bug编号13855
                                    id: 'PROJECT1',
                                    name: '项目管理副表',
                                    url: '#!project2',
                                    path: 'parts/project_tracking_list_details_2.html',
                                    sort: '2-3'
                                }, { //udated by qitian 2019-01-22 bug编号13855
                                    id: 'PROJECT2',
                                    name: '项目管理主表',
                                    url: '#!project1',
                                    path: 'parts/project_tracking_list_details_1.html',
                                    sort: '2-4'
                                }]
                            });*/
                        /*currentMenu.push({
                            id: 'DDDDD',
                            name: '流程管理',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '0',
                            subMenus: [{
                                id: 'DDDDDD1',
                                name: '流程定义',
                                url: '#!process_manage_process_defination.html',
                                path: 'process/manage_process_defination.html',
                                sort: '0-1'
                            }]
                        });
                        currentMenu.push({
                            id: 'BBBBBBBB',
                            name: '系统管理',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '0',
                            subMenus: [{
                                id: 'BBBBBBBB1',
                                name: '用户管理',
                                url: '#!user',
                                path: 'system/user.html',
                                sort: '1-1'
                            }, {
                                id: 'BBBBBBBB2',
                                name: '部门管理',
                                url: '#!org',
                                path: 'system/org.html',
                                sort: '1-2'
                            }, {
                                id: 'BBBBBBBB3',
                                name: '职位管理',
                                url: '#!job',
                                path: 'system/job.html',
                                sort: '1-3'
                            }, {
                                id: 'BBBBBBBB4',
                                name: '供应商管理',
                                url: '#!supplier',
                                path: 'system/supplier.html',
                                sort: '1-4'
                            }, {
                                id: 'BBBBBBBB5',
                                name: '角色管理',
                                url: '#!role',
                                path: 'system/role.html',
                                sort: '1-5'
                            }, {
                                id: 'BBBBBBBB6',
                                name: '菜单管理',
                                url: '#!menu',
                                path: 'system/menu.html',
                                sort: '1-6'
                            }, {
                                id: 'BBBBBBBB7',
                                name: '数据字典',
                                url: '#!dic',
                                path: 'system/dic.html',
                                sort: '1-7'
                            }]
                        }, {
                            id: 'qt1210',
                            name: '项目管理',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '2',
                            subMenus: [{
                                    id: 'qt12101',
                                    name: '项目信息维护',
                                    url: '#!project',
                                    path: 'project/projectManage.html',
                                    sort: '2-1'
                                },
                                {
                                    id: 'qt12102',
                                    name: '项目信息查询',
                                    url: '#!project-search',
                                    path: 'project/projectManage.html',
                                    sort: '2-1'
                                }, {
                                    id: 'qt12103',
                                    name: '项目单2',
                                    url: '#!project2',
                                    path: 'parts/project_tracking_list_details_2.html',
                                    sort: '2-3'
                                }, {
                                    id: 'qt12104',
                                    name: '项目单1',
                                    url: '#!project1',
                                    path: 'parts/project_tracking_list_details_1.html',
                                    sort: '2-4'
                                }
                            ]
                        }, {
                            id: 'qt1222',
                            name: '零件管理',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '3',
                            subMenus: [{
                                    id: 'qt12221',
                                    name: '零件信息维护',
                                    url: '#!parts-manage',
                                    path: 'parts/part_info_maintain.html',
                                    sort: '3-1'
                                },
                                {
                                    id: 'qt12222',
                                    name: '零件信息查询',
                                    url: '#!parts-search',
                                    path: 'parts/part_info_query.html',
                                    sort: '3-2'
                                }
                            ]
                        }, {
                            id: 'qt1223',
                            name: '任务单管理',
                            url: 'javascript:;',
                            icon: 'icon-home',
                            sort: '4',
                            subMenus: [{
                                    id: 'qt12231',
                                    name: '零件任务待办',
                                    url: '#!parts-task-todo',
                                    path: 'parts/part_wait_mission.html',
                                    sort: '4-1'
                                },
                                {
                                    id: 'qt12232',
                                    name: '任务单待办',
                                    url: '#!task-order-todo',
                                    path: 'parts/task_sheet_agent.html',
                                    sort: '4-2'
                                },
                                {
                                    id: 'qt12233',
                                    name: '任务单查询',
                                    url: '#!task-order-search',
                                    path: 'parts/task_sheet_agent1.html',
                                    sort: '4-3'
                                }, {
                                    id: 'qt12234',
                                    name: 'OPAP审批单创建',
                                    url: '#!OPAP',
                                    path: 'parts/opap_approval_list.html',
                                    sort: '4-4'
                                }, {
                                    id: 'qt12235',
                                    name: 'OPAP审批单审批',
                                    url: '#!OPAP1',
                                    path: 'parts/opap_approval_list1.html',
                                    sort: '4-5'
                                }, {
                                    id: 'qt12236',
                                    name: 'OPAP审批单详情',
                                    url: '#!OPAP2',
                                    path: 'parts/opap_approval_list2.html',
                                    sort: '4-6'
                                }, {
                                    id: 'qt12237',
                                    name: 'sqe',
                                    url: '#!project9',
                                    path: 'parts/ppap_sqe.html',
                                    sort: '4-7'
                                }, {
                                    id: 'qt12238',
                                    name: 'PPAP供应商',
                                    url: '#!project10',
                                    path: 'parts/ppap_gystjwj.html',
                                    sort: '4-8'
                                }, {
                                    id: 'qt12239',
                                    name: 'PPAP创建',
                                    url: '#!project11',
                                    path: 'parts/ppap_create.html',
                                    sort: '4-9'
                                }, {
                                    id: 'qt122310',
                                    name: 'PPAP任务再次提交',
                                    url: '#!task-second-ppap',
                                    path: 'task/taskSecondApproval.html',
                                    sort: '4-10'
                                },
                                {
                                    id: 'qt122311',
                                    name: 'PPAP详情',
                                    url: '#!task-view-ppap',
                                    path: 'task/ppapDetails.html',
                                    sort: '4-11'
                                }
                            ]
                        });*/

                        config.menus = currentMenu;

                        // 渲染
                        $('.layui-layout-admin .layui-side').load('components/side.html', function () {
                            laytpl(sideNav.innerHTML).render(config.menus, function (html) {
                                $('#sideNav').after(html);
                            });
                            element.render('nav'); // 并不知道干什么用的渲染
                            admin.activeNav(Q.lash); // 设置导航栏选中
                            // 侧边栏 用户信息
                            $('.layui-layout-admin .layui-side .admin-user').vm(account);

                            $("a[href='#!project2']").css('height', '0');
                            $("a[href='#!project1']").css('height', '0');
                            $("a[href='#!OPAP']").css('height', '0');
                            $("a[href='#!OPAP1']").css('height', '0');
                            $("a[href='#!OPAP2']").css('height', '0');
                            $("a[href='#!project9']").css('height', '0');
                            $("a[href='#!project10']").css('height', '0');
                            $("a[href='#!project11']").css('height', '0');
                            $("a[href='#!task-second-ppap']").css('height', '0');
                            $("a[href='#!task-view-ppap']").css('height', '0');
                        });
                        // $('.layui-layout-admin .layui-footer').load('components/footer.html')
                    },
                    error: function (xhr) {
                        if (xhr.status === 404 || xhr.status === 401) {
                            // 可能是登录信息失效，跳转到登录页
                            config.removeAccount();
                            location.replace('./logout');
                        } else if (xhr.status === 502 || xhr.status === 504) {
                            layer.msg('后台服务不可用，请稍后再试');
                        }
                    }
                });
            }
        },

        /**
         * 路由注册
         *
         */
        initRouter: function () {
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
        regRouter: function (menus) {
            $.each(menus, function (i, data) {
                if (data.url && data.url.indexOf('#!') == 0) {
                    Q.reg(data.url.substring(2), function () {

                        if (data.path === 'risk/riskMap.html') {
                            window.open("components/risk/riskMap.html");
                            // window.location.open('./components/risk/riskMap.html', '_self');
                            // newWin("./components/risk/riskMap.html",'mylayer');
                        } else {
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
        loadView: function (menuId, menuPath, menuName, id) {
            var contentDom = '.layui-layout-admin .layui-body .layui-body-content';
            admin.showLoading();

            // 增加生命周期钩子，在当前页面被卸载之前执行的处理
            if (admin.beforeDestroy) {
                admin.beforeDestroy();
                admin.beforeDestroy = undefined;
            }

            // 加载页面
            if (menuPath.indexOf("?") != -1) {
                sessionStorage.setItem("riskFlag", menuPath.split("?")[1]);
                $(contentDom).load(menuPath.split("?")[0], function () {
                    // admin.removeLoading();
                    // 渲染 layui form
                    // 解决页面渲染完 form 元素未渲染的 bug
                    form.render();
                    $(".footer").remove();
                    $(".layui-tab-content").append("<div class=\"footer\">" +
                        "<div class=\"footer_in\">" +
                        "<div class=\"ri\">" +
                        "<span class=\"index2hidden\">" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"BM\">我的部门</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"YWGL\">我的业务</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLKF\">质量开发</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLBZ\">质量保障</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJNLGL\">Q+能力管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJGLXY\">Q+管理学院</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"GXGL\">风险管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CNGL\">产能管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CLTP\">材料图谱</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"XTGL\">系统管理</a>" +
                        "</span>" +
                        "<p>Copyright@2017 上汽通用五菱汽车股份有限公司 | 桂ICP备案号05006817号-1 | 桂公网安备45020402000009号</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>")
                });
            } else {
                $(contentDom).load(menuPath, function () {
                    admin.removeLoading();
                    // 渲染 layui form
                    // 解决页面渲染完 form 元素未渲染的 bug
                    form.render();
                    $(".footer").remove();
                    $(".layui-body").append("<div class=\"footer\">" +
                        "<div class=\"footer_in\">" +
                        "<div class=\"ri\">" +
                        "<span class=\"index2hidden\">" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"BM\">我的部门</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"YWGL\">我的业务</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLKF\">质量开发</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"ZLBZ\">质量保障</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJNLGL\">Q+能力管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"QJGLXY\">Q+管理学院</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"GXGL\">风险管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CNGL\">产能管理</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"CLTP\">材料图谱</a>" +
                        "&nbsp; | &nbsp;" +
                        "<a href=\"javascript:void(0)\" onclick=\"jump($(this),event)\" point=\"XTGL\">系统管理</a>" +
                        "</span>" +
                        "<p>Copyright@2017 上汽通用五菱汽车股份有限公司 | 桂ICP备案号05006817号-1 | 桂公网安备45020402000009号</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>")
                });
            }

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
        updateBreadcrumb: function (value) {
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
                var title = value[value.length - 1].name + ' | ';
                var modelName = '';
                switch (value[1].name) {
                    case '质量开发':
                        modelName = '供应商质量开发管理系统';
                        break;
                    case '质量保障':
                        modelName = '供应商质量保障管理系统';
                        break;
                    case 'Q+能力管理':
                        modelName = '供应商Q+能力管理系统';
                        break;
                    case '风险管理':
                        modelName = '供应商风险管理系统';
                        break;
                    case '产能管理':
                        modelName = '供应商产能管理系统';
                        break;
                    default:
                        modelName = value[1].name;
                        break;
                }
                $('#modelName').html(modelName);
            }
            window.document.title = title + 'SGMW';
        },
        /**
         * 通过 id 获取面包屑路径名称
         * 深度优先遍历
         *
         */
        getPathNameFromMenus: function (id, menus) {
            if (menus.subMenus) {
                for (var i = 0; i < menus.subMenus.length; i++) {
                    var tmp = index.getPathNameFromMenus(id, menus.subMenus[i]);
                    if (tmp) {
                        tmp.unshift({
                            name: menus.name,
                            path: menus.breadUrl
                        });
                        return tmp;
                    }
                }
            }
            if (id === menus.id) {
                return [{
                    name: menus.name,
                    path: menus.breadUrl
                }];
            } else {
                return false;
            }
        },

        /**
         * 页面元素绑定事件监听
         *
         */
        bindEvent: function () {
            // 退出登录
            $('#btn-logout').click(function () {
                layer.confirm('确定退出登录？', function () {
                    // admin.req('/api/logout', {}, function() {
                    config.removeAccount();
                    // replace() 方法不会在 History 对象中生成一个新的记录。当使用该方法时，新的 URL 将覆盖 History 对象中的当前记录。
                    // location.replace('./login.html?redirect_to=' + window.location.hash);
                    window.location.href = "/logout";
                    // });
                });
            });
            // 修改密码
            $('#btn-setpw').click(function () {
                // admin.popupRight('components/tpl/password.html');
                window.location.href = "/smsh/xtszTab/tabs1-3";
            });
            // 个人信息
            $('#btn-setinf').click(function () {
                var w = window.innerWidth < 700 ? '90%' : '700px';
                var h = window.innerHeight < 500 ? '80%' : '500px';
                admin.popupCenter({
                    title: '个人信息',
                    path: 'components/tpl/user_info_tpl.html',
                    area: [w, h],
                    resize: false,
                    btn: ['保存', '取消'],
                    yes: function () {
                        $('[lay-filter="userInfoSubmit"]').click();
                    },
                    finish: function () {
                    },
                    success: function () {
                    }
                });
            });
            // 消息
            $('#btn-getmsg').click(function () {
                admin.popupRight('components/tpl/message.html');
            });
        },

        /**
         * 初始化
         *
         */
        init: function () {
            if (window.location.hash.indexOf('#!suppliersubmission') != -1) {
                var supplierId = window.location.hash;
                if (supplierId.indexOf('?') === -1) {
                    sessionStorage.removeItem('supplierId');
                } else {
                    supplierId = supplierId.split('?')[1];
                    sessionStorage.setItem('supplierId', supplierId);
                    $.ajax({
                        type: 'get',
                        url: admin.formatUrl('/api/ppap/edum05user/getSupplierInfo'),
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
            } else if (window.location.hash.indexOf('#!supplier_submission_done') != -1 || window.location.hash.indexOf('#!ppap_supplier') != -1 || window.location.hash.indexOf('#!task-second-ppap-supplier') != -1 || window.location.hash.indexOf('#!task-view-ppap-supplier') != -1 || window.location.hash.indexOf('#!parts-managment') != -1) {
                //页面清空缓存后供应商信息丢失-bug修复
                var supplierId = sessionStorage.getItem('supplierId');
                if (supplierId) {
                    $.ajax({
                        type: 'get',
                        url: admin.formatUrl('/api/ppap/edum05user/getSupplierInfo'),
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
                    url: admin.formatUrl(config.base_server + '/api/login-detail'),
                    async: false,
                    success: function (res) {
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
                (function () {
                    $('.scroll-notice div span').text(config.ADCScrollNoticeString);
                    var innerWidth = $('.scroll-notice div span').width(),
                        outerWidth = $('.scroll-notice').width(),
                        offset = 20;
                    $('.scroll-notice div span').css('padding', outerWidth + offset);
                    $('.scroll-notice div').scrollLeft(outerWidth - offset);
                    window.ADCScrollNotice = setInterval(function () {
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
                admin.req('/api/onlineUser', {}, function (res) {
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
