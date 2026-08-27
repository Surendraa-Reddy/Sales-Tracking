// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/m/Dialog",
//     "sap/m/Button",
//     "sap/m/Label",
//     "sap/m/Input",
//     "sap/m/VBox",
//     "sap/ui/model/json/JSONModel"
// ], function (
//     Controller,
//     MessageBox,
//     MessageToast,
//     Dialog,
//     Button,
//     Label,
//     Input,
//     VBox,
//     JSONModel
// ) {
//     "use strict";

//     return Controller.extend("salesordertracking.zsotracking.controller.Login", {

//         onInit: function () { },

//         onLogin: function () {
//             var sUsername = this.byId("username").getValue().trim();
//             var sPassword = this.byId("password").getValue();

//             if (!sUsername) {
//                 MessageBox.warning("Please enter User Name.");
//                 return;
//             }
//             if (!sPassword) {
//                 MessageBox.warning("Please enter Password.");
//                 return;
//             }

//             var oModel = this.getOwnerComponent().getModel();
//             var oPayload = {
//                 LoginId: "000",
//                 UserName: sUsername,
//                 Password: sPassword
//             };

//             oModel.create("/LoginSet", oPayload, {
//                 success: function (oData) {
//                     var oLoginModel = new JSONModel(oData);
//                     this.getOwnerComponent().setModel(oLoginModel, "login");
//                     this.getOwnerComponent().getRouter().navTo("SalesDashboard");
//                 }.bind(this),
//                 error: function (oError) {
//                     var sMessage = "Invalid username or password.";
//                     try {
//                         var oResponse = JSON.parse(oError.responseText);
//                         if (oResponse.error && oResponse.error.message) {
//                             sMessage = oResponse.error.message.value;
//                         }
//                     } catch (e) {
//                         console.error("Error parsing OData error", e);
//                     }
//                     MessageBox.error(sMessage);
//                 }.bind(this)
//             });
//         },



//         onOpenRegisterDialog: function () {
//             if (!this._oRegisterDialog) {

//                 this._oRegFullNameInput = new Input({ placeholder: "Enter full name", width: "100%" });
//                 this._oRegUsernameInput = new Input({ placeholder: "Enter username", width: "100%" });
//                 this._oRegPasswordInput = new Input({ type: "Password", placeholder: "Enter password", width: "100%" });
//                 this._oRegRoleInput = new Input({ placeholder: "e.g. Manager, Sales Exec", value: "User", width: "100%" });

//                 this._oRegisterDialog = new Dialog({
//                     title: "Register New User",
//                     contentWidth: "500px",
//                     content: [
//                         new VBox({
//                             class: "sapUiSmallMargin",
//                             items: [
//                                 new Label({ text: "Full Name", required: true }),
//                                 this._oRegFullNameInput,

//                                 new Label({ text: "User Name", required: true }),
//                                 this._oRegUsernameInput,

//                                 new Label({ text: "Password", required: true }),
//                                 this._oRegPasswordInput,

//                                 new Label({ text: "Role" }),
//                                 this._oRegRoleInput
//                             ]
//                         })
//                     ],
//                     beginButton: new Button({
//                         text: "Register",
//                         type: "Emphasized",
//                         press: this.onRegisterUser.bind(this)
//                     }),
//                     endButton: new Button({
//                         text: "Cancel",
//                         press: function () {
//                             this._oRegisterDialog.close();
//                         }.bind(this)
//                     })
//                 });

//                 this.getView().addDependent(this._oRegisterDialog);
//             }

//             this._oRegFullNameInput.setValue("");
//             this._oRegUsernameInput.setValue("");
//             this._oRegPasswordInput.setValue("");
//             this._oRegRoleInput.setValue("User");

//             this._oRegisterDialog.open();
//         },

//         onRegisterUser: function () {
//             var sFullName = this._oRegFullNameInput.getValue().trim();
//             var sUsername = this._oRegUsernameInput.getValue().trim();
//             var sPassword = this._oRegPasswordInput.getValue();
//             var sRole = this._oRegRoleInput.getValue().trim() || "User";

//             if (!sFullName || !sUsername || !sPassword) {
//                 MessageBox.warning("Please fill in all mandatory fields (Full Name, User Name, Password).");
//                 return;
//             }

//             var oModel = this.getOwnerComponent().getModel();
//             var oPayload = {
//                 LoginId: "000", 
//                 Fullname: sFullName,
//                 UserName: sUsername,
//                 Password: sPassword,
//                 Role: sRole,
//                 Active: "X"
//             };

//             this._oRegisterDialog.setBusy(true);

//             oModel.create("/LoginSet", oPayload, {
//                 success: function () {
//                     this._oRegisterDialog.setBusy(false);
//                     this._oRegisterDialog.close();
//                     MessageToast.show("Account created successfully! You can now log in.");

//                     this.byId("username").setValue(sUsername);
//                     this.byId("password").setValue(sPassword);
//                 }.bind(this),
//                 error: function (oError) {
//                     this._oRegisterDialog.setBusy(false);
//                     var sMessage = "User creation failed.";
//                     try {
//                         var oResponse = JSON.parse(oError.responseText);
//                         if (oResponse.error && oResponse.error.message) {
//                             sMessage = oResponse.error.message.value;
//                         }
//                     } catch (e) {
//                         console.error("Parsing error", e);
//                     }
//                     MessageBox.error(sMessage);
//                 }.bind(this)
//             });
//         }

//     });
// });
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    MessageBox,
    MessageToast,
    Dialog,
    Button,
    Label,
    Input,
    VBox,
    JSONModel
) {
    "use strict";

    return Controller.extend("salesordertracking.zsotracking.controller.Login", {

        onInit: function () { },

        onLogin: function () {

            var sUsername = this.byId("username").getValue().trim();
            var sPassword = this.byId("password").getValue();

            if (!sUsername) {
                MessageBox.warning("Please enter User Name.");
                return;
            }

            if (!sPassword) {
                MessageBox.warning("Please enter Password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();

            var oPayload = {
                LoginId: "000",
                UserName: sUsername,
                Password: sPassword
            };

            console.log("Login Payload:", oPayload);

            oModel.create("/LoginSet", oPayload, {

                success: function (oData) {

                    console.log("Login successful:", oData);

                    var oLoginModel = new JSONModel(oData);

                    this.getOwnerComponent().setModel(
                        oLoginModel,
                        "login"
                    );

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("SalesDashboard");

                }.bind(this),

                error: function (oError) {

                    console.error("Login failed:", oError);

                    this._handleODataError(oError);

                }.bind(this)

            });
        },

        onOpenRegisterDialog: function () {
            if (!this._oRegisterDialog) {
                this._oRegFullNameInput = new Input({ placeholder: "Enter full name", width: "100%" });
                this._oRegUsernameInput = new Input({ placeholder: "Enter username", width: "100%" });
                this._oRegPasswordInput = new Input({ type: "Password", placeholder: "Enter password", width: "100%" });
                this._oRegRoleInput = new Input({ placeholder: "e.g. Manager, Sales Exec", value: "User", width: "100%" });

                this._oRegisterDialog = new Dialog({
                    title: "Register New User",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            class: "sapUiSmallMargin",
                            items: [
                                new Label({ text: "Full Name", required: true }),
                                this._oRegFullNameInput,
                                new Label({ text: "User Name", required: true }),
                                this._oRegUsernameInput,
                                new Label({ text: "Password", required: true }),
                                this._oRegPasswordInput,
                                new Label({ text: "Role" }),
                                this._oRegRoleInput
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Register",
                        type: "Emphasized",
                        press: this.onRegisterUser.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oRegisterDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oRegisterDialog);
            }

            this._oRegFullNameInput.setValue("");
            this._oRegUsernameInput.setValue("");
            this._oRegPasswordInput.setValue("");
            this._oRegRoleInput.setValue("User");

            this._oRegisterDialog.open();
        },

        onRegisterUser: function () {
            var sFullName = this._oRegFullNameInput.getValue().trim();
            var sUsername = this._oRegUsernameInput.getValue().trim();
            var sPassword = this._oRegPasswordInput.getValue();
            var sRole = this._oRegRoleInput.getValue().trim() || "User";

            if (!sFullName || !sUsername || !sPassword) {
                MessageBox.warning("Please fill in all mandatory fields (Full Name, User Name, Password).");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var oPayload = {
                LoginId: "000",
                Fullname: sFullName,
                UserName: sUsername,
                Password: sPassword,
                Role: sRole,
                Active: "X"
            };

            this._oRegisterDialog.setBusy(true);

            // Fetch token via explicit GET before POSTing payload
            this._ensureTokenAndExecute(oModel, function () {
                oModel.create("/LoginSet", oPayload, {
                    success: function () {
                        this._oRegisterDialog.setBusy(false);
                        this._oRegisterDialog.close();
                        MessageToast.show("Account created successfully! You can now log in.");

                        this.byId("username").setValue(sUsername);
                        this.byId("password").setValue(sPassword);
                    }.bind(this),
                    error: function (oError) {
                        this._oRegisterDialog.setBusy(false);
                        this._handleODataError(oError);
                    }.bind(this)
                });
            }.bind(this));
        },

        // Helper to retrieve token via GET before calling POST
        // _ensureTokenAndExecute: function (oModel, fnCallback) {

        //     oModel.refreshSecurityToken(

        //         function () {

        //             console.log(
        //                 "CSRF Token:",
        //                 oModel.getSecurityToken()
        //             );

        //             fnCallback();

        //         },

        //         function (oError) {

        //             console.error(
        //                 "CSRF token fetch failed:",
        //                 oError
        //             );

        //             MessageBox.error(
        //                 "Unable to get CSRF token from SAP Gateway."
        //             );

        //         }.bind(this)
        //     );
        // },

        // Helper for error parsing (prevents JSON.parse crash on text responses)
        _handleODataError: function (oError) {
            var sMessage = "Request failed.";
            if (oError && oError.responseText) {
                try {
                    var oResponse = JSON.parse(oError.responseText);
                    if (oResponse.error && oResponse.error.message) {
                        sMessage = oResponse.error.message.value;
                    }
                } catch (e) {
                    sMessage = "Authentication or CSRF validation failed.";
                }
            }
            MessageBox.error(sMessage);
        }

    });
});