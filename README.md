# Regex Helper Component

## Installing dependencies:

```
npm install
```

## Compiling the TypeScript code:

```
npm run build
```

## Using the Component:

After building the code, the element should be in ./packages/test-element/test-element.js.

Include the custom element in a webpage, e.g.:

```html
<div class="test-div"></div>
<script type="module">
import "./packages/test-element/test-element.js";
document.querySelector('.test-div').innerHTML = `<regex-element></regex-element>`;
</script>
```

## Testing

Serve a static page to test the component in the given static page(index.html):

```
npx http-server
```