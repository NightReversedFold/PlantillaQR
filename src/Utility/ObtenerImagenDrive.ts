import { google, drive_v3 } from "googleapis";

import { GOOGLE_CREDENTIALS } from './config'

const credentials = JSON.parse(GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
});

const drive = google.drive({ version: "v3", auth });

export default async (nombre: string, carpetaId: string): Promise<[{
    id: string
    name: string
    mimeType: string
}, drive_v3.Drive]> => {
    const res = await drive.files.list({
        q: `name='${nombre}' and '${carpetaId}' in parents`,
        fields: "files(id, name, mimeType)",
    })

    console.log(res)

    const file = res.data.files?.[0]
    if (!file) return null

    return [{
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
    }, drive]
}