import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 };

export const useElementSize = (
  ref: RefObject<HTMLElement>
): ElementSize => {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateSize = (entry?: ResizeObserverEntry) => {
      const rect = entry?.contentRect ?? element.getBoundingClientRect();
      const next = { width: rect.width, height: rect.height };
      setSize(prev =>
        prev.width === next.width && prev.height === next.height ? prev : next
      );
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => updateSize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        updateSize(entry);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};
