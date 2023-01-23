import { useRef, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styleModule from './usePortalBox.module.scss';

const paddingHalfHeight = 3;

function center(parent, span) {
	return parent / 2 - span / 2;
}

function isProtrude(position) {
	const { top, left, right, bottom, sw, sh, padding } = position;

	const WINDOW_WIDTH = window.document.documentElement.clientWidth;
	const WINDOW_HEIGHT = window.document.documentElement.clientHeight;

	const tSpace = top - window.pageYOffset;
	const lSpace = left - window.pageXOffset;
	const oriRight = right - window.pageXOffset;
	const oriBottom = bottom - window.pageYOffset;

	const bSpace = WINDOW_HEIGHT - oriBottom;
	const rSpace = WINDOW_WIDTH - oriRight;

	const boxhalfX = (oriRight - lSpace) / 2;
	const boxhalfY = (oriBottom - tSpace) / 2;
	const halfX = lSpace + boxhalfX;
	const halfY = tSpace + boxhalfY;

	const detail = {
		x: {
			start: lSpace + sw > WINDOW_WIDTH || lSpace + sw < sw,
			half: halfX + sw > WINDOW_WIDTH || halfX < sw,
			end: oriRight > WINDOW_WIDTH || oriRight < sw,
		},
		y: {
			start: tSpace + sh > WINDOW_HEIGHT || tSpace + sh < sh,
			half: halfY + sh > WINDOW_HEIGHT || halfY < sh,
			end: oriBottom > WINDOW_HEIGHT || oriBottom < sh,
		},
	};

	const fullWidth = padding + sw;
	const fullHeight = padding + sh;

	return {
		top: fullHeight > tSpace,
		right: fullWidth > rSpace,
		bottom: fullHeight > bSpace,
		left: fullWidth > lSpace,
		detail: detail,
		find: 0,
	};
}

// change to [start,center,end] position not implement yet
function swap(placement, protrude) {
	let { top, right, bottom, left, detail, find } = protrude;
	let p = { ...protrude, find: ++find };
	const { x, y } = detail;

	// cant find location return bottom
	if (find === 4) placement = undefined;

	switch (placement) {
		case 'top':
			if (x.start || x.half || x.end) return swap('left', p);
			if (top) return swap('bottom', p);
			break;
		case 'right':
			if (y.start || y.half || y.end) return swap('top', p);
			if (right) return swap('left', p);
			break;
		case 'bottom':
			if (x.start || x.half || x.end) return swap('right', p);
			if (bottom) return swap('top', p);
			break;
		case 'left':
			if (y.start || y.half || y.end) return swap('bottom', p);
			if (left) return swap('right', p);
			break;
		default:
			placement = 'bottom';
			break;
	}

	return placement;
}

function horizontal(isTop, position) {
	const { pw, sh, sw, top, left, right, bottom, padding, suffix } = position;
	let x;
	const offset = isTop ? paddingHalfHeight - sh - padding : padding + paddingHalfHeight;
	const y = isTop ? top + offset : bottom + offset;

	if (suffix === 'start') {
		x = left;
	} else if (suffix === 'end') {
		x = right - sw;
	} else {
		const cw = center(pw, sw);
		x = left + cw;
	}

	isProtrude(position);

	const transform = `translate3d(${x}px, ${y}px, 0px)`;
	return { transform: transform };
}

function vertical(isRight, position) {
	const { ph, sh, sw, top, left, right, bottom, padding, suffix } = position;

	let y;
	const x = isRight ? right + padding : left - sw - padding;

	if (suffix === 'start') {
		y = top + paddingHalfHeight;
	} else if (suffix === 'end') {
		y = bottom - sh + paddingHalfHeight;
	} else {
		const ch = center(ph, sh) + paddingHalfHeight;
		y = top + ch;
	}

	const transform = `translate3d(${x}px, ${y}px, 0px)`;
	return { transform: transform };
}

function positionCalculator(rect, customize) {
	const hyphenIdx = customize.placement.indexOf('-');
	let prefix = hyphenIdx !== -1 ? customize.placement.substring(0, hyphenIdx) : customize.placement;
	const suffix = hyphenIdx !== -1 ? customize.placement.substring(hyphenIdx + 1) : null;

	const position = {
		pw: rect.width,
		ph: rect.height,
		sw: customize.ref.current.offsetWidth,
		sh: customize.ref.current.offsetHeight,
		top: rect.top + window.pageYOffset,
		bottom: rect.bottom + window.pageYOffset,
		left: rect.left + window.pageXOffset,
		right: rect.right + window.pageXOffset,
		padding: customize.padding,
		suffix: suffix,
	};

	const protrude = isProtrude(position);
	prefix = swap(prefix, protrude);

	let style = null;
	if (prefix === 'bottom') {
		style = horizontal(false, position);
	} else if (prefix === 'top') {
		style = horizontal(true, position);
	} else if (prefix === 'left') {
		style = vertical(false, position);
	} else if (prefix === 'right') {
		style = vertical(true, position);
	} else {
		style = horizontal(false, position);
	}

	return style;
}

const portalRoot = document.body;

export default function usePortalBox(props) {
	const { title, padding, isPopup, parentRect, placement } = props;
	const id = useId();
	const spanref = useRef();

	const customize = {
		ref: spanref,
		placement: placement,
		padding: padding,
	};

	const box = document.createElement('div');
	box.id = id;
	box.className = styleModule.tooltip;
	box.setAttribute('data-popper-placement', placement);

	useEffect(() => {
		if (!isPopup) return;
		portalRoot.appendChild(box);
		const { transform } = positionCalculator(parentRect, customize);
		box.style.transform = transform;

		return () => {
			portalRoot.removeChild(box);
		};
	}, [isPopup]);

	return {
		Portal: createPortal(
			<span className={styleModule.text} ref={spanref}>
				{title}
			</span>,
			box,
		),
	};
}
