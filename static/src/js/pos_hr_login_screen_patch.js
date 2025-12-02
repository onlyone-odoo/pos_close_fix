/** @odoo-module **/

/**
 * Patches the LoginScreen to modify the clickBack method.
 * Skips the user_id check, handles PIN validation, and directly calls closePos to force backend redirection
 * even for advanced employees without linked user_id, avoiding selection loop.
 */

import { patch } from "@web/core/utils/patch";
import { LoginScreen } from "@point_of_sale/app/screens/login_screen/login_screen";  // Base LoginScreen, extended by pos_hr

// Log to confirm file loading
console.log("%c[DEBUG POS_HR_PATCH] Archivo pos_hr_login_screen_patch.js cargado exitosamente", "background:#ff5722;color:white;font-size:16px");

patch(LoginScreen.prototype, {
    setup() {
        super.setup(...arguments);
        console.log("%c[DEBUG SETUP] Setup de LoginScreen patched iniciado", "background:#ff5722;color:white;font-size:16px");
    },
    async selectCashier(pin = false, login = false, list = false) {
        console.log("%c[DEBUG SELECTCASHIER] selectCashier llamado", "background:#ff5722;color:white;font-size:16px");
        console.log(" → pin:", pin, "login:", login, "list:", list);
        const employee = await super.selectCashier(pin, login, list);
        console.log(" → Empleado retornado por super:", employee);
        return employee;
    },
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

            // Optional: Check if selected employee is in advanced_employee_ids
            // const isAdvanced = this.pos.config.advanced_employee_ids.includes(employee.id);
            // console.log(" → Es cajero avanzado:", isAdvanced);
            // if (!isAdvanced) {
            //     console.log(" → No es advanced → NO procede");
            //     return;
            // }

            // Proceed for any selected employee (or advanced only if uncommented above)
            if (employee) {
                console.log(" → Empleado seleccionado válido → llamando this.pos.closePos() para forzar cierre y redirección");
                await this.pos.closePos();  // Direct call to patched closePos to break loop and force redirect
                return;
            } else {
                console.log(" → No empleado seleccionado → NO redirige");
            }
        }
    },
});

// Log to confirm patch application
console.log("%c[DEBUG POS_HR_PATCH] Patch aplicado correctamente en LoginScreen.prototype", "background:#ff5722;color:white;font-size:16px");