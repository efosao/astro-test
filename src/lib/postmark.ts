import * as postmark from "postmark";

const API_KEY = process.env.POSTMARK_API_KEY;

if (!API_KEY) throw new Error("Postmark API key is not defined");

export const client = API_KEY ? new postmark.ServerClient(API_KEY) : null;
