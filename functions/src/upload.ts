import * as stream from "stream";

import { Bucket } from "@google-cloud/storage";

export const uploadBase64 = async ({
  bucket,
  type,
  shortId,
  data,
}: {
  data: string;
  shortId: string;
  type: string;
  bucket: Bucket;
}): Promise<string> => {
  const destination = `v1/${type}/${shortId}.png`;
  const metadata = { contentType: "image/png" };
  return new Promise<string>((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(
      Buffer.from(
        data.replace("data:image/png;base64", ""),
        "base64",
      ),
    );

    // Create a reference to the new image file
    const file = bucket.file(destination);

    bufferStream
      .pipe(
        file.createWriteStream({
          metadata,
        }),
      )
      .on("error", reject)
      .on("finish", () => {
        // The file upload is complete.

        file.getSignedUrl(
          {
            action: "read",
            expires: "03-01-2500",
          },
          (error: any, url: any) => {
            if (error) {
              reject(error);
            }
            resolve(url);
          },
        );
      });
  });
};
