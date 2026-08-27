sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    Dialog,
    Label,
    Input,
    Select,
    Item,
    Button,
    VBox,
    HBox
) {
    "use strict";

    return Controller.extend(
        "salesordertracking.zsotracking.controller.SalesOrderItemList",
        {


            onInit: function () {

                var oViewModel = new JSONModel({
                    SoId: "",
                    CustomerName: "",
                    Status: "",
                    StatusState: "None",
                    TotalAmount: "0.00",
                    Currency: ""
                });

                this.getView().setModel(
                    oViewModel,
                    "viewModel"
                );

                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("SalesOrderItemList")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
            },

            _onRouteMatched: function (oEvent) {

                var sSoId =
                    oEvent.getParameter(
                        "arguments"
                    ).SoId;

                console.log(
                    "Line Item Route SoId:",
                    sSoId
                );

                if (!sSoId) {

                    MessageBox.error(
                        "Sales Order ID was not received."
                    );

                    return;
                }

                this._sSoId = sSoId;

                this._loadSalesOrderHeader();

                this._loadItems();
            },

            _loadSalesOrderHeader: function () {

                var oModel =
                    this.getView().getModel();

                var oViewModel =
                    this.getView().getModel(
                        "viewModel"
                    );

                var sPath =
                    "/" +
                    oModel.createKey(
                        "SalesOrderSet",
                        {
                            SoId: this._sSoId
                        }
                    );

                oModel.read(
                    sPath,
                    {

                        success: function (oData) {

                            console.log(
                                "Sales Order Header:",
                                oData
                            );

                            oViewModel.setData({

                                SoId:
                                    oData.SoId || "",

                                CustomerName:
                                    oData.CustomerName || "",

                                Status:
                                    oData.Status || "",

                                StatusState:
                                    this.formatStatusState(
                                        oData.Status
                                    ),

                                TotalAmount:
                                    oData.TotalAmount || "0.00",

                                Currency:
                                    oData.Currency || ""

                            });

                        }.bind(this),

                        error: function (oError) {

                            console.error(
                                "Header read failed:",
                                oError
                            );

                        }

                    }
                );
            },

            _loadItems: function () {

                var oTable =
                    this.byId("itemsTable");

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var oFilter =
                    new Filter(
                        "SoId",
                        FilterOperator.EQ,
                        this._sSoId
                    );

                oBinding.filter([oFilter]);
            },

            onTableUpdateFinished: function (oEvent) {

                var iTotal =
                    oEvent.getParameter("total");

                this.byId("itemsTitle")
                    .setText(
                        "Line Items (" +
                        iTotal +
                        ")"
                    );
            },

            calculateItemTotal: function (
                fQuantity,
                fUnitPrice
            ) {

                var nQuantity =
                    parseFloat(fQuantity) || 0;

                var nUnitPrice =
                    parseFloat(fUnitPrice) || 0;

                return (
                    nQuantity *
                    nUnitPrice
                ).toFixed(2);
            },

            onAddItem: function () {

                this._openItemDialog(
                    "Create Line Item",
                    null
                );
            },

            onEditItem: function (oEvent) {

                var oButton =
                    oEvent.getSource();

                var oContext =
                    oButton.getBindingContext();

                if (!oContext) {

                    MessageBox.error(
                        "Item context not found."
                    );

                    return;
                }

                var oData =
                    oContext.getObject();

                this._openItemDialog(
                    "Edit Line Item",
                    oData
                );
            },

            _openItemDialog: function (sTitle, oItemData) {

                var bEdit = !!oItemData;

                var oSoIdInput = new Input({
                    value: this._sSoId,
                    editable: false
                });

                var oItemNoInput = new Input({
                    value: bEdit ? oItemData.ItemNo : "",
                    editable: !bEdit,
                    placeholder: "Enter item number"
                });

                var oMaterialInput = new Input({
                    value: bEdit ? oItemData.Material : "",
                    placeholder: "Enter material"
                });

                var oDescriptionInput = new Input({
                    value: bEdit ? oItemData.Description : "",
                    placeholder: "Enter description"
                });

                var oQuantityInput = new Input({
                    value: bEdit ? oItemData.Quantity : "1",
                    type: "Number",
                    placeholder: "Enter quantity"
                });

                var oUnitPriceInput = new Input({
                    value: bEdit ? oItemData.UnitPrice : "0",
                    type: "Number",
                    placeholder: "Enter unit price"
                });

                var oCurrencyInput = new Input({
                    value: bEdit ? "INR" : "INR",
                    editable: false,
                    width: "100%"
                });


                var oVBox = new VBox({
                    items: [

                        new Label({
                            text: "Sales Order ID"
                        }),

                        oSoIdInput,


                        new Label({
                            text: "Item Number"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        oItemNoInput,


                        new Label({
                            text: "Material"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        oMaterialInput,


                        new Label({
                            text: "Description"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        oDescriptionInput,


                        new Label({
                            text: "Quantity"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        oQuantityInput,


                        new Label({
                            text: "Unit Price"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        oUnitPriceInput,


                        new Label({
                            text: "Currency"
                        }).addStyleClass("sapUiSmallMarginTop"),

                        new Input({
                            value: bEdit ? oItemData.Currency : "INR",
                            editable: true,
                            width: "100%",
                            maxLength: 3
                        })

                    ]
                });

                oVBox.addStyleClass("sapUiSmallMargin");


                var oDialog = new Dialog({

                    title: sTitle,

                    contentWidth: "500px",

                    content: [
                        oVBox
                    ],

                    beginButton: new Button({

                        text: bEdit ? "Update" : "Create",

                        type: "Emphasized",

                        press: function () {

                            this._saveItem(
                                oDialog,
                                bEdit,
                                oItemData,
                                {
                                    itemNo: oItemNoInput,
                                    material: oMaterialInput,
                                    description: oDescriptionInput,
                                    quantity: oQuantityInput,
                                    unitPrice: oUnitPriceInput,
                                    currency: oCurrencySelect
                                }
                            );

                        }.bind(this)

                    }),

                    endButton: new Button({

                        text: "Cancel",

                        press: function () {
                            oDialog.close();
                        }

                    }),

                    afterClose: function () {
                        oDialog.destroy();
                    }

                });

                this.getView().addDependent(oDialog);

                oDialog.open();
            },


            _saveItem: function (
                oDialog,
                bEdit,
                oOldData,
                oControls
            ) {

                var sItemNo =
                    oControls.itemNo
                        .getValue()
                        .trim();

                var sMaterial =
                    oControls.material
                        .getValue()
                        .trim();

                var sDescription =
                    oControls.description
                        .getValue()
                        .trim();

                var nQuantity =
                    parseFloat(
                        oControls.quantity.getValue()
                    );

                var nUnitPrice =
                    parseFloat(
                        oControls.unitPrice.getValue()
                    );

                var sCurrency =
                    oControls.currency
                        .getSelectedKey();



                if (!sItemNo) {

                    MessageBox.warning(
                        "Please enter Item Number."
                    );

                    return;
                }


                if (!sMaterial) {

                    MessageBox.warning(
                        "Please enter Material."
                    );

                    return;
                }


                if (!sDescription) {

                    MessageBox.warning(
                        "Please enter Description."
                    );

                    return;
                }


                if (
                    isNaN(nQuantity) ||
                    nQuantity <= 0
                ) {

                    MessageBox.warning(
                        "Quantity must be greater than 0."
                    );

                    return;
                }


                if (
                    isNaN(nUnitPrice) ||
                    nUnitPrice < 0
                ) {

                    MessageBox.warning(
                        "Unit Price cannot be negative."
                    );

                    return;
                }



                var oPayload = {

                    SoId: this._sSoId,

                    ItemNo: sItemNo,

                    Material: sMaterial,

                    Description: sDescription,
                    Quantity: nQuantity.toFixed(3),
                    UnitPrice: nUnitPrice.toFixed(2),

                    Currency: "INR"

                };


                console.log(
                    "Item Payload:",
                    oPayload
                );


                var oModel =
                    this.getView().getModel();




                if (!bEdit) {

                    this.getView().setBusy(true);

                    oModel.create(
                        "/SalesOrderItemSet",
                        oPayload,

                        {

                            success: function (oData) {

                                this.getView()
                                    .setBusy(false);

                                oDialog.close();

                                MessageToast.show(
                                    "Line item created successfully."
                                );

                                // Reload line items
                                this._loadItems();

                                // Reload header total amount
                                this._loadSalesOrderHeader();

                            }.bind(this),

                            error: function (oError) {

                                this.getView()
                                    .setBusy(false);

                                console.error(
                                    "Create Item Error:",
                                    oError
                                );

                                MessageBox.error(
                                    "Failed to create line item."
                                );

                            }.bind(this)

                        }
                    );

                    return;
                }



                var sPath =
                    "/" +
                    oModel.createKey(
                        "SalesOrderItemSet",
                        {
                            SoId: oOldData.SoId,
                            ItemNo: oOldData.ItemNo
                        }
                    );

                console.log("Update Path:", sPath);
                console.log("Update Payload:", oPayload);

                this.getView().setBusy(true);

                oModel.update(
                    sPath,
                    oPayload,
                    {
                        merge: true,

                        success: function (oData) {

                            this.getView().setBusy(false);

                            oDialog.close();

                            MessageToast.show(
                                "Line item updated successfully."
                            );

                            // Reload line items
                            this._loadItems();

                            // Reload Sales Order Header
                            this._loadSalesOrderHeader();

                        }.bind(this),

                        error: function (oError) {

                            this.getView().setBusy(false);

                            console.error(
                                "Update Item Error:",
                                oError
                            );

                            MessageBox.error(
                                "Failed to update line item."
                            );

                        }.bind(this)
                    }
                );
            },

            onDeleteItem: function (oEvent) {

                var oButton =
                    oEvent.getSource();

                var oContext =
                    oButton.getBindingContext();

                if (!oContext) {

                    MessageBox.error(
                        "Item context not found."
                    );

                    return;
                }

                var oData =
                    oContext.getObject();

                var sItemNo =
                    oData.ItemNo;

                var sPath =
                    oContext.getPath();


                MessageBox.confirm(

                    "Delete item " +
                    sItemNo +
                    " from Sales Order " +
                    this._sSoId +
                    "?",

                    {

                        title:
                            "Delete Line Item",

                        actions:
                            [
                                MessageBox.Action.OK,
                                MessageBox.Action.CANCEL
                            ],

                        emphasizedAction:
                            MessageBox.Action.OK,

                        onClose:
                            function (oAction) {

                                if (
                                    oAction !==
                                    MessageBox.Action.OK
                                ) {
                                    return;
                                }


                                this.getView()
                                    .setBusy(true);


                                var oModel =
                                    this.getView()
                                        .getModel();


                                oModel.remove(
                                    sPath,

                                    {

                                        success:
                                            function () {

                                                this.getView()
                                                    .setBusy(false);

                                                MessageToast.show(
                                                    "Line item deleted successfully."
                                                );


                                                this._loadItems();

                                                this._loadSalesOrderHeader();

                                            }.bind(this),
                                        error:
                                            function (oError) {

                                                this.getView()
                                                    .setBusy(false);

                                                console.error(
                                                    "Delete Item Error:",
                                                    oError
                                                );

                                                MessageBox.error(
                                                    "Failed to delete line item."
                                                );

                                            }.bind(this)

                                    }
                                );

                            }.bind(this)

                    }
                );
            },
            // _refreshSalesOrderData: function () {

            //     this._loadSalesOrderHeader();

            //     this._loadItems();

            // },


            onRefresh: function () {

                var oModel =
                    this.getView().getModel();

                oModel.refresh(true);

                this._loadSalesOrderHeader();

                this._loadItems();

                MessageToast.show(
                    "Data refreshed."
                );
            },

            onNavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "SalesOrderList")

            },

            formatStatusState: function (
                sStatus
            ) {

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
            }

        }
    );
});