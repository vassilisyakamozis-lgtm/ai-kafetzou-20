import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Mystical AI Kafetzou Colors
				'mystical-purple': {
					DEFAULT: 'hsl(var(--mystical-purple))',
					light: 'hsl(var(--mystical-purple-light))',
					dark: 'hsl(var(--mystical-purple-dark))'
				},
				'rose-gold': {
					DEFAULT: 'hsl(var(--rose-gold))',
					light: 'hsl(var(--rose-gold-light))'
				},
				'golden': {
					DEFAULT: 'hsl(var(--golden))',
					light: 'hsl(var(--golden-light))'
				},
				'lavender': 'hsl(var(--lavender))',
				'soft-pink': 'hsl(var(--soft-pink))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-mystical': 'var(--gradient-mystical)',
				'gradient-golden': 'var(--gradient-golden)',
				'gradient-soft': 'var(--gradient-soft)'
			},
			boxShadow: {
				'mystical': 'var(--shadow-mystical)',
				'golden': 'var(--shadow-golden)',
				'soft': 'var(--shadow-soft)'
			},
			fontFamily: {
				'mystical': ['Playfair Display', 'serif'],
				'elegant': ['Inter', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'mystical-glow': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'25%': {
						transform: 'translateY(-15px) rotate(5deg)'
					},
					'50%': {
						transform: 'translateY(-10px) rotate(-5deg)'
					},
					'75%': {
						transform: 'translateY(-15px) rotate(3deg)'
					}
				},
				'float-intense': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg) scale(1)'
					},
					'25%': {
						transform: 'translateY(-20px) translateX(-5px) rotate(10deg) scale(1.1)'
					},
					'50%': {
						transform: 'translateY(-15px) translateX(5px) rotate(-10deg) scale(0.9)'
					},
					'75%': {
						transform: 'translateY(-25px) translateX(-3px) rotate(15deg) scale(1.05)'
					}
				},
				'drift': {
					'0%, 100%': {
						transform: 'translate(0px, 0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translate(10px, -10px) rotate(120deg)'
					},
					'66%': {
						transform: 'translate(-10px, 5px) rotate(240deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'mystical-glow': 'mystical-glow 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'float-intense': 'float-intense 4s ease-in-out infinite',
				'drift': 'drift 8s ease-in-out infinite',
				'spin-slow': 'spin 3s linear infinite',
				'spin-reverse': 'spin 2s linear infinite reverse'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
