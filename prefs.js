/* prefs.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class HotEdgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const builder = new Gtk.Builder();
        const uiFilePath = this.path.concat("/ui/prefs.ui");
        builder.add_from_file(uiFilePath);

        const page = builder.get_object("preferences_main_page");
        window.add(page);

        this.bindSettings(builder, settings);
    }

    bindSettings(builder, settings) {
        // Position
        settings.bind("edge-size",
            builder.get_object("edge_size_spin_button"),
            "value",
            Gio.SettingsBindFlags.DEFAULT);
        this.connectResetButton("edge-size",
            builder.get_object("edge_size_reset_button"),
            settings);
        settings.bind("primary-monitor-only",
            builder.get_object("primary_monitor_only_switch"),
            "active",
            Gio.SettingsBindFlags.DEFAULT);

        // Behavior
        settings.bind("fallback-timeout",
            builder.get_object("timeout_spin_button"),
            "value",
            Gio.SettingsBindFlags.DEFAULT);
        this.connectResetButton("fallback-timeout",
            builder.get_object("timeout_reset_button"),
            settings);
        settings.bind("pressure-threshold",
            builder.get_object("pressure_spin_button"),
            "value",
            Gio.SettingsBindFlags.DEFAULT);
        this.connectResetButton("pressure-threshold",
            builder.get_object("pressure_reset_button"),
            settings);
        settings.bind("suppress-activation-when-button-held",
            builder.get_object("suppress_on_mouse_switch"),
            "active",
            Gio.SettingsBindFlags.DEFAULT);
        settings.bind("suppress-activation-when-fullscreen",
            builder.get_object("suppress_on_fullscreen_switch"),
            "active",
            Gio.SettingsBindFlags.DEFAULT);

        // Decide whether to show timeout or pressure
        const fallbackInUse = settings.get_boolean("fallback-in-use");
        const timeoutRow = builder.get_object("timeout_row");
        timeoutRow.connect("map", () => {
            timeoutRow.visible = fallbackInUse;
        });
        const pressureRow = builder.get_object("pressure_row");
        pressureRow.connect("map", () => {
            pressureRow.visible = !fallbackInUse;
        });

        // Appearance
        settings.bind("show-animation",
            builder.get_object("show_animation_switch"),
            "active",
            Gio.SettingsBindFlags.DEFAULT);
    }

    connectResetButton(preferenceKey, button, settings) {
        button.connect("clicked", () => {
            settings.reset(preferenceKey);
        });
        button.connect("map", () => {
            button.visible =
                settings.get_uint(preferenceKey) != settings.get_default_value(preferenceKey).get_uint32();
        });
        settings.connect("changed::".concat(preferenceKey), () => {
            button.visible =
                settings.get_uint(preferenceKey) != settings.get_default_value(preferenceKey).get_uint32();
        });
    }

}
