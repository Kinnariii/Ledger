# Ledger AI Employee Workspace — Design System

> **Source:** Stitch Project `projects/7125451085636299416`
> **Design System Name:** Bureau Documental
> **Color Mode:** Light · **Device:** Desktop · **Roundness:** 4 px
> **Last Updated:** 2026-07-01

---

## Brand & Style

The design system is built on the narrative of the **"AI Employee's Paper Trail."** It rejects the ephemeral nature of typical AI interfaces—glowing gradients and floating blurs—in favor of the permanent, the tactile, and the authoritative. The aesthetic is inspired by the physical artifacts of a high-functioning executive office: index cards, fountain pen ink, heavy bond paper, and carbon copies.

The design style is a blend of **Tactile Minimalism** and **Functional Brutalism**. It prioritizes high-contrast legibility and structural rigidity. Every element on the screen should feel like it was printed or stamped onto a physical surface. There are no shadows; depth is instead communicated through layering, hairline borders, and subtle color shifts between paper stocks. The emotional response is one of reliability, clinical precision, and archival permanence.

---

## Color Palette

### Core Surface Colors

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `surface`                  | `#fff8f3`   | Primary canvas / background (warm paper)     |
| `surface-dim`              | `#e2d9cf`   | Dimmed surface variant                       |
| `surface-bright`           | `#fff8f3`   | Bright surface variant                       |
| `surface-container-lowest` | `#ffffff`   | Lowest-emphasis container                    |
| `surface-container-low`    | `#fcf2e8`   | Low-emphasis container                       |
| `surface-container`        | `#f6ece2`   | Default container (card background)          |
| `surface-container-high`   | `#f0e7dd`   | High-emphasis container                      |
| `surface-container-highest`| `#eae1d7`   | Highest-emphasis container                   |
| `surface-variant`          | `#eae1d7`   | Surface variant for subtle differentiation   |
| `surface-tint`             | `#455f87`   | Tint overlay for interactive surfaces        |
| `on-surface`               | `#1f1b15`   | Primary text on surfaces (warm ink)          |
| `on-surface-variant`       | `#43474e`   | Secondary text on surfaces                   |
| `background`               | `#fff8f3`   | Page background                              |
| `on-background`            | `#1f1b15`   | Text on background                           |

### Primary (Stamp Blue — Fountain Pen Ink)

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `primary`                  | `#022448`   | Primary actions, key interactive elements    |
| `on-primary`               | `#ffffff`   | Text/icons on primary                        |
| `primary-container`        | `#1e3a5f`   | Primary container (deep blue)               |
| `on-primary-container`     | `#8aa4cf`   | Text on primary container                    |
| `inverse-primary`          | `#adc8f5`   | Inverse primary for dark contexts            |
| `primary-fixed`            | `#d5e3ff`   | Fixed primary (light)                        |
| `primary-fixed-dim`        | `#adc8f5`   | Dimmed fixed primary                         |
| `on-primary-fixed`         | `#001c3b`   | Text on fixed primary                        |
| `on-primary-fixed-variant` | `#2d486d`   | Text on fixed primary variant                |

### Secondary (Ledger Green — Success / Growth)

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `secondary`                | `#2d694d`   | Secondary actions, success states            |
| `on-secondary`             | `#ffffff`   | Text on secondary                            |
| `secondary-container`      | `#aeedca`   | Secondary container (mint green)             |
| `on-secondary-container`   | `#326e51`   | Text on secondary container                  |
| `secondary-fixed`          | `#b1f0cd`   | Fixed secondary                              |
| `secondary-fixed-dim`      | `#96d4b2`   | Dimmed fixed secondary                       |
| `on-secondary-fixed`       | `#002113`   | Text on fixed secondary                      |
| `on-secondary-fixed-variant`| `#105137`  | Text on fixed secondary variant              |

### Tertiary (Amber — Warning / Accent)

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `tertiary`                 | `#391d00`   | Tertiary accent (deep amber)                 |
| `on-tertiary`              | `#ffffff`   | Text on tertiary                             |
| `tertiary-container`       | `#583000`   | Tertiary container                           |
| `on-tertiary-container`    | `#dc934a`   | Text on tertiary container                   |
| `tertiary-fixed`           | `#ffdcbf`   | Fixed tertiary                               |
| `tertiary-fixed-dim`       | `#ffb874`   | Dimmed fixed tertiary                        |
| `on-tertiary-fixed`        | `#2d1600`   | Text on fixed tertiary                       |
| `on-tertiary-fixed-variant`| `#6a3b00`   | Text on fixed tertiary variant               |

### Error

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `error`                    | `#ba1a1a`   | Error states, destructive actions            |
| `on-error`                 | `#ffffff`   | Text on error                                |
| `error-container`          | `#ffdad6`   | Error container background                   |
| `on-error-container`       | `#93000a`   | Text on error container                      |

### Outline & Inverse

| Token                      | Hex         | Usage                                        |
| -------------------------- | ----------- | -------------------------------------------- |
| `outline`                  | `#74777f`   | Borders, dividers                            |
| `outline-variant`          | `#c4c6cf`   | Subtle borders, hairlines                    |
| `inverse-surface`          | `#343029`   | Dark surface for inverse contexts            |
| `inverse-on-surface`       | `#f9efe5`   | Text on inverse surface                      |

### Override Colors (Design System Anchors)

| Role       | Hex         |
| ---------- | ----------- |
| Primary    | `#1e3a5f`   |
| Secondary  | `#2f6b4f`   |
| Tertiary   | `#b8752e`   |
| Neutral    | `#211d17`   |

---

## Typography

Three-tiered hierarchy: **Serif → Sans → Mono**

| Token              | Family          | Size   | Weight | Line Height | Letter Spacing | Usage                                  |
| ------------------ | --------------- | ------ | ------ | ----------- | -------------- | -------------------------------------- |
| `display-lg`       | Newsreader      | 48 px  | 600    | 1.1         | −0.02 em       | Hero headlines, page titles            |
| `display-lg-mobile`| Newsreader      | 36 px  | 600    | 1.1         | —              | Mobile hero headlines                  |
| `headline-md`      | Newsreader      | 32 px  | 500    | 1.2         | —              | Section headings                       |
| `headline-sm`      | Newsreader      | 24 px  | 500    | 1.2         | —              | Sub-section headings                   |
| `body-lg`          | Inter           | 18 px  | 400    | 1.6         | —              | Lead paragraphs, prominent body text   |
| `body-md`          | Inter           | 16 px  | 400    | 1.5         | —              | Default body text                      |
| `body-sm`          | Inter           | 14 px  | 400    | 1.5         | —              | Captions, helper text                  |
| `utility-mono`     | IBM Plex Mono   | 13 px  | 500    | 1.0         | 0.05 em        | Timestamps, IDs, system metadata       |
| `stamp-label`      | IBM Plex Mono   | 11 px  | 700    | 1.0         | 0.10 em        | Stamp badges, status labels (ALL CAPS) |

### Font Stack Summary

| Role       | Family          |
| ---------- | --------------- |
| Headlines  | Newsreader      |
| Body       | Inter           |
| Labels     | IBM Plex Mono   |

### Typography Rules

- Headlines are **always left-aligned** (ledger-book style, never centered)
- `stamp-label` is rendered in **ALL CAPS** with slight random rotation for stamp effect
- High contrast is mandatory — avoid low-contrast text on paper backgrounds
- Use optical sizing on Newsreader when available

---

## Spacing

| Token                | Value    | Usage                                 |
| -------------------- | -------- | ------------------------------------- |
| `base-unit`          | 8 px     | Fundamental spacing unit              |
| `gutter`             | 24 px    | Column gutters, padding               |
| `margin-page`        | 48 px    | Page-level margins (desktop)          |
| `sidebar-width`      | 220 px   | Left sidebar (Cabinet Tabs)           |
| `content-max-width`  | 1100 px  | Main content maximum width            |

### Spacing Scale (8 px base)

| Multiple | Value  | Common Use                           |
| -------- | ------ | ------------------------------------ |
| ×1       | 8 px   | Tight internal padding               |
| ×2       | 16 px  | Standard internal padding, mobile margin |
| ×3       | 24 px  | Gutters, card padding                |
| ×4       | 32 px  | Section gaps                         |
| ×6       | 48 px  | Page margins, major section breaks   |

---

## Border Radius

| Token      | Value      | Usage                                |
| ---------- | ---------- | ------------------------------------ |
| `sm`       | 0.125 rem  | Subtle rounding (badges)             |
| `DEFAULT`  | 0.25 rem   | Buttons, inputs (4 px)               |
| `md`       | 0.375 rem  | Medium elements                      |
| `lg`       | 0.5 rem    | Cards, containers                    |
| `xl`       | 0.75 rem   | Large containers                     |
| `full`     | 9999 px    | Pill / stamp badges only             |

---

## Elevation & Depth

> **No shadows.** Depth is purely tonal.

| Level | Name       | Color     | Border                          |
| ----- | ---------- | --------- | ------------------------------- |
| 0     | Canvas     | `#f6f1e7` | None                            |
| 1     | Surface    | `#faf7f0` | 1 px hairline `#d8d0c0`         |
| Active| —          | —         | 1 px border → Stamp Blue `#1e3a5f`, or 2 px offset border |

---

## Shapes

- **General elements:** Minimal 4 px radius ("cut paper" look)
- **Index Cards:** Sharp 90° on 3 sides, optional 8 px perforation notch or 45° clipped corner (top-right)
- **Stamp Badges:** Pill / oval — the only exception to sharp corners

---

## Components

### Stamp Badge
- Shape: Circular or oval (pill)
- Typography: `stamp-label` (ALL CAPS)
- Rotation: Random `rotate(-2deg)` to `rotate(4deg)`
- Border: 1.5 px, optionally textured via CSS `mask-image`

### Index Card
- Background: Surface color
- Border: 1 px hairline
- Header: `utility-mono` for IDs / categories

### Memo Slip
- Wide container with 4 px solid left-border accent (semantic color)
- Headline: Newsreader
- Divider: Horizontal hairline separating body from mono-type footer

### Buttons
| Variant    | Background         | Text        | Border            | Hover                     |
| ---------- | ------------------ | ----------- | ----------------- | ------------------------- |
| Primary    | Stamp Blue         | Paper white | None              | Darken 5%                 |
| Secondary  | Transparent        | Ink         | 1 px Ink          | Darken bg 5% or underline |
| Action     | —                  | —           | —                 | Solid underline (no glow) |

### Input Fields
- Style: Bottom-border only **or** full 1 px hairline
- Placeholder: `utility-mono` (typewriter aesthetic)

### AI Status
- Position: Bottom of sidebar or footer
- Format: `LEDGER · ONLINE · [00:00:00]`

### Command Bar
- Position: Fixed bottom of screen
- Style: Full-width or centered wide-pill, 1 px heavy border, mono placeholder
- Metaphor: "Strip of paper taped to the desk"

### Iconography
- Stroke: 1.5 px
- Caps: Butt caps (no rounded caps)
- Style: Sharp, technical

---

## Screens

### Screen 1 — Login

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Login — Ledger**                                              |
| ID        | `2c1c7b8b2e23453e947faa51c0276fb8`                             |
| Size      | 2560 × 2048 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLus-PIhbJrazUdDTj7Xhfztvemte7NIhPr__jnc3REFhkyR4ZdICipIyEy5tFGRZOaSGwOGbLZGhhuQqUCqrScd39pXE31krYeIZUQWuv9A4bSYBrKDuh7kA4Tm4z7_bTrIijVjbf4Z6NS0hxhc8pJ7coqhE5n8bJOHDUwspgV7SxSDM9fAt2GVEwVeIqxw7V1L2Swh6BAzwu3SdXCd12rgBV9wL0aEHM9t8o4J9X8KC3F08lVD-FPsVMA) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzVjMWI5NzkyOWEyNTQ4MDBhZTdlMjQ0ZmRjOTU5YjlhEgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 2 — Onboarding

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Onboarding — Ledger**                                         |
| ID        | `b4d57998947d4547bfb1254ab690639b`                             |
| Size      | 2560 × 2096 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLsEwESQ4gxKkXNkIAu4EAs9pd65WI7S8BAk0bZQd8HQL0kBg--grWW1Dj1oEp41aOtGGlEv6kK2-mWAqRvFeArxHxR6mWnMLG14ukCAPTSGXKVorfYk-t76EjhoqbXiAX1MMuLasJ75oAb2Tx5z7BH1jq4XHGFPpY7CdgcC2F3QG-leFx06UNwMFQKMmYHqGmdpZf1N-tYPVpX4ZqVF_JRUTdQf751Rj5lPqPiioxZ1tUjo_ez4OmtVqA) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk5YzFiYmI3YmRlMDQ0MTc5YmM4YjE2OTBlMzNmMTU3EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 3 — Home

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Home — Ledger**                                               |
| ID        | `3717694b9d4a4963bd277d021b881c60`                             |
| Size      | 2640 × 2802 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLuprgtoMC0L-QzwVVIjbg_bivqTxbrBC1A2tyawsDHL7vNpOH5U5S1sTSYhQV15VRciBANAOqaAg3reN-YROgPe0RiGqc4wBNGVAzN_CtXVP7HX5fM_5lbRpKfIvtzCceBE7fvZlZfH-Hj7OEDLAD_vlXyUIocPkddVQAl39ZERYx6GCx6JCKd2UKH2lJ22OV4ZU5sEZ5x4pGMJS7ahAZ_s23Inah6ECbZdHoMlAA2Qfba9xkbfJ75sFA) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Q5NWUxODQxNThmNTRiN2RhZGQ4MzNlNmMzNzQxMzk5EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 4 — Conversations

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Conversations — Ledger**                                      |
| ID        | `8333e2d7d4de44f08328303ead6a4a24`                             |
| Size      | 2560 × 2048 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLvMxESuKsLm970KuiuxZGAzXvswNiasMY0a-PfQ-08TaUWcegijWA5KXJjbXrvIrTCc2Jn_qWlpcOvQ8B0UDCQXoX7TLzgDW9VkzOxx-izm5Sp5vPOgpmq4I5QU2NqR3YmojfwMcWboQ1xz5JCYPwaF9bWMrCphTTfeSQSHhpc-XId7ZBcdxsV1KVdoQQHUbHc9Vp_Rrqo9rWIiHPBMbDKI8_c5ie_vuvr6pB3xlC8ldI1N9j5IF4ueN-M) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzgxZjMwYWJhOTcwNDQ2ZTlhZGVhYWE0ZTAyOWFjNDI0EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 5 — Opportunities

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Opportunities — Ledger**                                      |
| ID        | `8461cae6bc034d818485b6db98753218`                             |
| Size      | 2640 × 2048 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLsqxd9Z85fL8m46QxPeARgOESS1-LsgrUd47U3xdfrHBAwSNIJf3ZujGXR1VJtLX9J5FHAs41eu0CoRpsXTDMJCWdoqlfAdnAP5RY3tfbmwBq7rubNishWaP_hEo-8xpQzSJrwCXlh0N_cjKZxPtJiY_MCuT8QsWsRLjuw91-jloUdtPZOzXTfPNKb416SrWoEdhkFpOiEQSsT0t-6NyfZZ3o1rWzptFP8LXDOCGlG7RPcLR281cGQRntA) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdiMDA1ZWViM2I1NjRlM2NhNTM2Njg3ZmQ4ZmRjOTM5EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 6 — Actions

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Actions — Ledger**                                            |
| ID        | `73f2fc3fbf714301ab75d52567ec78f9`                             |
| Size      | 2640 × 2328 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLvrJe7pjNFLJpQhG_PDqUt1N1Zmpy7J5YZpT0kfgkTYhkzoZTqCwWTGhQdjysX4QxvrtmwQW36ksBL1xC_VJjwD-aFQqCTZw5Pfu6UjKqsZNdZw7EZpdH-QksyaifNUcWUUNILwdItiufOEnpozGk4aEUkFRvsaNfoXD4pB7TDaALCySn-KDGZ3kelCscLOHh6TCeG3__2QtwBVk1VWMbf8kcS3rUUL7aaGPWkP1V3hfb9Gl0ZNif9Z0bY) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAyYjE5MDFjM2JlZDRlNzI5ZjIyMDhhMGNiZTA0ZjI2EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 7 — Workflow

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Workflow — Ledger**                                           |
| ID        | `4348d3ac15ba4f15afb96845849ec7b2`                             |
| Size      | 2640 × 2048 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLsVyJBGHGUBNEV4tM0ehXF9skL0Wyh63k2KMvrEhVg0oE6kY0KIwvyQwqjiCus5Xsi5ImknTs29AYHdqMn3Dwkk95MaDXpB_TPbo6GboPKcWORYPtybwgJ10xJPEkDAukJSSewM6xxQikFbmej2PVoJzjUc8LmynSFg0Qp7y9JX3FjFpjLsD824_K5Vnz7k3i1LlQrF6jQnpczhH-JFjKAWk4xvpNi2IiTTFMyw7oj5iDFH6iZ2rjjqOxo) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZhMWJhODIwZGNiMjRjNTlhZGViOGU0MTEyZWUwNjA2EgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

### Screen 8 — Insights

| Property  | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Title     | **Insights — Ledger**                                           |
| ID        | `d6f797f8e8d34c4f8923ae98f320e49a`                             |
| Size      | 2640 × 2048 px                                                  |
| Device    | Desktop                                                         |
| Screenshot| [View](https://lh3.googleusercontent.com/aida/AP1WRLuXLawUhNjURIFqk8ERtXN5gqgfqRbWFnazKU7k2Ao2K5VRjcgBIp3gULFcL65OU8qvrLejrl4fRGMO75nNEJavfYV-KYO94qGO8S-ZgKilLAgZ1-2yKg3aB2mzB9kLkEFvMY81SEQuNbtYk5_5Zqzi6BDe1N1OOSoDU2CSvcy1S9ZgSfCvJGz1WlTFp_24SsgC2Z4WHjORNs0sPN7Ile_bezTAUnTUvBkUQ9BN8O0hmi4aysNjLhJeKA) |
| HTML      | [Download](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Q4OGE1OWRmYTdkNjQyZTA4MzA4YmZjYjBlYTM5NjdiEgsSBxDZ6J-36AoYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTI1NDUxMDg1NjM2Mjk5NDE2&filename=&opi=89354086) |

---

## Screen Map (Canvas Layout)

```
┌──────────────────────────────────────────────────────────────────┐
│  y=2662                                                          │
│                                                                  │
│  ┌─────────┐ ┌───────────┐ ┌──────┐ ┌───────────┐               │
│  │  Login   │ │ Onboarding│ │ Home │ │Conversations│             │
│  │  x=0     │ │  x=1344   │ │x=2688│ │  x=4032    │             │
│  └─────────┘ └───────────┘ └──────┘ └───────────┘               │
│                                                                  │
│  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐         │
│  │Opportunities│ │ Actions  │ │ Insights │ │ Workflow  │         │
│  │  x=5376     │ │ x=6720  │ │ x=8064   │ │ x=9408   │         │
│  └─────────────┘ └─────────┘ └──────────┘ └──────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## CSS Custom Properties (Quick Reference)

```css
:root {
  /* ── Surface ── */
  --color-surface:                 #fff8f3;
  --color-surface-dim:             #e2d9cf;
  --color-surface-container:       #f6ece2;
  --color-surface-container-high:  #f0e7dd;
  --color-surface-container-highest: #eae1d7;
  --color-on-surface:              #1f1b15;
  --color-on-surface-variant:      #43474e;

  /* ── Primary (Stamp Blue) ── */
  --color-primary:                 #022448;
  --color-primary-container:       #1e3a5f;
  --color-on-primary:              #ffffff;

  /* ── Secondary (Ledger Green) ── */
  --color-secondary:               #2d694d;
  --color-secondary-container:     #aeedca;

  /* ── Tertiary (Amber) ── */
  --color-tertiary:                #391d00;
  --color-tertiary-container:      #583000;

  /* ── Error ── */
  --color-error:                   #ba1a1a;
  --color-error-container:         #ffdad6;

  /* ── Outline ── */
  --color-outline:                 #74777f;
  --color-outline-variant:         #c4c6cf;

  /* ── Typography ── */
  --font-headline:   'Newsreader', serif;
  --font-body:       'Inter', sans-serif;
  --font-mono:       'IBM Plex Mono', monospace;

  /* ── Spacing ── */
  --spacing-unit:    8px;
  --spacing-gutter:  24px;
  --spacing-margin:  48px;
  --sidebar-width:   220px;
  --content-max-w:   1100px;

  /* ── Radius ── */
  --radius-sm:       0.125rem;
  --radius-default:  0.25rem;
  --radius-md:       0.375rem;
  --radius-lg:       0.5rem;
  --radius-xl:       0.75rem;
  --radius-full:     9999px;
}
```

---

## Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;700&display=swap');
```
