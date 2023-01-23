import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EscapeLayer } from './Dialog';

let portalRoot = document.body;
const Drawer = forwardRef(({ delay = 100, onClose, children }, ref) => {
	const id = useId();
	const box = useRef(document.createElement('div'));
	box.current.id = id;
	let { top, right, height } = ref.current.parentNode.children[1].getBoundingClientRect();

	const Container = () => {
		const childrenContainerRef = useRef();
		const [transition, setTransition] = useState(false);
		const [transitionStyle, setTransitionStyle] = useState({
			position: 'absolute',
			background: 'white',
			transition: 'all 200ms ease-in',
			top: top + 'px',
			left: right + 'px',
			minWidth: 200 + 'px',
			minHeight: 250 + 'px',
			height: height + 'px',
			borderLeft: '1px solid var(--border-line-color)',
		});

		useEffect(() => {
			setTimeout(() => {
				const { width } = childrenContainerRef.current.getBoundingClientRect();
				setTransitionStyle((prev) => ({ ...prev, left: right - width + 'px' }));
				setTransition(true);
			}, delay);
		}, []);

		const handleClose = () => {
			setTransitionStyle((prev) => ({ ...prev, left: right + 'px' }));
			setTimeout(() => {
				onClose();
			}, delay);
		};

		return (
			<>
				<EscapeLayer handleClose={handleClose}></EscapeLayer>
				<div
					style={
						!transition
							? { position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }
							: { position: 'absolute', top: 0, left: 0 }
					}
				>
					<div style={transitionStyle} ref={childrenContainerRef}>
						{children}
					</div>
				</div>
			</>
		);
	};

	useEffect(() => {
		portalRoot.appendChild(box.current);
		return () => portalRoot.removeChild(box.current);
	}, []);

	return createPortal(<Container />, box.current);
});
Drawer.displayName = 'Drawer';
export default Drawer;
// export default function Drawer({ nodeRef, delay = 100, onClose, children }) {
// 	const id = useId();
// 	const box = useRef(document.createElement('div'));
// 	box.current.id = id;
// 	let { top, right, height } = nodeRef.current.getBoundingClientRect();

// 	const Container = () => {
// 		const childrenContainerRef = useRef();
// 		const [transition, setTransition] = useState(false);
// 		const [transitionStyle, setTransitionStyle] = useState({
// 			position: 'absolute',
// 			background: 'white',
// 			transition: 'all 200ms ease-in',
// 			top: top + 'px',
// 			left: right + 'px',
// 			minWidth: 200 + 'px',
// 			height: height + 'px',
// 			borderLeft: '1px solid var(--border-line-color)',
// 		});

// 		useEffect(() => {
// 			setTimeout(() => {
// 				const { width } = childrenContainerRef.current.getBoundingClientRect();
// 				setTransitionStyle((prev) => ({ ...prev, left: right - width + 'px' }));
// 				setTransition(true);
// 			}, delay);
// 		}, []);

// 		const handleClose = () => {
// 			setTransitionStyle((prev) => ({ ...prev, left: right + 'px' }));
// 			setTimeout(() => {
// 				onClose();
// 			}, delay);
// 		};

// 		return (
// 			<>
// 				<EscapeLayer handleClose={handleClose}></EscapeLayer>
// 				<div
// 					style={
// 						!transition
// 							? { position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }
// 							: { position: 'absolute', top: 0, left: 0 }
// 					}
// 				>
// 					<div style={transitionStyle} ref={childrenContainerRef}>
// 						{children}
// 					</div>
// 				</div>
// 			</>
// 		);
// 	};

// 	useEffect(() => {
// 		portalRoot.appendChild(box.current);
// 		return () => portalRoot.removeChild(box.current);
// 	}, []);

// 	return createPortal(<Container />, box.current);
// }
