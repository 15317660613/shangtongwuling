## 生产线名称
- GET /api-edu/interaction/oeeEquipmentEfficency/PLineName
add by 安雨石
账户8450091admin
请求参数
```
无
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "plineCode": "HXGHX007",
      "plineName": "河西挂焊线"
    },
    {
      "plineCode": "HXZDHX006",
      "plineName": "河西自动焊线"
    },
    {
      "plineCode": "HXZHX008",
      "plineName": "河西座焊线"
    },
    {
      "plineCode": "LDGHX004",
      "plineName": "柳东挂焊线"
    },
    {
      "plineCode": "LDZDHX001",
      "plineName": "柳东自动焊线"
    },
    {
      "plineCode": "LDZHX005",
      "plineName": "柳东座焊线"
    },
    {
      "plineCode": "XXCYAX009",
      "plineName": "冲压A线"
    },
    {
      "plineCode": "XXCYAX015",
      "plineName": "冲压G线"
    },
    {
      "plineCode": "XXCYBX010",
      "plineName": "冲压B线"
    },
    {
      "plineCode": "XXCYCX011",
      "plineName": "冲压C线"
    },
    {
      "plineCode": "XXCYDX012",
      "plineName": "冲压D线"
    },
    {
      "plineCode": "XXCYEX013",
      "plineName": "冲压E线"
    },
    {
      "plineCode": "XXCYFX014",
      "plineName": "冲压F线"
    },
    {
      "plineCode": "XXCYHX016",
      "plineName": "冲压H线"
    },
    {
      "plineCode": "XXCYJX017",
      "plineName": "冲压J线"
    },
    {
      "plineCode": "XXCYKX018",
      "plineName": "冲压K线"
    },
    {
      "plineCode": "XXCYLX019",
      "plineName": "冲压L线"
    }
  ],
  "ok": true,
  "message": ""
}
```

## 获取柱状图
- GET /api-edu/interaction/oeeEquipmentEfficency/barGraph
add by  安雨石
请求参数
```
startDate   开始时间 非必填  date 格式yyyy-MM-dd
endDate   开始时间 非必填  date 格式yyyy-MM-dd
productionAreaId  生产区域  非必填 string
processTypeId   工艺类型  非必填  string
teamNameId  班组名称  非必填  string
classes  班次  非必填  string
plineCode  生产线编号  非必填  string
dateType  日周月  必填  string （day，week，month）
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "name": "201804",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201805",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201806",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201807",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201808",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201809",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201810",
      "value": 0.4959,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201811",
      "value": 0.4581,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201812",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201901",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201902",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "201903",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    }
  ],
  "ok": true,
  "message": "2018年04月-2019年03月"
}
```



## 工艺类型下拉列表
- GET /api-edu/interaction/oeeEquipmentEfficency/processType
add by 安雨石
账户  8450091admin
请求参数
```
无
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "typeName": "冲压",
      "typeId": "CY"
    },
    {
      "typeName": "硫化",
      "typeId": "LH"
    },
    {
      "typeName": "旋压",
      "typeId": "XY"
    }
  ],
  "ok": true,
  "message": ""
}
```

## 生产区域下拉列表
- GET /api-edu/interaction/oeeEquipmentEfficency/productionArea
add  by  安雨石
请求参数
```
无
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "typeName": "河西焊接车间",
      "typeId": "HZHJCJ"
    },
    {
      "typeName": "柳东焊接车间",
      "typeId": "LDHJCJ"
    },
    {
      "typeName": "新兴冲压车间",
      "typeId": "XXCYCJ"
    }
  ],
  "ok": true,
  "message": ""
}
```



## 班组名称
- GET /api-edu/interaction/oeeEquipmentEfficency/teamName
add by  安雨石
账户8450095admin
请求参数    
```
无
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "typeName": "河西焊接A班",
      "typeId": "HXHJAB"
    },
    {
      "typeName": "河西焊接B班",
      "typeId": "HXHJBB"
    },
    {
      "typeName": "柳东焊接A班",
      "typeId": "LDHJAB"
    },
    {
      "typeName": "柳东焊接B班",
      "typeId": "LDHJBB"
    },
    {
      "typeName": "模具维修班",
      "typeId": "MJWXB"
    },
    {
      "typeName": "冲压A班",
      "typeId": "XXCYCJAB"
    },
    {
      "typeName": "冲压B班",
      "typeId": "XXCYCJBB"
    }
  ],
  "ok": true,
  "message": ""
}
```

## top10柱状图
- GET /api-edu/interaction/oeeEquipmentEfficency/top10
add by  安雨石
账号：8450091admin
请求参数
startDate  2018-01-01   
endDate    2019-01-01
dateType   day 
typeName   生产线 班组名称 工艺类型
```
startDate   开始时间 非必填  date 格式yyyy-MM-dd
endDate   开始时间 非必填  date 格式yyyy-MM-dd
productionAreaId  生产区域  非必填 string
processTypeId   工艺类型  非必填  string
teamNameId  班组名称  非必填  string
classes  班次  非必填  string
plineCode  生产线编号  非必填  string
dateType  日周月  必填  string （day，week，month）
typeName  类型名  必填  string（生产线，班组名称，工艺类型）
```
响应成功
```
{
  "respCode": "0",
  "data": [
    {
      "name": "冲压E线",
      "value": 0.5485,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压B线",
      "value": 0.5021,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压C线",
      "value": 0.4699,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压D线",
      "value": 0.4431,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压A线",
      "value": 0.336,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压H线",
      "value": 0.3353,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压L线",
      "value": 0.2949,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    },
    {
      "name": "冲压J线",
      "value": 0,
      "dateTimeForWeek": null,
      "dateTime": null,
      "target": null
    }
  ],
  "ok": true,
  "message": "2018年04月-2019年03月"
}
```