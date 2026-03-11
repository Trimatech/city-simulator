# rblx-ui Packages Reference

> AI assistant reference for the @rbxts-ui monorepo. This is a Roblox TypeScript UI library built with React (@rbxts/react), pnpm workspaces, and Turborepo.

## Architecture

- **Runtime:** Roblox (Luau via roblox-ts compiler)
- **Framework:** React 17 (@rbxts/react)
- **Animations:** @rbxts/ripple (spring-based)
- **State:** Reflex (@rbxts/reflex) for alerts; React hooks elsewhere
- **Package Manager:** pnpm 8.15+
- **Versioning:** Changesets (independent per package)

---

## @rbxts-ui/utils

**Path:** `packages/utils`

Utility functions shared across the library.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `omit(obj, keys)` | Function | Returns a copy of `obj` without the specified `keys` |

---

## @rbxts-ui/theme

**Path:** `packages/theme`

Centralized design tokens: colors, fonts, and animation springs.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `Theme` | Interface | Shape of a theme object |
| `defaultTheme` | `Theme` | Pre-configured default theme |

### Theme Structure

```ts
interface Theme {
  palette: {
    white, offwhite, black, darkgray, crust, overlay0, disabled,
    blue, green, red, yellow, blueishColor, text,
    surface1, lightblue, surface2, macRed, macYellow, macGreen
  }
  fonts: {
    inter: { regular, medium, bold }
    roboto: { light, regular, medium, bold }
  }
  springs: { slow, bubbly, responsive, gentle, world }
}
```

### Key Colors

- **Primary:** blue `(137, 180, 250)`
- **Success:** green `(166, 227, 161)`
- **Warning:** yellow `(249, 226, 175)`
- **Error:** red `(243, 139, 168)`
- **Text:** text `(205, 214, 244)`

---

## @rbxts-ui/rem

**Path:** `packages/rem`

Responsive rem-based scaling system. Converts logical units to screen pixels.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `RemProvider` | Component | Context provider; props: `baseRem?` (default 9), `remOverride?`, `minimumRem?`, `maximumRem?` |
| `useRem()` | Hook | Returns a scaling function `rem(value, mode?)` |
| `RemContext` | Context | Raw React context |
| `DEFAULT_REM` | Constant | `9` |
| `MIN_REM` | Constant | Minimum rem value |

### Usage

```tsx
// Wrap your app
<RemProvider baseRem={9}>
  <App />
</RemProvider>

// In components
const rem = useRem();
<frame Size={rem(new UDim2(0, 100, 0, 50))} />
// rem(10) => 90px at default baseRem
```

The `rem()` function accepts: `number`, `UDim2`, `UDim`, `Vector2`. Mode can be `"pixel"` (raw scaling) or `"unit"` (relative to DEFAULT_REM).

---

## @rbxts-ui/primitives

**Path:** `packages/primitives`

Low-level components that wrap Roblox GuiObject instances with camelCase props.

### Components

#### `<Frame>`
Wraps Roblox `Frame`. Supports `ref` via `forwardRef`.

**Props:** `size`, `position`, `anchorPoint`, `backgroundColor`, `backgroundTransparency`, `clipsDescendants`, `visible`, `zIndex`, `layoutOrder`, `cornerRadius`, `active`, `automaticSize`, `rotation`, event/change handlers.

#### `<Group>`
Transparent Frame (always `backgroundTransparency=1`). Used for logical grouping.

**Props:** Same as Frame except `backgroundColor` / `backgroundTransparency`.

#### `<Text>`
Wraps Roblox `TextLabel`.

**Props:** `text`, `textColor`, `textSize`, `textScaled`, `textWrapped`, `textXAlignment`, `textYAlignment`, `textTruncate`, `font`, `padding`, `rem`, `rotation`, `cornerRadius`, `lineHeight`, `maxVisibleGraphemes`, `automaticSize`, `richText`, plus Frame props.

#### `<Image>`
Wraps Roblox `ImageLabel`.

**Props:** `imageData`, `cornerRadius`, plus Frame props. Default `backgroundTransparency=1`.

#### `<CanvasGroup>`
Wraps Roblox `CanvasGroup`.

**Props:** `groupColor`, `groupTransparency`, `cornerRadius`, plus Frame props.

### Utilities

| Export | Description |
|--------|-------------|
| `fonts` | Font definitions (from `constants/fonts`) |
| `mapPropsToPascalCase()` | Converts camelCase React props to PascalCase Roblox properties |
| `CamelCase<S>` | Type utility |
| `CamelCaseKeys<T>` | Type utility |
| `InstancePropsCamelCase<T>` | Type utility |

---

## @rbxts-ui/layout

**Path:** `packages/layout`

Layout containers and structural components.

### Stack Components

#### `<HStack>`
Horizontal stack using `UIListLayout`.

**Props:** `spacing`, `padding`, `horizontalAlignment`, `verticalAlignment`, `name`, plus Frame props.

#### `<VStack>`
Vertical stack using `UIListLayout`.

**Props:** Same as HStack + `sortOrder`.

#### `<HStackScrolling>`
Horizontal scrolling stack. Extends `ScrollingFrameProps`. Auto canvas size on X axis.

#### `<VStackScrolling>`
Vertical scrolling stack. Additional props: `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`. Auto canvas size on Y axis.

### Container Components

#### `<ScreenGui>`
**Props:** `displayOrder`, `name`, `children`. Pre-configured: `ResetOnSpawn=false`, `IgnoreGuiInset=true`, `ZIndexBehavior="Sibling"`.

#### `<Layer>`
**Props:** `displayOrder`, `name`, `children`, `isEdit`. Renders as `ScreenGui` normally, `Group` in edit mode.

#### `<Filler>`
Flexible fill element using `UIFlexItem`. **Props:** `size?` (default fills height).

#### `<ScrollingFrame>`
**Props:** Extends `InstanceProps<ScrollingFrame>`, `children`. Pre-configured: `BorderSizePixel=0`, `ScrollBarThickness=rem(0.5)`.

#### `<Portal>`
**Props:** `children`, `containerId`, `onContainerNotFound`, `onContainerFound`. Creates a React portal to a named container instance.

#### `<Transition>`
Advanced component managing CanvasGroup/Frame layering for smooth transparency transitions.

**Props:** `groupColor`, `groupTransparency`, `position`, `size`, `rotation`, `anchorPoint`, `zIndex`, `clipsDescendants`, `layoutOrder`, `event`, `change`, `children`, `directChildren`, `defaultColor`, `epsilon`.

---

## @rbxts-ui/components

**Path:** `packages/components`

High-level reusable UI components.

### Buttons

#### `<Button>`
Base button wrapping `TextButton`.

**Props:** `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseClick`, `automaticSize`, `active`, `selectable`, `cornerRadius`, plus Frame props.

#### `<ReactiveButton>`
Animated button with spring-based hover/press effects.

**Props:** Extends Button + `animatePosition`, `animatePositionStrength`, `animatePositionDirection`, `animateSize`, `animateSizeStrength`, `enabled`, `onHover`, `onPress`, `fill`.

#### `<PrimaryButton>`
Styled button with gradient overlay, outline, shadow, and glow options.

**Props:** `onClick`, `onHover`, `size`, `position`, `backgroundColor`, `backgroundTransparency`, `overlayGradient`, `overlayTransparency`, `hasBackground`, `hasShadow`, `hasOutline`, `hasGlow`, `automaticSize`, `children`.

#### `<TextButton>`
Color-variant text button.

**Props:** `text`, `onClick`, `variant` (`"Green"` | `"Red"` | `"Blue"` | `"Black"` | `"DarkGray"`), `isDisabled`, `padding`, `textSize`, `textScaled`, `fill`, `hasOutline`, `size`, `position`.

#### `<IconRoundButton>`
Round button with emoji or label, optional tooltip.

**Props:** `onClick`, `emoji`, `label`, `primaryColor`, `enabled`, `order`, `circleSize`, `width`, `emojiSize`, `addShadow`, `tooltipText`, `tooltipComponent`, `position`.

#### `<DropdownButton>`
Like TextButton but with a dropdown arrow indicator.

### Form Components

#### `<Checkbox>`
**Props:** `checked`, `onChecked`, `text`, `variant` (`"default"` | `"large"` | `"small"`), `position`, `disabled`.

#### `<Radio>`
**Props:** Same as Checkbox. Circular selection indicator.

#### `<TextBox>`
Wraps Roblox `TextBox` with rem scaling.

**Props:** Extends TextProps + `font`, `text`, `textColor`, `textSize`, `textWrapped`, `textEditable`, `lineHeight`, `clearTextOnFocus`, `placeholderText`, `maxVisibleGraphemes`, `richText`.

#### `<TextField>`
Enhanced TextBox with placeholder and multiline.

**Props:** Extends TextProps + `placeholderText`, `placeholderColor`, `multiLine`, `textEditable`, `clearTextOnFocus`.

#### `<Dropdown>`
**Props:** `options` (`{label, value}[]`), `value`, `onChange`, `size`, `renderOption`, `portalRef`. Portal-based overlay with click-outside detection.

#### `<SegmentedToggle>`
**Props:** `options` (`{id, label, disabled}[]`), `value`, `onChange`, `disabled`, `size` (`"default"` | `"small"`), `label`, `children`.

#### `<FormRow>`
**Props:** `label`, `children`, `disabled`, `name`. Layout: label 30%, content 70%.

### Display Components

#### `<Accordion>`
**Props:** `title`, `children`, `isExpanded`, `onExpandedChange`, `backgroundColor`, `backgroundTransparency`, `cornerRadius`, `sortOrder`. Animated expand/collapse.

#### `<Section>`
**Props:** `title`, `children`, `cornerRadius`, `sortOrder`. Simple section with title header.

#### `<AlertBox>`
**Props:** `variant` (`"warning"` | `"info"`), `text`, `tooltipText`, `name`. Color-coded alert box.

#### `<Divider>`
**Props:** `color`, `thickness`, `orientation`, `zIndex`, `position`, `size`.

#### `<Padding>`
**Props:** `paddingX`, `paddingY` (or individual padding values). Creates `UIPadding`.

#### `<Checkmark>`, `<Legend>`, `<PillText>`, `<TimeAgo>`, `<InfoIcon>`, `<WarningIcon>`

### Table Components

`<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>`, `<TableFooter>`, `<ExampleTable>`

Table is a VStack wrapper. Use TableHeader/TableRow/TableCell for structured data.

### Tooltip

#### `<Tooltip>`
**Props:** `text`, `visible`, `position`, `backgroundColor`, `textColor`, `maxWidth`, `offsetX`, `offsetY`, `anchorPoint`.

#### `useTooltip()` hook

### DynamicWindow

#### `<DynamicWindow>`
Draggable, resizable window with traffic-light controls.

**Props:** `size`, `position`, `backgroundColor`, `backgroundTransparency`, `title`, `onClose`, `onPositionChange`, `onSizeChange`, `resizeEnabled`, `active`, `zIndex`, `initialSize`, `initialPosition`, `children`.

### Utility Components

#### `<ErrorBoundary>`
**Props:** `fallback` (component), `onError` (callback), `children`.

#### `<DelayRender>`
**Props:** `delay`, `fallback`, `children`. Delays rendering with optional fallback.

#### `<ClickOutsideOverlay>` / `<ClickOutsideLayer>`
**Props:** `onClickOutside`. Detects clicks outside a region.

#### `<InputCapture>`
**Props:** `onInput`. Captures user input events.

#### `<Outline>`
**Props:** `innerColor`, `innerTransparency`, `innerThickness`, `outerColor`, `outerTransparency`, `outerThickness`, `cornerRadius`, `children`.

### Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useButtonState()` | `[press, hover, events]` | Tracks mouse/touch press and hover state |
| `useButtonAnimation(press, hover)` | `ButtonAnimation` | Spring animations for press/hover/position |
| `useInputDevice()` | `"mouse"` \| `"touch"` | Detects current input device |

### Validation Functions

| Function | Description |
|----------|-------------|
| `validateNumber(value)` | Validates value is a number |
| `validateNumberBounds(value, min, max)` | Validates number within range |
| `validatePosNumber(value)` | Validates positive number |
| `validateAngle(value)` | Validates angle value |

---

## @rbxts-ui/alerts

**Path:** `packages/alerts`

Notification/alert system with Reflex state management.

### Components

#### `<Alerts>`
Container that renders all active alerts. **Props:** `onDismiss`, `menuOffset`.

#### `<Alert>`
Individual alert. **Props:** `alert` (AlertI), `index`, `onDismiss`, `menuOffset`. Positioned bottom-right with stacking.

#### `<AlertTimer>`
Progress bar showing auto-dismiss countdown.

### Alert Interface

```ts
interface AlertI {
  id: number;
  scope?: "ranking" | "money";
  emoji: string;
  message: string;
  color: Color3;
  colorSecondary?: Color3;
  colorMessage?: Color3;
  duration: number;
  visible: boolean;
  sound?: string;
}
```

### Factory Functions

| Function | Description |
|----------|-------------|
| `sendAlert(store, patch)` | Creates and shows an alert. Auto-dismisses after `duration`. Scope-based dedup. Returns alert ID. |
| `dismissAlert(store, id)` | Dismisses with 0.25s fade-out. Returns promise. |

### State (Reflex Slice)

| Export | Description |
|--------|-------------|
| `alertSlice` | Reflex slice with alert actions |
| `selectAlerts` | Selector: all alerts |
| `selectAlertsVisible` | Selector: visible alerts only |
| `selectAlertIndex` | Selector: alert by index |

### Color Utilities

`brighten(color, amount)`, `brightenIfDark(color)`, `darken(color, amount)`, `brightness(color)`, `mapStrict(value, inMin, inMax, outMin, outMax)`.

---

## Package Dependency Graph

```
@rbxts-ui/utils          (standalone)
@rbxts-ui/theme          (standalone)
@rbxts-ui/rem            (standalone)
@rbxts-ui/primitives     (standalone)
@rbxts-ui/layout         -> primitives, rem, utils
@rbxts-ui/components     -> primitives, rem, utils, theme, layout
@rbxts-ui/alerts         -> primitives, rem, layout, theme, components
```

---

## Installation

### File Protocol (monorepo sibling)

```json
{
  "@rbxts-ui/components": "file:../../rblx-ui/packages/components",
  "@rbxts-ui/layout": "file:../../rblx-ui/packages/layout",
  "@rbxts-ui/primitives": "file:../../rblx-ui/packages/primitives",
  "@rbxts-ui/rem": "file:../../rblx-ui/packages/rem",
  "@rbxts-ui/theme": "file:../../rblx-ui/packages/theme",
  "@rbxts-ui/utils": "file:../../rblx-ui/packages/utils",
  "@rbxts-ui/alerts": "file:../../rblx-ui/packages/alerts"
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "typeRoots": ["node_modules/@rbxts", "node_modules/@rbxts-ui", "@types"]
  }
}
```

### Rojo project.json

```json
{
  "@rbxts-ui": {
    "$path": "node_modules/@rbxts-ui"
  }
}
```
