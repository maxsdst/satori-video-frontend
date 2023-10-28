import Upload from "../entities/Upload";
import ApiClient from "./ApiClient";

const uploadService = new ApiClient<Upload>("/videos/uploads/");

const getAll = uploadService.getAll;

uploadService.getAll = (...args) =>
    getAll(...args).then((data) => {
        data.results = data.results.map((upload) => {
            upload.creation_date = new Date(upload.creation_date);
            return upload;
        });
        return data;
    });

const get = uploadService.get;

uploadService.get = (...args) =>
    get(...args).then((upload) => {
        upload.creation_date = new Date(upload.creation_date);
        return upload;
    });

export default uploadService;
