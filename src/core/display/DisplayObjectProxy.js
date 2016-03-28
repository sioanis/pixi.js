var math = require('../math'),
    utils = require('../utils'),
    DisplayObject = require('./DisplayObject'),
    GeometrySetProxy = require('./DisplayObject');

/**
 * The base class for projections - they can be used with multiple cameras
 *
 * @class
 * @extends
 * @memberof PIXI
 */
function DisplayObjectProxy(original)
{
    this.original = original;

    this.uid = utils.uid();

    /**
     * Projected transform, need for canvas mode
     * @type {PIXI.Transform2d}
     */
    this.projectedTransform = null;

    /**
     * World projection, for camera
     * @type {PIXI.Transform2d}
     */
    this.worldProjection = null;

    /**
     * Proxy object for _localBounds
     * @type {PIXI.GeometrySetProxy}
     * @private
     */
    this._localBoundsProxy = null;

    /**
     * The original, cached bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._bounds = new math.Rectangle(0, 0, 1, 1);

    /**
     * The most up-to-date bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._currentBounds = null;

    /**
     * The display object container that contains this display object.
     *
     * @member {PIXI.Container}
     * @readOnly
     */
    this.parent = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readOnly
     */
    this.worldAlpha = 1;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = true;

    /**
     * At rendering stage, if some proxy swapped its context to ours, then we can read the original context here
     * For DisplayObjectProxy its A PERVERSION IF YOU PROXY ALREADY PROXIED OBJECT
     * @type {PIXI.DisplayObjectProxy}
     */
    this.proxyContext = this;
}

// constructor
DisplayObjectProxy.prototype = Object.create(DisplayObject.prototype);
DisplayObjectProxy.prototype.constructor = DisplayObjectProxy;
module.exports = DisplayObjectProxy;

Object.defineProperties(DisplayObjectProxy.prototype, {
    transform: {
        get: function() {
            return this.original.transform;
        },
        set: function(value) {
            this.original.transform = value;
        }
    },
    computedTransform: {
        get: function() {
            return this.original.computedTransform;
        },
        set: function(value) {
            this.original.computedTransform = value;
        }
    },
    geometry: {
        get: function() {
            return this.original.geometry;
        },
        set: function(value) {
            this.original.geometry = value;
        }
    },
    computedGeometry: {
        get: function() {
            return this.original.computedGeometry;
        },
        set: function(value) {
            this.original.computedGeometry = value;
        }
    },
    _localBounds: {
        get: function() {
            if (!this.original._localBounds) {
                this._localBoundsProxy.wrap(null);
                return null;
            }
            if (!this._localBoundsProxy) {
                this._localBoundsProxy = new GeometrySetProxy();
            }
            this._localBoundsProxy.wrap(this.original._localBounds);
            return this._localBoundsProxy;
        }
    },
    alpha: {
        get: function() {
            return this.original.alpha;
        }
    },
    isRaycastCheckingBoundsFirst: {
        get: function() {
            return this.original.isRaycastCheckingBoundsFirst;
        }
    },
    isRaycastPossible: {
        get: function() {
            return this.original.isRaycastPossible;
        }
    },
    filterArea: {
        get: function() {
            return this.original.filterArea;
        }
    },
    hitArea: {
        get: function() {
            return this.original.hitArea;
        }
    },
    _mask: {
        get: function() {
            return this.original._mask;
        }
    },
    _events: {
        get: function() {
            return this.original._events;
        }
    },
    visible: {
        get: function() {
            return this.original.visible;
        }
    }
});

DisplayObjectProxy.prototype.swapContext = function() {
    var orig = this.original;

    var pt = orig.projectedTransform;
    var wp = orig.worldProjection;
    var _cb = orig._currentBounds;
    var wa = orig.worldAlpha;
    var rr = orig.renderable;
    var pc = orig.proxyContext;

    orig.projectedTransform = this.projectedTransform;
    orig.worldProjection = this.worldProjection;
    orig._currentBounds = this._currentBounds;
    orig.worldAlpha = this.worldAlpha;
    orig.renderable = this.renderable;
    orig.proxyContext = this.proxyContext;

    this.projectedTransform = pt;
    this.worldProjection = wp;
    this._currentBounds = _cb;
    this.worldAlpha = wa;
    this.renderable = rr;
    this.proxyContext = pc;
};

DisplayObjectProxy.prototype.renderWebGL = function(renderer) {
    this.original.renderWebGL(renderer);
};

DisplayObjectProxy.prototype.renderCanvas = function(renderer) {
    this.original.renderCanvas(renderer);
};

DisplayObjectProxy.prototype.updateTransform = function ()
{
    // multiply the alphas..
    this._currentBounds = null;
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
    this.worldProjection = this.parent.worldProjection;
};

DisplayObjectProxy.prototype.displayObjectUpdateTransform = DisplayObjectProxy.prototype.updateTransform;

DisplayObjectProxy.prototype.destroy = function() {
    //do nothing.
};

/**
 * Make a proxy object, for extra camera projections. Original createProxy() will be called
 * @return {PIXI.DisplayObjectProxy}
 */
DisplayObjectProxy.prototype.createProxy = function() {
    return new DisplayObjectProxy(this);
};

/**
 * Make a proxy object, for extra camera projections
 * @return {PIXI.DisplayObjectProxy}
 */
DisplayObject.prototype.createProxy = function() {
    return new DisplayObjectProxy(this);
};
