# -*- coding: utf-8 -*-
{
    "name": "POS Close Fix",
    "summary": "Fix closePos in opening_control state to avoid get_order_list error",
    "description": """
        Patches PosStore to add return in opening_control for backend button in LoginScreen.
        Compatible with Odoo 18 EE.
    """,
    "author": "Be OnlyOne",
    "maintainers": ["onlyone-odoo"],
    "website": "https://onlyone.odoo.com/",
    "category": "Point of Sale",
    "version": "18.0.1.0.0",
    "depends": ["point_of_sale"],
    "data": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_close_fix/static/src/js/pos_store_patch.js",
        ],
    },
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
}
