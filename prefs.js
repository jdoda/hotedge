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
 
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class HotEdgePreferences extends ExtensionPreferences {

    getPreferencesWidget() {

        let prefsWidget = new Gtk.Grid({
            margin_start: 16,
            margin_end: 16,
            margin_top: 16,
            margin_bottom: 16,
            column_spacing: 24,
            row_spacing: 12,
            visible: true
        });

        prefsWidget._settings = this.getSettings();
        
        if (prefsWidget._settings.get_boolean('fallback-in-use')) {
            // fallback-timeout
            let fallbackLabel = new Gtk.Label({
                label: 'Activation Timeout (ms)',
                halign: Gtk.Align.START,
                hexpand: true,
                visible: true
            });
            prefsWidget.attach(fallbackLabel, 0, 0, 1, 1);

            let fallbackInput = new Gtk.SpinButton({
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1000,
                    step_increment: 50,
                }),
                halign: Gtk.Align.END,
                hexpand: true,
                visible: true
            });
            prefsWidget.attach(fallbackInput, 1, 0, 1, 1);

            prefsWidget._settings.bind(
                'fallback-timeout',
                fallbackInput,
                'value',
                Gio.SettingsBindFlags.DEFAULT
            );
        } else {
            // pressure-threshold
            let pressureLabel = new Gtk.Label({
                label: 'Activation Pressure (px)',
                halign: Gtk.Align.START,
                hexpand: true,
                visible: true
            });
            prefsWidget.attach(pressureLabel, 0, 0, 1, 1);

            let pressureInput = new Gtk.SpinButton({
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 500,
                    step_increment: 25,
                }),
                halign: Gtk.Align.END,
                hexpand: true,
                visible: true
            });
            prefsWidget.attach(pressureInput, 1, 0, 1, 1);

            prefsWidget._settings.bind(
                'pressure-threshold',
                pressureInput,
                'value',
                Gio.SettingsBindFlags.DEFAULT
            );
        }

        // edge-size
        let edgeSizeLabel = new Gtk.Label({
            label: 'Edge Size (% of display)',
            halign: Gtk.Align.START,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(edgeSizeLabel, 0, 1, 1, 1);

        let edgeSizeInput = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 100,
                step_increment: 10,
            }),
            halign: Gtk.Align.END,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(edgeSizeInput, 1, 1, 1, 1);

        prefsWidget._settings.bind(
            'edge-size',
            edgeSizeInput,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );  

        // suppress-activation-when-button-held
        let suppressActivationButtonHeldLabel = new Gtk.Label({
            label: "Don't activate when a button is held",
            halign: Gtk.Align.START,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(suppressActivationButtonHeldLabel, 0, 2, 1, 1);

        let suppressActivationButtonHeldInput = new Gtk.Switch({
            halign: Gtk.Align.END,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(suppressActivationButtonHeldInput, 1, 2, 1, 1);

        prefsWidget._settings.bind(
            'suppress-activation-when-button-held',
            suppressActivationButtonHeldInput,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );  

        // suppress-activation-when-fullscreen
        let suppressActivationFullscreenLabel = new Gtk.Label({
            label: "Don't activate when an application is fullscreen",
            halign: Gtk.Align.START,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(suppressActivationFullscreenLabel, 0, 3, 1, 1);

        let suppressActivationFullscreenInput = new Gtk.Switch({
            halign: Gtk.Align.END,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(suppressActivationFullscreenInput, 1, 3, 1, 1);

        prefsWidget._settings.bind(
            'suppress-activation-when-fullscreen',
            suppressActivationFullscreenInput,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // min-log-level
        let logLevelLabel = new Gtk.Label({
            label: 'Log Level',
            halign: Gtk.Align.START,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(logLevelLabel, 0, 4, 1, 1);

        let logLevelInput = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 4,
                step_increment: 1,
            }),
            halign: Gtk.Align.END,
            hexpand: true,
            visible: true
        });
        prefsWidget.attach(logLevelInput, 1, 4, 1, 1);

        prefsWidget._settings.bind(
            'min-log-level',
            logLevelInput,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );    
        

        return prefsWidget;
    }
}

