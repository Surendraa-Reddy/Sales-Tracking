sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState"
], function (Controller, History, MessageToast, MessageBox, ValueState) {
    "use strict";

    return Controller.extend("salesordertracking.zsotracking.controller.EditSalesOrder", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("EditSalesOrder").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sSoId = decodeURIComponent(oEvent.getParameter("arguments").SoId);
            var sPath = "/SalesOrderSet('" + sSoId + "')";

            // Bind current order context to the view
            this.getView().bindElement({
                path: sPath
            });
            this._resetValueStates();
        },

        onUpdateOrder: function () {
            var oModel = this.getView().getModel();
            var oContext = this.getView().getBindingContext();
            if (!oContext) {
                return;
            }

            this._resetValueStates();

            if (!this._validateForm()) {
                MessageBox.error("Please fix the highlighted errors before updating.");
                return;
            }

            var oDatePicker = this.byId("dpOrderDate");
           var oDateValue = oDatePicker.getDateValue(); 
          
            var fAmount = parseFloat(this.byId("inTotalAmount").getValue()) || 0;
            var sTotalAmount = fAmount.toFixed(2);

            var sPath = oContext.getPath();
            var oPayload = {
                SoId: this.byId("inSoId").getValue(),
                CustomerId: this.byId("inCustomerId").getValue().trim(),
                CustomerName: this.byId("inCustomerName").getValue().trim(),
                OrderDate: oDateValue,
                Status: this.byId("selStatus").getSelectedKey(),
                Currency: this.byId("inCurrency").getValue().trim().toUpperCase(),
                TotalAmount: sTotalAmount
            };

            this.getView().setBusy(true);

            oModel.update(sPath, oPayload, {
                success: function () {
                    this.getView().setBusy(false);
                    MessageToast.show("Sales Order updated successfully!");
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    var sErrorMessage = "Failed to update Sales Order.";
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
        },

        _validateForm: function () {
            var bIsValid = true;
            var oCustomerId = this.byId("inCustomerId");
            var oCustomerName = this.byId("inCustomerName");
            var oOrderDate = this.byId("dpOrderDate");
            var oCurrency = this.byId("inCurrency");

            if (!oCustomerId.getValue().trim()) {
                oCustomerId.setValueState(ValueState.Error);
                bIsValid = false;
            }
            if (!oCustomerName.getValue().trim()) {
                oCustomerName.setValueState(ValueState.Error);
                bIsValid = false;
            }
            if (!oOrderDate.getValue() || !oOrderDate.isValidValue()) {
                oOrderDate.setValueState(ValueState.Error);
                bIsValid = false;
            }
            if (!oCurrency.getValue().trim() || !/^[A-Za-z]{3}$/.test(oCurrency.getValue().trim())) {
                oCurrency.setValueState(ValueState.Error);
                bIsValid = false;
            }

            return bIsValid;
        },

        _resetValueStates: function () {
            [this.byId("inCustomerId"), this.byId("inCustomerName"), this.byId("dpOrderDate"), this.byId("inCurrency")].forEach(function (oControl) {
                if (oControl) {
                    oControl.setValueState(ValueState.None);
                }
            });
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