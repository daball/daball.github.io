# daball.me

A web application rewritten for Rust. It shall be a server-side rendered app (with hydration whenever necessary).

The service infrastructure:
- [Docker](https://www.docker.com/), containerization software for developers and teams
- [Authentik](https://goauthentik.io/), an IdP (Identity Provider) and SSO (Single Sign-On) platform
- [FreeIPA](https://www.freeipa.org/), an integrated security information management solution combining Linux (Fedora), 389 Directory Server, MIT Kerberos, NTP, DNS, Dogtag (Certificate System)
- [PostgreSQL](https://www.postgresql.org/), a powerful, open source object-relational database system with over 35 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance

The development stack:

- [Rust](https://rust-lang.org/), v1.96.0 using 2024 dialect
- [cargo-leptos](https://github.com/leptos-rs/cargo-leptos), Build orchestrator for Leptos, runs server + WASM builds together, handles SSR + hydration, hot reload
- [wasm32-unknown-unknown](https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html), Rust target, Lets Rust compile your Leptos code to WASM for the browser
- [wasm-bindgen-cli](https://github.com/wasm-bindgen/wasm-bindgen), Glue between Rust WASM and JS; cargo-leptos installs it for you usually
- [binaryen](https://github.com/WebAssembly/binaryen), Optimizer and compiler/toolchain library for WebAssembly; cargo-leptos uses it to shrink WASM size in release builds
- [sqlx-cli](https://lib.rs/crates/sqlx-cli), a command-line utility for managing databases, migrations, and enabling "offline" mode

The application ecosystem:

- [Tokio](https://tokio.rs/), an asynchronous runtime for the Rust programming language
- [Tower](https://docs.rs/tower/latest/tower/), a library of modular and reusable components for building robust networking clients and servers
- [Hyper](https://docs.rs/hyper/1.7.0/hyper/), a fast and correct HTTP implementation written in and for Rust
- [Axum](https://docs.rs/axum/latest/axum/), an HTTP routing and request-handling library that focuses on ergonomics and modularity
- [dotenvy](https://docs.rs/dotenvy/latest/dotenvy/), a well-maintained fork of the dotenv crate
- [SQLx](https://sqlx.dev/), a 100% asynchronous, pure-Rust database driver supporting PostgreSQL, MySQL, and SQLite; not an ORM
- [SeaORM](https://www.sea-ql.org/SeaORM/), a powerful ORM for building web services in Rust built on top of SQLx; as needed

Virtual host entry points:

- daball.me: Home page (for public)
- www.daball.me: Redirect to home page (for public)
- accounting.daball.me: Accounting system (for staff)
- billing.daball.me: Billing home page (for customers)
- login.daball.me: Authentik (SSO)
- id.daball.me: FreeIPA (LDAP admin)
- jellyfin.daball.me: Media player
- media.daball.me: Media server
- storage.daball.me: Storage server
- kb.daball.me: 

