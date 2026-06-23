//! Centralized color palette. Material Design aligned where possible.
//! Use these in Rust + export to CSS vars for Tailwind.

// === Material Design Color Mapping ===
// Source: https://m2.material.io/design/color/the-color-system.html

// Blues
pub const MATERIAL_BLUE_500: &str = "--material-blue-500";
pub const MATERIAL_BLUE_700: &str = "--material-blue-700";
pub const BOOTSTRAP_PRIMARY: &str = "--bootstrap-primary"; // Your primary blue - Bootstrap 4

// Reds  
pub const MATERIAL_RED_500: &str = "--material-red-500"; // Your #f44336 exact match
pub const MATERIAL_RED_700: &str = "--material-red-700"; // Your #c62828 exact match  
pub const MATERIAL_RED_900: &str = "--material-red-900"; // Your #b71c1c exact match
pub const MATERIAL_RED_A400: &str = "--material-red-a400"; // Your #ff1744 exact match
pub const MATERIAL_RED_400: &str = "--material-red-400"; // Your #ef5350 exact match

// Greens
pub const MATERIAL_GREEN_800: &str = "--material-green-800"; // Your #2E7D32 exact match
pub const MATERIAL_GREEN_500: &str = "--material-green-500"; // Your #4CAF50 exact match

// Grays
pub const MATERIAL_GRAY_900: &str = "--material-gray-900"; // Your #212121 exact match
pub const MATERIAL_GRAY_800: &str = "--material-gray-800"; // Close to your #313131, #2B2C2F

// === Brand Aliases ===
// Override these per project without touching components
pub const BRAND_PRIMARY: &str = BOOTSTRAP_PRIMARY; // #007bff
pub const BRAND_SECONDARY: &str = MATERIAL_GRAY_800;
pub const BRAND_DANGER: &str = MATERIAL_RED_500; // #f44336
pub const BRAND_SUCCESS: &str = MATERIAL_GREEN_500; // #4CAF50
pub const BRAND_WHITE: &str = "#ffffff"; // Your #fff
pub const BRAND_BLACK: &str = "#333333"; // Your #333 - near Material Gray 800

// === Semantic colors for UI ===
pub const TEXT_PRIMARY: &str = BRAND_BLACK; // #333
pub const TEXT_SECONDARY: &str = "#6f6f6f"; // Your #6f6f6f
pub const BG_DARK: &str = MATERIAL_GRAY_900; // #212121
pub const BG_DARKER: &str = "#2B2C2F"; // Your #2B2C2F
pub const BG_DARKEST: &str = "#313131"; // Your #313131

// === Helper for CSS vars ===
// pub struct ColorPalette;

// impl ColorPalette {
//     pub const fn as_css_vars() -> &'static str {
//         concat!(
//             "--material-blue-500: ", MATERIAL_BLUE_500, ";",
//             "--material-blue-700: ", MATERIAL_BLUE_700, ";",
//             "--bootstrap-primary: ", BOOTSTRAP_PRIMARY, ";",
//             "--material-red-500: ", MATERIAL_RED_500, ";",
//             "--material-red-700: ", MATERIAL_RED_700, ";",
//             "--material-red-900: ", MATERIAL_RED_900, ";",
//             "--material-red-A400: ", MATERIAL_RED_A400, ";",
//             "--material-red-400: ", MATERIAL_RED_400, ";",
//             "--material-green-800: ", MATERIAL_GREEN_800, ";",
//             "--material-green-500: ", MATERIAL_GREEN_500, ";",
//             "--material-gray-800: ", MATERIAL_GRAY_800, ";",
//             "--material-gray-900: ", MATERIAL_GRAY_900, ";",
//             "--brand-primary: ", BRAND_PRIMARY, ";",
//             "--brand-secondary: ", BRAND_SECONDARY, ";",
//             "--brand-danger: ", BRAND_DANGER, ";",
//             "--brand-success: ", BRAND_SUCCESS, ";",
//             "--brand-white: ", BRAND_WHITE, ";",
//             "--brand-black: ", BRAND_BLACK, ";",
//             "--text-primary: ", TEXT_PRIMARY, ";",
//             "--text-secondary: ", TEXT_SECONDARY, ";",
//             "--bg-dark: ", BG_DARK, ";",
//             "--bg-darker: ", BG_DARKER, ";",
//             "--bg-darkest: ", BG_DARKEST, ";",
//         )
//     }
// }

// Trait your users implement
pub trait ToVarColor: Clone + PartialEq + 'static {
    fn to_var_color(&self) -> String;
}

#[derive(Clone, PartialEq)]
pub enum AccentColor {
    MaterialBlue500,
    MaterialBlue700,
    BootstrapPrimary,
    MaterialRed500,
    MaterialRed700,
    MaterialRed900,
    MaterialRedA400,
    MaterialRed400,
    MaterialGreen800,
    MaterialGreen500,
    MaterialGray900,
    MaterialGray800,
    BrandPrimary,
    BrandSecondary,
    BrandDanger,
    BrandSuccess,
    BrandWhite,
    BrandBlack,
    TextPrimary,
    TextSecondary,
    BgDark,
    BgDarker,
    BgDarkest,
    CustomAccent(String)
}

impl ToVarColor for AccentColor {
    fn to_var_color(&self) -> String {
        format!("rgb(var({}))",
            match self {
                AccentColor::MaterialBlue500 => MATERIAL_BLUE_500.to_string(),
                AccentColor::MaterialBlue700 => MATERIAL_BLUE_700.to_string(),
                AccentColor::BootstrapPrimary => BOOTSTRAP_PRIMARY.to_string(),
                AccentColor::MaterialRed500 => MATERIAL_RED_500.to_string(),
                AccentColor::MaterialRed700 => MATERIAL_RED_700.to_string(),
                AccentColor::MaterialRed900 => MATERIAL_RED_900.to_string(),
                AccentColor::MaterialRedA400 => MATERIAL_RED_A400.to_string(),
                AccentColor::MaterialRed400 => MATERIAL_RED_400.to_string(),
                AccentColor::MaterialGreen800 => MATERIAL_GREEN_800.to_string(),
                AccentColor::MaterialGreen500 => MATERIAL_GREEN_500.to_string(),
                AccentColor::MaterialGray900 => MATERIAL_GRAY_900.to_string(),
                AccentColor::MaterialGray800 => MATERIAL_GREEN_800.to_string(),
                AccentColor::BrandPrimary => BRAND_PRIMARY.to_string(),
                AccentColor::BrandSecondary => BRAND_SECONDARY.to_string(),
                AccentColor::BrandDanger => BRAND_DANGER.to_string(),
                AccentColor::BrandSuccess => BRAND_SUCCESS.to_string(),
                AccentColor::BrandWhite => BRAND_WHITE.to_string(),
                AccentColor::BrandBlack => BRAND_BLACK.to_string(),
                AccentColor::TextPrimary => TEXT_PRIMARY.to_string(),
                AccentColor::TextSecondary => TEXT_SECONDARY.to_string(),
                AccentColor::BgDark => BG_DARK.to_string(),
                AccentColor::BgDarker => BG_DARKER.to_string(),
                AccentColor::BgDarkest => BG_DARKEST.to_string(),
                AccentColor::CustomAccent(color) => color.to_string(),
            }
        ).to_string()
    }
}

use std::fmt;

impl fmt::Display for AccentColor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_var_color())
    }
}