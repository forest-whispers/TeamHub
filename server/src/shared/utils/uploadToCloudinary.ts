import cloudinary from "../../config/cloudinary.js";

export async function uploadFileToCloudinary(
    file: Express.Multer.File,
    workspaceId: string,
) {

    return new Promise<any>((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `teamhub/${workspaceId}`,
                resource_type: "auto",
                use_filename: false,
                unique_filename: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            },
        );

        stream.end(file.buffer);
    });
}

export async function deleteFileFromCloudinary(
    publicId: string,
) {
    return cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: "auto",
        },
    );
}