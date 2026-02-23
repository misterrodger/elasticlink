# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone https://github.com/misterrodger/elasticlink.git
cd elasticlink
npm install
npm run build
npm test
```

## Development Workflow

1. Create a branch for your feature or fix
2. Make changes following the code style below
3. Test your changes:

   ```bash
   npm test           # Run all tests
   npm run lint       # Check code style
   npm run type-check # Verify TypeScript types
   ```
4. Commit with clear messages using semantic format

## Code Style

- **TypeScript**: Use strict mode, avoid `any` except where unavoidable (with comments)
- **Formatting**: Run `npm run format` to auto-format code
- **Naming**: Use camelCase for variables/functions, PascalCase for types
- **Comments**: Keep code self-documenting; only add comments for non-obvious logic
- **Tests**: Write tests for all new features and bug fixes

### Example Query Implementation

```typescript
// In types.ts
export type QueryBuilder<M extends Record<string, FieldTypeString>> = {
  yourNewQuery: <K extends string & keyof M>(
    field: K,
    value: unknown,
    options?: YourOptions
  ) => QueryBuilder<M>;
};

// In query-builder.ts
yourNewQuery: (field, value, options) => {
  if (!options || Object.keys(options).length === 0) {
    return createQueryBuilder<M>({
      ...state,
      query: { your_query: { [field]: value } }
    });
  }
  return createQueryBuilder<M>({
    ...state,
    query: { your_query: { [field]: { query: value, ...options } } }
  });
},

// In query-builder.test.ts
describe('Your Query Type', () => {
  it('should build a simple query', () => {
    const result = query(testMappings)
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
npm run test:coverage        # Run tests with coverage report
npm test -- --updateSnapshot # Update snapshots if output is intentionally changed
```

## Integration Tests

Integration tests require a live Elasticsearch 9.x instance:

```bash
docker-compose up -d         # Start ES on localhost:9200
npm run test:integration     # Run integration tests
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

## Documentation

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

1. Update version in package.json
2. Update CHANGELOG.md with release notes
3. Create git commit with release information
4. Create git tag matching version
5. Push to npm (manual or via GitHub Actions)

## Versioning

elasticlink follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes, documentation, refactoring
