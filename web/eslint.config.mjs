import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['scripts/**', 'data/**', 'coverage/**'],
  },
]

export default eslintConfig
