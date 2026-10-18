# Sheetshop

Paste the links of one or more Google Sheets full of product links and get a
shop from them on the spot. Products from every sheet and tab are merged,
duplicates removed, and sorted into categories (shoes, t-shirts, hoodies…).
Every product link (Kakobuy, CNFans, Hipobuy, Oopbuy, ACBuy, raw
Weidian/Taobao/1688 links…) is rebuilt for **your** agent with **your**
invite code.

## Use it

1. Open the site and paste one or more sheet links (up to 10). Each sheet must
   be shared as **Anyone with the link → Viewer** (or "Published to the web").
2. Choose your agent and type your invite code. Add more agents if you want
   buyers to be able to switch; the first one is the default.
3. Optionally give the shop a name and a logo (an https link to a picture).
4. Type the owner password and press **Generate shop**, then copy the shop
   link and share it.

Nothing is stored anywhere: change a sheet and the shop changes with it
(within about 10 minutes, because answers are cached).

## What buyers get

- A home page with "Shop by category" tiles, category chips, a brand filter,
  and sorting by price (low → high, high → low) or name, in every category.
- Search that doesn't care about spacing or small typos: "nike air force",
  "nike airforce", "af1" and "jordna 4" all find what they should, and
  category names work in any language ("zapatillas" finds shoes).
- Seven languages (EN, ES, FR, DE, IT, PT, ZH) and 22 currencies, chosen from
  the visitor's browser and changeable in the 🌐 menu. Prices are converted
  with daily exchange rates and marked "≈" when converted.
- Light, dark or automatic appearance.
- Saved items (♥), photo galleries, and a share button.
- With Uidbuy and a code: the "$800 + 40% off shipping" offer in the header and
  in a floating bar, a welcome pop-up (once every 3 days, never again after
  someone clicks to sign up), and a sign-up step the first time someone taps
  a product in a visit, which then takes them to the product.

## Only the owner can make shops

- The builder needs `SHEETSHOP_PASSWORD`, which lives only in Vercel's
  settings (and in a local `.env` file for testing, never in git).
- A shop link looks like `/?c=<settings>.<signature>`. The settings (sheet,
  agents, codes, name) are readable, but the signature is made with the
  password, so anyone who edits them, for example to put in their own invite
  code, gets "This shop link isn't valid". The server also refuses to read any
  sheet that doesn't come from a signed link.
- **Changing the password cancels every shop link made before.** Make new
  ones afterwards.

Set or change the password on Vercel:

```bash
npx vercel env add SHEETSHOP_PASSWORD production
```

(or in the Vercel dashboard: Project → Settings → Environment Variables), then
deploy again.

## Counting sign-ups (Umami)

Only clicks on the sign-up links are counted, never product clicks, with
Umami (no cookies, nothing that identifies a visitor). Each place has its
own event, and every event carries the shop's name and agent:

| Event | Where |
| --- | --- |
| `signup_top_bar` | the "$800 + 40% off shipping" bar under the title |
| `signup_floating_bar` | the floating bar at the bottom |
| `signup_welcome_popup` | the $800 welcome pop-up |
| `signup_before_buy` | the sign-up step shown before the first product |
| `signup_before_buy_again` | "didn't open? open it again" in that step |

It is off until the Vercel setting `SHEETSHOP_UMAMI_ID` holds the Website ID
of a Sheetshop website in Umami (cloud.umami.is → Settings → Websites), then a
new deploy. It never runs on localhost.

## How it reads the sheets

It loads Google's HTML view of each tab (`/htmlview`), which, unlike CSV
exports, keeps the links hidden behind cell text and the pictures placed
inside cells. Every row with a product link becomes a product: the name,
price, picture and extra photos come from the other cells of that row. The
category comes from the product name, then its section and tab names.

Google's picture links expire (the `docs.google.com/sheets-images-rt` ones
within about 15 minutes), and docs.google.com refuses to show its pictures on
other sites. So every picture also has a lasting address (sheet, tab, cell),
and `/api/img` looks up its current link, reading the sheet again when the
link has died. Answers are cached for a week by Vercel.

- `lib/google.js` reads tabs and turns rows into products and prices
- `lib/api.js` the endpoints (`/api/sign`, `/api/sheet`, `/api/tab`, `/api/img`,
  `/api/rates`), the password check and link signing
- `public/agents.js` reads any agent link down to platform + item ID, and
  builds the link for the chosen agent with the code
- `public/catalog.js` categories, brands and search
- `public/i18n.js` texts in seven languages, currencies
- `public/track.js` counting sign-up clicks with Umami
- `public/main.js` the builder page and the shop page

### Known limits

- Pictures that **float over** the grid (Insert → Image → Over cells) are not
  in Google's HTML view; pictures **in** cells and `=IMAGE()` pictures are.
- Layouts with one product per row work best. Sheets that put several
  products side by side in one row only get the first one.
- Categories and brands come from words in the product names; a name like
  "U78" or "Item 12" ends up in "More".
- The $800 is the owner's Uidbuy offer for people who sign up through the
  link; the 40% off shipping is Uidbuy's own newcomer coupon.
- Weidian link formats were copied from real sheets for every agent, and
  Uidbuy's 1688 format was checked on uidbuy.com. Taobao and 1688 formats for
  the other agents follow the same pattern but were not checked one by one.
  Uidbuy shows Taobao items with a scrambled ID, so Uidbuy links to Taobao
  items (`/product/2/<id>`) may not open.

## Run it on your computer

Needs Node 18 or newer. No packages to install. Copy `.env.example` to `.env`
and put a password in it.

```bash
node server.js
```

Then open http://localhost:3210

## Put it online (free)

Vercel: import this folder as a project (framework preset **Other**, no build
command). `public/` is served as the site and the files in `api/` become the
endpoints.
