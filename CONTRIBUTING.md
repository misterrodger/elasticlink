# Contributing to elastiq-ts

Thank you for your interest in contributing to elastiq-ts! We welcome bug reports, feature requests, and pull requests.

## Code of Conduct

Be respectful and constructive. We're building a welcoming community.

## Getting Started

### Prerequisites
- Node.js 16+
- npm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/misterrodger/elastiq-ts.git
cd elastiq-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Development Workflow

1. **Create a branch** for your feature or fix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style below

3. **Test your changes**
   ```bash
   npm test           # Run all tests
   npm test:watch    # Run tests in watch mode
   npm run lint       # Check code style
   npm run type-check # Verify TypeScript types
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new query type"
   git commit -m "fix: resolve type safety issue"
   ```

5. **Push and open a PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- **TypeScript**: Use strict mode, avoid `any` except where unavoidable (with comments)
- **Formatting**: Run `npm run format` to auto-format code
- **Naming**: Use camelCase for variables/functions, PascalCase for types
- **Comments**: Keep code self-documenting; only add comments for non-obvious logic
- **Tests**: Write tests for all new features and bug fixes

### Example Query Implementation

```typescript
// In types.ts
export type QueryBuilder<T> = {
  yourNewQuery: <K extends keyof T>(
    field: K,
    value: any,
    options?: YourOptions
  ) => QueryBuilder<T>;
};

// In query-builder.ts
yourNewQuery: (field, value, options) => {
  if (!options || Object.keys(options).length === 0) {
    return createQueryBuilder<T>({
      ...state,
      query: { your_query: { [field]: value } }
    });
  }
  return createQueryBuilder<T>({
    ...state,
    query: { your_query: { [field]: { query: value, ...options } } }
  });
},

// In query-builder.test.ts
describe('Your Query Type', () => {
  it('should build a simple query', () => {
    const result = query<TestType>()
      .yourNewQuery('field', 'value')
      .build();

    expect(result).toMatchInlineSnapshot(`
      {
        "query": {
          "your_query": {
            "field": "value",
          },
        },
      }
    `);
  });
});
```

## Testing

- Use snapshot testing for Elasticsearch DSL output validation
- Test both with and without optional parameters
- Test integration with bool queries and other query types
- Aim for high coverage (80%+)

```bash
# Run tests with coverage report
npm run test:coverage

# Update snapshots if output is intentionally changed
npm test -- --updateSnapshot
```

## Commit Message Format

Use semantic commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation update
- `test:` - Test addition or update
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `chore:` - Build, dependencies, tooling

Examples:
```
feat: add script query support
fix: handle null values in range queries
docs: update API examples
test: add tests for nested aggregations
```

## Pull Request Process

1. **Update tests** - Add tests for new features
2. **Update docs** - Update README.md if API changes
3. **Update CHANGELOG.md** - Add entry under Unreleased
4. **Pass CI** - All tests, lint, and type checks must pass
5. **Get review** - Wait for at least one approval
6. **Merge** - We'll merge when approved

### PR Title Format

Use the same format as commit messages:
- `feat: add support for X`
- `fix: resolve issue with Y`
- `docs: clarify Z`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Code follows style guide
- [ ] All tests pass
```

## Reporting Issues

### Bug Reports

Please include:
- Version of elastiq-ts you're using
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Code example

### Feature Requests

Please include:
- Use case and motivation
- Proposed API/syntax
- Examples of how it would be used
- Any alternative approaches you've considered

## Documentation

We use:
- **README.md** - Main documentation with examples
- **CHANGELOG.md** - Version history
- **JSDoc comments** - Inline API documentation
- **Snapshots** - Test examples showing expected output

When adding features:
1. Add JSDoc to the function
2. Add example to README.md
3. Add snapshot tests
4. Update CHANGELOG.md

## Release Process

The maintainers handle releases:

1. Update version in package.json
2. Update CHANGELOG.md with release notes
3. Create git commit with release information
4. Create git tag matching version
5. Push to npm (manual or via GitHub Actions)

### Versioning Strategy

elastiq-ts follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (`breaking:`): Breaking API changes
- **MINOR** (`feat:`): New features (backward compatible)
- **PATCH** (`fix:`, `docs:`, `refactor:`): Bug fixes, documentation, refactoring

All commits should follow the conventional commit format:

- `feat: add KNN query support`
- `fix: resolve type inference issue`
- `docs: update README examples`
- `refactor: simplify query builder logic`
- `test: add tests for nested aggregations`

## Questions?

- 📖 Read the [README.md](README.md)
- 🐛 Check [existing issues](https://github.com/misterrodger/elastiq-ts/issues)
- 💬 Start a [discussion](https://github.com/misterrodger/elastiq-ts/discussions)

## Thank You!

Thank you for contributing to elastiq-ts. Your efforts help make this project better for everyone! 🙏
