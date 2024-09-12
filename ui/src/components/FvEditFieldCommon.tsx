import { FormatTimestamp } from "@foodvibes/utils/commonFunctions";
import { CommonEditFieldType, EditFieldsType } from "@foodvibes/utils/commonTypes";
import { TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";

export const FvEditFieldCommon = ({
    editFields,
    setEditFields,
    id,
    label,
    type,
}: {
    editFields: EditFieldsType | null;
    setEditFields: (payload: EditFieldsType | null) => void;
    id: string;
    label: string;
    type: CommonEditFieldType;
}) => {
    const setValue = (value: string | number) => {
        const payload: EditFieldsType = {};

        payload.incoming = {};
        payload.incoming[id] = value;

        setEditFields(payload);
    };

    return type === CommonEditFieldType.datepicker ? (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                    key={id}
                    value={dayjs(editFields?.incoming?.[id]?.toString())}
                    format={"YYYY-MM-DD HH:mm:ss"}
                    formatDensity={"dense"}
                    label={label}
                    name={id}
                    onChange={value => {
                        setValue(FormatTimestamp(value?.toString(), true));
                    }}
                />
            </DemoContainer>
        </LocalizationProvider>
    ) : (
        <TextField
            sx={{
                marginTop: "8px",
            }}
            fullWidth={true}
            key={id}
            defaultValue={editFields?.incoming?.[id]}
            variant="outlined"
            label={label}
            name={id}
            type={type === CommonEditFieldType.number ? "number" : "text"}
            onChange={e => {
                setValue(type === CommonEditFieldType.number ? Number(e.target.value) : e.target.value);
            }}
        />
    );
};