sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, DateFormat, NumberFormat, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("salesordertracking.zsotracking.controller.SalesOrderObject", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("SalesOrderObject").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sSoId = decodeURIComponent(oEvent.getParameter("arguments").SoId);
            var sPath = "/SalesOrderSet('" + sSoId + "')";

           
            this.getView().bindElement({
                path: sPath,
                events: {
                    change: this._onBindingChange.bind(this)
                }
            });

          
            var oTable = this.byId("orderItemsTable");
            var oBinding = oTable.getBinding("items");
            var oFilter = new Filter("SoId", FilterOperator.EQ, sSoId);

            if (oBinding) {
                oBinding.filter([oFilter]);
            } else {
            
                oTable.attachEventOnce("updateFinished", function () {
                    oTable.getBinding("items").filter([oFilter]);
                });
            }
        },

        _onBindingChange: function () {
            var oElementBinding = this.getView().getElementBinding();
            if (oElementBinding && !oElementBinding.getBoundContext()) {
                this.onNavBack();
            }
        },

        formatOrderDate: function (vDate) {
            if (!vDate) {
                return "";
            }
            var oDate = new Date(vDate);
            var oDateFormat = DateFormat.getDateInstance({ style: "medium" });
            return oDateFormat.format(oDate);
        },

        formatAmount: function (vValue) {
            if (vValue === undefined || vValue === null) {
                return "0.00";
            }
            var oNumberFormat = NumberFormat.getFloatInstance({
                minFractionDigits: 2,
                maxFractionDigits: 2
            });
            return oNumberFormat.format(vValue);
        },

        formatQuantity: function (vQty) {
            if (vQty === undefined || vQty === null) {
                return "0";
            }
            var oNumberFormat = NumberFormat.getFloatInstance({
                minFractionDigits: 0,
                maxFractionDigits: 3
            });
            return oNumberFormat.format(vQty);
        },

        calculateLineTotal: function (vQty, vUnitPrice) {
            var fQty = parseFloat(vQty) || 0;
            var fUnitPrice = parseFloat(vUnitPrice) || 0;
            var fTotal = fQty * fUnitPrice;

            var oNumberFormat = NumberFormat.getFloatInstance({
                minFractionDigits: 2,
                maxFractionDigits: 2
            });
            return oNumberFormat.format(fTotal);
        },

        formatStatusState: function (sStatus) {
            if (!sStatus) {
                return "None";
            }
            switch (sStatus.toUpperCase()) {
                case "OPEN":
                case "PENDING":
                    return "Warning";
                case "IN_PROCESS":
                case "PROCESSING":
                    return "Information";
                case "DELIVERED":
                case "COMPLETED":
                    return "Success";
                default:
                    return "None";
            }
        },

        onRefreshItems: function () {
            var oElementBinding = this.getView().getElementBinding();
            if (oElementBinding) {
                oElementBinding.refresh(true);
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("SalesOrderList", {}, true);
            }
        }
    });
});