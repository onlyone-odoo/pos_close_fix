/** @odoo-module **/

/**
 * Patches the PosStore to customize the closePos method.
 * Resets the connected cashier and forces backend redirection,
 * even for cashiers without linked user_id or if RPC fails.
 */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

// Log inicial para confirmar que el archivo JS se carga en el bundle
console.log("%c[DEBUG POS_CLOSE_FIX] Archivo pos_store_patch.js cargado exitosamente", "background:#ff5722;color:white;font-size:16px");

patch(PosStore.prototype, {
    async closePos() {
        console.log("%c[DEBUG CLOSEPOS] closePos iniciado", "background:#ff5722;color:white;font-size:16px");
        console.log(" → this.session.state:", this.session.state);
        console.log(" → Cajero actual:", this.get_cashier());

        // Reset connected cashier to allow disconnection even without user_id
        this._resetConnectedCashier();
        console.log(" → _resetConnectedCashier completado");

        // Early return if context is invalid
        if (!this) {
            console.log(" → !this TRUE → redirectToBackend()");
            this.redirectToBackend();
            return;
        }

        // Handle opening_control state with RPC, but force redirect on failure
        if (this.session.state === "opening_control") {
            console.log(" → State opening_control → llamando delete_opening_control_session");
            try {
                const data = await this.data.call("pos.session", "delete_opening_control_session", [this.session.id]);
                console.log(" → RPC response:", data);
                if (data.status === "success") {
                    console.log(" → Success → redirectToBackend()");
                    this.redirectToBackend();
                    return;
                } else {
                    console.log(" → No success → forzando redirect de todos modos");
                }
            } catch (err) {
                console.error(" → RPC error:", err);
            }
            // Force redirection even if RPC fails
            console.log(" → Forzando redirectToBackend() después de opening_control");
            this.redirectToBackend();
            return;
        }

        // Proceed with order sync and redirect on success
        console.log(" → No opening_control → llamando push_orders_with_closing_popup");
        try {
            const syncSuccess = await this.push_orders_with_closing_popup();
            console.log(" → syncSuccess:", syncSuccess);
            if (syncSuccess) {
                console.log(" → Sync OK → redirectToBackend()");
                this.redirectToBackend();
            } else {
                console.log(" → Sync falló → NO redirige (posible bug?)");
            }
        } catch (err) {
            console.error(" → Error en push_orders:", err);
        }
    },
});

// Log final para confirmar que el patch se aplicó sin errores
console.log("%c[DEBUG POS_CLOSE_FIX] Patch aplicado correctamente en PosStore.prototype", "background:#ff5722;color:white;font-size:16px");