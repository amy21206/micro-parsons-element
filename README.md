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

After building the code, the element should be in ./packages/micro-parsons/micro-parsons.js.

Include the custom element in a webpage, e.g.:

```html
<div class="test-div"></div>
<script type="module">
import "./packages/micro-parsons/micro-parsons.js";
document.querySelector('.test-div').innerHTML = `<micro-parsons input-type='parsons' language='sql' id="abcd"></micro-parsons>`;
</script>
```

## Testing

Serve a static page to test the component in the given static page(index.html):

```
npx http-server
```
