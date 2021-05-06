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

Hot Edge exposes two gsettings keys that can modify it's behaviour : `pressure-threshold` and `fallback-timeout`. These keys contol the sensitivity of the bottom edge to activation but only one of the keys is active at a time, depending on whether your system supports pressure barriers or has to use the timeout based fallback code. You can check this on your system by running the command `journalctl -g hotedge /usr/bin/gnome-shell` and checking for a line like `HotEdge: Display does not support extended barriers, falling back to old method.`. This indicates that you're using the fallback code, and need to adjust the `fallback-timeout` key and not the `pressure-threshold` key. Otherwise, you must adjust the `pressure-threshold` key and the `fallback-timeout` key has no effect.

### pressure-threshold

`pressure-threshold` is the distance the cursor must be moved "into" the bottom edge in order for it to acivate. It's measured in pixels and the default value is 100 px. 

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge pressure-threshold 200`

### fallback-timeout

`fallback-timeout` is the time the cursor must be touching the bottom edge in order for it to activate when using the fallback path. It's measure in milliseconds and the default value is 250 ms.

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@jonathan.jdoda.ca/schemas set org.gnome.shell.extensions.hotedge fallback-timeout 500`

