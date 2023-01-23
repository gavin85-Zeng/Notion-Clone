import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContextMenu.module.scss';

export function Menu({ data }) {
	return (
		<div className={styles.wrapper}>
			{data.map((obj) => (
				<div className={styles.item} key={`context-menu-${obj.text}`} onClick={obj.fn}>
					{obj.text}
				</div>
			))}
		</div>
	);
}

const portalRoot = document.body;
export default function ContextMenu({ top, left, onClose, children }) {
	const id = useId();
	const box = useRef(document.createElement('div'));

	const Container = () => {
		return (
			<>
				<div className={styles.overlay} onClick={onClose}></div>
				<div id={id} className={styles.container} style={{ top: top, left: left }}>
					{children}
				</div>
			</>
		);
	};

	useEffect(() => {
		portalRoot.appendChild(box.current);

		return () => portalRoot.removeChild(box.current);
	}, []);

	return createPortal(<Container />, box.current);
}
