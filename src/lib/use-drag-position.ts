import { useEffect, useRef, useState, type RefObject } from 'react';
import { PanResponder, type GestureResponderEvent, type PanResponderInstance, type View } from 'react-native';

type DragPositionHandler = (x: number, y: number) => void;

interface DragPosition {
  ref: RefObject<View | null>;
  panHandlers: PanResponderInstance['panHandlers'];
}

// react-native-web renders a View as a DOM element, so its bounds are readable directly.
function positionInside(event: GestureResponderEvent, element: View | null) {
  const node = element as unknown as HTMLElement | null;
  if (!node) {
    return null;
  }

  const bounds = node.getBoundingClientRect();
  return {
    x: event.nativeEvent.pageX - bounds.left - window.scrollX,
    y: event.nativeEvent.pageY - bounds.top - window.scrollY,
  };
}

// Reports the pointer position, relative to the attached view, while the user presses or drags it.
export function useDragPosition(onDrag: DragPositionHandler): DragPosition {
  const ref = useRef<View>(null);
  const latestHandler = useRef(onDrag);

  useEffect(() => {
    latestHandler.current = onDrag;
  }, [onDrag]);

  // The handlers only run on pointer events, never during render.
  /* eslint-disable react-hooks/refs */
  const [panResponder] = useState(() => {
    const report = (event: GestureResponderEvent) => {
      const position = positionInside(event, ref.current);
      if (position) {
        latestHandler.current(position.x, position.y);
      }
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: report,
      onPanResponderMove: report,
    });
  });
  /* eslint-enable react-hooks/refs */

  return { ref, panHandlers: panResponder.panHandlers };
}
