import { Hashids } from "./hashid";

const getPositionIndex = async ({
  db,
}: {
  db: FirebaseFirestore.Firestore;
}): Promise<number> => {
  // faz a transação e pega o índice desse item

  const docRef = db.collection("global").doc("stats");

  const count = await db.runTransaction<number>(
    async transaction => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error("Document does not exist!");
      }
      const data = doc.data();
      if (data == null) {
        throw new Error("Document does not exist!");
      }
      const newCount = data.count + 1;
      transaction.update(docRef, { count: newCount });
      return newCount;
    },
  );

  return count;
};
const HASH_ID_SALT = "89fd";
const hashNumberToText = (n: number): string => {
  // converte pra hash id
  const hashids = new Hashids(
    HASH_ID_SALT,
    0,
    "abcdefghijklmnopqrstuvwxyz",
  );
  // const hashids = new Hashids('', 0, 'abcdefghijklmnopqrstuvwxyz') // all lowercase

  return hashids.encode(n);
};

const VERSION_ONE_CODE = "h";
export const generateShortId = async ({
  db,
}: {
  db: FirebaseFirestore.Firestore;
}): Promise<string> => {
  const positionIndex = await getPositionIndex({ db });

  const hashedText = hashNumberToText(positionIndex);

  // adiciona o código da versão
  return VERSION_ONE_CODE + hashedText;
};
