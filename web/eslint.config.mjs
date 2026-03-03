import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['scripts/**', 'data/**'],
  },
]

export default eslintConfig
