/**
 * @ummat/brand — ESLint rule: no-brand-light-on-light
 *
 * Vendored from ummat/apps/brand/src/eslint-rule-no-brand-light-on-light.js
 * so that islamwiki CI can run ESLint without checking out the sibling ummat repo.
 *
 * Flags usage of `text-brand-light`, `text-brand-mid`, `text-ummat-light`, `text-ummat-mid`
 * Tailwind utility classes in JSX/TSX. These colors fail WCAG 2.2 AA on white/light surfaces:
 *   - #C9F27A (brand-light) on white = 1.28:1 (minimum required: 4.5:1)
 *   - #79C24C (brand-mid)   on white = 2.18:1 (minimum required: 4.5:1)
 *
 * Ref: C-09a-FIX-01
 */

'use strict'

const FORBIDDEN_PATTERN =
  /\btext-(brand|ummat)-(light|mid)\b/

const SUGGESTIONS = {
  'text-brand-light':  'text-brand-on-dark (on dark bg) or text-brand-on-light / text-brand-600 (on light bg)',
  'text-brand-mid':    'text-brand-on-light (7.38:1) or text-brand-600 (4.5:1, D-P3-15)',
  'text-ummat-light':  'text-ummat-on-dark (on dark bg) or text-ummat-on-light / text-ummat-600 (on light bg)',
  'text-ummat-mid':    'text-ummat-on-light (7.38:1) or text-ummat-600 (4.5:1, D-P3-15)',
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow text-brand-light and text-brand-mid Tailwind classes — they fail WCAG 2.2 AA on white/light backgrounds. Use semantic on-dark/on-light tokens instead.',
      url: 'https://github.com/ummeco/ummat/blob/main/.github/docs/brand/contrast-guide.md',
    },
    schema: [],
    messages: {
      forbidden:
        "'{{cls}}' fails WCAG 2.2 AA contrast on white/light backgrounds " +
        '({{ratio}}:1, minimum 4.5:1). ' +
        'Use {{suggestion}} instead. ' +
        'See .github/docs/brand/contrast-guide.md',
    },
  },

  create(context) {
    function checkStringForViolations(node, str) {
      let match
      const re = /\b(text-(brand|ummat)-(light|mid))\b/g
      while ((match = re.exec(str)) !== null) {
        const cls = match[1]
        const ratio = cls.includes('light') ? '1.28' : '2.18'
        context.report({
          node,
          messageId: 'forbidden',
          data: {
            cls,
            ratio,
            suggestion: SUGGESTIONS[cls] ?? 'text-brand-on-light or text-brand-600',
          },
        })
      }
    }

    return {
      JSXAttribute(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          (node.name.name !== 'className' && node.name.name !== 'class')
        ) {
          return
        }
        if (!node.value) return

        if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
          checkStringForViolations(node.value, node.value.value)
        } else if (
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'Literal' &&
          typeof node.value.expression.value === 'string'
        ) {
          checkStringForViolations(node.value.expression, node.value.expression.value)
        }
      },

      CallExpression(node) {
        const callee = node.callee
        const isClassHelper =
          (callee.type === 'Identifier' &&
            /^(cn|clsx|cva|twMerge|classNames|classnames)$/.test(callee.name)) ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'cn')

        if (!isClassHelper) return

        for (const arg of node.arguments) {
          if (arg.type === 'Literal' && typeof arg.value === 'string') {
            checkStringForViolations(arg, arg.value)
          }
        }
      },

      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (FORBIDDEN_PATTERN.test(quasi.value.raw)) {
            checkStringForViolations(quasi, quasi.value.raw)
          }
        }
      },
    }
  },
}

module.exports = rule
