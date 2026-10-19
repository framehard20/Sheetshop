# Sheetshop

Paste the links of one or more Google Sheets full of product links and get a
shop from them on the spot. Products from every sheet and tab are merged,
duplicates removed, and sorted into categories (shoes, t-shirts, hoodies…).
Every product link (Kakobuy, CNFans, Hipobuy, Oopbuy, ACBuy, raw
Weidian/Taobao/1688 links…) is rebuilt for **your** agent with **your**
invite code.

## Use it

**The main site** (`/`) shows the shop you set up in the admin panel:

1. Open `/admin` and log in with the owner password (`SHEETSHOP_PASSWORD`).
   The login lasts 30 days on that browser; **Log out** ends it.
2. Under **Your site**, set the shop name, an optional logo (an https link to
   a picture), the Google Sheets (up to 10, each shared as **Anyone with the
   link → Viewer**) and your agent and invite code.
3. Press **Save and publish**. The sheets are read first, so a wrong or
   private link is refused with a message and nothing changes. Visitors see
   the new version within about a minute.

**Two-factor login.** The first time you log in, the panel asks you to turn
on two-factor: scan the QR code with Authy, Google Authenticator or Microsoft
Authenticator, type the 6-digit code, and save the 8 backup codes it shows.
From then on, logging in needs the password **and** the code (or one backup
code, each usable once). Nothing in the panel can be changed until it's on.
Turning it on ends every older login.

Lost the phone and the backup codes? Reset it: Vercel → Storage → your
Upstash database → **Open in Upstash** → **Data Browser** → delete the key
`sheetshop:totp`. The next login with the password sets it up again.

**Extra shop links**, further down the panel, make a separate shop on a long
signed link of its own (different sheets, name or code) without touching the
main site. Links made earlier keep working.

Until you save, the main site shows a starting setup (Masterspread, the first
sheet, Uidbuy with code UWSV3X; see `lib/store.js`).

Saving needs a database: in Vercel, open the project → **Storage** → **Create
Database** → **Upstash for Redis** (free) → **Connect**, then deploy again.
On your own computer the settings go to `data/site.json` instead.

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
- A language and currency window first, every time the page opens (English
  and US dollars pre-selected, or the visitor's last choice; Accept and done).
- Tapping a product opens its window, like flayfind's: photos, price, a
  "Buy on Uidbuy" button and the $800 + 40% sign-up box.
- With Uidbuy and a code: the "$800 + 40% off shipping" offer in the header and
  in a floating bar, a welcome pop-up (5 seconds after Accept in the language
  window, on every visit, waiting if another pop-up is open), and a
  sign-up step with the coupon on the first "Buy" pressed in each page load
  (a reload shows it again), which then takes them to the product.
- While a pop-up is open the page behind it doesn't move.

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

## Last-edit date and automatic updates

With a Google API key in the Vercel setting `SHEETSHOP_GOOGLE_KEY` (Google
Cloud → APIs & Services → enable **Google Drive API** → Credentials → API key),
the shop shows when its sheets were last edited ("3,906 products · updated
18 Oct 2026, 21:45") and checks every 2 minutes, and whenever the page comes
back into view, whether a sheet changed. If one did, it reads everything
again in the background, swaps it in without moving the page, and says "The
list has just been updated". Without a key there's no date, and a shop
catches up with edits within about 10 minutes, the next time it loads.

## Counting sign-ups (Umami)

Only clicks on the sign-up links are counted, never product clicks, with
Umami (no cookies, nothing that identifies a visitor). Each place has its
own event, and every event carries the shop's name and agent:

| Event | Where |
| --- | --- |
| `signup_top_bar` | the black bar at the very top of the page |
| `signup_under_title` | the "$800 + 40% off shipping" pill under the title |
| `signup_floating_bar` | the floating bar at the bottom |
| `signup_product_window` | the red button in a product's window |
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
- `lib/api.js` the endpoints (`/api/admin`, `/api/sign`, `/api/sheet`, `/api/tab`,
  `/api/img`, `/api/rates`), the password check, admin login and link signing
- `lib/store.js` where the main site's settings and the two-factor secret are
  saved (Upstash Redis, or local files in `data/`)
- `lib/totp.js` the 6-digit authenticator codes and backup codes
- `public/garment3d.js` + `public/models/sneaker.glb` the floating 3D sneakers
  beside the title (flayfind's, drawn with three.js 0.186 in `public/vendor/three`,
  MIT licence)
- `public/fonts/anton-*.woff2` the title font (Anton, SIL Open Font License)
- `public/vendor/qrcode.js` QR code drawing for the two-factor setup
  (qrcode-generator 1.4.4 by Kazuhiko Arase, MIT licence)
- `public/agents.js` reads any agent link down to platform + item ID, and
  builds the link for the chosen agent with the code
- `public/catalog.js` categories, brands and search
- `public/i18n.js` texts in seven languages, currencies
- `public/track.js` counting sign-up clicks with Umami
- `public/main.js` the admin panel and the shop page

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

## Put it online

Vercel: import this folder as a project (framework preset **Other**, no build
command). `public/` is served as the site and the files in `api/` become the
endpoints. Settings: `SHEETSHOP_PASSWORD` (required), the Upstash database
(for the admin panel), `SHEETSHOP_GOOGLE_KEY` and `SHEETSHOP_UMAMI_ID`
(optional).

Own domain: Vercel → the project → **Settings → Domains** → add it, then set
the DNS records Vercel shows at the place you bought the domain.
