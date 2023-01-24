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

```javascript
import {InitMicroParsons} from 'micro-parsons';

InitMicroParsons({
	selector: '.test-div-2',
    id: 'micro-parsons-2',
	reuse: false,
	randomize: true,
	parsonsBlocks: ['print(', '"test"', ')'],
	parsonsTooltips: ['print', 'string "test"', ''],
	language: 'sql'
});
```

See ``index.html`` for more examples.

## Testing

Serve a static page to test the component in the given static page(index.html):

```
npx http-server
```
