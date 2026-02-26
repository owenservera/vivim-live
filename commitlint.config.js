module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enumeration
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style (formatting, semicolons, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD configuration
        'chore',    // Other changes (maintenance)
        'revert',   // Revert a previous commit
        'i18n',     // Internationalization
        'types',    // TypeScript type changes
      ],
    ],
    // Subject lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Header max length
    'header-max-length': [2, 'always', 100],
    // Case checks
    'type-case': [2, 'always', 'lower-case'],
  },
  prompt: {
    messages: {
      type: "Select the type of change that you're committing:",
      scope: 'Denote the SCOPE of this change (optional):',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixesSelect: 'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      generatingByAI: 'Generating your AI generated commit subject...',
      generatedSelectByAI: 'Select suitable subject by AI generated:',
      confirmCommit: 'Are you sure you want to proceed with the commit?',
    },
    types: [
      { value: 'feat', name: 'feat:     A new feature' },
      { value: 'fix', name: 'fix:      A bug fix' },
      { value: 'docs', name: 'docs:     Documentation only changes' },
      { value: 'style', name: 'style:    Changes that do not affect the meaning of the code' },
      { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature' },
      { value: 'perf', name: 'perf:     A code change that improves performance' },
      { value: 'test', name: 'test:     Adding missing tests or correcting existing tests' },
      { value: 'build', name: 'build:    Changes that affect the build system or external dependencies' },
      { value: 'ci', name: 'ci:       Changes to our CI configuration files and scripts' },
      { value: 'chore', name: 'chore:    Other changes that don\'t modify src or test files' },
      { value: 'revert', name: 'revert:   Reverts a previous commit' },
    ],
    useEmoji: false,
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixesAlign: 'top',
    emptyIssuePrefixesAlias: 'skip',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: 100,
    maxSubjectLength: 100,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultSubject: '',
  },
};
