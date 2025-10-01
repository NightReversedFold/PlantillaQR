const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: "./credenciales.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default async (range: string, spreadsheetId: string) => {
    const sheets = google.sheets({ version: "v4", auth: auth });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    return res.data.values
}