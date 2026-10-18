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
3. Press **Generate shop**, then copy the shop link and share it.

The shop link holds everything, for example

```
https://your-site/?s=<sheet id>&a=uidbuy:UWSV3X&a=kakobuy:abc&t=My%20finds
```

- `s` the sheet (its ID or full link)
- `a` agent and code, repeatable; the first is the default
- `t` shop name (optional; otherwise the sheet's name)

Nothing is stored anywhere: change the sheet and the shop changes with it
(within about 10 minutes, because answers are cached).

## How it reads the sheet

It loads Google's HTML view of the sheet (`/htmlview`), which, unlike CSV
exports, keeps the links hidden behind cell text and the pictures placed
inside cells. Each tab becomes a category. Every row with a product link
becomes a product: the name, price, picture and extra photos come from the
other cells of that row, and a one-cell title row above becomes a section.

- `lib/google.js` reads tabs and turns rows into products
- `public/agents.js` reads any agent link down to platform + item ID, and
  builds the link for the chosen agent with the code
- `lib/api.js` the JSON endpoints (`/api/sheet`, `/api/tab`, `/api/img`)
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

Needs Node 18 or newer. No packages to install.

```bash
node server.js
```

Then open http://localhost:3210

## Put it online (free)

Vercel: import this folder as a project (framework preset **Other**, no build
command). `public/` is served as the site and the files in `api/` become the
endpoints.
