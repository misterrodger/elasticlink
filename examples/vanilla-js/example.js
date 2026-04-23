// @ts-check
const { mappings, text, keyword, float, integer, nested, queryBuilder, inferType } = require('elasticlink');

// 1. Define your schema (same API as TypeScript)
const productSchema = mappings({
  name: text(),
  description: text(),
  price: float(),
  category: keyword(),
  variants: nested({
    sku: keyword(),
    color: keyword(),
    stock: integer()
  })
});

// 2. Get the document type for annotations using inferType()
//    inferType() returns undefined at runtime — it exists only to carry the type.
const _Product = inferType(productSchema);

/** @type {typeof _Product} */
const sampleProduct = {
  name: 'Laptop',
  description: 'A powerful laptop',
  price: 999.99,
  category: 'electronics',
  variants: [
    { sku: 'LAP-001', color: 'silver', stock: 25 }
  ]
};

// Alternative: use the import() JSDoc syntax directly
/** @type {import('elasticlink').Infer<typeof productSchema>} */
const anotherProduct = {
  name: 'Phone',
  description: 'A smartphone',
  price: 699,
  category: 'electronics',
  variants: []
};

// 3. Build type-safe queries — field names are autocompleted and constrained by type
const query = queryBuilder(productSchema)
  .match('name', 'laptop')           // 'name' is a text field — allowed in match()
  .range('price', { gte: 500 })      // 'price' is numeric — allowed in range()
  .term('category', 'electronics')   // 'category' is keyword — allowed in term()
  .build();

console.log(JSON.stringify(query, null, 2));
console.log('Sample product:', sampleProduct);
console.log('Another product:', anotherProduct);
