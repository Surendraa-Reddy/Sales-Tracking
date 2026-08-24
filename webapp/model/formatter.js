
sap.ui.define([], function () {
    "use strict";

    return {

        formatOrderDate: function (oDate) {

            if (!oDate) {
                return "";
            }

            var oDateObject;

            if (oDate instanceof Date) {
                oDateObject = oDate;
            } else if (typeof oDate === "string") {

                var aMatch = oDate.match(/\/Date\((\d+)\)\//);

                if (aMatch) {
                    oDateObject = new Date(
                        parseInt(aMatch[1], 10)
                    );
                } else {
                    oDateObject = new Date(oDate);
                }

            } else if (typeof oDate === "number") {

                oDateObject = new Date(oDate);

            } else {

                return "";
            }

            if (isNaN(oDateObject.getTime())) {
                return "";
            }

            var sDay = String(
                oDateObject.getDate()
            ).padStart(2, "0");

            var sMonth = String(
                oDateObject.getMonth() + 1
            ).padStart(2, "0");

            var sYear = String(
                oDateObject.getFullYear()
            ).slice(-2);

            return sDay + "/" + sMonth + "/" + sYear;
        }

    };
});