import { type Config } from 'tailwindcss'

export default {
	content: [
		'./resources/**/*.{js,ts,vue,blade.php}',
	],
	theme: {
		extend: {},
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
} satisfies Config
