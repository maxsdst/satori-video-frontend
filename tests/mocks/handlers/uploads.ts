import { HttpHandler } from "msw";
import { db } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.upload, BASE_URL + "/videos/uploads");

const handlers: HttpHandler[] = [generator.list("limit_offset")];

export default handlers;
