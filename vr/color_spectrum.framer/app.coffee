# create environment
{VRComponent, VRLayer} = require "VRComponent"
vr = new VRComponent
	perspective: 1000
	lookAtLatestProjectedLayer: true
	back:	"images/back.png"
	bottom:	"images/bottom.png"
	front:	"images/front.png"
	left:	"images/left.png"
	right:	"images/right.png"
	top:	"images/top.png"
	
# create circle
diameter = Math.min(Screen.width, Screen.height) * .35

circle = new Layer
	width: diameter
	height: diameter
	backgroundColor: ''
	borderRadius: diameter * .5
	borderWidth: diameter * .08
	borderColor: 'rgba(255,255,255,.7)'
	x: Align.center
	y: Align.center

# create lifx http request
request = new XMLHttpRequest()

# monitor orientation changes
vr.on Events.OrientationDidChange, (data) =>
	heading = data.heading
	elevation = data.elevation

	# set screen color
	circle.backgroundColor = "hsla(
		#{heading},
		100,
		#{Utils.modulate(elevation, [-90, 90], [0, 100])},
		.8)"

	# set lifx color
# 	request.open("GET", """http://macbook.local:3000/set/bulb1?
# 		bulb1[h]=#{heading}&
# 		bulb1[s]=#{Utils.modulate(elevation, [0, 90], [1, 0], true)}&
# 		bulb1[l]=#{Utils.modulate(elevation, [-90, 90], [0, 1])}""")
# 	request.send()