import { useState } from 'react';
import { selectNone } from '../hooks/usePortalBox.module.scss';
import usePortalBox from '../hooks/usePortalBox';

export default function Tooltip(props) {
	const { title, placement = 'bottom', padding = 8, children } = props;

	const [isHover, setIsHover] = useState(false);
	const [parentRect, setParentRect] = useState(null);
	const isTitleEmpty = !title || title?.length === 0;
	const isPopup = !isTitleEmpty && isHover;
	const { Portal } = usePortalBox({
		title: title,
		padding: padding,
		isPopup: isPopup,
		parentRect: parentRect,
		placement: placement,
	});

	const handleMouseOver = (e) => {
		const parentRect = e.target.getBoundingClientRect();
		setParentRect(parentRect);
		setIsHover(true);
	};

	const handleMouseOut = () => {
		setIsHover(false);
	};

	return (
		<>
			<div className={selectNone} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseOut}>
				{children}
			</div>
			{Portal}
		</>
	);
}
