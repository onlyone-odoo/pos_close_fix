/** @odoo-module **/

/**
 * Patches the PosStore to customize the closePos method.
 * Resets the connected cashier and forces backend redirection,
 * even for cashiers without linked user_id or if RPC fails.
 */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

// Minimal log to confirm file loading
console.log("%c[DEBUG POS_CLOSE_FIX] Archivo pos_store_patch.js cargado exitosamente", "background:#ff5722;color:white;font-size:16px");

patch(PosStore.prototype, {
    async closePos() {
        // Reset connected cashier to allow disconnection even without user_id
        this._resetConnectedCashier();

        // Early return if context is invalid
        if (!this) {
            this.redirectToBackend();
            return;
        }

        // Handle opening_control state with RPC, but force redirect on failure
        if (this.session.state === "opening_control") {
            try {
                const data = await this.data.call("pos.session", "delete_opening_control_session", [this.session.id]);
                if (data.status === "success") {
                    this.redirectToBackend();
                    return;
                }
            } catch (err) {
                // Silent error handling
            }
            // Force redirection even if RPC fails
            this.redirectToBackend();
            return;
        }

        // Proceed with order sync and redirect on success
        const syncSuccess = await this.push_orders_with_closing_popup();
        if (syncSuccess) {
            this.redirectToBackend();
        }
    },
});