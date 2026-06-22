use crate::Route;
use dioxus::prelude::*;
use std::vec::Vec;
use manganis::{Asset, asset};

const NAVBAR_CSS: Asset = asset!("/assets/styling/navbar.css");
const HOVER_CSS: Asset = asset!("/assets/styling/hover.css");

/// The Navbar component that will be rendered on all pages of our app since every page is under the layout.
///
///
/// This layout component wraps the UI of [Route::Home] and [Route::Blog] in a common navbar. The contents of the Home and Blog
/// routes will be rendered under the outlet inside this component
#[component]
pub fn Navbar() -> Element {
    let navLinks: Vec<Element> = vec![
        rsx! {
            Link { to: Route::Home {}, "DABALL.ME" }
        },
        rsx! {
            Link { to: "/#about", "The Man" }
        },
        rsx! {
            Link { to: "/#portfolio", "The Myth" }
        },
        rsx! {
            Link { to: "/#testimonials", "The Legend" }
        },
        rsx! {
            Link { to: Route::Blog { id: 1 }, "The Word" }
        },
        rsx! {
            Link { to: Route::Blog { id: 1 }, "The Biz" }
        },
        rsx! {
            Link { to: "https://github.com/daball/daball.github.io", "The Source" }
        },
    ];
    rsx! {
        document::Link { rel: "stylesheet", href: NAVBAR_CSS.to_string() }
        document::Link { rel: "stylesheet", href: HOVER_CSS.to_string() }

        section { id: "navbar-container",
            nav { id: "navbar",
                div { class: "nav-container",
                    ul {
                        for navLink in navLinks {
                            li { class: "hvr-underline-from-left", {navLink} }
                        }
                    }
                }
            }
        }

        // The `Outlet` component is used to render the next component inside the layout. In this case, it will render either
        // the [`Home`] or [`Blog`] component depending on the current route.
        Outlet::<Route> {}
    }
}
