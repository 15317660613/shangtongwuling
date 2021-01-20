/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

/*
 * Group Modify By Sucdaze 2018-06-07
 */
var KisBpmGroupDeptCtrl = ['$scope', '$modal', function ($scope, $modal) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/groupdept-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var KisBpmGroupDeptPopupCtrl = ['$scope', '$http', function ($scope, $http) {

    //选中的受理组
    $scope.selectedDepart = [];

    //初始化
    $scope.init = function () {
        if ($scope.property.value) {
            $http({
                method: 'GET',
                url: KISBPM.URL.getRoleById($scope.property.value)
            }).success(function (data, status, headers, config) {
                if (!data.data) {
                    return;
                }
                if (data.ok == true) {
                    var roleObj = {};
                    roleObj.rid = data.data.rid;
                    roleObj.rname = data.data.rname;
                    $scope.selectedRoleArr.push(roleObj);
                }
            }).
            error(function (data, status, headers, config) {
                console.log('init of KisBpmGroupPopupCtrl is wrong!');
            });
        }
    }

    $scope.init();

//组织机构树参数配置
    $scope.treeSetting = {
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentId",
                rootPId: 0
            },
            key: {
                name: "name"
            }
        },
        callback: {
            onClick: function (event, treeId, treeNode, clickFlag) {
               // var searchUrl = KISBPM.URL.getUserByOrgId() + "?orgId=" + treeNode.id;
                var orgId = treeNode.id;
                var orgObj = {};
                orgObj.orgId = treeNode.id;
                orgObj.orgName = treeNode.name;
                $scope.selectedDepart[0] = orgObj;
                //alert(treeNode.name);
                /*$http({
                    method: 'GET',
                    url: searchUrl
                }).success(function (data, status, headers, config) {
                    if (data.ok == true) {
                        $scope.userList = data.data;
                        $scope.searchList = data.data;
                    }
                }).error(function (data, status, headers, config) {
                    console.log('getUserList of KisBpmAssignmentPopupCtrl is wrong!');
                });*/
            }
        }
    };
    //获取组织机构树
    $scope.getOrgList = function () {
        $http({
            method: 'GET',
            url: KISBPM.URL.getOrgList()
        }).success(function (data, status, headers, config) {
            if (data.ok == true) {
                console.log(data.data);
                var node = {};
                node.delFlag = 0;
                node.id = "-1";
                node.name = "同发起人";
                node.parentId = "0";
                node.parentIds = "0,";
                data.data.push(node);
                $scope.orgList = data.data;
                jQuery.fn.zTree.init(jQuery("#orgTree"), $scope.treeSetting, $scope.orgList);
            }
        }).
        error(function (data, status, headers, config) {
            console.log('getOrgList of KisBpmAssignmentPopupCtrl is wrong!');
        });
    };


    //执行 获取组织机构树
    $scope.getOrgList();



    //受理组检索
    $scope.doSearch = function () {
        if ($scope.roleList instanceof Array) {
            var keyWords = $scope.searchText;
            if (keyWords != "" && keyWords != null) {
                var dataArr = $scope.roleList;
                var reg = new RegExp(keyWords);
                $scope.searchList = [];
                for (var i = 0; i < dataArr.length; i++) {
                    if (dataArr[i].rname.match(reg)) {
                        $scope.searchList.push(dataArr[i]);
                    }
                }
            } else {
                $scope.searchList = $scope.roleList;
            }
        }
    }

    //保存按钮
    $scope.save = function () {
        if($scope.selectedDepart.length > 0){
            $scope.property.value = $scope.selectedDepart[0].orgId;
        }
        else{
            $scope.property.value = null;
        }
        var str = '[{"value":"' + $scope.property.value + '","$$hashKey":"' + $scope.property.$$hashKey + '"}]';
        var assignment = '{"assignment": {"candidateGroups": [{"value":"' + $scope.property.value + '","$$hashKey":"' + $scope.property.$$hashKey + '"}]}}';
        for (var i = 0; i < $scope.selectedItem.properties.length; i++) {

            if ($scope.selectedItem.properties[i].key == "oryx-usertaskassignment") {
                if (typeof ($scope.selectedItem.properties[i].value) == "object") {
                    if (!($scope.property.value == null)) {
                        $scope.selectedItem.properties[i].value.assignment.candidateGroups = JSON.parse(str);
                    } else {
                        if ($scope.selectedItem.properties[i].value.assignment.candidateGroups) {
                            delete $scope.selectedItem.properties[i].value.assignment.candidateGroups;
                        }
                    }
                } else {
                    if (!($scope.property.value == null)) {
                        $scope.selectedItem.properties[i].value = JSON.parse(assignment);
                    }
                }
                $scope.updatePropertyInModel($scope.selectedItem.properties[i]);
            }
        }
        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    // Close button handler
    $scope.close = function () {
        //handleAssignmentInput($scope);
        $scope.property.mode = 'read';
        $scope.$hide();
    };

}];



var GroupDeptDisplayCtrl = ['$scope', '$http', function ($scope, $http) {
    //console.log($scope.property);
    if($scope.property.value == "-1"){
        $scope.orgName = "同发起人";
    }
    else {
        $http({
            method: 'GET',
            url: KISBPM.URL.getOrgById($scope.property.value)
        }).success(function (data, status, headers, config) {
            console.log(data);
            if (!data.data) {
                return;
            }
            if (data.ok == true) {
                $scope.orgName = data.data.name;
            }
        }).
        error(function (data, status, headers, config) {
            console.log('GroupDisplayCtrl is wrong!');
        });
    }

    $scope.clearCandidateGroups = function () {
        $scope.property.value = null;
        $scope.updatePropertyInModel($scope.property);
        for (var i = 0; i < $scope.selectedItem.properties.length; i++) {

            if ($scope.selectedItem.properties[i].key == "oryx-usertaskassignment") {
                if (typeof ($scope.selectedItem.properties[i].value) == "object") {
                    if ($scope.selectedItem.properties[i].value.assignment.candidateGroups) {
                        delete $scope.selectedItem.properties[i].value.assignment.candidateGroups;
                    }
                }
                //$scope.updatePropertyInModel($scope.selectedItem.properties[i]);
            }
        }
    }
}];


