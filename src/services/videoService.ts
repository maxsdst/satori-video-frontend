import Video from "../entities/Video";
import ApiClient from "./ApiClient";

const videoService = new ApiClient<Video>("/videos/videos/");

const getAll = videoService.getAll;

videoService.getAll = (...args) =>
    getAll(...args).then((data) => {
        data.results = data.results.map((video) => {
            video.upload_date = new Date(video.upload_date);
            return video;
        });
        return data;
    });

const get = videoService.get;

videoService.get = (...args) =>
    get(...args).then((video) => {
        video.upload_date = new Date(video.upload_date);
        return video;
    });

export default videoService;
