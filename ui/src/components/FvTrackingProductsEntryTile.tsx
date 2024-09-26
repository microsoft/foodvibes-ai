
import iconLocationBeg from "@foodvibes/assets/location-beg.png";
import iconLocationEnd from "@foodvibes/assets/location-end.png";
import iconLocationMid from "@foodvibes/assets/location-mid.png";
import {
    StyleGridContainer,
    StyledGridItem,
} from "@foodvibes/utils/commonStyles";
import {
    CommonDetailLevel,
    CommonGridSizes,
    GeotrackType,
    ProductType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import FvCardGeotrack from "./FvCardGeotrack";
import FvCardProduct from "./FvCardProduct";
import FvCardTrackingProducts from "./FvCardTrackingProducts";

const gridSizes: CommonGridSizes[] = [
    {
        // Min [trakingProduct tile, product tile, geotrack tile]
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [6, 6, 12],
        xs: [12, 12, 12],
    },
    {
        // Low
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [6, 6, 12],
        xs: [12, 12, 12],
    },
    {
        // High
        xl: [3, 3, 6],
        lg: [3, 3, 6],
        md: [6, 6, 12],
        sm: [12, 12, 12],
        xs: [12, 12, 12],
    },
    {
        // Max
        xl: [3, 3, 6],
        lg: [3, 3, 6],
        md: [6, 6, 12],
        sm: [12, 12, 12],
        xs: [12, 12, 12],
    },
];

const getGridSize = (
    isModal: boolean,
    detailLevel: CommonDetailLevel,
    idx: number,
) => {
    if (isModal) {
        return {
            xs: 12,
        };
    } else {
        return {
            xl: gridSizes[detailLevel].xl[idx],
            lg: gridSizes[detailLevel].lg[idx],
            md: gridSizes[detailLevel].md[idx],
            sm: gridSizes[detailLevel].sm[idx],
            xs: gridSizes[detailLevel].xs[idx],
        };
    }
};

const populateProductFromTrackingProducts = (
    r: TrackingProductsType,
): ProductType =>
    ({
        orm_id: 0,
        is_history: r.product_is_history ? true : false,
        product_ledger_id: r.product_ledger_id,
        product_tx_id: r.product_tx_id,
        product_id: r.product_id,
        description: r.description,
        quantity: r.quantity,
        storage_tier: r.storage_tier,
        recorded_at: r.product_recorded_at,
        properties: r.product_properties,
        operation_name: r.product_operation_name,
        created_at: r.product_created_at,
        username: r.product_username,
        image_id: r.product_image_id,
        image_url: r.product_image_url,
    }) as ProductType;

const populateGeotrackFromTrackingProducts = (
    r: TrackingProductsType,
): GeotrackType =>
    ({
        orm_id: 0,
        is_history: r.geotrack_is_history ? true : false,
        geotrack_ledger_id: r.geotrack_ledger_id,
        geotrack_tx_id: r.geotrack_tx_id,
        geotrack_id: r.geotrack_id,
        name: r.name,
        details: r.details,
        latitude: r.latitude,
        longitude: r.longitude,
        movement: r.geotrack_movement,
        recorded_at: r.geotrack_recorded_at,
        properties: r.geotrack_properties,
        operation_name: r.geotrack_operation_name,
        created_at: r.geotrack_created_at,
        username: r.geotrack_username,
        image_id: r.geotrack_image_id,
        image_url: r.geotrack_image_url,
    }) as GeotrackType;

export default function FvTrackingProductsEntryTile({
    rec,
    cnt,
    idx,
    trackingProductsRankToView,
    isModal,
    isTile,
    detailLevel,
    mapsEngineIsReady,
    scrollToRef,
}: {
    rec: TrackingProductsType;
    cnt: number;
    idx: number;
    trackingProductsRankToView: number;
    isModal: boolean;
    isTile: boolean;
    detailLevel: CommonDetailLevel;
    mapsEngineIsReady: boolean | null;
    scrollToRef: React.MutableRefObject<null> | null;
}): JSX.Element | undefined {
    if (!rec) {
        return;
    }

    return (
        <StyleGridContainer
            container
            spacing={0}
            sx={{
                margin: `${idx > 0 || isTile ? 0 : (detailLevel > CommonDetailLevel.low ? 0 : 0)}px 0 0 0`,
                border: isModal && detailLevel === CommonDetailLevel.min ? "0" : {},
                borderRadius: `${detailLevel > CommonDetailLevel.low && !isModal ? 8 : 0}px`,
            }}
        >
            {(!isTile || detailLevel > CommonDetailLevel.min) && (
                <StyledGridItem
                    item
                    ref={rec.rank_curr_ledger_id === trackingProductsRankToView ? scrollToRef : null}
                    {...getGridSize(isModal, detailLevel, 0)}
                >
                    <FvCardTrackingProducts
                        data={rec}
                        idx={idx}
                        cnt={cnt}
                        detailLevel={detailLevel}
                        isModal={isModal}
                        isTile={isTile}
                    />
                </StyledGridItem>
            )}
            <StyledGridItem
                item
                {...getGridSize(isModal, detailLevel, 1)}
            >
                <FvCardProduct
                    data={populateProductFromTrackingProducts(rec)}
                    detailLevel={detailLevel}
                    isModal={isModal}
                    isTile={isTile}
                />
            </StyledGridItem>
            {(!isTile || detailLevel > CommonDetailLevel.min) && (
                <StyledGridItem
                    item
                    {...getGridSize(isModal, detailLevel, 2)}
                >
                    <FvCardGeotrack
                        data={populateGeotrackFromTrackingProducts(rec)}
                        detailLevel={detailLevel}
                        mapsEngineIsReady={mapsEngineIsReady}
                        isModal={isModal}
                        isTile={isTile}
                        mapPinIconToUse={idx > 0
                            ? idx + 1 === cnt
                                ? iconLocationBeg
                                : iconLocationMid
                            : iconLocationEnd}
                    />
                </StyledGridItem>
            )}
        </StyleGridContainer>
    );
}
