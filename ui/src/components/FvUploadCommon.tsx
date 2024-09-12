import { StyledHiddenInput } from "@foodvibes/utils/commonStyles";
import { EditFieldsType, UploadImageType } from "@foodvibes/utils/commonTypes";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';

export const FvUploadCommon = ({
    image_url,
    setEditFields,
    uploadImage,
    isProduct,
}: {
    image_url: string | null;
    setEditFields: (payload: EditFieldsType | null) => void;
    uploadImage: (uploadImage: UploadImageType) => void;
    isProduct: boolean;
}) => {
    const handleImageChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;

        if (!fileList) return;

        const imageId = `${isProduct ? 'product' : 'geotrack'}/${uuidv4()}`;

        setEditFields({
            incoming: {
                image_id: imageId,
            },
        });
        uploadImage({
            fileObj: fileList[0],
            fileName: imageId,
            isProduct,
            contentType: `image/${fileList[0].name.split('.').pop()}`,
        } as UploadImageType);
    };

    return (
        <Button
            sx={{
                margin: "20px 0 0 0",
            }}
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
        >
            {(image_url ?? '').length > 0 ? 'Replace' : 'Add'} Image File
            <StyledHiddenInput type="file" onChange={handleImageChange} />
        </Button>
    );
}
