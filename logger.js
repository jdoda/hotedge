/* logger.js
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


const LEVEL = ['DEBUG', 'INFO', 'WARN', 'ERROR'];


export default class Logger {
    constructor(componentName, settings) {
        this._componentName = componentName;
        this._settings = settings;
        this._settings.connect('changed', this._onSettingsChange.bind(this));
        this._min_level = 0;
        this._onSettingsChange();
    }
    
    debug(message) {
        if (0 >= this._min_level) {
            console.debug("%s | %s", this._componentName, message);
        }
    }
    
    info(message) {
        if (1 >= this._min_level) {
            console.info("%s | %s", this._componentName, message);
        }
    }
    
    warn(message) {
        if (2 >= this._min_level) {
            console.warn("%s | %s", this._componentName, message);
        }
    }
    
    error(message) {
        if (3 >= this._min_level) {
            console.error("%s | %s", this._componentName, message);
        }
    }
    
    _onSettingsChange() {
        this._min_level = this._settings.get_uint('min-log-level');
    }
}
