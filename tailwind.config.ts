import { type Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./resources/**/*.{js,ts,vue,blade.php}'],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  theme: {
    extend: {
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
      colors: {
        brand: colors.emerald,
      },
      fontFamily: {
        orbitron: ['Orbitron', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxs: ['0.625rem', '0.875rem'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-7%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
} satisfies Config
