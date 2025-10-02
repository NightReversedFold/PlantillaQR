import { google } from "googleapis";

import {GOOGLE_CREDENTIALS} from './config'

const credentials = JSON.parse(GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default async (range: string, spreadsheetId: string):Promise<string[][] | null | undefined> => {
    const sheets = google.sheets({ version: "v4", auth: auth });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    return res.data.values
}