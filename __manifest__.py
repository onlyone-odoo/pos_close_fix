# -*- coding: utf-8 -*-
{
    "name": "POS Close Fix",
    "summary": "Fix closePos() in opening_control state (Odoo 18 EE + pos_hr)",
    "description": """
        When using pos_hr and clicking "Backend" from LoginScreen with an advanced employee,
        the session is in 'opening_control' state and push_orders fails with:
        TypeError: this.get_order_list is not a function

        This module patches PosStore.closePos() to properly handle opening_control
        and redirect to backend without errors.
    """,
    "author": "Be OnlyOne",
    "maintainers": ["onlyone-odoo"],
    "website": "https://onlyone.odoo.com/",
    "category": "Point of Sale",
    "version": "18.0.1.0.6",
    "depends": ["point_of_sale", "pos_hr"],
    "data": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_close_fix/static/src/js/pos_hr_login_screen_patch.js",
            "pos_close_fix/static/src/js/pos_store_patch.js",
        ],
    },
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
}
