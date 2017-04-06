var parameters = require('./parameters')

function hescape(source) {
	return ('' + source)
		.replace(/&/g, '&amp;')
		.replace(/\{/g, '&lbrace;')
		.replace(/\}/g, '&rbrace;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

var LINE_HEIGHT = parameters.LINE_HEIGHT
var CHAR_ASC = parameters.CHAR_ASC
var CHAR_DESC = parameters.CHAR_DESC
var STACK_MIDDLE = parameters.STACK_MIDDLE
var FRAC_MIDDLE = parameters.FRAC_MIDDLE
var OPERATOR_ASC = parameters.OPERATOR_ASC
var OPERATOR_DESC = parameters.OPERATOR_DESC
var FRAC_PADDING_NUM = parameters.FRAC_PADDING_NUM
var FRAC_PADDING_DEN = parameters.FRAC_PADDING_DEN
var SS_SIZE = parameters.SS_SIZE
var SUP_BOTTOM = parameters.SUP_BOTTOM
var SUB_TOP = parameters.SUB_TOP
var SUP_TOP_TOLERENCE = parameters.SUP_TOP_TOLERENCE
var SUB_BOTTOM_TOLERENCE = parameters.SUB_BOTTOM_TOLERENCE
var POSITION_SHIFT = parameters.POSITION_SHIFT
var BIGOP_SHIFT = parameters.BIGOP_SHIFT
var SSSTACK_MARGIN_SUP = parameters.SSSTACK_MARGIN_SUP
var SSSTACK_MARGIN_SUB = parameters.SSSTACK_MARGIN_SUB
var BRACKET_SHIFT = parameters.BRACKET_SHIFT
var BRACKET_SHIFT_2 = parameters.BRACKET_SHIFT_2
var BRACKET_ASC = parameters.BRACKET_ASC
var BRACKET_DESC = parameters.BRACKET_DESC
var BRACKET_GEARS = parameters.BRACKET_GEARS

var MATH_SPACE = '<span class=sp>\u2005</span>'
var FORCE_SPACE = '<span class=sf>\u2005</span>'
var MATRIX_SPACE = '\u2000'
var TOPLEVEL_MATRIX_JOINER = '<!--%%%TOPLEVEL_MATRIX_JOINER%%%-->'

function em(x) { return (Math.round(x * 100) / 100).toFixed(3).replace(/\.?0+$/, '') + 'em' }
function arr1(box, rise, height, depth) {
	return arrx([box], [rise], height, depth)
}
function arrx(boxes, rises, height, depth, cl, scales) {
	var buf = '<span style="height:' + em(height + depth) + ';vertical-align:' + em(height - CHAR_ASC) + '"' + (cl ? ' class="r ' + cl + '"' : 'class=r') + '><span class=eb>{</span>';
	for (var j = 0; j < boxes.length; j++) if (boxes[j]) {
		if (scales) var scale = scales[j];
		else var scale = 1;
		buf += '<span class=ri style="top:' + em((height - rises[j]) / scale - boxes[j].height) + (scale && scale !== 1 ? ';font-size:' + em(scale) : '') + '">' + boxes[j].write() + '</span>'
	}
	buf += '<span class=eb>}</span></span>'
	return buf;
}
var EMDIST = em;


var Box = function () {
	this.height = 0;
	this.depth = 0;
};
Box.prototype.write = function () { return '' };
Box.prototype.spaceBefore = 0;
Box.prototype.spaceAfter = 0;

var CBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
CBox.prototype = new Box;
CBox.prototype.write = function () {
	return this.c
}

var VarBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
VarBox.prototype = new CBox;
VarBox.prototype.write = function () {
	return '<var>' + hescape(this.c) + '</var>'
}
var NumberBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
NumberBox.prototype = new CBox;
NumberBox.prototype.write = function () {
	return '<var class="nm">' + hescape(this.c) + '</var>'
}
var CodeBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
CodeBox.prototype = new CBox;
CodeBox.prototype.write = function () {
	return '<code>' + hescape(this.c) + '</code>'
}
var CSBox = function (c, tag, styl) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
	this.tag = tag
	this.styl = styl
}
CSBox.prototype = new CBox;
CSBox.prototype.write = function () {
	return '<' + this.tag + (this.styl ? ' ' + this.styl : '') + '>' + hescape(this.c) + '</' + this.tag + '>'
}
var BfBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
BfBox.prototype = new CBox;
BfBox.prototype.write = function () {
	return '<b>' + hescape(this.c) + '</b>'
}
var OpBox = function (c, tag, nobreak) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
	this.tag = tag
	if (nobreak) {
		this.breakBefore = this.breakAfter = false;
		this.spaceBefore = this.spaceAfter = 0;
	}
}
OpBox.prototype = new CBox;
OpBox.prototype.breakBefore = true;
OpBox.prototype.breakAfter = true;
OpBox.prototype.spaceBefore = 10;
OpBox.prototype.spaceAfter = 10;
OpBox.prototype.write = function (adjLeft, adjRight) {
	var tag = this.tag || 'op'
	return '<span class=' + tag + '>' + hescape(this.c) + '</span>'
}
var SpBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
SpBox.prototype = new CBox;
SpBox.prototype.breakBefore = true;
SpBox.prototype.breakAfter = true;
SpBox.prototype.spaceBefore = -9999;
SpBox.prototype.spaceAfter = -9999;
SpBox.prototype.write = function () {
	return '<span class=sp>' + hescape(this.c) + '</span>'
}
var LSpBox = function (c) {
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
LSpBox.prototype = new CBox;
LSpBox.prototype.spaceBefore = 9998;
LSpBox.prototype.spaceAfter = 9998;
LSpBox.prototype.write = function () { return '' }
var BCBox = function (c, tag, nobreak, raw) {
	this.height = CHAR_ASC;
	this.depth = CHAR_DESC;
	this.c = c;
	this.tag = tag;
	this.raw = raw;
	if (nobreak) {
		this.breakBefore = this.breakAfter = false;
		this.spaceBefore = this.spaceAfter = 0;
	}
}
BCBox.prototype = new CBox;
BCBox.prototype.breakAfter = true;
BCBox.prototype.spaceAfter = true;
BCBox.prototype.write = function (adjLeft, adjRight) {
	var tag = this.tag || 'op'
	return '<' + tag + '>' + (this.raw ? (x => x) : hescape)(this.c) + '</' + tag + '>'
}
var BracketBox = function (c) {
	this.height = BRACKET_ASC
	this.depth = BRACKET_DESC
	this.c = c
}
BracketBox.prototype = new CBox;
BracketBox.prototype.write = function (adjLeft, adjRight) {
	return this.c
}
var ScaleBox = function (scale, b) {
	this.content = b;
	this.scale = scale;
	this.height = b.height * scale;
	this.depth = b.depth * scale;
}
ScaleBox.prototype = new Box;
ScaleBox.prototype.write = function () {
	return '<span class=r style="height:' + EMDIST(this.height + this.depth) + '"><span class=ri style="font-size:' + em(this.scale) + '">' + this.content.write() + '</span></span>'
}
var RaiseBox = function (raise, b, recalculateMetrics) {
	this.content = b;
	this.raise = raise;
	this.height = recalculateMetrics ? Math.max(0, b.height + raise) : b.height;
	this.depth = recalculateMetrics ? Math.max(0, b.depth - raise) : b.depth;
}
RaiseBox.prototype = new Box;
RaiseBox.prototype.write = function () {
	return arrx([this.content], [this.raise], this.height, this.depth)
}
var KernBox = function (kern, b) {
	this.content = b;
	this.kern = kern;
	this.height = b.height;
	this.depth = b.depth;
	this.spaceBefore = b.spaceBefore;
	this.forceSpaceBefore = b.forceSpaceBefore;
}
KernBox.prototype = new Box;
KernBox.prototype.write = function (adjLeft, adjRight) {
	return '<span class=r style="margin-right:' + em(this.kern) + '">' + this.content.write(adjLeft, false) + '</span>'
}

function FracLineBox() {
	this.height = 0;
	this.depth = 0;
}
FracLineBox.prototype = new Box;
FracLineBox.prototype.write = function () {
	return '<span class=fl>/</span>'
}
function FracBox(num, den) {
	this.num = num;
	this.den = den;
	this.height = this.num.height + this.num.depth + FRAC_MIDDLE + FRAC_PADDING_NUM;
	this.depth = this.den.height + this.den.depth - FRAC_MIDDLE + FRAC_PADDING_DEN;
}
FracBox.prototype = new Box;
FracBox.prototype.write = function () {
	return arrx(
		[this.num, new FracLineBox(), this.den],
		[this.height - this.num.height,
		this.height - this.num.height - this.num.depth - FRAC_PADDING_NUM,
		this.height - this.num.height - this.num.depth - this.den.height - FRAC_PADDING_NUM - FRAC_PADDING_DEN],
		this.height, this.depth, 'frac')
}

function StackBox(boxes) {
	boxes = boxes.filter(function (x) { return !!x })
	var v = 0;
	this.parts = boxes;
	for (var j = 0; j < boxes.length; j++) {
		v += boxes[j].height + boxes[j].depth
	}
	this.height = v / 2 + STACK_MIDDLE
	this.depth = v / 2 - STACK_MIDDLE
}
StackBox.prototype = new Box;
StackBox.prototype.write = function () {
	var rises = [];
	var v = 0;
	for (var j = 0; j < this.parts.length; j++) {
		rises[j] = this.height - (v + this.parts[j].height);
		v += this.parts[j].height + this.parts[j].depth
	};
	return arrx(this.parts, rises, this.height, this.depth);
}

function MatrixBox(boxes, alignments) {
	this.boxes = boxes;
	this.rows = boxes.length;
	this.columns = 0;
	this.alignments = alignments || '';
	var rowHeights = [];
	var rowDepthes = [];
	var v = 0;
	for (var j = 0; j < boxes.length; j++) {
		var rh = 0;
		var rd = 0;
		for (var k = 0; k < boxes[j].length; k++) if (boxes[j][k]) {
			if (boxes[j][k].height > rh) rh = boxes[j][k].height;
			if (boxes[j][k].depth > rd) rd = boxes[j][k].depth;
		};
		rowHeights[j] = rh;
		rowDepthes[j] = rd;
		v += rh + rd;
		this.columns = Math.max(this.columns, boxes[j].length)
	};
	this.rowHeights = rowHeights;
	this.rowDepthes = rowDepthes;
	this.height = v / 2 + STACK_MIDDLE;
	this.depth = v / 2 - STACK_MIDDLE;
}
MatrixBox.prototype = new Box;
MatrixBox.prototype.write = function () {
	var rises = [];
	var v = 0;
	for (var j = 0; j < this.rows; j++) {
		rises[j] = this.height - (v + this.rowHeights[j]);
		v += this.rowHeights[j] + this.rowDepthes[j]
	}
	var buf = [];
	for (var k = 0; k < this.columns; k++) {
		var column = [];
		for (var j = 0; j < this.rows; j++) {
			column[j] = this.boxes[j][k];
		}
		buf[k] = arrx(column, rises, this.height, this.depth, 'mc' + (this.alignments[k] || '').trim())
	};
	return buf.join(this.joiner || MATRIX_SPACE);
}

function hJoin(parts, f) {
	var buf = [];
	for (var i = 0; i < parts.length; i++) {
		if(i > 0 && buf.length && buf[buf.length - 1].type !== 'space'){
			if((parts[i].spaceBefore - 0) + (parts[i - 1].spaceAfter - 0) > 0) {
				buf.push({type:'space', content: (parts[i].forceSpaceBefore || parts[i - 1].forceSpaceAfter ? FORCE_SPACE : MATH_SPACE)})
			}
		}
		var d = f(parts[i]);
		if(d){ buf.push({type:'content', content:d}) }
	}
	return buf.map(x=>x.content).join('');
}
function STD_WRITE(box) {
	return box.write();
}

var HBox = function (xs, spaceQ) {
	if (!xs.length) xs = Array.prototype.slice.call(arguments, 0);
	var h = 0
	var d = 0
	var bx = []
	for (var i = 0; i < xs.length; i++) {
		bx.push(xs[i])
		if (h < xs[i].height) h = xs[i].height
		if (d < xs[i].depth) d = xs[i].depth
	}

	this.height = h
	this.depth = d
	this.boxes = bx
	this.spaceQ = spaceQ
	this.spaceBefore = this.boxes[0].spaceBefore;
	this.forceSpaceBefore = this.boxes[0].forceSpaceBefore;
	this.spaceAfter = this.boxes[this.boxes.length - 1].spaceAfter;
	this.forceSpaceAfter = this.boxes[this.boxes.length - 1].forceSpaceAfter;
}
HBox.prototype = new Box
HBox.prototype.write = function (adjLeft, adjRight) {
	return hJoin(this.boxes, STD_WRITE)
}

var SegmentBox = function (xs) {
	HBox.call(this, xs);
}
SegmentBox.prototype = Object.create(HBox.prototype);
SegmentBox.prototype.write = function (adjLeft, adjRight) {
	var buf = hJoin(this.boxes, STD_WRITE);
	return buf;
}

var BBox = function (left, content, right) {
	this.height = content.height
	this.depth = content.depth
	this.left = left instanceof Box ? left : new CBox(left)
	this.right = right instanceof Box ? right : new CBox(right)
	this.content = content;
	this.spaceBefore = -1;
	this.spaceAfter = -1;
}

var scale_span = function (v, t, k, aux) {
	return '<span class="e ' + (k || 'bb') + '" style="transform:scaley(' + v + ');'
		+ '-webkit-transform:scaley(' + v + ');'
		+ '-moz-transform:scaley(' + v + ');'
		+ '-ms-transform:scaley(' + v + ');'
		+ '-o-transform:scaley(' + v + ');'
		+ (aux || '') + '">' + t + "</span>"
}
BBox.prototype = new Box;
BBox.prototype.write = function () {
	var halfwayHeight = (this.left.height - this.left.depth) / 2;
	var halfBracketHeight = halfwayHeight + this.left.depth;
	var contentUpperHeight = this.content.height - halfwayHeight;
	var contentLowerDepth = this.content.depth + halfwayHeight;

	var SCALE_V = 1 / BRACKET_GEARS * Math.ceil(BRACKET_GEARS * Math.max(1,
		contentUpperHeight / halfBracketHeight,
		contentLowerDepth / halfBracketHeight));
	var scaleClass = '';
	if (SCALE_V >= 1.5) scaleClass = ' big'
	if (SCALE_V >= 4) scaleClass = ' bigg'
	if (SCALE_V <= 1.1) {
		SCALE_V = 1;
		return '<span class="e bn l">' + this.left.write() + '</span>' + (this.content.write()).replace(/[\s\u2009\u205f]+((?:<\/i>)+)$/, '$1') + '<span class="e bn r">' + this.right.write() + '</span>';
	} else {
		var SCALE_H = 1 + Math.pow(SCALE_V - 1, 0.3) * 0.375;
		var baselineAdjustment = - (halfwayHeight * SCALE_H - halfwayHeight) / SCALE_H;
		var auxStyle = 'font-size:' + em(SCALE_H) + ';vertical-align:' + EMDIST(baselineAdjustment + BRACKET_SHIFT * SCALE_V + BRACKET_SHIFT_2);
		return (this.left.c ? scale_span(SCALE_V / SCALE_H, this.left.write(), 'bb l' + scaleClass, auxStyle) : '')
			+ (this.content.write()).replace(/[\s\u2005\u2009\u205f]+((?:<\/i>)+)$/, '$1')
			+ (this.right.c ? scale_span(SCALE_V / SCALE_H, this.right.write(), 'bb r' + scaleClass, auxStyle) : '')
	}
}

function SqrtInternalBox(content) {
	this.content = content
	this.height = content.height + FRAC_PADDING_DEN * 2
	this.depth = content.depth
}
SqrtInternalBox.prototype = new Box;
SqrtInternalBox.prototype.write = function () {
	return '<sqrt style="margin-top:' + em(FRAC_PADDING_DEN) + '"><span class=sk style="padding: ' + EMDIST(FRAC_PADDING_DEN) + ' 0 0">' + this.content.write() + '</span></sqrt>'
}

var SqrtBox = function (content) {
	SqrtInternalBox.call(this, content)
}
SqrtBox.prototype = new Box;
SqrtBox.prototype.write = function () {
	return arrx([new SqrtInternalBox(this.content)], [0], this.height, this.depth)
}


var DecoBox = function (content, deco) {
	this.height = content.height
	this.depth = content.depth
	this.content = content
	this.deco = deco
	this.spaceBefore = content.spaceBefore
	this.spaceAfter = content.spaceAfter
	this.forceSpaceBefore = content.forceSpaceBefore
	this.forceSpaceAfter = content.forceSpaceAfter
	if (deco.nospace) { this.spaceBefore = this.spaceAfter = 0 };
	if (deco.spaceBefore) { this.spaceBefore = 1 };
	if (deco.spaceAfter) { this.spaceAfter = 1 };
	if (deco.forceSpaceBefore) { this.forceSpaceBefore = this.spaceBefore = true };
	if (deco.forceSpaceAfter) { this.forceSpaceAfter = this.spaceAfter = true };
}
DecoBox.prototype = new Box;
DecoBox.prototype.write = function (adjLeft, adjRight) {
	if (typeof this.deco === 'string') return '<span class=e style="' + this.deco + '">' + this.content.write(adjLeft, adjRight) + '</span>';
	else return this.content.write(adjLeft, adjRight)
}

var SSBox = function (base, sup, sub) {
	this.sup = sup
	this.sub = sub
	this.base = base;
	if (sup) {
		this.height = this.base.height + SUP_BOTTOM + SS_SIZE * (sup.depth + sup.height);
		if (this.height - base.height <= SUP_TOP_TOLERENCE) {
			this.height = base.height
		}
	} else {
		this.height = base.height;
	};
	if (sub) {
		this.depth = this.base.depth - SUB_TOP + SS_SIZE * (sub.height + sub.depth);
		if (this.depth - base.depth <= SUB_BOTTOM_TOLERENCE) {
			this.depth = base.depth
		}
	} else {
		this.depth = base.depth;
	}
	this.spaceBefore = base.spaceBefore;
	this.forceSpaceBefore = base.forceSpaceBefore;
	this.breakBefore = base.breakBefore;
}
SSBox.prototype = new Box;
SSBox.prototype.write = function (adjLeft, adjRight) {
	var sup = this.sup;
	var sub = this.sub;
	return this.base.write(adjLeft, false)
		+ arrx([sup, sub], [
			sup ? this.base.height + SUP_BOTTOM + sup.depth * SS_SIZE : 0,
			sub ? -this.base.depth + SUB_TOP - sub.height * SS_SIZE : 0
		], this.height, this.depth, 'ss', [SS_SIZE, SS_SIZE])
}

var SSStackBox = function (base, sup, sub) {
	this.sup = sup ? new ScaleBox(SS_SIZE, sup) : null;
	this.sub = sub ? new ScaleBox(SS_SIZE, sub) : null;
	this.base = base;
	this.height = base.height + (sup ? (this.sup.height + this.sup.depth) : 0) + SSSTACK_MARGIN_SUP;
	this.depth = base.depth + (sub ? (this.sub.height + this.sub.depth) : 0) + SSSTACK_MARGIN_SUB;
}
SSStackBox.prototype = new Box;
SSStackBox.prototype.write = function (adjLeft, adjRight) {
	var rises = [
		this.sup ? this.height - this.sup.height : 0,
		0,
		this.sub ? -this.depth + this.sub.depth : 0
	];
	return arrx([this.sup, this.base, this.sub], rises, this.height, this.depth, 'sss')
}

var FSBox = function (scale, content) {
	this.scale = scale;
	this.content = content;
	this.height = content.height * scale
	this.depth = content.depth * scale
}
FSBox.prototype = new Box;
FSBox.prototype.write = function () {
	return '<span class=sc style="font-size:' + (this.scale * 100) + '%">' + this.content.write() + '</span>'
}

var BigOpBox = function (content, scale, ascender, descender, shift) {
	this.scale = scale;
	this.content = content;
	if (arguments.length < 3) ascender = OPERATOR_ASC
	if (arguments.length < 4) descender = OPERATOR_DESC
	if (arguments.length < 5) shift = BIGOP_SHIFT
	this.height = (ascender + shift) * scale;
	this.depth = (descender - shift) * scale;
	this.shift = shift;
}
BigOpBox.prototype = new Box;
BigOpBox.prototype.write = function () {
	return arrx([new ScaleBox(this.scale, this.content)], [this.shift * this.scale], this.height, this.depth, 'bo')
}

var layout = function (box, config) {
	if (box instanceof HBox && !config.keepSpace) {
		var buf = [];
		var segment = [];
		for (var i = 0; i < box.boxes.length; i++) {
			var current = box.boxes[i];
			if (current.breakBefore) {
				if (segment.length) buf.push(new SegmentBox(segment));
				segment = []
			}
			segment.push(current)
			if (current.breakAfter) {
				if (segment.length) buf.push(new SegmentBox(segment));
				segment = []
			}
		}
		if (segment.length) buf.push(new SegmentBox(segment));
		segment = [];
		return hJoin(buf, STD_WRITE);
	} else {
		return (new SegmentBox([box])).write()
	}
};


exports.Box = Box;
exports.CBox = CBox;
exports.CSBox = CSBox;
exports.VarBox = VarBox;
exports.NumberBox = NumberBox;
exports.CodeBox = CodeBox;
exports.BfBox = BfBox;
exports.OpBox = OpBox;
exports.SpBox = SpBox;
exports.BCBox = BCBox;
exports.BracketBox = BracketBox;

exports.ScaleBox = ScaleBox;
exports.RaiseBox = RaiseBox;
exports.KernBox = KernBox;
exports.FracBox = FracBox;
exports.StackBox = StackBox;
exports.MatrixBox = MatrixBox;
exports.HBox = HBox;
exports.BBox = BBox;
exports.SqrtBox = SqrtBox;
exports.DecoBox = DecoBox;
exports.SSBox = SSBox;
exports.SSStackBox = SSStackBox;
exports.FSBox = FSBox;
exports.BigOpBox = BigOpBox;
exports.LSpBox = LSpBox;

exports.layoutSegment = function (boxes) {
	return (new SegmentBox(boxes)).write()
};
exports.layout = layout;
exports.TOPLEVEL_MATRIX_JOINER = TOPLEVEL_MATRIX_JOINER