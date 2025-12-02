/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

console.log("%c[DEBUG] pos_store_patch.js cargado - aplicando patch a PosStore", "background:#4caf50;color:white;font-size:16px");  // ← Confirma carga

patch(PosStore.prototype, {
    async closePos() {
        console.log("%c[DEBUG] closePos patched - iniciando fix", "background:#ff5722;color:white;font-size:16px");  // ← Confirma que se llama
        this._resetConnectedCashier();

        if (!this) {
            this.redirectToBackend();
            return;
        }

        if (this.session.state === "opening_control") {
            try {
                const result = await this.data.call(
                    "pos.session",
                    "delete_opening_control_session",
                    [this.session.id]
                );
                if (result?.status === "success") {
                    this.redirectToBackend();
                    return;
                }
            } catch (err) {
                // Si falla el RPC, igual salimos
            }
            this.redirectToBackend();
            return;
        }

        const syncSuccess = await this.push_orders_with_closing_popup();
        if (syncSuccess) {
            this.redirectToBackend();
        }
    },
});