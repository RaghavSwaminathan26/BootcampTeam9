# BootcampTeam9

A personal restaurant-tracking web app where users can log restaurants they've visited and restaurants they want to visit.

**Live site:** [https://bootcamp-team9.vercel.app](https://bootcamp-team9.vercel.app)

## Table of Contents

- [Overview](https://github.com/RaghavSwaminathan26/BootcampTeam9#overview)
  - [Purpose](https://github.com/RaghavSwaminathan26/BootcampTeam9#purpose)
  - [Team](https://github.com/RaghavSwaminathan26/BootcampTeam9#team)
- [Tech Stack](https://github.com/RaghavSwaminathan26/BootcampTeam9#tech-stack)
- [Getting Started And Contributing](https://github.com/RaghavSwaminathan26/BootcampTeam9#getting-started-and-contributing)

## Overview

### Purpose

This is a practice project for our Hack4Impact bootcamp team, built before we're staffed on an actual nonprofit client project. The idea is a personal restaurant-tracking app: users keep a library of restaurants they've visited and restaurants they want to visit, with details like cuisine, location, and rating, similar to a personal food journal. Longer-term ideas under consideration include pulling in short-form video reviews from content creators, map integration, and gamified features like restaurant-hosted quests — Milestone 1 focuses on the core visited/want-to-visit tracking experience with a simple Restaurant data model.

### Team

The BootcampTeam9 team consists of 6 Cal Poly students. Over the course of this bootcamp, we are working as a team to build and deploy this web application. The team members are listed below:

- [Raghav Swaminathan](https://www.linkedin.com/) - Tech Lead
- [Jonathan Desjardins-Wiggins](https://www.linkedin.com/) - Software Developer
- [Grace Mills](https://www.linkedin.com/) - Software Developer
- [Ty Shimizu](https://www.linkedin.com/) - Software Developer
- [Gwyn Marin](https://www.linkedin.com/) - Software Developer
- [Sully Palaia](https://www.linkedin.com/) - Software Developer

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **Testing:** Vitest
- **Deployment:** Vercel
- **CI:** GitHub Actions

## Getting Started And Contributing

Visit [getting-started.md](https://github.com/RaghavSwaminathan26/BootcampTeam9/blob/develop/docs/getting-started.md) on info for how to set up this repo.

Visit [contributing.md](https://github.com/RaghavSwaminathan26/BootcampTeam9/blob/develop/docs/contributing.md) on info for how to contribute to this repo.

## Accounts and restaurant storage

Open `/login` to create an account or log in. The same page lets you log out.
Usernames are case-insensitive, and passwords must be 8–128 characters.
Accounts are stored in the `users` collection with salted password hashes and
an embedded `restaurants` array. Sessions last seven days and use an HttpOnly
cookie; only a hash of each session token is stored in the `sessions` collection.

`GET /api/users` returns the current account, and `POST /api/users` creates an
account. `POST /api/session` logs in, and `DELETE /api/session` logs out.
`GET` and `POST /api/restaurants` read and add restaurants inside the logged-in
user's document. Both the visited and wishlist pages require login.

Keep `MONGODB_URI` in `.env.local`. Existing records in the old `restaurants`
collection are not assigned to accounts automatically. The old seed command
still populates that separate collection; new accounts start with empty lists.

The home page requires login and ranks your restaurants by rating, highest first,
with unrated entries last and ties ordered by name. It fetches your collection
once and displays 10 entries at a time; **Load more** reveals the next 10.
