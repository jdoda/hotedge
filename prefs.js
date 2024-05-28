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
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class HotEdgePreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        const settings = this.getSettings();
      
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const behaviorGroup = new Adw.PreferencesGroup({
            title: 'Behavior'
        });
        page.add(behaviorGroup);

        if (settings.get_boolean('fallback-in-use')) {
            // fallback-timeout
            const timeoutRow = new Adw.SpinRow({
                title: 'Activation Timeout',
                subtitle: 'milliseconds',
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1000,
                    step_increment: 50,
                }),
            });
            settings.bind(
                'fallback-timeout',
                timeoutRow,
                'value',
                Gio.SettingsBindFlags.DEFAULT
            );
            behaviorGroup.add(timeoutRow);
        }
        else {
            // pressure-threshold
            const pressureRow = new Adw.SpinRow({
                title: 'Activation Pressure',
                subtitle: 'pixels',
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 500,
                    step_increment: 25,
                }),
            });
            settings.bind(
                'pressure-threshold',
                pressureRow,
                'value',
                Gio.SettingsBindFlags.DEFAULT
            );
            behaviorGroup.add(pressureRow);
        }
        
        // edge-size
        const edgeSizeRow = new Adw.SpinRow({
            title: 'Edge Size',
            subtitle: '% of display width',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 100,
                step_increment: 10,
            }),
        });
        settings.bind(
            'edge-size',
            edgeSizeRow,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        behaviorGroup.add(edgeSizeRow);
        
        // suppress-activation-when-button-held
        const suppressWhenButtonHeldRow = new Adw.SwitchRow({
            title: "Don't activate when a mouse button is held"
        });
        settings.bind(
            'suppress-activation-when-button-held',
            suppressWhenButtonHeldRow,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        behaviorGroup.add(suppressWhenButtonHeldRow);
        
        // suppress-activation-when-fullscreen
        const suppressWhenFullscreenRow = new Adw.SwitchRow({
            title: "Don't activate when an application is fullscreen"
        });
        settings.bind(
            'suppress-activation-when-fullscreen',
            suppressWhenFullscreenRow,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        behaviorGroup.add(suppressWhenFullscreenRow);
        
        // primary-monitor-only
        const primaryMonitorOnlyRow = new Adw.SwitchRow({
            title: "Hot edge only on the primary monitor"
        });
        settings.bind(
            'primary-monitor-only',
            primaryMonitorOnlyRow,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        behaviorGroup.add(primaryMonitorOnlyRow);
    }
}

