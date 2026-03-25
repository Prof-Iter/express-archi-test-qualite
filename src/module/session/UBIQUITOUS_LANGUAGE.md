# Ubiquitous Language – Laser Quest Context

This document defines the shared vocabulary used across all user stories, code, and tests in the Laser Quest bounded context.

---

## Actors

| Term | Definition |
|------|------------|
| **Staff** | Employee who manages sessions (creation, updates) |

---

## Entities

### Session
A laser quest game slot that players can book.

| Field | Type | Definition |
|-------|------|------------|
| `id` | number | Unique identifier |
| `date` | Date | Date and time of the session |
| `duration` | number | Duration of the session in minutes |
| `availablePacks` | number | Number of packs that can still be booked |
| `reservedPacks` | number | Number of packs already booked by players |
| `price` | number | Price per pack in euros |
| `status` | string | Current state of the session (default: `"publié"`) |

### Pack
A physical equipment set consisting of an electronic harness and a laser gun, assigned to one player per session.

---

## Business Rules

| Rule | Constraint |
|------|------------|
| Unique slot | Only one session can exist on a given date/time slot |
| Default status | Status is automatically set to `"publié"` on creation |
| Minimum price | Price must be greater than 10 euros |
| Duration range | Duration must be between 1 and 60 minutes |
| Max packs | `availablePacks` must not exceed 30 |
| Future date | Session `date` must be in the future |
| Packs consistency | `availablePacks` must not be less than `reservedPacks` |

---

## Statuses

| Value | Meaning |
|-------|---------|
| `"publié"` | Session is visible and open for booking |
