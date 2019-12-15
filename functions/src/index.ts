import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// Shell
// filterUrls.get({ qs:{ id:"example-id" } })
export const filterUrls = functions.https.onRequest(
  async (request, response) => {
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
