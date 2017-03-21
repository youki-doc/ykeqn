exports.defms = function (defm) {
	defm('upper choose lower', '(upper above lower)');
	defm('f mathfn', 'f rm forcerightspace');
	defm("sin", '"sin" mathfn');
	defm("cos", '"cos" mathfn');
	defm("tan", '"tan" mathfn');
	defm("cot", '"cot" mathfn');
	defm("sec", '"sec" mathfn');
	defm("csc", '"csc" mathfn');
	defm("ln", '"ln" mathfn');
	defm("lg", '"lg" mathfn');
	defm("log", '"log" mathfn');
	defm("lb", '"lb" mathfn');
	defm("lim", '"lim" mathfn');
	defm("sup", '"sup" mathfn');
	defm("inf", '"inf" mathfn');
	defm("erf", '"erf" mathfn');
	defm("erfc", '"erfc" mathfn');
	defm("x bra", 'langle left x right |');
	defm("x ket", '| left x right rangle');
	defm("-*", '{minus nospace kern "-0.1" ast nospace} leftspace operatorspace')
}