sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "salesordertracking/zsotracking/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    Filter,
    FilterOperator,
    formatter,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "salesordertracking.zsotracking.controller.SalesOrderList",
        {

            formatter: formatter,

            onInit: function () {

            },




            onOrderPress: function (oEvent) {

                var oItem = oEvent.getSource();

                var oContext =
                    oItem.getBindingContext();

                var sSoId =
                    oContext.getProperty("SoId");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderObject",
                        {
                            SoId: sSoId
                        }
                    );
            },


            onSearch: function (oEvent) {

                this._sSearchQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
                this._applyCombinedFilters();
            },

            onStatusFilterChange: function (oEvent) {
                this._sStatusFilter = oEvent.getSource().getSelectedKey();
                this._applyCombinedFilters();
            },

            _applyCombinedFiltersold: function () {
                var oTable = this.byId("salesOrderTable");
                var oBinding = oTable.getBinding("items");
                var aTableFilters = [];


                if (this._sSearchQuery) {
                    aTableFilters.push(new Filter({
                        filters: [
                            new Filter("SoId", FilterOperator.Contains, this._sSearchQuery),
                            new Filter("CustomerName", FilterOperator.Contains, this._sSearchQuery)
                        ],
                        and: false
                    }));
                }


                if (this._sStatusFilter && this._sStatusFilter !== "ALL") {
                    aTableFilters.push(new Filter("Status", FilterOperator.EQ, this._sStatusFilter));
                }


                oBinding.filter(aTableFilters);
            },
            _applyCombinedFilters: function () {
                var oTable = this.byId("salesOrderTable");
                if (!oTable) {
                    return;
                }

                var oBinding = oTable.getBinding("items");
                var aTableFilters = [];

                // 1. Single property filter for Search (Avoids multi-field OR failure in standard Gateway)
                if (this._sSearchQuery) {
                    aTableFilters.push(new Filter("SoId", FilterOperator.Contains, this._sSearchQuery));
                }

                // 2. Status Filter
                if (this._sStatusFilter && this._sStatusFilter !== "ALL") {
                    aTableFilters.push(new Filter("Status", FilterOperator.EQ, this._sStatusFilter));
                }

                // Apply simple AND filters
                oBinding.filter(aTableFilters);
            },

            onRefresh: function () {
                // 1. Reset stored controller state values
                this._sSearchQuery = "";
                this._sStatusFilter = "ALL";


                var oSearchField = this.byId("searchField"); // Replace with your SearchField ID
                var oStatusSelect = this.byId("statusSelect"); // Replace with your Select/ComboBox ID

                if (oSearchField) {
                    oSearchField.setValue("");
                }
                if (oStatusSelect) {
                    oStatusSelect.setSelectedKey("ALL");
                }

                var oTable = this.byId("salesOrderTable");
                if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    if (oBinding) {
                        oBinding.filter([]);
                        oBinding.refresh(true);
                    }
                }
            },
            onNavToCreate: function () {
                this.getOwnerComponent().getRouter().navTo("CreateSalesOrder");
            },

            OnNav: function () {
                this.getOwnerComponent().getRouter().navTo("SalesDashboard")

            },
            onNavToItems: function (oEvent) {
                var oItem = oEvent.getSource().getParent().getParent();
                var oContext = oItem.getBindingContext();
                var sSoId = oContext.getProperty("SoId");

                this.getOwnerComponent().getRouter().navTo("SalesOrderItemList", {
                    SoId: sSoId
                });
            },

            formatStatusState: function (sStatus) {

                switch (sStatus) {

                    case "OPEN":
                        return "Warning";

                    case "IN_PROCESS":
                        return "Information";

                    case "DELIVERED":
                        return "Success";

                    default:
                        return "None";
                }
            },
            onEditOrder: function (oEvent) {
                // Get the selected row context
                var oItem = oEvent.getSource().getParent().getParent();
                var oContext = oItem.getBindingContext();
                var sSoId = oContext.getProperty("SoId");

                // Navigate to Edit screen with SoId
                this.getOwnerComponent().getRouter().navTo("EditSalesOrder", {
                    SoId: sSoId
                });
            },

            onDeleteOrder: function (oEvent) {
                var oItem = oEvent.getSource().getParent().getParent();
                var oContext = oItem.getBindingContext();
                var sSoId = oContext.getProperty("SoId");
                var sPath = oContext.getPath();
                var oModel = this.getView().getModel();

                MessageBox.confirm("Are you sure you want to delete Sales Order " + sSoId + "?", {
                    title: "Confirm Delete",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this.getView().setBusy(true);

                            oModel.remove(sPath, {
                                success: function () {
                                    this.getView().setBusy(false);
                                    MessageToast.show("Sales Order " + sSoId + " deleted successfully.");
                                }.bind(this),

                                error: function (oError) {
                                    this.getView().setBusy(false);
                                    var sErrorMessage = "Failed to delete Sales Order.";
                                    if (oError.responseText) {
                                        try {
                                            var oResponse = JSON.parse(oError.responseText);
                                            sErrorMessage = oResponse.error.message.value;
                                        } catch (e) {
                                            
                                        }
                                    }
                                    MessageBox.error(sErrorMessage);
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            }

        }
    );
});