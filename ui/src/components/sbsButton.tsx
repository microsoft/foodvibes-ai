import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    main: {
        backgroundColor: '#fafafa',
        color: 'navy',
        padding: '4px 8px',
        border: '1px solid navy',
        borderRadius: '4px',
        cursor: 'pointer'
    },
});
// This is a an alternative to the Material-UI Button component. MUI version keeps giving a FindDOMNode deprecation warning.
const SbsButton = (
    {
        caption,
        clicktCb,
        clicktCbArg,
        style,
    }: {
        caption: string;
        clicktCb: (arg?: string | number) => void;
        clicktCbArg?: string | number;
        style?: React.CSSProperties;
    }
) => {
    const classes = useStyles();

    return (
        <button
            className={classes.main}
            style={style}
            onClick={() => {
                clicktCb(clicktCbArg);
            }}
        >
            {caption}
        </button>
    );
};

export default SbsButton;