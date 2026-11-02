Sixty-one days after the first commit, Ohlídáme went to production. It is a self-serve SaaS that checks a Czech e-shop against the rules it has to follow and tells the owner, in plain Czech, what is missing and how to fix it.

I built it alone, in the sense that nobody else makes a decision about it. I chose the market, set the price, wrote the terms, designed the architecture and run the servers. Most of the code was written by AI agents: 706 of the first 872 commits carry a Claude co-author line, and OpenAI Codex took on reviews and audits next to it.

This is what made that work, and what did not.

## The problem

Czech e-shops answer to a long list of consumer, data and product rules. The inspection authority fines the ones that get it wrong, and a review by a lawyer costs around 30,000 CZK, which most small shops will not pay until something goes wrong.

Much of that list can be checked from public pages. Is there a complaints policy? Does the discount show the lowest price from the last 30 days? Does the order button say what the law wants it to say? That is a crawler and a rule engine, not a legal opinion, so the scan can be free and the deeper check can cost 490 CZK.

The hard part is not finding problems. The hard part is never inventing one. One false accusation and an owner stops trusting everything else on the page.

## Agents need the same thing a team needs

Left alone, agents fail the way a new team fails: everyone is productive and nothing fits together. The fix is not a better prompt. It is writing things down.

- **A glossary.** `CONTEXT.md` defines every term: Scan, Finding, Claim, Evidence, each with the words to avoid. An agent that says "report" when it means "Scan" writes a bug into the next file.
- **Decision records.** There are 33 of them. When I settle a question, it stops being a question. An agent reads why the crawler has a ladder, and it does not propose removing it next week.
- **Rules next to the code.** Every package has its own `AGENTS.md` with local invariants and nothing else. Dashboard steps live in runbooks, because instructions an agent loads on every run cost tokens and go stale.
- **Handoffs.** A session ends with a written note: what is done, what is not, what to read first. The next agent starts from that, not from a guess.

None of this is about AI. It is how you would run a good engineering team, and agents are simply less forgiving if you skip it.

## Let the machine enforce the boundary

Written rules drift. So the most important rule in the repository is a build failure.

Ohlídáme has one crawler and ten regulation modules. A module is a set of pure functions: it receives acquired page content and returns Findings. It may depend only on the shared types, never on the crawler, the API or an HTTP library. Dependency-cruiser checks that in CI, and a violation fails the build.

That one seam did more for agent quality than anything else. An agent working on a pricing rule cannot break the crawler, because it cannot reach it. It needs no context about queues or browsers. The task fits in its head, and the review fits in mine.

## A bar for saying "you are wrong"

Every check obeys one rule. A FAIL needs certainty: the right page was confirmed and the required element is clearly absent. A deviation that may still be lawful is an ADVISORY, with the fact and the safer wording. If the check needs judgment, or the page could not be reached, it says INCONCLUSIVE and explains why.

Every Finding links to its legal source. The product states facts about the shop’s own page and never predicts a fine.

The second rule came from thinking about who else might run a scan. Anyone can scan any public shop, so a detailed report would be a list of a competitor’s failures. Detail therefore belongs only to a verified owner: a one-click link sent to an address the shop itself publishes, or a proof in its DNS or HTML. Everyone else sees how far the scan reached and nothing about the result. Unclaimed detail is deleted after about eight days.

## Infrastructure: boring on purpose

The first plan said Vercel, Supabase and Resend. I threw it out before writing code. A long crawl with a headless browser, a durable queue and rate-limit state is exactly what serverless is worst at, and I already ran that stack for Kreditožrouti.

So Ohlídáme runs on one self-hosted VPS:

- Traefik at the edge, with CrowdSec and Cloudflare in front of it.
- A Next.js web tier, an Express API with typed SQL through Kysely, and MySQL.
- Scraper workers on BullMQ and Redis, separated from the API. They fetch and hand back evidence through an authenticated, size-limited ingest. They never touch the database.
- Prometheus, Loki, Alloy and Grafana, with Alertmanager sending to Discord and Umami for privacy-friendly analytics.

Releases are immutable snapshots with `current` and `previous`, so a rollback is a pointer change. Backups have a restore drill. A clean server can be rebuilt from the repository and its runbooks alone. For a solo founder that matters more than scale: when something breaks, I want one machine I understand.

## Tests are the contract

If agents write the code, tests are how I know what the code does. There is more test code than product code, roughly 52,000 lines against 47,000.

The best investment was a fictional Test shop with 64 variants, each one hosting a specific failure or an edge case. It sells nothing, and it holds no real shop’s identity. A conformance suite checks every rule against it, and Playwright drives the full journey against the production images: scan, claim, payment, refund.

## What did not go well

**I sold the wrong thing first.** The paid check originally offered more depth: 70 products instead of 20. Looking at it honestly, more verdicts is not what an owner buys. They want the problem gone. So I rewrote it around the fix, with ready-to-use wording and a signed protocol, and recorded why.

**Throughput moves the bottleneck to you.** Agents write faster than I can read. The queue I now manage is review, and the failure mode is approving what I did not understand. I keep changes small and let the machine reject what it can before I see it.

**Not every failure is the code.** My end-to-end gate kept failing on timeouts. Each failing test passed alone. The cause was my Windows host, not the product, and only measuring proved it. An agent will happily patch symptoms all night, so it still takes a person to stop and ask what is actually going on.

## What I would keep

Write down the language, the decisions and the boundaries before you scale the output. Make the machine enforce what matters. Treat agents as a very fast team that has no memory.

Owning everything still means answering for everything. The agents wrote the code, but the terms, the price, the production incident and the trust of the first customer are mine. That part has not been automated, and I would not want it to be.

Ohlídáme is live at [ohlidame.cz](https://ohlidame.cz). The [case study](https://jankominek.com/projects/ohlidame) has the screens and the architecture.
