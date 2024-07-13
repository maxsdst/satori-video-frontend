import { HttpHandler } from "msw";
import { db } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.video, BASE_URL + "/videos/videos");

const handlers: HttpHandler[] = [generator.retrieve()];

export default handlers;
