sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("salesordertracking.zsotracking.controller.SalesOrderDetail", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("SalesOrderObject").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {

            var sSoId = oEvent.getParameter("arguments").SoId;

            console.log("=================================");
            console.log("Sales Order Object Route Matched");
            console.log("Route SoId:", sSoId);
            console.log("=================================");

            if (!sSoId) {
                MessageBox.error("Sales Order ID was not received.");
                return;
            }

            var oModel = this.getView().getModel();

            if (!oModel) {
                MessageBox.error("OData model is not available.");
                console.error("Default OData model not found.");
                return;
            }

            console.log("OData Model:", oModel);

            var sPath = "/" + oModel.createKey("SalesOrderSet", {
                SoId: sSoId
            });

            console.log("Generated OData Path:", sPath);

            this.getView().setBusy(true);

            this.getView().bindElement({

                path: sPath,

                events: {

                    dataRequested: function () {

                        console.log("Request started:", sPath);

                        this.getView().setBusy(true);

                    }.bind(this),

                    dataReceived: function (oEvent) {

                        this.getView().setBusy(false);

                        var oData = oEvent.getParameter("data");

                        console.log("OData Response:", oData);

                        if (!oData) {

                            MessageBox.error(
                                "Sales Order " + sSoId + " was not found."
                            );

                            return;
                        }

                        var oContext = this.getView().getBindingContext();

                        console.log("Binding Context:", oContext);

                        if (oContext) {

                            console.log(
                                "SoId:",
                                oContext.getProperty("SoId")
                            );

                            console.log(
                                "CustomerId:",
                                oContext.getProperty("CustomerId")
                            );

                            console.log(
                                "CustomerName:",
                                oContext.getProperty("CustomerName")
                            );

                            console.log(
                                "OrderDate:",
                                oContext.getProperty("OrderDate")
                            );

                            console.log(
                                "Status:",
                                oContext.getProperty("Status")
                            );

                            console.log(
                                "TotalAmount:",
                                oContext.getProperty("TotalAmount")
                            );

                            console.log(
                                "Currency:",
                                oContext.getProperty("Currency")
                            );

                        } else {

                            console.error(
                                "Object Page has NO binding context."
                            );

                        }

                    }.bind(this)

                }

            });
        },
        onTableUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            this.byId("tableTitle").setText("Items (" + iTotalItems + ")");
        },

        calculateItemTotal: function (fQty, fPrice) {
            var nQty = parseFloat(fQty) || 0;
            var nPrice = parseFloat(fPrice) || 0;
            return (nQty * nPrice).toFixed(2);
        },

        onAddItem: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oContext = oView.getBindingContext();

            var sSoId = oContext ? oContext.getProperty("SoId") : "";

           
            oModel.createEntry("/SalesOrderItemSet", {
                properties: {
                    SoId: sSoId,
                    ItemNo: "",
                    Material: "",
                    Description: "",
                    Quantity: 1,
                    UnitPrice: 0,
                    Currency: "USD"
                }
            });

            MessageToast.show("New item row added.");
        },

        onDeleteItem: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oBindingContext = oItem.getBindingContext();

            if (!oBindingContext) {
                return;
            }

            var sPath = oBindingContext.getPath();
            var oModel = this.getView().getModel();

            MessageBox.confirm("Are you sure you want to delete this line item?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        oModel.remove(sPath, {
                            success: function () {
                                this.getView().setBusy(false);
                                MessageToast.show("Item deleted successfully.");
                            }.bind(this),
                            error: function () {
                                this.getView().setBusy(false);
                                MessageBox.error("Failed to delete item.");
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        onNavToItemsFromDetail: function () {
            var oContext = this.getView().getBindingContext();
            if (oContext) {
                var sSoId = oContext.getProperty("SoId");
                this.getOwnerComponent().getRouter().navTo("SalesOrderItemList", {
                    SoId: sSoId
                });
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "OPEN": return "Warning";
                case "IN_PROCESS": return "Information";
                case "DELIVERED": return "Success";
                default: return "None";
            }
        },

        onEditOrder: function () {
            var oContext = this.getView().getBindingContext();
            if (oContext) {
                this.getOwnerComponent().getRouter().navTo("EditSalesOrder", {
                    SoId: oContext.getProperty("SoId")
                });
            }
        },

        onDeleteOrder: function () {
            var oContext = this.getView().getBindingContext();
            if (!oContext) {
                return;
            }

            var sSoId = oContext.getProperty("SoId");
            var sPath = oContext.getPath();

            MessageBox.confirm("Delete Sales Order " + sSoId + "?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        this.getView().getModel().remove(sPath, {
                            success: function () {
                                this.getView().setBusy(false);
                                MessageToast.show("Order deleted.");
                                this.getOwnerComponent().getRouter().navTo("SalesOrderList", {}, true);
                            }.bind(this),
                            error: function () {
                                this.getView().setBusy(false);
                                MessageBox.error("Delete failed.");
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        }
    });
});