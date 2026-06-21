import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  onRefresh: () => void;
  children: ReactNode;
  className?: string;
}

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function getScrollTop(): number {
      let node: HTMLElement | null = el;
      while (node) {
        if (node.scrollTop > 0) return node.scrollTop;
        if (node === document.body) break;
        node = node.parentElement as HTMLElement | null;
      }
      return 0;
    }

    function onTouchStart(e: TouchEvent) {
      if (refreshingRef.current) return;
      if (getScrollTop() <= 0) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      } else {
        pullingRef.current = false;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!pullingRef.current || refreshingRef.current) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) {
        e.preventDefault();
        setPullY(Math.min(dy * 0.45, THRESHOLD));
      } else {
        pullingRef.current = false;
        setPullY(0);
      }
    }

    function onTouchEnd() {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      setPullY((cur) => {
        if (cur >= THRESHOLD * 0.88) {
          refreshingRef.current = true;
          setRefreshing(true);
          setTimeout(() => {
            onRefreshRef.current();
            refreshingRef.current = false;
            setRefreshing(false);
            setPullY(0);
          }, 700);
          return THRESHOLD;
        }
        return 0;
      });
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const showIndicator = pullY > 6 || refreshing;
  const indicatorH = refreshing ? 52 : pullY;
  const rotateDeg = refreshing ? undefined : (pullY / THRESHOLD) * 300;

  return (
    <div ref={containerRef} className={className ?? "content"}>
      {showIndicator && (
        <div className="ptr-indicator" style={{ height: indicatorH }}>
          <span
            className={`ptr-spinner${refreshing ? " spinning" : ""}`}
            style={rotateDeg !== undefined ? { transform: `rotate(${rotateDeg}deg)` } : undefined}
          >
            ↻
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
