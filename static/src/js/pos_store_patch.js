/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async closePos() {
        this._resetConnectedCashier();
        if (!this) {
            this.redirectToBackend();
            return;
        }
        if (this.session.state === "opening_control") {
            try {
                const data = await this.data.call("pos.session", "delete_opening_control_session", [this.session.id]);
                if (data.status === "success") {
                    this.redirectToBackend();
                    return;
                }
            } catch (err) {
                // Manejo silencioso del error
            }
            // Forzamos redirección aunque el RPC falle
            this.redirectToBackend();
            return;
        }
        const syncSuccess = await this.push_orders_with_closing_popup();
        if (syncSuccess) {
            this.redirectToBackend();
        }
    },
});