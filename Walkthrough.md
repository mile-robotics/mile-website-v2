# Walkthrough — Connecting the backend

This guide explains how to wire the **contact form** (and, optionally, the hero
video / analytics / CMS) to a backend. The site is intentionally backend-free
out of the box — everything below is a drop-in.

---

## 1. The contact form

The form lives in [`app/sections/CTA.tsx`](app/sections/CTA.tsx). It POSTs to
`/api/contact` with this JSON body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "category": "Partner",
  "message": "Hello — interested in your work."
}
```

`category` is one of: `Sign Up`, `Partner`, `Invest`, `General Message`.

You have four good options to receive these. **Option D (Supabase)** is the
intended path if you’re deploying to Vercel with a Supabase backend — the
others remain useful as fallbacks or for quick prototyping.

---

### Option A — Resend + email forwarding (recommended for stealth phase)

Best for: a tiny team that just wants the email to land in their inbox.

1. **Install**
   ```bash
   npm install resend
   ```

2. **Create the route handler** at `app/api/contact/route.ts`:

   ```ts
   import { NextRequest, NextResponse } from "next/server";
   import { Resend } from "resend";

   const resend = new Resend(process.env.RESEND_API_KEY!);

   export async function POST(req: NextRequest) {
     try {
       const { name, email, category, message } = await req.json();

       if (!name || !email || !message) {
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
       }

       await resend.emails.send({
         from: "Mile Robotics <noreply@milelabs.co>",
         to: ["hello@milelabs.co"],
         replyTo: email,
         subject: `[${category}] New message from ${name}`,
         text: `From: ${name} <${email}>\nCategory: ${category}\n\n${message}`,
       });

       return NextResponse.json({ ok: true });
     } catch (err) {
       console.error(err);
       return NextResponse.json({ error: "Server error" }, { status: 500 });
     }
   }
   ```

3. **Add env var** in `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   ```

4. **Verify your domain** at [resend.com/domains](https://resend.com/domains)
   so `noreply@milelabs.co` is deliverable.

---

### Option B — Formspree (zero backend)

Best for: shipping today, no code needed.

1. Create a form at [formspree.io](https://formspree.io) → copy the endpoint
   (e.g. `https://formspree.io/f/abcd1234`).

2. Open [`app/sections/CTA.tsx`](app/sections/CTA.tsx) and replace the fetch URL:

   ```diff
   - const res = await fetch("/api/contact", {
   + const res = await fetch("https://formspree.io/f/abcd1234", {
   ```

   Formspree accepts the same JSON payload.

---

### Option D — Supabase (recommended once you’re on Vercel)

Best for: the eventual stack — Supabase + Vercel + custom domain. Submissions
live in a Postgres table you control, with Row Level Security, and the same
project can power "Ready to Play" auth later.

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
   Note your `Project URL` and `anon` and `service_role` keys.

2. **Create the table** in the SQL editor:

   ```sql
   create table public.contact_submissions (
     id          uuid primary key default gen_random_uuid(),
     name        text not null,
     email       text not null,
     category    text not null check (category in (
                   'Sign Up', 'Partner', 'Invest', 'General Message'
                 )),
     message     text not null,
     created_at  timestamptz not null default now(),
     ip          inet,
     user_agent  text
   );

   -- Lock the table down. Only the service role (server-side) can write.
   alter table public.contact_submissions enable row level security;

   -- No SELECT/INSERT for anon. The service_role key bypasses RLS,
   -- so the API route can still insert.
   ```

3. **Install the SDK**

   ```bash
   npm install @supabase/supabase-js
   ```

4. **Route handler** at `app/api/contact/route.ts`:

   ```ts
   import { NextRequest, NextResponse } from "next/server";
   import { createClient } from "@supabase/supabase-js";

   // Service-role client — server-only. NEVER expose this key to the browser.
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     { auth: { persistSession: false } }
   );

   export const runtime = "nodejs";

   export async function POST(req: NextRequest) {
     try {
       const { name, email, category, message } = await req.json();

       if (!name || !email || !message || !category) {
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
       }

       const ip =
         req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
       const userAgent = req.headers.get("user-agent") ?? null;

       const { error } = await supabase.from("contact_submissions").insert({
         name,
         email,
         category,
         message,
         ip,
         user_agent: userAgent,
       });

       if (error) {
         console.error(error);
         return NextResponse.json({ error: "Insert failed" }, { status: 500 });
       }

       return NextResponse.json({ ok: true });
     } catch (err) {
       console.error(err);
       return NextResponse.json({ error: "Server error" }, { status: 500 });
     }
   }
   ```

5. **Env vars** in `.env.local` (and in Vercel → Project → Settings → Environment Variables):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

   Only `NEXT_PUBLIC_*` keys ship to the browser. The service role key is
   server-only.

6. **Optional — pipe to email too.** Add a Supabase
   [Database Webhook](https://supabase.com/docs/guides/database/webhooks) on
   `contact_submissions` → `INSERT`, pointing at a Resend webhook or a
   serverless function. You get both an audit trail and an inbox.

7. **Optional — view in the dashboard.** The Supabase Table Editor doubles as a
   lightweight inbox. Add a `read` boolean column if you want to track triage.

---

### Option C — Notion as the inbox

Best for: keeping submissions next to the rest of the company knowledge base in
Notion.

1. **Install**
   ```bash
   npm install @notionhq/client
   ```

2. **Create a Notion database** with columns:
   `Name (title)`, `Email (email)`, `Category (select)`, `Message (rich text)`,
   `Received (date)`.

3. **Get a Notion integration** at
   [notion.so/profile/integrations](https://www.notion.so/profile/integrations)
   and share your database with it.

4. **Route handler** at `app/api/contact/route.ts`:

   ```ts
   import { NextRequest, NextResponse } from "next/server";
   import { Client } from "@notionhq/client";

   const notion = new Client({ auth: process.env.NOTION_TOKEN! });
   const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

   export async function POST(req: NextRequest) {
     try {
       const { name, email, category, message } = await req.json();

       await notion.pages.create({
         parent: { database_id: DATABASE_ID },
         properties: {
           Name: { title: [{ text: { content: name } }] },
           Email: { email },
           Category: { select: { name: category } },
           Message: { rich_text: [{ text: { content: message } }] },
           Received: { date: { start: new Date().toISOString() } },
         },
       });

       return NextResponse.json({ ok: true });
     } catch (err) {
       console.error(err);
       return NextResponse.json({ error: "Server error" }, { status: 500 });
     }
   }
   ```

5. **Env vars** in `.env.local`:
   ```
   NOTION_TOKEN=secret_xxx
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 2. The "Ready to Play" button

The CTA in the top right of the navbar (and on mobile) currently links to `#`.
There are two patterns depending on how you want sign-up to work.

### Simple — link to an external app subdomain

```diff
- <a href="#" className="...">Ready to Play</a>
+ <a href="https://app.milelabs.co/signup" className="...">Ready to Play</a>
```

Gate it behind an env flag if launch is staggered:

```tsx
const playUrl = process.env.NEXT_PUBLIC_PLAY_URL ?? "#";
```

### Recommended — Supabase Auth in the same Next.js app

If you’re already using Supabase for the contact form (Option D above), you
get sign-up / sign-in for free. This lets you keep `milelabs.co/signup` on the
marketing site without splitting domains.

1. **Install the SSR helper**

   ```bash
   npm install @supabase/ssr
   ```

2. **Create a typed browser client** at `lib/supabase/client.ts`:

   ```ts
   import { createBrowserClient } from "@supabase/ssr";

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

3. **Create a server client** at `lib/supabase/server.ts`:

   ```ts
   import { createServerClient } from "@supabase/ssr";
   import { cookies } from "next/headers";

   export function createClient() {
     const cookieStore = cookies();
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name) {
             return cookieStore.get(name)?.value;
           },
           set(name, value, options) {
             cookieStore.set({ name, value, ...options });
           },
           remove(name, options) {
             cookieStore.set({ name, value: "", ...options });
           },
         },
       }
     );
   }
   ```

4. **Build a magic-link sign-in page** at `app/signup/page.tsx`:

   ```tsx
   "use client";
   import { useState } from "react";
   import { createClient } from "@/lib/supabase/client";

   export default function SignUp() {
     const [email, setEmail] = useState("");
     const [sent, setSent] = useState(false);

     async function onSubmit(e: React.FormEvent) {
       e.preventDefault();
       const supabase = createClient();
       await supabase.auth.signInWithOtp({
         email,
         options: { emailRedirectTo: `${location.origin}/auth/callback` },
       });
       setSent(true);
     }

     if (sent) {
       return <p className="p-10">Check your email for the link.</p>;
     }

     return (
       <form onSubmit={onSubmit} className="p-10 space-y-4">
         <input
           type="email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           placeholder="you@company.com"
           className="border rounded px-3 py-2"
         />
         <button type="submit">Send magic link</button>
       </form>
     );
   }
   ```

5. **Add the auth callback** at `app/auth/callback/route.ts`:

   ```ts
   import { NextResponse } from "next/server";
   import { createClient } from "@/lib/supabase/server";

   export async function GET(request: Request) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get("code");
     if (code) {
       const supabase = createClient();
       await supabase.auth.exchangeCodeForSession(code);
     }
     return NextResponse.redirect(`${origin}/`);
   }
   ```

6. **Point the navbar at it.** Edit `app/components/Navbar.tsx`:

   ```diff
   - <a href="#" className="...">Ready to Play</a>
   + <a href="/signup" className="...">Ready to Play</a>
   ```

Auth providers (Google, GitHub, etc.) can be added later in the Supabase
dashboard without code changes — `signInWithOAuth` reads the same config.

---

## 3. The hero video banner

`app/sections/Hero.tsx` already contains a `<video>` element that loads
`/public/hero.mp4`. To wire it:

1. Drop the file as `public/hero.mp4` (H.264, 1080p, looping, **silent**).
2. Optional `public/hero.webm` for smaller file size on modern browsers — add a
   second `<source>` above the mp4 one.
3. Add a poster image at `public/hero-poster.jpg` and reference it via the
   `poster=` attribute.

The video is muted, autoplays inline, and is hidden behind an aurora overlay so
it doesn’t fight with the headline.

---

## 4. Analytics (optional)

The site has no analytics by default. Two privacy-friendly options:

- **Vercel Web Analytics** — `npm install @vercel/analytics`, then add
  `<Analytics />` inside `app/layout.tsx`.
- **Plausible** — drop the script tag in `app/layout.tsx` `<head>`.

Do **not** add Google Analytics without a cookie banner; the site doesn’t
currently include one.

---

## 5. Deploying

### Vercel + Supabase + custom domain (the intended stack)

1. **Push the repo to GitHub** (private is fine).

2. **Import into Vercel** — [vercel.com/new](https://vercel.com/new) → pick the
   repo. Framework preset is auto-detected as Next.js. No build command
   override needed.

3. **Add environment variables** (Vercel → Project → Settings → Environment
   Variables). Add the same keys to all three environments (Production,
   Preview, Development):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...     # server-only, do not mark as public
   ```

   Vercel only ships `NEXT_PUBLIC_*` vars to the browser. The service-role key
   stays server-side.

4. **Wire up `milelabs.co`** (Vercel → Project → Settings → Domains):
   - Add `milelabs.co` and `www.milelabs.co`.
   - Vercel shows you the DNS records to set at your registrar:
     - For the apex: an `A` record to Vercel’s IP (Vercel displays it), or
       set the registrar to Vercel nameservers.
     - For `www`: a `CNAME` to `cname.vercel-dns.com`.
   - SSL certificates are auto-provisioned within ~1 minute of DNS resolving.
   - Set `www.milelabs.co` to redirect to `milelabs.co` (or vice-versa — pick
     one as canonical).

5. **Tell Supabase about the domain.** Supabase → Authentication → URL
   Configuration:
   - **Site URL**: `https://milelabs.co`
   - **Redirect URLs**: add `https://milelabs.co/**` and
     `https://*.vercel.app/**` (so preview deploys also work).

6. **Optional — staging.** Every git branch becomes a preview deploy at
   `branch-name-milelabs.vercel.app` automatically. Use those for QA before
   merging to `main`.

### Local CLI deploy (alternative)

```bash
npm install -g vercel
vercel              # first run links the project
vercel --prod       # deploys to milelabs.co
```

### Cloudflare Pages (if you ever want to switch)

1. Connect the repo to Cloudflare Pages.
2. Build command: `npx @cloudflare/next-on-pages@1`
3. Output directory: `.vercel/output/static`
4. Set env vars in the Pages dashboard.

Note: Supabase works on either platform — only the deploy mechanics differ.

---

## 6. Updating content

Most copy lives directly in the section components. To add a new traction
update, edit the `updates` array in [`app/sections/Updates.tsx`](app/sections/Updates.tsx).
To add a new solution card, edit the `cards` array in
[`app/sections/Solution.tsx`](app/sections/Solution.tsx).

If you want this to be CMS-driven later (Notion, Sanity, Contentlayer) we can
extract these arrays into `lib/content.ts` and fetch from the CMS at build
time — no UI changes required.

---

## 7. Brand guardrails (please read before editing)

- **No Bold weights** of TT Firs Neue. Use 500 / 600.
- **No new logos.** Use the provided files in `public/logo/`.
- **No founders / team mentions.** Stealth.
- **Plain language first.** "Show", not "demonstrate". "Build", not
  "architect".

Full guidelines: see the Notion page or the bundled brand PDF.
