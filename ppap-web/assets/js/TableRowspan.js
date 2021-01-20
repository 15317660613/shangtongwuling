/**
 * layui表格合并单元格
 */
var TableRowspan = {
    ExecRowspan: function(id, fieldName, index, flag) {
        // 1为不冻结的情况，左列为冻结的情况
        var fixedNode = index == "1" ? $("#" + id + "").next().find('.layui-table-body')[index - 1] : (index == "3" ? $(".layui-table-fixed-r") : $(".layui-table-fixed-l"));
        //console.log(fixedNode);
        // 左侧导航栏不冻结的情况
        var child = $(fixedNode).find("td");
        var childFilterArr = [];

        // 获取data-field属性为fieldName的td
        for (var i = 0; i < child.length; i++) {
            if (child[i].getAttribute("data-field") == fieldName) {
                childFilterArr.push(child[i]);
            }
        }
        // 获取td的个数和种类
        var childFilterTextObj = {};
        for (var i = 0; i < childFilterArr.length; i++) {
            var childText = flag ? childFilterArr[i].innerHTML : childFilterArr[i].textContent;
            if (childFilterTextObj[childText] == undefined) {
                childFilterTextObj[childText] = 1;
            } else {
                var num = childFilterTextObj[childText];
                childFilterTextObj[childText] = num * 1 + 1;
            }
        }
        var canRowspan = true;
        var maxNum; //以前列单元格为基础获取的最大合并数
        var finalNextIndex; //获取其下第一个不合并单元格的index
        var finalNextKey; //获取其下第一个不合并单元格的值
        for (var i = 0; i < childFilterArr.length; i++) {
            (maxNum > 9000 || !maxNum) && (maxNum = $(childFilterArr[i]).prev().attr("rowspan") && fieldName != "8" ? $(childFilterArr[i]).prev().attr("rowspan") : 9999);
            var key = flag ? childFilterArr[i].innerHTML : childFilterArr[i].textContent; //获取下一个单元格的值
            var nextIndex = i + 1;
            var tdNum = childFilterTextObj[key];
            var curNum = maxNum < tdNum ? maxNum : tdNum;
            if (canRowspan) {
                for (var j = 1; j <= curNum && (i + j < childFilterArr.length);) { //循环获取最终合并数及finalNext的index和key
                    finalNextKey = flag ? childFilterArr[i + j].innerHTML : childFilterArr[i + j].textContent;
                    finalNextIndex = i + j;
                    if ((key != finalNextKey && curNum > 1) || maxNum == j) {
                        canRowspan = true;
                        curNum = j;
                        break;
                    }
                    j++;
                    if ((i + j) == childFilterArr.length) {
                        finalNextKey = undefined;
                        finalNextIndex = i + j;
                        break;
                    }
                }
                childFilterArr[i].setAttribute("rowspan", curNum);
                if ($(childFilterArr[i]).find("div.rowspan").length > 0) { //设置td内的div.rowspan高度适应合并后的高度
                    $(childFilterArr[i]).find("div.rowspan").parent("div.layui-table-cell").addClass("rowspanParent");
                    $(childFilterArr[i]).find("div.layui-table-cell")[0].style.height = curNum * 38 - 10 + "px";
                }
                canRowspan = false;
            } else {
                childFilterArr[i].style.display = "none";
            }
            if (--childFilterTextObj[key] == 0 | --maxNum == 0 | --curNum == 0 | (finalNextKey != undefined && nextIndex == finalNextIndex)) { //||(finalNextKey!=undefined&&key!=finalNextKey)
                canRowspan = true;
            }
        }
    },

    LayuiRowspan: function(id, fieldNameTmp, index, flag) {
        var fieldName = [];
        if (typeof fieldNameTmp == "string") {
            fieldName.push(fieldNameTmp);
        } else {
            fieldName = fieldName.concat(fieldNameTmp);
        }
        for (var i = 0; i < fieldName.length; i++) {
            TableRowspan.ExecRowspan(id, fieldName[i], index, flag);
        }
    }
}