/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async closePos() {
        this._resetConnectedCashier();

        // Si no hay contexto (raro pero posible)
        if (!this) {
            this.redirectToBackend();
            return;
        }

        // Caso crítico: sesión en opening_control (LoginScreen con pos_hr)
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
                // Silencioso: si falla el RPC, igual salimos
            }
            // Forzamos salida aunque el RPC falle
            this.redirectToBackend();
            return;
        }

        // Caso normal: sesión abierta → sincronizar órdenes
        const syncSuccess = await this.push_orders_with_closing_popup();
        if (syncSuccess) {
            this.redirectToBackend();
        }
    },
});