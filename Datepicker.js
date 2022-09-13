sap.ui.define(["sap/ui/core/Control"], (Control) => {
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
        }
    })
})