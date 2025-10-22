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

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Layout from 'resource:///org/gnome/shell/ui/layout.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Ripples from 'resource:///org/gnome/shell/ui/ripples.js';


const HOT_EDGE_PRESSURE_TIMEOUT = 1000; // ms
const LOG_PREFIX = "HotEdge | "


export default class HotEdgeExtension extends Extension {

    constructor(metadata) {
        super(metadata);

        this._edgeHandlerId = null;
        this._settingsHandlerId = null;
        this._settings = null;
    }

    enable() {
        this._settings = this.getSettings();
        this._settingsHandlerId = this._settings.connect('changed', this._onSettingsChange.bind(this));
        this._edgeHandlerId = Main.layoutManager.connect('hot-corners-changed', this._updateHotEdges.bind(this));
        
        Main.layoutManager._updateHotCorners();
    }

    disable() {
        Main.layoutManager.disconnect(this._edgeHandlerId);
        this._settings.disconnect(this._settingsHandlerId);
        this._settings = null;
        
        Main.layoutManager._updateHotCorners();
    }
    
    _onSettingsChange() {
        Main.layoutManager._updateHotCorners();
    }
    
    _updateHotEdges() {
        console.info(LOG_PREFIX + 'Updating hot edges.');
        let pressureThreshold = this._settings.get_uint('pressure-threshold');
        let fallbackTimeout = this._settings.get_uint('fallback-timeout');
        let edgeSize = this._settings.get_uint('edge-size') / 100;
        console.debug(LOG_PREFIX + 'pressureThreshold %d', pressureThreshold);
        console.debug(LOG_PREFIX + 'fallbackTimeout %d', fallbackTimeout);
        console.debug(LOG_PREFIX + 'edgeSize %d%', edgeSize * 100);
        
        // build new hot edges
        for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
            if (this._settings.get_boolean('primary-monitor-only') && i != Main.layoutManager.primaryIndex) {
                console.debug(LOG_PREFIX + 'primary-monitor-only is true and monitor %d is not the primary, not adding a hot edge.', i);
                continue;
            }
        
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
                console.debug(LOG_PREFIX + 'Monitor %d has a bottom, adding a hot edge.', i);
                let edge = new HotEdge(Main.layoutManager, monitor, leftX, bottomY, this._settings);
                edge.setBarrierSize(size);
                Main.layoutManager.hotCorners.push(edge);
            } else {
                console.debug(LOG_PREFIX + 'Monitor %d does not have a bottom, not adding a hot edge.', i);
                Main.layoutManager.hotCorners.push(null);
            }
        }
    }
}


const HotEdge = GObject.registerClass(
class HotEdge extends Clutter.Actor {
    _init(layoutManager, monitor, x, y, settings) {
        console.debug(LOG_PREFIX + 'Creating hot edge x: %d y: %d', x, y);
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
        this._ripples = new Ripples.Ripples(0.5, 0.5, 'ripple-centered');
        this._ripples.addTo(layoutManager.uiGroup);

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
            console.debug(LOG_PREFIX + 'Setting barrier size to %d', size);
            this._barrier = new Meta.Barrier({ backend: global.backend,
                                                       x1: this._x + x_offset, x2: this._x + x_offset + size, 
                                                       y1: this._y, y2: this._y,
                                                       directions: Meta.BarrierDirection.NEGATIVE_Y });
            this._pressureBarrier.addBarrier(this._barrier);
        }
    }

    _setupFallbackEdgeIfNeeded(layoutManager) {
        const {capabilities} = global.backend;
        if ((capabilities & Meta.BackendCapabilities.BARRIERS) === 0) {
            console.warn(LOG_PREFIX + 'Display does not support extended barriers, using fallback path.');
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
        this._ripples.destroy();
    }

    _toggleOverview() {
        if (this._suppressActivationWhenButtonHeld && (global.get_pointer()[2] & Clutter.ModifierType.BUTTON1_MASK)) {
            return;
        }

        if (this._suppressActivationWhenFullscreen && this._monitor.inFullscreen && !Main.overview.visible)
            return;

        if (Main.overview.shouldToggleByCornerOrButton()) {
            Main.overview.toggle();
            if (Main.overview.animationInProgress)
                this._ripples.playAnimation(global.get_pointer()[0], this._y);
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

