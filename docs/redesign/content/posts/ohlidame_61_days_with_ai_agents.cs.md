Šedesát jeden dní po prvním commitu šlo Ohlídáme do produkce. Je to samoobslužný SaaS, který zkontroluje český e-shop proti pravidlům, jež musí dodržovat, a majiteli srozumitelně řekne, co chybí a jak to opravit.

Postavil jsem ho sám v tom smyslu, že o něm nikdo jiný nerozhoduje. Vybral jsem trh, nastavil cenu, napsal podmínky, navrhl architekturu a provozuju servery. Většinu kódu napsali AI agenti: 706 z prvních 872 commitů má Clauda jako spoluautora a OpenAI Codex k tomu dělal revize a audity.

Tady je, co fungovalo a co ne.

## Problém

České e-shopy se řídí dlouhým seznamem pravidel pro spotřebitele, data a produkty. Inspekce pokutuje ty, kdo je nedodrží, a kontrola od právníka stojí kolem 30 000 Kč, což většina malých e-shopů nezaplatí, dokud se něco nestane.

Velkou část toho seznamu jde ověřit z veřejných stránek. Je tam reklamační řád? Ukazuje sleva nejnižší cenu za posledních 30 dní? Říká objednávkové tlačítko to, co má podle zákona? To je crawler a engine pravidel, ne právní názor, takže kontrola může být zdarma a hlubší kontrola může stát 490 Kč.

Těžké není najít problémy. Těžké je žádný si nevymyslet. Jedno falešné obvinění a majitel přestane věřit všemu ostatnímu na stránce.

## Agenti potřebují to samé co tým

Agenti bez vedení selhávají tak, jak selhává nový tým: všichni jsou produktivní a nic do sebe nezapadá. Nespraví to lepší prompt. Spraví to, když se věci sepíšou.

- **Slovník.** `CONTEXT.md` definuje každý pojem: Scan, Finding, Claim, Evidence, a ke každému slova, kterým se vyhnout. Agent, který řekne „report“, když myslí „Scan“, zapíše chybu do dalšího souboru.
- **Záznamy rozhodnutí.** Je jich 33. Když otázku uzavřu, přestane být otázkou. Agent si přečte, proč má crawler žebřík, a příští týden nenavrhne ho odstranit.
- **Pravidla vedle kódu.** Každý balíček má vlastní `AGENTS.md` s lokálními invarianty a ničím jiným. Postupy v dashboardech patří do runbooků, protože instrukce, které agent načítá při každém běhu, stojí tokeny a zastarávají.
- **Předávky.** Session končí písemnou poznámkou: co je hotové, co ne a co si přečíst jako první. Další agent začíná z ní, ne z odhadu.

Nic z toho se netýká AI. Takhle byste vedli dobrý vývojářský tým a agenti jsou jen méně shovívaví, když to přeskočíte.

## Hranici ať hlídá stroj

Psaná pravidla se časem rozjedou. Proto je nejdůležitější pravidlo v repozitáři selhání buildu.

Ohlídáme má jeden crawler a deset modulů s pravidly. Modul je sada čistých funkcí: dostane získaný obsah stránky a vrátí Findings. Smí záviset jen na sdílených typech, nikdy na crawleru, API nebo HTTP knihovně. Dependency-cruiser to hlídá v CI a porušení shodí build.

Tenhle jeden šev udělal pro kvalitu práce agentů víc než cokoli jiného. Agent, který pracuje na pravidle pro ceny, nemůže rozbít crawler, protože na něj nedosáhne. Nepotřebuje nic vědět o frontách ani prohlížečích. Úkol se mu vejde do hlavy a revize se vejde do mojí.

## Laťka pro větu „máte to špatně“

Každá kontrola se řídí jedním pravidlem. FAIL vyžaduje jistotu: potvrzená správná stránka a povinný prvek jasně chybí. Odchylka, která může být legální, je ADVISORY, s faktem a bezpečnější formulací. Když kontrola potřebuje úsudek nebo se na stránku nedostala, je to INCONCLUSIVE s vysvětlením proč.

Každý Finding odkazuje na svůj právní zdroj. Produkt uvádí fakta o vlastní stránce e-shopu a nikdy nepředpovídá pokutu.

Druhé pravidlo vzniklo z otázky, kdo další může kontrolu spustit. Zkontrolovat jde jakýkoli veřejný e-shop, takže podrobný výsledek by byl seznam chyb konkurence. Podrobnosti proto patří jen ověřenému majiteli: odkaz na jedno kliknutí poslaný na adresu, kterou e-shop sám zveřejňuje, nebo důkaz v DNS či HTML. Všichni ostatní vidí jen to, kam kontrola dosáhla, a nic o výsledku. Nepřevzaté podrobnosti se po zhruba osmi dnech smažou.

## Infrastruktura: nudná schválně

První plán říkal Vercel, Supabase a Resend. Zahodil jsem ho dřív, než vznikl kód. Dlouhý crawl s headless prohlížečem, trvalá fronta a stav rate limitů jsou přesně to, co serverless umí nejhůř, a stejný stack už jsem provozoval pro Kreditožrouty.

Ohlídáme proto běží na jednom VPS, které si spravuju sám:

- Traefik na hraně, před ním CrowdSec a Cloudflare.
- Webová vrstva v Next.js, Express API s typovaným SQL přes Kysely a MySQL.
- Scraper workery na BullMQ a Redisu, oddělené od API. Stahují a vrací důkazy přes autentizovaný ingest s omezenou velikostí. Na databázi nikdy nesáhnou.
- Prometheus, Loki, Alloy a Grafana, Alertmanager posílá do Discordu a Umami dává analytiku šetrnou k soukromí.

Vydání jsou neměnné snapshoty s `current` a `previous`, takže rollback je změna ukazatele. Zálohy mají nacvičenou obnovu. Čistý server jde postavit jen z repozitáře a jeho runbooků. Pro zakladatele bez týmu je to důležitější než škálování: když se něco rozbije, chci jeden stroj, kterému rozumím.

## Testy jsou smlouva

Když kód píšou agenti, testy jsou způsob, jak vím, co kód dělá. Testovacího kódu je víc než produktového, zhruba 52 000 řádků proti 47 000.

Nejlepší investice byl smyšlený Testovací e-shop se 64 variantami, z nichž každá nese konkrétní chybu nebo hraniční případ. Nic neprodává a nenese identitu žádného skutečného e-shopu. Konformní sada proti němu ověřuje každé pravidlo a Playwright projíždí celou cestu proti produkčním obrazům: kontrola, ověření, platba, vrácení peněz.

## Co se nepovedlo

**Nejdřív jsem prodával špatnou věc.** Placená kontrola původně nabízela větší hloubku: 70 produktů místo 20. Když jsem se na to podíval poctivě, další verdikty majitel nekupuje. Chce, aby problém zmizel. Přepsal jsem ji proto kolem opravy, s připravenými formulacemi a podepsaným protokolem, a zapsal jsem proč.

**Rychlost přesune úzké hrdlo na vás.** Agenti píšou rychleji, než stíhám číst. Fronta, kterou teď řídím, je revize, a typická chyba je schválit něco, čemu jsem nerozuměl. Držím změny malé a nechávám stroj odmítnout, co může, ještě než to uvidím.

**Ne každé selhání je v kódu.** Moje end-to-end brána pořád padala na timeoutech. Každý padající test sám prošel. Příčinou byl můj hostitel s Windows, ne produkt, a dokázalo to až měření. Agent bude klidně celou noc záplatovat příznaky, takže zastavit se a zeptat, co se vlastně děje, musí pořád člověk.

## Co bych si nechal

Než začnete škálovat výstup, sepište jazyk, rozhodnutí a hranice. To důležité ať vynucuje stroj. Berte agenty jako velmi rychlý tým bez paměti.

Vlastnit všechno pořád znamená za všechno odpovídat. Kód napsali agenti, ale podmínky, cena, produkční incident a důvěra prvního zákazníka jsou moje. Tahle část automatizovaná není a ani nechci, aby byla.

Ohlídáme běží na [ohlidame.cz](https://ohlidame.cz). [Případová studie](https://jankominek.com/cs/projects/ohlidame) ukazuje obrazovky a architekturu.
