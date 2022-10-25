/* extension.js
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

/* exported init */

const { Clutter, GObject, GLib, Meta, Shell} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Logger = Me.imports.logger.Logger;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.hotedge';
const HOT_EDGE_PRESSURE_TIMEOUT = 1000; // ms
let LOGGER = null


function init() {
    return new Extension();
}


class Extension {
    constructor() {
        this._edgeHandlerId = null;
        this._settingsHandlerId = null;
        this._settings = null;
    }

    enable() {
        LOGGER = new Logger('HotEdge', SETTINGS_SCHEMA);
    
        this._settings = ExtensionUtils.getSettings(SETTINGS_SCHEMA);
        this._settingsHandlerId = this._settings.connect('changed', this._onSettingsChange.bind(this));
        this._edgeHandlerId = Main.layoutManager.connect('hot-corners-changed', this._updateHotEdges.bind(this));
        
        Main.layoutManager._updateHotCorners();
    }

    disable() {
        Main.layoutManager.disconnect(this._edgeHandlerId);
        this._settings.disconnect(this._settingsHandlerId);
        this._settings = null;
        
        Main.layoutManager._updateHotCorners();
        
        LOGGER = null;
    }
    
    _onSettingsChange() {
        Main.layoutManager._updateHotCorners();
    }
    
    _updateHotEdges() {
        LOGGER.info('Updating hot edges.');
        let pressureThreshold = this._settings.get_uint('pressure-threshold');
        let fallbackTimeout = this._settings.get_uint('fallback-timeout');
        let edgeSize = this._settings.get_uint('edge-size') / 100;
        LOGGER.debug('pressureThreshold ' + pressureThreshold);
        LOGGER.debug('fallbackTimeout ' + fallbackTimeout);
        LOGGER.debug('edgeSize ' + edgeSize);
        
        // build new hot edges
        for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
            let monitor = Main.layoutManager.monitors[i];
            let leftX = monitor.x;
            let rightX = monitor.x + monitor.width;
            let bottomY = monitor.y + monitor.height;
            let size = monitor.width;

            let haveBottom = true;

            // Check if we have a bottom.
            // i.e. if there is no monitor directly below
            for (let j = 0; j < Main.layoutManager.monitors.length; j++) {
                if (i == j) {
                    continue;
                }
                let otherMonitor = Main.layoutManager.monitors[j];
                let otherLeftX = otherMonitor.x;
                let otherRightX = otherMonitor.x + otherMonitor.width;
                let otherTopY = otherMonitor.y;
                if (otherTopY >= bottomY && otherLeftX < rightX && otherRightX > leftX) {
                    haveBottom = false;
                }
            }

            if (haveBottom) {
                LOGGER.debug('Monitor ' + i + ' has a bottom, adding a hot edge.');
                let edge = new HotEdge(Main.layoutManager, monitor, leftX, bottomY, this._settings);
                edge.setBarrierSize(size);
                Main.layoutManager.hotCorners.push(edge);
            } else {
                LOGGER.debug('Monitor ' + i + ' does not have a bottom, not adding a hot edge.');
                Main.layoutManager.hotCorners.push(null);
            }
        }
    }
}


const HotEdge = GObject.registerClass(
class HotEdge extends Clutter.Actor {
    _init(layoutManager, monitor, x, y, settings) {
        LOGGER.debug('Creating hot edge x: ' + x + ' y: ' + y);
        super._init();

        this._monitor = monitor;
        this._x = x;
        this._y = y;
        this._settings = settings;
        this._fallbackTimeout = this._settings.get_uint('fallback-timeout');
        this._edgeSize = this._settings.get_uint('edge-size') / 100;
        this._suppressActivationWhenButtonHeld = this._settings.get_boolean('suppress-activation-when-button-held');
        this._suppressActivationWhenFullscreen = this._settings.get_boolean('suppress-activation-when-fullscreen')

        this._setupFallbackEdgeIfNeeded(layoutManager);

        let pressureThreshold = this._settings.get_uint('pressure-threshold');
        this._pressureBarrier = new Layout.PressureBarrier(pressureThreshold,
                                                    HOT_EDGE_PRESSURE_TIMEOUT,
                                                    Shell.ActionMode.NORMAL |
                                                    Shell.ActionMode.OVERVIEW);
        this._pressureBarrier.connect('trigger', this._toggleOverview.bind(this));

        this.connect('destroy', this._onDestroy.bind(this));
    }

    setBarrierSize(size) {
        if (this._barrier) {
            this._pressureBarrier.removeBarrier(this._barrier);
            this._barrier.destroy();
            this._barrier = null;
        }

        if (size > 0) {
            size = this._monitor.width * this._edgeSize
            let x_offset = (this._monitor.width - size) / 2
            LOGGER.debug('Setting barrier size to ' + size);
            this._barrier = new Meta.Barrier({ display: global.display,
                                                       x1: this._x + x_offset, x2: this._x + x_offset + size, 
                                                       y1: this._y, y2: this._y,
                                                       directions: Meta.BarrierDirection.NEGATIVE_Y });
            this._pressureBarrier.addBarrier(this._barrier);
        }
    }

    _setupFallbackEdgeIfNeeded(layoutManager) {
        if (!global.display.supports_extended_barriers()) {
            LOGGER.warn('Display does not support extended barriers, using fallback path.');
            this._settings.set_boolean('fallback-in-use', true);
            
            let size = this._monitor.width * this._edgeSize
            let x_offset = (this._monitor.width - this._edgeSize) / 2
            
            this.set({
                name: 'hot-edge',
                x: this._x + x_offset,
                y: this._y - 1,
                width: size,
                height: 1,
                reactive: true,
                _timeoutId: null
            });
            layoutManager.addChrome(this);
        } else {
            this._settings.set_boolean('fallback-in-use', false);
        }
    }

    _onDestroy() {
        this.setBarrierSize(0);
        this._pressureBarrier.destroy();
        this._pressureBarrier = null;
    }

    _toggleOverview() {
        if (this._suppressActivationWhenButtonHeld && (global.get_pointer()[2] & Clutter.ModifierType.BUTTON1_MASK)) {
            return;
        }

        if (this._suppressActivationWhenFullscreen && this._monitor.inFullscreen && !Main.overview.visible)
            return;

        if (Main.overview.shouldToggleByCornerOrButton()) {
            Main.overview.toggle();
        }
    }

    vfunc_enter_event(crossingEvent) {
        if (!this._timeoutId) {
            this._timeoutId = GLib.timeout_add(GLib.PRIORITY_HIGH, this._fallbackTimeout, () => {
                this._toggleOverview();
                return GLib.SOURCE_REMOVE;
            });
        }
        return Clutter.EVENT_PROPAGATE;
    }

    vfunc_leave_event(crossingEvent) {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }
        return Clutter.EVENT_PROPAGATE;
    }
});

