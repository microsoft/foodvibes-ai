import { ISbsFactPutType, ISbsFactType } from "@sbssrc/utils/commonTypes";
import { Box } from "@mui/system";
import { useMemo } from "react";
import SbsSliderButtons from './sbsSliderButtons';
import { KScoreLableAc, KScoreLableAcShort, KScoreLableCl, KScoreLableClShort, KScoreLableCn, KScoreLableCnShort, KScoreLableCp, KScoreLableCpShort, KScoreLableCr, KScoreLableCrShort } from '@sbssrc/utils/commonConstants';

const SbsFactScorePicker = (
    {
        fact,
        isHorizontal,
        factPatchCb,
    }: {
        fact: ISbsFactType;
        isHorizontal: boolean;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
    }
) => {
    const sliderConfigs = useMemo(() => [
        {
            defaultValue: Number(fact.score_correctness) || 0,
            captionPrefix: KScoreLableCrShort,
            caption: KScoreLableCr,
            scoreKey: 'score_correctness',
        },
        {
            defaultValue: Number(fact.score_completeness) || 0,
            captionPrefix: KScoreLableCpShort,
            caption: KScoreLableCp,
            scoreKey: 'score_completeness',
        },
        {
            defaultValue: Number(fact.score_clarity) || 0,
            captionPrefix: KScoreLableClShort,
            caption: KScoreLableCl,
            scoreKey: 'score_clarity',
        },
        {
            defaultValue: Number(fact.score_accuracy) || 0,
            captionPrefix: KScoreLableAcShort,
            caption: KScoreLableAc,
            scoreKey: 'score_accuracy',
        },
        {
            defaultValue: Number(fact.score_consistency) || 0,
            captionPrefix: KScoreLableCnShort,
            caption: KScoreLableCn,
            scoreKey: 'score_consistency',
        },
    ], [fact.score_correctness, fact.score_completeness, fact.score_clarity, fact.score_accuracy, fact.score_consistency]);

    return <Box sx={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        {sliderConfigs.map((config, index) => (
            <SbsSliderButtons
                key={index}
                isHorizontal={isHorizontal}
                defaultValue={config.defaultValue}
                captionPrefix={config.captionPrefix}
                caption={config.caption}
                style={{ margin: '0' }}
                changeCb={(value) => {
                    factPatchCb(fact.id, {
                        property_name: config.scoreKey,
                        is_numeric: true,
                        property_value_numeric: value as number
                    } as ISbsFactPutType);
                }}
            />
        ))}
    </Box>;
};

export default SbsFactScorePicker;