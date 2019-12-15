import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as c from "cors";
import { generateShortId } from "./shortId";
import { uploadBase64 } from "./upload";

admin.initializeApp();

// CORS Express middleware to enable CORS Requests.
const cors = c({
  origin: true,
});
// Shell
// filterUrls.get({ qs:{ id:"example-id" } })
export const filterUrls = functions.https.onRequest(
  (request, response) => {
    return cors(
      request,
      response,
      async () => {
        const id = request.query.id;

        if (id == null) {
          response.json({ error: "Invalid filter id" });
        } else {
          const db = admin.firestore();
          const res = await db
            .collection("filters")
            .where("shortId", "==", id)
            .get();
          let foundValue = false;
          res.forEach(doc => {
            if (foundValue) {
              return;
            }
            // TODO: add to analytics that it was shown
            foundValue = true;
            const data = doc.data();
            const image = data.imageUrl;
            const lut = data.lutUrl;
            response.json({ image, lut });
          });

          if (!foundValue) {
            response.json({
              error: "Filter not found by id",
            });
          }
        }
      }, // end cors cb
    ); // end cors
  }, // end handler cn
); // end handler

// shell: createFilter.post().json({lut: "", image: ""})
export const createFilter = functions.https.onRequest(
  (request, response) => {
    return cors(
      request,
      response,
      async () => {
        const lutData = request.body.lut;
        const imageData = request.body.image;

        if (!lutData || !imageData) {
          response.json({ error: "invalid image data" });
        } else {
          // tem as imagens
          const db = admin.firestore();
          const bucket = admin.storage().bucket();
          const shortId = await generateShortId({ db });

          const lutUrl = await uploadBase64({
            data: lutData,
            shortId,
            type: "lut",
            bucket,
          });
          const imageUrl = await uploadBase64({
            data: imageData,
            shortId,
            type: "image",
            bucket,
          });

          await db.collection("filters").add({
            shortId,
            lutUrl,
            imageUrl,
            views: 0,
          });

          response.json({ shortId });
          // TODO: add to analytics that it was created
        }
      }, // end cors cb
    ); // end cors
  }, // end handler cn
); // end handler
