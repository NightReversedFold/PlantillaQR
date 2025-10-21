import { google } from "googleapis";

import { GOOGLE_CREDENTIALS } from './config'

const credentials = JSON.parse(GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default async (range: string, spreadsheetId: string, valores: string[]) => {
    const sheets = google.sheets({ version: "v4", auth: auth });

    const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        insertDataOption: "INSERT_ROWS",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [valores]
        }
    });
}