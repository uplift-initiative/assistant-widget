import register from 'preact-custom-element';
import { Widget } from './components/Widget';
import { CustomAttributeList } from './types';
import type { CustomAttributes, WidgetConfig } from './types';
import './styles/widget.css';

// Convert HTML attributes to widget config
function attributesToConfig(attributes: CustomAttributes): WidgetConfig {
  return {
    assistantId: attributes['assistant-id'],
    baseUrl: attributes['base-url'],
    participantName: attributes['participant-name'],
    position: attributes['position'] as WidgetConfig['position'],
    theme: attributes['theme'] as WidgetConfig['theme'],
    primaryColor: attributes['primary-color'],
    size: attributes['size'] as WidgetConfig['size'],
    autoConnect: attributes['auto-connect'] === 'true'
  };
}

// Wrapper component to convert attributes
function WidgetWrapper(attributes: CustomAttributes) {
  const config = attributesToConfig(attributes);
  return Widget(config);
}

// Register the custom element
export function registerWidget(tagName = 'upliftai-assistant') {
  if (typeof window !== 'undefined' && !customElements.get(tagName)) {
    register(
      WidgetWrapper,
      tagName,
      [...CustomAttributeList], // Convert readonly array to mutable array
      {
        shadow: true,
        mode: 'open'
      }
    );
  }
}

// Auto-register if script is loaded directly
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => registerWidget());
  } else {
    registerWidget();
  }
}

// Export for programmatic use
export { Widget } from './components/Widget';
export type { WidgetConfig, ConnectionState, SessionResponse } from './types';