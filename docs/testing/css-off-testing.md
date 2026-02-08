# CSS-Off Content Testing Guide

## Why This Matters

CSS-off testing validates the source order and semantic structure of your
content. Screen readers and other assistive technologies rely on DOM order, so
visual layout should not be required to understand the page.

## How To Disable CSS

- Firefox: `View > Page Style > No Style`
- Safari: `Develop > Disable Styles` (enable the Develop menu first)
- Chrome/Edge: Use the Web Developer Toolbar extension

## What To Look For

- Logical reading order without visual styling
- All content visible (no critical content hidden by CSS)
- Headings still communicate structure
- Lists and tables remain readable in source order

## Common Issues

- Visual-only labels (icons without text alternatives)
- Content that only appears with CSS (pseudo-elements)
- Layout order that differs from DOM order
- Hidden text that is required for meaning

## Quick Checklist

1. Disable CSS and reload the page.
2. Read content top-to-bottom to confirm it is coherent.
3. Verify headings are in the expected order.
4. Confirm lists and tables read correctly.
5. Record any content that disappears or becomes ambiguous.
