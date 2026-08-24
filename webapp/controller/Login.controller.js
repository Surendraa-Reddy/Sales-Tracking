sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    MessageBox,
    BusyDialog,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "salesordertracking.zsotracking.controller.Login",
        {

            onInit: function () {

            },


            onLogin: function () {

                var sUsername =
                    this.byId("username")
                        .getValue()
                        .trim();

                var sPassword =
                    this.byId("password")
                        .getValue();


              

                if (!sUsername) {

                    MessageBox.warning(
                        "Please enter User Name."
                    );

                    return;
                }


                if (!sPassword) {

                    MessageBox.warning(
                        "Please enter Password."
                    );

                    return;
                }


          

                var oModel =
                    this.getOwnerComponent()
                        .getModel();



                var oPayload = {

                    UserName: sUsername,

                    Password: sPassword

                };


         

                oModel.create(
                    "/LoginSet",
                    oPayload,
                    {

                        success: function (oData) {

                         

                            var oLoginModel =
                                new JSONModel(
                                    oData
                                );


                            this.getOwnerComponent()
                                .setModel(
                                    oLoginModel,
                                    "login"
                                );


                         

                            this.getOwnerComponent()
                                .getRouter()
                                .navTo(
                                    "SalesDashboard"
                                );

                        }.bind(this),


                        error: function (oError) {

                            var sMessage =
                                "Invalid username or password.";


                            try {

                                var oResponse =
                                    JSON.parse(
                                        oError.responseText
                                    );

                                if (
                                    oResponse.error &&
                                    oResponse.error.message
                                ) {

                                    sMessage =
                                        oResponse
                                            .error
                                            .message
                                            .value;
                                }

                            } catch (e) {

                                console.error(
                                    "Error parsing OData error",
                                    e
                                );

                            }


                            MessageBox.error(
                                sMessage
                            );

                        }.bind(this)

                    }
                );

            }

        }
    );
});