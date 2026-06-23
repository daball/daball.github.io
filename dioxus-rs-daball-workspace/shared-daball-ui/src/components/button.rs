use dioxus::prelude::*;
use manganis::{Asset, asset};
use std::fmt::Display;
use crate::colors::*;

// const BUTTON_CSS: Asset = asset!("/assets/ui/css/button.css");

// Trait your users implement
pub trait ToClass: Clone + PartialEq + 'static {
    fn to_class(&self) -> String;
}

pub trait ToBackgroundStyle: Clone + PartialEq + 'static {
    fn to_bg_style(&self) -> String;
}

// Default enums provided by your lib
// #[derive(Clone, Copy, PartialEq)]
// pub enum DefaultButtonAccentColor {
//     Blue,
//     Red,
//     Gray,
// }

// impl ToClass for DefaultButtonAccentColor {
//     fn to_class(&self) -> String {
//         match self {
//             DefaultButtonAccentColor::Blue => "btn-blue",
//             DefaultButtonAccentColor::Red => "btn-red",
//             DefaultButtonAccentColor::Gray => "btn-gray",
//         }.to_string()
//     }
// }

impl ToBackgroundStyle for AccentColor {
    fn to_bg_style(&self) -> String {
        format!("background: {}", self.to_var_color()).to_string()
    }
}

#[derive(Clone, PartialEq)]
pub enum DefaultButtonFillStyle {
    AccentFill(AccentColor),
    TransparentFill,
}

// impl ToClass for DefaultButtonFillStyle {
//     fn to_class(&self) -> String {
//         match self {
//             DefaultButtonFillStyle::AccentFill(color) => color.to_var_color(),
//             DefaultButtonFillStyle::TransparentFill => "".to_string(),
//         }.to_string()
//     }
// }

impl ToBackgroundStyle for DefaultButtonFillStyle {
    fn to_bg_style(&self) -> String {
        match self {
            DefaultButtonFillStyle::AccentFill(accent_color) => accent_color.to_bg_style().to_string(),
            DefaultButtonFillStyle::TransparentFill => "".to_string(),
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum DefaultButtonBorderStyle {
    Outline,
    Transparent,
}

impl ToClass for DefaultButtonBorderStyle {
    fn to_class(&self) -> String {
        match self {
            DefaultButtonBorderStyle::Outline => "btn-outline".to_string(),
            DefaultButtonBorderStyle::Transparent => "btn-transparent".to_string(),
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum DefaultButtonCornerRoundness {
    SquareCorners,
    RoundCorners
}

impl ToClass for DefaultButtonCornerRoundness {
    fn to_class(&self) -> String {
        match self {
            DefaultButtonCornerRoundness::SquareCorners => "".to_string(),
            DefaultButtonCornerRoundness::RoundCorners => "btn-rounded".to_string(),
        }
    }
}

#[derive(Props, Clone, PartialEq)]
pub struct ButtonProps<ButtonFillStyle: ToBackgroundStyle, ButtonCornerRoundness: ToClass>
where
    // ButtonAccentColor: ToBackgroundStyle + Default,
    ButtonFillStyle: ToBackgroundStyle + Default,
    ButtonCornerRoundness: ToClass + Default
{
    #[props(default)]
    pub fill_style: ButtonFillStyle,
    #[props(default)]
    pub corner_roundness: ButtonCornerRoundness,
    #[props(default = false)]
    pub disabled: bool,
    #[props(into)]
    pub onclick: Option<EventHandler<MouseEvent>>,
    pub children: Element,
}

// Defaults so Button<> still works
// impl Default for AccentColor {
//     fn default() -> Self { AccentColor::BrandPrimary }
// }
impl Default for DefaultButtonFillStyle {
    fn default() -> Self { DefaultButtonFillStyle::AccentFill(AccentColor::BrandPrimary) }
}
impl Default for DefaultButtonCornerRoundness {
    fn default() -> Self { DefaultButtonCornerRoundness::RoundCorners }
}

#[component]
pub fn BaseButton<TemplateButtonFillStyle, TemplateButtonCornerRoundness>(props: ButtonProps<TemplateButtonFillStyle, TemplateButtonCornerRoundness>) -> Element
where
    // TemplateButtonAccentColor: ToClass + Default,
    TemplateButtonFillStyle: ToBackgroundStyle + Default,
    TemplateButtonCornerRoundness: ToClass + Default,
{
    let ButtonProps { fill_style, corner_roundness, disabled, onclick, children } = props;

    rsx! {
        // document::Link { rel: "stylesheet", href: BUTTON_CSS.to_string() }
        button {
            class: "flex items-center btn {corner_roundness.to_class()}",
            r#type: "button",
            style: "{fill_style.to_bg_style()}",
            // disabled,
            onclick: move |evt| {
                if let Some(cb) = &onclick {
                    cb.call(evt);
                }
            },
            {children}
        }
    }
}

#[component]
pub fn Button(props: ButtonProps<DefaultButtonFillStyle, DefaultButtonCornerRoundness>) -> Element
{
    BaseButton::<DefaultButtonFillStyle, DefaultButtonCornerRoundness>(props)
}