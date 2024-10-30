import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import styles from '../Styles/Card.module.css';

const Card = ({ card, onSwipe, isGone, swipeThreshold = 100, containerWidth = 300 }) => {
  const [props, api] = useSpring(() => ({ x: 0, opacity: 1, rotate: 0 }));

  const bind = useGesture({
    onDrag: ({ offset: [x] }) => {
      const boundedX = Math.max(-containerWidth / 2, Math.min(x, containerWidth / 2));
      const rotation = (boundedX / (containerWidth / 2)) * 10; // Rotate based on bounded x
      api.start({ x: boundedX, opacity: 1, rotate: rotation });
    },
    onDragEnd: ({ offset: [x] }) => {
      let direction = '';
      if (x > swipeThreshold) {
        direction = 'right';
        onSwipe(card._id,'right');
        api.start({ x: 500, opacity: 0, rotate: 20 });
      } else if (x < -swipeThreshold) {
        direction = 'left';
        onSwipe(card._id,'left');
        api.start({ x: -500, opacity: 0, rotate: -20 });
      } else {
        api.start({ x: 0, opacity: 1, rotate: 0 });
      }
      return direction;
    },
  });

  if (isGone) {
    return null;
  }

  const textWatermark = props.x.to(x => {
    if (x > swipeThreshold) return 'Accepted';
    if (x < -swipeThreshold) return 'Rejected';
    return '';
  });

  const watermarkColor = props.x.to(x => (x > swipeThreshold ? 'green' : x < -swipeThreshold ? 'red' : 'transparent'));

  return (
    <animated.div
      {...bind()}
      aria-label={`Swipe card for ${card.fullName}`}
      className={styles.card}
      style={{
        ...props,
        backgroundImage: `url(${card.profilePic[0].url})`,
        transform: props.rotate.to((r) => `rotate(${r}deg)`),
      }}
    >
      <div className={styles.cardInfo}>
        <p style={{ fontSize: '1.5rem', margin: 0 }}>{card.fullName}</p>
        <p style={{ margin: 0 }}>{card.interests.join(', ')}</p>
      </div>
      <animated.div
        className={styles.watermark}
        style={{
          color: watermarkColor,
          display: textWatermark.to(text => (text ? 'block' : 'none')),
          opacity: props.x.to(x => 1 - 1 / swipeThreshold),
        }}
      >
        {textWatermark}
      </animated.div>
    </animated.div>
  );
};

export default Card;