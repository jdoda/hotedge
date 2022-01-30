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
        label: 'Activation Pressure (px)',
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

    // edge-size
    let edgeSizeLabel = new Gtk.Label({
        label: 'Edge Size (% of display)',
        halign: Gtk.Align.START,
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
        visible: true
    });
    prefsWidget.attach(edgeSizeInput, 1, 1, 1, 1);

    this.settings.bind(
        'edge-size',
        edgeSizeInput,
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

