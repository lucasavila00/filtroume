export const openedFilter = async ({
  db,
  longId,
}: {
  db: FirebaseFirestore.Firestore;
  longId: string;
}): Promise<number> => {
  // faz a transação e pega o índice desse item

  const docRef = db.collection("filters").doc(longId);

  const views = await db.runTransaction<number>(
    async transaction => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error("Document does not exist!");
      }
      const data = doc.data();
      if (data == null) {
        throw new Error("Document does not exist!");
      }
      const newViews = (data.views ?? 0) + 1;
      transaction.update(docRef, { views: newViews });
      return newViews;
    },
  );

  return views;
};
