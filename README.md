# Hot Edge

A GNOME Shell extension that adds a hot edge that activates the overview to the bottom of the screen. 

## Features

### Simple and light
Hot Edge is a simple and light-weight extension. It doesn't make any changes to the existing GNOME Shell code, so it won't cause bugs or crashes. 
Hot Edge is updated for new versions of GNOME shortly after the beta is released, and well before the final release is available in distributions.

### An alternative to docks
Hot Edge provides a very natural mouse-based workflow that feels like using an auto-hiding dock, but without altering the default GNOME UI.

### Multi-monitor support
Hot Edge by default will add a hot edge to any monitor that does not have another monitor below it (since in that case the hot edge would interfere with moving the 
cursor from one monitor to the other). Alternatively, Hot Edge can be set to only add a hot edge on the primary monitor.

### Prevents accidental activation
Hot edge is carefully designed to minimize accidental activation, and provides a number of settings that allow you to further tune the behaviour to find the right
balance between responsiveness and reliability.


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

Hot Edge exposes two settings that alter its sensitivity : `pressure-threshold` and `fallback-timeout`. Only one of these settings is active at a time, depending on whether your system supports pressure barriers or has to use the timeout based fallback code. The preferences dialog will always show setting that is currently in use.

### pressure-threshold

`pressure-threshold` is the distance the cursor must be moved "into" the bottom edge in order for it to activate. It's measured in pixels and the default value is 100 px. 

### fallback-timeout

`fallback-timeout` is the time the cursor must be touching the bottom edge in order for it to activate when using the fallback path. It's measure in milliseconds and the default value is 250 ms.

### edge-size

`edge-size` is the size of the hot region of the edge, measure as a precentage of the width of the display. The hot region is always centered, so decreasing this value creates larger deadzones extending in from the corners.

### suppress-activation-when-button-held

When `suppress-activation-when-button-held` is true the hot edge will not activate when a mouse button is held down. This reduces the chance of accidental activation, but also prevents you from using th ehot edge to open the shell during drag-and-drop operations.

### suppress-activation-when-fullscreen
 
When `suppress-activation-when-fullscreen` is true the hot edge will not activate when a fullscreen window has focus. This prevents accidental activation when playing games or
watching fullscreen videos.
 
### primary-monitor-only

Adds the hot edge to only the primary monitor.

