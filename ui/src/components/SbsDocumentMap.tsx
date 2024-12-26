import { useCallback, useEffect, useMemo, useRef } from "react";
import { UseSbsStyles } from "./SbsStyledCtls";

const SbsDocumentMap = (
    {
        tag,
        rowIdBeg,
        rowIdEnd,
        max,
        height,
        changeCb,
    }: {
        tag: string;
        rowIdBeg: number;
        rowIdEnd: number;
        max: number;
        height: string;
        changeCb: (value: number) => void;
    }
) => {
    const classes = UseSbsStyles();
    const mapContent = useMemo(() => Array.from({ length: max }, (_, index) => `${tag}${index + 1}`), [tag, max]);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        for (let idx = rowIdBeg; idx <= rowIdEnd; idx++) {
            const row = mapRef.current?.querySelector(`#row${idx}`);

            if (row) {
                row.scrollIntoView({ block: "center" });
                break;
            }
        }
    }, [rowIdBeg, rowIdEnd]);

    return (
        <div className={classes.documentMapContainer} style={{
            maxHeight: height,
            minHeight: height,
            width: "100%",
        }}>
            <div className={classes.documentMap} ref={mapRef} style={{
                maxHeight: height,
                minHeight: height,
            }}>
                {mapContent.map((line, idx) => (
                    <div
                        key={idx}
                        id={`row${idx}`}
                        className={idx >= rowIdBeg && idx <= rowIdEnd ? classes.mapLineInRange : classes.mapLine} onClick={() => {
                            changeCb(Math.round(idx / 10));
                        }}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SbsDocumentMap;
