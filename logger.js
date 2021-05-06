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
 
/* exported Logger */

const { GObject } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const LEVEL = ['DEBUG', 'INFO', 'WARN', 'ERROR',  'FATAL'];

class Logger {
    constructor(componentName, schema) {
        this._componentName = componentName;
        this._settings = ExtensionUtils.getSettings(schema);
        this._settings.connect('changed', this._onSettingsChange.bind(this));
        this._min_level = 0;
        this._onSettingsChange();
    }
    
    debug(message) {
        this._log(0, message);
    }
    
    info(message) {
        this._log(1, message);
    }
    
    warn(message) {
        this._log(2, message);
    }
    
    error(message) {
        this._log(3, message);
    }
    
    fatal(message) {
        this._log(4, message);
    }
    
    _log(level, message) {
        if (level >= this._min_level) {
            log(this._componentName + ' | ' + LEVEL[level] + ' | ' + message);
        }
    }
    
    _onSettingsChange() {
        this._min_level = this._settings.get_uint('min-log-level');
    }
}
