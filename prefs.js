'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.hotedge';


function init() {
}

function buildPrefsWidget() {

    this.settings = ExtensionUtils.getSettings(SETTINGS_SCHEMA);

    let prefsWidget = new Gtk.Grid({
        margin_start: 16,
        margin_top: 16,
        column_spacing: 24,
        row_spacing: 12,
        visible: true
    });

    // pressure-threshold
    let pressureLabel = new Gtk.Label({
        label: 'Activation Pressure',
        halign: Gtk.Align.START,
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
        visible: true
    });
    prefsWidget.attach(pressureInput, 1, 0, 1, 1);

    this.settings.bind(
        'pressure-threshold',
        pressureInput,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    // corner-deadzone
    let deadzoneLabel = new Gtk.Label({
        label: 'Corner Deadzone Size',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(deadzoneLabel, 0, 1, 1, 1);

    let deadzoneInput = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 2000,
            step_increment: 10,
        }),
        halign: Gtk.Align.END,
        visible: true
    });
    prefsWidget.attach(deadzoneInput, 1, 1, 1, 1);

    this.settings.bind(
        'corner-deadzone',
        deadzoneInput,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );  
       
    // min-log-level
    let logLevelLabel = new Gtk.Label({
        label: 'Log Level',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(logLevelLabel, 0, 2, 1, 1);

    let logLevelInput = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 4,
            step_increment: 1,
        }),
        halign: Gtk.Align.END,
        visible: true
    });
    prefsWidget.attach(logLevelInput, 1, 2, 1, 1);

    this.settings.bind(
        'min-log-level',
        logLevelInput,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );    

    return prefsWidget;
}

