# Sheetshop

Paste the link of any Google Sheet full of product links and get a shop page
from it on the spot. Every product link (Kakobuy, CNFans, Hipobuy, Oopbuy,
ACBuy, raw Weidian/Taobao/1688 links…) is rebuilt for **your** agent with
**your** invite code.

## Use it

1. Open the site and paste the sheet link. The sheet must be shared as
   **Anyone with the link → Viewer** (or "Published to the web").
2. Choose your agent and type your invite code. Add more agents if you want
   buyers to be able to switch; the first one is the default.
3. Type the owner password and press **Generate shop**, then copy the shop
   link and share it.

Nothing is stored anywhere: change the sheet and the shop changes with it
(within about 10 minutes, because answers are cached).

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

## How it reads the sheet

It loads Google's HTML view of the sheet (`/htmlview`), which, unlike CSV
exports, keeps the links hidden behind cell text and the pictures placed
inside cells. Each tab becomes a category. Every row with a product link
becomes a product: the name, price, picture and extra photos come from the
other cells of that row, and a one-cell title row above becomes a section.

- `lib/google.js` reads tabs and turns rows into products
- `public/agents.js` reads any agent link down to platform + item ID, and
  builds the link for the chosen agent with the code
- `lib/api.js` the endpoints (`/api/sign`, `/api/sheet`, `/api/tab`, `/api/img`)
  and the password check and link signing
- `public/main.js` the builder page and the shop page

### Known limits

- Pictures that **float over** the grid (Insert → Image → Over cells) are not
  in Google's HTML view; pictures **in** cells and `=IMAGE()` pictures are.
- Layouts with one product per row work best. Sheets that put several
  products side by side in one row only get the first one.
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
