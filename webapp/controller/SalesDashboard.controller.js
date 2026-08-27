sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "salesordertracking.zsotracking.controller.SalesDashboard",
        {
            onInit: function () {
                var oDashboardModel = new JSONModel({
                    TotalOrders: 0,
                    OpenOrders: 0,
                    InProcessOrders: 0,
                    DeliveredOrders: 0,
                    TotalSales: "0.00",
                    AverageOrderValue: "0.00",
                    TotalItems: 0,
                    Currency: "INR",
                    LastRefreshText: "Last refreshed: --",
                    StatusData: [],
                    RecentOrders: []
                });

                this.getView().setModel(
                    oDashboardModel,
                    "dashboard"
                );

                this._loadDashboardData();
            },

            _loadDashboardData: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oDashboardModel = this.getView().getModel("dashboard");

                this.getView().setBusy(true);

                // 1. Fetch total line item count directly from backend database table
                oModel.read("/SalesOrderItemSet/$count", {
                    success: function (iCount) {
                        oDashboardModel.setProperty(
                            "/TotalItems",
                            parseInt(iCount, 10) || 0
                        );
                    },
                    error: function (oError) {
                        console.error("Item count fetch failed:", oError);
                        oDashboardModel.setProperty("/TotalItems", 0);
                    }
                });

                // 2. Fetch sales order headers
                oModel.read("/SalesOrderSet", {
                    success: function (oData) {
                        var aOrders = oData.results || [];

                        var iTotal = aOrders.length;
                        var iOpen = 0;
                        var iInProcess = 0;
                        var iDelivered = 0;
                        var fTotalSales = 0;
                        var sCurrency = "INR";

                        aOrders.forEach(function (oOrder) {
                            switch (oOrder.Status) {
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

                            fTotalSales += parseFloat(oOrder.TotalAmount) || 0;

                            if (oOrder.Currency) {
                                sCurrency = oOrder.Currency;
                            }
                        });

                        var fAverage = iTotal > 0 ? fTotalSales / iTotal : 0;

                        var aStatusData = [
                            { Status: "Open", Count: iOpen },
                            { Status: "In Process", Count: iInProcess },
                            { Status: "Delivered", Count: iDelivered }
                        ];

                        var aRecentOrders = aOrders.slice(0, 5).map(
                            function (oOrder) {
                                return {
                                    SoId: oOrder.SoId,
                                    CustomerName: oOrder.CustomerName,
                                    OrderDate: this._formatDate(oOrder.OrderDate),
                                    Status: oOrder.Status,
                                    StatusState: this._getStatusState(oOrder.Status),
                                    TotalAmount: parseFloat(oOrder.TotalAmount) || 0,
                                    Currency: oOrder.Currency || sCurrency
                                };
                            }.bind(this)
                        );

                     
                        oDashboardModel.setProperty("/TotalOrders", iTotal);
                        oDashboardModel.setProperty("/OpenOrders", iOpen);
                        oDashboardModel.setProperty("/InProcessOrders", iInProcess);
                        oDashboardModel.setProperty("/DeliveredOrders", iDelivered);
                        oDashboardModel.setProperty("/TotalSales", fTotalSales.toFixed(2));
                        oDashboardModel.setProperty("/AverageOrderValue", fAverage.toFixed(2));
                        oDashboardModel.setProperty("/Currency", sCurrency);
                        oDashboardModel.setProperty("/LastRefreshText", "Last refreshed: " + new Date().toLocaleTimeString());
                        oDashboardModel.setProperty("/StatusData", aStatusData);
                        oDashboardModel.setProperty("/RecentOrders", aRecentOrders);

                        this.getView().setBusy(false);
                    }.bind(this),

                    error: function (oError) {
                        this.getView().setBusy(false);
                        console.error("Dashboard loading failed:", oError);
                        MessageToast.show("Unable to load dashboard data.");
                    }.bind(this)
                });
            },

            _formatDate: function (vDate) {
                if (!vDate) {
                    return "";
                }

                if (vDate instanceof Date) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "yyyy-MM-dd"
                    });
                    return oDateFormat.format(vDate);
                }

                if (typeof vDate === "string") {
                    return vDate.replace(/[^0-9-]/g, "");
                }

                return String(vDate);
            },

            _getStatusState: function (sStatus) {
                switch (sStatus) {
                    case "OPEN":
                        return "Warning";
                    case "IN_PROCESS":
                        return "Information";
                    case "DELIVERED":
                        return "Success";
                    case "CANCELLED":
                        return "Error";
                    default:
                        return "None";
                }
            },

            onViewOrders: function () {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList");
            },

            onTotalOrdersPress: function () {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList");
            },

            onOpenOrdersPress: function () {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList", { status: "OPEN" });
            },

            onInProcessPress: function () {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList", { status: "IN_PROCESS" });
            },

            onDeliveredPress: function () {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList", { status: "DELIVERED" });
            },

            onRecentOrderPress: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("dashboard");
                if (!oContext) {
                    return;
                }
                var sSoId = oContext.getProperty("SoId");
                this.getOwnerComponent().getRouter().navTo("SalesOrderItemList", { SoId: sSoId });
            },

            onRefresh: function () {
                this._loadDashboardData();
                MessageToast.show("Dashboard refreshed.");
            },

            onLogout: function () {
                this.getOwnerComponent().getRouter().navTo("Login");
            }
        }
    );
});