//! Centralized color palette. Material Design aligned where possible.
//! Use these in Rust + export to CSS vars for Tailwind.

// === Material Design Color Mapping ===
// Source: https://m2.material.io/design/color/the-color-system.html

// Blues
pub const MATERIAL_BLUE_500: &str = "#2196F3";
pub const MATERIAL_BLUE_700: &str = "#1976D2";
pub const BOOTSTRAP_PRIMARY: &str = "#007bff"; // Your primary blue - Bootstrap 4

// Reds  
pub const MATERIAL_RED_500: &str = "#F44336"; // Your #f44336 exact match
pub const MATERIAL_RED_700: &str = "#C62828"; // Your #c62828 exact match  
pub const MATERIAL_RED_900: &str = "#B71C1C"; // Your #b71c1c exact match
pub const MATERIAL_RED_A400: &str = "#FF1744"; // Your #ff1744 exact match
pub const MATERIAL_RED_400: &str = "#EF5350"; // Your #ef5350 exact match

// Greens
pub const MATERIAL_GREEN_800: &str = "#2E7D32"; // Your #2E7D32 exact match
pub const MATERIAL_GREEN_500: &str = "#4CAF50"; // Your #4CAF50 exact match

// Grays
pub const MATERIAL_GRAY_900: &str = "#212121"; // Your #212121 exact match
pub const MATERIAL_GRAY_800: &str = "#424242"; // Close to your #313131, #2B2C2F

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
pub struct ColorPalette;

impl ColorPalette {
    pub const fn as_css_vars() -> &'static str {
        concat!(
            "--brand-primary: ", BRAND_PRIMARY, ";",
            "--brand-danger: ", BRAND_DANGER, ";",
            "--brand-success: ", BRAND_SUCCESS, ";",
            "--brand-white: ", BRAND_WHITE, ";",
            "--text-primary: ", TEXT_PRIMARY, ";",
            "--text-secondary: ", TEXT_SECONDARY, ";",
            "--bg-dark: ", BG_DARK, ";",
            "--material-red-500: ", MATERIAL_RED_500, ";",
            "--material-red-700: ", MATERIAL_RED_700, ";",
            "--material-red-900: ", MATERIAL_RED_900, ";",
            "--material-green-800: ", MATERIAL_GREEN_800, ";",
        )
    }
}