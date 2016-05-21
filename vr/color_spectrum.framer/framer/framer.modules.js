require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"VRComponent":[function(require,module,exports){
"\nVRComponent class\n\nproperties\n- front (set: imagePath <string>, get: layer)\n- right\n- back\n- left\n- top\n- bottom\n- heading <number>\n- elevation <number>\n- tilt <number> readonly\n\n- orientationLayer <bool>\n- arrowKeys <bool>\n- lookAtLatestProjectedLayer <bool>\n\nmethods\n- projectLayer(layer) # heading and elevation are set as properties on the layer\n- hideEnviroment()\n\nevents\n- Events.OrientationDidChange, (data {heading, elevation, tilt})\n\n--------------------------------------------------------------------------------\n\nVRLayer class\n\nproperties\n- heading <number> (from 0 up to 360)\n- elevation <number> (from -90 down to 90 up)\n";
var KEYS, KEYSDOWN, SIDES, VRAnchorLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SIDES = ["north", "front", "east", "right", "south", "back", "west", "left", "top", "bottom"];

KEYS = {
  LeftArrow: 37,
  UpArrow: 38,
  RightArrow: 39,
  DownArrow: 40
};

KEYSDOWN = {
  left: false,
  up: false,
  right: false,
  down: false
};

Events.OrientationDidChange = "orientationdidchange";

VRAnchorLayer = (function(superClass) {
  extend(VRAnchorLayer, superClass);

  function VRAnchorLayer(layer, cubeSide) {
    VRAnchorLayer.__super__.constructor.call(this, void 0);
    this.width = 0;
    this.height = 0;
    this.clip = false;
    this.name = "anchor";
    this.cubeSide = cubeSide;
    this.layer = layer;
    layer.superLayer = this;
    layer.center();
    layer.on("change:orientation", (function(_this) {
      return function(newValue, layer) {
        return _this.updatePosition(layer);
      };
    })(this));
    this.updatePosition(layer);
    layer._context.on("layer:destroy", (function(_this) {
      return function(layer) {
        if (layer === _this.layer) {
          return _this.destroy();
        }
      };
    })(this));
  }

  VRAnchorLayer.prototype.updatePosition = function(layer) {
    var halfCubSide;
    halfCubSide = this.cubeSide / 2;
    return this.style["webkitTransform"] = "translateX(" + ((this.cubeSide - this.width) / 2) + "px) translateY(" + ((this.cubeSide - this.height) / 2) + "px) rotateZ(" + layer.heading + "deg) rotateX(" + (90 - layer.elevation) + "deg) translateZ(" + layer.distance + "px) rotateX(180deg)";
  };

  return VRAnchorLayer;

})(Layer);

exports.VRLayer = (function(superClass) {
  extend(VRLayer, superClass);

  function VRLayer(options) {
    if (options == null) {
      options = {};
    }
    options = _.defaults(options, {
      heading: 0,
      elevation: 0
    });
    VRLayer.__super__.constructor.call(this, options);
  }

  VRLayer.define("heading", {
    get: function() {
      return this._heading;
    },
    set: function(value) {
      var rest;
      if (value >= 360) {
        value = value % 360;
      } else if (value < 0) {
        rest = Math.abs(value) % 360;
        value = 360 - rest;
      }
      if (this._heading !== value) {
        this._heading = value;
        this.emit("change:heading", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      value = Utils.clamp(value, -90, 90);
      if (value !== this._elevation) {
        this._elevation = value;
        this.emit("change:elevation", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("distance", {
    get: function() {
      return this._distance;
    },
    set: function(value) {
      if (value !== this._distance) {
        this._distance = value;
        this.emit("change:distance", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  return VRLayer;

})(Layer);

exports.VRComponent = (function(superClass) {
  extend(VRComponent, superClass);

  function VRComponent(options) {
    if (options == null) {
      options = {};
    }
    this.addDesktopPanLayer = bind(this.addDesktopPanLayer, this);
    this.removeDesktopPanLayer = bind(this.removeDesktopPanLayer, this);
    this.deviceOrientationUpdate = bind(this.deviceOrientationUpdate, this);
    this.createCube = bind(this.createCube, this);
    options = _.defaults(options, {
      cubeSide: 3000,
      perspective: 1200,
      lookAtLatestProjectedLayer: false,
      width: Screen.width,
      height: Screen.height,
      orientationLayer: true,
      arrowKeys: true
    });
    VRComponent.__super__.constructor.call(this, options);
    this.perspective = options.perspective;
    this.backgroundColor = null;
    this.createCube(options.cubeSide);
    this.degToRad = Math.PI / 180;
    this.layersToKeepLevel = [];
    this.lookAtLatestProjectedLayer = options.lookAtLatestProjectedLayer;
    this.arrowKeys = options.arrowKeys;
    this._keys();
    this._heading = 0;
    this._elevation = 0;
    this._tilt = 0;
    this._headingOffset = 0;
    this._elevationOffset = 0;
    this._deviceHeading = 0;
    this._deviceElevation = 0;
    if (options.heading) {
      this.heading = options.heading;
    }
    if (options.elevation) {
      this.elevation = options.elevation;
    }
    this.orientationLayer = options.orientationLayer;
    this.desktopPan(0, 0);
    if (Utils.isMobile()) {
      window.addEventListener("deviceorientation", (function(_this) {
        return function(event) {
          return _this.orientationData = event;
        };
      })(this));
    }
    Framer.Loop.on("update", this.deviceOrientationUpdate);
    Framer.CurrentContext.on("reset", function() {
      return Framer.Loop.off("update", this.deviceOrientationUpdate);
    });
    this.on("change:frame", function() {
      return this.desktopPan(0, 0);
    });
  }

  VRComponent.prototype._keys = function() {
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = true;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = true;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = true;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = true;
              return event.preventDefault();
          }
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = false;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = false;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = false;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = false;
              return event.preventDefault();
          }
        }
      };
    })(this));
    return window.onblur = function() {
      KEYSDOWN.up = false;
      KEYSDOWN.down = false;
      KEYSDOWN.left = false;
      return KEYSDOWN.right = false;
    };
  };

  VRComponent.define("orientationLayer", {
    get: function() {
      return this.desktopOrientationLayer !== null && this.desktopOrientationLayer !== void 0;
    },
    set: function(value) {
      if (this.world !== void 0) {
        if (Utils.isDesktop()) {
          if (value === true) {
            return this.addDesktopPanLayer();
          } else if (value === false) {
            return this.removeDesktopPanLayer();
          }
        }
      }
    }
  });

  VRComponent.define("heading", {
    get: function() {
      var heading, rest;
      heading = this._heading + this._headingOffset;
      if (heading > 360) {
        heading = heading % 360;
      } else if (heading < 0) {
        rest = Math.abs(heading) % 360;
        heading = 360 - rest;
      }
      return heading;
    },
    set: function(value) {
      return this.lookAt(value, this._elevation);
    }
  });

  VRComponent.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      return this.lookAt(this._heading, value);
    }
  });

  VRComponent.define("tilt", {
    get: function() {
      return this._tilt;
    },
    set: function(value) {
      throw "Tilt is readonly";
    }
  });

  SIDES.map(function(face) {
    return VRComponent.define(face, {
      get: function() {
        return this.layerFromFace(face);
      },
      set: function(value) {
        return this.setImage(face, value);
      }
    });
  });

  VRComponent.prototype.createCube = function(cubeSide) {
    var colors, halfCubSide, i, index, key, len, ref, ref1, results, side, sideNames;
    if (cubeSide == null) {
      cubeSide = this.cubeSide;
    }
    this.cubeSide = cubeSide;
    if ((ref = this.world) != null) {
      ref.destroy();
    }
    this.world = new Layer({
      name: "world",
      superLayer: this,
      width: cubeSide,
      height: cubeSide,
      backgroundColor: null,
      clip: false
    });
    this.world.style.webkitTransformStyle = "preserve-3d";
    this.world.center();
    halfCubSide = this.cubeSide / 2;
    this.side0 = new Layer;
    this.side0.style["webkitTransform"] = "rotateX(-90deg) translateZ(-" + halfCubSide + "px)";
    this.side1 = new Layer;
    this.side1.style["webkitTransform"] = "rotateY(-90deg) translateZ(-" + halfCubSide + "px) rotateZ(90deg)";
    this.side2 = new Layer;
    this.side2.style["webkitTransform"] = "rotateX(90deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side3 = new Layer;
    this.side3.style["webkitTransform"] = "rotateY(90deg) translateZ(-" + halfCubSide + "px) rotateZ(-90deg)";
    this.side4 = new Layer;
    this.side4.style["webkitTransform"] = "rotateY(-180deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side5 = new Layer;
    this.side5.style["webkitTransform"] = "translateZ(-" + halfCubSide + "px)";
    this.sides = [this.side0, this.side1, this.side2, this.side3, this.side4, this.side5];
    colors = ["#866ccc", "#28affa", "#2dd7aa", "#ffc22c", "#7ddd11", "#f95faa"];
    sideNames = ["front", "right", "back", "left", "top", "bottom"];
    index = 0;
    ref1 = this.sides;
    for (i = 0, len = ref1.length; i < len; i++) {
      side = ref1[i];
      side.name = sideNames[index];
      side.width = side.height = cubeSide;
      side.superLayer = this.world;
      side.backgroundColor = '';
      side.style = {
        lineHeight: cubeSide + "px",
        textAlign: "center",
        fontSize: (cubeSide / 10) + "px",
        fontWeight: "100",
        fontFamily: "Helvetica Neue"
      };
      index++;
    }
    if (this.sideImages) {
      results = [];
      for (key in this.sideImages) {
        results.push(this.setImage(key, this.sideImages[key]));
      }
      return results;
    }
  };

  VRComponent.prototype.hideEnviroment = function() {
    var i, len, ref, results, side;
    ref = this.sides;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push(side.destroy());
    }
    return results;
  };

  VRComponent.prototype.layerFromFace = function(face) {
    var map;
    map = {
      north: this.side0,
      front: this.side0,
      east: this.side1,
      right: this.side1,
      south: this.side2,
      back: this.side2,
      west: this.side3,
      left: this.side3,
      top: this.side4,
      bottom: this.side5
    };
    return map[face];
  };

  VRComponent.prototype.setImage = function(face, imagePath) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent setImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    if (!this.sideImages) {
      this.sideImages = {};
    }
    this.sideImages[face] = imagePath;
    layer = this.layerFromFace(face);
    if (imagePath) {
      if (layer != null) {
        layer.html = "";
      }
      return layer != null ? layer.image = imagePath : void 0;
    } else {
      if (layer != null) {
        layer.html = layer != null ? layer.name : void 0;
      }
      return layer != null ? layer.backgroundColor = layer != null ? layer._backgroundColor : void 0 : void 0;
    }
  };

  VRComponent.prototype.getImage = function(face) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent getImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    layer = this.layerFromFace(face);
    if (layer) {
      return layer.image;
    }
  };

  VRComponent.prototype.projectLayer = function(insertLayer) {
    var anchor, distance, elevation, heading, rest;
    heading = insertLayer.heading;
    if (heading === void 0) {
      heading = 0;
    }
    elevation = insertLayer.elevation;
    if (elevation === void 0) {
      elevation = 0;
    }
    if (heading >= 360) {
      heading = value % 360;
    } else if (heading < 0) {
      rest = Math.abs(heading) % 360;
      heading = 360 - rest;
    }
    elevation = Utils.clamp(elevation, -90, 90);
    distance = insertLayer.distance;
    if (distance === void 0) {
      distance = 1200;
    }
    insertLayer.heading = heading;
    insertLayer.elevation = elevation;
    insertLayer.distance = distance;
    anchor = new VRAnchorLayer(insertLayer, this.cubeSide);
    anchor.superLayer = this.world;
    if (this.lookAtLatestProjectedLayer) {
      return this.lookAt(heading, elevation);
    }
  };

  VRComponent.prototype.deviceOrientationUpdate = function() {
    var alpha, beta, date, diff, gamma, halfCubSide, orientation, rotation, translationX, translationY, translationZ, x, xAngle, yAngle, zAngle;
    if (Utils.isDesktop()) {
      if (this.arrowKeys) {
        if (this._lastCallHorizontal === void 0) {
          this._lastCallHorizontal = 0;
          this._lastCallVertical = 0;
          this._accelerationHorizontal = 1;
          this._accelerationVertical = 1;
          this._goingUp = false;
          this._goingLeft = false;
        }
        date = new Date();
        x = .1;
        if (KEYSDOWN.up || KEYSDOWN.down) {
          diff = date - this._lastCallVertical;
          if (diff < 30) {
            if (this._accelerationVertical < 30) {
              this._accelerationVertical += 0.18;
            }
          }
          if (KEYSDOWN.up) {
            if (this._goingUp === false) {
              this._accelerationVertical = 1;
              this._goingUp = true;
            }
            this.desktopPan(0, 1 * this._accelerationVertical * x);
          } else {
            if (this._goingUp === true) {
              this._accelerationVertical = 1;
              this._goingUp = false;
            }
            this.desktopPan(0, -1 * this._accelerationVertical * x);
          }
          this._lastCallVertical = date;
        } else {
          this._accelerationVertical = 1;
        }
        if (KEYSDOWN.left || KEYSDOWN.right) {
          diff = date - this._lastCallHorizontal;
          if (diff < 30) {
            if (this._accelerationHorizontal < 25) {
              this._accelerationHorizontal += 0.18;
            }
          }
          if (KEYSDOWN.left) {
            if (this._goingLeft === false) {
              this._accelerationHorizontal = 1;
              this._goingLeft = true;
            }
            this.desktopPan(1 * this._accelerationHorizontal * x, 0);
          } else {
            if (this._goingLeft === true) {
              this._accelerationHorizontal = 1;
              this._goingLeft = false;
            }
            this.desktopPan(-1 * this._accelerationHorizontal * x, 0);
          }
          return this._lastCallHorizontal = date;
        } else {
          return this._accelerationHorizontal = 1;
        }
      }
    } else if (this.orientationData) {
      alpha = this.orientationData.alpha;
      beta = this.orientationData.beta;
      gamma = this.orientationData.gamma;
      if (alpha !== 0 && beta !== 0 && gamma !== 0) {
        this.directionParams(alpha, beta, gamma);
      }
      xAngle = beta;
      yAngle = -gamma;
      zAngle = alpha;
      halfCubSide = this.cubeSide / 2;
      orientation = "rotate(" + (window.orientation * -1) + "deg) ";
      translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
      translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
      translationZ = " translateZ(" + this.perspective + "px)";
      rotation = translationZ + translationX + translationY + orientation + (" rotateY(" + yAngle + "deg) rotateX(" + xAngle + "deg) rotateZ(" + zAngle + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
      return this.world.style["webkitTransform"] = rotation;
    }
  };

  VRComponent.prototype.directionParams = function(alpha, beta, gamma) {
    var alphaRad, betaRad, cA, cB, cG, cH, diff, elevation, gammaRad, heading, orientationTiltOffset, sA, sB, sG, tilt, xrA, xrB, xrC, yrA, yrB, yrC, zrA, zrB, zrC;
    alphaRad = alpha * this.degToRad;
    betaRad = beta * this.degToRad;
    gammaRad = gamma * this.degToRad;
    cA = Math.cos(alphaRad);
    sA = Math.sin(alphaRad);
    cB = Math.cos(betaRad);
    sB = Math.sin(betaRad);
    cG = Math.cos(gammaRad);
    sG = Math.sin(gammaRad);
    xrA = -sA * sB * sG + cA * cG;
    xrB = cA * sB * sG + sA * cG;
    xrC = cB * sG;
    yrA = -sA * cB;
    yrB = cA * cB;
    yrC = -sB;
    zrA = -sA * sB * cG - cA * sG;
    zrB = cA * sB * cG - sA * sG;
    zrC = cB * cG;
    heading = Math.atan(zrA / zrB);
    if (zrB < 0) {
      heading += Math.PI;
    } else if (zrA < 0) {
      heading += 2 * Math.PI;
    }
    elevation = Math.PI / 2 - Math.acos(-zrC);
    cH = Math.sqrt(1 - (zrC * zrC));
    tilt = Math.acos(-xrC / cH) * Math.sign(yrC);
    heading *= 180 / Math.PI;
    elevation *= 180 / Math.PI;
    tilt *= 180 / Math.PI;
    this._heading = Math.round(heading * 1000) / 1000;
    this._elevation = Math.round(elevation * 1000) / 1000;
    tilt = Math.round(tilt * 1000) / 1000;
    orientationTiltOffset = (window.orientation * -1) + 90;
    tilt += orientationTiltOffset;
    if (tilt > 180) {
      diff = tilt - 180;
      tilt = -180 + diff;
    }
    this._tilt = tilt;
    this._deviceHeading = this._heading;
    this._deviceElevation = this._elevation;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.removeDesktopPanLayer = function() {
    var ref;
    return (ref = this.desktopOrientationLayer) != null ? ref.destroy() : void 0;
  };

  VRComponent.prototype.addDesktopPanLayer = function() {
    var ref;
    if ((ref = this.desktopOrientationLayer) != null) {
      ref.destroy();
    }
    this.desktopOrientationLayer = new Layer({
      width: 100000,
      height: 10000,
      backgroundColor: null,
      superLayer: this,
      name: "desktopOrientationLayer"
    });
    this.desktopOrientationLayer.center();
    this.desktopOrientationLayer.draggable.enabled = true;
    this.prevDesktopDir = this.desktopOrientationLayer.x;
    this.prevDesktopHeight = this.desktopOrientationLayer.y;
    this.desktopOrientationLayer.on(Events.DragStart, (function(_this) {
      return function() {
        _this.prevDesktopDir = _this.desktopOrientationLayer.x;
        _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        return _this.desktopDraggableActive = true;
      };
    })(this));
    this.desktopOrientationLayer.on(Events.Move, (function(_this) {
      return function() {
        var deltaDir, deltaHeight, strength;
        if (_this.desktopDraggableActive) {
          strength = Utils.modulate(_this.perspective, [1200, 900], [22, 17.5]);
          deltaDir = (_this.desktopOrientationLayer.x - _this.prevDesktopDir) / strength;
          deltaHeight = (_this.desktopOrientationLayer.y - _this.prevDesktopHeight) / strength;
          _this.desktopPan(deltaDir, deltaHeight);
          _this.prevDesktopDir = _this.desktopOrientationLayer.x;
          return _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        }
      };
    })(this));
    return this.desktopOrientationLayer.on(Events.AnimationEnd, (function(_this) {
      return function() {
        var ref1;
        _this.desktopDraggableActive = false;
        return (ref1 = _this.desktopOrientationLayer) != null ? ref1.center() : void 0;
      };
    })(this));
  };

  VRComponent.prototype.desktopPan = function(deltaDir, deltaHeight) {
    var halfCubSide, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    this._heading -= deltaDir;
    if (this._heading > 360) {
      this._heading -= 360;
    } else if (this._heading < 0) {
      this._heading += 360;
    }
    this._elevation += deltaHeight;
    this._elevation = Utils.clamp(this._elevation, -90, 90);
    rotation = translationZ + translationX + translationY + (" rotateX(" + (this._elevation + 90) + "deg) rotateZ(" + (360 - this._heading) + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
    this.world.style["webkitTransform"] = rotation;
    this._heading = Math.round(this._heading * 1000) / 1000;
    this._tilt = 0;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.lookAt = function(heading, elevation) {
    var halfCubSide, ref, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    rotation = translationZ + translationX + translationY + (" rotateZ(" + this._tilt + "deg) rotateX(" + (elevation + 90) + "deg) rotateZ(" + (-heading) + "deg)");
    if ((ref = this.world) != null) {
      ref.style["webkitTransform"] = rotation;
    }
    this._heading = heading;
    this._elevation = elevation;
    if (Utils.isMobile()) {
      this._headingOffset = this._heading - this._deviceHeading;
    }
    this._elevationOffset = this._elevation - this._deviceElevation;
    heading = this._heading;
    if (heading < 0) {
      heading += 360;
    } else if (heading > 360) {
      heading -= 360;
    }
    return this.emit(Events.OrientationDidChange, {
      heading: heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  VRComponent.prototype._emitOrientationDidChangeEvent = function() {
    return this.emit(Events.OrientationDidChange, {
      heading: this.heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  return VRComponent;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvR3Vzc28vUHJvamVjdHMvc2Fsby92ci9jb2xvcl9zcGVjdHJ1bS5mcmFtZXIvbW9kdWxlcy9WUkNvbXBvbmVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBLElBQUEsb0NBQUE7RUFBQTs7Ozs7QUFvQ0EsS0FBQSxHQUFRLENBQ1AsT0FETyxFQUVQLE9BRk8sRUFHUCxNQUhPLEVBSVAsT0FKTyxFQUtQLE9BTE8sRUFNUCxNQU5PLEVBT1AsTUFQTyxFQVFQLE1BUk8sRUFTUCxLQVRPLEVBVVAsUUFWTzs7QUFhUixJQUFBLEdBQU87RUFDTixTQUFBLEVBQVcsRUFETDtFQUVOLE9BQUEsRUFBUyxFQUZIO0VBR04sVUFBQSxFQUFZLEVBSE47RUFJTixTQUFBLEVBQVcsRUFKTDs7O0FBT1AsUUFBQSxHQUFXO0VBQ1YsSUFBQSxFQUFNLEtBREk7RUFFVixFQUFBLEVBQUksS0FGTTtFQUdWLEtBQUEsRUFBTyxLQUhHO0VBSVYsSUFBQSxFQUFNLEtBSkk7OztBQU9YLE1BQU0sQ0FBQyxvQkFBUCxHQUE4Qjs7QUFFeEI7OztFQUVRLHVCQUFDLEtBQUQsRUFBUSxRQUFSO0lBQ1osK0NBQU0sTUFBTjtJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsUUFBRCxHQUFZO0lBRVosSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULEtBQUssQ0FBQyxVQUFOLEdBQW1CO0lBQ25CLEtBQUssQ0FBQyxNQUFOLENBQUE7SUFFQSxLQUFLLENBQUMsRUFBTixDQUFTLG9CQUFULEVBQStCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxRQUFELEVBQVcsS0FBWDtlQUM5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O01BQ0MsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsZUFEaEM7O0lBR0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBO0lBRW5DLE9BQUEsR0FBVSxJQUFDLENBQUE7SUFDWCxJQUFHLE9BQUEsR0FBVSxDQUFiO01BQ0MsT0FBQSxJQUFXLElBRFo7S0FBQSxNQUVLLElBQUcsT0FBQSxHQUFVLEdBQWI7TUFDSixPQUFBLElBQVcsSUFEUDs7V0FHTCxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU0sQ0FBQyxvQkFBYixFQUFtQztNQUFDLE9BQUEsRUFBUyxPQUFWO01BQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsVUFBL0I7TUFBMkMsSUFBQSxFQUFNLElBQUMsQ0FBQSxLQUFsRDtLQUFuQztFQXJCTzs7d0JBdUJSLDhCQUFBLEdBQWdDLFNBQUE7V0FDL0IsSUFBQyxDQUFBLElBQUQsQ0FBTSxNQUFNLENBQUMsb0JBQWIsRUFBbUM7TUFBQyxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BQVg7TUFBb0IsU0FBQSxFQUFXLElBQUMsQ0FBQSxVQUFoQztNQUE0QyxJQUFBLEVBQU0sSUFBQyxDQUFBLEtBQW5EO0tBQW5DO0VBRCtCOzs7O0dBN2RDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwiXCJcIlxuXG5WUkNvbXBvbmVudCBjbGFzc1xuXG5wcm9wZXJ0aWVzXG4tIGZyb250IChzZXQ6IGltYWdlUGF0aCA8c3RyaW5nPiwgZ2V0OiBsYXllcilcbi0gcmlnaHRcbi0gYmFja1xuLSBsZWZ0XG4tIHRvcFxuLSBib3R0b21cbi0gaGVhZGluZyA8bnVtYmVyPlxuLSBlbGV2YXRpb24gPG51bWJlcj5cbi0gdGlsdCA8bnVtYmVyPiByZWFkb25seVxuXG4tIG9yaWVudGF0aW9uTGF5ZXIgPGJvb2w+XG4tIGFycm93S2V5cyA8Ym9vbD5cbi0gbG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXIgPGJvb2w+XG5cbm1ldGhvZHNcbi0gcHJvamVjdExheWVyKGxheWVyKSAjIGhlYWRpbmcgYW5kIGVsZXZhdGlvbiBhcmUgc2V0IGFzIHByb3BlcnRpZXMgb24gdGhlIGxheWVyXG4tIGhpZGVFbnZpcm9tZW50KClcblxuZXZlbnRzXG4tIEV2ZW50cy5PcmllbnRhdGlvbkRpZENoYW5nZSwgKGRhdGEge2hlYWRpbmcsIGVsZXZhdGlvbiwgdGlsdH0pXG5cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblZSTGF5ZXIgY2xhc3NcblxucHJvcGVydGllc1xuLSBoZWFkaW5nIDxudW1iZXI+IChmcm9tIDAgdXAgdG8gMzYwKVxuLSBlbGV2YXRpb24gPG51bWJlcj4gKGZyb20gLTkwIGRvd24gdG8gOTAgdXApXG5cblwiXCJcIlxuXG5TSURFUyA9IFtcblx0XCJub3J0aFwiLCBcblx0XCJmcm9udFwiLCBcblx0XCJlYXN0XCIsXG5cdFwicmlnaHRcIiwgXG5cdFwic291dGhcIiwgXG5cdFwiYmFja1wiLCBcblx0XCJ3ZXN0XCIsIFxuXHRcImxlZnRcIiwgXG5cdFwidG9wXCIsIFxuXHRcImJvdHRvbVwiLCBcbl1cblxuS0VZUyA9IHtcblx0TGVmdEFycm93OiAzN1xuXHRVcEFycm93OiAzOFxuXHRSaWdodEFycm93OiAzOVxuXHREb3duQXJyb3c6IDQwXG59XG5cbktFWVNET1dOID0ge1xuXHRsZWZ0OiBmYWxzZVxuXHR1cDogZmFsc2Vcblx0cmlnaHQ6IGZhbHNlXG5cdGRvd246IGZhbHNlXG59XG5cbkV2ZW50cy5PcmllbnRhdGlvbkRpZENoYW5nZSA9IFwib3JpZW50YXRpb25kaWRjaGFuZ2VcIlxuXG5jbGFzcyBWUkFuY2hvckxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKGxheWVyLCBjdWJlU2lkZSkgLT5cblx0XHRzdXBlciB1bmRlZmluZWRcblx0XHRAd2lkdGggPSAwXG5cdFx0QGhlaWdodCA9IDBcblx0XHRAY2xpcCA9IGZhbHNlXG5cdFx0QG5hbWUgPSBcImFuY2hvclwiXG5cdFx0QGN1YmVTaWRlID0gY3ViZVNpZGVcblxuXHRcdEBsYXllciA9IGxheWVyXG5cdFx0bGF5ZXIuc3VwZXJMYXllciA9IEBcblx0XHRsYXllci5jZW50ZXIoKVxuXG5cdFx0bGF5ZXIub24gXCJjaGFuZ2U6b3JpZW50YXRpb25cIiwgKG5ld1ZhbHVlLCBsYXllcikgPT5cblx0XHRcdEB1cGRhdGVQb3NpdGlvbihsYXllcilcblx0XHRAdXBkYXRlUG9zaXRpb24obGF5ZXIpXG5cblx0XHRsYXllci5fY29udGV4dC5vbiBcImxheWVyOmRlc3Ryb3lcIiwgKGxheWVyKSA9PlxuXHRcdFx0aWYgbGF5ZXIgPT0gQGxheWVyXG5cdFx0XHRcdEBkZXN0cm95KClcblxuXHR1cGRhdGVQb3NpdGlvbjogKGxheWVyKSAtPlxuXHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblx0XHRAc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInRyYW5zbGF0ZVgoI3soQGN1YmVTaWRlIC0gQHdpZHRoKS8yfXB4KSB0cmFuc2xhdGVZKCN7KEBjdWJlU2lkZSAtIEBoZWlnaHQpLzJ9cHgpIHJvdGF0ZVooI3tsYXllci5oZWFkaW5nfWRlZykgcm90YXRlWCgjezkwLWxheWVyLmVsZXZhdGlvbn1kZWcpIHRyYW5zbGF0ZVooI3tsYXllci5kaXN0YW5jZX1weCkgcm90YXRlWCgxODBkZWcpXCJcblxuY2xhc3MgZXhwb3J0cy5WUkxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuXHRcdFx0aGVhZGluZzogMFxuXHRcdFx0ZWxldmF0aW9uOiAwXG5cdFx0c3VwZXIgb3B0aW9uc1xuXG5cdEBkZWZpbmUgXCJoZWFkaW5nXCIsXG5cdFx0Z2V0OiAtPiBAX2hlYWRpbmdcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdGlmIHZhbHVlID49IDM2MFxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlICUgMzYwXG5cdFx0XHRlbHNlIGlmIHZhbHVlIDwgMFxuXHRcdFx0XHRyZXN0ID0gTWF0aC5hYnModmFsdWUpICUgMzYwXG5cdFx0XHRcdHZhbHVlID0gMzYwIC0gcmVzdFxuXHRcdFx0aWYgQF9oZWFkaW5nICE9IHZhbHVlXG5cdFx0XHRcdEBfaGVhZGluZyA9IHZhbHVlXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOmhlYWRpbmdcIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5cdEBkZWZpbmUgXCJlbGV2YXRpb25cIixcblx0XHRnZXQ6IC0+IEBfZWxldmF0aW9uXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHR2YWx1ZSA9IFV0aWxzLmNsYW1wKHZhbHVlLCAtOTAsIDkwKVxuXHRcdFx0aWYgdmFsdWUgIT0gQF9lbGV2YXRpb25cblx0XHRcdFx0QF9lbGV2YXRpb24gPSB2YWx1ZVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTplbGV2YXRpb25cIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5cdEBkZWZpbmUgXCJkaXN0YW5jZVwiLFxuXHRcdGdldDogLT4gQF9kaXN0YW5jZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0aWYgdmFsdWUgIT0gQF9kaXN0YW5jZVxuXHRcdFx0XHRAX2Rpc3RhbmNlID0gdmFsdWVcblx0XHRcdFx0QGVtaXQoXCJjaGFuZ2U6ZGlzdGFuY2VcIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5jbGFzcyBleHBvcnRzLlZSQ29tcG9uZW50IGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuXHRcdFx0Y3ViZVNpZGU6IDMwMDBcblx0XHRcdHBlcnNwZWN0aXZlOiAxMjAwXG5cdFx0XHRsb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllcjogZmFsc2Vcblx0XHRcdHdpZHRoOiBTY3JlZW4ud2lkdGhcblx0XHRcdGhlaWdodDogU2NyZWVuLmhlaWdodFxuXHRcdFx0b3JpZW50YXRpb25MYXllcjogdHJ1ZVxuXHRcdFx0YXJyb3dLZXlzOiB0cnVlXG5cdFx0c3VwZXIgb3B0aW9uc1xuXHRcdEBwZXJzcGVjdGl2ZSA9IG9wdGlvbnMucGVyc3BlY3RpdmVcblx0XHRAYmFja2dyb3VuZENvbG9yID0gbnVsbFxuXHRcdEBjcmVhdGVDdWJlKG9wdGlvbnMuY3ViZVNpZGUpXG5cdFx0QGRlZ1RvUmFkID0gTWF0aC5QSSAvIDE4MFxuXHRcdEBsYXllcnNUb0tlZXBMZXZlbCA9IFtdXG5cdFx0QGxvb2tBdExhdGVzdFByb2plY3RlZExheWVyID0gb3B0aW9ucy5sb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllclxuXHRcdEBhcnJvd0tleXMgPSBvcHRpb25zLmFycm93S2V5c1xuXHRcdEBfa2V5cygpXG5cblx0XHRAX2hlYWRpbmcgPSAwXG5cdFx0QF9lbGV2YXRpb24gPSAwXG5cdFx0QF90aWx0ID0gMFxuXG5cdFx0QF9oZWFkaW5nT2Zmc2V0ID0gMFxuXHRcdEBfZWxldmF0aW9uT2Zmc2V0ID0gMFxuXHRcdEBfZGV2aWNlSGVhZGluZyA9IDBcblx0XHRAX2RldmljZUVsZXZhdGlvbiA9IDBcblxuXHRcdGlmIG9wdGlvbnMuaGVhZGluZ1xuXHRcdFx0QGhlYWRpbmcgPSBvcHRpb25zLmhlYWRpbmdcblx0XHRpZiBvcHRpb25zLmVsZXZhdGlvblxuXHRcdFx0QGVsZXZhdGlvbiA9IG9wdGlvbnMuZWxldmF0aW9uXG5cblx0XHRAb3JpZW50YXRpb25MYXllciA9IG9wdGlvbnMub3JpZW50YXRpb25MYXllclxuXG5cdFx0QGRlc2t0b3BQYW4oMCwgMClcblxuXHRcdCMgdGlsdGluZyBhbmQgcGFubmluZ1xuXHRcdGlmIFV0aWxzLmlzTW9iaWxlKClcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIFwiZGV2aWNlb3JpZW50YXRpb25cIiwgKGV2ZW50KSA9PlxuXHRcdFx0XHRAb3JpZW50YXRpb25EYXRhID0gZXZlbnRcblxuXHRcdEZyYW1lci5Mb29wLm9uKFwidXBkYXRlXCIsIEBkZXZpY2VPcmllbnRhdGlvblVwZGF0ZSlcblxuXHRcdCMgTWFrZSBzdXJlIHdlIHJlbW92ZSB0aGUgdXBkYXRlIGZyb20gdGhlIGxvb3Agd2hlbiB3ZSBkZXN0cm95IHRoZSBjb250ZXh0XG5cdFx0RnJhbWVyLkN1cnJlbnRDb250ZXh0Lm9uIFwicmVzZXRcIiwgLT5cblx0XHRcdEZyYW1lci5Mb29wLm9mZihcInVwZGF0ZVwiLCBAZGV2aWNlT3JpZW50YXRpb25VcGRhdGUpXG5cblx0XHRAb24gXCJjaGFuZ2U6ZnJhbWVcIiwgLT5cblx0XHRcdEBkZXNrdG9wUGFuKDAsMClcblxuXG5cdF9rZXlzOiAtPlxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJrZXlkb3duXCIsIChldmVudCkgPT5cblx0XHRcdGlmIEBhcnJvd0tleXNcblx0XHRcdFx0c3dpdGNoIGV2ZW50LndoaWNoXG5cdFx0XHRcdFx0d2hlbiBLRVlTLlVwQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLnVwID0gdHJ1ZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5Eb3duQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmRvd24gPSB0cnVlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0d2hlbiBLRVlTLkxlZnRBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04ubGVmdCA9IHRydWVcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuUmlnaHRBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04ucmlnaHQgPSB0cnVlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwia2V5dXBcIiwgKGV2ZW50KSA9PlxuXHRcdFx0aWYgQGFycm93S2V5c1xuXHRcdFx0XHRzd2l0Y2ggZXZlbnQud2hpY2hcblx0XHRcdFx0XHR3aGVuIEtFWVMuVXBBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04udXAgPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5Eb3duQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmRvd24gPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5MZWZ0QXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmxlZnQgPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5SaWdodEFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi5yaWdodCA9IGZhbHNlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHR3aW5kb3cub25ibHVyID0gLT5cblx0XHRcdEtFWVNET1dOLnVwID0gZmFsc2Vcblx0XHRcdEtFWVNET1dOLmRvd24gPSBmYWxzZVxuXHRcdFx0S0VZU0RPV04ubGVmdCA9IGZhbHNlXG5cdFx0XHRLRVlTRE9XTi5yaWdodCA9IGZhbHNlXG5cblx0QGRlZmluZSBcIm9yaWVudGF0aW9uTGF5ZXJcIixcblx0XHRnZXQ6IC0+IHJldHVybiBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgIT0gbnVsbCAmJiBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgIT0gdW5kZWZpbmVkXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRpZiBAd29ybGQgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdGlmIFV0aWxzLmlzRGVza3RvcCgpXG5cdFx0XHRcdFx0aWYgdmFsdWUgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0QGFkZERlc2t0b3BQYW5MYXllcigpXG5cdFx0XHRcdFx0ZWxzZSBpZiB2YWx1ZSA9PSBmYWxzZVxuXHRcdFx0XHRcdFx0QHJlbW92ZURlc2t0b3BQYW5MYXllcigpXG5cblx0QGRlZmluZSBcImhlYWRpbmdcIixcblx0XHRnZXQ6IC0+XG5cdFx0XHRoZWFkaW5nID0gQF9oZWFkaW5nICsgQF9oZWFkaW5nT2Zmc2V0XG5cdFx0XHRpZiBoZWFkaW5nID4gMzYwXG5cdFx0XHRcdGhlYWRpbmcgPSBoZWFkaW5nICUgMzYwXG5cdFx0XHRlbHNlIGlmIGhlYWRpbmcgPCAwXG5cdFx0XHRcdHJlc3QgPSBNYXRoLmFicyhoZWFkaW5nKSAlIDM2MFxuXHRcdFx0XHRoZWFkaW5nID0gMzYwIC0gcmVzdFxuXHRcdFx0cmV0dXJuIGhlYWRpbmdcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBsb29rQXQodmFsdWUsIEBfZWxldmF0aW9uKVxuXG5cdEBkZWZpbmUgXCJlbGV2YXRpb25cIixcblx0XHRnZXQ6IC0+IEBfZWxldmF0aW9uXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBsb29rQXQoQF9oZWFkaW5nLCB2YWx1ZSlcblxuXHRAZGVmaW5lIFwidGlsdFwiLFxuXHRcdGdldDogLT4gQF90aWx0XG5cdFx0c2V0OiAodmFsdWUpIC0+IHRocm93IFwiVGlsdCBpcyByZWFkb25seVwiXG5cblx0U0lERVMubWFwIChmYWNlKSA9PlxuXHRcdEBkZWZpbmUgZmFjZSxcblx0XHRcdGdldDogLT4gQGxheWVyRnJvbUZhY2UoZmFjZSkgIyBAZ2V0SW1hZ2UoZmFjZSlcblx0XHRcdHNldDogKHZhbHVlKSAtPiBAc2V0SW1hZ2UoZmFjZSwgdmFsdWUpXG5cblx0Y3JlYXRlQ3ViZTogKGN1YmVTaWRlID0gQGN1YmVTaWRlKSA9PlxuXHRcdEBjdWJlU2lkZSA9IGN1YmVTaWRlXG5cblx0XHRAd29ybGQ/LmRlc3Ryb3koKVxuXHRcdEB3b3JsZCA9IG5ldyBMYXllclxuXHRcdFx0bmFtZTogXCJ3b3JsZFwiXG5cdFx0XHRzdXBlckxheWVyOiBAXG5cdFx0XHR3aWR0aDogY3ViZVNpZGUsIGhlaWdodDogY3ViZVNpZGVcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXHRcdFx0Y2xpcDogZmFsc2Vcblx0XHRAd29ybGQuc3R5bGUud2Via2l0VHJhbnNmb3JtU3R5bGUgPSBcInByZXNlcnZlLTNkXCJcblx0XHRAd29ybGQuY2VudGVyKClcblxuXHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblxuXHRcdEBzaWRlMCA9IG5ldyBMYXllclxuXHRcdEBzaWRlMC5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IFwicm90YXRlWCgtOTBkZWcpIHRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpXCJcblx0XHRAc2lkZTEgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTEuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVkoLTkwZGVnKSB0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KSByb3RhdGVaKDkwZGVnKVwiXG5cdFx0QHNpZGUyID0gbmV3IExheWVyXG5cdFx0QHNpZGUyLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJyb3RhdGVYKDkwZGVnKSB0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KSByb3RhdGVaKDE4MGRlZylcIlxuXHRcdEBzaWRlMyA9IG5ldyBMYXllclxuXHRcdEBzaWRlMy5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IFwicm90YXRlWSg5MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWigtOTBkZWcpXCJcblx0XHRAc2lkZTQgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTQuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVkoLTE4MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWigxODBkZWcpXCJcblx0XHRAc2lkZTUgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTUuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpXCJcblxuXHRcdEBzaWRlcyA9IFtAc2lkZTAsIEBzaWRlMSwgQHNpZGUyLCBAc2lkZTMsIEBzaWRlNCwgQHNpZGU1XVxuXHRcdGNvbG9ycyA9IFtcIiM4NjZjY2NcIiwgXCIjMjhhZmZhXCIsIFwiIzJkZDdhYVwiLCBcIiNmZmMyMmNcIiwgXCIjN2RkZDExXCIsIFwiI2Y5NWZhYVwiXVxuXHRcdHNpZGVOYW1lcyA9IFtcImZyb250XCIsIFwicmlnaHRcIiwgXCJiYWNrXCIsIFwibGVmdFwiLCBcInRvcFwiLCBcImJvdHRvbVwiXVxuXG5cdFx0aW5kZXggPSAwXG5cdFx0Zm9yIHNpZGUgaW4gQHNpZGVzXG5cdFx0XHRzaWRlLm5hbWUgPSBzaWRlTmFtZXNbaW5kZXhdXG5cdFx0XHRzaWRlLndpZHRoID0gc2lkZS5oZWlnaHQgPSBjdWJlU2lkZVxuXHRcdFx0c2lkZS5zdXBlckxheWVyID0gQHdvcmxkXG5cdFx0XHRzaWRlLmJhY2tncm91bmRDb2xvciA9ICcnXG5cdFx0XHRzaWRlLnN0eWxlID1cblx0XHRcdFx0bGluZUhlaWdodDogXCIje2N1YmVTaWRlfXB4XCJcblx0XHRcdFx0dGV4dEFsaWduOiBcImNlbnRlclwiXG5cdFx0XHRcdGZvbnRTaXplOiBcIiN7Y3ViZVNpZGUgLyAxMH1weFwiXG5cdFx0XHRcdGZvbnRXZWlnaHQ6IFwiMTAwXCJcblx0XHRcdFx0Zm9udEZhbWlseTogXCJIZWx2ZXRpY2EgTmV1ZVwiXG5cdFx0XHRpbmRleCsrXG5cblx0XHRpZiBAc2lkZUltYWdlc1xuXHRcdFx0Zm9yIGtleSBvZiBAc2lkZUltYWdlc1xuXHRcdFx0XHRAc2V0SW1hZ2Uga2V5LCBAc2lkZUltYWdlc1trZXldXG5cblx0aGlkZUVudmlyb21lbnQ6IC0+XG5cdFx0Zm9yIHNpZGUgaW4gQHNpZGVzXG5cdFx0XHRzaWRlLmRlc3Ryb3koKVxuXG5cdGxheWVyRnJvbUZhY2U6IChmYWNlKSAtPlxuXHRcdG1hcCA9XG5cdFx0XHRub3J0aDogQHNpZGUwXG5cdFx0XHRmcm9udDogQHNpZGUwXG5cdFx0XHRlYXN0OiAgQHNpZGUxXG5cdFx0XHRyaWdodDogQHNpZGUxXG5cdFx0XHRzb3V0aDogQHNpZGUyXG5cdFx0XHRiYWNrOiAgQHNpZGUyXG5cdFx0XHR3ZXN0OiAgQHNpZGUzXG5cdFx0XHRsZWZ0OiAgQHNpZGUzXG5cdFx0XHR0b3A6ICAgQHNpZGU0XG5cdFx0XHRib3R0b206QHNpZGU1XG5cdFx0cmV0dXJuIG1hcFtmYWNlXVxuXG5cdHNldEltYWdlOiAoZmFjZSwgaW1hZ2VQYXRoKSAtPlxuXHRcdFxuXHRcdGlmIG5vdCBmYWNlIGluIFNJREVTXG5cdFx0XHR0aHJvdyBFcnJvciBcIlZSQ29tcG9uZW50IHNldEltYWdlLCB3cm9uZyBuYW1lIGZvciBmYWNlOiBcIiArIGZhY2UgKyBcIiwgdmFsaWQgb3B0aW9uczogZnJvbnQsIHJpZ2h0LCBiYWNrLCBsZWZ0LCB0b3AsIGJvdHRvbSwgbm9ydGgsIGVhc3QsIHNvdXRoLCB3ZXN0XCJcblxuXHRcdGlmIG5vdCBAc2lkZUltYWdlc1xuXHRcdFx0QHNpZGVJbWFnZXMgPSB7fVxuXHRcdEBzaWRlSW1hZ2VzW2ZhY2VdID0gaW1hZ2VQYXRoXG5cblx0XHRsYXllciA9IEBsYXllckZyb21GYWNlKGZhY2UpXG5cdFx0XG5cdFx0aWYgaW1hZ2VQYXRoXG5cdFx0XHRsYXllcj8uaHRtbCA9IFwiXCJcblx0XHRcdGxheWVyPy5pbWFnZSA9IGltYWdlUGF0aFxuXHRcdGVsc2Vcblx0XHRcdGxheWVyPy5odG1sID0gbGF5ZXI/Lm5hbWVcblx0XHRcdGxheWVyPy5iYWNrZ3JvdW5kQ29sb3IgPSBsYXllcj8uX2JhY2tncm91bmRDb2xvclxuXG5cdGdldEltYWdlOiAoZmFjZSkgLT5cblxuXHRcdGlmIG5vdCBmYWNlIGluIFNJREVTXG5cdFx0XHR0aHJvdyBFcnJvciBcIlZSQ29tcG9uZW50IGdldEltYWdlLCB3cm9uZyBuYW1lIGZvciBmYWNlOiBcIiArIGZhY2UgKyBcIiwgdmFsaWQgb3B0aW9uczogZnJvbnQsIHJpZ2h0LCBiYWNrLCBsZWZ0LCB0b3AsIGJvdHRvbSwgbm9ydGgsIGVhc3QsIHNvdXRoLCB3ZXN0XCJcblxuXHRcdGxheWVyID0gQGxheWVyRnJvbUZhY2UoZmFjZSlcblx0XHRpZiBsYXllclxuXHRcdFx0bGF5ZXIuaW1hZ2VcblxuXHRwcm9qZWN0TGF5ZXI6IChpbnNlcnRMYXllcikgLT5cblxuXHRcdGhlYWRpbmcgPSBpbnNlcnRMYXllci5oZWFkaW5nXG5cdFx0aWYgaGVhZGluZyA9PSB1bmRlZmluZWRcblx0XHRcdGhlYWRpbmcgPSAwXG5cdFx0ZWxldmF0aW9uID0gaW5zZXJ0TGF5ZXIuZWxldmF0aW9uXG5cdFx0aWYgZWxldmF0aW9uID09IHVuZGVmaW5lZFxuXHRcdFx0ZWxldmF0aW9uID0gMFxuXG5cdFx0aWYgaGVhZGluZyA+PSAzNjBcblx0XHRcdGhlYWRpbmcgPSB2YWx1ZSAlIDM2MFxuXHRcdGVsc2UgaWYgaGVhZGluZyA8IDBcblx0XHRcdHJlc3QgPSBNYXRoLmFicyhoZWFkaW5nKSAlIDM2MFxuXHRcdFx0aGVhZGluZyA9IDM2MCAtIHJlc3RcblxuXHRcdGVsZXZhdGlvbiA9IFV0aWxzLmNsYW1wKGVsZXZhdGlvbiwgLTkwLCA5MClcblxuXHRcdGRpc3RhbmNlID0gaW5zZXJ0TGF5ZXIuZGlzdGFuY2Vcblx0XHRpZiBkaXN0YW5jZSA9PSB1bmRlZmluZWRcblx0XHRcdGRpc3RhbmNlID0gMTIwMFxuXG5cdFx0aW5zZXJ0TGF5ZXIuaGVhZGluZyA9IGhlYWRpbmdcblx0XHRpbnNlcnRMYXllci5lbGV2YXRpb24gPSBlbGV2YXRpb25cblx0XHRpbnNlcnRMYXllci5kaXN0YW5jZSA9IGRpc3RhbmNlXG5cblx0XHRhbmNob3IgPSBuZXcgVlJBbmNob3JMYXllcihpbnNlcnRMYXllciwgQGN1YmVTaWRlKVxuXHRcdGFuY2hvci5zdXBlckxheWVyID0gQHdvcmxkXG5cblx0XHRpZiBAbG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXJcblx0XHRcdEBsb29rQXQoaGVhZGluZywgZWxldmF0aW9uKVxuXG5cdCMgTW9iaWxlIGRldmljZSBvcmllbnRhdGlvblxuXG5cdGRldmljZU9yaWVudGF0aW9uVXBkYXRlOiA9PlxuXG5cdFx0aWYgVXRpbHMuaXNEZXNrdG9wKClcblx0XHRcdGlmIEBhcnJvd0tleXNcblx0XHRcdFx0aWYgQF9sYXN0Q2FsbEhvcml6b250YWwgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0QF9sYXN0Q2FsbEhvcml6b250YWwgPSAwXG5cdFx0XHRcdFx0QF9sYXN0Q2FsbFZlcnRpY2FsID0gMFxuXHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsID0gMVxuXHRcdFx0XHRcdEBfZ29pbmdVcCA9IGZhbHNlXG5cdFx0XHRcdFx0QF9nb2luZ0xlZnQgPSBmYWxzZVxuXG5cdFx0XHRcdGRhdGUgPSBuZXcgRGF0ZSgpXG5cdFx0XHRcdHggPSAuMVxuXHRcdFx0XHRpZiBLRVlTRE9XTi51cCB8fCBLRVlTRE9XTi5kb3duXG5cdFx0XHRcdFx0ZGlmZiA9IGRhdGUgLSBAX2xhc3RDYWxsVmVydGljYWxcblx0XHRcdFx0XHRpZiBkaWZmIDwgMzBcblx0XHRcdFx0XHRcdGlmIEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPCAzMFxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsICs9IDAuMThcblx0XHRcdFx0XHRpZiBLRVlTRE9XTi51cFxuXHRcdFx0XHRcdFx0aWYgQF9nb2luZ1VwID09IGZhbHNlXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdVcCA9IHRydWVcblx0XHRcdFx0XHRcdEBkZXNrdG9wUGFuKDAsIDEgKiBAX2FjY2VsZXJhdGlvblZlcnRpY2FsICogeClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nVXAgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsID0gMVxuXHRcdFx0XHRcdFx0XHRAX2dvaW5nVXAgPSBmYWxzZVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRAZGVza3RvcFBhbigwLCAtMSAqIEBfYWNjZWxlcmF0aW9uVmVydGljYWwgKiB4KVxuXHRcdFx0XHRcdEBfbGFzdENhbGxWZXJ0aWNhbCA9IGRhdGVcblxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25WZXJ0aWNhbCA9IDFcblxuXHRcdFx0XHRpZiBLRVlTRE9XTi5sZWZ0IHx8IEtFWVNET1dOLnJpZ2h0XG5cdFx0XHRcdFx0ZGlmZiA9IGRhdGUgLSBAX2xhc3RDYWxsSG9yaXpvbnRhbFxuXHRcdFx0XHRcdGlmIGRpZmYgPCAzMFxuXHRcdFx0XHRcdFx0aWYgQF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsIDwgMjVcblx0XHRcdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsICs9IDAuMThcblx0XHRcdFx0XHRpZiBLRVlTRE9XTi5sZWZ0XG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nTGVmdCA9PSBmYWxzZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdMZWZ0ID0gdHJ1ZVxuXHRcdFx0XHRcdFx0QGRlc2t0b3BQYW4oMSAqIEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCAqIHgsIDApXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aWYgQF9nb2luZ0xlZnQgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdMZWZ0ID0gZmFsc2Vcblx0XHRcdFx0XHRcdEBkZXNrdG9wUGFuKC0xICogQF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsICogeCwgMClcblx0XHRcdFx0XHRAX2xhc3RDYWxsSG9yaXpvbnRhbCA9IGRhdGVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblxuXHRcdGVsc2UgaWYgQG9yaWVudGF0aW9uRGF0YVxuXG5cdFx0XHRhbHBoYSA9IEBvcmllbnRhdGlvbkRhdGEuYWxwaGFcblx0XHRcdGJldGEgPSBAb3JpZW50YXRpb25EYXRhLmJldGFcblx0XHRcdGdhbW1hID0gQG9yaWVudGF0aW9uRGF0YS5nYW1tYVxuXG5cdFx0XHRpZiBhbHBoYSAhPSAwICYmIGJldGEgIT0gMCAmJiBnYW1tYSAhPSAwXG5cdFx0XHRcdEBkaXJlY3Rpb25QYXJhbXMoYWxwaGEsIGJldGEsIGdhbW1hKVxuXG5cdFx0XHR4QW5nbGUgPSBiZXRhXG5cdFx0XHR5QW5nbGUgPSAtZ2FtbWFcblx0XHRcdHpBbmdsZSA9IGFscGhhXG5cblx0XHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblx0XHRcdG9yaWVudGF0aW9uID0gXCJyb3RhdGUoI3t3aW5kb3cub3JpZW50YXRpb24gKiAtMX1kZWcpIFwiXG5cdFx0XHR0cmFuc2xhdGlvblggPSBcInRyYW5zbGF0ZVgoI3soQHdpZHRoIC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdFx0dHJhbnNsYXRpb25ZID0gXCIgdHJhbnNsYXRlWSgjeyhAaGVpZ2h0IC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdFx0dHJhbnNsYXRpb25aID0gXCIgdHJhbnNsYXRlWigje0BwZXJzcGVjdGl2ZX1weClcIlxuXHRcdFx0cm90YXRpb24gPSB0cmFuc2xhdGlvblogKyB0cmFuc2xhdGlvblggKyB0cmFuc2xhdGlvblkgKyBvcmllbnRhdGlvbiArIFwiIHJvdGF0ZVkoI3t5QW5nbGV9ZGVnKSByb3RhdGVYKCN7eEFuZ2xlfWRlZykgcm90YXRlWigje3pBbmdsZX1kZWcpXCIgKyBcIiByb3RhdGVaKCN7LUBfaGVhZGluZ09mZnNldH1kZWcpXCJcblx0XHRcdEB3b3JsZC5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IHJvdGF0aW9uXG5cblx0ZGlyZWN0aW9uUGFyYW1zOiAoYWxwaGEsIGJldGEsIGdhbW1hKSAtPlxuXG5cdFx0YWxwaGFSYWQgPSBhbHBoYSAqIEBkZWdUb1JhZFxuXHRcdGJldGFSYWQgPSBiZXRhICogQGRlZ1RvUmFkXG5cdFx0Z2FtbWFSYWQgPSBnYW1tYSAqIEBkZWdUb1JhZFxuXG5cdFx0IyBDYWxjdWxhdGUgZXF1YXRpb24gY29tcG9uZW50c1xuXHRcdGNBID0gTWF0aC5jb3MoYWxwaGFSYWQpXG5cdFx0c0EgPSBNYXRoLnNpbihhbHBoYVJhZClcblx0XHRjQiA9IE1hdGguY29zKGJldGFSYWQpXG5cdFx0c0IgPSBNYXRoLnNpbihiZXRhUmFkKVxuXHRcdGNHID0gTWF0aC5jb3MoZ2FtbWFSYWQpXG5cdFx0c0cgPSBNYXRoLnNpbihnYW1tYVJhZClcblxuXHRcdCMgeCB1bml0dmVjdG9yXG5cdFx0eHJBID0gLXNBICogc0IgKiBzRyArIGNBICogY0dcblx0XHR4ckIgPSBjQSAqIHNCICogc0cgKyBzQSAqIGNHXG5cdFx0eHJDID0gY0IgKiBzR1xuXG5cdFx0IyB5IHVuaXR2ZWN0b3Jcblx0XHR5ckEgPSAtc0EgKiBjQlxuXHRcdHlyQiA9IGNBICogY0Jcblx0XHR5ckMgPSAtc0JcblxuXHRcdCMgLXogdW5pdHZlY3RvclxuXHRcdHpyQSA9IC1zQSAqIHNCICogY0cgLSBjQSAqIHNHXG5cdFx0enJCID0gY0EgKiBzQiAqIGNHIC0gc0EgKiBzR1xuXHRcdHpyQyA9IGNCICogY0dcblxuXHRcdCMgQ2FsY3VsYXRlIGhlYWRpbmdcblx0XHRoZWFkaW5nID0gTWF0aC5hdGFuKHpyQSAvIHpyQilcblxuXHRcdCMgQ29udmVydCBmcm9tIGhhbGYgdW5pdCBjaXJjbGUgdG8gd2hvbGUgdW5pdCBjaXJjbGVcblx0XHRpZiB6ckIgPCAwXG5cdFx0XHRoZWFkaW5nICs9IE1hdGguUElcblx0XHRlbHNlIGlmIHpyQSA8IDBcblx0XHRcdGhlYWRpbmcgKz0gMiAqIE1hdGguUElcblxuXHRcdCMgIyBDYWxjdWxhdGUgQWx0aXR1ZGUgKGluIGRlZ3JlZXMpXG5cdFx0ZWxldmF0aW9uID0gTWF0aC5QSSAvIDIgLSBNYXRoLmFjb3MoLXpyQylcblxuXHRcdGNIID0gTWF0aC5zcXJ0KDEgLSAoenJDICogenJDKSlcblx0XHR0aWx0ID0gTWF0aC5hY29zKC14ckMgLyBjSCkgKiBNYXRoLnNpZ24oeXJDKVxuXG5cdFx0IyBDb252ZXJ0IHJhZGlhbnMgdG8gZGVncmVlc1xuXHRcdGhlYWRpbmcgKj0gMTgwIC8gTWF0aC5QSVxuXHRcdGVsZXZhdGlvbiAqPSAxODAgLyBNYXRoLlBJXG5cdFx0dGlsdCAqPSAxODAgLyBNYXRoLlBJXG5cblx0XHRAX2hlYWRpbmcgPSBNYXRoLnJvdW5kKGhlYWRpbmcgKiAxMDAwKSAvIDEwMDBcblx0XHRAX2VsZXZhdGlvbiA9IE1hdGgucm91bmQoZWxldmF0aW9uICogMTAwMCkgLyAxMDAwXG5cblx0XHR0aWx0ID0gTWF0aC5yb3VuZCh0aWx0ICogMTAwMCkgLyAxMDAwXG5cdFx0b3JpZW50YXRpb25UaWx0T2Zmc2V0ID0gKHdpbmRvdy5vcmllbnRhdGlvbiAqIC0xKSArIDkwXG5cdFx0dGlsdCArPSBvcmllbnRhdGlvblRpbHRPZmZzZXRcblx0XHRpZiB0aWx0ID4gMTgwXG5cdFx0XHRkaWZmID0gdGlsdCAtIDE4MFxuXHRcdFx0dGlsdCA9IC0xODAgKyBkaWZmXG5cdFx0QF90aWx0ID0gdGlsdFxuXG5cdFx0QF9kZXZpY2VIZWFkaW5nID0gQF9oZWFkaW5nXG5cdFx0QF9kZXZpY2VFbGV2YXRpb24gPSBAX2VsZXZhdGlvblxuXG5cdFx0QF9lbWl0T3JpZW50YXRpb25EaWRDaGFuZ2VFdmVudCgpXG5cblx0IyBEZXNrdG9wIHRpbHRcblxuXHRyZW1vdmVEZXNrdG9wUGFuTGF5ZXI6ID0+XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5kZXN0cm95KClcblxuXHRhZGREZXNrdG9wUGFuTGF5ZXI6ID0+XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5kZXN0cm95KClcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgPSBuZXcgTGF5ZXJcblx0XHRcdHdpZHRoOiAxMDAwMDAsIGhlaWdodDogMTAwMDBcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXHRcdFx0c3VwZXJMYXllcjpAXG5cdFx0XHRuYW1lOiBcImRlc2t0b3BPcmllbnRhdGlvbkxheWVyXCJcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIuY2VudGVyKClcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIuZHJhZ2dhYmxlLmVuYWJsZWQgPSB0cnVlXG5cdFx0XG5cdFx0QHByZXZEZXNrdG9wRGlyID0gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnhcblx0XHRAcHJldkRlc2t0b3BIZWlnaHQgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueVxuXHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuRHJhZ1N0YXJ0LCA9PlxuXHRcdFx0QHByZXZEZXNrdG9wRGlyID0gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnhcblx0XHRcdEBwcmV2RGVza3RvcEhlaWdodCA9IEBkZXNrdG9wT3JpZW50YXRpb25MYXllci55XG5cdFx0XHRAZGVza3RvcERyYWdnYWJsZUFjdGl2ZSA9IHRydWVcblx0XHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuTW92ZSwgPT5cblx0XHRcdGlmIEBkZXNrdG9wRHJhZ2dhYmxlQWN0aXZlXG5cdFx0XHRcdHN0cmVuZ3RoID0gVXRpbHMubW9kdWxhdGUoQHBlcnNwZWN0aXZlLCBbMTIwMCwgOTAwXSwgWzIyLCAxNy41XSlcblx0XHRcdFx0ZGVsdGFEaXIgPSAoQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnggLSBAcHJldkRlc2t0b3BEaXIpIC8gc3RyZW5ndGhcblx0XHRcdFx0ZGVsdGFIZWlnaHQgPSAoQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnkgLSBAcHJldkRlc2t0b3BIZWlnaHQpIC8gc3RyZW5ndGhcblx0XHRcdFx0QGRlc2t0b3BQYW4oZGVsdGFEaXIsIGRlbHRhSGVpZ2h0KVxuXHRcdFx0XHRAcHJldkRlc2t0b3BEaXIgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueFxuXHRcdFx0XHRAcHJldkRlc2t0b3BIZWlnaHQgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueVxuXHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuQW5pbWF0aW9uRW5kLCA9PlxuXHRcdFx0QGRlc2t0b3BEcmFnZ2FibGVBY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5jZW50ZXIoKVxuXG5cdGRlc2t0b3BQYW46IChkZWx0YURpciwgZGVsdGFIZWlnaHQpIC0+XG5cdFx0aGFsZkN1YlNpZGUgPSBAY3ViZVNpZGUvMlxuXHRcdHRyYW5zbGF0aW9uWCA9IFwidHJhbnNsYXRlWCgjeyhAd2lkdGggLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0dHJhbnNsYXRpb25ZID0gXCIgdHJhbnNsYXRlWSgjeyhAaGVpZ2h0IC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdHRyYW5zbGF0aW9uWiA9IFwiIHRyYW5zbGF0ZVooI3tAcGVyc3BlY3RpdmV9cHgpXCJcblx0XHRAX2hlYWRpbmcgLT0gZGVsdGFEaXJcblxuXHRcdGlmIEBfaGVhZGluZyA+IDM2MFxuXHRcdFx0QF9oZWFkaW5nIC09IDM2MFxuXHRcdGVsc2UgaWYgQF9oZWFkaW5nIDwgMFxuXHRcdFx0QF9oZWFkaW5nICs9IDM2MFxuXG5cdFx0QF9lbGV2YXRpb24gKz0gZGVsdGFIZWlnaHRcblx0XHRAX2VsZXZhdGlvbiA9IFV0aWxzLmNsYW1wKEBfZWxldmF0aW9uLCAtOTAsIDkwKVxuXG5cdFx0cm90YXRpb24gPSB0cmFuc2xhdGlvblogKyB0cmFuc2xhdGlvblggKyB0cmFuc2xhdGlvblkgKyBcIiByb3RhdGVYKCN7QF9lbGV2YXRpb24gKyA5MH1kZWcpIHJvdGF0ZVooI3szNjAgLSBAX2hlYWRpbmd9ZGVnKVwiICsgXCIgcm90YXRlWigjey1AX2hlYWRpbmdPZmZzZXR9ZGVnKVwiXG5cdFx0QHdvcmxkLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gcm90YXRpb25cblxuXHRcdEBfaGVhZGluZyA9IE1hdGgucm91bmQoQF9oZWFkaW5nICogMTAwMCkgLyAxMDAwXG5cdFx0QF90aWx0ID0gMFxuXHRcdEBfZW1pdE9yaWVudGF0aW9uRGlkQ2hhbmdlRXZlbnQoKVxuXG5cdGxvb2tBdDogKGhlYWRpbmcsIGVsZXZhdGlvbikgLT5cblx0XHRoYWxmQ3ViU2lkZSA9IEBjdWJlU2lkZS8yXG5cdFx0dHJhbnNsYXRpb25YID0gXCJ0cmFuc2xhdGVYKCN7KEB3aWR0aCAvIDIpIC0gaGFsZkN1YlNpZGV9cHgpXCJcblx0XHR0cmFuc2xhdGlvblkgPSBcIiB0cmFuc2xhdGVZKCN7KEBoZWlnaHQgLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0dHJhbnNsYXRpb25aID0gXCIgdHJhbnNsYXRlWigje0BwZXJzcGVjdGl2ZX1weClcIlxuXHRcdHJvdGF0aW9uID0gdHJhbnNsYXRpb25aICsgdHJhbnNsYXRpb25YICsgdHJhbnNsYXRpb25ZICsgXCIgcm90YXRlWigje0BfdGlsdH1kZWcpIHJvdGF0ZVgoI3tlbGV2YXRpb24gKyA5MH1kZWcpIHJvdGF0ZVooI3staGVhZGluZ31kZWcpXCJcblxuXHRcdEB3b3JsZD8uc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSByb3RhdGlvblxuXHRcdEBfaGVhZGluZyA9IGhlYWRpbmdcblx0XHRAX2VsZXZhdGlvbiA9IGVsZXZhdGlvblxuXHRcdGlmIFV0aWxzLmlzTW9iaWxlKClcblx0XHRcdEBfaGVhZGluZ09mZnNldCA9IEBfaGVhZGluZyAtIEBfZGV2aWNlSGVhZGluZ1xuXG5cdFx0QF9lbGV2YXRpb25PZmZzZXQgPSBAX2VsZXZhdGlvbiAtIEBfZGV2aWNlRWxldmF0aW9uXG5cblx0XHRoZWFkaW5nID0gQF9oZWFkaW5nXG5cdFx0aWYgaGVhZGluZyA8IDBcblx0XHRcdGhlYWRpbmcgKz0gMzYwXG5cdFx0ZWxzZSBpZiBoZWFkaW5nID4gMzYwXG5cdFx0XHRoZWFkaW5nIC09IDM2MFxuXG5cdFx0QGVtaXQoRXZlbnRzLk9yaWVudGF0aW9uRGlkQ2hhbmdlLCB7aGVhZGluZzogaGVhZGluZywgZWxldmF0aW9uOiBAX2VsZXZhdGlvbiwgdGlsdDogQF90aWx0fSlcblxuXHRfZW1pdE9yaWVudGF0aW9uRGlkQ2hhbmdlRXZlbnQ6IC0+XG5cdFx0QGVtaXQoRXZlbnRzLk9yaWVudGF0aW9uRGlkQ2hhbmdlLCB7aGVhZGluZzogQGhlYWRpbmcsIGVsZXZhdGlvbjogQF9lbGV2YXRpb24sIHRpbHQ6IEBfdGlsdH0pXG4iXX0=
