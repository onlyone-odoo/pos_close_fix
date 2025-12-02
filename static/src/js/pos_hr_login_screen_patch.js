/** @odoo-module **/

/**
 * Patches the LoginScreen to modify the clickBack method.
 * Skips the user_id check, handles PIN validation, and directly calls closePos to force backend redirection
 * even for advanced employees without linked user_id, avoiding selection loop.
 */

import { patch } from "@web/core/utils/patch";
import { LoginScreen } from "@point_of_sale/app/screens/login_screen/login_screen";  // Base LoginScreen, extended by pos_hr

// Minimal log to confirm file loading
console.log("%c[DEBUG POS_HR_PATCH] Archivo pos_hr_login_screen_patch.js cargado exitosamente", "background:#ff5722;color:white;font-size:16px");

patch(LoginScreen.prototype, {
    setup() {
        super.setup(...arguments);
    },
    async selectCashier(pin = false, login = false, list = false) {
        const employee = await super.selectCashier(pin, login, list);
        return employee;
    },
    async clickBack() {
        if (!this.pos.config.module_pos_hr) {
            super.clickBack();
            return;
        }

        if (this.pos.login) {
            this.state.pin = "";
            this.pos.login = false;
        } else {
            const employee = await this.selectCashier();

            // Optional: Check if selected employee is in advanced_employee_ids
            // const isAdvanced = this.pos.config.advanced_employee_ids.includes(employee.id);
            // if (!isAdvanced) {
            //     return;
            // }

            // Proceed for any selected employee (or advanced only if uncommented above)
            if (employee) {
                await this.pos.closePos();  // Direct call to patched closePos to break loop and force redirect
                return;
            }
        }
    },
});