import { useEffect, useRef } from "react"

const SbsBoundaryMarker = ({ hasComeIntoViewCb }: { hasComeIntoViewCb: (isInView: boolean) => void }) => {
    const refBoundaryMarker = useRef(null);

    useEffect(() => {
        if (!hasComeIntoViewCb) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            hasComeIntoViewCb(entries.find((e) => e.isIntersecting) ? true : false);
        });

        if (refBoundaryMarker?.current) {
            observer.observe(refBoundaryMarker.current);
        }

        return () => {
            if (refBoundaryMarker?.current) {
                observer.unobserve(refBoundaryMarker.current);
            }
        };
    }, []);


    return (
        <div ref={refBoundaryMarker} style={{ height: "1px", width: "1px", backgroundColor: "transparent" }}></div>
    );
};

export default SbsBoundaryMarker;
