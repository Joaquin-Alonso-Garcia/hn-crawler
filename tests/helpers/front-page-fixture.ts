import { readFileSync } from "node:fs";

export const FRONT_PAGE_HTML = readFileSync(
  new URL("../fixtures/hn-front-page.html", import.meta.url),
  "utf8",
);
