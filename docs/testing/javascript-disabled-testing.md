# JavaScript-Disabled Testing Guide

## Why This Matters

Users may block JavaScript, use script-restricted environments, or experience
script failures. Core content and critical workflows should remain available
without JavaScript wherever feasible.

## How To Disable JavaScript

- Firefox: `Settings > Privacy & Security > Permissions > Disable JavaScript`
- Safari: `Develop > Disable JavaScript`
- Chrome/Edge: `Settings > Privacy and security > Site Settings > JavaScript`

## What Should Work Without JS

- Core content reading
- Primary navigation
- Basic form submission (server-side handling)
- Critical user flows (login, checkout, primary tasks)

## What Can Require JS

- Real-time updates
- Enhanced interactions (client-side validation, live search)
- Complex widgets that have accessible fallbacks

## Testing Procedure

1. Disable JavaScript and reload the page.
2. Navigate through critical flows.
3. Submit forms to ensure server-side handling exists.
4. Note features that fail or degrade.
5. Document required JS features and provide alternatives where possible.
