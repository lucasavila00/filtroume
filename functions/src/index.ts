import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateShortId } from "./shortId";
import { uploadBase64 } from "./upload";
admin.initializeApp(functions.config().firebase);

// Shell
// filterUrls.get({ qs:{ id:"example-id" } })
export const filterUrls = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

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
        response.json({ error: "Filter not found by id" });
      }
    }
  },
);

// shell: createFilter.post().json({lut: "", image: ""})
export const createFilter = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    const _data = JSON.parse(request.body);

    const lutData = _data.lut;
    const imageData = _data.image;

    if (!lutData || !imageData) {
      response.send("0err0");
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

      response.send(shortId);
      // TODO: add to analytics that it was created
    }
  },
);
