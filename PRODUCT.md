# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Frontend: Next.js and Tailwind CSS, with self-hosted Manrope and Lucide icons. Separate backend: Express, Node.js, Prisma, and PostgreSQL; the backend is unchanged by this workspace preview.

## Product Purpose

A company management project with a professional dark workspace preview. The current frontend flow is demo login followed by a sidebar and top navigation bar. Every destination currently shows “Coming soon.”

## Operating Context

The login form explicitly displays demo credentials. A tab-scoped sessionStorage flag controls preview navigation; it is not real authentication or an authorization boundary. Sign out clears that preview flag.

## Capabilities and Constraints

- AI Agent is a placeholder destination.
- Ten system destinations are present: Executive management; People and team management; Project requirements and tasks; Engineering, quality, and releases; Infrastructure and resources; Communication, integration, and AI operations; Sales, marketing, and CMS; Finance, expenses, and investment; Documents, reporting, and data room; Administration, security, and reliability.
- All destination pages are placeholders; their system names do not imply implemented business capabilities.
- The shell supports sidebar collapse, system group expansion, a mobile navigation drawer, navigation search, a workspace guide, notification preview, and account sign out.
- Existing company directory implementation is no longer routed in the current frontend.
- Production authentication, users, roles, tenant access policy, and deployment remain open decisions.
- Audience, broader product scope, and positioning remain undecided.

## Brand Commitments

The user requested a professional dark theme and a login-to-workspace flow with sidebar and top navigation.
