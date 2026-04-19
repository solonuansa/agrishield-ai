/**
 * Hook untuk mendeteksi apakah elemen masuk ke viewport.
 * Digunakan untuk animasi scroll di Landing Page.
 * Menggunakan Intersection Observer API secara langsung (bukan useEffect).
 */
import { RefObject, useRef, useState, useCallback } from "react";

interface Options {
  threshold?: number;
  rootMargin?: string;
  /** Jika true, observer berhenti setelah pertama kali terdeteksi */
  once?: boolean;
}

export function useIntersectionObserver<T extends Element>(
  options: Options = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useRef<T>(null);

  // Gunakan callback ref agar observer dibuat saat element di-mount
  const callbackRef = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observerRef.current?.disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [threshold, rootMargin, once]
  );

  // Pasang callback ref ke ref object agar bisa digunakan sebagai RefObject
  (ref as React.MutableRefObject<T | null>).current = null;
  const combinedRef = useCallback(
    (node: T | null) => {
      (ref as React.MutableRefObject<T | null>).current = node;
      callbackRef(node);
    },
    [callbackRef]
  ) as unknown as RefObject<T>;

  return [combinedRef, isVisible];
}
