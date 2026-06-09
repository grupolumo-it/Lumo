        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        // --- PALETA LUMO (Origen: Homepage) ---
                        "lumo": {
                            "navy": "#0B1142",
                            "blue": "#1A237E",
                            "gray": {
                                "50": "#F9FAFB",
                                "100": "#F3F4F6",
                                "200": "#E5E7EB",
                                "300": "#D1D5DB",
                                "400": "#9CA3AF",
                                "500": "#6B7280",
                                "600": "#4B5563",
                                "700": "#374151",
                                "800": "#1F2937",
                                "900": "#111827"
                            },
                            "purple": {
                                "light": "#E0E7FF",
                                "dark": "#4F46E5"
                            }
                        },
                        // --- PALETA SEMÁNTICA (Origen: Catálogo & Login Page) ---
                        "on-primary": "#ffffff",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "secondary-container": "#d0d4ff",
                        "surface-container-high": "#e9e8e8",
                        "secondary": "#575c80",
                        "primary-container": "#001d77",
                        "surface-container-highest": "#e3e2e2",
                        "surface": "#faf9f9",
                        "secondary-fixed": "#dee0ff",
                        "on-tertiary-fixed": "#001354",
                        "on-surface": "#1b1c1c",
                        "secondary-fixed-dim": "#bfc4ee",
                        "primary-fixed-dim": "#b9c3ff",
                        "tertiary": "#000e44",
                        "background": "#faf9f9",
                        "on-tertiary-container": "#7e8cd1",
                        "tertiary-container": "#122362",
                        "on-tertiary-fixed-variant": "#334282",
                        "on-secondary-fixed": "#131939",
                        "inverse-primary": "#b9c3ff",
                        "inverse-surface": "#303031",
                        "surface-container": "#efeded",
                        "surface-variant": "#e3e2e2",
                        "primary-fixed": "#dde1ff",
                        "on-surface-variant": "#454652",
                        "on-tertiary": "#ffffff",
                        "on-secondary-container": "#565b7f",
                        "surface-dim": "#dbdad9",
                        "surface-bright": "#faf9f9",
                        "on-primary-container": "#778ae5",
                        "on-background": "#1b1c1c",
                        "primary": "#000d46",
                        "tertiary-fixed": "#dde1ff",
                        "outline-variant": "#c5c5d3",
                        "error": "#ba1a1a",
                        "inverse-on-surface": "#f2f0f0",
                        "on-secondary": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "surface-tint": "#4458af",
                        "surface-container-low": "#f5f3f3",
                        "on-primary-fixed-variant": "#2b3f95",
                        "tertiary-fixed-dim": "#b8c4ff",
                        "on-primary-fixed": "#001256",
                        "on-error-container": "#93000a",
                        "outline": "#757683",
                        "on-secondary-fixed-variant": "#3f4467"
                    },
                    "borderRadius": {
                        // Fusión inteligente para evitar conflictos de layouts corporativos
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "1rem",         // 'xl' de 1rem de la homepage para sus componentes nativos
                        "2xl": "1.5rem",       // Origen: Homepage
                        "3xl": "2rem",         // Origen: Homepage
                        "design-xl": "3rem",   // Respaldamos el 'xl' original de 3rem de las plantillas por si acaso
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "12px",
                        "md": "24px",
                        "gutter": "24px",
                        "xl": "80px",
                        "container-max": "1280px",
                        "base": "8px",
                        "lg": "48px",
                        "xs": "4px"
                    },
                    "fontFamily": {
                        // Establecemos Comfortaa como la fuente base predeterminada sin perder las clases explícitas
                        "sans": ["Comfortaa", "sans-serif"],
                        "body-md": ["Comfortaa"],
                        "body-lg": ["Comfortaa"],
                        "display-lg": ["Comfortaa"],
                        "label-sm": ["Comfortaa"],
                        "label-md": ["Comfortaa"],
                        "headline-sm": ["Comfortaa"],
                        "body-sm": ["Comfortaa"],
                        "headline-md": ["Comfortaa"]
                    },
                    "fontSize": {
                        "label-md": ["14px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }]
                    }
                }
            }
        }