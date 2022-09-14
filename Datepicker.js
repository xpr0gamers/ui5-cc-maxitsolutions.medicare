sap.ui.define(
    [
        "sap/ui/core/Control",
        "sap/m/DatePicker",
        "sap/m/Link",
        "sap/m/Button",
        "sap/base/util/deepEqual"
    ], (Control, DatePicker, Link, Button, deepEqual) => {
        return Control.extend("cc.maxitsolutions.medicare.Datepicker", {
            metadata: {
                events: {
                    change: {
                        parameters: {
                            oValue: { type: "object" }
                        }
                    }
                },
                properties: {
                    sType: { type: "string", defaultValue: "days" }, //days, weeks, months
                    oDate: { type: "object" },
                },
                aggregations: {
                    _buttonLeft: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                    _text: { type: "sap.m.Link", multiple: false, visibility: "hidden" },
                    _datePicker: { type: "sap.m.DatePicker", multiple: false, visibility: "hidden" },
                    _buttonRight: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                }
            },
            renderer: {
                apiVersion: 2,
                /**
                * @param {sap.ui.core.RenderManager} oRm
                * @param {sap.ui.core.Control} oControl
                */
                render(oRm, oControl) {
                    oRm.openStart("div", oControl);
                    oRm.style("display", "flex");
                    oRm.style("flex-direction", "row");
                    oRm.style("align-items", "center");
                    oRm.style("justify-content", "center");
                    oRm.openEnd();
                    oRm.renderControl(oControl.getAggregation("_buttonLeft"))
                    oRm.renderControl(oControl.getAggregation("_text"));
                    oRm.renderControl(oControl.getAggregation("_buttonRight"));
                    oRm.close("div")
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
                    width: "80px",
                    textAlign: "Center",
                    wrapping: true,
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

                //set default value for date
                if (this.getODate() == null) {
                    const oDefaultDateValue = this.getDateForType(this.getSType(), { dDateVon: new Date() }, 0);
                    this.setODate(oDefaultDateValue);
                }
            },
            setSType: function (sType) {
                //validation
                if (["days", "weeks", "months"].includes(sType) == false) {
                    throw new Error("Unexpected value detected for sType!");
                }
                this.setProperty("sType", sType, true);
                this.syncAggregations();
            },
            setODate: function (oDate) {
                //validation
                if (oDate == null) {
                    throw new Error("Unexpected value detected for oData!");
                }
                this.setProperty("oDate", oDate, true);
                this.syncAggregations();
            },
            syncAggregations: function () {
                const sType = this.getProperty("sType");
                const oDate = this.getProperty("oDate");
                switch (sType) {
                    case 'days':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "EEEE dd.MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon));
                        this.getAggregation("_datePicker").setDisplayFormat("dd.MM.yyyy");
                        this.getAggregation("_datePicker").setDateValue(oDate.dDateVon);
                        break;
                    case 'weeks':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon) + " - " + oDateFormat.format(oDate.dDateEnde));
                        this.getAggregation("_datePicker").setDisplayFormat("dd.MM.yyyy");
                        this.getAggregation("_datePicker").setDateValue(oDate.dDateVon);
                        break;
                    case 'months':
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "MMMM MM.yyyy" });
                        this.getAggregation("_text").setText(oDateFormat.format(oDate.dDateVon));
                        this.getAggregation("_datePicker").setDisplayFormat("MM-y");
                        this.getAggregation("_datePicker").setDateValue(oDate.dDateVon);
                        break;
                }
            },
            getDateForType: function (sType, oDate, nChange) {
                switch (sType) {
                    case 'days':
                        var dDate = new Date(oDate.dDateVon);
                        dDate.setDate(dDate.getDate() + nChange);
                        return this.getDayBordersOfDate(dDate)
                    case 'weeks':
                        var dDate = new Date(oDate.dDateVon);
                        dDate.setDate(dDate.getDate() + (7 * nChange));
                        return this.getWeekBordersOfDate(dDate)
                    case 'months':
                        const oOtherMonth = this.getPrevOrNextMonth(oDate.dDateVon, nChange);
                        return this.getMonthBordersOfDate(oOtherMonth);
                    default:
                        throw new Error(sType + " is not a valid type for this Datepicker");
                }
            },
            onDateChange: function (nChange, oDateNew) {
                //calulate new result date
                var oResultDate = this.getDateForType(this.getProperty("sType"), oDateNew, nChange);
                //check if date is changed and only set and fire event when changed
                //This happens, when original datepicker is opened
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