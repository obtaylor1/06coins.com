import { readFile, writeFile } from "node:fs/promises";

const builtIndexUrl = new URL("../dist/public/index.html", import.meta.url);
const rootIndexUrl = new URL("../index.html", import.meta.url);

const builtIndex = await readFile(builtIndexUrl, "utf8");
const hostgatorIndex = builtIndex
  .replaceAll('src="/assets/', 'src="/dist/public/assets/')
  .replaceAll('href="/assets/', 'href="/dist/public/assets/')
  .replaceAll('href="/favicon.png"', 'href="/dist/public/favicon.png"');

await writeFile(rootIndexUrl, hostgatorIndex);
