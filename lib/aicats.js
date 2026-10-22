// Claude sorts the products the category rules can't place ("other"): it
// looks at each product's picture and name and picks one of the shop's
// categories. Each product is asked about once; the answers are stored
// (store.js → sheetshop:aicat) and the shop uses them from then on, so a
// reload or a new day costs nothing. Needs ANTHROPIC_API_KEY.
import Anthropic from "@anthropic-ai/sdk";
import { betaJSONSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { CATEGORY_ORDER } from "../public/catalog.js";

const MODEL = "claude-opus-5-5";
export const BATCH = 20;

export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY;

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { n: { type: "integer" }, category: { type: "string", enum: CATEGORY_ORDER } },
        required: ["n", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const PROMPT = `You sort products of an online clothing catalogue into its categories. For each numbered product you get its picture and its name (names are often vague or misspelled - trust the picture).

Categories: shoes, tshirts, hoodies (also sweatshirts and zip-ups), jackets (also coats, puffers, gilets), pants (also jeans, joggers), shorts, sweaters (knitwear), shirts (button-up, polos), sets (matching outfits, tracksuits), jerseys (football / basketball team shirts and kits), bags, hats, accessories (belts, wallets, glasses, socks, underwear, phone cases, small items worn or carried), jewelry (watches, necklaces, rings, bracelets), perfume, electronics, home (decor, rugs, figures, toys, cups, candles), other (only if none fits).

Answer one category for every product number.`;

/**
 * items: [{ n, name, picture: { data: base64, type: "image/jpeg" } | null }]
 * -> { [n]: category }
 */
export async function classify(items) {
  const client = new Anthropic();
  const content = [];
  for (const it of items) {
    content.push({ type: "text", text: `Product ${it.n}: ${it.name}` });
    if (it.picture) content.push({ type: "image", source: { type: "base64", media_type: it.picture.type, data: it.picture.data } });
  }
  content.push({ type: "text", text: PROMPT });
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaJSONSchemaOutputFormat(SCHEMA) },
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) return {};
  const out = {};
  for (const r of res.parsed_output.items) if (CATEGORY_ORDER.includes(r.category)) out[r.n] = r.category;
  return out;
}
