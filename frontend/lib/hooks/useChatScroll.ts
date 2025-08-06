import { useEffect, useRef, MutableRefObject } from 'react';

export function useChatScroll<T>(
  dependency: T,
  shouldAutoScroll: boolean = true
): MutableRefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && shouldAutoScroll) {
      // Scroll to bottom
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dependency, shouldAutoScroll]);

  return ref;
}

export function useScrollToBottom(): [
  MutableRefObject<HTMLDivElement | null>,
  () => void
] {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  return [ref, scrollToBottom];
}