// Pulls the dither shader and logo paths out of the showcase site so the
// cards render with exactly the same field math and letterforms.
import { readFileSync, writeFileSync } from "node:fs";
import QRCode from "qrcode";

const SHOW = "../constant-labs-showcase/src/components";
const field = readFileSync(`${SHOW}/field/DitherField.tsx`, "utf8");

const literal = (name) => {
  const start = field.indexOf(`const ${name} = \``) + `const ${name} = \``.length;
  return field.slice(start, field.indexOf("`;", start));
};
const bodiesSrc = field.slice(field.indexOf("const SOURCE_BODIES"), field.indexOf("\n};", field.indexOf("const SOURCE_BODIES")) + 3);
const bodies = new Function(`return ${bodiesSrc.slice(bodiesSrc.indexOf("{"))}`)();
const srcMapSrc = field.slice(field.indexOf("const SOURCES: Record"), field.indexOf("};", field.indexOf("const SOURCES: Record")) + 2);
const sources = new Function(`return ${srcMapSrc.slice(srcMapSrc.indexOf("{"))}`)();

const paths = readFileSync(`${SHOW}/constantLabsPaths.ts`, "utf8");
const pathExport = (name) => {
  const m = paths.match(new RegExp(`export const ${name}(?::[^=]+)? = ([\\s\\S]*?);\\n`));
  return new Function(`return ${m[1]}`)();
};

const qr = await QRCode.toString("https://constantlabs.ai", { type: "svg", errorCorrectionLevel: "M", margin: 0 });

const out = {
  head: literal("SHADER_HEAD"),
  fallback: literal("SHADER_FALLBACK"),
  tail: literal("SHADER_TAIL"),
  bodies,
  sources,
  logo: {
    viewBox: pathExport("LOCKUP_VIEWBOX"),
    english: pathExport("LOCKUP_ENGLISH"),
    sliver: pathExport("LOCKUP_SLIVER"),
    arabic: pathExport("LOCKUP_ARABIC_RTL"),
  },
  qr,
};
writeFileSync("assets/data.js", `window.CL = ${JSON.stringify(out)};\n`);
console.log("sources", Object.keys(sources).length, "bodies", Object.keys(bodies).length, "arabic", out.logo.arabic.length);
