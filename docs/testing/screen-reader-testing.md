# Screen Reader Testing Guide

## Screen Readers

- VoiceOver (macOS/iOS): `Cmd + F5` to toggle
- NVDA (Windows): Free download from nvaccess.org
- JAWS (Windows): Commercial, industry standard
- ChromeVox (Chrome): Browser extension
- TalkBack (Android): Built-in
- Orca (Linux): Free, GNOME default

## Core Testing Flows

1. Headings and landmarks navigation
2. Links and buttons announcement
3. Form field labels and errors
4. Dynamic content and live regions
5. Complex widgets (tabs, modals, accordions)
6. Tables and lists
7. Images and text alternatives

## Common Shortcuts (Varies by SR)

- `SR + Arrow keys`: Navigate by element
- `SR + H`: Next heading
- `SR + K`: Next link
- `SR + T`: Next table
- `SR + L`: Next list

## Suggested Scenarios

- Compare `good-semantics.html` vs `bad-semantics.html`
- Compare good/bad form examples
- Verify table headers are announced correctly
- Validate icon-only controls have labels

## What To Record

- Incorrect or missing announcements
- Unexpected focus jumps
- Missing landmark or heading structure
- Forms without labels or errors
- Live regions that fail to announce updates
