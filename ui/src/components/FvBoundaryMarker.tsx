import { useEffect, useRef } from "react"

const FvBoundaryMarker = ({ hasComeIntoViewCb }: { hasComeIntoViewCb: (isInView: boolean) => void }) => {
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
        <div ref={refBoundaryMarker} style={{ height: "0", width: "0", backgroundColor: "blue" }}></div>
    );
};

export default FvBoundaryMarker;

// useEffect(() => {
//     if (hasHitContentBottom) {
//         setHasHitContentBottom(false);
//     }

//     const pageIndex: number = (queryParams.pagination?.pageIndex ?? 0) + (queryParams.pagination?.pageSize ?? 0);

//     if ((contactSearchResults?.meta?.rowCount ?? 0) >= pageIndex) {
//         setQuery({
//             …queryParams,
//             pagination: {
//                 …queryParams.pagination,
//                 pageIndex,
//             },
//         } as QueryParamsType);
//     }
// }, [hasHitContentBottom]);
