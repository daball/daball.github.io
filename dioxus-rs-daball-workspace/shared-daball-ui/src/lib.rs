use dioxus::prelude::*;
use manganis::{Asset, asset};

pub const TAILWIND_CSS: Asset = asset!("/assets/tailwind/tailwind.g.css");

pub mod components;
pub use components::{Button};

pub mod colors;

#[component]
pub fn LButton(label: String, onclick: EventHandler<MouseEvent>) -> Element {
    rsx! {
        button { class: "btn-primary", onclick: move |e| onclick.call(e), "{label}" }
    }
}

#[component]
pub fn LNavbar() -> Element {
    rsx! {
        nav { class: "navbar", "My App" }
    }
}

#[component]
pub fn LUserCard(name: String, email: String) -> Element {
    rsx! {
        div { class: "card",
            h3 { "{name}" }
            p { "{email}" }
            LButton { label: "Message", onclick: move |_| tracing::info!("clicked") }
        }
    }
}


#[component]
pub fn UseTailwindCss() -> Element {
    rsx! {
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
    }
}