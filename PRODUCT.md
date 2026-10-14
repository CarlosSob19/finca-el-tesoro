# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript, no framework (approved by the user with the design plan, 2026-10-07). GSAP + ScrollTrigger from CDN for scroll motion. Node built-in test runner for the quote logic. No deploy target decided yet.

## Users

- **Primary:** families and groups of friends in Montería (and visitors arriving through Los Garzones airport) planning a *pasadía* (day trip), a 24-hour stay, or an overnight at a country house with a pool. They mostly browse on a phone, often on mobile data, and decide in a WhatsApp chat.
- **Secondary:** people organizing an occasion — birthdays, company outings, graduations — who need to know capacity (up to 80 people on a day pass) and total cost before asking.
- **Buyer of the site:** the owner of the finca. The page is being built as a spec to sell to them; it must make their business look formal and make booking easier for them.

## Product Purpose

The website of Casafinca El Tesoro del Sinú, a recreational country house in the rural area of Montería, Córdoba, Colombia. It replaces scattered third-party listings (Posadas Rurales, Trip.com, Facebook) with one direct channel. Success means a visitor understands what they can do there, knows what it costs for their group, and sends a ready-to-confirm booking request on WhatsApp.

## Positioning

A real rural finca of the Sinú, 6 km off the paved road at Las Babillas, near the airport road: palm-thatched two-storey house with a lookout, pool, jacuzzi for 15, hammock kiosk, gardens under old trees, and a caretaker who cooks. Priced by group size for day passes, so a 40-person family gathering is affordable. Registered with RNT 110315.

## Operating Context

- Booking happens over WhatsApp: 50% deposit to reserve, balance at least 24 hours before arrival, proof of payment shown at check-in.
- No visitors allowed during a reservation; groups pay for the headcount declared at booking.
- Food: bring groceries and cook, bring groceries and hire the caretaker to cook, or buy meals from her.
- Access: bus S1 (yellow minibuses from Carrera 3ª, $2.400 per person) reaches the gate; a taxi from the airport costs about $30.000.

## Capabilities and Constraints

- Plans and prices (source: Posadas Rurales listing, captured 2026-10-07; **the source contradicts itself and must be confirmed with the owner**):
  - Pasadía, up to 8 hours: 10 ppl $400.000 · 15 $550.000 · 20 $660.000 · 30 $880.000 · 40 $990.000 · 50 $1.100.000 · 60 $1.210.000 · 70 $1.310.000 · 80 $1.430.000. Extra hours: 1 h $100.000 · 2 h $150.000 · 3 h $200.000.
  - Estadía 24 h: up to 10 ppl $728.000 · 15 $840.000 · 20 $952.000; extra person on hammock/mattress $25.000 per night.
  - Noche por persona: $112.000 including breakfast (Mon–Fri also for 1–2 people).
  - Conflicting figures in the same source: pasadía 10 ppl $380.000 / 20 $610.000 / 30 $840.000; "10 personas $900.000, persona adicional $55.000"; "persona adicional $50.000".
- Capacity: beds for 24, mattresses for 8, hammocks for 8. 4 air-conditioned bedrooms, 4 bathrooms.
- Coordinates: 8.805255883436914, -75.79514411377272.
- Prices live in one data file so the owner can change them without touching layout.

## Brand Commitments

- Name in use: "Casafinca El Tesoro del Sinú" / "Casa finca El Tesoro Montería" (Facebook). A painted "EL TESORO" sign at the entrance and a carved "EL TESORO" stone are part of the property's own identity.
- Language: Spanish (Colombia).

## Evidence on Hand

- 28 real photos of the finca, 800×800 px, in `assets/img/raw/` (IDs 1306–1339). 4 photos of the owner's beach house in Coveñitas (IDs 10238–10241).
- Contact: WhatsApp 311 840 1381 (from the finca's Facebook page); Facebook `facebook.com/casafincaeltesoromonteria`. Posadas Rurales line +57 317 665 1268 belongs to the listing platform.
- Trip.com: check-in from 14:00, pets allowed (unconfirmed by owner).
- No Instagram found. No guest reviews with verifiable text found — **do not invent testimonials or ratings.**

## Product Principles

1. Answer "what can we do, how much for our group, how do we book" before anything else.
2. Every price shown must be traceable to the data file and flagged as confirmable with the owner.
3. The phone on mobile data is the reference device.
4. Show the real place; never stock imagery or fabricated social proof.

## Accessibility & Inclusion

WCAG 2.2 AA as the baseline. Respect reduced motion. Spanish copy readable by a general audience.
