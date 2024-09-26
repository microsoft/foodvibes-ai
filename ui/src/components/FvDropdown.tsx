import { CommonCheckListType } from '@foodvibes/utils/commonTypes';
import { OutlinedInput } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState } from 'react';

export default function FvDropdown({
    label,
    choicesCurr,
    setChoicesNew,
    minWidth = 360,
}: {
    label: string,
    choicesCurr: CommonCheckListType[];
    setChoicesNew: (value: CommonCheckListType[]) => void;
    minWidth?: number;
}) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        choicesCurr?.filter(option => option.checked)?.map((option) => option.shortName) ?? []
    );

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const checkedItems = event.target.value as string[];

        setSelectedOptions(checkedItems);

        console.log(checkedItems);

        setChoicesNew(
            choicesCurr.map((option) => ({
                ...option,
                checked: checkedItems.indexOf(option.shortName) > -1,
            }))
        );
    };

    return (
        <div>
            <FormControl sx={{ margin: "10px 0 0 0", width: minWidth }}>
                <InputLabel>{label}</InputLabel>
                <Select
                    multiple
                    value={selectedOptions}
                    onChange={handleChange}
                    input={<OutlinedInput label={label} />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                maxHeight: 50 * choicesCurr.length + 8,
                                width: minWidth,
                                '& .MuiMenuItem-root': {
                                    margin: "0 8px",
                                    padding: 0,
                                },
                                '& .MuiCheckbox-root': {
                                    margin: "4px 12px",
                                    padding: 0,
                                },
                                '& .MuiListItemText-primary': {
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                },
                            },
                        },
                    }}
                >
                    {choicesCurr.map((option) => (
                        <MenuItem key={option.shortName} value={option.shortName}>
                            <Checkbox checked={selectedOptions.indexOf(option.shortName) > -1} />
                            <ListItemText primary={option.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}
