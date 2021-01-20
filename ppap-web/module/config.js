/*
 * File   : config.js
 * Created: Thursday August 30th 2018 11:34:38 am
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
 * Last Modified: Friday November 2nd 2018 2:38:47 pm
 * Modified By  : yuchunyu97 at <yuchunyu97@gmail.com>
 * -----
 * Description: 配置文件
 * -----
 * HISTORY:
 * 2018-08-30	yuchunyu97	完成基本配置，以及对用户信息的保存、获取与清除
 */

layui.define(function(exports) {
    layui.define(function(exports) {
        var config = {
            // 后台地址 http://221.239.111.146:50028/swagger-ui.html
            // 旧版前端 http://221.239.111.146:50028/html/index.html
            base_server: '', // 接口地址，实际项目请换成http形式的地址，空表示当前地址
            tableName: 'ADCDA', // 存储表名
            autoRender: false, // 窗口大小改变后是否自动重新渲染表格，解决layui数据表格非响应式的问题，目前实现的还不是很好，暂时关闭该功能

            // 顶部信息滚动条
            ADCScrollNotice: false,
            ADCScrollNoticeSpeed: 5,
            ADCScrollNoticeString: '',

            // 自动获取数据的时间，毫秒
            ADCPullTime: 1000 * 60 * 30,
            /**
             * 保存登录信息
             *
             * @param {*} account
             */
            putAccount: function(account) {
                layui.data(config.tableName, {
                    key: 'account',
                    value: JSON.stringify(account)
                });
            },
            /**
             * 获取登录信息
             *
             * @returns
             */
            getAccount: function() {
                // if (window.location.hash.indexOf('#!suppliersubmission') != -1){
                //  return JSON.parse('{"avatar":"/assets/images/avatar/girl1.png",  "userId": "3133", "companyCode": "SGMW", "companyName": "上汽通用五菱汽车股份有限公司", "createDate": 1493777369193, "createerId": 88, "departCode": "11", "email": "yinjie.wang@sgmw.com.cn;414516024@qq.com", "failedTimes": 2, "ipAddr": "127.0.0.1", "jobCode": "1", "jobName": "总经理", "lastLogin": 1539877605257, "userCode": "admin", "online": "LEAVE", "py": "xtgly", "relation": null, "remark": "", "roleId": "1,117", "roleName": "sqe", "status": "0", "updateDate": 1533610792113, "updateerId": 201, "userName": "系统管理员", "userType": "A", "fileId": null, "signType": "0", "isPaswd": null }');
                // }
                // return JSON.parse('{"avatar":"/assets/images/avatar/girl1.png",  "userId": "3133", "companyCode": "SGMW", "companyName": "上汽通用五菱汽车股份有限公司", "createDate": 1493777369193, "createerId": 88, "departCode": "11", "email": "yinjie.wang@sgmw.com.cn;414516024@qq.com", "failedTimes": 2, "ipAddr": "127.0.0.1", "jobCode": "1", "jobName": "总经理", "lastLogin": 1539877605257, "userCode": "admin", "online": "LEAVE", "py": "xtgly", "relation": null, "remark": "", "roleId": "1,117", "roleName": "sqe", "status": "0", "updateDate": 1533610792113, "updateerId": 201, "userName": "系统管理员", "userType": "A", "fileId": null, "signType": "0", "isPaswd": null }');
                var t = layui.data(config.tableName).account;
                if (t) {
                    return JSON.parse(t);
                } else {
                    // 如果登录信息为空，且当前页面不是登录页
                    // 首页信息有问题的时候退出到登录页
                    // debugger;
                    /*if (window.location.pathname !== '/login.html') {
                        config.removeAccount();
                        location.replace('./login.html');
                    }*/
                    return false;
                }
            },
            /**
             * 清除登录信息
             *
             */
            removeAccount: function() {
                layui.data(config.tableName, {
                    key: 'account',
                    remove: true
                });
            },
            // 导航菜单，最多支持三级，因为还有判断权限，所以渲染左侧菜单很复杂，无法做到递归，你需要更多极请联系我添加，添加可以无限添加，只是无法做到递归
            menus: []

        };
        exports('config', config);
    });
})