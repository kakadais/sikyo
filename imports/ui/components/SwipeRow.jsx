import React, { useRef, useState, useLayoutEffect } from "react";
import { useSwipeable } from "react-swipeable";

export default function SwipeRow({
                                   children,
                                   renderActions, // ({ close }) => ReactNode
                                   actionWidth = 152,
                                 }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef(null);
  const [rowH, setRowH] = useState(0);

  const close = () => setOpen(false);

  useLayoutEffect(() => {
    if (!rowRef.current) return;

    const el = rowRef.current;
    const update = () => setRowH(el.getBoundingClientRect().height);

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setOpen(true),
    onSwipedRight: () => setOpen(false),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 12,
  });

  const translate = open ? -actionWidth : 0;

  return (
    <div className="relative overflow-hidden">
      {/* actions: open일 때만 보이게 */}
      <div
        className={[
          "absolute right-0 top-0 z-20 flex items-center justify-end gap-x-2 pr-3",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
          "transition-opacity duration-150",
        ].join(" ")}
        style={{ width: actionWidth, height: rowH || "100%" }}
      >
        {typeof renderActions === "function" ? renderActions({ close }) : null}
      </div>

      {/* row content */}
      <div {...handlers} className="relative z-0">
        <div
          ref={rowRef}
          className="relative bg-white dark:bg-gray-900 transition-transform duration-200 will-change-transform"
          style={{ transform: `translateX(${translate}px)` }}
        >
          {children}
        </div>

        {/* 열린 상태에서만: 왼쪽 영역만 덮는 닫기 레이어 */}
        {open ? (
          <button
            type="button"
            onClick={close}
            className="absolute inset-y-0 left-0 z-10"
            style={{ right: actionWidth }}
            aria-label="Close actions"
          />
        ) : null}
      </div>
    </div>
  );
}
