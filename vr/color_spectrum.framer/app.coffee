# set initial screen color
Screen.backgroundColor = "hsl(0,100,50)"

# create environment
{VRComponent, VRLayer} = require "VRComponent"
vr = new VRComponent

# create lifx http request
request = new XMLHttpRequest()

# monitor orientation changes
vr.on Events.OrientationDidChange, (data) =>
	heading = data.heading
	elevation = data.elevation

	# set screen color
	Screen.backgroundColor = "hsl(
		#{heading},
		100,
		#{Utils.modulate(elevation, [-90, 90], [0, 100])})"

	# set lifx color
	request.open("GET", """http://macbook.local:3000/set/bulb1?
		bulb1[h]=#{heading}&
		bulb1[s]=#{Utils.modulate(elevation, [0, 90], [1, 0], true)}&
		bulb1[l]=#{Utils.modulate(elevation, [-90, 90], [0, 1])}""")
	request.send()