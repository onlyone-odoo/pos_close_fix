/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

console.log("%c[DEBUG] pos_store_patch.js cargado - aplicando patch a PosStore", "background:#2196f3;color:white;font-size:16px");

patch(PosStore.prototype, {
    async closePos() {
        console.log("%c[DEBUG CLOSEPOS] closePos patched iniciado", "background:#ff5722;color:white;font-size:16px");
        console.log("   → this.session.state actual:", this.session.state);
        console.log("   → Cajero actual (get_cashier):", this.get_cashier());

        this._resetConnectedCashier();
        console.log("   → _resetConnectedCashier completado");

        if (!this) {
            console.log("   → !this TRUE → llamando redirectToBackend");
            this.redirectToBackend();
            return;
        }

        if (this.session.state === "opening_control") {
            console.log("   → State 'opening_control' detectado → intentamos RPC delete_opening_control_session");
            try {
                const result = await this.data.call(
                    "pos.session",
                    "delete_opening_control_session",
                    [this.session.id]
                );
                console.log("   → RPC result:", result);
                if (result?.status === "success") {
                    console.log("   → RPC success → llamando redirectToBackend");
                    this.redirectToBackend();
                    return;
                } else {
                    console.log("   → RPC NO success (status:", result?.status, ") → forzamos redirect de todos modos");
                    this.redirectToBackend();
                    return;
                }
            } catch (err) {
                console.error("   → RPC error:", err);
                console.log("   → Error en RPC → forzamos redirectToBackend");
                this.redirectToBackend();
                return;
            }
        }

        console.log("   → No opening_control → procedemos con push_orders_with_closing_popup");
        try {
            const syncSuccess = await this.push_orders_with_closing_popup();
            console.log("   → syncSuccess:", syncSuccess);
            if (syncSuccess) {
                console.log("   → Sync OK → llamando redirectToBackend");
                this.redirectToBackend();
            }
        } catch (err) {
            console.error("   → Error en push_orders:", err);
            console.log("   → Error en sync → forzamos redirectToBackend");
            this.redirectToBackend();
        }
    },
});