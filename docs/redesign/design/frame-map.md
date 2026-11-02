# Figma frame map

File key `jDa51GQCd58Qv9YBteYeQZ` ("Portfolio-Copied", team Diář FISáka). Page `1060:30`. Link a node as `https://www.figma.com/design/jDa51GQCd58Qv9YBteYeQZ/?node-id=<id with - instead of :>`.

Read a frame with the Figma MCP: `get_design_context` (structure, layout, tokens) and `get_screenshot` (picture, max 1024 px on the long side, so screenshot sections, not whole tall pages). Section children are named (`Hero`, `Stats`, `Challenge`, `What I owned`, `Architecture`, `Gallery`, ...); call `get_metadata` on a frame to get their ids.

## Pages

| Page                           | Route                       | Desktop 1440 | Tablet 768  | Mobile 390  |
| ------------------------------ | --------------------------- | ------------ | ----------- | ----------- |
| Home                           | `/`                         | `1068:73`    | `1085:1643` | `1085:2165` |
| Case · Kreditožrouti           | `/projects/kreditozrouti`   | `1072:448`   | `1086:2331` | `1086:2515` |
| Case · DeepTrace               | `/projects/deeptrace`       | `1072:637`   | `1086:2692` | `1086:2874` |
| Case · IONT platform           | `/projects/iont_platform`   | `1072:824`   | `1086:3049` | `1086:3241` |
| Case · Intedat                 | `/projects/intedat`         | `2728:4943`  | `2728:5135` | `2728:5322` |
| Case · Scorecard               | `/projects/corac_scorecard` | `1079:1018`  | `1087:3414` | `1087:3593` |
| Case · Disenchantment          | `/projects/disenchantment`  | `1080:1214`  | `1089:3788` | `1089:3965` |
| Résumé                         | `/resume`                   | `1082:1076`  | `2703:3557` | `2703:4648` |
| Contact                        | `/contact`                  | `1083:1411`  | `2703:4156` | `2703:5239` |
| Contact · form error           | `/contact (invalid submit)` | `2758:4940`  | `2758:5324` | `2758:5690` |
| Contact · sent                 | `/contact (after submit)`   | `2758:5068`  | `2758:5445` | `2758:5802` |
| Blog                           | `/blog`                     | `1083:1527`  | `2703:4265` | `2703:5340` |
| Post · Traefik with Cloudflare | `/blog/<slug>`              | `1084:1511`  | `2703:4367` | `2703:5434` |
| Privacy policy                 | `/privacy`                  | `1084:1708`  | `2703:4516` | `2703:5575` |
| Terms of use                   | `/terms`                    | `1084:1829`  | `2703:4590` | `2703:5641` |
| 404                            | `any unknown path`          | `2758:5183`  | `2758:5556` | `2758:5904` |
| Menu · open                    | `mobile nav open`           | n/a          | n/a         | `2758:6029` |

Every `/cs/...` route renders the same frames with Czech copy (`content/copy.cs.json`).

## Sections on the canvas

| Section                                                                         | Node        |
| ------------------------------------------------------------------------------- | ----------- |
| Design system (components, tokens)                                              | `1065:18`   |
| Desktop · 1440                                                                  | `1068:72`   |
| Tablet · 768                                                                    | `1085:1641` |
| Mobile · 390                                                                    | `1085:1642` |
| Archive · not linked from the site (IONT charge, IONT admin, Pangolin, Noteful) | `2727:4946` |

## Components

| Component              | Node        | Properties and variants                                                                |
| ---------------------- | ----------- | -------------------------------------------------------------------------------------- |
| Button                 | `1065:27`   | Kind: Primary/Secondary · State: Default/Hover/Focus/Disabled · Label, Arrow(off), Dot |
| Link                   | `2756:4913` | State: Default/Hover/Focus/Current · Label                                             |
| Choice chip            | `2756:4967` | State: Default/Hover/Selected/Focus · Label                                            |
| Field                  | `2756:4954` | State: Default/Focus/Filled/Error/Disabled · Label, Value, Error                       |
| Tag                    | `1065:28`   | Label                                                                                  |
| Status                 | `1065:36`   | Tone: Live/Neutral · Label                                                             |
| Eyebrow                | `1065:37`   | Command                                                                                |
| Stat                   | `1065:40`   | Value, Label                                                                           |
| Pipeline Stage         | `1062:18`   | State: Default/Live · Label                                                            |
| Section Header         | `1065:57`   | Size: Desktop/Mobile · Title, Lead, Show lead (Command row hidden)                     |
| Nav                    | `1066:51`   | Size: Desktop/Mobile · Menu: Closed/Open                                               |
| Footer                 | `1066:141`  | Size: Desktop/Mobile                                                                   |
| Contact CTA            | `1066:126`  | Size: Desktop/Mobile                                                                   |
| Project Card           | `1067:98`   | Layout: Feature/Card · Meta, Title, Description, Link, Show badge                      |
| Testimonial            | `1067:99`   | Quote, Name, Role, Initials                                                            |
| Timeline Item          | `1067:164`  | State: Default/Live · Date, Title, Org, Summary, Bullet 1-3, Show bullets              |
| Screenshot placeholder | `2733:4800` | Label, Spec                                                                            |

Variables live in the local collection `Portfolio` (colors, radius, space); text styles are local styles. Both are exported in `tokens.json`.
