sap.ui.define(
    [
        "sap/ui/core/Control",
        "sap/m/DatePicker",
        "sap/m/Link",
        "sap/m/Button",
        "sap/base/util/deepEqual"
    ], (Control) => {
        return Control.extend("cc.maxitsolutions.medicare.Datepicker", {
            renderer: {
                apiVersion: 2,
                /**
                * @param {sap.ui.core.RenderManager} oRM
                * @param {sap.ui.core.Control} oControl
                */
                render(oRM, oControl) {
                    oRM.openStart("p", oControl)
                    oRM.openEnd()
                    oRM.text("UI5 custom control: Hello World!")
                    oRM.close("p")
                }
            },
            metadata: {
                events: {
                    change: {
                        parameters: {
                            oValue: { type: "object" }
                        }
                    }
                },
                properties: {
                    sType: { type: "string" }, //days, weeks, mooths
                    oDate: { type: "object" },
                },
                aggregations: {
                    _buttonLeft: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                    _text: { type: "sap.m.Link", multiple: false, visibility: "hidden" },
                    _datePicker: { type: "sap.m.DatePicker", multiple: false, visibility: "hidden" },
                    _buttonRight: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                }
            },
            setSType: function (sType) {
                this.setProperty("sType", sType, true);
                switch (this.getProperty("sType")) {
                    case 'days':
                        //todo
                        break;
                    case 'weeks':
                        //todo
                        break;
                    case 'months':
                        this.getAggregation("_datePicker").setDisplayFormat("MM-y");
                        break;
                }
            },
            setODate: function (oDate) {
                if (oDate == null) {
                    throw new Error("Unexpected value detected!");
                }
                this.setProperty("oDate", oDate, true);
                switch (this.getProperty("sType")) {
                    case 'days':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "EEEE dd.MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon));
                        break;
                    case 'weeks':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon) + " - " + oDateFormat.format(oDate.dDateEnde));
                        break;
                    case 'months':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon));
                        this.getAggregation("_datePicker").setDateValue(oDate.dDateVon);
                        break;
                }
            },
            init: function () {
                const that = this;
                this.setAggregation("_buttonLeft", new Button({
                    icon: "sap-icon://arrow-left",
                    press: function () {
                        var oDateCurrent = that.getProperty("oDate");
                        that.onDateChange(-1, oDateCurrent);
                    }
                }).addStyleClass("sapUiTinyMargin"));

                this.setAggregation("_text", new Link({
                    subtle: true,
                    emphasized: true,
                    press: (oEvent) => {
                        that.getAggregation("_datePicker").openBy(oEvent.getSource().getDomRef());
                    }
                }).addStyleClass("sapUiTinyMargin"));

                this.setAggregation("_datePicker", new DatePicker({
                    change: (oEvent) => {
                        const oDateCurrent = { dDateVon: oEvent.getSource().getDateValue(), dDateEnde: oEvent.getSource().getDateValue() };
                        this.onDateChange(0, oDateCurrent);
                    }
                }));

                this.setAggregation("_buttonRight", new Button({
                    icon: "sap-icon://arrow-right",
                    press: function () {
                        var oDateCurrent = that.getProperty("oDate");
                        that.onDateChange(1, oDateCurrent);
                    }
                }).addStyleClass("sapUiTinyMargin"));
            },
            onDateChange: function (nChange, oDateNew) {
                //calulate new result date
                var oResultDate;
                switch (this.getProperty("sType")) {
                    case 'days':
                        var dDate = new Date(oDateNew.dDateVon);
                        oDate.setDate(dDate.getDate() + nChange);
                        oResultDate = this.getDayBordersOfDate(dDate)
                        break;
                    case 'weeks':
                        var dDate = new Date(oDateNew.dDateVon);
                        oDate.setDate(dDate.getDate() + 7 * nChange);
                        oResultDate = this.getWeekBordersOfDate(dDate)
                        break;
                    case 'months':
                        const oOtherMonth = this.getPrevOrNextMonth(oDateNew.dDateVon, nChange);
                        oResultDate = this.getMonthBordersOfDate(oOtherMonth);
                        break;
                }
                //check if date is changed and only set and fire event when changed
                var oDateCurrent = this.getProperty("oDate");
                if (deepEqual(oDateCurrent, oResultDate)) {
                    return;
                }
                this.setODate(oResultDate);
                this.fireEvent("change", { oValue: oResultDate });
            },
            getPrevOrNextMonth: function (dDate, nChange) {
                var nMonth = dDate.getMonth() + nChange + 1;
                var nYear = dDate.getFullYear();
                if (nChange === -1 && nMonth === 0) {
                    nYear = dDate.getFullYear() + nChange;
                    nMonth = 12;
                } else if (nChange === 1 && nMonth === 13) {
                    nYear = dDate.getFullYear() + nChange;
                    nMonth = 1;
                }
                return new Date(nYear, nMonth, 0);
            },
            getDayBordersOfDate: function (dDate) {
                const dDateVon = new Date(dDate);
                dDateVon.setHours(0, 0, 0, 0);
                const dDateEnde = new Date(dDateVon);
                dDateEnde.setHours(23, 59, 59, 999);
                return { dDateVon, dDateEnde };
            },
            getWeekBordersOfDate: function (dDate) {
                const dDateVon = new Date(dDate);
                dDateVon.setDate(dDate.getDate() - (dDate.getDay() === 0 ? 7 : dDate.getDay()) + 1);
                dDateVon.setHours(0, 0, 0, 0);
                const dDateEnde = new Date(dDateVon);
                dDateEnde.setDate(dDateEnde.getDate() + 7 - dDateEnde.getDay());
                dDateEnde.setHours(23, 59, 59, 999);
                return { dDateVon, dDateEnde };
            },
            getMonthBordersOfDate: function (dDate) {
                return {
                    dDateVon: new Date(dDate.getFullYear(), dDate.getMonth(), 1, 0, 0, 0, 0),
                    dDateEnde: new Date(dDate.getFullYear(), dDate.getMonth() + 1, 0, 23, 59, 59, 999),
                };
            }
        })
    })