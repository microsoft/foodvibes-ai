import { useState, useEffect, useRef } from "react"
import { ILayoutTracker } from "../commonTypes";

/*
  For overflow "title" detection to work, the <DIV> "ref" needs to have styles: { whiteSpace: "nowrap", overflow: "hidden”, textOverflow: "ellipsis" }
*/

const useLayoutTracker = (dependencies: unknown[]): ILayoutTracker => {
    const [trackerState, setTrackerState] = useState<ILayoutTracker>({
        ref: useRef<HTMLDivElement>(null),
        isOverflow: false,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });
    const updatePositionAndSizeAndOverflow = () => {
        if (trackerState.ref?.current) {
            const isOverflow: boolean =
                trackerState.ref.current.scrollWidth > trackerState.ref.current.clientWidth ||
                trackerState.ref.current.scrollHeight > trackerState.ref.current.clientHeight;
            const rect = trackerState.ref.current.getBoundingClientRect();

            setTrackerState({
                ...trackerState,
                isOverflow,
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
            });
        }
    };

    useEffect(() => {
        // Update position and size and overflow on mount, window resize or scroll
        updatePositionAndSizeAndOverflow();
        window.addEventListener("resize", updatePositionAndSizeAndOverflow);
        window.addEventListener("scroll", updatePositionAndSizeAndOverflow);

        // Clean up
        return () => {
            window.removeEventListener("resize", updatePositionAndSizeAndOverflow);
            window.removeEventListener("scroll", updatePositionAndSizeAndOverflow);
        };
    }, dependencies);
    useEffect(() => {
        updatePositionAndSizeAndOverflow();
    }, [trackerState.ref?.current, ...dependencies]);

    return trackerState;
};

export default useLayoutTracker;