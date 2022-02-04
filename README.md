# Hot Edge

A GNOME Shell extension that adds a hot edge that activates the overview to the bottom of the screen. This minimizes the pointer travel required to access the dash when using the new GNOME Shell 40 overview layout.

## Installation

The latest release of Hot Edge can be installed from [extensions.gnome.org](https://extensions.gnome.org/extension/4222/hot-edge/).

Alternatively, you can install the latest development version of Hot Edge from git using the following commands:

```
git clone https://github.com/jdoda/hotedge.git
cd hotedge
make install
```

## Configuration

Hot Edge does not disable the existing hot-corner. The hot-corner can be disabled using the GNOME Tweaks tool, using the setting **Top Bar > Activities Overview Hot Corner**.

Hot Edge exposes two settings that alter its sensitivity : `pressure-threshold` and `fallback-timeout`. Only one of these settings is active at a time, depending on whether your system supports pressure barriers or has to use the timeout based fallback code. You can check this on your system by running the command `journalctl -g hotedge /usr/bin/gnome-shell` and checking for a line like `HotEdge: Display does not support extended barriers, falling back to old method.`. This indicates that you're using the fallback code, and need to adjust the `fallback-timeout` key and not the `pressure-threshold` setting. Otherwise, you must adjust the `pressure-threshold` setting and the `fallback-timeout` setting has no effect.

### pressure-threshold

`pressure-threshold` is the distance the cursor must be moved "into" the bottom edge in order for it to acivate. It's measured in pixels and the default value is 100 px. 

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge pressure-threshold 200`

### fallback-timeout

`fallback-timeout` is the time the cursor must be touching the bottom edge in order for it to activate when using the fallback path. It's measure in milliseconds and the default value is 250 ms.

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge fallback-timeout 500`

### edge-size

`edge-size` is the size of the hot region of the edge, measure as a precentage of the width of the display. The hot region is always centered, so decreasing this value creates larger deadzones extending in from the corners.

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge edge-size 50`

### suppress-activation-when-button-held

When `suppress-activation-when-button-held` is true the hot edge will not activate when a mouse button is held down. This reduces the chance of accidental activation, but also prevents you from using th ehot edge to open the shell during drag-and-drop operations.

### min-log-level

`min-log-level` is the minimum level of log statement that will be logged. Log levels increase in order of severity with 0 (DEBUG) being the lowest and 4 (FATAL) being the highest. The default value is 1 (INFO).

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge min-log-level 0`
 
