/** @odoo-module **/

/**
 * Patches the LoginScreen to modify the clickBack method.
 * Skips the user_id check to allow backend redirection even for employees without linked user_id.
 */

import { patch } from "@web/core/utils/patch";
import { LoginScreen } from "@point_of_sale/app/screens/login_screen/login_screen";  // Base LoginScreen, extended by pos_hr

// Log to confirm file loading
console.log("%c[DEBUG POS_HR_PATCH] Archivo pos_hr_login_screen_patch.js cargado exitosamente", "background:#ff5722;color:white;font-size:16px");

patch(LoginScreen.prototype, {
    async clickBack() {
        console.log("%c[DEBUG CLICKBACK] clickBack iniciado en LoginScreen patched", "background:#ff5722;color:white;font-size:16px");
        console.log(" → Cajero actual:", this.pos.get_cashier());
        console.log(" → this.pos.login:", this.pos.login);
        console.log(" → this.pos.config.module_pos_hr:", this.pos.config.module_pos_hr);

        if (!this.pos.config.module_pos_hr) {
            console.log(" → No pos_hr → llamando super.clickBack()");
            super.clickBack();
            return;
        }

        if (this.pos.login) {
            console.log(" → Login activo → reseteando pin y login");
            this.state.pin = "";
            this.pos.login = false;
        } else {
            console.log(" → No login → llamando selectCashier()");
            const employee = await this.selectCashier();
            console.log(" → Empleado seleccionado:", employee);

            // Skip the user_id check: allow redirection for any selected employee (even without user_id)
            if (employee) {
                console.log(" → Empleado seleccionado (cualquiera) → llamando super.clickBack()");
                super.clickBack();
                return;
            } else {
                console.log(" → No empleado seleccionado → NO redirige");
            }
        }
    },
});

// Log to confirm patch application
console.log("%c[DEBUG POS_HR_PATCH] Patch aplicado correctamente en LoginScreen.prototype", "background:#ff5722;color:white;font-size:16px");