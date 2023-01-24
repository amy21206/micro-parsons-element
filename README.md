# Micro Parsons Component

## Installing dependencies:

```
npm install
```

## Compiling the TypeScript code:

```
npm run build
```

## Using the Component:

Include the custom element in a webpage with the helper function:

```html
<div class='test-div-2'></div>
```

```javascript
import {InitMicroParsons} from 'micro-parsons';

InitMicroParsons({
	selector: '.test-div-2', // selector for the container (div)
    id: 'micro-parsons-2', // id of the micro parsons element
	reuse: false,	// if the blocks are reusable. default to false.
	randomize: true,	// if the blocks are randomized. default to true.
	parsonsBlocks: ['print(', '"test"', ')'], // parsons blocks.
	parsonsTooltips: ['print', 'string "test"', ''], // tooltips. if not specified or is empty string, there will be no tooltips on the block.
	language: 'sql' // language highlight (sql, html, python, javascrpit, java, text). default to text (no highlight).
});
```

See ``index.html`` for more examples.

## Testing

Serve a static page to test the component in the given static page(index.html):

```
npx http-server
```
