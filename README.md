# Uplift AI Assistant Widget

A customizable widget for integrating Uplift AI assistants into any website. Built with Preact and LiveKit for real-time voice conversations.


## Quick Start

### Create assistant

Sign up at [Uplift AI](https://upliftai.org) and create your first assistant to get an `assistant-id`.

### CDN Installation (Easiest)

Add this script tag to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@upliftai/assistant-widget@0.0.1"></script>
```

Then add the widget element:

```html
<upliftai-assistant 
  assistant-id="YOUR_ASSISTANT_ID">
</upliftai-assistant>
```

### NPM Installation

```bash
npm install @upliftai/assistant-widget
```

```javascript
import '@upliftai/assistant-widget';
```

```html
<upliftai-assistant assistant-id="YOUR_ASSISTANT_ID"></upliftai-assistant>
```

## Configuration

### Widget Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `assistant-id` | string | required | Your Uplift AI assistant ID |
| `base-url` | string | `https://api.upliftai.org` | API endpoint URL |
| `participant-name` | string | `Anonymous` | Name of the participant |
| `position` | string | `bottom-right` | Widget position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `theme` | string | `light` | Color theme: `light` or `dark` |
| `primary-color` | string | `#3B82F6` | Primary color for the call button |
| `size` | string | `medium` | Widget size: `small`, `medium`, `large` |
| `auto-connect` | boolean | `false` | Auto-connect on page load |

### Example with All Options

```html
<upliftai-assistant 
  assistant-id="asst_abc123"
  base-url="https://api.upliftai.org"
  participant-name="John Doe"
  position="bottom-right"
  theme="light"
  primary-color="#10B981"
  size="medium"
  auto-connect="false">
</upliftai-assistant>
```

## Styling Customization

The widget uses CSS custom properties that can be overridden:

```css
upliftai-assistant {
  --upliftai-primary: #3B82F6;
  --upliftai-secondary: #6B7280;
  --upliftai-bg: #FFFFFF;
  --upliftai-text: #1F2937;
  --upliftai-accent: #10B981;
}
```

### CSS Classes

All widget classes are prefixed with `upliftai-` to avoid conflicts. You can override any of these classes for advanced customization:

- `.upliftai-widget-container` - Main container
- `.upliftai-trigger` - Call button
- `.upliftai-visualizer` - Audio visualization container
- `.upliftai-bar` - Individual audio bars
- `.upliftai-error` - Error message display

## Framework Integration

### React

```jsx
import { useEffect } from 'react';
import '@upliftai/assistant-widget';

function App() {
  return (
    <upliftai-assistant 
      assistant-id="YOUR_ASSISTANT_ID"
      theme="dark"
      size="large"
    />
  );
}
```

### Vue

```vue
<template>
  <upliftai-assistant 
    :assistant-id="assistantId"
    theme="light"
    position="bottom-left"
  />
</template>

<script>
import '@upliftai/assistant-widget';

export default {
  data() {
    return {
      assistantId: 'YOUR_ASSISTANT_ID'
    };
  }
};
</script>
```

### Angular

```typescript
import '@upliftai/assistant-widget';

@Component({
  template: `
    <upliftai-assistant 
      assistant-id="YOUR_ASSISTANT_ID"
      theme="dark">
    </upliftai-assistant>
  `
})
export class AppComponent {}
```

## CDN Usage

The widget is automatically available on multiple CDNs after npm publication:

### unpkg
```html
<script src="https://unpkg.com/@upliftai/assistant-widget@0.0.1"></script>
```

### jsDelivr (Recommended)
```html
<!-- Latest 0.x version -->
<script src="https://cdn.jsdelivr.net/npm/@upliftai/assistant-widget@0"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@upliftai/assistant-widget@0.0.1"></script>
```

## License

MIT License

## Support

- [GitHub Issues](https://github.com/uplift-initiative/assistant-widget/issues)
- [Documentation](https://docs.upliftai.org)
- Email: founders@upliftai.org