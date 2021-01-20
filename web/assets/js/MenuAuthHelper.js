/*
 * File   : MenuAuthHelper.js
 * Created: Wednesday September 12th 2018 2:05:26 pm
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
 * Last Modified: Wednesday October 17th 2018 12:48:36 pm
 * Modified By  : yuchunyu97 at <yuchunyu97@gmail.com>
 * -----
 * Description: 菜单处理辅助类，处理和菜单相关的问题
 * -----
 * HISTORY:
 */

var MenuAuthHelper = function(data) {
    // 只能通过 new 创建对象
    if (!(this instanceof MenuAuthHelper)) {
        throw new Error('Please instantiate the object via new');
    }
    // 传入的 data 必须为一个有内容的数组
    if (!data || !data.length || data.length <= 0) {
        throw new Error('Invalid param data');
    }
    // 保存传入的原始数据
    // 原始数据的格式为 id pid 的样子
    this.rawdata1 = data;
    this.rawdata = data;
    this.treedata = [];
    // 储存每个菜单权限中 belong 为 true 的 ID 值
    // 默认保存顶级菜单的权限
    this.permission = ['0']; // 顶级菜单id
    this.config = {
        id: 'id',
        pid: 'pid',
        rootValue: '0',
        childrenKey: 'children'
    };

    // 生成树形数据
    (function(that) {
        for (var i = 0; i < that.rawdata.length; i++) {
            if (that.rawdata[i].isAction == 0 || that.rawdata[i].isAction == 1) {
                that.rawdata[i].checked = that.rawdata[i].belong == "1" ? true : false;
                that.rawdata[i].url = "";
            } else {
                that.rawdata[i].belong == "1" ? that.permission.push(that.rawdata[i].id) : "";
                that.rawdata.splice(i, 1);
                i--;
            }
        }
        // that.rawdata.map(function(value, index) {
        //     if (value.isAction == 0 || value.isAction == 1) {
        //         value.checked = value.belong == "1" ? true : false;
        //         value.url = "";
        //         return value;
        //     } else {
        //         that.permission.push(value.id);
        //         that.rawdata.splice(index, 1)
        //     }
        // });
        // var NOW;
        // for (var i = 0; i < that.rawdata.length; i++) {
        //     var itemI = that.rawdata[i];
        //     // 判断是否为根结点
        //     if (itemI[that.config.pid] === that.config.rootValue) {
        //         NOW = i;
        //         continue;
        //     }
        //     for (var j = 0; j < that.rawdata.length; j++) {
        //         if (i === j) {
        //             continue;
        //         }
        //         var itemJ = that.rawdata[j];
        //         if (itemI[that.config.pid] === itemJ[that.config.id]) {
        //             if (!itemJ[that.config.childrenKey] || Object.prototype.toString.call(itemJ[that.config.childrenKey]) !== '[object Array]') {
        //                 itemJ[that.config.childrenKey] = [];
        //             }
        //             itemJ[that.config.childrenKey].push(itemI);
        //             break;
        //         }
        //     }
        // }
        that.treedata = that.rawdata;
    })(this);

    // 初始化 permission 
    // (function(that) {
    //     var menus = that.rawdata1;
    //     for (var i = 0; i < menus.length; i++) {
    //         if (menus[i].belong == '1') {
    //             that.permission.push(menus[i].id);
    //         }
    //     }
    // })(this);

    /**
     * 通过 id 来获取其子节点信息
     *
     * @param {*} id
     * @returns
     */
    this.getChildren = function(id) {
        var arr = [];
        arr = arr.concat(this.treedata);
        while (arr.length > 0) {
            var tmp = arr.shift();
            if (tmp[this.config.id] === id) {
                return tmp;
            }
            if (tmp[this.config.childrenKey]) {
                arr = tmp[this.config.childrenKey].concat(arr);
            }
        }
        return null;
    };

    /**
     * 保存新的 permission id
     *
     * @param {*} id
     * @returns
     */
    this.addPermission = function(id) {
        for (var i = 0; i < this.permission.length; i++) {
            if (this.permission[i] === id) {
                return true;
            }
        }
        this.permission.push(id);
        return true;
    };
    /**
     * 删除已有的 permission id
     *
     * @param {*} id
     * @returns
     */
    this.removePermission = function(id) {
        for (var i = 0; i < this.permission.length; i++) {
            if (this.permission[i] === id) {
                this.permission.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    /**
     * 获取已保存的 permission id
     *
     * @returns
     */
    this.getPermission = function() {
        return this.permission;
    };


};