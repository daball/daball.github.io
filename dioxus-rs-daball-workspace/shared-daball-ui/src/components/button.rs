use dioxus::prelude::*;
use manganis::{Asset, asset};
use std::fmt::Display;

const BUTTON_CSS: Asset = asset!("/assets/ui/css/button.css");

// Trait your users implement
pub trait ToClass: Copy + PartialEq + 'static {
    fn to_class(&self) -> String;
}

// Default enums provided by your lib
#[derive(Clone, Copy, PartialEq)]
pub enum DefaultButtonAccentColor {
    Blue,
    Red,
    Gray,
}

impl ToClass for DefaultButtonAccentColor {
    fn to_class(&self) -> String {
        match self {
            DefaultButtonAccentColor::Blue => "btn-blue",
            DefaultButtonAccentColor::Red => "btn-red",
            DefaultButtonAccentColor::Gray => "btn-gray",
        }.to_string()
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum DefaultButtonFillStyle {
    Filled,
    Outlined,
    Link,
}

impl ToClass for DefaultButtonFillStyle {
    fn to_class(&self) -> String {
        match self {
            DefaultButtonFillStyle::Filled => "btn-filled",
            DefaultButtonFillStyle::Outlined => "btn-outlined",
            DefaultButtonFillStyle::Link => "btn-link",
        }.to_string()
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum DefaultButtonCornerRoundness {
    SquaredCorners,
    RoundedCorners(u8)
}

impl ToClass for DefaultButtonCornerRoundness {
    fn to_class(&self) -> String {
        match self {
            DefaultButtonCornerRoundness::SquaredCorners => "".to_string(),
            DefaultButtonCornerRoundness::RoundedCorners(roundness) => format!("btn-rounded-{}", roundness),
        }
    }
}

#[derive(Props, Clone, PartialEq)]
pub struct ButtonProps<ButtonAccentColor: ToClass, ButtonFillStyle: ToClass, ButtonCornerRoundness: ToClass>
where
    ButtonAccentColor: ToClass + Default,
    ButtonFillStyle: ToClass + Default,
    ButtonCornerRoundness: ToClass + Default
{
    #[props(default)]
    pub accent_color: ButtonAccentColor,
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
impl Default for DefaultButtonAccentColor {
    fn default() -> Self { DefaultButtonAccentColor::Blue }
}
impl Default for DefaultButtonFillStyle {
    fn default() -> Self { DefaultButtonFillStyle::Filled }
}
impl Default for DefaultButtonCornerRoundness {
    fn default() -> Self { DefaultButtonCornerRoundness::RoundedCorners(4) }
}

#[component]
pub fn BaseButton<TemplateButtonAccentColor, TemplateButtonFillStyle, TemplateButtonCornerRoundness>(props: ButtonProps<TemplateButtonAccentColor, TemplateButtonFillStyle, TemplateButtonCornerRoundness>) -> Element
where
    TemplateButtonAccentColor: ToClass + Default,
    TemplateButtonFillStyle: ToClass + Default,
    TemplateButtonCornerRoundness: ToClass + Default,
{
    let ButtonProps { accent_color, fill_style, corner_roundness, disabled, onclick, children } = props;

    rsx! {
        document::Link { rel: "stylesheet", href: BUTTON_CSS.to_string() }
        button {
            class: "btn {accent_color.to_class()} {fill_style.to_class()} {corner_roundness.to_class()}",
            disabled,
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
pub fn Button(props: ButtonProps<DefaultButtonAccentColor, DefaultButtonFillStyle, DefaultButtonCornerRoundness>) -> Element
{
    BaseButton::<DefaultButtonAccentColor, DefaultButtonFillStyle, DefaultButtonCornerRoundness>(props)
}