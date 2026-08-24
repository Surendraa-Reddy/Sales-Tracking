sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "salesordertracking.zsotracking.controller.SalesDashboard",
        {

            onInit: function () {

                var oDashboardModel =
                    new JSONModel({

                        TotalOrders: 0,
                        OpenOrders: 0,
                        InProcessOrders: 0,
                        DeliveredOrders: 0

                    });

                this.getView()
                    .setModel(
                        oDashboardModel,
                        "dashboard"
                    );


                this._loadDashboardData();
            },


            _loadDashboardData: function () {

                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                var that = this;


                oModel.read(
                    "/SalesOrderSet",
                    {

                        success: function (oData) {

                            var aOrders =
                                oData.results || [];

                            var iTotal =
                                aOrders.length;

                            var iOpen = 0;

                            var iInProcess = 0;

                            var iDelivered = 0;


                            aOrders.forEach(
                                function (oOrder) {

                                    switch (
                                    oOrder.Status
                                    ) {

                                        case "OPEN":
                                            iOpen++;
                                            break;

                                        case "IN_PROCESS":
                                            iInProcess++;
                                            break;

                                        case "DELIVERED":
                                            iDelivered++;
                                            break;

                                    }

                                }
                            );


                            that.getView()
                                .getModel("dashboard")
                                .setData({

                                    TotalOrders: iTotal,

                                    OpenOrders: iOpen,

                                    InProcessOrders:
                                        iInProcess,

                                    DeliveredOrders:
                                        iDelivered

                                });

                        },


                        error: function (oError) {

                            console.error(
                                "Unable to load Sales Orders",
                                oError
                            );

                        }

                    }
                );

            },


            onViewOrders: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList"
                    );

            },


            onTotalOrdersPress: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList"
                    );

            },


            onOpenOrdersPress: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList",
                        {
                            status: "OPEN"
                        }
                    );

            },


            onInProcessPress: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList",
                        {
                            status: "IN_PROCESS"
                        }
                    );

            },


            onDeliveredPress: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList",
                        {
                            status: "DELIVERED"
                        }
                    );

            },


            onRefresh: function () {

                this._loadDashboardData();

            },


            onLogout: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "Login"
                    );

            }

        }
    );
});