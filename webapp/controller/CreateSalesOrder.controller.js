sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState"
], function (Controller, History, MessageToast, MessageBox, ValueState) {
    "use strict";

    return Controller.extend("salesordertracking.zsotracking.controller.CreateSalesOrder", {

        onSaveOrder: function () {
            var oModel = this.getView().getModel();

            this._resetValueStates();

           
            if (!this._validateForm()) {
                MessageBox.error("Please fix the highlighted errors before submitting.");
                return;
            }

            var oPayload = {
                SoId: this.byId("inSoId").getValue().trim(),
                CustomerId: this.byId("inCustomerId").getValue().trim(),
                CustomerName: this.byId("inCustomerName").getValue().trim(),
                OrderDate: this.byId("dpOrderDate").getValue(),
                Status: this.byId("selStatus").getSelectedKey(),
                Currency: this.byId("inCurrency").getValue().trim().toUpperCase()
            };

            this.getView().setBusy(true);

            oModel.create("/SalesOrderSet", oPayload, {
                success: function (oData) {
                    this.getView().setBusy(false);
                    MessageToast.show("Sales Order " + oData.SoId + " created successfully!");
                    this._clearForm();
                    this.onNavBack();
                }.bind(this),

                error: function (oError) {
                    this.getView().setBusy(false);
                    var sErrorMessage = "Failed to create Sales Order.";

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

            var oSoId = this.byId("inSoId");
            var oCustomerId = this.byId("inCustomerId");
            var oCustomerName = this.byId("inCustomerName");
            var oOrderDate = this.byId("dpOrderDate");
            var oCurrency = this.byId("inCurrency");

            var sSoId = oSoId.getValue().trim();
            var sCustomerId = oCustomerId.getValue().trim();
            var sCustomerName = oCustomerName.getValue().trim();
            var sCurrency = oCurrency.getValue().trim();

         
            if (!sSoId) {
                oSoId.setValueState(ValueState.Error);
                oSoId.setValueStateText("Sales Order ID is required.");
                bIsValid = false;
            } else if (!/^\d+$/.test(sSoId)) {
                oSoId.setValueState(ValueState.Error);
                oSoId.setValueStateText("Sales Order ID must contain numbers only.");
                bIsValid = false;
            }

          
            if (!sCustomerId) {
                oCustomerId.setValueState(ValueState.Error);
                oCustomerId.setValueStateText("Customer ID is required.");
                bIsValid = false;
            }

        
            if (!sCustomerName) {
                oCustomerName.setValueState(ValueState.Error);
                oCustomerName.setValueStateText("Customer Name is required.");
                bIsValid = false;
            } else if (sCustomerName.length > 40) {
                oCustomerName.setValueState(ValueState.Error);
                oCustomerName.setValueStateText("Customer Name cannot exceed 40 characters.");
                bIsValid = false;
            }

           
            if (!oOrderDate.getValue() || !oOrderDate.isValidValue()) {
                oOrderDate.setValueState(ValueState.Error);
                oOrderDate.setValueStateText("Please select a valid Order Date.");
                bIsValid = false;
            }

            if (!sCurrency) {
                oCurrency.setValueState(ValueState.Error);
                oCurrency.setValueStateText("Currency is required.");
                bIsValid = false;
            } else if (!/^[A-Za-z]{3}$/.test(sCurrency)) {
                oCurrency.setValueState(ValueState.Error);
                oCurrency.setValueStateText("Currency must be a 3-letter ISO code (e.g. USD, EUR).");
                bIsValid = false;
            }

            return bIsValid;
        },

        _resetValueStates: function () {
            var aControls = [
                this.byId("inSoId"),
                this.byId("inCustomerId"),
                this.byId("inCustomerName"),
                this.byId("dpOrderDate"),
                this.byId("inCurrency")
            ];

            aControls.forEach(function (oControl) {
                if (oControl) {
                    oControl.setValueState(ValueState.None);
                    oControl.setValueStateText("");
                }
            });
        },

        _clearForm: function () {
            this._resetValueStates();
            this.byId("inSoId").setValue("");
            this.byId("inCustomerId").setValue("");
            this.byId("inCustomerName").setValue("");
            this.byId("dpOrderDate").setValue("");
            this.byId("selStatus").setSelectedKey("OPEN");
            this.byId("inCurrency").setValue("USD");
        },

        onNavBack: function () {
            this._resetValueStates();
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