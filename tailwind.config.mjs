/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
			extend: {
				colors: {
					'redish': '#f04336',
					'blackish' :'#0a303a',
				},
			
			keyframes: {
				wiggle: {
				  '0%, 100%': { transform: 'rotate(-15deg)' },
				  '50%': { transform: 'rotate(15deg)' },
				}
			
			  },

		},
	},
	plugins: [],
}
