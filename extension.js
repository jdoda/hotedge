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

const { Clutter, GObject, Meta, Shell} = imports.gi;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const HOT_EDGE_PRESSURE_THRESHOLD = 100; // pixels
const HOT_EDGE_PRESSURE_TIMEOUT = 1000; // ms

class Extension {
    constructor() {
        this._handlerId = null;
    }

    enable() {
        this._handlerId = Main.layoutManager.connect('hot-corners-changed', () => {
            updateHotEdges();
        });
        updateHotEdges();
    }

    disable() {
        Main.layoutManager.disconnect(this._handlerId);
        Main.layoutManager._updateHotCorners();
    }
}

function init() {
    return new Extension();
}

const HotEdge = GObject.registerClass(
class HotEdge extends Clutter.Actor {
    _init(layoutManager, monitor, x, y) {
        log('HotEdge: Creating hot edge x: ' + x + ' y: ' + y);
        super._init();

        // We use this flag to mark the case where the user has entered the
        // hot edge and has not left both the hot edge and a surrounding
        // guard area (the "environs"). This avoids triggering the hot edge
        // multiple times due to an accidental jitter.
        this._entered = false;

        this._monitor = monitor;

        this._x = x;
        this._y = y;

        this._setupFallbackEdgeIfNeeded(layoutManager);

        this._pressureBarrier = new Layout.PressureBarrier(HOT_EDGE_PRESSURE_THRESHOLD,
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
            size = this._monitor.width // We always want the size to be the full width of the monitor.
            log('HotEdge: Setting barrier size to ' + size);
            this._barrier = new Meta.Barrier({ display: global.display,
                                                       x1: this._x, x2: this._x + size, y1: this._y, y2: this._y,
                                                       directions: Meta.BarrierDirection.NEGATIVE_Y }); 
            this._pressureBarrier.addBarrier(this._barrier);
        }
    }

    _setupFallbackEdgeIfNeeded(layoutManager) {
        if (!global.display.supports_extended_barriers()) {
            log('HotEdge: Display does not support extended barriers, falling back to old method.');
            this.set({
                name: 'hot-edge-environs',
                x: this._x,
                y: this._y - 3,
                width: this._monitor.width,
                height: 3,
                reactive: true,
            });

            this._edge = new Clutter.Actor({ name: 'hot-edge',
                                               width: this._monitor.width,
                                               height: 1,
                                               opacity: 0,
                                               reactive: true });
            this._edge._delegate = this;

            this.add_child(this._edge);
            layoutManager.addChrome(this);

            this._edge.set_position(0, this.height);

            this._edge.connect('enter-event',
                                 this._onEdgeEntered.bind(this));
            this._edge.connect('leave-event',
                                 this._onEdgeLeft.bind(this));
        }
    }

    _onDestroy() {
        this.setBarrierSize(0);
        this._pressureBarrier.destroy();
        this._pressureBarrier = null;
    }

    _toggleOverview() {
        if (this._monitor.inFullscreen && !Main.overview.visible)
            return;

        if (Main.overview.shouldToggleByCornerOrButton()) {
            Main.overview.toggle();
        }
    }

    handleDragOver(source, _actor, _x, _y, _time) {
        if (source != Main.xdndHandler)
            return DND.DragMotionResult.CONTINUE;

        this._toggleOverview();

        return DND.DragMotionResult.CONTINUE;
    }

    _onEdgeEntered() {
        if (!this._entered) {
            this._entered = true;
            this._toggleOverview();
        }
        return Clutter.EVENT_PROPAGATE;
    }

    _onEdgeLeft(actor, event) {
        if (event.get_related() != this)
            this._entered = false;
        // Consume event, otherwise this will confuse onEnvironsLeft
        return Clutter.EVENT_STOP;
    }

    vfunc_leave_event(crossingEvent) {
        if (crossingEvent.related != this._edge)
            this._entered = false;
        return Clutter.EVENT_PROPAGATE;
    }
});


function updateHotEdges() {
        log('HotEdge: Updating hot edges.');
        
        // destroy old hot corners / edges
        Main.layoutManager.hotCorners.forEach(corner => {
            if (corner) {
                corner.destroy();
            }
        });
        Main.layoutManager.hotCorners = [];

        if (!Main.layoutManager._interfaceSettings.get_boolean('enable-hot-corners')) {
            return;
        }

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
                log('HotEdge: Monitor ' + i + ' has a bottom, adding a hot edge.');
                let edge = new HotEdge(Main.layoutManager, monitor, leftX, bottomY);
                edge.setBarrierSize(size);
                Main.layoutManager.hotCorners.push(edge);
            } else {
                log('HotEdge: Monitor ' + i + ' does not have a bottom, not adding a hot edge.');
                Main.layoutManager.hotCorners.push(null);
            }
        }
    }


