export const MAX_DECK_SIZE = 20;

export function normalizeQuestion(question: string) {
  return question
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(
      /[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\u060c\u061b\u061f\u2000-\u206f\u3000-\u303f]+/g,
      " ",
    )
    .trim();
}
