//接口地址

var InterfaceMap = {
    /**********基础信息-供应商**********/
    supplier: {
        getSelectLevelUrl: "/api/base/baseSupplier/allLevel", //获取顶部查询条件中，供应商级别下拉菜单中的选项数据的接口
        getSelectRegionUrl: "/api/base/baseSupplier/allRegion", //获取顶部查询条件中，区域下拉菜单中的选项数据的接口
        getAllTableDataUrl: "/api/base/baseSupplier/page", //获取表格所有数据的接口
        addOrEditTableDataUrl: "/api/base/baseSupplier/saveOrUpdate", //新增或编辑表格数据的接口
        deleteTableDataUrl: "/api/base/baseSupplier/delete", //删除表格数据的接口
    },

    /**********基础信息-长周期物料**********/
    longTermMateriel: {
        getSelectFactoryBaseUrl: "/api/base/longCycleList/allFactoryBase", //获取顶部查询条件中，生产基地下拉菜单中的选项数据的接口
        getSelectSupplierNameUrl: "/api/base/longCycleList/allSupplierName", //获取顶部查询条件中，供应商名称下拉菜单中的选项数据的接口
        getSelectSupplierCodeUrl: "/api/base/longCycleList/allSupplierCode", //获取顶部查询条件中，供应商代码下拉菜单中的选项数据的接口
        getSelectPartCodeUrl: "/api/base/longCycleList/allPartCode", //获取顶部查询条件中，零件号下拉菜单中的选项数据的接口
        getSelectPartNameUrl: "/api/base/longCycleList/allPartName", //获取顶部查询条件中，零件名称下拉菜单中的选项数据的接口
        getSelectVehicleTypeUrl: "/api/base/longCycleList/allVehiclePlatform", //获取顶部查询条件中，车型机型下拉菜单中的选项数据的接口
        getSelectIsImportedMaterialUrl: "/api/base/longCycleList/aLLIsImportedMaterial", //获取顶部查询条件中，是否进口下拉菜单中的选项数据的接口
        getSelectImportCountryUrl: "/api/base/longCycleList/allImportCountry", //获取顶部查询条件中，进口国家下拉菜单中的选项数据的接口
        getSelectPlanerUrl: "/api/base/longCycleList/allPlaner", //获取顶部查询条件中，计划员下拉菜单中的选项数据的接口

        getAllTableDataUrl: "/api/base/longCycleList/page", //获取表格所有数据的接口
        addOrEditTableDataUrl: "/api/base/longCycleList/saveOrUpdate", //新增或编辑表格数据的接口
        publishTableDataUrl: "/api/base/longCycleList/publish", //发布数据的接口
        deleteTableDataUrl: "/api/base/longCycleList/delete", //删除表格数据的接口

        getViceDataUrl: "/api/base/longCycleList/child" //获取副表格对应的数据
    },

    /**********基础信息-第三方物流公司**********/
    thirdPartyLogistics: {
        getSelectSGMWBaseUrl: "/api/base/logistics/queryAllBase", //获取顶部查询条件中，生产基地下拉菜单中的选项数据的接口

        getAllTableDataUrl: "/api/base/logistics/page", //获取表格所有数据的接口
        addOrEditTableDataUrl: "/api/base/logistics/saveOrUpdate", //新增或编辑表格数据的接口
        deleteTableDataUrl: "/api/base/logistics/delete", //删除表格数据的接口
        getViceFirstDataUrl: "/api/base/longCycleList/child" //获取副表格部分中第一个标签页对应的表格的数据
    },
     /**********交付索赔-供应商**********/
     claimForCompensation: {
        getSelectLevelUrl: "/api/base/baseSupplier/allLevel", //获取顶部查询条件中，供应商级别下拉菜单中的选项数据的接口
        getSelectRegionUrl: "/api/base/baseSupplier/allRegion", //获取顶部查询条件中，区域下拉菜单中的选项数据的接口
        getAllTableDataUrl: "/api/compensate/compensate/page/administrator", //获取表格所有数据的接口
        addOrEditTableDataUrl: "/api/compensate/compensate/saveOrUpdate", //新增或编辑表格数据的接口
        deleteTableDataUrl: "/api/compensate/compensate/delete", //删除表格数据的接口
        publishTableDataUrl:"/api/compensate/compensate/release"//发布索赔单接口
    },


}
