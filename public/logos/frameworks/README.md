# Framework publisher logos

Official source assets downloaded on 2026-10-07. These local files identify the
publishers of the references in `PolicyAlignment`; they do not indicate a
partnership or endorsement. Original artwork and proportions are preserved.
The cards use white backgrounds to keep each mark legible in both themes.

| File | Official source |
| --- | --- |
| `un.svg` | [UN Sustainable Development header](https://sdgs.un.org/themes/custom/porto/assets/images/logo-en.svg) |
| `who.svg` | [WHO header logo](https://www.who.int/ResourcePackages/WHO/assets/dist/images/logos/en/h-logo-blue.svg) |
| `world-bank.svg` | [World Bank header logo](https://www.worldbank.org/content/dam/wbr/logo/logo-wb-header-en.svg) |
| `unep.svg` | [UNEP logo](https://www.unep.org/themes/custom/UNEP_3Spot/img/full_unep_logo_en.svg) |
| `ipcc.svg` | [IPCC homepage](https://www.ipcc.ch/), original inline SVG in `#nav-primary-logo` |
| `egypt-environment.png` | [Egyptian Environmental Affairs Agency footer](https://www.eeaa.gov.eg/assets/images/logo/logo-footer.png) |
| `sdgs.png` | [SDG wheel hosted by UNEP](https://www.unep.org/themes/custom/UNEP_3Spot/img/SDG_Wheel_Transparent_WEB.png) |

The Egyptian agency mark is shared by the two Egyptian policy references.
The SDG wheel contains no UN emblem. See the [UN communications materials](https://www.un.org/sustainabledevelopment/news/communications-material/)
for its source guidance. Marks remain the property of their respective
organizations; this repository's code license does not relicense their logos.

`components/strategy/framework-logos.ts` maps each framework badge to its asset,
accessible organization name, dimensions, and original source URL. Files are
served locally, without external logo requests.
